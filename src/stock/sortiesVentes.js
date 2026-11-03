// Sorties de stock automatiques : chaque vente d'un produit de la carte (ligne "menu:…")
// retire du stock les ingrédients de sa recette (Coûts / Recettes), multipliés par la quantité vendue.
// - Boisson revendue telle quelle (Coca, Presséa…) : 1 bouteille.
// - Formule : ses éléments (crêpe + jus choisi, boisson choisie…).
// - Accompagnements choisis (poulet) et jus choisi : leur recette s'ils en ont une.
// Les quantités des recettes sont déjà dans l'unité d'achat de l'ingrédient (kg, L, pièce).
import { REVENTE, FORMULES, trouverRecette, trouverIngParNoms } from "./coutRevient.js";

const cle = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");

// "menu:c_crepe_nutella|f_b_coca|fromage|sauce|pain|jus|acc1+acc2" → morceaux
export function lireLigneMenu(id) {
  if (typeof id !== "string" || !id.startsWith("menu:")) return null;
  const p = id.slice(5).split("|");
  return {
    articleId: p[0],
    boissonId: p[1] && p[1].startsWith("f_") ? p[1].slice(2) : "",
    jus: p[5] || "",
    accomps: p[6] ? p[6].split("+").filter(Boolean) : [],
  };
}

// Ajoute dans `total` (Map idIngrédient → quantité) ce que consomme une portion de l'article.
// Renvoie true si l'article est relié au stock (recette ou bouteille connue).
function ajouterArticle(total, a, n, ctx, profondeur = 0) {
  if (!a || profondeur > 3) return false;
  const r = REVENTE[a.id];
  if (r) {
    const ing = trouverIngParNoms(ctx.ingredients, r);
    if (!ing) return false;
    total.set(ing.id, (total.get(ing.id) || 0) + n);
    return true;
  }
  const f = FORMULES[a.id];
  if (f) {
    let ok = false;
    f.forEach((el) => {
      if (el === "jus local") return; // remplacé par le jus choisi
      ok = ajouterArticle(total, ctx.parId.get(el), n, ctx, profondeur + 1) || ok;
    });
    return ok;
  }
  const rec = trouverRecette(a, ctx.recipes);
  if (rec) {
    (rec.ingredients || []).forEach((ri) => {
      if (!ri || !ri.id || !ri.qty) return;
      total.set(ri.id, (total.get(ri.id) || 0) + ri.qty * n);
    });
    return true;
  }
  // Boisson sans recette mais achetée telle quelle sous le même nom (ex. Eau en bouteille).
  if (a.categorie === "boissons") {
    const ing = ctx.ingredients.find((i) => i && i.unit === "pcs" && cle(i.name) === cle(a.nom));
    if (ing) { total.set(ing.id, (total.get(ing.id) || 0) + n); return true; }
  }
  return false;
}

// Un élément choisi par son nom (jus, accompagnement) : article du menu ou recette du même nom.
function ajouterParNom(total, nom, n, ctx) {
  const a = ctx.parNom.get(cle(nom));
  if (a) return ajouterArticle(total, a, n, ctx, 1);
  return ajouterArticle(total, { id: "", nom }, n, ctx, 1);
}

// sales : ventes du jour. Renvoie { parIng: Map, nonRelies: [{nom, qte}] }.
export function sortiesVentesMenu(sales, menu, ingredients, recipes) {
  const articles = (menu && menu.articles) || [];
  const ctx = {
    ingredients: ingredients || [],
    recipes: recipes || [],
    parId: new Map(articles.map((a) => [a.id, a])),
    parNom: new Map(articles.map((a) => [cle(a.nom), a])),
  };
  const parIng = new Map();
  const manque = new Map();
  (sales || []).forEach((sale) => (sale.items || []).forEach((item) => {
    const l = lireLigneMenu(item.id);
    if (!l) return;
    const n = Number(item.qty) || 0;
    if (!n) return;
    const a = ctx.parId.get(l.articleId);
    let ok = ajouterArticle(parIng, a, n, ctx);
    if (l.boissonId) ajouterArticle(parIng, ctx.parId.get("b_" + l.boissonId) || ctx.parId.get(l.boissonId), n, ctx, 1);
    if (l.jus) ajouterParNom(parIng, l.jus, n, ctx);
    l.accomps.forEach((x) => { ok = ajouterParNom(parIng, x, n, ctx) || ok; });
    if (!ok) {
      const nom = (a && a.nom) || item.name || l.articleId;
      manque.set(nom, (manque.get(nom) || 0) + n);
    }
  }));
  return { parIng, nonRelies: [...manque].map(([nom, qte]) => ({ nom, qte })).sort((x, y) => y.qte - x.qte) };
}

// Classement des produits vendus (carte + anciens produits), toutes lignes confondues.
export function topVentes(sales, nb = 5) {
  const m = new Map();
  (sales || []).forEach((sale) => (sale.items || []).forEach((item) => {
    if (item.cat === "gaming") return;
    const l = lireLigneMenu(item.id);
    const k = l ? l.articleId : item.id;
    const nom = String(item.name || "").replace(/\s*\(.*\)\s*$/, "") || k;
    const p = m.get(k) || { id: k, name: nom, emoji: item.emoji || "", sold: 0 };
    p.sold += Number(item.qty) || 0;
    m.set(k, p);
  }));
  return [...m.values()].filter((p) => p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, nb);
}
