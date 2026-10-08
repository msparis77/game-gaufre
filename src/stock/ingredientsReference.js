// Produits achetés à référencer dans Stocks → Ingrédients (ticket Auchan + prix donnés par Moussa, 2026-10-08).
// On ajoute seulement ceux qui manquent, sans quantité ; prix 0 = à remplir plus tard.
// Un produit déjà présent (même nom ou alias) n'est pas dupliqué ; seuls ceux de PRIX_A_JOUR reçoivent le nouveau prix.
export const VERSION_REFERENCE = 1;

export const INGREDIENTS_REFERENCE = [
  // Cuisine
  { nom: "Lait demi-écrémé", unit: "L", emoji: "🥛", unitCost: 1225, alias: ["Lait liquide", "Lait Candia"] },
  { nom: "Lait entier", unit: "L", emoji: "🥛", unitCost: 1590 },
  { nom: "Margarine", unit: "kg", emoji: "🧈", unitCost: 6375 },
  { nom: "Huile tournesol", unit: "L", emoji: "🫗", unitCost: 0, alias: ["Huile"] },
  { nom: "Sel", unit: "kg", emoji: "🧂", unitCost: 2083 },
  { nom: "Maïzena", unit: "kg", emoji: "🌽", unitCost: 0 },
  { nom: "Sucre vanillé", unit: "pcs", emoji: "🍦", unitCost: 0 },
  { nom: "Eau gazeuse", unit: "L", emoji: "💧", unitCost: 0 },
  { nom: "Crème liquide", unit: "L", emoji: "🍶", unitCost: 4500, alias: ["Crème", "Crème chantilly", "Chantilly"] },
  { nom: "Lait concentré sucré", unit: "kg", emoji: "🥫", unitCost: 3000, alias: ["Lait concentré"] },
  { nom: "Jambon de bœuf", unit: "kg", emoji: "🥓", unitCost: 5890, alias: ["Jambon"] },
  { nom: "Saucisson", unit: "kg", emoji: "🌭", unitCost: 0 },
  { nom: "Viande hachée", unit: "kg", emoji: "🥩", unitCost: 0 },
  { nom: "Mayonnaise", unit: "kg", emoji: "🥚", unitCost: 2780 },
  { nom: "Ketchup", unit: "pcs", emoji: "🍅", unitCost: 0 },
  { nom: "Sauce sriracha", unit: "pcs", emoji: "🌶️", unitCost: 0 },
  { nom: "Poivre", unit: "pcs", emoji: "🧂", unitCost: 0 },
  { nom: "Bouillon Maggi", unit: "pcs", emoji: "🧊", unitCost: 0 },
  { nom: "Pâte de sardinelle", unit: "pcs", emoji: "🐟", unitCost: 0 },
  // Boissons
  { nom: "Ovaline", unit: "kg", emoji: "🍫", unitCost: 6225 },
  { nom: "Nescafé sticks", unit: "pcs", emoji: "☕", unitCost: 43 },
  { nom: "Nescafé boîte", unit: "pcs", emoji: "☕", unitCost: 0 },
  { nom: "Thé Lipton (sachet)", unit: "pcs", emoji: "🍵", unitCost: 33, alias: ["Thé Lipton"] },
  { nom: "Thé Flecha", unit: "kg", emoji: "🍵", unitCost: 4580 },
  { nom: "Sunquick orange", unit: "L", emoji: "🍊", unitCost: 3560 },
  { nom: "Sirop de grenadine", unit: "L", emoji: "🍒", unitCost: 0, alias: ["Grenadine"] },
  { nom: "Jus Juko orange (pack)", unit: "pcs", emoji: "🧃", unitCost: 1000 },
  { nom: "Jus Juko ananas (pack)", unit: "pcs", emoji: "🧃", unitCost: 1000 },
  { nom: "Jus bouye bissap", unit: "pcs", emoji: "🧃", unitCost: 490 },
  { nom: "Jus bissap ananas", unit: "pcs", emoji: "🧃", unitCost: 490 },
];

// Nouveaux prix pour des produits déjà dans la caisse (validés par Moussa le 2026-10-08).
export const PRIX_A_JOUR = [
  { noms: ["Poulet"], unitCost: 4000 },
  { noms: ["Fromage", "Emmental", "Emmental râpé"], unitCost: 7000 },
  { noms: ["Banane"], unit: "kg", unitCost: 800 },
  { noms: ["Oeufs", "Œufs", "Oeuf", "Œuf"], unitCost: 83 },
  { noms: ["Farine"], unitCost: 825 },
  { noms: ["Nutella", "Chocopain"], unitCost: 1990 },
  { noms: ["Levure", "Levure chimique"], unitCost: 9375 },
];

const cle = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");

// Renvoie la nouvelle liste si des produits ont été ajoutés ou des prix mis à jour, sinon null.
// Ne tourne qu'une fois : les produits ajoutés portent refV, ce qui marque la liste comme déjà complétée.
export function completerIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return null;
  if (ingredients.some((i) => (i && i.refV) >= VERSION_REFERENCE)) return null;
  let change = false;
  const misAJour = ingredients.map((i) => {
    const p = i && PRIX_A_JOUR.find((x) => x.noms.some((n) => cle(n) === cle(i.name)));
    if (!p || (i.unitCost === p.unitCost && (!p.unit || i.unit === p.unit))) return i;
    change = true;
    return { ...i, unitCost: p.unitCost, ...(p.unit ? { unit: p.unit } : {}), refV: VERSION_REFERENCE };
  });
  const connus = new Set(ingredients.map((i) => cle(i && i.name)));
  const ajouts = INGREDIENTS_REFERENCE.filter((r) => ![r.nom, ...(r.alias || [])].some((n) => connus.has(cle(n)))).map((r) => ({
    id: "iref_" + cle(r.nom),
    name: r.nom,
    unit: r.unit,
    emoji: r.emoji,
    unitCost: r.unitCost,
    refV: VERSION_REFERENCE,
  }));
  return ajouts.length || change ? [...misAJour, ...ajouts] : null;
}
