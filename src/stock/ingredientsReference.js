// Produits achetés à référencer dans Stocks → Ingrédients (ticket Auchan + prix donnés par Moussa, 2026-10-08).
// On ajoute seulement ceux qui manquent, sans quantité ; prix 0 = à remplir plus tard.
// Un produit déjà présent (même nom ou alias) n'est pas dupliqué ; seuls ceux de PRIX_A_JOUR reçoivent le nouveau prix.
export const VERSION_REFERENCE = 5;

export const INGREDIENTS_REFERENCE = [
  // Cuisine
  { nom: "Lait demi-écrémé", unit: "L", emoji: "🥛", unitCost: 1225, alias: ["Lait liquide", "Lait Candia"] },
  { nom: "Lait entier", unit: "L", emoji: "🥛", unitCost: 1590 },
  { nom: "Margarine", unit: "kg", emoji: "🧈", unitCost: 6375 },
  { nom: "Huile tournesol", unit: "L", emoji: "🫗", unitCost: 1750, alias: ["Huile"] },
  { nom: "Sel", unit: "kg", emoji: "🧂", unitCost: 2083 },
  { nom: "Maïzena", unit: "kg", emoji: "🌽", unitCost: 3580 },
  { nom: "Sucre vanillé", unit: "pcs", emoji: "🍦", unitCost: 0 },
  { nom: "Eau gazeuse", unit: "L", emoji: "💧", unitCost: 340 },
  { nom: "Crème liquide", unit: "L", emoji: "🍶", unitCost: 4500, alias: ["Crème", "Crème chantilly", "Chantilly"] },
  { nom: "Lait concentré sucré", unit: "kg", emoji: "🥫", unitCost: 3000, alias: ["Lait concentré"] },
  { nom: "Jambon de bœuf", unit: "kg", emoji: "🥓", unitCost: 5890, alias: ["Jambon"] },
  { nom: "Saucisson", unit: "kg", emoji: "🌭", unitCost: 1500 },
  { nom: "Viande hachée", unit: "kg", emoji: "🥩", unitCost: 6000 },
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
  // v3 : liste d'achats en gros de Moussa (2026-10-08)
  { v: 3, nom: "Riz parfumé", unit: "kg", emoji: "🍚", unitCost: 420 },
  { v: 3, nom: "Oignons", unit: "kg", emoji: "🧅", unitCost: 580, alias: ["Oignon"] },
  { v: 3, nom: "Pommes de terre", unit: "kg", emoji: "🥔", unitCost: 420, alias: ["PDT", "Pomme de terre"] },
  { v: 3, nom: "Couscous", unit: "kg", emoji: "🍲", unitCost: 850 },
  { v: 3, nom: "Gingembre", unit: "kg", emoji: "🫚", unitCost: 2500 },
  { v: 3, nom: "Vermicelle", unit: "kg", emoji: "🍜", unitCost: 970 },
  { v: 3, nom: "Jus Presséa", unit: "pcs", emoji: "🍊", unitCost: 302, alias: ["Presséa", "Pressea"] },
  { v: 3, nom: "Haricots", unit: "kg", emoji: "🫘", unitCost: 950, alias: ["Niébé", "Haricot"] },
  { v: 3, nom: "Macaronis", unit: "kg", emoji: "🍝", unitCost: 660, alias: ["Macaroni", "Pâtes"] },
  { v: 3, nom: "Cuisse de poulet", unit: "kg", emoji: "🍗", unitCost: 2000, alias: ["Cuisses de poulet"] },
  { v: 3, nom: "Gobelet (café / thé)", unit: "pcs", emoji: "🥤", unitCost: 4.5, alias: ["Gobelet"] },
  { v: 3, nom: "Fanta", unit: "pcs", emoji: "🥤", unitCost: 281 },
  { v: 3, nom: "Sprite", unit: "pcs", emoji: "🥤", unitCost: 281 },
  // v4 : liste des produits pour les employés (page « Produits Arena Café », complétée par Moussa le 2026-11-02).
  // Sans prix ni quantité : à remplir dans Stocks → Ingrédients au fur et à mesure.
  { v: 4, nom: "Baguette", unit: "pcs", emoji: "🥖", unitCost: 0, alias: ["Pain", "Pain baguette"] },
  { v: 4, nom: "Pain local", unit: "pcs", emoji: "🥖", unitCost: 0 },
  { v: 4, nom: "Pain à hamburger", unit: "pcs", emoji: "🍔", unitCost: 0, alias: ["Pain burger"] },
  { v: 4, nom: "Galettes / tortillas", unit: "pcs", emoji: "🌯", unitCost: 0, alias: ["Galette", "Tortilla"] },
  { v: 4, nom: "Pâte à fataya", unit: "kg", emoji: "🥟", unitCost: 0 },
  { v: 4, nom: "Mix beignets", unit: "kg", emoji: "🍩", unitCost: 0, alias: ["Pâte à beignets"] },
  { v: 4, nom: "Poulet entier", unit: "pcs", emoji: "🍗", unitCost: 3000 },
  { v: 4, nom: "Viande de bœuf", unit: "kg", emoji: "🥩", unitCost: 0, alias: ["Boeuf", "Bœuf", "Viande"] },
  { v: 4, nom: "Steaks hachés", unit: "pcs", emoji: "🍔", unitCost: 0, alias: ["Steak haché"] },
  { v: 4, nom: "Corned beef", unit: "pcs", emoji: "🥫", unitCost: 0 },
  { v: 4, nom: "Sorbet bissap", unit: "pcs", emoji: "🍨", unitCost: 0 },
  { v: 4, nom: "Sorbet orange", unit: "pcs", emoji: "🍨", unitCost: 0 },
  { v: 4, nom: "Tomates", unit: "kg", emoji: "🍅", unitCost: 0, alias: ["Tomate"] },
  { v: 4, nom: "Salade", unit: "pcs", emoji: "🥬", unitCost: 0 },
  { v: 4, nom: "Petits pois", unit: "kg", emoji: "🫛", unitCost: 0 },
  { v: 4, nom: "Légumes du moment", unit: "kg", emoji: "🥕", unitCost: 0 },
  { v: 4, nom: "Citrons", unit: "kg", emoji: "🍋", unitCost: 0, alias: ["Citron"] },
  { v: 4, nom: "Menthe", unit: "pcs", emoji: "🌿", unitCost: 0 },
  { v: 4, nom: "Oignons verts (en branche)", unit: "pcs", emoji: "🧅", unitCost: 0, alias: ["Oignons branche", "Oignon vert"] },
  { v: 4, nom: "Attiéké", unit: "kg", emoji: "🥣", unitCost: 0 },
  { v: 4, nom: "Moutarde", unit: "kg", emoji: "🟡", unitCost: 0 },
  { v: 4, nom: "Piment", unit: "kg", emoji: "🌶️", unitCost: 0 },
  { v: 4, nom: "Paprika", unit: "kg", emoji: "🌶️", unitCost: 0 },
  { v: 4, nom: "Thym", unit: "pcs", emoji: "🌿", unitCost: 0 },
  { v: 4, nom: "Kilmaji", unit: "pcs", emoji: "🧂", unitCost: 0 },
  { v: 4, nom: "Épices marinade poulet braisé", unit: "pcs", emoji: "🍗", unitCost: 0 },
  { v: 4, nom: "Charbon", unit: "kg", emoji: "🔥", unitCost: 0 },
  { v: 4, nom: "Café Touba", unit: "kg", emoji: "☕", unitCost: 0 },
  { v: 4, nom: "Fleurs de bissap", unit: "kg", emoji: "🌺", unitCost: 0, alias: ["Bissap"] },
  { v: 4, nom: "Poudre de bouye", unit: "kg", emoji: "🌳", unitCost: 0, alias: ["Bouye", "Pain de singe"] },
  { v: 4, nom: "Tamarin", unit: "kg", emoji: "🟤", unitCost: 0 },
  { v: 4, nom: "Ditakh", unit: "kg", emoji: "🟢", unitCost: 0 },
  { v: 4, nom: "Oranges", unit: "kg", emoji: "🍊", unitCost: 0, alias: ["Orange"] },
  { v: 4, nom: "Energy drink", unit: "pcs", emoji: "⚡", unitCost: 0 },
  { v: 4, nom: "Eau en bouteille", unit: "pcs", emoji: "💧", unitCost: 71, alias: ["Bouteille d'eau"] },
  { v: 4, nom: "Eau en sachet", unit: "pcs", emoji: "💧", unitCost: 0, alias: ["Sachet d'eau"] },
  { v: 4, nom: "Gobelets jus + couvercles", unit: "pcs", emoji: "🥤", unitCost: 0 },
  { v: 4, nom: "Pailles", unit: "pcs", emoji: "🥤", unitCost: 0, alias: ["Paille"] },
  { v: 4, nom: "Barquettes / boîtes à emporter", unit: "pcs", emoji: "📦", unitCost: 0, alias: ["Barquette"] },
  { v: 4, nom: "Papier alu / papier sandwich", unit: "pcs", emoji: "🧻", unitCost: 0, alias: ["Papier alu"] },
  { v: 4, nom: "Sachets / sacs", unit: "pcs", emoji: "🛍️", unitCost: 0, alias: ["Sac", "Sacs", "Sachet"] },
  { v: 4, nom: "Serviettes", unit: "pcs", emoji: "🧻", unitCost: 0 },
  { v: 4, nom: "Couverts en plastique", unit: "pcs", emoji: "🍴", unitCost: 0 },
  { v: 4, nom: "Rouleaux papier ticket", unit: "pcs", emoji: "🧾", unitCost: 0 },
  { v: 4, nom: "Liquide vaisselle", unit: "pcs", emoji: "🧽", unitCost: 0 },
  { v: 4, nom: "Éponges", unit: "pcs", emoji: "🧽", unitCost: 0 },
  { v: 4, nom: "Javel / produit sol", unit: "pcs", emoji: "🧴", unitCost: 0, alias: ["Javel"] },
  { v: 4, nom: "Gaz (bouteille)", unit: "pcs", emoji: "🔥", unitCost: 0, alias: ["Gaz"] },
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
  // v2 : prix donnés par Moussa (huile 1 L à 1 750 F, Maïzena 500 g à 1 790 F, viande hachée 6 000 F/kg)
  { v: 2, noms: ["Huile tournesol", "Huile"], unitCost: 1750 },
  { v: 2, noms: ["Maïzena"], unitCost: 3580 },
  { v: 2, noms: ["Viande hachée"], unitCost: 6000 },
  { v: 2, noms: ["Saucisson"], unitCost: 1500 },
  { v: 2, noms: ["Eau gazeuse"], unitCost: 340 },
  { v: 2, noms: ["Thon"], unitCost: 5113 }, // boîte de 800 g à 4 090 F (ticket Auchan)
  // v3 : achats en gros (sucre 50 kg à 27 250 F, Chocopain 5 kg à 9 000 F, mayonnaise 5 kg à 7 500 F, casier de 24 à 6 750 F)
  { v: 3, noms: ["Huile tournesol", "Huile"], unitCost: 925 }, // bidon de 20 L à 18 500 F
  { v: 3, noms: ["Sucre"], unitCost: 545 },
  { v: 3, noms: ["Nutella", "Chocopain"], unitCost: 1800 },
  { v: 3, noms: ["Mayonnaise"], unitCost: 1500 },
  { v: 3, noms: ["Coca", "Coca-Cola"], unitCost: 281 },
  // v5 : prix déjà connus (ticket Auchan, achats en gros) pour des produits restés à 0 (2026-11-02).
  { v: 5, noms: ["Pâte de sardinelle"], nom: "Pâte de sardinelle Pinton", unit: "pcs", unitCost: 1390 }, // pot Pinton, ticket Auchan
  { v: 5, noms: ["Ketchup"], unitCost: 1425 }, // bouteille, ticket Auchan
  { v: 5, noms: ["Sauce sriracha"], unitCost: 1850 }, // bouteille, ticket Auchan
  { v: 5, noms: ["Poivre"], unitCost: 990 }, // poivre gris moulu, ticket Auchan
  { v: 5, noms: ["Bouillon Maggi"], unitCost: 1590 }, // boîte, ticket Auchan
  { v: 5, noms: ["Nescafé boîte"], unitCost: 4225 }, // ticket Auchan
  { v: 5, noms: ["Sirop de grenadine"], unit: "pcs", unitCost: 2225 }, // bouteille Duval, ticket Auchan
  { v: 5, noms: ["Sucre vanillé"], unitCost: 100 }, // sachet, estimation
  { v: 5, noms: ["Poulet entier"], unitCost: 3000 }, // Moussa 08/10 : 3 000 F le poulet
  { v: 5, noms: ["Eau en bouteille"], unitCost: 71 }, // pack de 12 à 850 F
];

