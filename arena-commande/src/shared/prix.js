// Calcul des prix, partagé entre le site client et la caisse.
// La caisse recalcule toujours le total avec le menu à jour : le prix
// envoyé par le téléphone n'est jamais pris pour argent comptant.

export const estBoisson = (a) => a && a.categorie === "boissons";

// choix = { formule: bool, boissonId, fromage: bool, sauce }
export function prixUnitaire(menu, article, choix = {}) {
  if (!article) return null;
  if (estBoisson(article)) return article.prix;
  const o = menu.options;
  let p = article.prixFormule;
  if (choix.formule) {
    const b = o.boissonsFormule.find((x) => x.id === choix.boissonId);
    if (!b) return null;
    p += b.sup;
  } else {
    p -= o.remiseSansBoisson;
  }
  if (article.omelette && choix.fromage) p += o.supplementFromage;
  return p;
}

export function nomLigne(menu, article, choix = {}) {
  if (!article) return "?";
  if (estBoisson(article)) return article.nom;
  let n = article.nom;
  if (article.omelette && choix.fromage) n += " Fromage";
  if (choix.formule) {
    const b = menu.options.boissonsFormule.find((x) => x.id === choix.boissonId);
    n += " + " + (b ? b.nom : "boisson");
  } else {
    n += " (seul)";
  }
  if (article.omelette && choix.sauce) n += " · " + choix.sauce;
  return n;
}

// Construit une ligne de commande (format stocké dans Firestore).
export function faireLigne(menu, article, choix, qte) {
  const formule = !estBoisson(article) && !!choix.formule;
  return {
    articleId: article.id,
    nom: nomLigne(menu, article, choix),
    formule,
    boissonId: formule ? choix.boissonId : "",
    fromage: !!(article.omelette && choix.fromage),
    sauce: article.omelette ? choix.sauce || "" : "",
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
