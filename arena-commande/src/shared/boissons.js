// Boissons rangées par famille (cafés, thés, chocolats, jus…), avec une icône par famille.
// La famille se déduit du nom : un nouveau jus ajouté dans la caisse se range tout seul avec les jus.

const FAMILLES = [
  { id: "chocolats", nom: "Chocolats chauds", icone: "☕", test: /chocolat/ },
  { id: "cafes", nom: "Cafés", icone: "☕", test: /caf[eé]|touba/ },
  { id: "thes", nom: "Thés", icone: "🍵", test: /(^|\s)th[eé]s?(\s|$)/ },
  { id: "jus", nom: "Jus", icone: "🧃", test: /(^|\s)jus(\s|$)/ },
];
const ORDRE = ["cafes", "thes", "chocolats", "jus", "autres"];
const AUTRES = { id: "autres", nom: "Autres boissons", icone: "🥤" };

export function familleBoisson(article) {
  const nom = (article.nom || "").toLowerCase();
  return FAMILLES.find((f) => f.test.test(nom)) || AUTRES;
}

// Icône affichée : celle de la famille (sauf « autres », qui garde la sienne).
export function iconeBoisson(article) {
  const f = familleBoisson(article);
  return f.id === "autres" ? article.emoji || f.icone : f.icone;
}

// [{ famille, articles }] dans l'ordre cafés, thés, chocolats, jus, autres.
export function boissonsParFamille(articles) {
  const groupes = {};
  for (const a of articles) (groupes[familleBoisson(a).id] ||= []).push(a);
  return ORDRE.filter((id) => groupes[id]).map((id) => ({
    famille: FAMILLES.find((f) => f.id === id) || AUTRES,
    articles: groupes[id],
  }));
}