const cle = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");

// Renvoie la nouvelle liste si des produits ont été ajoutés ou des prix mis à jour, sinon null.
// Chaque version ne tourne qu'une fois : les produits ajoutés ou modifiés portent refV (la version appliquée).
export function completerIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return null;
  const deja = ingredients.reduce((m, i) => Math.max(m, (i && i.refV) || 0), 0);
  if (deja >= VERSION_REFERENCE) return null;
  let change = false;
  const misAJour = ingredients.map((i) => {
    // Si un produit a plusieurs prix, on garde le plus récent (version la plus haute).
    const p = i && PRIX_A_JOUR.filter((x) => (x.v || 1) > deja && x.noms.some((n) => cle(n) === cle(i.name))).pop();
    if (!p || (i.unitCost === p.unitCost && (!p.unit || i.unit === p.unit) && (!p.nom || i.name === p.nom))) return i;
    change = true;
    return { ...i, unitCost: p.unitCost, ...(p.unit ? { unit: p.unit } : {}), ...(p.nom ? { name: p.nom } : {}), refV: VERSION_REFERENCE };
  });
  const connus = new Set(ingredients.map((i) => cle(i && i.name)));
  const ajouts = INGREDIENTS_REFERENCE.filter((r) => (r.v || 1) > deja && ![r.nom, ...(r.alias || [])].some((n) => connus.has(cle(n)))).map((r) => ({
    id: "iref_" + cle(r.nom),
    name: r.nom,
    unit: r.unit,
    emoji: r.emoji,
    unitCost: r.unitCost,
    refV: VERSION_REFERENCE,
  }));
  return ajouts.length || change ? [...misAJour, ...ajouts] : null;
}
