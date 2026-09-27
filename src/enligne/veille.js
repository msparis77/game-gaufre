// Veille des commandes en ligne : tourne en arrière-plan dès que la caisse est
// connectée à Firebase, même si l'écran est verrouillé ou sur un autre onglet.
// - écoute les commandes en temps réel
// - sonne à chaque nouvelle commande (et toutes les 30 s tant qu'il en reste en « reçue »)
// - imprime automatiquement le ticket cuisine via le print bridge (port 3001)
import { collection, query, where, orderBy, onSnapshot, doc, runTransaction, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, surConnexion, firebaseConfigure } from "./firebaseCaisse.js";
import { hhmm } from "../../arena-commande/src/shared/creneaux.js";

export const PRINT_BRIDGE_URL = (import.meta.env.VITE_PRINT_BRIDGE_URL || "http://localhost:3001").replace(/\/+$/, "");
const CLE_AUTO = "gg3-web-autoprint";
const CLE_SON = "gg3-web-son";
const lireBool = (k, def) => { try { const v = localStorage.getItem(k); return v == null ? def : v === "1"; } catch (e) { return def; } };
const ecrireBool = (k, v) => { try { localStorage.setItem(k, v ? "1" : "0"); } catch (e) {} };
const posteId = (() => { try { let p = localStorage.getItem("gg3-poste-id"); if (!p) { p = Math.random().toString(36).slice(2, 8); localStorage.setItem("gg3-poste-id", p); } return p; } catch (e) { return "poste"; } })();

const etat = {
  pret: false,           // l'état de connexion Firebase est connu
  connecte: null,        // utilisateur caisse ou null
  commandes: [],
  erreur: "",
  impressionAuto: lireBool(CLE_AUTO, true),
  son: lireBool(CLE_SON, true),
  sonBloque: false,      // le navigateur attend un clic avant de jouer du son
  derniereImpression: "", // message de la dernière impression (ok ou erreur)
};
const abonnes = new Set();
const prevenir = () => abonnes.forEach((f) => f({ ...etat }));
export const abonner = (f) => { abonnes.add(f); f({ ...etat }); return () => abonnes.delete(f); };

// ── Son ──
let audio = null;
function contexteAudio() {
  if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  return audio;
}
export function debloquerSon() {
  const a = contexteAudio();
  if (a && a.state === "suspended") a.resume().then(() => { etat.sonBloque = false; prevenir(); }).catch(() => {});
}
if (typeof document !== "undefined") document.addEventListener("pointerdown", debloquerSon, { passive: true });
export function sonner() {
  if (!etat.son) return;
  const a = contexteAudio();
  if (!a) return;
  if (a.state === "suspended") { etat.sonBloque = true; prevenir(); return; }
  // Trois bips montants, bien audibles dans une boutique bruyante
  [0, 0.25, 0.5].forEach((t, i) => {
    const o = a.createOscillator(), g = a.createGain();
    o.type = "square"; o.frequency.value = 880 + i * 220;
    g.gain.setValueAtTime(0.0001, a.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.35, a.currentTime + t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t + 0.2);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.22);
  });
}
export function reglerSon(v) { etat.son = v; ecrireBool(CLE_SON, v); prevenir(); if (v) { debloquerSon(); sonner(); } }
export function reglerImpressionAuto(v) { etat.impressionAuto = v; ecrireBool(CLE_AUTO, v); prevenir(); }

// ── Impression du ticket cuisine ──
export const heureRetrait = (c) => { const d = c.retraitAt.toDate(); return hhmm(d.getUTCHours() * 60 + d.getUTCMinutes()); };

function donneesTicket(c) {
  const secret = c.codeRetrait ? ` · CODE ${c.codeRetrait}` : "";
  // Même format que les tickets de caisse envoyés au print bridge
  // (items / total / storeName / cashier / date / ticketNo).
  return {
    type: "cuisine",
    storeName: "COMMANDE EN LIGNE " + c.code + secret,
    ticketNo: c.code,
    cashier: `${c.prenom}${secret} · ${c.livraison ? "LIVRAISON " + c.livraison.nom : "retrait"} ${heureRetrait(c)}`,
    employeeName: `${c.prenom}${secret} · ${c.livraison ? "LIVRAISON " + c.livraison.nom : "retrait"} ${heureRetrait(c)}`,
    codeRetrait: c.codeRetrait || "",
    date: new Date().toLocaleString("fr-FR"),
    client: c.prenom,
    telephone: c.telephone,
    retrait: heureRetrait(c),
    paiement: c.livraison ? "À PAYER AU LIVREUR" : "À PAYER AU RETRAIT",
    livraison: c.livraison ? `${c.livraison.nom} · ${c.livraison.adresse}` : "",
    items: [...c.lignes.map((l) => ({ name: l.nom, qty: l.qte, price: l.prixUnitaire })),
      ...(c.livraison ? [{ name: "LIVRAISON " + c.livraison.nom, qty: 1, price: c.livraison.frais }] : [])],
    total: c.total + (c.livraison ? c.livraison.frais : 0),
  };
}

async function envoyerAuBridge(c) {
  const r = await fetch(PRINT_BRIDGE_URL + "/print", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donneesTicket(c)),
  });
  if (!r.ok) throw new Error("print bridge : erreur " + r.status);
}

