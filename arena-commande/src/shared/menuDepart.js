// Menu de départ (petit-déjeuner 7h-10h30), prix en FCFA.
// Il est copié une seule fois dans Firestore (config/menu) depuis la caisse,
// puis modifié uniquement depuis la caisse. Ce fichier ne sert plus ensuite.

// Carte des boissons (affiche A3 d'octobre 2026), prix en FCFA.
// La caisse l'ajoute une seule fois au menu en ligne (migration v3 dans src/enligne/veille.js).
export const CARTE_BOISSONS = [
  { id: "b_touba", famille: "cafes", nom: "Café Touba", description: "Le café épicé sénégalais", prix: 100, emoji: "☕" },
  { id: "b_maxi_touba", famille: "cafes", nom: "Maxi café Touba", description: "Grand format", prix: 250, emoji: "☕" },
  { id: "b_cafe_citron", famille: "cafes", nom: "Café citron", description: "Café, citron", prix: 200, emoji: "🍋" },
  { id: "b_cafe_lait", famille: "cafes", nom: "Café au lait", description: "Café, lait chaud", prix: 400, emoji: "☕" },
  { id: "b_choco_lait", famille: "cafes", nom: "Chocolat au lait", description: "Chocolat chaud", prix: 500, emoji: "🍫" },
  { id: "b_the", famille: "thes", nom: "Thé", description: "Petit verre", prix: 100, emoji: "🍵" },
  { id: "b_maxi_the", famille: "thes", nom: "Maxi thé", description: "Grand format", prix: 250, emoji: "🍵" },
  { id: "b_attaya", famille: "thes", nom: "Attaya", description: "Thé vert à la menthe, à la sénégalaise", prix: 100, emoji: "🫖" },
  { id: "b_wahss_gingembre", famille: "thes", nom: "Wahss gingembre", description: "Gingembre, citron, menthe", prix: 200, emoji: "🍋" },
  { id: "b_wahss_bouye", famille: "thes", nom: "Wahss bouye", description: "Au bouye (pain de singe)", prix: 250, emoji: "🌳" },
  { id: "b_cappuccino", famille: "gourmand", nom: "Cappuccino chantilly", description: "Café, lait mousseux, chantilly", prix: 1200, emoji: "☕" },
  { id: "b_cafe_frappe", famille: "gourmand", nom: "Café frappé", description: "Café glacé, chantilly", prix: 1200, emoji: "🧋" },
  { id: "b_lait_framboise", famille: "gourmand", nom: "Lait framboise frappé", description: "Lait framboise glacé, chantilly", prix: 1500, emoji: "🍓" },
  { id: "b_bissap", famille: "jus_locaux", nom: "Bissap", description: "Fleur d'hibiscus", prix: 300, emoji: "🌺" },
  { id: "b_bissap_blanc", famille: "jus_locaux", nom: "Bissap blanc", description: "Hibiscus blanc", prix: 300, emoji: "🌸" },
  { id: "b_tamarin", famille: "jus_locaux", nom: "Tamarin", description: "Dakhar", prix: 300, emoji: "🟤" },
  { id: "b_bouye", famille: "jus_locaux", nom: "Bouye", description: "Pain de singe (baobab)", prix: 300, emoji: "🌳" },
  { id: "b_jus_orange", famille: "jus_locaux", nom: "Jus d'orange", description: "Orange pressée", prix: 300, emoji: "🍊" },
  { id: "b_pressea_ananas_coco", famille: "jus_pressea", nom: "Presséa ananas coco", description: "Ananas, noix de coco", prix: 400, emoji: "🍍" },
  { id: "b_pressea_goyave", famille: "jus_pressea", nom: "Presséa goyave", description: "", prix: 400, emoji: "🍈" },
  { id: "b_pressea_orange", famille: "jus_pressea", nom: "Presséa orange", description: "", prix: 400, emoji: "🍊" },
  { id: "b_coca", famille: "sodas", nom: "Coca-Cola", description: "", prix: 500, emoji: "🥤" },
  { id: "b_fanta", famille: "sodas", nom: "Fanta", description: "", prix: 500, emoji: "🥤" },
  { id: "b_sprite", famille: "sodas", nom: "Sprite", description: "", prix: 500, emoji: "🥤" },
  { id: "b_energy", famille: "sodas", nom: "Cocktail energy drink", description: "", prix: 1000, emoji: "⚡" },
];

