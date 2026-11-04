// Moyens de paiement d'une commande en ligne.
export const MOYENS = {
  especes: { nom: "Espèces", emoji: "💵", couleur: "#1e5e3d" },
  wave: { nom: "Wave", emoji: "🌊", couleur: "#1DC8F2" },
  orange: { nom: "Orange Money", emoji: "🟠", couleur: "#FF7900" },
};
// Moyens ouverts dans la caisse (Espèces toujours)
export const moyensOuverts = (cfg) => ["especes", ...["wave", "orange"].filter((m) => cfg?.[m]?.actif && (cfg[m].numero || cfg[m].lien))];
export const moyenCommande = (c) => c?.paiement?.moyen || "especes";
export const estMobile = (c) => ["wave", "orange"].includes(moyenCommande(c));
export const estPaye = (c) => c?.paiement?.statut === "paye";
// Lien Wave avec le montant déjà rempli (lien marchand pay.wave.com)
export function lienPaiement(cfg, moyen, montant) {
  const l = String(cfg?.[moyen]?.lien || "").trim();
  if (!/^https:\/\//.test(l)) return "";
  if (moyen === "wave" && /pay\.wave\.com/.test(l) && !/amount=/.test(l)) return l + (l.includes("?") ? "&" : "?") + "amount=" + montant;
  return l;
}
export const formatNumero = (n) => String(n || "").replace(/\s/g, "").replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
