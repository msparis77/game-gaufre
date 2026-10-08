// Recettes des crêpes et gaufres d'après les fiches techniques Arena Café (2026-10-08).
// Quantités pour UNE portion. Pâte à crêpes : fournée de 1 kg de farine = 45 crêpes.
// Pâte à gaufres : recette de base (250 g de farine) = 22 gaufres.
// Les ingrédients sont donnés par nom et retrouvés dans Stocks → Ingrédients au chargement.
export const VERSION_RECETTES = 1;

const r = (x, n) => Math.round((x / n) * 100000) / 100000;

export const PATE_CREPE = [
  ["Farine", r(1, 45)], ["Lait demi-écrémé", r(1.5, 45)], ["Oeufs", r(12, 45)], ["Margarine", r(0.1, 45)],
  ["Huile tournesol", r(0.05, 45)], ["Sucre", r(0.02, 45)], ["Sel", r(0.01, 45)],
];
export const PATE_GAUFRE = [
  ["Farine", r(0.25, 22)], ["Maïzena", r(0.05, 22)], ["Oeufs", r(2, 22)], ["Sucre", r(0.065, 22)], ["Margarine", r(0.09, 22)],
  ["Lait entier", r(0.25, 22)], ["Eau gazeuse", r(0.05, 22)], ["Levure", r(0.01, 22)], ["Sucre vanillé", r(1, 22)], ["Sel", r(0.002, 22)],
];

// Garnitures (à ajuster quand les plats seront calibrés en cuisine).
const NUT = ["Nutella", 0.04];
const BAN = ["Banane", 0.075];
const CHANT = [["Crème liquide", 0.034], ["Sucre", 0.006]]; // 40 g de chantilly maison (1 L crème + 175 g sucre)
const FROM = ["Fromage", 0.03];
const OEUF = ["Oeufs", 1];

const C = (id, nom, categorie, emoji, prixVente, garn) => ({ id, nom, categorie, emoji, prixVente, pate: PATE_CREPE, garn });
const G = (id, nom, emoji, prixVente, garn) => ({ id, nom, categorie: "Gaufres", emoji, prixVente, pate: PATE_GAUFRE, garn });

export const RECETTES_FICHES = [
  C("c_crepe_sucre", "Crêpe sucre", "Crêpes", "🥞", 1000, [["Sucre", 0.01]]),
  C("c_crepe_nutella", "Crêpe Nutella", "Crêpes", "🥞", 1500, [NUT]),
  C("c_crepe_nutella_chantilly", "Crêpe Nutella chantilly", "Crêpes", "🥞", 1800, [NUT, ...CHANT]),
  C("c_crepe_nutella_banane", "Crêpe Nutella banane", "Crêpes", "🥞", 2000, [NUT, BAN]),
  C("c_crepe_nutella_banane_chantilly", "Crêpe Nutella banane chantilly", "Crêpes", "🥞", 2500, [NUT, BAN, ...CHANT]),
  C("c_crepe_lait_concentre", "Crêpe lait concentré", "Crêpes", "🥞", 1000, [["Lait concentré sucré", 0.03]]),
  G("c_gaufre_sucre", "Gaufre sucre", "🧇", 1000, [["Sucre", 0.01]]),
  G("c_gaufre_nutella", "Gaufre Nutella", "🧇", 1500, [NUT]),
  G("c_gaufre_nutella_chantilly", "Gaufre Nutella chantilly", "🧇", 1800, [NUT, ...CHANT]),
  G("c_gaufre_nutella_banane", "Gaufre Nutella banane", "🧇", 2000, [NUT, BAN]),
  G("c_gaufre_nutella_banane_chantilly", "Gaufre Nutella banane chantilly", "🧇", 2500, [NUT, BAN, ...CHANT]),
  C("c_crepe_jambon", "Crêpe jambon fromage", "Crêpes salées", "🥓", 2000, [["Jambon de bœuf", 0.04], FROM]),
  C("c_crepe_jambon_oeuf", "Crêpe jambon fromage œuf", "Crêpes salées", "🥓", 2500, [["Jambon de bœuf", 0.04], FROM, OEUF]),
  C("c_crepe_thon", "Crêpe thon fromage", "Crêpes salées", "🐟", 2000, [["Thon", 0.06], FROM]),
  C("c_crepe_thon_oeuf", "Crêpe thon fromage œuf", "Crêpes salées", "🐟", 2500, [["Thon", 0.06], FROM, OEUF]),
  C("c_crepe_poulet", "Crêpe poulet fromage", "Crêpes salées", "🍗", 2000, [["Poulet", 0.06], FROM]),
  C("c_crepe_poulet_oeuf", "Crêpe poulet fromage œuf", "Crêpes salées", "🍗", 2500, [["Poulet", 0.06], FROM, OEUF]),
  C("c_crepe_viande", "Crêpe viande hachée fromage", "Crêpes salées", "🥩", 2500, [["Viande hachée", 0.06], FROM]),
  C("c_crepe_viande_oeuf", "Crêpe viande hachée fromage œuf", "Crêpes salées", "🥩", 3000, [["Viande hachée", 0.06], FROM, OEUF]),
  C("c_crepe_saucisson", "Crêpe saucisson fromage", "Crêpes salées", "🌭", 2500, [["Saucisson", 0.04], FROM]),
  C("c_crepe_saucisson_oeuf", "Crêpe saucisson fromage œuf", "Crêpes salées", "🌭", 3000, [["Saucisson", 0.04], FROM, OEUF]),
];

