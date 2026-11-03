// Recettes proposées (2026-11-03) pour les produits de la carte qui n'en avaient pas encore.
// Quantités pour UNE portion, dans l'unité d'achat de l'ingrédient (kg, L, pièce).
// Ce sont des estimations à vérifier en cuisine : elles sont marquées « proposée » dans 💰 Coûts
// jusqu'à ce que le patron les enregistre. Elles ne remplacent jamais une recette déjà faite.
// Les accompagnements du poulet ont aussi leur recette, sous leur nom (Riz blanc, Attiéké…),
// pour que l'accompagnement choisi sorte du stock.
import { lignes } from "./recettesFiches.js";
import { trouverRecette } from "./coutRevient.js";

// v2 (Moussa 2026-11-03) : pains à 300-800 F : thon 40 g, corned beef 50 g, dambé 50 g, sauce ou garniture 30 g,
// oignon 5 g dans chaque sandwich ; baguette à 65 F (prix dans ingredientsReference).
export const VERSION_CARTE = 2;

const PAIN = ["Baguette", 1];
const ALU = ["Papier alu / papier sandwich", 1];
const GOB = ["Gobelet (café / thé)", 1];
const GOBJ = ["Gobelets jus + couvercles", 1];
const BARQ = ["Barquettes / boîtes à emporter", 1];
const HUILE = (q) => ["Huile tournesol", q];
const OIGNON = (q) => ["Oignons", q];
const MAYO = (q) => ["Mayonnaise", q];
const SUCRE = (q) => ["Sucre", q];

const R = (id, nom, categorie, emoji, garn) => ({ id, nom, categorie, emoji, garn });

