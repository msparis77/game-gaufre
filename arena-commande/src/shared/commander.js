// Envoi d'une commande dans Firestore, en une seule transaction :
// numéro du créneau (+1), anti-abus du téléphone, et la commande elle-même.
// Les règles de sécurité refusent tout ce qui ne suit pas exactement ce format.
//
// `fs` = le module "firebase/firestore" (passé en paramètre pour pouvoir
// réutiliser ce code dans les tests des règles).

import { compteurId } from "./creneaux.js";

export class ErreurCommande extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export const nettoyerTelephone = (t) => {
  let n = String(t || "").replace(/[^0-9]/g, "");
  if (n.startsWith("00221")) n = n.slice(5);
  else if (n.startsWith("221") && n.length === 12) n = n.slice(3);
  return n;
};
export const telephoneValide = (t) => /^7[05678][0-9]{7}$/.test(t);

export async function passerCommande(fs, db, uid, { prenom, telephone, lignes, total, creneau }) {
  const { doc, collection, runTransaction, serverTimestamp, Timestamp } = fs;
  const id = doc(collection(db, "commandes_en_ligne")).id;
  const refCompteur = doc(db, "compteurs", compteurId(creneau.id, creneau.retraitAt));
  const refClient = doc(db, "clients", uid);
  const refCommande = doc(db, "commandes_en_ligne", id);
  try {
    return await runTransaction(db, async (tx) => {
      const [sc, scli] = await Promise.all([tx.get(refCompteur), tx.get(refClient)]);
      if (scli.exists()) {
        const d = scli.data().derniere;
        if (d && Date.now() - d.toMillis() < 2 * 60000)
          throw new ErreurCommande("ATTENTE", "Tu viens déjà de commander. Attends 2 minutes avant une nouvelle commande.");
      }
      const numero = (sc.exists() ? sc.data().count : 0) + 1;
      if (numero > creneau.max)
        throw new ErreurCommande("COMPLET", "Ce créneau est complet. Choisis un autre horaire.");
      const code = creneau.code + numero;
      tx.set(refCompteur, { count: numero, derniere: id });
      tx.set(refClient, { derniere: serverTimestamp() });
      tx.set(refCommande, {
        uid,
        prenom: prenom.trim().slice(0, 30),
        telephone,
        lignes,
        total,
        statut: "recue",
        paiement: { mode: "retrait", statut: "a_payer" },
        createdAt: serverTimestamp(),
        venteEnregistree: false,
        creneauId: creneau.id,
        creneauCode: creneau.code,
        retraitAt: Timestamp.fromDate(creneau.retraitAt),
        numero,
        code,
      });
      return { id, code };
    });
  } catch (e) {
    if (e instanceof ErreurCommande) throw e;
    if (e && e.code === "permission-denied")
      throw new ErreurCommande("REFUS", "Commande refusée : le créneau vient peut-être de fermer. Choisis un autre horaire.");
    throw new ErreurCommande("RESEAU", "Connexion impossible. Vérifie ta connexion internet et réessaie.");
  }
}
