// Boissons rangées par famille (cafés, thés, jus…), avec une icône par famille.
// Une boisson peut porter sa famille (champ `famille`, ex. « jus_locaux ») ;
// sinon la famille se déduit du nom : un nouveau jus ajouté dans la caisse se range tout seul avec les jus.

const FAMILLES = [
  { id: "cafes", nom: "Cafés & chocolat", icone: "☕", test: /caf[eé]|touba/ },
  { id: "thes", nom: "Thés & infusions", icone: "🍵", test: /(^|\s)th[eé]s?(\s|$)|attaya|wahss/ },
  { id: "chocolats", nom: "Chocolats chauds", icone: "☕", test: /chocolat/ },
  { id: "gourmand", nom: "Gourmand", icone: "🍨" },
  { id: "jus_locaux", nom: "Jus locaux", icone: "🌺" },
  { id: "jus_pressea", nom: "Jus Presséa", icone: "🍊" },
  { id: "jus", nom: "Jus", icone: "🧃", test: /(^|\s)jus(\s|$)/ },
  { id: "sodas", nom: "Sodas & énergie", icone: "🥤" },
];
const ORDRE = ["cafes", "thes", "chocolats", "gourmand", "jus_locaux", "jus_pressea", "jus", "sodas", "autres"];
const AUTRES = { id: "autres", nom: "Autres boissons", icone: "🥤" };

export function familleBoisson(article) {
  const choisie = article.famille && FAMILLES.find((f) => f.id === article.famille);
  if (choisie) return choisie;
  const nom = (article.nom || "").toLowerCase();
  return FAMILLES.find((f) => f.test && f.test.test(nom)) || AUTRES;
}

// Icône affichée : celle de la boisson quand elle a sa famille ou qu'elle est
// rangée dans « autres », sinon celle de la famille.
export function iconeBoisson(article) {
  const f = familleBoisson(article);
  return (article.famille || f.id === "autres") && article.emoji ? article.emoji : f.icone;
}

// [{ famille, articles }] dans l'ordre cafés, thés, chocolats, gourmand, jus, sodas, autres.
export function boissonsParFamille(articles) {
  const groupes = {};
  for (const a of articles) (groupes[familleBoisson(a).id] ||= []).push(a);
  return ORDRE.filter((id) => groupes[id]).map((id) => ({
    famille: FAMILLES.find((f) => f.id === id) || AUTRES,
    articles: groupes[id],
  }));
}
