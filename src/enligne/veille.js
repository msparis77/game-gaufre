// Veille des commandes en ligne : tourne en arrière-plan dès que la caisse est
// connectée à Firebase, même si l'écran est verrouillé ou sur un autre onglet.
// - écoute les commandes en temps réel
// - sonne à chaque nouvelle commande (et toutes les 30 s tant qu'il en reste en « reçue »)
// - imprime automatiquement le ticket cuisine via le print bridge (port 3001)
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, runTransaction, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, surConnexion, firebaseConfigure } from "./firebaseCaisse.js";
import { hhmm } from "../../arena-commande/src/shared/creneaux.js";
import { CARTE_BOISSONS, CATEGORIES_CREPES, CARTE_CREPES } from "../../arena-commande/src/shared/menuDepart.js";

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

// ── Bon de livraison (pour le livreur) ──
// Toutes les infos du client : prénom, téléphone, adresse, articles, montant à
// encaisser, et le code secret que le client doit lui donner.
export function texteBonLivreur(c) {
  const l = c.livraison || {};
  const total = c.total + (l.frais || 0);
  return [
    `🛵 BON DE LIVRAISON ${c.code}${c.livreur ? " · " + c.livreur : ""}`,
    `Client : ${c.prenom}`,
    `Téléphone : +221 ${c.telephone}`,
    `Adresse : ${l.nom || ""} · ${l.adresse || ""}`,
    `Heure : ${heureRetrait(c)}`,
    "",
    ...c.lignes.map((x) => `${x.qte} × ${x.nom}`),
    `Livraison : ${(l.frais || 0).toLocaleString("fr-FR")} F`,
    "",
    `À ENCAISSER : ${total.toLocaleString("fr-FR")} F`,
    c.codeRetrait ? `Code secret à demander au client : ${c.codeRetrait}` : "",
  ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
}
function donneesBonLivraison(c) {
  const l = c.livraison || {};
  const secret = c.codeRetrait ? ` · CODE ${c.codeRetrait}` : "";
  return {
    type: "livraison",
    storeName: `BON LIVRAISON ${c.code}${secret}`,
    ticketNo: c.code,
    cashier: `${c.prenom} +221 ${c.telephone} · ${l.nom} : ${l.adresse}`,
    employeeName: `${c.prenom} +221 ${c.telephone} · ${l.nom} : ${l.adresse}`,
    codeRetrait: c.codeRetrait || "",
    date: new Date().toLocaleString("fr-FR"),
    client: c.prenom,
    telephone: c.telephone,
    adresse: `${l.nom} · ${l.adresse}`,
    livreur: c.livreur || "",
    paiement: "À ENCAISSER PAR LE LIVREUR",
    items: [...c.lignes.map((x) => ({ name: x.nom, qty: x.qte, price: x.prixUnitaire })), { name: "LIVRAISON " + l.nom, qty: 1, price: l.frais || 0 }],
    total: c.total + (l.frais || 0),
  };
}
export function bonLivreurNavigateur(c) {
  const t = donneesBonLivraison(c);
  const w = window.open("", "_blank", "width=300,height=600");
  if (!w) return;
  const esc = (s) => String(s).replace(/[&<>]/g, (x) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[x]));
  w.document.write(`<html><head><title>Livraison ${esc(t.ticketNo)}</title><style>body{font-family:monospace;font-size:13px;width:260px;margin:0;padding:8px}h1{text-align:center;font-size:36px;margin:4px 0}hr{border-top:1px dashed #000}td{padding:2px 0}.r{text-align:right}</style></head><body>
<p style="text-align:center;margin:0">ARENA CAFÉ · BON DE LIVRAISON</p><h1>${esc(t.ticketNo)}</h1>${t.livreur ? `<p style="text-align:center;margin:0">Livreur : <b>${esc(t.livreur)}</b></p>` : ""}<hr/>
<p style="margin:0">Client : <b>${esc(t.client)}</b><br/>Tél : <b>+221 ${esc(t.telephone)}</b><br/>Adresse : <b>${esc(t.adresse)}</b></p><hr/>
<table width="100%">${t.items.map((i) => `<tr><td>${i.qty} × ${esc(i.name)}</td><td class="r">${(i.qty * i.price).toLocaleString("fr-FR")} F</td></tr>`).join("")}</table><hr/>
<p><b>À ENCAISSER : ${t.total.toLocaleString("fr-FR")} F</b></p>${t.codeRetrait ? `<p>Code secret à demander au client :<br/><b style="font-size:22px">${esc(t.codeRetrait)}</b></p>` : ""}</body></html>`);
  w.document.close(); w.focus(); w.print(); w.close();
}
// Imprime le bon via le print bridge ; si l'imprimante ne répond pas, fenêtre du navigateur.
export async function imprimerBonLivraison(c) {
  try {
    const r = await fetch(PRINT_BRIDGE_URL + "/print", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donneesBonLivraison(c)) });
    if (!r.ok) throw new Error();
    etat.derniereImpression = `✓ Bon de livraison ${c.code} imprimé`;
  } catch (e) {
    etat.derniereImpression = `❌ Bon de livraison ${c.code} non imprimé (print bridge injoignable ?)`;
  }
  prevenir();
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
    if (u) { ecouter(); mettreAJourMenu().catch(() => {}); }
    prevenir();
  });
}

