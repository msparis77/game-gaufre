// Menu de départ (petit-déjeuner 7h-10h30), prix en FCFA.
// Il est copié une seule fois dans Firestore (config/menu) depuis la caisse,
// puis modifié uniquement depuis la caisse. Ce fichier ne sert plus ensuite.

export const MENU_DEPART = {
  version: 1,
  horaires: { debut: "07:00", fin: "10:30" },
  categories: [
    { id: "sandwichs", nom: "Sandwichs", emoji: "🥖" },
    { id: "omelettes", nom: "Sandwichs omelette", emoji: "🍳" },
    { id: "boissons", nom: "Boissons", emoji: "☕" },
  ],
  options: {
    // Sandwich seul = prix formule - remiseSansBoisson
    remiseSansBoisson: 50,
    // Version fromage des omelettes
    supplementFromage: 300,
    // Boisson comprise dans la formule (sup = supplément)
    boissonsFormule: [
      { id: "touba", nom: "Café Touba (petit)", sup: 0 },
      { id: "the", nom: "Thé (petit)", sup: 0 },
      { id: "maxi_touba", nom: "Maxi café Touba", sup: 150 },
      { id: "maxi_the", nom: "Maxi thé", sup: 150 },
      { id: "jus_orange", nom: "Jus d'orange", sup: 150 },
      { id: "cafe_lait", nom: "Café au lait", sup: 250 },
      { id: "choco_lait", nom: "Chocolat au lait", sup: 250 },
    ],
    sauces: ["Mayo", "Ketchup", "Sauce piquante"],
  },
  articles: [
    { id: "essentiel", categorie: "sandwichs", nom: "Sandwich Essentiel", nomWolof: "Ñebbe", description: "Niébé mijoté, oignons, sauce maison", prixFormule: 500, omelette: false, emoji: "🫘", photo: "", dispo: true },
    { id: "gourmand", categorie: "sandwichs", nom: "Sandwich Gourmand", nomWolof: "Neex", description: "Beurre, pâte chocolat-noisette", prixFormule: 700, omelette: false, emoji: "🍫", photo: "", dispo: true },
    { id: "ocean", categorie: "sandwichs", nom: "Sandwich Océan", nomWolof: "Géej", description: "Thon, pommes de terre, oignons, mayo", prixFormule: 850, omelette: false, emoji: "🐟", photo: "", dispo: true },
    { id: "saucisson_pimentaise", categorie: "sandwichs", nom: "Sandwich Saucisson de bœuf pimentaise", nomWolof: "", description: "Saucisson de bœuf, pommes de terre, petits pois, poulet, sauce pimentée", prixFormule: 1150, omelette: false, emoji: "🌶️", photo: "", dispo: true },
    { id: "omelette_nature", categorie: "omelettes", nom: "Sandwich Omelette Nature", nomWolof: "", description: "Omelette, oignons", prixFormule: 850, omelette: true, emoji: "🍳", photo: "", dispo: true },
    { id: "omelette_pdt", categorie: "omelettes", nom: "Sandwich Omelette Pommes de terre", nomWolof: "", description: "Omelette, pommes de terre", prixFormule: 950, omelette: true, emoji: "🥔", photo: "", dispo: true },
    { id: "omelette_poulet", categorie: "omelettes", nom: "Sandwich Omelette Poulet", nomWolof: "", description: "Poulet, oignons, pommes de terre", prixFormule: 1100, omelette: true, emoji: "🍗", photo: "", dispo: true },
    { id: "omelette_saucisson", categorie: "omelettes", nom: "Sandwich Omelette Saucisson", nomWolof: "", description: "Saucisson de bœuf, oignons, pommes de terre", prixFormule: 1100, omelette: true, emoji: "🌭", photo: "", dispo: true },
    { id: "omelette_jambon", categorie: "omelettes", nom: "Sandwich Omelette Jambon", nomWolof: "", description: "Jambon de dinde, oignons", prixFormule: 1200, omelette: true, emoji: "🥓", photo: "", dispo: true },
    { id: "b_touba", categorie: "boissons", nom: "Café Touba", nomWolof: "", description: "", prix: 100, emoji: "☕", photo: "", dispo: true },
    { id: "b_maxi_touba", categorie: "boissons", nom: "Maxi café Touba", nomWolof: "", description: "", prix: 250, emoji: "☕", photo: "", dispo: true },
    { id: "b_the", categorie: "boissons", nom: "Thé", nomWolof: "", description: "", prix: 100, emoji: "🍵", photo: "", dispo: true },
    { id: "b_maxi_the", categorie: "boissons", nom: "Maxi thé", nomWolof: "", description: "", prix: 250, emoji: "🍵", photo: "", dispo: true },
    { id: "b_cafe_lait", categorie: "boissons", nom: "Café au lait", nomWolof: "", description: "", prix: 400, emoji: "☕", photo: "", dispo: true },
    { id: "b_choco_lait", categorie: "boissons", nom: "Chocolat au lait", nomWolof: "", description: "Chocolat chaud", prix: 400, emoji: "☕", photo: "", dispo: true },
    { id: "b_jus_orange", categorie: "boissons", nom: "Jus d'orange", nomWolof: "", description: "", prix: 300, emoji: "🍊", photo: "", dispo: true },
  ],
};

// Créneaux de retrait de départ (config/creneaux). `minutes` = heure du
// créneau en minutes depuis minuit, heure de Dakar (= UTC, pas d'heure d'été).
export const CRENEAUX_DEPART = {
  ouvert: true,
  delaiFermetureMin: 15,
  creneaux: {
    c0730: { code: "A", minutes: 7 * 60 + 30, max: 25, actif: true },
    c0800: { code: "B", minutes: 8 * 60, max: 25, actif: true },
    c0830: { code: "C", minutes: 8 * 60 + 30, max: 25, actif: true },
    c0900: { code: "D", minutes: 9 * 60, max: 25, actif: true },
    c0930: { code: "E", minutes: 9 * 60 + 30, max: 25, actif: true },
    c1000: { code: "F", minutes: 10 * 60, max: 25, actif: true },
  },
};

// Livraison : désactivée au départ. Le patron l'active et règle les zones
// dans la caisse (🌐 → 🛵 Livraison).
export const LIVRAISON_DEPART = {
  actif: false,
  minimum: 0,
  zones: {
    z1: { nom: "Guédiawaye", frais: 500, actif: true },
  },
  livreurs: [],
};
