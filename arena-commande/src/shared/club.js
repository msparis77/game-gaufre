// Club Arena : les clients laissent leur numéro pour recevoir les offres sur WhatsApp.
// Code partagé entre le site (inscription), la caisse (liste, exports) et les tests.
//
// `fs` = le module "firebase/firestore" (passé en paramètre, comme pour passerCommande).

export const PROFILS = [
  { id: "eleve", nom: "Élève" },
  { id: "parent", nom: "Parent" },
  { id: "prof", nom: "Prof / personnel" },
  { id: "voisin", nom: "Voisin du quartier" },
  { id: "autre", nom: "Autre" },
];
export const nomProfil = (id) => (PROFILS.find((p) => p.id === id) || { nom: id }).nom;

// Réglages par défaut (document config/club, modifiable dans la caisse).
export const CLUB_DEPART = {
  actif: true,
  cadeau: "1 Café Touba offert",
  telephone: "", // numéro WhatsApp Business d'Arena Café (9 chiffres)
  lienChaine: "", // lien de la Chaîne WhatsApp, ex. https://whatsapp.com/channel/...
};

export class ErreurClub extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

export async function inscrireClub(fs, db, uid, { prenom, telephone, profil, parrain, source = "qr" }) {
  const { doc, setDoc, serverTimestamp } = fs;
  const d = {
    uid,
    prenom: String(prenom || "").trim().slice(0, 30),
    telephone,
    profil,
    consentement: true,
    majeurOuParents: true,
    source,
    createdAt: serverTimestamp(),
    cadeauDonne: false,
  };
  const p = String(parrain || "").trim().slice(0, 30);
  if (p) d.parrain = p;
  try {
    await setDoc(doc(db, "club", telephone), d);
  } catch (e) {
    // La liste n'est pas lisible depuis le site : un numéro déjà inscrit est refusé par les règles.
    if (e && e.code === "permission-denied") throw new ErreurClub("deja", "Ce numéro est déjà inscrit au Club.");
    throw new ErreurClub("reseau", "Connexion impossible. Vérifie ta connexion internet et réessaie.");
  }
}

// ─── Fichiers à télécharger ───
const echapVcf = (t) => String(t || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, " ");
export function vcard(nom, telephone, note) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:" + echapVcf(nom),
    "N:" + echapVcf(nom) + ";;;;",
    "TEL;TYPE=CELL:+221" + telephone,
    note ? "NOTE:" + echapVcf(note) : null,
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

// Tous les inscrits en un seul fichier de contacts (à ouvrir sur le téléphone du patron).
export const vcardsClub = (membres) =>
  membres.map((m) => vcard("Club Arena - " + m.prenom + " " + m.telephone.slice(-4), m.telephone, nomProfil(m.profil))).join("\r\n") + "\r\n";

// Tableau pour Excel (séparateur « ; » comme l'Excel français, BOM pour les accents).
const cellule = (v) => {
  const t = String(v == null ? "" : v);
  return /[";\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
};
export function csvClub(membres) {
  const lignes = [["Prénom", "Téléphone", "Profil", "Parrain", "Inscrit le", "Cadeau donné", "Source"]];
  for (const m of membres)
    lignes.push([m.prenom, "+221 " + m.telephone, nomProfil(m.profil), m.parrain || "",
      m.createdAt ? m.createdAt.toDate().toLocaleString("fr-FR") : "", m.cadeauDonne ? "oui" : "non", m.source || ""]);
  return "﻿" + lignes.map((l) => l.map(cellule).join(";")).join("\r\n") + "\r\n";
}

// Lance le téléchargement d'un fichier dans le navigateur.
export function telecharger(nomFichier, contenu, type) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = nomFichier;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