// Réserve la commande pour ce poste avant d'imprimer : si deux caisses sont
// ouvertes, une seule imprime.
async function reserver(c) {
  return runTransaction(db, async (tx) => {
    const ref = doc(db, "commandes_en_ligne", c.id);
    const s = await tx.get(ref);
    if (!s.exists() || s.data().imprimeAt) return false;
    tx.update(ref, { imprimeAt: serverTimestamp(), imprimePar: posteId });
    return true;
  });
}

const enCours = new Set();
const echecs = new Map(); // id -> heure du dernier échec (on réessaie après 1 min)
export async function imprimer(c, { force = false } = {}) {
  if (enCours.has(c.id)) return;
  enCours.add(c.id);
  try {
    if (!force && !(await reserver(c))) return;
    if (force) await updateDoc(doc(db, "commandes_en_ligne", c.id), { imprimeAt: serverTimestamp(), imprimePar: posteId });
    await envoyerAuBridge(c);
    echecs.delete(c.id);
    etat.derniereImpression = `✓ Ticket ${c.code} imprimé`;
  } catch (e) {
    echecs.set(c.id, Date.now());
    etat.derniereImpression = `❌ Ticket ${c.code} non imprimé (print bridge injoignable ?)`;
    // On libère la commande pour pouvoir réessayer
    updateDoc(doc(db, "commandes_en_ligne", c.id), { imprimeAt: null, imprimePar: "" }).catch(() => {});
  } finally {
    enCours.delete(c.id);
    prevenir();
  }
}

// Solution de secours : fenêtre d'impression du navigateur
export function imprimerNavigateur(c) {
  const t = donneesTicket(c);
  const w = window.open("", "_blank", "width=300,height=600");
  if (!w) return;
  const esc = (s) => String(s).replace(/[&<>]/g, (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[x]));
  w.document.write(`<html><head><title>${esc(t.ticketNo)}</title><style>body{font-family:monospace;font-size:13px;width:260px;margin:0;padding:8px}h1{text-align:center;font-size:40px;margin:4px 0}hr{border-top:1px dashed #000}td{padding:2px 0}.r{text-align:right}</style></head><body>
<p style="text-align:center;margin:0">ARENA CAFÉ · COMMANDE EN LIGNE</p><h1>${esc(t.ticketNo)}</h1>${t.codeRetrait ? `<p style="text-align:center;margin:0;font-size:22px"><b>CODE ${esc(t.codeRetrait)}</b></p>` : ""}
<p style="text-align:center;margin:0"><b>${esc(t.client)}</b> · ${esc(t.telephone)}<br/>${t.livraison ? "🛵 LIVRAISON" : "Retrait"} <b>${esc(t.retrait)}</b>${t.livraison ? `<br/><b>${esc(t.livraison)}</b>` : ""}</p><hr/>
<table width="100%">${t.items.map((i) => `<tr><td>${i.qty} × ${esc(i.name)}</td><td class="r">${(i.qty * i.price).toLocaleString("fr-FR")} F</td></tr>`).join("")}</table><hr/>
<p><b>TOTAL ${t.total.toLocaleString("fr-FR")} F</b><br/>${t.paiement}</p></body></html>`);
  w.document.close(); w.focus(); w.print(); w.close();
}

// ── Écoute des commandes ──
// Imprime les commandes du jour pas encore imprimées. Les commandes passées la
// veille au soir pour le lendemain s'impriment le matin même.
const aujourdhui = () => new Date().toISOString().slice(0, 10);
function impressionAuto() {
  if (!etat.impressionAuto) return;
  etat.commandes
    .filter((c) => c.statut === "recue" && !c.imprimeAt
      && c.retraitAt.toDate().toISOString().slice(0, 10) === aujourdhui()
      && Date.now() - (echecs.get(c.id) || 0) >= 60000)
    .forEach((c) => imprimer(c));
}

let stopCommandes = null;
let premier = true;
let repetition = null;

function ecouter() {
  const debutJour = new Date(); debutJour.setUTCHours(0, 0, 0, 0);
  const q = query(collection(db, "commandes_en_ligne"), where("retraitAt", ">=", Timestamp.fromDate(debutJour)), orderBy("retraitAt"));
  premier = true;
  stopCommandes = onSnapshot(q, (snap) => {
    etat.commandes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    etat.erreur = "";
    const nouvelles = premier ? [] : snap.docChanges().filter((ch) => ch.type === "added").map((ch) => ch.doc.id);
    premier = false;
    if (nouvelles.length) sonner();
    impressionAuto();
    prevenir();
  }, (e) => { etat.erreur = "Connexion aux commandes perdue : " + (e.code || e.message); prevenir(); });
  repetition = setInterval(() => {
    // Rappel sonore tant qu'une commande à retirer dans l'heure n'est pas lancée
    const dansUneHeure = Date.now() + 3600000;
    if (etat.commandes.some((c) => c.statut === "recue" && c.retraitAt.toMillis() <= dansUneHeure)) sonner();
    impressionAuto();
  }, 30000);
}
function arreter() {
  if (stopCommandes) stopCommandes();
  if (repetition) clearInterval(repetition);
  stopCommandes = null; repetition = null; etat.commandes = [];
}

let demarre = false;
export function demarrerVeille() {
  if (demarre || !firebaseConfigure) return;
  demarre = true;
  surConnexion((u) => {
    etat.connecte = u;
    etat.pret = true;
    arreter();
    if (u) ecouter();
    prevenir();
  });
}
