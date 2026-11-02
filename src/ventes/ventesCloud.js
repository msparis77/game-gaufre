// Ventes de la caisse dans Firebase : un document par vente, dans
// boutiques/{boutique}/ventes/{idVente}. Une vente ne peut plus en écraser une
// autre (contrairement au fichier du jour sur GitHub), elle apparaît tout de
// suite sur tous les appareils, et l'historique se relit sur n'importe quelle période.
//
// Le poste doit être connecté avec le compte « caisse » (onglet 🌐 En ligne).
// Tant qu'il ne l'est pas, ou sans réseau, les ventes attendent dans une file
// gardée sur l'appareil, puis partent dès que c'est possible.
import { db, surConnexion } from "../enligne/firebaseCaisse.js";
import { collection, doc, setDoc, query, where, onSnapshot, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";

const FILE = "gg3-ventes-a-envoyer";
const colVentes = (boutique) => collection(db, "boutiques", boutique, "ventes");
// Firestore refuse les valeurs undefined : on passe par JSON.
const propre = (o) => JSON.parse(JSON.stringify(o));

let connecte = false;
const abonnes = new Set();
export const estConnecte = () => connecte;
export function surEtat(f) { abonnes.add(f); f(connecte); return () => abonnes.delete(f); }

function lireFile() { try { return JSON.parse(localStorage.getItem(FILE) || "[]"); } catch (e) { return []; } }
function ecrireFile(f) { try { localStorage.setItem(FILE, JSON.stringify(f)); } catch (e) {} abonnes.forEach((x) => x(connecte)); }
export const nbEnAttente = () => lireFile().length;

let envoiEnCours = false;
export async function envoyerFile() {
  if (!connecte || envoiEnCours) return;
  envoiEnCours = true;
  try {
    for (const op of lireFile()) {
      const ref = doc(colVentes(op.boutique), op.id);
      if (op.type === "annule") await setDoc(ref, { annulee: true, annuleePar: op.par || "", annuleeA: serverTimestamp() }, { merge: true });
      else await setDoc(ref, { ...op.vente, boutique: op.boutique, annulee: false, enregistreeA: serverTimestamp() }, { merge: true });
      ecrireFile(lireFile().filter((x) => x.cle !== op.cle));
    }
  } catch (e) {
    console.warn("Ventes : envoi à Firebase reporté", e && e.code);
  } finally { envoiEnCours = false; }
}

surConnexion((u) => { connecte = !!u; abonnes.forEach((x) => x(connecte)); if (connecte) envoyerFile(); });
if (typeof window !== "undefined") {
  window.addEventListener("online", envoyerFile);
  setInterval(envoyerFile, 30000);
}

export function enregistrerVenteCloud(boutique, vente) {
  ecrireFile([...lireFile(), { cle: "v_" + vente.id, type: "vente", boutique, id: vente.id, vente: propre(vente) }]);
  envoyerFile();
}
export function annulerVenteCloud(boutique, id, par) {
  ecrireFile([...lireFile(), { cle: "a_" + id + "_" + Date.now(), type: "annule", boutique, id, par }]);
  envoyerFile();
}

// Ventes d'une journée, en direct (toutes les caisses). f reçoit la liste, annulées comprises.
export function ecouterJour(boutique, jour, f) {
  let stop = null, fini = false;
  const lancer = () => {
    if (stop || fini || !connecte) return;
    stop = onSnapshot(query(colVentes(boutique), where("jour", "==", jour)),
      (s) => f(s.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (e) => { console.warn("Ventes : écoute impossible", e && e.code); stop = null; });
  };
  const desabo = surEtat((c) => { if (c) lancer(); });
  return () => { fini = true; desabo(); if (stop) stop(); };
}

// Ventes entre deux journées (AAAA-MM-JJ, incluses), sans les annulées.
export async function chargerPeriode(boutique, debut, fin) {
  const s = await getDocs(query(colVentes(boutique), where("jour", ">=", debut), where("jour", "<=", fin)));
  return s.docs.map((d) => ({ ...d.data(), id: d.id })).filter((v) => !v.annulee);
}

// Recopie dans Firebase les ventes d'anciennes journées (fichiers GitHub).
// lireJour(date) rend le fichier du jour. Sans danger si on le relance.
export async function importerAnciennes(boutique, jours, lireJour, progres) {
  let n = 0, j = 0;
  for (const ds of jours) {
    j++;
    const d = await lireJour(ds);
    const ventes = ((d && d.sales) || []).filter((v) => v && v.id);
    for (let i = 0; i < ventes.length; i += 400) {
      const b = writeBatch(db);
      for (const v of ventes.slice(i, i + 400))
        b.set(doc(colVentes(boutique), String(v.id)), { ...propre(v), jour: v.jour || ds, boutique, importee: true }, { merge: true });
      await b.commit();
      n += Math.min(400, ventes.length - i);
    }
    if (progres) progres(j, jours.length, n);
  }
  return n;
}