export const RECETTES_CARTE = [
  // Petit-déjeuner (pains)
  R("pd_thon", "Pain thon", "Petit-déjeuner", "🐟", [PAIN, ["Pâte de sardinelle Pinton", 0.04], OIGNON(0.005)]),
  R("pd_dambe", "Pain dambé", "Petit-déjeuner", "🫘", [PAIN, ["Haricots", 0.05], OIGNON(0.005)]),
  R("pd_oeuf_mayo", "Pain œuf mayonnaise", "Petit-déjeuner", "🥚", [PAIN, ["Oeufs", 1], MAYO(0.03)]),
  R("pd_corned_beef", "Pain corned beef", "Petit-déjeuner", "🥫", [PAIN, ["Corned beef", 0.05], OIGNON(0.005)]),
  R("pd_viande_hachee", "Pain viande hachée", "Petit-déjeuner", "🥩", [PAIN, ["Viande hachée", 0.03], OIGNON(0.005)]),
  R("pd_petit_pois_viande", "Pain petits pois viande", "Petit-déjeuner", "🥩", [PAIN, ["Petits pois", 0.015], ["Viande hachée", 0.015], OIGNON(0.005)]),
  // Sandwichs omelette
  R("omelette_nature", "Sandwich Omelette Nature", "Sandwichs", "🍳", [PAIN, ["Oeufs", 2], OIGNON(0.005), HUILE(0.01), ["Sel", 0.001]]),
  R("omelette_pdt", "Sandwich Omelette Pommes de terre", "Sandwichs", "🍳", [PAIN, ["Oeufs", 2], ["Pommes de terre", 0.08], OIGNON(0.005), HUILE(0.02)]),
  R("omelette_poulet", "Sandwich Œuf au plat Poulet", "Sandwichs", "🍳", [PAIN, ["Oeufs", 1], ["Poulet", 0.05], ["Pommes de terre", 0.08], OIGNON(0.005), HUILE(0.02)]),
  R("omelette_saucisson", "Sandwich Omelette Saucisson", "Sandwichs", "🍳", [PAIN, ["Oeufs", 2], ["Saucisson", 0.04], ["Pommes de terre", 0.08], OIGNON(0.005), HUILE(0.02)]),
  R("omelette_jambon", "Sandwich Omelette Jambon", "Sandwichs", "🍳", [PAIN, ["Oeufs", 2], ["Jambon de bœuf", 0.04], OIGNON(0.005), HUILE(0.01)]),
  // Douceurs
  R("c_beignets_nutella", "Beignets bubble Nutella", "Douceurs", "🍩", [["Mix beignets", 0.05], ["Nutella", 0.02], HUILE(0.02)]),
  R("c_sorbet_bissap", "Sorbet bissap chantilly", "Douceurs", "🍧", [["Sorbet bissap", 1], ["Crème liquide", 0.02], SUCRE(0.004)]),
  R("c_sorbet_pasteque", "Sorbet orange chantilly", "Douceurs", "🍧", [["Sorbet orange", 1], ["Crème liquide", 0.02], SUCRE(0.004)]),
  // Poulet braisé
  R("p_quart", "Formule quart de poulet", "Poulet", "🍗", [["Poulet entier", 0.25], OIGNON(0.05), ["Piment", 0.005], ["Charbon", 0.1], BARQ]),
  R("p_demi", "Demi-poulet braisé", "Poulet", "🍗", [["Poulet entier", 0.5], OIGNON(0.08), ["Piment", 0.005], ["Charbon", 0.2], BARQ]),
  R("p_entier", "Poulet entier braisé", "Poulet", "🍗", [["Poulet entier", 1], OIGNON(0.15), ["Piment", 0.01], ["Charbon", 0.4], BARQ]),
  R("p_pain", "Pain", "Poulet", "🥖", [PAIN]),
  R("acc_riz_blanc", "Riz blanc", "Accompagnements", "🍚", [["Riz parfumé", 0.12], ["Sel", 0.001]]),
  R("acc_riz_rouge", "Riz rouge", "Accompagnements", "🍚", [["Riz parfumé", 0.12], ["Tomates", 0.02], OIGNON(0.01), HUILE(0.01)]),
  R("acc_vermicelle", "Vermicelle", "Accompagnements", "🍜", [["Vermicelle", 0.1], HUILE(0.005)]),
  R("acc_couscous", "Couscous", "Accompagnements", "🍚", [["Couscous", 0.1], ["Margarine", 0.005]]),
  R("acc_attieke", "Attiéké", "Accompagnements", "🍚", [["Attiéké", 0.15], OIGNON(0.01)]),
  R("acc_pdt", "Pommes de terre", "Accompagnements", "🍟", [["Pommes de terre", 0.2], HUILE(0.03)]),
  R("acc_legumes", "Légumes du moment", "Accompagnements", "🥗", [["Légumes du moment", 0.15]]),
  R("acc_macaroni", "Macaroni au fromage", "Accompagnements", "🧀", [["Macaronis", 0.1], ["Fromage", 0.02]]),
  // Boissons préparées
  R("b_touba", "Café Touba", "Boissons", "☕", [["Café Touba", 0.008], SUCRE(0.015), GOB]),
  R("b_maxi_touba", "Maxi café Touba", "Boissons", "☕", [["Café Touba", 0.02], SUCRE(0.035), GOB]),
  R("b_cafe_citron", "Café citron", "Boissons", "☕", [["Café Touba", 0.01], ["Citrons", 0.02], SUCRE(0.015), GOB]),
  R("b_cafe_lait", "Café au lait", "Boissons", "☕", [["Nescafé sticks", 1], ["Lait concentré sucré", 0.03], GOB]),
  R("b_choco_lait", "Chocolat au lait", "Boissons", "🍫", [["Ovaline", 0.02], ["Lait concentré sucré", 0.03], GOB]),
  R("b_the", "Thé", "Boissons", "🍵", [["Thé Lipton (sachet)", 1], SUCRE(0.015), GOB]),
  R("b_maxi_the", "Maxi thé", "Boissons", "🍵", [["Thé Lipton (sachet)", 2], SUCRE(0.035), GOB]),
  R("b_attaya", "Attaya", "Boissons", "🍵", [["Thé Flecha", 0.005], SUCRE(0.02), ["Menthe", 0.1], GOB]),
  R("b_wahss_gingembre", "Wahss gingembre", "Boissons", "🥤", [["Gingembre", 0.02], ["Citrons", 0.02], ["Menthe", 0.1], SUCRE(0.03), GOBJ]),
  R("b_wahss_bouye", "Wahss bouye", "Boissons", "🥤", [["Poudre de bouye", 0.03], ["Lait concentré sucré", 0.02], SUCRE(0.03), GOBJ]),
  R("b_bissap", "Bissap", "Boissons", "🥤", [["Fleurs de bissap", 0.015], SUCRE(0.04), ["Menthe", 0.05], GOBJ]),
  R("b_bissap_blanc", "Bissap blanc", "Boissons", "🥤", [["Fleurs de bissap", 0.015], SUCRE(0.04), ["Menthe", 0.05], GOBJ]),
  R("b_tamarin", "Tamarin", "Boissons", "🥤", [["Tamarin", 0.03], SUCRE(0.04), GOBJ]),
  R("b_bouye", "Bouye", "Boissons", "🥤", [["Poudre de bouye", 0.04], ["Lait concentré sucré", 0.03], SUCRE(0.04), GOBJ]),
  R("b_ditakh", "Ditakh", "Boissons", "🥤", [["Ditakh", 0.06], SUCRE(0.04), GOBJ]),
  R("b_jus_orange", "Jus d'orange", "Boissons", "🍊", [["Oranges", 0.4], SUCRE(0.01), GOBJ]),
  R("b_energy", "Cocktail energy drink", "Boissons", "⚡", [["Energy drink", 1], ["Sirop de grenadine", 0.02], ["Citrons", 0.01], GOBJ]),
  // Fast-food
  R("ff_tacos_poulet", "Tacos poulet", "Fast-food", "🌮", [["Galettes / tortillas", 1], ["Poulet", 0.1], ["Fromage", 0.03], ["Pommes de terre", 0.12], HUILE(0.02), MAYO(0.015), ["Ketchup", 0.02], ALU]),
  R("ff_tacos_viande_hachee", "Tacos viande hachée", "Fast-food", "🌮", [["Galettes / tortillas", 1], ["Viande hachée", 0.12], ["Fromage", 0.03], ["Pommes de terre", 0.12], HUILE(0.02), MAYO(0.015), ["Ketchup", 0.02], ALU]),
  R("ff_tacos_norvegien", "Tacos norvégien", "Fast-food", "🌮", [["Galettes / tortillas", 1], ["Poulet", 0.06], ["Viande hachée", 0.06], ["Fromage", 0.03], ["Pommes de terre", 0.12], HUILE(0.02), MAYO(0.015), ALU]),
  R("ff_galette_poulet", "Galette poulet fromage", "Fast-food", "🌯", [["Galettes / tortillas", 1], ["Poulet", 0.08], ["Fromage", 0.03], ["Salade", 0.05], MAYO(0.01), ALU]),
  R("ff_galette_viande_oeuf", "Galette viande hachée fromage œuf", "Fast-food", "🌯", [["Galettes / tortillas", 1], ["Viande hachée", 0.08], ["Fromage", 0.03], ["Oeufs", 1], MAYO(0.01), ALU]),
  R("ff_galette_jambon_oeuf", "Galette jambon œuf fromage", "Fast-food", "🌯", [["Galettes / tortillas", 1], ["Jambon de bœuf", 0.05], ["Oeufs", 1], ["Fromage", 0.03], ALU]),
  R("ff_burger_1_steak", "Hamburger 1 steak", "Fast-food", "🍔", [["Pain à hamburger", 1], ["Steaks hachés", 1], ["Fromage", 0.02], ["Salade", 0.05], ["Tomates", 0.02], OIGNON(0.01), ["Ketchup", 0.02], MAYO(0.01), ALU]),
  R("ff_burger_2_steaks", "Hamburger 2 steaks", "Fast-food", "🍔", [["Pain à hamburger", 1], ["Steaks hachés", 2], ["Fromage", 0.04], ["Salade", 0.05], ["Tomates", 0.02], OIGNON(0.01), ["Ketchup", 0.02], MAYO(0.01), ALU]),
  R("ff_shawarma_poulet", "Shawarma poulet", "Fast-food", "🥙", [["Galettes / tortillas", 1], ["Poulet", 0.1], ["Pommes de terre", 0.15], HUILE(0.03), ["Salade", 0.05], ["Tomates", 0.02], MAYO(0.015), ALU]),
  R("ff_shawarma_viande", "Shawarma viande", "Fast-food", "🥙", [["Galettes / tortillas", 1], ["Viande de bœuf", 0.1], ["Pommes de terre", 0.15], HUILE(0.03), ["Salade", 0.05], ["Tomates", 0.02], MAYO(0.015), ALU]),
  R("ff_sandwich_poulet", "Sandwich poulet", "Fast-food", "🥖", [PAIN, ["Poulet", 0.08], ["Salade", 0.03], ["Tomates", 0.02], OIGNON(0.005), MAYO(0.01), ALU]),
  R("ff_sandwich_viande", "Sandwich viande", "Fast-food", "🥖", [PAIN, ["Viande de bœuf", 0.08], ["Salade", 0.03], ["Tomates", 0.02], OIGNON(0.005), MAYO(0.01), ALU]),
  R("ff_fataya_complet", "Fataya complet", "Fast-food", "🥟", [["Pâte à fataya", 0.1], ["Viande hachée", 0.05], OIGNON(0.02), HUILE(0.03)]),
  R("ff_local_poulet", "Local poulet", "Fast-food", "🥖", [["Pain local", 1], ["Poulet", 0.06], OIGNON(0.005), MAYO(0.01), ALU]),
  R("ff_local_viande_hachee", "Local viande hachée", "Fast-food", "🥖", [["Pain local", 1], ["Viande hachée", 0.07], OIGNON(0.005), MAYO(0.01), ALU]),
];