// Carte crêpes, gaufres, beignets et glaces (affiche A3 d'octobre 2026), prix unique en FCFA.
// La caisse l'ajoute une seule fois au menu en ligne (migration v6 dans src/enligne/veille.js).
// Catégories marquées prixUnique : pas de formule, pas de pain, ajout direct au panier.
export const CATEGORIES_CREPES = [
  { id: "formules_crepes", nom: "Formules sucrées", emoji: "🥤", prixUnique: true },
  { id: "crepes_sucrees", nom: "Crêpes sucrées", emoji: "🥞", prixUnique: true },
  { id: "gaufres", nom: "Gaufres", emoji: "🧇", prixUnique: true },
  { id: "crepes_salees", nom: "Crêpes salées", emoji: "🧀", prixUnique: true },
  { id: "douceurs", nom: "Beignets & glaces", emoji: "🍨", prixUnique: true },
];
export const CARTE_CREPES = [
  // choixJus : le client choisit son jus local (« jus local » dans le nom est remplacé par le jus choisi).
  { id: "c_formule_crepe_nutella", categorie: "formules_crepes", nom: "Formule crêpe Nutella + jus local", description: "Crêpe Nutella et un jus local au choix", prix: 1700, choixJus: true, emoji: "🍫" },
  { id: "c_formule_gaufre_nutella", categorie: "formules_crepes", nom: "Formule gaufre Nutella + jus local", description: "Gaufre Nutella et un jus local au choix", prix: 1700, choixJus: true, emoji: "🧇" },
  { id: "c_formule_beignets", categorie: "formules_crepes", nom: "Formule beignets + jus local", description: "Beignets bubble Nutella et un jus local au choix", prix: 800, choixJus: true, emoji: "🍩" },
  // caisseSeulement : vendu au café uniquement, pas sur le site des lycéens.
  { id: "c_formule_gaming", categorie: "formules_crepes", nom: "Formule gaming 1 h PS + crêpe Nutella + jus local", description: "1 heure de PlayStation, crêpe Nutella et un jus local au choix", prix: 3500, choixJus: true, caisseSeulement: true, emoji: "🎮" },
  { id: "c_crepe_sucre", categorie: "crepes_sucrees", nom: "Crêpe sucre", description: "", prix: 1000, emoji: "🍬" },
  { id: "c_crepe_nutella", categorie: "crepes_sucrees", nom: "Crêpe Nutella", description: "", prix: 1500, emoji: "🍫" },
  { id: "c_crepe_nutella_chantilly", categorie: "crepes_sucrees", nom: "Crêpe Nutella chantilly", description: "", prix: 1800, emoji: "🍦" },
  { id: "c_crepe_nutella_banane", categorie: "crepes_sucrees", nom: "Crêpe Nutella banane", description: "", prix: 2000, emoji: "🍌" },
  { id: "c_crepe_nutella_banane_chantilly", categorie: "crepes_sucrees", nom: "Crêpe Nutella banane chantilly", description: "", prix: 2500, emoji: "🍨" },
  { id: "c_crepe_lait_concentre", categorie: "crepes_sucrees", nom: "Crêpe lait concentré", description: "Lait concentré sucré", prix: 1000, emoji: "🥛" },
  { id: "c_gaufre_sucre", categorie: "gaufres", nom: "Gaufre sucre", description: "", prix: 1000, emoji: "🍬" },
  { id: "c_gaufre_nutella", categorie: "gaufres", nom: "Gaufre Nutella", description: "", prix: 1500, emoji: "🍫" },
  { id: "c_gaufre_nutella_chantilly", categorie: "gaufres", nom: "Gaufre Nutella chantilly", description: "", prix: 1800, emoji: "🍦" },
  { id: "c_gaufre_nutella_banane", categorie: "gaufres", nom: "Gaufre Nutella banane", description: "", prix: 2000, emoji: "🍌" },
  { id: "c_gaufre_nutella_banane_chantilly", categorie: "gaufres", nom: "Gaufre Nutella banane chantilly", description: "", prix: 2500, emoji: "🍨" },
  { id: "c_crepe_jambon", categorie: "crepes_salees", nom: "Crêpe jambon fromage", description: "Jambon, fromage", prix: 2000, emoji: "🥓" },
  { id: "c_crepe_jambon_oeuf", categorie: "crepes_salees", nom: "Crêpe jambon fromage œuf", description: "Jambon, fromage, œuf", prix: 2500, emoji: "🥓" },
  { id: "c_crepe_thon", categorie: "crepes_salees", nom: "Crêpe thon fromage", description: "Thon, fromage", prix: 2000, emoji: "🐟" },
  { id: "c_crepe_thon_oeuf", categorie: "crepes_salees", nom: "Crêpe thon fromage œuf", description: "Thon, fromage, œuf", prix: 2500, emoji: "🐟" },
  { id: "c_crepe_viande", categorie: "crepes_salees", nom: "Crêpe viande hachée fromage", description: "Viande hachée, fromage", prix: 2500, emoji: "🥩" },
  { id: "c_crepe_viande_oeuf", categorie: "crepes_salees", nom: "Crêpe viande hachée fromage œuf", description: "Viande hachée, fromage, œuf", prix: 3000, emoji: "🥩" },
  { id: "c_crepe_poulet", categorie: "crepes_salees", nom: "Crêpe poulet fromage", description: "Poulet, fromage", prix: 2000, emoji: "🍗" },
  { id: "c_crepe_poulet_oeuf", categorie: "crepes_salees", nom: "Crêpe poulet fromage œuf", description: "Poulet, fromage, œuf", prix: 2500, emoji: "🍗" },
  { id: "c_crepe_saucisson", categorie: "crepes_salees", nom: "Crêpe saucisson fromage", description: "Saucisson, fromage", prix: 2500, emoji: "🌭" },
  { id: "c_crepe_saucisson_oeuf", categorie: "crepes_salees", nom: "Crêpe saucisson fromage œuf", description: "Saucisson, fromage, œuf", prix: 3000, emoji: "🌭" },
  { id: "c_beignets_nutella", categorie: "douceurs", nom: "Beignets bubble Nutella", description: "", prix: 500, emoji: "🍩" },
  { id: "c_sorbet_bissap", categorie: "douceurs", nom: "Sorbet bissap chantilly", description: "Sorbet bissap, chantilly", prix: 500, emoji: "🌺" },
  { id: "c_sorbet_pasteque", categorie: "douceurs", nom: "Sorbet pastèque chantilly", description: "Sorbet pastèque, chantilly", prix: 500, emoji: "🍉" },
];