// Autres noms possibles d'un même ingrédient dans la caisse.
const ALIAS = {
  Oeufs: ["Œufs", "Oeuf", "Œuf"], Nutella: ["Chocopain"], Fromage: ["Emmental", "Emmental râpé"], Levure: ["Levure chimique"],
  "Lait demi-écrémé": ["Lait liquide", "Lait Candia"], "Huile tournesol": ["Huile"], "Crème liquide": ["Crème", "Crème chantilly", "Chantilly"],
  "Lait concentré sucré": ["Lait concentré"], "Jambon de bœuf": ["Jambon"], Margarine: ["Beurre"], "Lait entier": ["Lait demi-écrémé"],
};

const cle = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/[^a-z0-9]/g, "");

const trouverIng = (ingredients, nom) => {
  for (const n of [nom, ...(ALIAS[nom] || [])]) {
    const i = ingredients.find((x) => x && cle(x.name) === cle(n));
    if (i) return i;
  }
  return null;
};

// Additionne les lignes (la pâte et la garniture peuvent partager un ingrédient, ex. sucre ou œufs).
const lignes = (ingredients, liste) => {
  const out = [];
  liste.forEach(([nom, qty]) => {
    const ing = trouverIng(ingredients, nom);
    if (!ing) return;
    const ex = out.find((l) => l.id === ing.id);
    if (ex) ex.qty = Math.round((ex.qty + qty) * 100000) / 100000;
    else out.push({ id: ing.id, qty });
  });
  return out;
};

const estAnciennePateCrepe = (rec, ingredients) => {
  const nomDe = (id) => cle((ingredients.find((i) => i.id === id) || {}).name);
  const noms = (rec.ingredients || []).map((ri) => nomDe(ri.id));
  return noms.includes("farine") && noms.includes("laitpoudre") && !noms.includes("levure");
};

// Coût d'une portion et prix manquants (ingrédient à 0 F).
export function coutRecette(rec, ingredients) {
  let cout = 0;
  const manquants = [];
  (rec.ingredients || []).forEach((ri) => {
    const ing = ingredients.find((i) => i.id === ri.id);
    if (!ing) return;
    if (!ing.unitCost) manquants.push(ing.name);
    cout += ri.qty * (ing.unitCost || 0);
  });
  return { cout: Math.round(cout), manquants };
}

// Met à jour les recettes une seule fois : remplace celles qui ont le même nom, ajoute les autres,
// remet la nouvelle pâte dans les anciennes recettes de crêpes et corrige Bœuf-Fromage (poulet → bœuf).
// Renvoie la nouvelle liste, ou null s'il n'y a rien à faire.
export function completerRecettes(recipes, ingredients) {
  if (!Array.isArray(recipes) || !Array.isArray(ingredients)) return null;
  if (recipes.some((x) => (x && x.recV) >= VERSION_RECETTES)) return null;
  const parNom = new Map(RECETTES_FICHES.map((f) => [cle(f.nom), f]));
  const utilisees = new Set();
  const pateCrepe = lignes(ingredients, PATE_CREPE);
  const vieuxIds = new Set(["Farine", "Lait poudre", "Beurre", "Oeufs"].map((n) => (trouverIng(ingredients, n) || {}).id).filter(Boolean));
  const poulet = trouverIng(ingredients, "Poulet");
  const boeuf = trouverIng(ingredients, "Boeuf");

  const majs = recipes.map((rec) => {
    const f = parNom.get(cle(rec.name));
    if (f) {
      utilisees.add(f.id);
      return { ...rec, ingredients: lignes(ingredients, [...f.pate, ...f.garn]), prixVente: f.prixVente, recV: VERSION_RECETTES };
    }
    if (!estAnciennePateCrepe(rec, ingredients)) return rec;
    let ings = [...pateCrepe.map((l) => ({ ...l })), ...rec.ingredients.filter((ri) => !vieuxIds.has(ri.id))];
    if (/b(oe|œ)uf/i.test(rec.name) && poulet && boeuf) ings = ings.map((ri) => (ri.id === poulet.id ? { ...ri, id: boeuf.id, qty: 0.06 } : ri));
    else if (poulet) ings = ings.map((ri) => (ri.id === poulet.id ? { ...ri, qty: 0.06 } : ri));
    return { ...rec, ingredients: ings, recV: VERSION_RECETTES };
  });

  const ajouts = RECETTES_FICHES.filter((f) => !utilisees.has(f.id)).map((f) => ({
    id: "rf_" + f.id,
    emoji: f.emoji,
    name: f.nom,
    category: f.categorie,
    snackId: "",
    ingredients: lignes(ingredients, [...f.pate, ...f.garn]),
    prixVente: f.prixVente,
    recV: VERSION_RECETTES,
  }));
  return [...majs, ...ajouts];
}
