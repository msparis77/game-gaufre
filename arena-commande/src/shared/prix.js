// Calcul des prix, partagé entre le site client et la caisse.
// La caisse recalcule toujours le total avec le menu à jour : le prix
// envoyé par le téléphone n'est jamais pris pour argent comptant.

export const estBoisson = (a) => a && a.categorie === "boissons";
// Article à prix unique (boissons, crêpes, gaufres, glaces…) : champ `prix`, pas de formule.
export const prixSimple = (a) => !!a && a.prixFormule == null && typeof a.prix === "number";
// Choix du pain (baguette / pain local brioché) : tous les sandwichs sauf ceux marqués sansChoixPain
export const painsDuMenu = (menu) => (menu && menu.options && menu.options.pains) || [];
export const aChoixPain = (menu, a) => !!a && !prixSimple(a) && !a.sansChoixPain && painsDuMenu(menu).length > 0;

// Formules crêpe/gaufre : jus local au choix (les jus locaux disponibles du menu)
export const aChoixJus = (a) => !!a && !!a.choixJus;
export const jusDuMenu = (menu) => ((menu && menu.articles) || []).filter((a) => a.famille === "jus_locaux" && a.dispo !== false).map((a) => a.nom);

// Formules poulet : `accompagnements` = nombre d'accompagnements à choisir (options.accompagnements)
export const nbAccomps = (a) => (a && a.accompagnements) || 0;
export const accompsDuMenu = (menu) => (menu && menu.options && menu.options.accompagnements) || [];
// Supplément du pain choisi (ex. pain local +50), 0 pour la baguette
export const supPain = (menu, pain) => ((menu && menu.options && menu.options.supplementsPain) || {})[pain] || 0;

// choix = { formule: bool, boissonId, fromage: bool, sauce, pain, jus, accomps: [] }
export function prixUnitaire(menu, article, choix = {}) {
  if (!article) return null;
  if (prixSimple(article)) return article.prix;
  const o = menu.options;
  let p = article.prixFormule;
  if (choix.formule) {
    const b = o.boissonsFormule.find((x) => x.id === choix.boissonId);
    if (!b) return null;
    p += b.sup;
  } else {
    p -= o.remiseSansBoisson;
  }
  // Fromage possible sur tous les sandwichs (+300)
  if (choix.fromage) p += o.supplementFromage;
  if (aChoixPain(menu, article) && choix.pain) p += supPain(menu, choix.pain);
  return p;
}

export function nomLigne(menu, article, choix = {}) {
  if (!article) return "?";
  if (prixSimple(article)) {
    if (nbAccomps(article)) return article.nom + " · " + ((choix.accomps || []).join(", ") || "accompagnement ?");
    if (!aChoixJus(article)) return article.nom;
    const jus = choix.jus || "jus ?";
    return /jus local$/i.test(article.nom) ? article.nom.replace(/jus local$/i, jus) : article.nom + " · " + jus;
  }
  // « Formule » en tête, pour que le client, la caisse et la cuisine le voient tout de suite
  let n = (choix.formule ? "Formule " : "") + article.nom;
  if (choix.fromage) n += " Fromage";
  if (choix.formule) {
    const b = menu.options.boissonsFormule.find((x) => x.id === choix.boissonId);
    n += " + " + (b ? b.nom : "boisson");
  } else {
    n += " (seul)";
  }
  if (article.omelette && choix.sauce) n += " · " + choix.sauce;
  if (aChoixPain(menu, article) && choix.pain) n += " · " + choix.pain;
  return n;
}

// Construit une ligne de commande (format stocké dans Firestore).
export function faireLigne(menu, article, choix, qte) {
  const formule = !prixSimple(article) && !!choix.formule;
  return {
    articleId: article.id,
    nom: nomLigne(menu, article, choix),
    formule,
    boissonId: formule ? choix.boissonId : "",
    fromage: !prixSimple(article) && !!choix.fromage,
    sauce: article.omelette ? choix.sauce || "" : "",
    pain: aChoixPain(menu, article) ? choix.pain || "" : "",
    jus: aChoixJus(article) ? choix.jus || "" : "",
    accomps: nbAccomps(article) ? (choix.accomps || []).slice(0, nbAccomps(article)) : [],
    qte,
    prixUnitaire: prixUnitaire(menu, article, choix),
  };
}

// Recalcule une commande avec le menu actuel. Renvoie les lignes corrigées,
// le total vérifié et `ecart` (true si le total du téléphone diffère).
export function verifierCommande(menu, commande) {
  let total = 0;
  const lignes = (commande.lignes || []).map((l) => {
    const art = menu.articles.find((a) => a.id === l.articleId);
    const pu = art ? prixUnitaire(menu, art, l) : null;
    const prix = pu == null ? l.prixUnitaire : pu;
    total += prix * l.qte;
    return { ...l, prixUnitaire: prix, inconnu: pu == null };
  });
  return { lignes, total, ecart: total !== commande.total };
}

export const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ") + " F";
