import React, { useState, useEffect, useCallback, useRef } from "react";


// ════════════════════════════════════════════════════
// FIREBASE REST API — données cloud permanentes
// ════════════════════════════════════════════════════
// Stockage via proxy Vercel → Firebase (même principe que l'IA)
const fbSave = async (key, data) => {
  try {
    await fetch('/api/store', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({key, data})
    })
  } catch(e) {}
}

const fbGet = async (key) => {
  try {
    const r = await fetch(`/api/store?key=${encodeURIComponent(key)}`)
    if (!r.ok) return null
    return await r.json()
  } catch(e) { return null }
}

const S={bg:"#0A0A0A",card:"#141414",card2:"#1C1C1C",card3:"#252525",gold:"#FFD600",green:"#00E676",red:"#FF5252",blue:"#00B0FF",orange:"#FF6D00",purple:"#BB86FC",teal:"#00BCD4",pink:"#FF4081",text:"#F5F5F5",muted:"#555",border:"#2a2a2a"};
const fmt=n=>Number(n||0).toLocaleString("fr-FR")+" F";
const fmtQ=(qty,unit)=>{if(unit==="kg"||unit==="L"){if(qty<0.001)return"0 "+unit;if(qty<1)return(qty*1000).toFixed(0)+" "+(unit==="kg"?"g":"ml");return qty.toFixed(3).replace(/\.?0+$/,"")+" "+unit;}return qty%1===0?qty+" "+unit:qty.toFixed(1)+" "+unit;};
const todayStr=()=>new Date().toISOString().split("T")[0];
const timeStr=()=>new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const uid=()=>`${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const DEFAULT_GOAL=150000;
const BILLETS=[10000,5000,2000,1000,500,200,100];
const CHECKLIST=["Stock ingrédients saisi","Production planifiée","Caisse vérifiée","Gaufrier préchauffé","Crêpier préchauffé","Monnaie prête"];
const STORES=[{id:"s1",name:"Game & Gaufre — Limamoulaye",emoji:"🏪"},{id:"s2",name:"Game & Gaufre — Guédiawaye 2",emoji:"🏬"},{id:"s3",name:"Game & Gaufre — Pikine",emoji:"🏢"}];

const INIT_EMPS=[{id:"patron",name:"Patron",pin:"1234",role:"patron"},{id:"e1",name:"Employé 1",pin:"0001",role:"employe"},{id:"e2",name:"Employé 2",pin:"0002",role:"employe"},{id:"e3",name:"Employé 3",pin:"0003",role:"employe"},{id:"e4",name:"Employé 4",pin:"0004",role:"employe"},{id:"e5",name:"Employé 5",pin:"0005",role:"employe"}];
const INIT_B=[
  {id:"b1",name:"Café",emoji:"☕",price:150,cat:"Chaud"},{id:"b2",name:"Café lait",emoji:"☕",price:200,cat:"Chaud"},{id:"b3",name:"Café Touba",emoji:"☕",price:150,cat:"Chaud"},
  {id:"b4",name:"Thé ataya",emoji:"🍵",price:150,cat:"Chaud"},{id:"b5",name:"Chocolat chaud",emoji:"🍫",price:250,cat:"Chaud"},{id:"b6",name:"Lait chaud",emoji:"🥛",price:200,cat:"Chaud"},
  {id:"b7",name:"Bissap",emoji:"🔴",price:300,cat:"Jus maison"},{id:"b8",name:"Gingembre",emoji:"🟡",price:300,cat:"Jus maison"},{id:"b9",name:"Bouye",emoji:"🤍",price:300,cat:"Jus maison"},
  {id:"b10",name:"Ditax",emoji:"🟣",price:300,cat:"Jus maison"},{id:"b11",name:"Tamarin",emoji:"🟤",price:300,cat:"Jus maison"},
  {id:"b13",name:"Coca-Cola",emoji:"🥤",price:500,cat:"Sodas"},{id:"b14",name:"Fanta Orange",emoji:"🍊",price:500,cat:"Sodas"},{id:"b15",name:"Fanta Citron",emoji:"🍋",price:500,cat:"Sodas"},
  {id:"b16",name:"Sprite",emoji:"💚",price:500,cat:"Sodas"},{id:"b17",name:"Gazelle",emoji:"🍺",price:500,cat:"Sodas"},{id:"b18",name:"Youki",emoji:"🥤",price:400,cat:"Sodas"},
  {id:"b19",name:"Malta",emoji:"🟫",price:500,cat:"Sodas"},{id:"b20",name:"Pamplemousse",emoji:"🍈",price:500,cat:"Sodas"},
  {id:"b21",name:"Eau minérale",emoji:"💧",price:200,cat:"Eau"},{id:"b22",name:"Eau fraîche",emoji:"🧊",price:100,cat:"Eau"},
];
const INIT_S=[
  {id:"s1",name:"Crêpe Sucre beurre",emoji:"🥞",price:500,cat:"Crêpes sucrées"},{id:"s2",name:"Crêpe Confiture",emoji:"🥞",price:600,cat:"Crêpes sucrées"},
  {id:"s3",name:"Crêpe Nutella",emoji:"🥞",price:800,cat:"Crêpes sucrées"},{id:"s4",name:"Crêpe Miel",emoji:"🍯",price:700,cat:"Crêpes sucrées"},
  {id:"s5",name:"Crêpe Chocolat",emoji:"🍫",price:800,cat:"Crêpes sucrées"},{id:"s6",name:"Crêpe Banane Nutella",emoji:"🍌",price:1000,cat:"Crêpes sucrées"},
  {id:"s7",name:"Crêpe Poulet Fromage",emoji:"🍗",price:1500,cat:"Crêpes salées"},{id:"s8",name:"Crêpe Thon Fromage",emoji:"🐟",price:1500,cat:"Crêpes salées"},
  {id:"s9",name:"Crêpe Bœuf Fromage",emoji:"🥩",price:2000,cat:"Crêpes salées"},{id:"s10",name:"Crêpe Œuf Fromage",emoji:"🥚",price:1200,cat:"Crêpes salées"},
  {id:"s11",name:"Gaufre Sucre glace",emoji:"🧇",price:500,cat:"Gaufres"},{id:"s12",name:"Gaufre Nutella",emoji:"🧇",price:1000,cat:"Gaufres"},
  {id:"s13",name:"Gaufre Confiture",emoji:"🧇",price:700,cat:"Gaufres"},{id:"s14",name:"Gaufre Miel",emoji:"🍯",price:800,cat:"Gaufres"},
  {id:"s15",name:"Sandwich Poulet Mayo",emoji:"🥪",price:1000,cat:"Sandwichs"},{id:"s16",name:"Sandwich Thon Mayo",emoji:"🥪",price:1000,cat:"Sandwichs"},
  {id:"s17",name:"Sandwich Œuf Mayo",emoji:"🥚",price:800,cat:"Sandwichs"},{id:"s18",name:"Sandwich Poulet Ketchup",emoji:"🍗",price:1000,cat:"Sandwichs"},
  {id:"s19",name:"Sandwich Bœuf",emoji:"🥩",price:1500,cat:"Sandwichs"},{id:"s20",name:"Sandwich Frites Poulet",emoji:"🍟",price:1500,cat:"Sandwichs"},
  {id:"s21",name:"Formule Gaufre + Café",emoji:"⭐",price:1000,cat:"Formules"},{id:"s22",name:"Formule Crêpe + Café",emoji:"⭐",price:1000,cat:"Formules"},
  {id:"s23",name:"Formule Sandwich + Jus",emoji:"⭐",price:1500,cat:"Formules"},{id:"s24",name:"Formule Gamer PS5 + Thé",emoji:"🎮",price:1500,cat:"Formules"},
];
const INIT_ING=[
  {id:"i1",name:"Farine",emoji:"🌾",unit:"kg",unitCost:300},{id:"i2",name:"Maïzena",emoji:"🌽",unit:"kg",unitCost:1000},
  {id:"i3",name:"Lait en poudre",emoji:"🥛",unit:"kg",unitCost:6000},{id:"i4",name:"Beurre",emoji:"🧈",unit:"kg",unitCost:7000},
  {id:"i5",name:"Oeufs",emoji:"🥚",unit:"pcs",unitCost:62},{id:"i6",name:"Sucre",emoji:"🍬",unit:"kg",unitCost:470},
  {id:"i7",name:"Sucre glace",emoji:"🍬",unit:"kg",unitCost:600},{id:"i8",name:"Levure chimique",emoji:"🫙",unit:"kg",unitCost:2000},
  {id:"i9",name:"Sel",emoji:"🧂",unit:"kg",unitCost:200},{id:"i10",name:"Huile",emoji:"🫙",unit:"L",unitCost:1500},
  {id:"i11",name:"Vanille",emoji:"🌿",unit:"pcs",unitCost:50},{id:"i12",name:"Nutella",emoji:"🍫",unit:"kg",unitCost:10000},
  {id:"i13",name:"Confiture fraise",emoji:"🍓",unit:"kg",unitCost:5000},{id:"i14",name:"Confiture abricot",emoji:"🍑",unit:"kg",unitCost:5000},
  {id:"i15",name:"Miel",emoji:"🍯",unit:"kg",unitCost:8000},{id:"i16",name:"Banane",emoji:"🍌",unit:"pcs",unitCost:100},
  {id:"i17",name:"Chocolat poudre",emoji:"🍫",unit:"kg",unitCost:4000},{id:"i18",name:"Poulet",emoji:"🍗",unit:"kg",unitCost:2200},
  {id:"i19",name:"Bœuf haché",emoji:"🥩",unit:"kg",unitCost:4500},{id:"i20",name:"Thon boîte",emoji:"🐟",unit:"pcs",unitCost:500},
  {id:"i21",name:"Jambon",emoji:"🍖",unit:"kg",unitCost:8000},{id:"i22",name:"Mortadelle",emoji:"🍖",unit:"kg",unitCost:3000},
  {id:"i23",name:"Fromage râpé",emoji:"🧀",unit:"kg",unitCost:6000},{id:"i24",name:"Fromage fondu",emoji:"🧀",unit:"pcs",unitCost:200},
  {id:"i25",name:"Crème fraîche",emoji:"🥛",unit:"kg",unitCost:4000},{id:"i26",name:"Pain baguette",emoji:"🥖",unit:"pcs",unitCost:200},
  {id:"i27",name:"Pain sandwich",emoji:"🍞",unit:"pcs",unitCost:150},{id:"i28",name:"Mayonnaise",emoji:"🫙",unit:"kg",unitCost:3000},
  {id:"i29",name:"Ketchup",emoji:"🍅",unit:"kg",unitCost:2500},{id:"i30",name:"Moutarde",emoji:"💛",unit:"kg",unitCost:2500},
  {id:"i31",name:"Sauce piquante",emoji:"🌶",unit:"kg",unitCost:3000},{id:"i32",name:"Oignon",emoji:"🧅",unit:"kg",unitCost:300},
  {id:"i33",name:"Tomate",emoji:"🍅",unit:"kg",unitCost:500},{id:"i34",name:"Salade verte",emoji:"🥬",unit:"kg",unitCost:1000},
  {id:"i35",name:"Fleurs bissap",emoji:"🌺",unit:"kg",unitCost:3000},{id:"i36",name:"Gingembre",emoji:"🫚",unit:"kg",unitCost:1500},
  {id:"i37",name:"Poudre baobab",emoji:"🌳",unit:"kg",unitCost:5000},{id:"i38",name:"Café Touba moulu",emoji:"☕",unit:"kg",unitCost:4500},
  {id:"i39",name:"Thé Gunpowder",emoji:"🍵",unit:"kg",unitCost:5000},{id:"i40",name:"Citron",emoji:"🍋",unit:"pcs",unitCost:100},
  {id:"i41",name:"Menthe",emoji:"🌿",unit:"kg",unitCost:1000},{id:"i42",name:"Gobelets jetables",emoji:"🥤",unit:"pcs",unitCost:15},
  {id:"i43",name:"Serviettes",emoji:"🧻",unit:"pcs",unitCost:5},{id:"i44",name:"Sachets",emoji:"🛍️",unit:"pcs",unitCost:10},
];
const INIT_REC=[
  // ══ CRÊPES SUCRÉES ══
  {id:"r1",name:"Crêpe Sucre beurre",emoji:"🥞",category:"Crêpes sucrées",snackId:"s1",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i4",qty:0.5},
    {id:"i6",qty:0.015},{id:"i9",qty:0.002},{id:"i4",qty:0.5},{id:"i10",qty:0.005}]},
  {id:"r2",name:"Crêpe Confiture",emoji:"🥞",category:"Crêpes sucrées",snackId:"s2",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i6",qty:0.010},{id:"i13",qty:0.040}]},
  {id:"r3",name:"Crêpe Nutella",emoji:"🥞",category:"Crêpes sucrées",snackId:"s3",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i6",qty:0.010},{id:"i12",qty:0.035}]},
  {id:"r4",name:"Crêpe Miel",emoji:"🍯",category:"Crêpes sucrées",snackId:"s4",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i15",qty:0.030}]},
  {id:"r5",name:"Crêpe Chocolat",emoji:"🍫",category:"Crêpes sucrées",snackId:"s5",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i17",qty:0.020},{id:"i6",qty:0.015}]},
  {id:"r6",name:"Crêpe Banane Nutella",emoji:"🍌",category:"Crêpes sucrées",snackId:"s6",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i12",qty:0.030},{id:"i16",qty:0.5}]},
  // ══ CRÊPES SALÉES ══
  {id:"r7",name:"Crêpe Poulet Fromage",emoji:"🍗",category:"Crêpes salées",snackId:"s7",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i9",qty:0.003},{id:"i18",qty:0.080},{id:"i23",qty:0.040},{id:"i32",qty:0.020}]},
  {id:"r8",name:"Crêpe Thon Fromage",emoji:"🐟",category:"Crêpes salées",snackId:"s8",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i9",qty:0.003},{id:"i20",qty:1},{id:"i23",qty:0.040}]},
  {id:"r9",name:"Crêpe Bœuf Fromage",emoji:"🥩",category:"Crêpes salées",snackId:"s9",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:0.5},{id:"i9",qty:0.003},{id:"i19",qty:0.080},{id:"i23",qty:0.040},{id:"i32",qty:0.020}]},
  {id:"r10",name:"Crêpe Œuf Fromage",emoji:"🥚",category:"Crêpes salées",snackId:"s10",ingredients:[
    {id:"i1",qty:0.060},{id:"i3",qty:0.015},{id:"i4",qty:1},{id:"i9",qty:0.003},{id:"i23",qty:0.040}]},
  // ══ GAUFRES ══
  {id:"r11",name:"Gaufre Sucre glace",emoji:"🧇",category:"Gaufres",snackId:"s11",ingredients:[
    {id:"i1",qty:0.050},{id:"i2",qty:0.010},{id:"i3",qty:0.015},{id:"i4",qty:0.5},
    {id:"i6",qty:0.015},{id:"i8",qty:0.003},{id:"i9",qty:0.002},{id:"i7",qty:0.005}]},
  {id:"r12",name:"Gaufre Nutella",emoji:"🧇",category:"Gaufres",snackId:"s12",ingredients:[
    {id:"i1",qty:0.050},{id:"i2",qty:0.010},{id:"i3",qty:0.015},{id:"i4",qty:0.5},
    {id:"i6",qty:0.015},{id:"i8",qty:0.003},{id:"i12",qty:0.040}]},
  {id:"r13",name:"Gaufre Confiture",emoji:"🧇",category:"Gaufres",snackId:"s13",ingredients:[
    {id:"i1",qty:0.050},{id:"i2",qty:0.010},{id:"i3",qty:0.015},{id:"i4",qty:0.5},
    {id:"i6",qty:0.015},{id:"i8",qty:0.003},{id:"i13",qty:0.040}]},
  {id:"r14",name:"Gaufre Miel",emoji:"🍯",category:"Gaufres",snackId:"s14",ingredients:[
    {id:"i1",qty:0.050},{id:"i2",qty:0.010},{id:"i3",qty:0.015},{id:"i4",qty:0.5},
    {id:"i6",qty:0.015},{id:"i8",qty:0.003},{id:"i15",qty:0.030}]},
  // ══ SANDWICHS ══
  {id:"r15",name:"Sandwich Poulet Mayo",emoji:"🥪",category:"Sandwichs",snackId:"s15",ingredients:[
    {id:"i27",qty:1},{id:"i18",qty:0.080},{id:"i28",qty:0.020},{id:"i33",qty:0.030},{id:"i34",qty:0.030},{id:"i35",qty:0.020}]},
  {id:"r16",name:"Sandwich Thon Mayo",emoji:"🥪",category:"Sandwichs",snackId:"s16",ingredients:[
    {id:"i27",qty:1},{id:"i20",qty:1},{id:"i28",qty:0.020},{id:"i32",qty:0.020},{id:"i33",qty:0.030}]},
  {id:"r17",name:"Sandwich Œuf Mayo",emoji:"🥚",category:"Sandwichs",snackId:"s17",ingredients:[
    {id:"i27",qty:1},{id:"i4",qty:1},{id:"i28",qty:0.020},{id:"i33",qty:0.030},{id:"i34",qty:0.030}]},
  {id:"r18",name:"Sandwich Poulet Ketchup",emoji:"🍗",category:"Sandwichs",snackId:"s18",ingredients:[
    {id:"i27",qty:1},{id:"i18",qty:0.080},{id:"i29",qty:0.020},{id:"i33",qty:0.030},{id:"i35",qty:0.020}]},
  {id:"r19",name:"Sandwich Bœuf",emoji:"🥩",category:"Sandwichs",snackId:"s19",ingredients:[
    {id:"i27",qty:1},{id:"i19",qty:0.080},{id:"i28",qty:0.015},{id:"i30",qty:0.015},{id:"i32",qty:0.020},{id:"i33",qty:0.030}]},
  {id:"r20",name:"Sandwich Frites Poulet",emoji:"🍟",category:"Sandwichs",snackId:"s20",ingredients:[
    {id:"i27",qty:1},{id:"i18",qty:0.080},{id:"i28",qty:0.020},{id:"i29",qty:0.020}]},
  // ══ JUS MAISON ══
  {id:"r21",name:"Bissap",emoji:"🔴",category:"Jus maison",snackId:"b7",ingredients:[
    {id:"i35",qty:0.030},{id:"i6",qty:0.050},{id:"i41",qty:0.5}]},
  {id:"r22",name:"Gingembre",emoji:"🟡",category:"Jus maison",snackId:"b8",ingredients:[
    {id:"i36",qty:0.050},{id:"i6",qty:0.040},{id:"i41",qty:1}]},
  {id:"r23",name:"Bouye (Baobab)",emoji:"🤍",category:"Jus maison",snackId:"b9",ingredients:[
    {id:"i37",qty:0.040},{id:"i6",qty:0.040},{id:"i3",qty:0.020}]},
  // ══ BOISSONS CHAUDES ══
  {id:"r24",name:"Café Touba",emoji:"☕",category:"Boissons chaudes",snackId:"b3",ingredients:[
    {id:"i38",qty:0.008},{id:"i6",qty:0.015},{id:"i42",qty:1}]},
  {id:"r25",name:"Thé ataya",emoji:"🍵",category:"Boissons chaudes",snackId:"b4",ingredients:[
    {id:"i39",qty:0.008},{id:"i6",qty:0.025},{id:"i40",qty:1}]},
  {id:"r26",name:"Café lait",emoji:"☕",category:"Boissons chaudes",snackId:"b2",ingredients:[
    {id:"i38",qty:0.006},{id:"i3",qty:0.015},{id:"i6",qty:0.010},{id:"i42",qty:1}]},
];
const INIT_STATIONS=[{id:"ps1",name:"PS5 N°1",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps2",name:"PS5 N°2",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps3",name:"PS5 N°3",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps4",name:"PS5 N°4",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps5",name:"PS5 N°5",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps6",name:"Écran Géant",emoji:"🖥️",rate1:1500,rate2:2000},{id:"pc1",name:"PC N°1",emoji:"💻",rate1:1000,rate2:1500},{id:"pc2",name:"PC N°2",emoji:"💻",rate1:1000,rate2:1500},{id:"pc3",name:"PC N°3",emoji:"💻",rate1:1000,rate2:1500}];

// GUIDE CONTENT
const GUIDE_SECTIONS=[
  {id:"g1",emoji:"🔐",title:"Se connecter",color:"#FFD600",steps:[{icon:"1️⃣",text:"Sur l'écran de verrouillage, entrez votre code PIN à 4 chiffres."},{icon:"2️⃣",text:"Le PATRON a accès à tout. L'EMPLOYÉ peut encaisser et gérer le gaming."},{icon:"⚠️",text:"L'outil se verrouille automatiquement après 5 minutes d'inactivité."},{icon:"💡",text:"En cas d'oubli de PIN, demandez au patron de le modifier dans Bilan → Employés."}]},
  {id:"g2",emoji:"🛒",title:"Encaisser une vente",color:"#00E676",steps:[{icon:"1️⃣",text:"Allez dans l'onglet 🛒 Caisse."},{icon:"2️⃣",text:"Appuyez sur un produit pour l'ajouter au panier. Appuyez plusieurs fois pour augmenter la quantité."},{icon:"3️⃣",text:"Vérifiez le panier, puis appuyez sur ✓ Encaisser."},{icon:"🖨️",text:"Un TICKET s'affiche. Vous DEVEZ appuyer sur Imprimer avant de valider la vente."},{icon:"⚠️",text:"Ne jamais valider sans ticket ! Toute vente est enregistrée avec votre nom."}]},
  {id:"g3",emoji:"🎮",title:"Gérer le Gaming",color:"#00B0FF",steps:[{icon:"1️⃣",text:"Allez dans l'onglet 🎮 Gaming."},{icon:"2️⃣",text:"Appuyez sur ▶ 1J (1 joueur) ou ▶ 2J (2 joueurs) sur la console concernée."},{icon:"3️⃣",text:"Le chronomètre démarre. La facturation est par tranche de 30 minutes."},{icon:"4️⃣",text:"Pour arrêter, appuyez sur ⏹ Stop & Encaisser. Le ticket s'imprime automatiquement."},{icon:"💡",text:"L'écran géant est plus cher. PS5 standard : 1 000F/30min."}]},
  {id:"g4",emoji:"📦",title:"Gérer les Stocks",color:"#FF6D00",steps:[{icon:"🌅",text:"Chaque matin, allez dans 📦 Stocks → Ingrédients. Saisissez les quantités en KG."},{icon:"🍳",text:"Quand vous fabriquez, allez dans Production. Entrez la quantité fabriquée. Les ingrédients se déduisent automatiquement."},{icon:"🔍",text:"Le soir, allez dans Vérification. Comptez physiquement et entrez les quantités. Si ça ne correspond pas → alerte automatique."},{icon:"⚠️",text:"Toute différence est enregistrée et envoyée au patron. Soyez honnêtes !"}]},
  {id:"g5",emoji:"📊",title:"Rapport du soir",color:"#BB86FC",steps:[{icon:"1️⃣",text:"En fin de journée, allez dans 📊 Bilan → Clôturer caisse."},{icon:"2️⃣",text:"Comptez tous les billets et pièces. Entrez les quantités par coupure."},{icon:"3️⃣",text:"Si l'écart est à 0 → parfait ! Si manque → le patron est alerté automatiquement."},{icon:"4️⃣",text:"Appuyez sur 📱 Rapport WhatsApp pour envoyer le résumé de la journée au patron."},{icon:"💡",text:"Le patron voit tout depuis Paris en temps réel. Travaillez toujours honnêtement."}]},
  {id:"g6",emoji:"🚫",title:"Ce qui est interdit",color:"#FF5252",steps:[{icon:"❌",text:"Vendre sans enregistrer dans la caisse. Toutes les ventes doivent passer par l'outil."},{icon:"❌",text:"Annuler une vente sans autorisation du patron (code PIN nécessaire)."},{icon:"❌",text:"Donner des produits sans encaisser. Même les 'cadeaux' doivent être enregistrés."},{icon:"❌",text:"Laisser une session gaming tourner sans encaisser à la fin."},{icon:"✅",text:"En cas de doute, appelez le patron AVANT d'agir."}]}
];

async function callAI(system,user,maxTokens=800){
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:maxTokens,system,messages:[{role:"user",content:user}]})});
    const d=await r.json();
    return d.content?.map(c=>c.text||"").join("")||"";
  }catch(e){return"";}
}

function PinPad({onConfirm,error}){
  const [d,setD]=useState("");
  const h=k=>{if(k==="←"){setD(p=>p.slice(0,-1));return;}const n=d+k;setD(n);if(n.length===4){onConfirm(n);setD("");}};
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
    <div style={{display:"flex",gap:12}}>{[0,1,2,3].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:d.length>i?S.gold:S.card3,border:`2px solid ${d.length>i?S.gold:S.border}`,transition:"all .15s"}}/>)}</div>
    {error&&<div style={{color:S.red,fontSize:12,fontWeight:700}}>❌ CODE INCORRECT</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,68px)",gap:10}}>
      {["1","2","3","4","5","6","7","8","9","","0","←"].map((k,i)=>k===""?<div key={i}/>:
        <button key={i} onClick={()=>h(k)} style={{width:68,height:68,background:S.card2,border:`2px solid ${S.border}`,color:S.text,borderRadius:12,fontSize:k==="←"?18:24,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{k}</button>
      )}
    </div>
  </div>);
}

// TICKET COMPONENT
const PATRON_NUM="33668708877";
const PAY_MODES=[{id:"especes",label:"💵 Espèces",color:"#4caf50"},{id:"wave",label:"📱 Wave",color:"#1565c0"},{id:"orange",label:"🟠 Orange Money",color:"#e65100"},{id:"free",label:"📲 Free Money",color:"#6a1b9a"}];
function Ticket({items,total,storeName,employeeName,ticketNo,onPrint,onCancel,onSkip,selectedPayMode,onPayModeChange}){
  const printTicket=(pm)=>{
    const w=window.open("","_blank","width=300,height=600");
    w.document.write(`<html><head><title>Ticket</title><style>body{font-family:monospace;font-size:12px;width:250px;margin:0;padding:8px;}h2{text-align:center;font-size:14px;margin:4px 0;}hr{border-top:1px dashed #000;}td{padding:2px 0;}.r{text-align:right;}.total{font-weight:bold;font-size:14px;}</style></head><body>
    <h2>🎮 GAME & GAUFRE</h2><p style="text-align:center;font-size:10px;margin:2px;">${storeName}</p><hr/>
    <p style="font-size:10px;margin:2px;">Ticket #${ticketNo} | ${new Date().toLocaleDateString("fr-FR")} ${timeStr()}</p>
    <p style="font-size:10px;margin:2px;">Employé: ${employeeName}</p><hr/>
    <table width="100%">${items.map(i=>`<tr><td>${i.emoji||""}${i.name} ×${i.qty}</td><td class="r">${Number(i.price*i.qty).toLocaleString("fr-FR")} F</td></tr>`).join("")}</table><hr/>
    <table width="100%"><tr><td class="total">TOTAL</td><td class="r total">${Number(total).toLocaleString("fr-FR")} F</td></tr></table><hr/>
    <p style="text-align:center;font-size:10px;margin:4px;">Merci pour votre visite ! 😊</p>
    <p style="text-align:center;font-size:9px;margin:2px;">Game & Gaufre — Limamoulaye, Guédiawaye</p>
    </body></html>`);
    w.document.close();w.focus();w.print();w.close();
    onPrint();
  };
  return(
    <div style={{background:S.card,borderRadius:16,padding:20,border:`2px solid ${S.teal}`,maxWidth:340,width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:32}}>🎫</div>
        <div style={{fontSize:15,fontWeight:800,color:S.teal}}>TICKET DE CAISSE</div>
        <div style={{fontSize:10,color:S.muted,marginTop:2}}>N° {ticketNo} — {timeStr()}</div>
      </div>
      <div style={{background:S.card2,borderRadius:10,padding:12,marginBottom:12,fontFamily:"monospace"}}>
        <div style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:8,textAlign:"center"}}>🎮 GAME & GAUFRE</div>
        {items.map((i,idx)=><div key={idx} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`1px dashed ${S.border}`}}><span>{i.emoji}{i.name} ×{i.qty}</span><span style={{fontWeight:700}}>{Number(i.price*i.qty).toLocaleString("fr-FR")} F</span></div>)}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`2px dashed ${S.border}`}}><span style={{fontWeight:800,fontSize:14}}>TOTAL</span><span style={{fontWeight:800,fontSize:16,color:S.green}}>{Number(total).toLocaleString("fr-FR")} F</span></div>
      </div>
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:S.muted,marginBottom:6,fontWeight:700}}>MODE DE PAIEMENT</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {PAY_MODES.map(pm=>(
            <button key={pm.id} onClick={()=>onPayModeChange&&onPayModeChange(pm.id)} style={{background:selectedPayMode===pm.id?pm.color:"transparent",color:selectedPayMode===pm.id?"#fff":S.muted,border:`2px solid ${selectedPayMode===pm.id?pm.color:S.border}`,borderRadius:8,padding:"8px 6px",cursor:"pointer",fontSize:12,fontWeight:selectedPayMode===pm.id?700:400,transition:"all .15s"}}>{pm.label}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>✕ Annuler</button>
        <button onClick={()=>printTicket(selectedPayMode)} style={{background:S.teal,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:2}}>🖨️ Valider</button>
      </div>
      <button onClick={onSkip} style={{width:"100%",marginTop:8,background:"transparent",border:`1px solid ${S.orange}`,color:S.orange,borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12}}>⚠️ Valider sans imprimante</button>
      <div style={{fontSize:10,color:S.muted,textAlign:"center",marginTop:4}}>Sans ticket = enregistré dans l'audit</div>
    </div>
  );
}

export default function App(){
  const [user,setUser]=useState(null);
  const [pinErr,setPinErr]=useState(false);
  const [emps,setEmps]=useState(INIT_EMPS);
  const empRef=useRef(INIT_EMPS);
  const [pinModal,setPinModal]=useState(null);
  const [pinMErr,setPinMErr]=useState(false);
  const [currentStore,setCurrentStore]=useState(STORES[0]);
  const [tab,setTabRaw]=useState("home");
  const [tabHistory,setTabHistory]=useState(["home"]);
  const [tabPos,setTabPos]=useState(0);
  const setTab=(t)=>{touch();setTabRaw(t);setTabHistory(prev=>{const h=[...prev.slice(0,tabPos+1),t];setTabPos(h.length-1);return h;});};
  const goBack=()=>{if(tabPos>0){const p=tabPos-1;setTabPos(p);setTabRaw(tabHistory[p]);}};
  const goFwd=()=>{if(tabPos<tabHistory.length-1){const p=tabPos+1;setTabPos(p);setTabRaw(tabHistory[p]);}};
  const [stSub,setStSub]=useState("ing");
  const [cTab,setCTab]=useState("boissons");
  const [guideSection,setGuideSection]=useState(null);
  const [boissons,setBoissons]=useState(INIT_B);
  const [snacks,setSnacks]=useState(INIT_S);
  const [stations,setStations]=useState(INIT_STATIONS);
  const [ingredients,setIngredients]=useState(INIT_ING);
  const [recipes,setRecipes]=useState(INIT_REC);
  const [ingStock,setIngStock]=useState({});
  const [ingPhys,setIngPhys]=useState({});
  const [productions,setProductions]=useState([]);
  const [finPhys,setFinPhys]=useState({});
  const [planQty,setPlanQty]=useState({});
  const [planStock,setPlanStock]=useState({});
  const [cart,setCart]=useState([]);
  const [pendingTicket,setPendingTicket]=useState(null);
  const [ticketNo,setTicketNo]=useState(1001);
  const [sales,setSales]=useState([]);
  const [sessions,setSessions]=useState({});
  const [doneSess,setDoneSess]=useState([]);
  const [photoPrice,setPhotoPrice]=useState(50);
  const [photoCount,setPhotoCount]=useState(0);
  const [expenses,setExpenses]=useState([]);
  const [audit,setAudit]=useState([]);
  const [checklist,setChecklist]=useState({});
  const [dailyGoal,setDailyGoal]=useState(DEFAULT_GOAL);
  const [history,setHistory]=useState({});
  const [aiMessages,setAiMessages]=useState([{role:"assistant",content:"👋 Bonjour ! Je suis votre assistant IA Game & Gaufre.\n\nJe connais vos ventes, stocks et recettes en temps réel. Je peux :\n\n📊 Analyser vos pertes\n🛒 Calculer vos courses\n💡 Optimiser votre rentabilité\n🚨 Détecter les vols\n📈 Proposer des améliorations\n\nPosez-moi n'importe quelle question !"}]);
  const [aiInput,setAiInput]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiSuggestions,setAiSuggestions]=useState([]);
  const [suggestLoading,setSuggestLoading]=useState(false);
  const [aiInsight,setAiInsight]=useState("");
  const [insightLoading,setInsightLoading]=useState(false);
  const [addProdModal,setAddProdModal]=useState(null);
  const [newProd,setNewProd]=useState({name:"",price:"",emoji:"🍽️"});
  const [emojiSuggesting,setEmojiSuggesting]=useState(false);
  const [editProd,setEditProd]=useState(null);
  const [editStation,setEditStation]=useState(null);
  const [saveOk,setSaveOk]=useState(false);
  const [scanLoading,setScanLoading]=useState(false);
  const [gamingAlerts,setGamingAlerts]=useState({});
  const [scanConfirm,setScanConfirm]=useState(null); // {target, items:[{nom,quantite,unite,prixUnitaire,emoji,isNew,matched_id}]}
  const [scanTarget,setScanTarget]=useState(null);
  const scanRef=useRef(null);
  const [editIng,setEditIng]=useState(null);
  const [editRec,setEditRec]=useState(null);
  const [addIngModal,setAddIngModal]=useState(false);
  const [addProdModal2,setAddProdModal2]=useState(false);
  const [newIng,setNewIng]=useState({name:"",unit:"kg",emoji:"🥄",unitCost:""});
  const [prodModal,setProdModal]=useState(null);
  const [prodQtyVal,setProdQtyVal]=useState("");
  const [cashModal,setCashModal]=useState(false);
  const [cashCount,setCashCount]=useState({});
  const [whatsModal,setWhatsModal]=useState(false);
  const [empModal,setEmpModal]=useState(false);
  const [editEmp,setEditEmp]=useState(null);
  const [goalModal,setGoalModal]=useState(false);
  const [newGoal,setNewGoal]=useState("");
  const [expModal,setExpModal]=useState(false);
  const [newExp,setNewExp]=useState({label:"",amount:"",emoji:"🛒"});
  const [aiRecInput,setAiRecInput]=useState("");
  const [aiRecLoading,setAiRecLoading]=useState(false);
  const [addRecModal,setAddRecModal]=useState(false);
  const [newRec,setNewRec]=useState({name:"",emoji:"🍽️",category:"Autre",snackId:"",ingredients:[]});
  const [storeModal,setStoreModal]=useState(false);
  const [tick,setTick]=useState(0);
  const [lastAct,setLastAct]=useState(Date.now());
  const [toast,setToast]=useState(null);
  const chatRef=useRef(null);

  useEffect(()=>{const iv=setInterval(()=>{
    setTick(t=>t+1);
    if(user&&Date.now()-lastAct>5*60*1000)setUser(null);
    // Détecter fin de session gaming
    setSessions(prev=>{
      let changed=false;
      const alerts={};
      Object.entries(prev).forEach(([sid,ses])=>{
        if(ses.status==="playing"&&ses.start&&ses.duree){
          const elapsedMins=(Date.now()-ses.start)/60000;
          if(elapsedMins>=ses.duree&&!ses.alerted){
            alerts[sid]=true;
            prev={...prev,[sid]:{...ses,alerted:true}};
            changed=true;
            // Vibration + son
            try{if(navigator.vibrate)navigator.vibrate([500,200,500,200,500]);}catch(e){}
            try{const ctx=new AudioContext();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);o.start();o.stop(ctx.currentTime+0.5);}catch(e){}
          }
        }
      });
      if(Object.keys(alerts).length>0) setGamingAlerts(a=>({...a,...alerts}));
      return changed?{...prev}:prev;
    });
  },1000);return()=>clearInterval(iv);},[user,lastAct]);
  const touch=()=>setLastAct(Date.now());

  useEffect(()=>{(async()=>{
    // Test de connexion Firebase au démarrage
    try{
      await fbSave('_test',{ok:true,ts:Date.now()});
      const t=await fbGet('_test');
      setSaveOk(t?.ok===true);
    }catch(e){}
    // Charger depuis Firebase (cloud) en priorité, localStorage en fallback rapide
    const load=async(key)=>{
      let local=null;
      try{const s=localStorage.getItem(key);if(s)local=JSON.parse(s);}catch(e){}
      const cloud=await fbGet(key);
      return cloud||local; // Cloud prioritaire
    };
    try{const d=await load('gg3-emps');if(d){setEmps(d);empRef.current=d;}}catch(e){}
    try{const d=await load('gg3-prods');if(d){if(d.b)setBoissons(d.b);if(d.s)setSnacks(d.s);if(d.ing)setIngredients(d.ing);if(d.rec)setRecipes(d.rec);if(d.sta)setStations(d.sta);if(d.pp)setPhotoPrice(d.pp);if(d.goal)setDailyGoal(d.goal);if(d.tno)setTicketNo(d.tno);}}catch(e){}
    try{const d=await load('gg3-day-'+todayStr());if(d){if(d.sales)setSales(d.sales);if(d.done)setDoneSess(d.done);if(d.pc!=null)setPhotoCount(d.pc);if(d.audit)setAudit(d.audit);if(d.checklist)setChecklist(d.checklist);if(d.expenses)setExpenses(d.expenses);if(d.ingStock)setIngStock(d.ingStock);if(d.ingPhys)setIngPhys(d.ingPhys);if(d.productions)setProductions(d.productions);if(d.finPhys)setFinPhys(d.finPhys);}}catch(e){}
    const hist={};for(let i=1;i<=7;i++){const dt=new Date();dt.setDate(dt.getDate()-i);const ds=dt.toISOString().split('T')[0];try{const d=await load('gg3-day-'+ds);if(d)hist[ds]={sales:d.sales||[],expenses:d.expenses||[],pc:d.pc||0};}catch(e){}}
    setHistory(hist);
  })();},[]);

  const saveEmps=e=>{try{localStorage.setItem('gg3-emps',JSON.stringify(e));}catch(e){}fbSave('gg3-emps',e);};
  const saveProds=(b,s,ing,rec,sta,pp,g,tno)=>{const d={b,s,ing,rec,sta,pp,goal:g,tno};try{localStorage.setItem('gg3-prods',JSON.stringify(d));}catch(e){}fbSave('gg3-prods',d).then(()=>{setSaveOk(true);setTimeout(()=>setSaveOk(false),2000);});};
  const saveDay=upd=>{let nd={};try{const s=localStorage.getItem('gg3-day-'+todayStr());if(s)nd=JSON.parse(s);}catch(e){}nd={...nd,...upd};try{localStorage.setItem('gg3-day-'+todayStr(),JSON.stringify(nd));}catch(e){}fbSave('gg3-day-'+todayStr(),nd).then(()=>{setSaveOk(true);setTimeout(()=>setSaveOk(false),2000);});};
  const showToast=(msg,color=S.green)=>{setToast({msg,color});setTimeout(()=>setToast(null),2500);};
  const addAudit=useCallback(async(action,details="")=>{const entry={id:uid(),time:timeStr(),date:todayStr(),who:user?.name||"?",role:user?.role||"?",action,details};setAudit(prev=>{const na=[entry,...prev].slice(0,300);saveDay({audit:na});return na;});},[user]);

  // AUTH
  const tryLogin=code=>{const emp=empRef.current.find(e=>e.pin===code);if(emp){setUser(emp);setPinErr(false);}else{setPinErr(true);setTimeout(()=>setPinErr(false),1200);}};
  const requirePatron=onSuccess=>{if(user?.role==="patron"){onSuccess();return;}setPinModal({onSuccess});};
  const tryPatronModal=code=>{const p=empRef.current.find(e=>e.role==="patron");if(p&&code===p.pin){setPinModal(null);setPinMErr(false);pinModal.onSuccess();}else{setPinMErr(true);setTimeout(()=>setPinMErr(false),1200);}};

  // COMPUTED
  const soldQty=id=>sales.reduce((s,sale)=>s+(sale.items.find(i=>i.id===id)?.qty||0),0);
  const prodQtyFn=id=>productions.filter(p=>p.snackId===id).reduce((s,p)=>s+p.qty,0);
  const remQty=id=>Math.max(0,prodQtyFn(id)-soldQty(id));
  const lossQty=id=>{const p=finPhys[id];if(p==null)return null;return remQty(id)-p;};
  const ingUsed=id=>productions.reduce((s,p)=>{const rec=recipes.find(r=>r.snackId===p.snackId);const ri=rec?.ingredients.find(i=>i.id===id);return s+(ri?ri.qty*p.qty:0);},0);
  const ingRem=id=>Math.max(0,(ingStock[id]?.opening||0)-ingUsed(id));
  const ingAlert=id=>{const p=ingPhys[id];if(p==null)return null;const t=ingRem(id);const diff=t-p;return diff!==0?{diff,t,p}:null;};
  const totalCA=sales.reduce((s,sale)=>s+sale.total,0)+photoCount*photoPrice;
  const totalGaming=doneSess.reduce((s,d)=>s+d.total,0);
  const totalFood=sales.filter(s=>s.items[0]?.cat!=="gaming").reduce((s,sale)=>s+sale.total,0);
  const totalExpenses=expenses.reduce((s,e)=>s+e.amount,0);
  const netProfit=totalCA-totalExpenses;
  const goalPct=Math.min(100,Math.round((totalCA/dailyGoal)*100));
  const lossAlerts=snacks.filter(p=>{const l=lossQty(p.id);return l!==null&&l>0;});
  const ingAlerts=ingredients.filter(i=>ingAlert(i.id)!==null);
  const top5=[...boissons,...snacks].map(p=>({...p,sold:soldQty(p.id)})).filter(p=>p.sold>0).sort((a,b)=>b.sold-a.sold).slice(0,5);
  const last7=Array.from({length:7},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-i);const ds=dt.toISOString().split("T")[0];const h=i===0?{sales,expenses,pc:photoCount}:history[ds]||{sales:[],expenses:[],pc:0};const ca=h.sales.reduce((s,sale)=>s+sale.total,0)+(h.pc||0)*photoPrice;const dep=h.expenses.reduce((s,e)=>s+e.amount,0);return{ds,label:i===0?"Auj":i===1?"Hier":dt.toLocaleDateString("fr-FR",{weekday:"short"}),ca,dep,net:ca-dep};}).reverse();
  const cashTotal=BILLETS.reduce((s,b)=>s+(Number(cashCount[b]||0)*b),0);
  const cashDiff=cashTotal-totalCA;

  // TICKET + SALE
  const addToCart=(p,cat)=>{touch();setCart(prev=>{const ex=prev.find(i=>i.id===p.id);return ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1,cat}];});};
  const updQty=(id,d)=>{touch();setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));};
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const [payMode,setPayMode]=useState("especes");
  const requestTicket=()=>{if(!cart.length)return;setPendingTicket({items:[...cart],total:cartTotal});};
  const confirmSaleAfterPrint=async(noTicket=false)=>{
    if(!pendingTicket)return;
    const sale={id:uid(),items:pendingTicket.items,total:pendingTicket.total,payMode:pendingTicket.payMode||payMode,time:timeStr(),date:todayStr(),by:user?.name,ticketNo};
    setSales(prev=>{const ns=[...prev,sale];saveDay({sales:ns});return ns;});
    const newTno=ticketNo+1;setTicketNo(newTno);
    saveProds(boissons,snacks,ingredients,recipes,stations,photoPrice,dailyGoal,newTno);
    setCart([]);setPendingTicket(null);
    addAudit("VENTE",`#${ticketNo} ${fmt(pendingTicket.total)} — ${pendingTicket.items.map(i=>`${i.name}×${i.qty}`).join(", ")}${noTicket?" [SANS TICKET]":""}`);
    showToast(`✓ Ticket #${ticketNo} — ${fmt(pendingTicket.total)}`);
  };
  const deleteSale=id=>requirePatron(()=>{setSales(prev=>{const ns=prev.filter(s=>s.id!==id);saveDay({sales:ns});return ns;});addAudit("ANNULATION","Patron");showToast("Vente annulée",S.orange);});

  // STOCK
  const setIngField=(id,field,val)=>{setIngStock(prev=>{const ns={...prev,[id]:{...prev[id]||{},[field]:Number(val)||0}};if(field==="opening")ns[id].current=Number(val)||0;saveDay({ingStock:ns});return ns;});};
  const setIngPhysVal=(id,val)=>{setIngPhys(prev=>{const np={...prev,[id]:Number(val)||0};saveDay({ingPhys:np});return np;});};

  // ── SCAN IA ────────────────────────────────────────────────
  const scanIA=async(file,target)=>{
    setScanLoading(true);setScanTarget(target);
    try{
      // Convertir en JPEG via canvas pour compatibilité maximale
      const b64=await new Promise((res,rej)=>{
        const img=new Image();
        const url=URL.createObjectURL(file);
        img.onload=()=>{
          const canvas=document.createElement("canvas");
          const MAX=1600;
          let w=img.width,h=img.height;
          if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}
          if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
          canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext("2d");
          ctx.drawImage(img,0,0,w,h);
          const dataUrl=canvas.toDataURL("image/jpeg",0.85);
          URL.revokeObjectURL(url);
          res(dataUrl.split(",")[1]);
        };
        img.onerror=rej;
        img.src=url;
      });
      const mediaType="image/jpeg";
      let prompt="";
      if(target==="stock"||target==="verif"){
        const liste=ingredients.map(i=>`${i.name} (${i.unit})`).join(", ");
        const moment=target==="verif"?"du soir (comptage physique)":"du matin (ouverture)";
        prompt=`Tu es un assistant pour un café-crêperie à Dakar. Voici mes ingrédients existants: ${liste}. Regarde cette fiche ou photo. Pour chaque produit que tu vois: si le nom correspond à un ingrédient existant (même approximativement), utilise son nom exact. Si c'est un NOUVEAU produit non présent dans la liste, indique nouveau:true et devine l'unité (kg, L, pcs). Réponds UNIQUEMENT en JSON: {"stocks":[{"nom":"...","quantite":0,"unite":"kg","prixUnitaire":0,"nouveau":false,"emoji":"🌾"}]}. Inclus TOUS les produits visibles sur la fiche.`;
      } else {
        const liste=snacks.map(s=>`${s.name}`).join(", ");
        prompt=`Tu es un assistant pour un café-crêperie à Dakar. Voici les produits: ${liste}. Regarde cette fiche ou photo et extrais les quantités produites ce matin. Réponds UNIQUEMENT en JSON: {"productions":[{"nom":"...","quantite":0}]}. Si tu ne vois pas un produit, ne l'inclus pas.`;
      }
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mediaType,data:b64}},{type:"text",text:prompt}]}]})});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error?.message||"Erreur serveur");
      const txt=d.content?.map(c=>c.text||"").join("")||"";
      const match=txt.match(/\{[\s\S]*\}/);
      if(!match) throw new Error("L'IA n'a pas pu lire la fiche");
      const parsed=JSON.parse(match[0]);
      if((target==="verif"||target==="stock")&&parsed.stocks){
        // Préparer les items avec correspondance dans la base existante
        const items=parsed.stocks.map(s=>{
          const ing=ingredients.find(i=>i.name.toLowerCase().includes(s.nom.toLowerCase())||s.nom.toLowerCase().includes(i.name.toLowerCase()));
          return {
            nom: s.nom,
            quantite: s.quantite||0,
            unite: s.unite||ing?.unit||"kg",
            prixUnitaire: s.prixUnitaire||ing?.unitCost||0,
            emoji: s.emoji||ing?.emoji||"📦",
            isNew: !ing,
            matched_id: ing?.id||null
          };
        });
        setScanConfirm({target, items});
        showToast(`📋 ${items.length} produit(s) détecté(s) — Vérifiez et validez`);
      } else if(target==="prod"&&parsed.productions){
        const newIS={...ingStock};
        parsed.productions.forEach(p=>{
          const snk=snacks.find(s=>s.name.toLowerCase().includes(p.nom.toLowerCase())||p.nom.toLowerCase().includes(s.name.toLowerCase()));
          if(snk&&p.quantite>0){
            const rec=recipes.find(r=>r.snackId===snk.id);
            if(rec){rec.ingredients.forEach(ri=>{const cur=newIS[ri.id]?.opening??0;newIS[ri.id]={...newIS[ri.id]||{},opening:Math.max(0,cur-ri.qty*p.quantite)};});}
            const prod={id:uid(),snackId:snk.id,snackName:snk.name,snackEmoji:snk.emoji,qty:p.quantite,time:timeStr()};
            setProductions(prev=>{const np=[...prev,prod];saveDay({productions:np});return np;});
          }
        });
        setIngStock(newIS);saveDay({ingStock:newIS});
        addAudit("SCAN PROD IA",`${parsed.productions.length} productions lues`);
        showToast(`✓ ${parsed.productions.length} productions enregistrées`);
      }
    }catch(e){showToast("❌ "+e.message,S.red);}
    setScanLoading(false);setScanTarget(null);
  };


  // ── Appliquer le scan après confirmation manuelle ────────────────────────
  const applyScanConfirm=()=>{
    if(!scanConfirm) return;
    const {target,items}=scanConfirm;
    let newIngList=[...ingredients];
    let nbNouveaux=0;
    if(target==="stock"){
      const newIS={...ingStock};
      items.forEach(s=>{
        let ing=newIngList.find(i=>i.id===s.matched_id||(i.name.toLowerCase().includes(s.nom.toLowerCase())||s.nom.toLowerCase().includes(i.name.toLowerCase())));
        if(!ing&&s.isNew!==false){
          const newId="ing_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);
          ing={id:newId,name:s.nom,emoji:s.emoji||"📦",unit:s.unite||"kg",unitCost:s.prixUnitaire||0};
          newIngList=[...newIngList,ing];
          nbNouveaux++;
        }
        if(ing) newIS[ing.id]={...newIS[ing.id]||{},opening:s.quantite};
      });
      if(nbNouveaux>0){setIngredients(newIngList);saveProds(boissons,snacks,newIngList,recipes,stations,photoPrice,dailyGoal,ticketNo);}
      setIngStock(newIS);saveDay({ingStock:newIS});
      addAudit("SCAN STOCK VALIDÉ",`${items.length} ingrédients${nbNouveaux>0?` (+${nbNouveaux} nouveaux)`:""}`);
    } else if(target==="verif"){
      const nip={...ingPhys};
      items.forEach(s=>{
        let ing=newIngList.find(i=>i.id===s.matched_id||(i.name.toLowerCase().includes(s.nom.toLowerCase())||s.nom.toLowerCase().includes(i.name.toLowerCase())));
        if(!ing&&s.isNew!==false){
          const newId="ing_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);
          ing={id:newId,name:s.nom,emoji:s.emoji||"📦",unit:s.unite||"kg",unitCost:s.prixUnitaire||0};
          newIngList=[...newIngList,ing];
          nbNouveaux++;
        }
        if(ing) nip[ing.id]=s.quantite;
      });
      if(nbNouveaux>0){setIngredients(newIngList);saveProds(boissons,snacks,newIngList,recipes,stations,photoPrice,dailyGoal,ticketNo);}
      setIngPhys(nip);saveDay({ingPhys:nip});
      addAudit("SCAN SOIR VALIDÉ",`${items.length} ingrédients`);
    }
    setScanConfirm(null);
    showToast(`✅ ${items.length} ingrédients enregistrés`);
  };

  const recordProduction=()=>{if(!prodModal||!prodQtyVal)return;const qty=parseInt(prodQtyVal)||0;const rec=recipes.find(r=>r.snackId===prodModal.id);const newIS={...ingStock};if(rec){rec.ingredients.forEach(ri=>{const cur=newIS[ri.id]?.opening??0;newIS[ri.id]={...newIS[ri.id]||{},opening:Math.max(0,cur-ri.qty*qty)};});}const prod={id:uid(),snackId:prodModal.id,snackName:prodModal.name,snackEmoji:prodModal.emoji,qty,time:timeStr()};const np=[...productions,prod];setIngStock(newIS);setProductions(np);saveDay({ingStock:newIS,productions:np});addAudit("PRODUCTION",`${prodModal.emoji}${prodModal.name} × ${qty}`);setProdModal(null);setProdQtyVal("");showToast(`✓ ${qty} ${prodModal.name} produit(s)`);};

  // GAMING
  const elapsed=start=>{const s=Math.floor((Date.now()-start)/1000);return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;};
  const liveCost=(ses,st)=>{const slots=Math.ceil((Date.now()-ses.start)/60000/30)||1;return slots*(ses.players===2?st.rate2:st.rate1);};
  const [gamingTicket,setGamingTicket]=useState(null);

  const requestGaming=(sid,players)=>{touch();const st=stations.find(s=>s.id===sid);if(!st)return;setGamingTicket({sid,players,st,items:[{emoji:st.emoji,name:`${st.name} — ${players} joueur(s)`,qty:1,price:st.rate1,note:"Paiement avant démarrage"}],total:st.rate1});};
  const confirmGaming=(withPrint,gPayMode="especes")=>{if(!gamingTicket)return;const {sid,players,st}=gamingTicket;const newTno=ticketNo+1;setTicketNo(newTno);setSessions(prev=>({...prev,[sid]:{status:"paid",players,st,payMode:gPayMode,paidAt:Date.now()}}));const gsale={id:uid(),items:[{name:`${st.name} ${players}J`,emoji:st.emoji,qty:1,price:st.rate1,cat:"gaming"}],total:st.rate1,payMode:gPayMode,time:timeStr(),date:todayStr(),by:user?.name,ticketNo:newTno};setSales(prev=>{const ns=[...prev,gsale];saveDay({sales:ns});return ns;});addAudit("GAMING PAYÉ",`${st.name} ${players}J — ${withPrint?"ticket":"sans ticket"} #${newTno} [${gPayMode}]`);saveProds(boissons,snacks,ingredients,recipes,stations,photoPrice,dailyGoal,newTno);setGamingTicket(null);showToast(`✓ Payé — appuie Démarrer quand la partie commence`);};
  const startGaming=(sid)=>{touch();setSessions(prev=>({...prev,[sid]:{...prev[sid],status:"playing",start:Date.now()}}));addAudit("GAMING START",sid);};
  const stopSess=sid=>{touch();const ses=sessions[sid];if(!ses)return;const st=stations.find(s=>s.id===sid);const mins=(Date.now()-ses.start)/60000;const slots=Math.ceil(mins/30)||1;const total=slots*(ses.players===2?st.rate2:st.rate1);const sale={id:uid(),items:[{id:sid,name:`${st.emoji}${st.name} ${ses.players}J ${Math.round(mins)}min`,price:total,qty:1,cat:"gaming",emoji:st.emoji}],total,time:timeStr(),date:todayStr(),by:user?.name,ticketNo};const newTno=ticketNo+1;setSessions(prev=>{const n={...prev};delete n[sid];return n;});setDoneSess(prev=>[...prev,{id:uid(),sid,name:st.name,emoji:st.emoji,mins:Math.round(mins),players:ses.players,total,time:timeStr()}]);setSales(prev=>{const ns=[...prev,sale];saveDay({sales:ns});return ns;});setTicketNo(newTno);saveProds(boissons,snacks,ingredients,recipes,stations,photoPrice,dailyGoal,newTno);addAudit("SESSION END",`${st.name} ${Math.round(mins)}min ${fmt(total)}`);showToast(`${st.name} — ${fmt(total)}`);};
  const addPhoto=n=>{touch();setPhotoCount(prev=>{const np=Math.max(0,prev+n);saveDay({pc:np});return np;});if(n>0){addAudit("PHOTOCOPIE",`${n}p`);showToast(`📄 ${n}p — ${fmt(n*photoPrice)}`);}};

  // SMART EMOJI SUGGESTION
  const suggestEmoji=async(name)=>{
    if(!name||name.length<3)return;
    setEmojiSuggesting(true);
    const txt=await callAI("Tu es un assistant. Réponds UNIQUEMENT par 1 seul emoji qui correspond au produit alimentaire donné. Rien d'autre.",name);
    if(txt&&txt.trim().length<=4){setNewProd(p=>({...p,emoji:txt.trim()}));}
    setEmojiSuggesting(false);
  };

  // AI WEEKLY SUGGESTIONS
  const generateSuggestions=async()=>{
    setSuggestLoading(true);
    const ctx=buildCtx();
    const txt=await callAI(ctx,"Génère 4 suggestions concrètes et actionnables pour améliorer cette boutique. Format JSON array: [{\"id\":1,\"emoji\":\"💡\",\"title\":\"Titre court\",\"description\":\"Détail actionnable avec chiffres\",\"impact\":\"high|medium|low\",\"category\":\"rentabilite|anti-vol|efficacite|client\"}]",1200);
    try{const clean=txt.replace(/```json|```/g,"").trim();const parsed=JSON.parse(clean);setAiSuggestions(Array.isArray(parsed)?parsed:parsed.suggestions||[]);}catch(e){setAiSuggestions([{id:1,emoji:"💡",title:"Analysez vos données",description:"Entrez vos stocks et ventes pour obtenir des suggestions personnalisées.",impact:"high",category:"efficacite"}]);}
    setSuggestLoading(false);
  };

  // AI CHAT
  const buildCtx=()=>{
    const recLines=recipes.map(r=>`${r.name}: `+r.ingredients.map(ri=>{const ing=ingredients.find(x=>x.id===ri.id);return ing?`${fmtQ(ri.qty,ing.unit)} ${ing.name}`:""}).filter(Boolean).join(", ")).join(" | ");
    const lossLines=lossAlerts.map(p=>`${p.name}: ${lossQty(p.id)} manquant(s) valeur ${fmt(lossQty(p.id)*p.price)}`).join("; ");
    const hist7=last7.map(d=>`${d.label}: CA ${fmt(d.ca)} net ${fmt(d.net)}`).join("; ");
    return `Tu es l'assistant IA de Game & Gaufre, cyber café restaurant à ${currentStore.name}, Dakar, Sénégal. Réponds toujours en français, concis, avec chiffres en FCFA.\n\nDONNÉES TEMPS RÉEL:\nCA: ${fmt(totalCA)} | Objectif: ${goalPct}% | Net: ${fmt(netProfit)}\nFood: ${fmt(totalFood)} | Gaming: ${fmt(totalGaming)} | Dépenses: ${fmt(totalExpenses)}\nVentes: ${sales.length} | Sessions: ${doneSess.length}\nTop: ${top5.map(p=>`${p.name} ${p.sold}×`).join(", ")}\nPERTES: ${lossLines||"Aucune"}\nHISTO 7J: ${hist7}\nRECETTES: ${recLines}\nINGRÉDIENTS: ${ingredients.map(i=>`${i.name}:${fmtQ(ingRem(i.id),i.unit)} restant`).join("; ")}`;
  };
  const sendAiMessage=async()=>{
    if(!aiInput.trim()||aiLoading)return;
    const msg=aiInput.trim();setAiInput("");
    const nm=[...aiMessages,{role:"user",content:msg}];setAiMessages(nm);setAiLoading(true);
    const ctx=buildCtx();
    const hist=nm.slice(-8).map(m=>({role:m.role,content:m.content}));
    try{const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:600,system:ctx,messages:hist})});const d=await r.json();const reply=d.content?.map(c=>c.text||"").join("")||"Désolé, réessayez.";setAiMessages(prev=>[...prev,{role:"assistant",content:reply}]);}
    catch(e){setAiMessages(prev=>[...prev,{role:"assistant",content:"❌ Erreur de connexion."}]);}
    setAiLoading(false);
    setTimeout(()=>{chatRef.current?.scrollTo({top:chatRef.current.scrollHeight,behavior:"smooth"});},100);
  };
  const generateInsight=async()=>{setInsightLoading(true);const ctx=buildCtx();const txt=await callAI(ctx,"3 insights clés du jour en bullet points courts avec emoji. Max 2 lignes chacun.");setAiInsight(txt);setInsightLoading(false);};

  // SHOPPING
  const computeShopping=()=>{const needs={};Object.entries(planQty).forEach(([recId,qty])=>{if(!qty||qty<=0)return;const rec=recipes.find(r=>r.id===recId);if(!rec)return;rec.ingredients.forEach(ri=>{const ing=ingredients.find(i=>i.id===ri.id);if(!ing)return;if(!needs[ing.id])needs[ing.id]={...ing,needed:0};needs[ing.id].needed+=ri.qty*qty;});});return Object.values(needs).map(n=>{const sv=planStock[n.id]||0;return{...n,stockVal:sv,toBuy:Math.max(0,n.needed-sv)};}).sort((a,b)=>b.needed-a.needed);};
  const shopping=computeShopping();
  const totalPlanUnits=Object.values(planQty).reduce((s,v)=>s+(Number(v)||0),0);

  // STYLES
  const T=a=>({flex:1,padding:"9px 2px",background:a?S.gold:"transparent",color:a?S.bg:S.muted,border:"none",cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:.3,textTransform:"uppercase",fontFamily:"monospace",transition:"all .15s",whiteSpace:"nowrap"});
  const Btn=(col=S.gold,txt=S.bg)=>({background:col,color:txt,border:"none",borderRadius:8,padding:"10px 14px",fontWeight:700,cursor:"pointer",fontSize:13});
  const Sub=a=>({flex:1,padding:"7px 4px",background:a?S.card3:"transparent",color:a?S.text:S.muted,border:`1px solid ${a?S.border:"transparent"}`,borderRadius:8,cursor:"pointer",fontSize:10,fontWeight:600,textAlign:"center"});
  const Inp=(w="100%")=>({width:w,background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"9px 12px",fontSize:14,outline:"none",boxSizing:"border-box"});
  const Card=(col=S.border)=>({background:S.card,borderRadius:12,padding:14,border:`1px solid ${col}`,marginBottom:12});

  // ══════════════════ LOCK SCREEN ══════════════════
  if(!user)return(
    <div style={{background:S.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{fontSize:52,marginBottom:6}}>🎮</div>
      <div style={{fontSize:22,fontWeight:800,color:S.gold,marginBottom:2}}>GAME & GAUFRE</div>
      <button onClick={()=>setStoreModal(true)} style={{background:S.card,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:11,marginBottom:20}}>{currentStore.emoji} {currentStore.name} ▾</button>
      <PinPad onConfirm={tryLogin} error={pinErr}/>
      <div style={{marginTop:20,display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6}}>
        {emps.map(e=><div key={e.id} style={{background:S.card,border:`1px solid ${e.role==="patron"?S.gold:S.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:e.role==="patron"?S.gold:S.muted}}>{e.role==="patron"?"👑":"👤"} {e.name}</div>)}
      </div>
    </div>
  );

  // ══════════════════ MAIN APP ══════════════════
  return(
    <div style={{background:S.bg,minHeight:"100vh",color:S.text,fontFamily:"system-ui,sans-serif",maxWidth:560,margin:"0 auto",paddingBottom:60}} onClick={touch}>
      {toast&&<div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:toast.color,color:S.bg,padding:"10px 22px",borderRadius:20,fontWeight:700,fontSize:13,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,.5)"}}>{toast.msg}</div>}
      {pinModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:400,gap:20}}><div style={{color:S.gold,fontWeight:800,fontSize:16}}>🔒 CODE PATRON REQUIS</div><PinPad onConfirm={tryPatronModal} error={pinMErr}/><button onClick={()=>setPinModal(null)} style={{...Btn(S.card2,S.muted),border:`1px solid ${S.border}`}}>Annuler</button></div>}

      {/* TICKET MODAL */}
      {pendingTicket&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}><Ticket items={pendingTicket.items} total={pendingTicket.total} storeName={currentStore.name} employeeName={user.name} ticketNo={ticketNo} onPrint={(pm)=>{const pt={...pendingTicket,payMode:pm};setPendingTicket(pt);confirmSaleAfterPrint(false);}} onCancel={()=>setPendingTicket(null)} onSkip={()=>{confirmSaleAfterPrint(true);}} selectedPayMode={payMode} onPayModeChange={setPayMode}/></div>}

      {/* HEADER */}
      <div style={{background:S.card,padding:"11px 16px",borderBottom:`3px solid ${S.gold}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontSize:14,fontWeight:800,color:S.gold}}>🎮 G&G</div>
            <button onClick={()=>setStoreModal(true)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:10}}>{currentStore.emoji} {currentStore.name.split("—")[1]?.trim()||currentStore.name} ▾</button>
          </div>
          <div style={{fontSize:10,color:S.muted,marginTop:1}}><button onClick={goBack} disabled={tabPos<=0} style={{background:"transparent",border:"none",color:tabPos>0?S.text:S.muted,cursor:tabPos>0?"pointer":"default",fontSize:18,padding:"0 4px"}}>‹</button><button onClick={goFwd} disabled={tabPos>=tabHistory.length-1} style={{background:"transparent",border:"none",color:tabPos<tabHistory.length-1?S.text:S.muted,cursor:tabPos<tabHistory.length-1?"pointer":"default",fontSize:18,padding:"0 4px"}}>›</button>{user.role==="patron"?"👑":"👤"} {user.name}{Object.keys(sessions).length>0&&<span style={{color:S.green,marginLeft:6}}>🎮{Object.keys(sessions).length}</span>}{(lossAlerts.length>0||ingAlerts.length>0)&&<span style={{color:S.red,marginLeft:6}}>⚠️</span>}{saveOk&&<span style={{color:S.green,marginLeft:6,fontWeight:700}}>☁️✓</span>}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:17,fontWeight:800,color:S.green}}>{fmt(totalCA)}</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:50,height:4,background:S.card3,borderRadius:2}}><div style={{width:`${goalPct}%`,height:"100%",background:goalPct>=100?S.green:goalPct>=70?S.gold:S.orange,borderRadius:2}}/></div><span style={{fontSize:9,color:S.muted}}>{goalPct}%</span></div>
          </div>
          <button onClick={()=>setUser(null)} style={{background:S.card3,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:11}}>🔒</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:S.card,borderBottom:`1px solid ${S.border}`,overflowX:"auto",scrollbarWidth:"none"}}>
        {[["home","🏠"],["caisse","🛒"],["gaming","🎮"],["stocks","📦"],["planning","🧮"],["recettes","📖"],["ia","🤖"],["bilan","📊"],["aide","❓"],["audit","🔍"]].map(([id,l])=>(
          <button key={id} style={{...T(tab===id),fontSize:id==="aide"?14:9}} onClick={()=>{setTab(id);touch();}}>{l}</button>
        ))}
      </div>

      {/* ══ HOME ══ */}
      {tab==="home"&&<div style={{padding:14}}>
        {CHECKLIST.filter(i=>!checklist[i]).length>0?
          <div style={{...Card(S.orange),marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontWeight:700,color:S.orange,fontSize:13}}>✅ OUVERTURE</div><span style={{fontSize:11,color:S.muted}}>{CHECKLIST.filter(i=>checklist[i]).length}/{CHECKLIST.length}</span></div>
            <div style={{height:4,background:S.card2,borderRadius:2,marginBottom:10}}><div style={{width:`${(CHECKLIST.filter(i=>checklist[i]).length/CHECKLIST.length)*100}%`,height:"100%",background:S.orange,borderRadius:2}}/></div>
            {CHECKLIST.map(item=><button key={item} onClick={()=>{const nc={...checklist,[item]:!checklist[item]};setChecklist(nc);saveDay({checklist:nc});}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",border:"none",cursor:"pointer",color:S.text,padding:"7px 0",borderBottom:`1px solid ${S.border}`,textAlign:"left"}}><div style={{width:22,height:22,borderRadius:6,border:`2px solid ${checklist[item]?S.green:S.border}`,background:checklist[item]?S.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color:S.bg}}>{checklist[item]&&"✓"}</div><span style={{fontSize:13,color:checklist[item]?S.muted:S.text,textDecoration:checklist[item]?"line-through":"none"}}>{item}</span></button>)}
          </div>:<div style={{...Card(S.green),textAlign:"center",padding:"10px"}}><span style={{color:S.green,fontWeight:700,fontSize:13}}>✅ Ouverture OK — Bonne journée, {user.name} !</span></div>}
        <div style={{...Card(S.purple)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,color:S.purple,fontSize:12}}>🤖 ANALYSE IA</div>
            <button onClick={generateInsight} disabled={insightLoading} style={{...Btn(S.purple,"#fff"),fontSize:11,padding:"5px 10px",opacity:insightLoading?0.5:1}}>{insightLoading?"⏳":"↺ Actualiser"}</button>
          </div>
          {insightLoading?<div style={{color:S.muted,fontSize:12,textAlign:"center",padding:8}}>⏳ Analyse...</div>:aiInsight?<div style={{fontSize:12,color:"#ddd",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{aiInsight}</div>:<div style={{fontSize:12,color:S.muted}}>Appuyez Actualiser pour une analyse personnalisée de votre journée.</div>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[{l:"CA DU JOUR",v:fmt(totalCA),c:S.green,sub:`${goalPct}% obj.`},{l:"BÉNÉFICE NET",v:fmt(netProfit),c:netProfit>=0?S.green:S.red,sub:`Dép. ${fmt(totalExpenses)}`},{l:"FOOD",v:fmt(totalFood),c:S.gold,sub:`${sales.filter(s=>s.items[0]?.cat!=="gaming").length} ventes`},{l:"GAMING",v:fmt(totalGaming),c:S.blue,sub:`${doneSess.length} sessions`}].map(c=>(<div key={c.l} style={Card()}><div style={{fontSize:9,color:S.muted,letterSpacing:1,marginBottom:4}}>{c.l}</div><div style={{fontSize:16,fontWeight:800,color:c.c}}>{c.v}</div><div style={{fontSize:10,color:S.muted,marginTop:2}}>{c.sub}</div></div>))}
        </div>
        <div style={Card()}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:700}}>🎯 Objectif {fmt(dailyGoal)}</span>{user.role==="patron"&&<button onClick={()=>{setNewGoal(String(dailyGoal));setGoalModal(true);}} style={{background:"transparent",border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11}}>Modifier</button>}</div>
          <div style={{height:12,background:S.card2,borderRadius:6,marginBottom:6,overflow:"hidden"}}><div style={{width:`${goalPct}%`,height:"100%",background:`linear-gradient(90deg,${goalPct>=100?S.green:goalPct>=70?S.gold:S.orange},${goalPct>=100?"#00ff9d":goalPct>=70?"#ffed4a":"#ff9500"})`,borderRadius:6,transition:"width .5s",display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:4}}>{goalPct>=15&&<span style={{fontSize:9,fontWeight:700,color:S.bg}}>{goalPct}%</span>}</div></div>
          <div style={{fontSize:11,color:S.muted}}>{goalPct>=100?<span style={{color:S.green,fontWeight:700}}>🎉 Objectif atteint !</span>:<span>Manque <strong style={{color:S.gold}}>{fmt(dailyGoal-totalCA)}</strong></span>}</div>
        </div>
        {(lossAlerts.length>0||ingAlerts.length>0)&&<div style={{...Card(S.red),cursor:"pointer"}} onClick={()=>setTab("stocks")}><div style={{color:S.red,fontWeight:700,fontSize:12,marginBottom:6}}>🚨 {lossAlerts.length+ingAlerts.length} ALERTE(S)</div>{lossAlerts.map(p=><div key={p.id} style={{fontSize:11,color:"#ffaaaa",marginBottom:2}}>{p.emoji} {p.name}: {lossQty(p.id)} manquant(s) — {fmt(lossQty(p.id)*p.price)}</div>)}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[{t:"caisse",i:"🛒",l:"Caisse",c:S.gold,s:`Ticket #${ticketNo}`},{t:"gaming",i:"🎮",l:"Gaming",c:S.green,s:Object.keys(sessions).length>0?`${Object.keys(sessions).length} en cours`:"Libre"},{t:"aide",i:"❓",l:"Guide Employé",c:S.teal,s:"Comment utiliser"},{t:"ia",i:"🤖",l:"Assistant IA",c:S.purple,s:"Conseils & alertes"}].map(r=>(
            <button key={r.t} onClick={()=>setTab(r.t)} style={{...Card(r.c),cursor:"pointer",textAlign:"center",padding:"14px 10px",border:`2px solid ${r.c}`}}><div style={{fontSize:26}}>{r.i}</div><div style={{fontSize:12,fontWeight:700,color:r.c,marginTop:4}}>{r.l}</div><div style={{fontSize:10,color:S.muted}}>{r.s}</div></button>
          ))}
        </div>
      </div>}

      {/* ══ CAISSE ══ */}
      {tab==="caisse"&&<div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}><button style={Sub(cTab==="boissons")} onClick={()=>setCTab("boissons")}>☕ Boissons</button><button style={Sub(cTab==="snacks")} onClick={()=>setCTab("snacks")}>🥞 Snacks</button></div>
        {(()=>{
          const prods=cTab==="boissons"?boissons:snacks;
          const cats=[...new Set(prods.map(function(p){return p.cat||"Autres";}))];
          return cats.map(function(cat){
            const items=prods.filter(function(p){return (p.cat||"Autres")===cat;});
            return React.createElement("div",{key:cat,style:{marginBottom:12}},
              React.createElement("div",{style:{fontSize:10,fontWeight:700,color:S.gold,letterSpacing:1,marginBottom:6,paddingLeft:2,textTransform:"uppercase"}},cat),
              React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}},
                items.map(function(p){
                  return React.createElement("div",{key:p.id,style:{position:"relative"}},
                    React.createElement("button",{onClick:function(){addToCart(p,cTab);},style:{background:S.card2,border:"1px solid "+S.border,borderRadius:10,padding:"10px 6px",cursor:"pointer",color:S.text,textAlign:"center",width:"100%"}},
                      React.createElement("div",{style:{fontSize:24}},p.emoji),
                      React.createElement("div",{style:{fontSize:10,fontWeight:600,margin:"3px 0 2px",lineHeight:1.2}},p.name),
                      React.createElement("div",{style:{fontSize:13,fontWeight:800,color:S.gold}},fmt(p.price)),
                      cTab==="snacks"&&prodQtyFn(p.id)>0?React.createElement("div",{style:{fontSize:9,color:remQty(p.id)>0?S.green:S.red,marginTop:2}},remQty(p.id)>0?"Dispo: "+remQty(p.id):"Épuisé"):null
                    ),
                    user.role==="patron"?React.createElement("div",{style:{display:"flex",gap:2,marginTop:2}},
                      React.createElement("button",{onClick:function(){setEditProd({...p,cat:cTab});},style:{flex:1,background:S.card3,border:"1px solid "+S.blue,color:S.blue,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}},"✏"),
                      React.createElement("button",{onClick:function(){
                        if(!window.confirm("Supprimer "+p.name+"?"))return;
                        if(cTab==="boissons"){const nb=boissons.filter(function(x){return x.id!==p.id;});setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,stations,photoPrice,dailyGoal,ticketNo);}
                        else{const ns=snacks.filter(function(x){return x.id!==p.id;});setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,stations,photoPrice,dailyGoal,ticketNo);}
                        addAudit("SUPPR",p.name);showToast("Supprime",S.red);
                      },style:{flex:1,background:S.card3,border:"1px solid "+S.red,color:S.red,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}},"X")
                    ):null
                  );
                })
              )
            );
          });
        })()}
        {user.role==="patron"&&<button onClick={()=>{setAddProdModal(cTab);setNewProd({name:"",price:"",emoji:"🍽️"});}} style={{width:"100%",background:"transparent",border:`2px dashed ${S.gold}`,borderRadius:10,padding:"10px",cursor:"pointer",color:S.gold,fontWeight:700,fontSize:13,marginBottom:12}}>＋ Ajouter un produit</button>}
        {cart.length>0?<div style={Card()}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:10,fontSize:12,letterSpacing:1}}>🛒 PANIER — Ticket #{ticketNo}</div>
          {cart.map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:15}}>{item.emoji}</span><div style={{flex:1,fontSize:12}}>{item.name}</div><button onClick={()=>updQty(item.id,-1)} style={{background:S.card3,border:`1px solid ${S.border}`,color:S.text,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:16}}>−</button><span style={{fontSize:14,fontWeight:700,minWidth:20,textAlign:"center"}}>{item.qty}</span><button onClick={()=>updQty(item.id,+1)} style={{background:S.card3,border:`1px solid ${S.border}`,color:S.text,width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:16}}>+</button><div style={{minWidth:68,textAlign:"right",fontSize:12,fontWeight:700}}>{fmt(item.price*item.qty)}</div><button onClick={()=>updQty(item.id,-99)} style={{background:"transparent",border:"none",color:S.muted,cursor:"pointer",fontSize:16}}>✕</button></div>)}
          <div style={{borderTop:`1px solid ${S.border}`,marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:16,fontWeight:800}}>TOTAL <span style={{color:S.green}}>{fmt(cartTotal)}</span></div>
            <div style={{display:"flex",gap:8}}><button onClick={()=>setCart([])} style={{...Btn(S.card3,S.red),border:`1px solid ${S.red}`,fontSize:12}}>✕</button><button onClick={requestTicket} style={{...Btn(S.teal),fontSize:13,padding:"10px 14px"}}>🎫 Ticket & Payer</button></div>
          </div>
          <div style={{fontSize:10,color:S.muted,textAlign:"center",marginTop:6}}>⚠️ Le ticket doit être imprimé avant validation</div>
        </div>:<div style={{...Card(),textAlign:"center",color:S.muted,fontSize:13,padding:24}}><div style={{fontSize:36,marginBottom:8}}>🛒</div>Appuie sur un produit</div>}
      </div>}

      {/* ══ GAMING ══ */}
      {tab==="gaming"&&<div style={{padding:14}}>
        {Object.keys(gamingAlerts).length>0&&<div style={{background:S.red,borderRadius:12,padding:12,marginBottom:12,textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>⏰ TEMPS ÉCOULÉ !</div>
          <div style={{fontSize:12,color:"#ffdddd",marginTop:4}}>
            {Object.keys(gamingAlerts).map(sid=>{const st=stations.find(s=>s.id===sid);return st?`${st.emoji} ${st.name}`:sid;}).join(" • ")}
          </div>
          <div style={{fontSize:11,color:"#ffaaaa",marginTop:2}}>Arrêtez la/les partie(s) et encaissez</div>
        </div>}
        {gamingTicket&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}><Ticket items={gamingTicket.items} total={gamingTicket.total} storeName={currentStore.name} employeeName={user.name} ticketNo={ticketNo} onPrint={(pm)=>confirmGaming(true,pm)} onCancel={()=>setGamingTicket(null)} onSkip={()=>confirmGaming(false,payMode)} selectedPayMode={payMode} onPayModeChange={setPayMode}/></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {stations.map(st=>{const ses=sessions[st.id];const status=ses?.status||"libre";
            const bgColor=status==="playing"?"#051505":status==="paid"?"#050a15":S.card;
            const borderColor=status==="playing"?S.green:status==="paid"?S.gold:S.border;
            return(
            <div key={st.id} style={{background:bgColor,border:`2px solid ${borderColor}`,borderRadius:12,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:20}}>{st.emoji}</span>
                {status==="playing"&&<div style={{background:S.green,color:S.bg,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10}}>🔴 EN JEU</div>}
                {status==="paid"&&<div style={{background:S.gold,color:S.bg,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10}}>💛 PAYÉ</div>}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:status==="playing"?S.green:status==="paid"?S.gold:S.text,marginBottom:2}}>{st.name}</div>
              <div style={{fontSize:10,color:S.muted,marginBottom:8}}>1J {fmt(st.rate1)} • 2J {fmt(st.rate2)}/30min</div>
              {status==="playing"&&(()=>{
                const elapsedMins=ses.start?(Date.now()-ses.start)/60000:0;
                const isOver=ses.duree&&elapsedMins>=ses.duree;
                const timeColor=isOver?S.red:elapsedMins>=(ses.duree*0.9)?S.orange:S.green;
                return(<>
                  {isOver&&<div style={{background:S.red,color:"#fff",borderRadius:8,padding:"6px 10px",marginBottom:6,fontWeight:800,fontSize:12,textAlign:"center"}}>
                    ⏰ TEMPS ÉCOULÉ — Arrêtez la partie !
                  </div>}
                  <div style={{fontFamily:"monospace",fontSize:26,fontWeight:800,color:timeColor}}>{elapsed(ses.start)}</div>
                  {ses.duree&&<div style={{fontSize:10,color:S.muted,marginBottom:2}}>Limite: {ses.duree} min</div>}
                  <div style={{fontSize:11,color:S.muted,margin:"2px 0 8px"}}>{ses.players}J • {fmt(liveCost(ses,st))}</div>
                  <button onClick={()=>{setGamingAlerts(a=>{const n={...a};delete n[st.id];return n;});stopSess(st.id,true);}} style={{...Btn(isOver?S.red:S.orange),width:"100%",fontSize:12,padding:"8px"}}>⏹ Stop & Ticket</button>
                  <button onClick={()=>{setGamingAlerts(a=>{const n={...a};delete n[st.id];return n;});stopSess(st.id,false);}} style={{width:"100%",background:"transparent",border:`1px solid ${S.muted}`,color:S.muted,borderRadius:8,padding:"6px",cursor:"pointer",fontSize:11,marginTop:4}}>⚠️ Stop sans ticket</button>
                </>);
              })()}
              {status==="paid"&&<>
                <div style={{fontSize:11,color:S.gold,marginBottom:8,fontWeight:700}}>✅ Payé — {ses.players}J<br/>En attente...</div>
                <button onClick={()=>startGaming(st.id)} style={{...Btn(S.green),width:"100%",fontSize:12,padding:"10px"}}>▶ Démarrer la partie</button>
              </>}
              {status==="libre"&&<div style={{display:"flex",gap:6}}>
                <button onClick={()=>requestGaming(st.id,1)} style={{...Btn(S.green),flex:1,fontSize:11,padding:"9px 4px"}}>💰 1J</button>
                <button onClick={()=>requestGaming(st.id,2)} style={{...Btn(S.blue),flex:1,fontSize:11,padding:"9px 4px"}}>💰 2J</button>
              </div>}
              {user.role==="patron"&&status==="libre"&&<div style={{display:"flex",gap:4,marginTop:6}}>
                <button onClick={()=>setEditStation({...st})} style={{flex:1,background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}}>✏</button>
                <button onClick={()=>{if(!window.confirm("Supprimer "+st.name+"?"))return;const ns=stations.filter(x=>x.id!==st.id);setStations(ns);saveProds(boissons,snacks,ingredients,recipes,ns,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR STATION",st.name);}} style={{flex:1,background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}}>🗑</button>
              </div>}
            </div>);})}
        </div>
        {user.role==="patron"&&<button onClick={()=>setEditStation({id:"",name:"",emoji:"🎮",rate1:1000,rate2:1500})} style={{width:"100%",background:"transparent",border:`2px dashed ${S.gold}`,borderRadius:10,padding:"10px",cursor:"pointer",color:S.gold,fontWeight:700,fontSize:13,marginBottom:12}}>＋ Ajouter une console / station</button>}
      </div>}

      {tab==="stocks"&&<div style={{padding:14}}>

        {/* ── BOUTON SCAN EN HAUT ── */}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={()=>{if(scanRef.current){scanRef.current.dataset.target="stock";scanRef.current.click();}}} disabled={scanLoading&&scanTarget==="stock"} style={{flex:1,background:S.purple,color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:12,fontWeight:700}}>
            {scanLoading&&scanTarget==="stock"?"⏳ Lecture...":"📸 Scanner stock matin"}
          </button>
          <button onClick={()=>{if(scanRef.current){scanRef.current.dataset.target="verif";scanRef.current.click();}}} disabled={scanLoading&&scanTarget==="verif"} style={{flex:1,background:S.orange,color:S.bg,border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:12,fontWeight:700}}>
            {scanLoading&&scanTarget==="verif"?"⏳ Lecture...":"📸 Scanner stock soir"}
          </button>
        </div>

        {/* ── VALEUR TOTALE DU STOCK ── */}
        {(()=>{
          const totalVal=ingredients.reduce(function(sum,ing){return sum+(ingRem(ing.id)*(ing.unitCost||0));},0);
          if(totalVal===0) return null;
          return React.createElement("div",{style:{background:"#0a1a0a",border:"2px solid "+S.gold,borderRadius:12,padding:12,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}},
            React.createElement("span",{style:{fontWeight:700,color:S.gold,fontSize:13}},"💰 Valeur totale du stock"),
            React.createElement("span",{style:{fontWeight:800,color:S.gold,fontSize:18}},fmt(totalVal))
          );
        })()}

        {/* ── LISTE INGRÉDIENTS — stock + valeur + saisie ── */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,color:S.text,fontSize:13}}>🌾 Ingrédients</div>
            {user.role==="patron"&&<button onClick={()=>setAddIngModal(true)} style={{background:S.teal,color:S.bg,border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>＋ Ajouter</button>}
          </div>
          {ingredients.map(function(ing){
            const s=ingStock[ing.id]||{};
            const phys=ingPhys[ing.id];
            const rem=ingRem(ing.id);
            const al=ingAlert(ing.id);
            const val=rem*(ing.unitCost||0);
            return React.createElement("div",{key:ing.id,style:{background:al?"#1a0000":S.card,border:"1px solid "+(al?S.red:S.border),borderRadius:10,padding:"10px 12px",marginBottom:6}},
              React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
                React.createElement("span",{style:{fontSize:20}},ing.emoji),
                React.createElement("div",{style:{flex:1}},
                  React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
                    React.createElement("span",{style:{fontWeight:700,fontSize:12}},ing.name),
                    React.createElement("span",{style:{fontSize:11,fontWeight:700,color:val>0?S.green:S.muted}},val>0?fmt(val):"—")
                  ),
                  React.createElement("div",{style:{display:"flex",gap:12,marginTop:4,alignItems:"center"}},
                    React.createElement("div",{style:{flex:1}},
                      React.createElement("div",{style:{fontSize:9,color:S.muted,marginBottom:2}},"Matin"),
                      React.createElement("input",{type:"number",step:"0.01",value:s.opening!=null?s.opening:"",placeholder:"0",onChange:function(e){const v=parseFloat(e.target.value)||0;const ni={...ingStock,[ing.id]:{...s,opening:v}};setIngStock(ni);saveDay({ingStock:ni});},style:{width:"100%",background:S.card2,border:"1px solid "+S.border,color:S.gold,borderRadius:6,padding:"4px 6px",fontSize:12,fontWeight:700,outline:"none",boxSizing:"border-box"}})
                    ),
                    React.createElement("div",{style:{flex:1}},
                      React.createElement("div",{style:{fontSize:9,color:S.muted,marginBottom:2}},"Soir"),
                      React.createElement("input",{type:"number",step:"0.01",value:phys!=null?phys:"",placeholder:"0",onChange:function(e){const v=parseFloat(e.target.value)||0;const ni={...ingPhys,[ing.id]:v};setIngPhys(ni);saveDay({ingPhys:ni});},style:{width:"100%",background:S.card2,border:"1px solid "+(phys!=null&&phys<rem-0.05?S.red:S.border),color:phys!=null&&phys<rem-0.05?S.red:S.text,borderRadius:6,padding:"4px 6px",fontSize:12,outline:"none",boxSizing:"border-box"}})
                    ),
                    React.createElement("div",{style:{flex:1,textAlign:"center"}},
                      React.createElement("div",{style:{fontSize:9,color:S.muted,marginBottom:2}},"Restant"),
                      React.createElement("div",{style:{fontSize:12,fontWeight:700,color:al?S.red:S.green}},fmtQ(rem,ing.unit))
                    ),
                    React.createElement("div",{style:{fontSize:9,color:S.muted,minWidth:30,textAlign:"center"}},
                      phys!=null&&phys<rem-0.05?React.createElement("span",{style:{color:S.red,fontSize:16,display:"block"}},"⚠️"):null,
                      React.createElement("span",null,ing.unit),
                      React.createElement("br",null),
                      React.createElement("span",null,fmt(ing.unitCost||0))
                    )
                  )
                ),
                user.role==="patron"?React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:3,marginLeft:4}},
                  React.createElement("button",{onClick:function(){setEditIng({...ing});},style:{background:S.card3,border:"1px solid "+S.blue,color:S.blue,borderRadius:4,padding:"2px 5px",cursor:"pointer",fontSize:9}},"✏"),
                  React.createElement("button",{onClick:function(){
                    if(!window.confirm("Supprimer "+ing.name+"?"))return;
                    const ni=ingredients.filter(function(x){return x.id!==ing.id;});
                    setIngredients(ni);saveProds(boissons,snacks,ni,recipes,stations,photoPrice,dailyGoal,ticketNo);
                    addAudit("SUPPR ING",ing.name);
                  },style:{background:S.card3,border:"1px solid "+S.red,color:S.red,borderRadius:4,padding:"2px 5px",cursor:"pointer",fontSize:9}},"X")
                ):null
              )
            );
          })}
        </div>

        {/* ── PRODUCTION DU JOUR ── */}
        <div style={{background:S.card,border:"1px solid "+S.border,borderRadius:12,padding:12,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:13}}>🍳 Production du jour</div>
            <button onClick={()=>setAddProdModal2(true)} style={{background:S.green,color:S.bg,border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>＋ Produire</button>
          </div>
          {productions.length===0&&React.createElement("div",{style:{color:S.muted,fontSize:11,textAlign:"center",padding:8}},"Aucune production enregistrée")}
          {productions.map(function(p,i){
            return React.createElement("div",{key:i,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid "+S.border}},
              React.createElement("span",{style:{fontSize:13}},p.snackEmoji||"🍳"," ",p.snackName),
              React.createElement("span",{style:{fontWeight:700,color:S.green}},"×",p.qty),
              React.createElement("span",{style:{fontSize:10,color:S.muted}},p.time),
              React.createElement("button",{onClick:function(){const np=productions.filter(function(_,j){return j!==i;});setProductions(np);saveDay({productions:np});},style:{background:"transparent",border:"none",color:S.muted,cursor:"pointer",fontSize:12}},"✕")
            );
          })}
        </div>

        {/* ── ALERTES PERTES/VOLS ── */}
        {lossAlerts.length>0&&React.createElement("div",{style:{background:"#1a0000",border:"2px solid "+S.red,borderRadius:12,padding:12,marginBottom:12}},
          React.createElement("div",{style:{fontWeight:800,color:S.red,marginBottom:8,fontSize:13}},"🚨 Alertes pertes / vols"),
          lossAlerts.map(function(a,i){
            return React.createElement("div",{key:i,style:{fontSize:11,color:"#ffaaaa",padding:"3px 0"}},
              "⚠️ ",a.name," — manque ",fmtQ(a.diff,a.unit)," (",fmt(a.val),")"
            );
          })
        )}

      </div>}}

      {tab==="recettes"&&<div style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:14}}>📖 Recettes</div>
          {user.role==="patron"&&<button onClick={()=>setEditRec({id:"",emoji:"🍽️",name:"",category:"",ingredients:[]})} style={{background:S.teal,color:S.bg,border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>＋ Nouvelle</button>}
        </div>
        {[...new Set(recipes.map(r=>r.category||"Autres"))].map(cat=>(
          <div key={cat} style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:S.gold,letterSpacing:1,marginBottom:6}}>{cat.toUpperCase()}</div>
            {recipes.filter(r=>(r.category||"Autres")===cat).map(rec=>(
              <div key={rec.id} style={{...Card(),marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:20}}>{rec.emoji}</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:12}}>{rec.name}</div>
                      <div style={{fontSize:10,color:S.muted}}>
                        {(rec.ingredients||[]).map(ri=>{const ing=ingredients.find(x=>x.id===ri.id);return ing?`${ing.name} ${fmtQ(ri.qty,ing.unit)}`:null;}).filter(Boolean).join(" • ")}
                      </div>
                    </div>
                  </div>
                  {user.role==="patron"&&<div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setEditRec({...rec})} style={{background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11}}>✏</button>
                    <button onClick={()=>{if(!window.confirm("Supprimer "+rec.name+"?"))return;const nr=recipes.filter(x=>x.id!==rec.id);setRecipes(nr);saveProds(boissons,snacks,ingredients,nr,stations,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR REC",rec.name);showToast("Supprimé",S.red);}} style={{background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11}}>🗑</button>
                  </div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>}

      {tab==="bilan"&&<div style={{padding:14}}>
        <div style={{...Card(),marginBottom:10}}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:10,fontSize:12,letterSpacing:1}}>📊 BILAN DU JOUR</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>🛒 Ventes food</span><span style={{color:S.green,fontWeight:700}}>{fmt(totalFood)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>🎮 Gaming</span><span style={{color:S.green,fontWeight:700}}>{fmt(totalGaming)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>📸 Photocopies</span><span style={{color:S.green,fontWeight:700}}>{fmt(photoCount*photoPrice)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>💸 Dépenses</span><span style={{color:S.red,fontWeight:700}}>-{fmt(totalExpenses)}</span></div>
          <div style={{borderTop:`1px solid ${S.border}`,paddingTop:8,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:800,fontSize:14}}>CA NET</span>
            <span style={{fontWeight:800,fontSize:16,color:netProfit>=0?S.green:S.red}}>{fmt(netProfit)}</span>
          </div>
        </div>

        {/* Récap modes de paiement */}
        {(()=>{
          const byMode={especes:0,wave:0,orange:0,free:0};
          sales.forEach(s=>{const m=s.payMode||"especes";byMode[m]=(byMode[m]||0)+s.total;});
          const active=Object.entries(byMode).filter(([,v])=>v>0);
          if(!active.length) return null;
          return(<div style={{...Card(),marginBottom:10}}>
            <div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>💳 PAR MODE DE PAIEMENT</div>
            {active.map(([k,v])=>{const cfg={especes:{l:"💵 Espèces",c:S.green},wave:{l:"📱 Wave",c:S.blue},orange:{l:"🟠 Orange Money",c:S.orange},free:{l:"📲 Free Money",c:S.purple}};const {l,c}=cfg[k]||{l:k,c:S.text};return(<div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${S.border}`}}><span style={{color:c,fontSize:12}}>{l}</span><span style={{fontWeight:700,color:c}}>{fmt(v)}</span></div>);})}
            <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0 0",fontSize:11,color:S.muted}}><span>💵 En caisse physique</span><span style={{fontWeight:700,color:S.green}}>{fmt(byMode.especes||0)}</span></div>
          </div>);
        })()}

        {/* Clôture caisse */}
        <div style={{...Card(),marginBottom:10}}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>💵 CLÔTURE CAISSE</div>
          {BILLETS.map(b=>(
            <div key={b} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:S.muted,minWidth:60}}>{fmt(b)}</span>
              <input type="number" min={0} value={cashCount[b]||""} onChange={e=>setCashCount(p=>({...p,[b]:parseInt(e.target.value)||0}))} placeholder="0" style={{flex:1,background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:6,padding:"6px",fontSize:13,outline:"none"}}/>
              <span style={{fontSize:11,color:S.muted,minWidth:60,textAlign:"right"}}>{fmt((cashCount[b]||0)*b)}</span>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${S.border}`,paddingTop:8,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:13,fontWeight:700}}>Total compté</span>
            <span style={{fontWeight:800,fontSize:15,color:cashDiff===0?S.green:cashDiff>0?S.blue:S.red}}>{fmt(cashTotal)}</span>
          </div>
          {cashDiff!==0&&<div style={{marginTop:6,padding:"6px 10px",borderRadius:8,background:cashDiff>0?"#001a0d":"#1a0000",fontSize:11,fontWeight:700,color:cashDiff>0?S.green:S.red,textAlign:"center"}}>
            {cashDiff>0?"✅ Surplus":"⚠️ Manque"} : {fmt(Math.abs(cashDiff))}
          </div>}
        </div>

        {/* Rapport WhatsApp — lien direct */}
        <div style={{...Card()}}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>📱 ENVOYER AU PATRON</div>
          <button onClick={()=>{
            const byMode={especes:0,wave:0,orange:0,free:0};
            sales.forEach(s=>{const m=s.payMode||"especes";byMode[m]=(byMode[m]||0)+s.total;});
            const top3=top5.slice(0,3).map(p=>`${p.emoji}${p.name} ×${p.sold}`).join(", ");
            const alertLine=lossAlerts.length>0?"⚠️ ALERTES: "+lossAlerts.map(a=>`${a.name} manque ${lossQty(a.id)}`).join(", "):"✅ Pas d'anomalie stock";
            const msg=`🎮 GAME & GAUFRE — ${currentStore.name}%0A📅 ${new Date().toLocaleDateString("fr-FR")} à ${timeStr()}%0A%0A💰 CA TOTAL: ${fmt(totalCA)}%0A🛒 Food: ${fmt(totalFood)} | 🎮 Gaming: ${fmt(totalGaming)}%0A📈 Net: ${fmt(netProfit)}%0A%0A💳 Espèces: ${fmt(byMode.especes)} | Wave: ${fmt(byMode.wave)} | Orange: ${fmt(byMode.orange)}%0A%0A🏆 Top ventes: ${top3||"—"}%0A%0A${alertLine}%0A%0A🎫 Tickets: ${sales.length} | Sessions: ${doneSess.length}`;
            window.open(`https://wa.me/${PATRON_NUM}?text=${msg}`,"_blank");
            addAudit("RAPPORT ENVOYÉ",currentStore.name);
          }} style={{width:"100%",background:"#25D366",color:"#fff",border:"none",borderRadius:10,padding:"12px",cursor:"pointer",fontSize:14,fontWeight:800}}>
            📲 Envoyer sur WhatsApp du patron
          </button>
          <div style={{fontSize:10,color:S.muted,textAlign:"center",marginTop:6}}>Ouvre WhatsApp directement avec le rapport</div>
        </div>
      </div>}

      {tab==="ia"&&<div style={{padding:14}}>
        <div style={{...Card(),marginBottom:10}}>
          <div style={{fontWeight:700,color:S.purple,fontSize:13,marginBottom:8}}>🤖 Assistant IA Game & Gaufre</div>
          <div style={{background:"#0a0a1a",borderRadius:8,padding:8,minHeight:160,maxHeight:260,overflowY:"auto",marginBottom:8}}>
            {aiMessages.length===0&&<div style={{color:S.muted,fontSize:11,textAlign:"center",paddingTop:60}}>Posez-moi une question sur votre business...</div>}
            {aiMessages.map((m,i)=>(
              <div key={i} style={{marginBottom:8,textAlign:m.role==="user"?"right":"left"}}>
                <div style={{display:"inline-block",background:m.role==="user"?S.blue:S.card2,color:S.text,borderRadius:10,padding:"6px 10px",maxWidth:"85%",fontSize:11}}>
                  {m.content}
                </div>
              </div>
            ))}
            {aiLoading&&<div style={{color:S.muted,fontSize:11}}>⏳ Réflexion...</div>}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
            {["Analyse mes ventes","Optimise mes stocks","Conseils du jour","Compare cette semaine"].map(q=>(
              <button key={q} onClick={()=>sendAiMsg(q)} style={{background:S.card3,border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:10}}>{q}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAiMsg(aiInput)} placeholder="Posez une question..." style={{flex:1,background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none"}}/>
            <button onClick={()=>sendAiMsg(aiInput)} style={{...Btn(S.purple),padding:"8px 12px"}}>▶</button>
          </div>
        </div>
      </div>}

      {tab==="audit"&&<div style={{padding:14}}>
        <div style={{...Card()}}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:12,letterSpacing:1}}>🔍 JOURNAL D'AUDIT</div>
          {[...audit].reverse().slice(0,50).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:`1px solid ${S.border}`,fontSize:10}}>
              <span style={{color:S.muted,minWidth:40}}>{a.time}</span>
              <span style={{color:S.blue,minWidth:60}}>{a.by}</span>
              <span style={{color:S.text,flex:1}}>{a.msg}</span>
            </div>
          ))}
          {audit.length===0&&<div style={{color:S.muted,fontSize:11,textAlign:"center",padding:20}}>Aucune action enregistrée</div>}
        </div>
      </div>}

      {tab==="aide"&&<div style={{padding:14}}>
        {GUIDE.map(g=>(
          <div key={g.id} style={{...Card(),marginBottom:8,border:`1px solid ${g.color}33`}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:26}}>{g.emoji}</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:g.color,marginBottom:6}}>{g.title}</div>
                {g.steps.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:6,marginBottom:4}}>
                    <span style={{fontSize:12}}>{s.icon}</span>
                    <span style={{fontSize:11,color:S.muted,lineHeight:1.4}}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>}

      {tab==="planning"&&<div style={{padding:14}}>
        <div style={{...Card(),marginBottom:10}}>
          <div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:12}}>🧮 PLANNING COURSES</div>
          <div style={{fontSize:11,color:S.muted,marginBottom:10}}>Entrez les quantités à produire aujourd'hui</div>
          {recipes.map(rec=>(
            <div key={rec.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:16}}>{rec.emoji}</span>
              <span style={{flex:1,fontSize:11}}>{rec.name}</span>
              <input type="number" min={0} value={planQty[rec.id]||""} onChange={e=>setPlanQty(p=>({...p,[rec.id]:parseInt(e.target.value)||0}))} placeholder="0" style={{width:60,background:S.card2,border:`1px solid ${S.border}`,color:S.gold,borderRadius:6,padding:"5px",fontSize:12,fontWeight:700,outline:"none",textAlign:"center"}}/>
            </div>
          ))}
        </div>
        {Object.values(planQty).some(v=>v>0)&&(()=>{
          const shopping=computeShopping();
          const toBuy=shopping.filter(x=>x.toBuy>0);
          return(<div style={{...Card()}}>
            <div style={{fontWeight:700,color:S.teal,marginBottom:8,fontSize:12}}>🛒 LISTE DE COURSES</div>
            {toBuy.length===0?<div style={{color:S.green,fontSize:11}}>✅ Stock suffisant pour la production prévue</div>:
            toBuy.map(x=><div key={x.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${S.border}`}}>
              <span style={{fontSize:11}}>{x.emoji} {x.name}</span>
              <span style={{fontSize:11,fontWeight:700,color:S.orange}}>Acheter {fmtQ(x.toBuy,x.unit)}</span>
            </div>)}
            <button onClick={()=>{
              const msg=toBuy.map(x=>`• ${x.name}: ${fmtQ(x.toBuy,x.unit)}`).join("%0A");
              window.open(`https://wa.me/?text=🛒 Liste courses Game & Gaufre:%0A${msg}`,"_blank");
            }} style={{...Btn(S.teal),width:"100%",marginTop:8,padding:"10px",fontSize:12}}>📲 Envoyer liste sur WhatsApp</button>
          </div>);
        })()}
      </div>}


      {/* Fin des onglets */}
    </div>
  );
}