// Mises à jour du menu en ligne demandées par le patron, appliquées une seule
// fois par la caisse connectée (le site ne peut pas modifier le menu) :
// v2 : « Niébé » → « Haricots », catégories « Formules sandwich » / « Formules omelette »,
//      pain au choix (baguette / pain local brioché) sauf pour le sandwich Océan (thon).
// v3 : nouvelle carte des boissons (CARTE_BOISSONS) : les boissons connues prennent
//      nom, prix, description et famille de la carte, les nouvelles sont ajoutées,
//      les boissons ajoutées à la main dans la caisse restent.
// v4 : « Omelette Poulet » devient « Œuf au plat Poulet » à 1200, omelette saucisson à 1200 ;
//      jus d'orange (300) et Presséa orange (400) sont deux boissons séparées ;
//      chocolat au lait dans la formule à +350 (chocolat au lait à 500) ;
//      pas de poulet dans le sandwich saucisson pimentaise.
// v5 : Cocktail energy drink à 1000 (la carte des boissons est réappliquée).
// v6 : carte crêpes, gaufres, beignets et glaces (CATEGORIES_CREPES, CARTE_CREPES), prix unique.
export function migrerMenu(m) {
  const v = (m && m.version) || 1;
  if (!m || v >= 6) return null;
  const n = JSON.parse(JSON.stringify(m));
  n.options = n.options || {};
  n.articles = n.articles || [];
  if (v < 2) {
    const noms = { "Sandwichs": "Formules sandwich", "Sandwichs omelette": "Formules omelette" };
    (n.categories || []).forEach((c) => { if (noms[c.nom]) c.nom = noms[c.nom]; });
    if (!n.options.pains) n.options.pains = ["Baguette", "Pain local brioché"];
    n.articles.forEach((a) => {
      if (a.id === "ocean") a.sansChoixPain = true;
      for (const k of ["nom", "description"]) if (typeof a[k] === "string")
        a[k] = a[k].replace(/Niébé mijoté/g, "Haricots mijotés").replace(/Niébé/g, "Haricots").replace(/niébé/g, "haricots");
    });
  }
  // Boissons de la carte dans l'ordre de l'affiche, puis celles ajoutées à la main.
  const carte = CARTE_BOISSONS.map((b) => {
    const a = n.articles.find((x) => x.id === b.id);
    return a ? { ...a, ...b, categorie: "boissons" } : { ...b, categorie: "boissons", nomWolof: "", photo: "", dispo: true };
  });
  const ids = new Set(CARTE_BOISSONS.map((b) => b.id));
  const reste = n.articles.filter((a) => !ids.has(a.id));
  n.articles = [...reste.filter((a) => a.categorie !== "boissons"), ...carte, ...reste.filter((a) => a.categorie === "boissons")];
  // Catégories crêpes avant les boissons, puis les articles (ajoutés ou mis à jour par id).
  n.categories = n.categories || [];
  for (const c of CATEGORIES_CREPES) {
    const i = n.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) { n.categories[i] = { ...n.categories[i], ...c }; continue; }
    const iBoissons = n.categories.findIndex((x) => x.id === "boissons");
    n.categories.splice(iBoissons < 0 ? n.categories.length : iBoissons, 0, { ...c });
  }
  for (const c of CARTE_CREPES) {
    const i = n.articles.findIndex((x) => x.id === c.id);
    if (i >= 0) n.articles[i] = { ...n.articles[i], ...c };
    else {
      const iBoisson = n.articles.findIndex((x) => x.categorie === "boissons");
      n.articles.splice(iBoisson < 0 ? n.articles.length : iBoisson, 0, { ...c, nomWolof: "", photo: "", dispo: true });
    }
  }
  n.articles.forEach((a) => {
    if (a.id === "omelette_poulet") Object.assign(a, { nom: "Sandwich Œuf au plat Poulet", description: "Œuf au plat, poulet, oignons, pommes de terre", prixFormule: 1200 });
    if (a.id === "omelette_saucisson") a.prixFormule = 1200;
    if (a.id === "saucisson_pimentaise" && typeof a.description === "string")
      a.description = a.description.replace(/,\s*poulet\b/i, "");
  });
  (n.options.boissonsFormule || []).forEach((b) => { if (b.id === "choco_lait") b.sup = 350; });
  n.version = 6;
  return n;
}
async function mettreAJourMenu() {
  const ref = doc(db, "config/menu");
  const s = await getDoc(ref);
  const n = s.exists() ? migrerMenu(s.data()) : null;
  if (n) await updateDoc(ref, { version: n.version, categories: n.categories, articles: n.articles, options: n.options });
}