export const MENU_DEPART = {
  version: 7,
  horaires: { debut: "07:00", fin: "10:30" },
  categories: [
    { id: "sandwichs", nom: "Formules sandwich", emoji: "🥖" },
    { id: "omelettes", nom: "Formules omelette", emoji: "🍳" },
    ...CATEGORIES_CREPES,
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
      { id: "choco_lait", nom: "Chocolat au lait", sup: 350 },
    ],
    sauces: ["Mayo", "Ketchup", "Sauce piquante"],
    // Pain au choix pour chaque sandwich (sauf ceux marqués sansChoixPain, ex. Océan)
    pains: ["Baguette", "Pain local brioché"],
  },
  articles: [
    { id: "essentiel", categorie: "sandwichs", nom: "Sandwich Essentiel", nomWolof: "Ñebbe", description: "Haricots mijotés, oignons, sauce maison", prixFormule: 500, omelette: false, emoji: "🫘", photo: "", dispo: true },
    { id: "gourmand", categorie: "sandwichs", nom: "Sandwich Gourmand", nomWolof: "Neex", description: "Beurre, pâte chocolat-noisette", prixFormule: 700, omelette: false, emoji: "🍫", photo: "", dispo: true },
    { id: "ocean", categorie: "sandwichs", nom: "Sandwich Océan", nomWolof: "Géej", description: "Thon, pommes de terre, oignons, mayo", prixFormule: 850, omelette: false, sansChoixPain: true, emoji: "🐟", photo: "", dispo: true },
    { id: "saucisson_pimentaise", categorie: "sandwichs", nom: "Sandwich Saucisson de bœuf pimentaise", nomWolof: "", description: "Saucisson de bœuf, pommes de terre, petits pois, sauce pimentée", prixFormule: 1150, omelette: false, emoji: "🌶️", photo: "", dispo: true },
    { id: "omelette_nature", categorie: "omelettes", nom: "Sandwich Omelette Nature", nomWolof: "", description: "Omelette, oignons", prixFormule: 850, omelette: true, emoji: "🍳", photo: "", dispo: true },
    { id: "omelette_pdt", categorie: "omelettes", nom: "Sandwich Omelette Pommes de terre", nomWolof: "", description: "Omelette, pommes de terre", prixFormule: 950, omelette: true, emoji: "🥔", photo: "", dispo: true },
    { id: "omelette_poulet", categorie: "omelettes", nom: "Sandwich Œuf au plat Poulet", nomWolof: "", description: "Œuf au plat, poulet, oignons, pommes de terre", prixFormule: 1200, omelette: true, emoji: "🍗", photo: "", dispo: true },
    { id: "omelette_saucisson", categorie: "omelettes", nom: "Sandwich Omelette Saucisson", nomWolof: "", description: "Saucisson de bœuf, oignons, pommes de terre", prixFormule: 1200, omelette: true, emoji: "🌭", photo: "", dispo: true },
    { id: "omelette_jambon", categorie: "omelettes", nom: "Sandwich Omelette Jambon", nomWolof: "", description: "Jambon de dinde, oignons", prixFormule: 1200, omelette: true, emoji: "🥓", photo: "", dispo: true },
    ...CARTE_CREPES.map((c) => ({ ...c, nomWolof: "", photo: "", dispo: true })),
    ...CARTE_BOISSONS.map((b) => ({ ...b, categorie: "boissons", nomWolof: "", photo: "", dispo: true })),
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
};
// Livreurs (config/livreurs, lisible seulement par la caisse) : [{ nom, tel }]
