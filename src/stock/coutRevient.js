// Coût de revient de chaque article du menu (config/menu) : prix de vente, coût, marge.
// - Boissons revendues telles quelles : le coût est le prix d'achat de la bouteille (Stocks → Ingrédients).
// - Plats avec une recette (Recettes) : le coût est celui de la recette, pour une portion.
// - Formules : addition de leurs éléments.
// - Le reste : « recette à faire ».
import { coutRecette } from "./recettesFiches.js";

const cle = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");

// Article du menu → nom de l'ingrédient acheté (et revendu tel quel).
export const REVENTE = {
  b_coca: ["Coca", "Coca-Cola"],
  b_fanta: ["Fanta"],
  b_sprite: ["Sprite"],
  b_pressea_ananas_coco: ["Jus Presséa", "Presséa"],
  b_pressea_goyave: ["Jus Presséa", "Presséa"],
  b_pressea_orange: ["Jus Presséa", "Presséa"],
};

// Formules : leurs éléments (ids d'articles du menu, ou libellé d'un élément sans coût connu).
export const FORMULES = {
  c_formule_crepe_nutella: ["c_crepe_nutella", "jus local"],
  c_formule_gaufre_nutella: ["c_gaufre_nutella", "jus local"],
  c_formule_beignets: ["c_beignets_nutella", "jus local"],
  c_formule_gaming: ["c_crepe_nutella", "jus local"],
};

export const prixVente = (a) => (typeof a.prix === "number" ? a.prix : typeof a.prixFormule === "number" ? a.prixFormule : 0);

const trouverIng = (ingredients, noms) => {
  for (const n of noms) {
    const i = ingredients.find((x) => x && cle(x.name) === cle(n));
    if (i) return i;
  }
  return null;
};

// Coût d'un article seul : { cout, source, manque[] } ; cout = null si rien n'est connu.
function coutSimple(a, ingredients, recipes) {
  const r = REVENTE[a.id];
  if (r) {
    const ing = trouverIng(ingredients, r);
    if (!ing || !ing.unitCost) return { cout: null, source: "achat", manque: ["prix d'achat " + r[0]] };
    return { cout: Math.round(ing.unitCost), source: "achat", manque: [] };
  }
  const rec = recipes.find((x) => x && (x.id === "rf_" + a.id || cle(x.name) === cle(a.nom)));
  if (!rec) return { cout: null, source: "recette", manque: ["recette"] };
  const c = coutRecette(rec, ingredients);
  return { cout: c.cout, source: "recette", manque: c.manquants.map((m) => "prix " + m) };
}

// Ligne complète pour un article du menu.
export function coutArticle(a, articles, ingredients, recipes) {
  const vente = prixVente(a);
  let res;
  const f = FORMULES[a.id];
  if (f) {
    let cout = 0;
    let connu = false;
    const manque = [];
    f.forEach((el) => {
      const art = articles.find((x) => x.id === el);
      if (!art) { manque.push(el); return; }
      const c = coutSimple(art, ingredients, recipes);
      if (c.cout != null) { cout += c.cout; connu = true; }
      manque.push(...c.manque.map((m) => art.nom + " : " + m));
    });
    if (a.id === "c_formule_gaming") manque.push("1 h de PlayStation (pas de coût d'achat)");
    res = { cout: connu ? cout : null, source: "formule", manque };
  } else res = coutSimple(a, ingredients, recipes);
  const marge = res.cout != null ? vente - res.cout : null;
  const pct = res.cout != null && vente ? Math.round((res.cout / vente) * 100) : null;
  const etat = res.cout == null ? "a_faire" : res.manque.length ? "partiel" : "ok";
  return { id: a.id, nom: a.nom, emoji: a.emoji, categorie: a.categorie, vente, ...res, marge, pct, etat };
}

export function tableauCouts(menu, ingredients, recipes) {
  const articles = (menu && menu.articles) || [];
  return articles.filter((a) => a.dispo !== false).map((a) => coutArticle(a, articles, ingredients || [], recipes || []));
}