// Ajoute les recettes proposées qui manquent (jamais par-dessus une recette faite par le patron),
// et met à jour celles qui sont encore « proposées » quand la liste change de version.
// Renvoie la nouvelle liste, ou null s'il n'y a rien à faire.
export function ajouterRecettesCarte(recipes, ingredients) {
  if (!Array.isArray(recipes) || !Array.isArray(ingredients)) return null;
  if (recipes.some((x) => x && x.carteV >= VERSION_CARTE)) return null;
  const parId = new Map(RECETTES_CARTE.map((f) => [f.id, f]));
  let change = false;
  const majs = recipes.map((r) => {
    const f = r && r.proposee && typeof r.id === "string" && parId.get(r.id.slice(3));
    if (!f) return r;
    const ings = lignes(ingredients, f.garn);
    if (!ings.length) return r;
    change = true;
    return { ...r, ingredients: ings, carteV: VERSION_CARTE };
  });
  const ajouts = RECETTES_CARTE
    .filter((f) => !trouverRecette({ id: f.id, nom: f.nom }, majs))
    .map((f) => ({ id: "rf_" + f.id, emoji: f.emoji, name: f.nom, category: f.categorie, snackId: "", ingredients: lignes(ingredients, f.garn), carteV: VERSION_CARTE, proposee: true }))
    .filter((r) => r.ingredients.length);
  if (!ajouts.length && !change) return null;
  return [...majs, ...ajouts];
}
