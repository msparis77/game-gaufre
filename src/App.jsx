import React, { useState, useEffect, useCallback, useRef } from "react";

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
const INIT_B=[{id:"b1",name:"Café",price:200,emoji:"☕"},{id:"b2",name:"Café Lait",price:250,emoji:"☕"},{id:"b3",name:"Chocolat",price:300,emoji:"🍫"},{id:"b4",name:"Thé",price:200,emoji:"🍵"},{id:"b5",name:"Café Touba",price:150,emoji:"☕"},{id:"b6",name:"Canette",price:500,emoji:"🥤"},{id:"b7",name:"Autre Jus",price:300,emoji:"🧃"}];
const INIT_S=[{id:"s1",name:"Crêpe Sucre",price:500,emoji:"🥞"},{id:"s2",name:"Crêpe Confiture",price:600,emoji:"🥞"},{id:"s3",name:"Crêpe Nutella",price:1500,emoji:"🥞"},{id:"s4",name:"Gaufre Sucre",price:500,emoji:"🧇"},{id:"s5",name:"Gaufre Nutella",price:1200,emoji:"🧇"},{id:"s6",name:"Poulet-Fromage",price:1500,emoji:"🍗"},{id:"s7",name:"Bœuf-Fromage",price:2000,emoji:"🥩"},{id:"s8",name:"Sandwich",price:1000,emoji:"🥪"}];
const INIT_ING=[{id:"i1",name:"Farine",unit:"kg",emoji:"🌾",unitCost:300},{id:"i2",name:"Lait poudre",unit:"kg",emoji:"🥛",unitCost:6000},{id:"i3",name:"Beurre",unit:"kg",emoji:"🧈",unitCost:7000},{id:"i4",name:"Sucre",unit:"kg",emoji:"🍬",unitCost:470},{id:"i5",name:"Oeufs",unit:"pcs",emoji:"🥚",unitCost:62},{id:"i6",name:"Confiture",unit:"kg",emoji:"🍓",unitCost:5000},{id:"i7",name:"Nutella",unit:"kg",emoji:"🍫",unitCost:10000},{id:"i8",name:"Poulet",unit:"kg",emoji:"🍗",unitCost:2200},{id:"i9",name:"Fromage",unit:"kg",emoji:"🧀",unitCost:6000},{id:"i10",name:"Thon",unit:"kg",emoji:"🐟",unitCost:3000},{id:"i11",name:"Pain",unit:"pcs",emoji:"🍞",unitCost:50},{id:"i12",name:"Levure",unit:"kg",emoji:"🧪",unitCost:5000}];
const INIT_REC=[{id:"r1",emoji:"🥞",name:"Crêpe Sucre",category:"Crêpes",snackId:"s1",ingredients:[{id:"i1",qty:0.060},{id:"i2",qty:0.015},{id:"i3",qty:0.005},{id:"i4",qty:0.005},{id:"i5",qty:0.5}]},{id:"r2",emoji:"🥞",name:"Crêpe Confiture",category:"Crêpes",snackId:"s2",ingredients:[{id:"i1",qty:0.060},{id:"i2",qty:0.015},{id:"i3",qty:0.005},{id:"i6",qty:0.030},{id:"i5",qty:0.5}]},{id:"r3",emoji:"🥞",name:"Crêpe Nutella",category:"Crêpes",snackId:"s3",ingredients:[{id:"i1",qty:0.060},{id:"i2",qty:0.015},{id:"i3",qty:0.005},{id:"i7",qty:0.040},{id:"i5",qty:0.5}]},{id:"r4",emoji:"🧇",name:"Gaufre Sucre",category:"Gaufres",snackId:"s4",ingredients:[{id:"i1",qty:0.050},{id:"i2",qty:0.008},{id:"i3",qty:0.015},{id:"i4",qty:0.008},{id:"i5",qty:0.5},{id:"i12",qty:0.002}]},{id:"r5",emoji:"🧇",name:"Gaufre Nutella",category:"Gaufres",snackId:"s5",ingredients:[{id:"i1",qty:0.050},{id:"i2",qty:0.008},{id:"i3",qty:0.015},{id:"i7",qty:0.040},{id:"i5",qty:0.5},{id:"i12",qty:0.002}]},{id:"r6",emoji:"🍗",name:"Poulet-Fromage",category:"Salées",snackId:"s6",ingredients:[{id:"i1",qty:0.060},{id:"i2",qty:0.015},{id:"i3",qty:0.005},{id:"i5",qty:0.5},{id:"i8",qty:0.080},{id:"i9",qty:0.040}]},{id:"r7",emoji:"🥩",name:"Bœuf-Fromage",category:"Salées",snackId:"s7",ingredients:[{id:"i1",qty:0.060},{id:"i2",qty:0.015},{id:"i3",qty:0.005},{id:"i5",qty:0.5},{id:"i8",qty:0.080},{id:"i9",qty:0.040}]},{id:"r8",emoji:"🥪",name:"Sandwich Thon",category:"Sandwichs",snackId:"s8",ingredients:[{id:"i10",qty:0.060},{id:"i9",qty:0.030},{id:"i11",qty:2}]}];
const INIT_STATIONS=[{id:"ps1",name:"PS5 N°1",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps2",name:"PS5 N°2",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps3",name:"PS5 N°3",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps4",name:"PS5 N°4",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps5",name:"PS5 N°5",emoji:"🎮",rate1:1000,rate2:1500},{id:"ps6",name:"Ecran Geant",emoji:"🖥",rate1:1500,rate2:2000},{id:"pc1",name:"PC N°1",emoji:"💻",rate1:1000,rate2:1500},{id:"pc2",name:"PC N°2",emoji:"💻",rate1:1000,rate2:1500},{id:"pc3",name:"PC N°3",emoji:"💻",rate1:1000,rate2:1500}];

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


const fbSave=async(key,data)=>{try{await fetch("/api/store",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,data})});}catch(e){}};const fbGet=async(key)=>{try{const r=await fetch("/api/store?key="+encodeURIComponent(key));if(!r.ok)return null;return await r.json();}catch(e){return null;}};
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
function Ticket({items,total,storeName,employeeName,ticketNo,onPrint,onCancel}){
  const printTicket=()=>{
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
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>✕ Annuler</button>
        <button onClick={printTicket} style={{background:S.teal,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:2}}>🖨️ Imprimer & Valider</button>
      </div>
      <div style={{fontSize:10,color:S.muted,textAlign:"center",marginTop:8}}>Obligatoire avant encaissement</div>
    <input ref={scanRef} type="file" accept="image/*,image/heic,image/heif" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){const t=e.target.dataset.target||"stock";scanIA(e.target.files[0],t);e.target.value="";}}}/>
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
  const [tab,setTab]=useState("home");
  const [stSub,setStSub]=useState("ing");
  const [cTab,setCTab]=useState("boissons");
  const [guideSection,setGuideSection]=useState(null);
  const [boissons,setBoissons]=useState(INIT_B);
  const [snacks,setSnacks]=useState(INIT_S);
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
  const [addIngModal,setAddIngModal]=useState(false);
  const [stations,setStations]=useState(INIT_STATIONS);
  const [editStation,setEditStation]=useState(null);
  const [addStationModal,setAddStationModal]=useState(false);
  const [editRec,setEditRec]=useState(null);
  const [addProdCat,setAddProdCat]=useState(null);
  const [scanLoading,setScanLoading]=useState(false);
  const [scanTarget,setScanTarget]=useState("");
  const scanRef=useRef(null);
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

  useEffect(()=>{const iv=setInterval(()=>{setTick(t=>t+1);if(user&&Date.now()-lastAct>5*60*1000)setUser(null);},1000);return()=>clearInterval(iv);},[user,lastAct]);
  const touch=()=>setLastAct(Date.now());

  useEffect(()=>{(async()=>{
    try{let s=localStorage.getItem("gg3-emps");let e=s?JSON.parse(s):await fbGet("gg3-emps");if(e){setEmps(e);empRef.current=e;}}catch(e){}
    try{let s=localStorage.getItem("gg3-prods");let d=s?JSON.parse(s):await fbGet("gg3-prods");if(d){if(d.b)setBoissons(d.b);if(d.s)setSnacks(d.s);if(d.ing)setIngredients(d.ing);if(d.rec)setRecipes(d.rec);if(d.sta)setStations(d.sta);if(d.pp)setPhotoPrice(d.pp);if(d.goal)setDailyGoal(d.goal);if(d.tno)setTicketNo(d.tno);}}catch(e){}
    try{let s=localStorage.getItem("gg3-day-"+todayStr());let d=s?JSON.parse(s):await fbGet("gg3-day-"+todayStr());if(d){if(d.sales)setSales(d.sales);if(d.done)setDoneSess(d.done);if(d.pc!=null)setPhotoCount(d.pc);if(d.audit)setAudit(d.audit);if(d.checklist)setChecklist(d.checklist);if(d.expenses)setExpenses(d.expenses);if(d.ingStock)setIngStock(d.ingStock);if(d.ingPhys)setIngPhys(d.ingPhys);if(d.productions)setProductions(d.productions);if(d.finPhys)setFinPhys(d.finPhys);}}catch(e){}
    const hist={};for(let i=1;i<=7;i++){const dt=new Date();dt.setDate(dt.getDate()-i);const ds=dt.toISOString().split("T")[0];try{let s=localStorage.getItem("gg3-day-"+ds);let d=s?JSON.parse(s):await fbGet("gg3-day-"+ds);if(d)hist[ds]={sales:d.sales||[],expenses:d.expenses||[],pc:d.pc||0};}catch(e){}}
    setHistory(hist);
  })();},[]);

  const saveEmps=e=>{try{localStorage.setItem("gg3-emps",JSON.stringify(e));}catch(e){}fbSave("gg3-emps",e);};
  const saveProds=(b,s,ing,rec,sta,pp,g,tno)=>{try{localStorage.setItem("gg3-prods",JSON.stringify({b,s,ing,rec,sta,pp,goal:g,tno}));}catch(e){}fbSave("gg3-prods",{b,s,ing,rec,sta,pp,goal:g,tno});};
  const saveDay=upd=>{try{let c={};try{const s=localStorage.getItem("gg3-day-"+todayStr());if(s)c=JSON.parse(s);}catch(e){}const nd={...c,...upd};localStorage.setItem("gg3-day-"+todayStr(),JSON.stringify(nd));fbSave("gg3-day-"+todayStr(),nd);}catch(e){}};
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
  const requestTicket=()=>{if(!cart.length)return;setPendingTicket({items:[...cart],total:cartTotal});};
  const confirmSaleAfterPrint=async()=>{
    if(!pendingTicket)return;
    const sale={id:uid(),items:pendingTicket.items,total:pendingTicket.total,time:timeStr(),date:todayStr(),by:user?.name,ticketNo};
    setSales(prev=>{const ns=[...prev,sale];saveDay({sales:ns});return ns;});
    const newTno=ticketNo+1;setTicketNo(newTno);
    saveProds(boissons,snacks,ingredients,recipes,stations,photoPrice,dailyGoal,newTno);
    setCart([]);setPendingTicket(null);
    addAudit("VENTE",`#${ticketNo} ${fmt(pendingTicket.total)} — ${pendingTicket.items.map(i=>`${i.name}×${i.qty}`).join(", ")}`);
    showToast(`✓ Ticket #${ticketNo} — ${fmt(pendingTicket.total)}`);
  };
  const deleteSale=id=>requirePatron(()=>{setSales(prev=>{const ns=prev.filter(s=>s.id!==id);saveDay({sales:ns});return ns;});addAudit("ANNULATION","Patron");showToast("Vente annulée",S.orange);});

  // STOCK
  const setIngField=(id,field,val)=>{setIngStock(prev=>{const ns={...prev,[id]:{...prev[id]||{},[field]:Number(val)||0}};if(field==="opening")ns[id].current=Number(val)||0;saveDay({ingStock:ns});return ns;});};
  const setIngPhysVal=(id,val)=>{setIngPhys(prev=>{const np={...prev,[id]:Number(val)||0};saveDay({ingPhys:np});return np;});};

  const scanIA=async(file,target)=>{
    setScanLoading(true);setScanTarget(target);
    try{
      const b64=await new Promise((res,rej)=>{
        const img=new Image();const url=URL.createObjectURL(file);
        img.onload=()=>{const canvas=document.createElement("canvas");let w=img.width,h=img.height;const MAX=1600;if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);res(canvas.toDataURL("image/jpeg",0.85).split(",")[1]);};
        img.onerror=rej;img.src=url;
      });
      const liste=ingredients.map(i=>i.name).join(", ");
      const moment=target==="verif"?"du soir":"du matin";
      const prompt=`Tu es assistant pour un cafe-crêperie a Dakar. Ingredients connus: ${liste}. Regarde cette fiche et extrais les quantites de stock ${moment}. Si un produit n'existe pas dans la liste, indique nouveau:true. Reponds UNIQUEMENT en JSON: {"stocks":[{"nom":"...","quantite":0,"unite":"kg","prixUnitaire":0,"nouveau":false,"emoji":"📦"}]}`;
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1000,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:"image/jpeg",data:b64}},{type:"text",text:prompt}]}]})});
      const d=await r.json();
      const txt=d.content?.map(c=>c.text||"").join("")||"";
      const match=txt.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("L'IA n'a pas pu lire la fiche");
      const parsed=JSON.parse(match[0]);
      if(parsed.stocks){
        const newIS=target==="verif"?{...ingPhys}:{...ingStock};
        let newIngList=[...ingredients];
        let nbNew=0;
        parsed.stocks.forEach(s=>{
          let ing=newIngList.find(i=>i.name.toLowerCase().includes(s.nom.toLowerCase())||s.nom.toLowerCase().includes(i.name.toLowerCase()));
          if(!ing&&s.nouveau!==false){
            const nid="ing_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);
            ing={id:nid,name:s.nom,emoji:s.emoji||"📦",unit:s.unite||"kg",unitCost:s.prixUnitaire||0};
            newIngList=[...newIngList,ing];nbNew++;
          }
          if(ing){if(target==="verif")newIS[ing.id]=s.quantite;else newIS[ing.id]={...newIS[ing.id]||{},opening:s.quantite};}
        });
        if(nbNew>0){setIngredients(newIngList);saveProds(boissons,snacks,newIngList,recipes,photoPrice,dailyGoal,ticketNo);}
        if(target==="verif"){setIngPhys(newIS);saveDay({ingPhys:newIS});}else{setIngStock(newIS);saveDay({ingStock:newIS});}
        addAudit("SCAN STOCK",`${parsed.stocks.length} ingredients${nbNew>0?" (+"+nbNew+" nouveaux)":""}`);
        showToast(nbNew>0?`✓ ${parsed.stocks.length} ingredients — ${nbNew} nouveaux crees`:`✓ ${parsed.stocks.length} ingredients mis a jour`);
      }
    }catch(e){showToast("Erreur: "+e.message,S.red);}
    setScanLoading(false);setScanTarget("");
  };

  const recordProduction=()=>{if(!prodModal||!prodQtyVal)return;const qty=parseInt(prodQtyVal)||0;const rec=recipes.find(r=>r.snackId===prodModal.id);const newIS={...ingStock};if(rec){rec.ingredients.forEach(ri=>{const cur=newIS[ri.id]?.opening??0;newIS[ri.id]={...newIS[ri.id]||{},opening:Math.max(0,cur-ri.qty*qty)};});}const prod={id:uid(),snackId:prodModal.id,snackName:prodModal.name,snackEmoji:prodModal.emoji,qty,time:timeStr()};const np=[...productions,prod];setIngStock(newIS);setProductions(np);saveDay({ingStock:newIS,productions:np});addAudit("PRODUCTION",`${prodModal.emoji}${prodModal.name} × ${qty}`);setProdModal(null);setProdQtyVal("");showToast(`✓ ${qty} ${prodModal.name} produit(s)`);};

  // GAMING
  const elapsed=start=>{const s=Math.floor((Date.now()-start)/1000);return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;};
  const liveCost=(ses,st)=>{const slots=Math.ceil((Date.now()-ses.start)/60000/30)||1;return slots*(ses.players===2?st.rate2:st.rate1);};
  const startSess=(sid,players)=>{touch();setSessions(prev=>({...prev,[sid]:{start:Date.now(),players}}));};
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
      {pendingTicket&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}><Ticket items={pendingTicket.items} total={pendingTicket.total} storeName={currentStore.name} employeeName={user.name} ticketNo={ticketNo} onPrint={confirmSaleAfterPrint} onCancel={()=>setPendingTicket(null)}/></div>}

      {/* HEADER */}
      <div style={{background:S.card,padding:"11px 16px",borderBottom:`3px solid ${S.gold}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontSize:14,fontWeight:800,color:S.gold}}>🎮 G&G</div>
            <button onClick={()=>setStoreModal(true)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:10}}>{currentStore.emoji} {currentStore.name.split("—")[1]?.trim()||currentStore.name} ▾</button>
          </div>
          <div style={{fontSize:10,color:S.muted,marginTop:1}}>{user.role==="patron"?"👑":"👤"} {user.name}{Object.keys(sessions).length>0&&<span style={{color:S.green,marginLeft:6}}>🎮{Object.keys(sessions).length}</span>}{(lossAlerts.length>0||ingAlerts.length>0)&&<span style={{color:S.red,marginLeft:6}}>⚠️</span>}</div>
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {(cTab==="boissons"?boissons:snacks).map(p=>(
            <div key={p.id}>
              <button onClick={()=>addToCart(p,cTab)} style={{background:S.card2,border:`1px solid ${S.border}`,borderRadius:10,padding:"10px 6px",cursor:"pointer",color:S.text,textAlign:"center",width:"100%"}} onTouchStart={e=>e.currentTarget.style.transform="scale(0.95)"} onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{fontSize:24}}>{p.emoji}</div>
                <div style={{fontSize:10,fontWeight:600,margin:"3px 0 2px",lineHeight:1.2}}>{p.name}</div>
                <div style={{fontSize:13,fontWeight:800,color:S.gold}}>{fmt(p.price)}</div>
                {cTab==="snacks"&&prodQtyFn(p.id)>0&&<div style={{fontSize:9,color:remQty(p.id)>0?S.green:S.red,marginTop:2}}>{remQty(p.id)>0?`Dispo: ${remQty(p.id)}`:"Épuisé ⚠️"}</div>}
              </button>
              {user.role==="patron"&&<div style={{display:"flex",gap:2,marginTop:2}}>
                <button onClick={()=>setEditProd({...p,cat:cTab})} style={{flex:1,background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:5,padding:"2px 0",cursor:"pointer",fontSize:10}}>✏️</button>
                <button onClick={()=>{if(!window.confirm("Supprimer "+p.name+"?"))return;if(cTab==="boissons"){const nb=boissons.filter(x=>x.id!==p.id);setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}else{const ns=snacks.filter(x=>x.id!==p.id);setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}addAudit("SUPPR",p.name);showToast("Supprime",S.red);}} style={{flex:1,background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:5,padding:"2px 0",cursor:"pointer",fontSize:10}}>🗑</button>
              </div>}
            </div>
          ))}
        </div>
        {user.role==="patron"&&<button onClick={()=>setAddProdCat(cTab)} style={{width:"100%",background:"transparent",border:`2px dashed ${S.gold}`,borderRadius:10,padding:"8px",cursor:"pointer",color:S.gold,fontWeight:700,fontSize:12,marginBottom:8}}>＋ Ajouter {cTab==="boissons"?"une boisson":"un snack"}</button>}
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {stations.map(st=>{const ses=sessions[st.id];const active=!!ses;return(
            <div key={st.id} style={{background:active?"#051505":S.card,border:`2px solid ${active?S.green:S.border}`,borderRadius:12,padding:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:20}}>{st.emoji}</span>{active&&<div style={{background:S.green,color:S.bg,fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10}}>EN JEU</div>}</div>
              <div style={{fontSize:11,fontWeight:700,color:active?S.green:S.text,marginBottom:2}}>{st.name}</div>
              <div style={{fontSize:10,color:S.muted,marginBottom:8}}>1J {fmt(st.rate1)} • 2J {fmt(st.rate2)}/30min</div>
              {active?<><div style={{fontFamily:"monospace",fontSize:26,fontWeight:800,color:S.green}}>{elapsed(ses.start)}</div><div style={{fontSize:11,color:S.muted,margin:"2px 0 10px"}}>{ses.players}J • {fmt(liveCost(ses,st))}</div><button onClick={()=>stopSess(st.id)} style={{...Btn(S.red),width:"100%",fontSize:12,padding:"10px"}}>⏹ Stop & Encaisser</button></>
              :<div style={{display:"flex",gap:6}}><button onClick={()=>startSess(st.id,1)} style={{...Btn(S.green),flex:1,fontSize:11,padding:"9px 4px"}}>▶ 1J</button><button onClick={()=>startSess(st.id,2)} style={{...Btn(S.blue),flex:1,fontSize:11,padding:"9px 4px"}}>▶ 2J</button></div>}
              {user.role==="patron"&&!active&&<div style={{display:"flex",gap:4,marginTop:4}}>
                <button onClick={()=>setEditStation({...st})} style={{flex:1,background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}}>✏️</button>
                <button onClick={()=>{if(!window.confirm("Supprimer "+st.name+"?"))return;const ns=stations.filter(x=>x.id!==st.id);setStations(ns);saveProds(boissons,snacks,ingredients,recipes,ns,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR STATION",st.name);showToast("✓ Supprimé",S.red);}} style={{flex:1,background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:10}}>🗑</button>
              </div>}
            </div>);})}
        {user.role==="patron"&&<button onClick={()=>setAddStationModal(true)} style={{width:"100%",background:"transparent",border:`2px dashed ${S.gold}`,borderRadius:10,padding:"8px",cursor:"pointer",color:S.gold,fontWeight:700,fontSize:12,marginBottom:8}}>＋ Ajouter console / poste</button>}
        </div>
        <div style={Card()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><div><div style={{fontSize:14,fontWeight:700}}>🖨️ Photocopies</div><div style={{fontSize:11,color:S.muted,marginTop:3,display:"flex",alignItems:"center",gap:6}}>Prix: {user.role==="patron"?<input type="number" value={photoPrice} onChange={e=>{const v=Number(e.target.value)||50;setPhotoPrice(v);saveProds(boissons,snacks,ingredients,recipes,v,dailyGoal,ticketNo);}} style={{width:55,background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:6,padding:"3px 6px",fontSize:12,outline:"none"}}/>:<strong style={{color:S.gold}}>{photoPrice}</strong>} F</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={()=>addPhoto(-1)} style={{...Btn(S.card3,S.text),border:`1px solid ${S.border}`,width:36,height:36,padding:0,fontSize:20}}>−</button><span style={{fontSize:22,fontWeight:800,minWidth:36,textAlign:"center"}}>{photoCount}</span><button onClick={()=>addPhoto(1)} style={{...Btn(S.gold),width:36,height:36,padding:0,fontSize:20}}>+</button><div style={{fontSize:14,fontWeight:800,color:S.green,minWidth:72,textAlign:"right"}}>{fmt(photoCount*photoPrice)}</div></div></div></div>
        {doneSess.length>0&&<div style={Card()}><div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>SESSIONS DU JOUR</div>{[...doneSess].reverse().slice(0,6).map(d=><div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${S.border}`,fontSize:11}}><div><span style={{color:S.muted}}>{d.time} </span>{d.emoji}{d.name} {d.players}J {d.mins}min</div><div style={{color:S.green,fontWeight:800}}>{fmt(d.total)}</div></div>)}</div>}
      </div>}

      {/* ══ STOCKS ══ */}
      {tab==="stocks"&&<div style={{padding:14}}>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          <button style={Sub(stSub==="ing")} onClick={()=>setStSub("ing")}>🌾 Ingrédients</button>
          <button style={Sub(stSub==="prod")} onClick={()=>setStSub("prod")}>🍳 Production</button>
          <button style={Sub(stSub==="finis")} onClick={()=>setStSub("finis")}>📊 Produits Finis</button>
          <button style={Sub(stSub==="verif")} onClick={()=>setStSub("verif")}>🔍 Vérif</button>
        </div>
        {stSub==="ing"&&<div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <button onClick={()=>{if(scanRef.current){scanRef.current.dataset.target="stock";scanRef.current.click();}}} disabled={scanLoading&&scanTarget==="stock"} style={{flex:1,background:S.purple,color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:12,fontWeight:700}}>
              {scanLoading&&scanTarget==="stock"?"⏳ Lecture...":"📸 Scanner stock matin"}
            </button>
            <button onClick={()=>{if(scanRef.current){scanRef.current.dataset.target="verif";scanRef.current.click();}}} disabled={scanLoading&&scanTarget==="verif"} style={{flex:1,background:S.orange,color:S.bg,border:"none",borderRadius:10,padding:"10px",cursor:"pointer",fontSize:12,fontWeight:700}}>
              {scanLoading&&scanTarget==="verif"?"⏳ Lecture...":"📸 Scanner stock soir"}
            </button>
          </div>
          <div style={{background:"#0a0d1a",border:`1px solid ${S.blue}`,borderRadius:10,padding:10,marginBottom:12,fontSize:11,color:"#aaa"}}>🌾 Stock matin en KG. La production déduit automatiquement.</div>
          {ingredients.map(ing=>{const s=ingStock[ing.id]||{};const used=ingUsed(ing.id);const rem=ingRem(ing.id);const al=ingAlert(ing.id);return(<div key={ing.id} style={{background:al?"#1a0000":S.card,border:`1px solid ${al?S.red:S.border}`,borderRadius:10,padding:12,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,fontWeight:700}}>{ing.emoji} {ing.name}</span><span style={{fontSize:10,color:S.muted}}>{ing.unit} • {fmt(ing.unitCost)}/{ing.unit}</span></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:S.muted,marginBottom:3}}>Stock matin ({ing.unit})</div><input type="number" step="0.001" value={s.opening??""} placeholder="0" onChange={e=>setIngField(ing.id,"opening",e.target.value)} style={{...Inp("100%"),padding:"7px 8px",fontSize:13}}/></div>
              <div style={{display:"flex",gap:6}}>
                <div style={{textAlign:"center"}}><div style={{fontSize:9,color:S.muted,marginBottom:3}}>Utilisé</div><div style={{fontSize:14,fontWeight:800,color:S.orange,background:S.card2,borderRadius:6,padding:"4px 8px"}}>{fmtQ(used,ing.unit)}</div></div>
                <div style={{textAlign:"center"}}><div style={{fontSize:9,color:S.muted,marginBottom:3}}>Restant</div><div style={{fontSize:14,fontWeight:800,color:rem>0?S.green:S.muted,background:S.card2,borderRadius:6,padding:"4px 8px"}}>{fmtQ(rem,ing.unit)}</div></div>
              </div>
            </div>
            {al&&<div style={{marginTop:6,background:S.red,borderRadius:6,padding:"4px 8px",fontSize:11,color:"#fff",fontWeight:700}}>⚠️ {al.diff>0?`MANQUE ${fmtQ(al.diff,ing.unit)}`:`SURPLUS`}</div>}
          </div>);})}
          {user.role==="patron"&&<button onClick={()=>setAddIngModal(true)} style={{width:"100%",background:"transparent",border:`2px dashed ${S.blue}`,borderRadius:10,padding:"14px",cursor:"pointer",color:S.blue,fontWeight:700,fontSize:13,marginTop:4}}>＋ Ajouter ingrédient</button>}
        </div>}
        {stSub==="prod"&&<div>
          <div style={{background:"#0d1a0d",border:`1px solid ${S.green}`,borderRadius:10,padding:10,marginBottom:12,fontSize:11,color:"#aaa"}}>🍳 Enregistrez chaque fabrication. Ingrédients déduits automatiquement.</div>
          {snacks.map(p=>{const rec=recipes.find(r=>r.snackId===p.id);return(<div key={p.id} style={Card()}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:24}}>{p.emoji}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{p.name}</div><div style={{fontSize:10,color:S.muted,marginTop:2}}>{rec?rec.ingredients.map(ri=>{const ing=ingredients.find(i=>i.id===ri.id);return ing?`${fmtQ(ri.qty,ing.unit)} ${ing.name}`:""}).filter(Boolean).join(" • "):"Pas de recette"}</div><div style={{fontSize:11,color:S.green,marginTop:2}}>Fab: <strong>{prodQtyFn(p.id)}</strong> | Vendu: <strong>{soldQty(p.id)}</strong> | Rest: <strong>{remQty(p.id)}</strong></div></div><div style={{display:"flex",gap:4,alignItems:"center"}}><button onClick={()=>{setProdModal(p);setProdQtyVal("");}} style={{...Btn(S.green),fontSize:12,padding:"8px 12px"}}>🍳</button>{user.role==="patron"&&<div style={{display:"flex",gap:4}}><button onClick={()=>setEditProd({...p,cat:"snacks"})} style={{background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:6,padding:"6px 8px",cursor:"pointer",fontSize:11}}>✏️</button><button onClick={()=>{if(!window.confirm("Supprimer "+p.name+"?"))return;const ns=snacks.filter(x=>x.id!==p.id);setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,stations,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR",p.name);showToast("✓ Supprimé",S.red);}} style={{background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:6,padding:"6px 8px",cursor:"pointer",fontSize:11}}>🗑</button></div>}</div></div></div>);})}
          {user.role==="patron"&&<button onClick={()=>setAddProdCat("snacks")} style={{width:"100%",background:"transparent",border:`2px dashed ${S.green}`,borderRadius:10,padding:"8px",cursor:"pointer",color:S.green,fontWeight:700,fontSize:12,marginBottom:8}}>＋ Ajouter un produit</button>}
          {productions.length>0&&<div style={Card()}><div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>PRODUCTIONS DU JOUR</div>{[...productions].reverse().map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${S.border}`,fontSize:11}}><div><span style={{color:S.muted}}>{p.time} </span>{p.snackEmoji}{p.snackName}</div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:S.green,fontWeight:700}}>× {p.qty}</span><button onClick={()=>{const np=productions.filter(x=>x.id!==p.id);setProductions(np);saveDay({productions:np});showToast("✓ Supprimé",S.red);}} style={{background:"transparent",border:`1px solid ${S.red}`,color:S.red,borderRadius:4,padding:"1px 5px",cursor:"pointer",fontSize:10}}>🗑</button></div></div>)}</div>}
        </div>}
        {stSub==="finis"&&<div>
          <div style={{background:"#0d0a1a",border:`1px solid ${S.purple}`,borderRadius:10,padding:10,marginBottom:12,fontSize:11,color:"#aaa"}}>📊 Fabriqué − Vendu = Restant. Comptez pour détecter pertes/vols.</div>
          {snacks.map(p=>{const prod=prodQtyFn(p.id);const sold=soldQty(p.id);const rem=remQty(p.id);const loss=lossQty(p.id);return(<div key={p.id} style={{background:loss!==null&&loss>0?"#1a0000":S.card,border:`1px solid ${loss!==null&&loss>0?S.red:S.border}`,borderRadius:10,padding:12,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>{p.emoji} {p.name}</span>{loss!==null&&loss>0&&<span style={{background:S.red,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>🚨 -{loss}</span>}{loss===0&&finPhys[p.id]!=null&&<span style={{background:S.green,color:S.bg,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>✓ OK</span>}</div>{user.role==="patron"&&<div style={{display:"flex",gap:4}}><button onClick={()=>setEditProd({...p,cat:"snacks"})} style={{background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:5,padding:"2px 6px",cursor:"pointer",fontSize:10}}>✏️</button><button onClick={()=>{if(!window.confirm("Supprimer "+p.name+"?"))return;const ns=snacks.filter(x=>x.id!==p.id);setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,stations,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR",p.name);showToast("✓ Supprimé",S.red);}} style={{background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:5,padding:"2px 6px",cursor:"pointer",fontSize:10}}>🗑</button></div>}</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>{[{l:"Fabriqués",v:prod,c:S.blue},{l:"Vendus",v:sold,c:S.orange},{l:"Restant",v:rem,c:S.green}].map(x=><div key={x.l} style={{flex:1,textAlign:"center",background:S.card2,borderRadius:8,padding:"6px 4px"}}><div style={{fontSize:9,color:S.muted}}>{x.l}</div><div style={{fontSize:16,fontWeight:800,color:x.c}}>{x.v}</div></div>)}</div>
            <input type="number" value={finPhys[p.id]??""} placeholder={`Compter les ${p.name}s restants...`} onChange={e=>{const nf={...finPhys,[p.id]:Number(e.target.value)||0};setFinPhys(nf);saveDay({finPhys:nf});}} style={{...Inp(),padding:"7px 10px",fontSize:13}}/>
            {loss!==null&&loss>0&&<div style={{marginTop:6,fontSize:12,color:S.red,fontWeight:700}}>⚠️ {loss} manquant(s) — {fmt(loss*p.price)}</div>}
          </div>);})}
                  {user.role==="patron"&&<button onClick={()=>setAddProdCat("snacks")} style={{width:"100%",background:"transparent",border:`2px dashed ${S.purple}`,borderRadius:10,padding:"8px",cursor:"pointer",color:S.purple,fontWeight:700,fontSize:12,marginTop:4}}>＋ Ajouter un produit fini</button>}
        </div>}
        {stSub==="verif"&&<div>
          {ingredients.map(ing=>{const th=ingRem(ing.id);const al=ingAlert(ing.id);return(<div key={ing.id} style={{background:al?"#1a0000":S.card,border:`1px solid ${al?S.red:S.border}`,borderRadius:10,padding:10,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:600}}>{ing.emoji} {ing.name}</span><span style={{fontSize:11,color:S.blue}}>Théo: <strong>{fmtQ(th,ing.unit)}</strong></span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="number" step="0.001" value={ingPhys[ing.id]??""} placeholder={`Peser (${ing.unit})...`} onChange={e=>setIngPhysVal(ing.id,e.target.value)} style={{...Inp("130px"),padding:"7px 10px",fontSize:13}}/>
              {al&&<div style={{flex:1,background:S.red,color:"#fff",borderRadius:8,padding:"6px 8px",fontSize:11,fontWeight:700}}>{al.diff>0?`⚠️ MANQUE ${fmtQ(al.diff,ing.unit)}`:`➕ SURPLUS`}</div>}
              {!al&&ingPhys[ing.id]!=null&&<div style={{flex:1,background:"#0d1a0d",color:S.green,borderRadius:8,padding:"6px 8px",fontSize:11,fontWeight:700}}>✓ OK</div>}
            </div>
          </div>);})}
          {ingAlerts.length>0&&<div style={{background:"#1a0000",border:`1px solid ${S.red}`,borderRadius:12,padding:12,marginTop:8}}><div style={{fontWeight:700,color:S.red,marginBottom:6,fontSize:12}}>🚨 {ingAlerts.length} ÉCART(S)</div>{ingAlerts.map(i=>{const a=ingAlert(i.id);return<div key={i.id} style={{fontSize:11,color:"#ffaaaa",marginBottom:3}}>{i.emoji} {i.name} → Manque {fmtQ(a.diff,i.unit)} — {fmt(a.diff*i.unitCost)}</div>;})} <div style={{marginTop:6,fontSize:12,fontWeight:700,color:S.red,borderTop:`1px solid ${S.red}`,paddingTop:6}}>Perte totale: {fmt(ingAlerts.reduce((s,i)=>{const a=ingAlert(i.id);return s+a.diff*i.unitCost;},0))}</div></div>}
        </div>}
      </div>}

      {/* ══ PLANNING ══ */}
      {tab==="planning"&&<div style={{padding:14}}>
        <div style={{background:"#0a0d1a",border:`1px solid ${S.blue}`,borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:"#aaa",lineHeight:1.6}}>🧮 Entrez les quantités à produire. L'outil calcule les ingrédients en KG et votre liste de courses exacte.</div>
        {[...new Set(recipes.map(r=>r.category))].map(cat=>(
          <div key={cat} style={Card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.orange,letterSpacing:2,marginBottom:12}}>{cat.toUpperCase()}</div>
            {recipes.filter(r=>r.category===cat).map(rec=>(
              <div key={rec.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${S.border}`}}>
                <div style={{fontSize:22,minWidth:28}}>{rec.emoji}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{rec.name}</div><div style={{fontSize:10,color:S.muted,marginTop:2}}>{rec.ingredients.map(ri=>{const ing=ingredients.find(i=>i.id===ri.id);return ing?`${fmtQ(ri.qty,ing.unit)} ${ing.name}`:""}).filter(Boolean).join(" • ")}</div></div>
                <input type="number" min="0" placeholder="0" value={planQty[rec.id]||""} onChange={e=>setPlanQty(p=>({...p,[rec.id]:parseInt(e.target.value)||0}))} style={{...Inp("65px"),padding:"7px 8px",fontSize:14,textAlign:"center",fontWeight:700}}/>
                <span style={{fontSize:10,color:S.muted,minWidth:20}}>pcs</span>
              </div>
            ))}
          </div>
        ))}
        {totalPlanUnits>0&&<>
          <div style={Card(S.gold)}>
            <div style={{fontSize:11,fontWeight:700,color:S.gold,letterSpacing:1,marginBottom:10}}>🛒 INGRÉDIENTS NÉCESSAIRES</div>
            {shopping.map((ing,i)=>(
              <div key={i} style={{marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${S.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700}}>{ing.name}</span><span style={{fontSize:14,fontWeight:800,color:S.gold}}>{fmtQ(ing.needed,ing.unit)}</span></div>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  <div style={{flex:1,background:S.card2,borderRadius:6,padding:"3px 8px",textAlign:"center"}}><div style={{fontSize:9,color:S.muted}}>En stock</div><input type="number" step="0.001" value={planStock[ing.id]||""} placeholder="0" onChange={e=>setPlanStock(p=>({...p,[ing.id]:parseFloat(e.target.value)||0}))} style={{width:"100%",background:"transparent",border:"none",color:S.blue,fontSize:12,fontWeight:700,textAlign:"center",outline:"none"}}/></div>
                  <div style={{flex:1,background:ing.toBuy>0?"#1a0000":"#0d1a0d",borderRadius:6,padding:"4px 8px",textAlign:"center",border:`1px solid ${ing.toBuy>0?S.red:S.green}`}}><div style={{fontSize:9,color:S.muted}}>À acheter</div><div style={{fontSize:13,fontWeight:800,color:ing.toBuy>0?S.red:S.green}}>{ing.toBuy>0?fmtQ(ing.toBuy,ing.unit):"✓ OK"}</div></div>
                </div>
              </div>
            ))}
          </div>
          {shopping.some(s=>s.toBuy>0)&&<div style={Card(S.red)}><div style={{fontSize:11,fontWeight:700,color:S.red,letterSpacing:1,marginBottom:8}}>🛒 LISTE DE COURSES</div>{shopping.filter(s=>s.toBuy>0).map((ing,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${S.border}`,fontSize:13}}><span>□ {ing.name}</span><span style={{fontWeight:800,color:S.red}}>{fmtQ(ing.toBuy,ing.unit)}</span></div>)}<button onClick={()=>{const txt=`🛒 COURSES ${currentStore.name}\nPour ${totalPlanUnits} pièces\n\n${shopping.filter(s=>s.toBuy>0).map(s=>`□ ${s.name} : ${fmtQ(s.toBuy,s.unit)}`).join("\n")}\n\n${timeStr()}`;try{navigator.clipboard.writeText(txt);}catch(e){}showToast("✓ Copié","#25D366");}} style={{...Btn("#25D366"),width:"100%",marginTop:12,fontSize:12}}>📱 Copier pour WhatsApp</button></div>}
        </>}
        <button onClick={()=>setPlanQty({})} style={{width:"100%",background:"transparent",border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:10,cursor:"pointer",fontSize:12,marginTop:8}}>🔄 Remettre à zéro</button>
      </div>}

      {/* ══ RECETTES ══ */}
      {tab==="recettes"&&<div style={{padding:14}}>
        {user.role==="patron"&&<button onClick={()=>setEditRec({id:"",emoji:"🍽️",name:"",category:"Crêpes",snackId:"",ingredients:[]})} style={{width:"100%",background:"transparent",border:`2px dashed ${S.orange}`,borderRadius:10,padding:"10px",cursor:"pointer",color:S.orange,fontWeight:700,fontSize:13,marginBottom:12}}>＋ Nouvelle recette</button>}
        {[...new Set(recipes.map(r=>r.category))].map(cat=>(
          <div key={cat} style={Card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.orange,letterSpacing:2,marginBottom:12}}>{cat.toUpperCase()}</div>
            {recipes.filter(r=>r.category===cat).map(rec=>(
              <div key={rec.id} style={{background:S.card2,borderRadius:10,padding:12,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>{rec.emoji}</span><span style={{fontSize:13,fontWeight:700}}>{rec.name}</span></div>
                  {user.role==="patron"&&<div style={{display:"flex",gap:4}}><button onClick={()=>setEditRec({...rec})} style={{background:S.card3,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:12}}>✏️</button><button onClick={()=>{if(!window.confirm("Supprimer "+rec.name+"?"))return;const nr=recipes.filter(x=>x.id!==rec.id);setRecipes(nr);saveProds(boissons,snacks,ingredients,nr,photoPrice,dailyGoal,ticketNo);addAudit("SUPPR REC",rec.name);showToast("✓ Supprimé",S.red);}} style={{background:S.card3,border:`1px solid ${S.red}`,color:S.red,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:12}}>🗑</button></div>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{rec.ingredients.map((ri,i)=>{const ing=ingredients.find(x=>x.id===ri.id);return ing?<div key={i} style={{background:S.card,borderRadius:6,padding:"3px 8px",fontSize:11,color:"#ccc"}}>{fmtQ(ri.qty,ing.unit)} {ing.name}</div>:null;})}</div>
              </div>
            ))}
          </div>
        ))}
        <div style={{background:"#0d0a1a",border:`1px solid ${S.purple}`,borderRadius:12,padding:14}}>
          <div style={{fontWeight:700,color:S.purple,marginBottom:10,fontSize:13}}>🤖 Créer une recette avec l'IA</div>
          <textarea value={aiRecInput} onChange={e=>setAiRecInput(e.target.value)} placeholder={"Décrivez votre plat...\nEx: Poulet yassa mariné oignon citron moutarde"} style={{...Inp(),height:70,resize:"none",fontSize:12,padding:"10px"}}/>
          <button onClick={async()=>{if(!aiRecInput.trim())return;setAiRecLoading(true);const txt=await callAI('Réponds UNIQUEMENT en JSON valide: {"name":"...","emoji":"...","category":"...","snackId":"","ingredients":[{"id":"i1","qty":0.000}]}. Utilise les IDs: i1=Farine,i2=Lait,i3=Beurre,i4=Sucre,i5=Oeufs,i6=Confiture,i7=Nutella,i8=Poulet,i9=Fromage,i10=Thon,i11=Pain,i12=Levure. Quantités en kg par unité.',`Recette pour: "${aiRecInput}"`);try{const p=JSON.parse(txt.replace(/```json|```/g,"").trim());if(p.name){const nr=[...recipes,{...p,id:`r${uid()}`}];setRecipes(nr);saveProds(boissons,snacks,ingredients,nr,photoPrice,dailyGoal,ticketNo);setAiRecInput("");showToast("✓ Recette IA ajoutée !");}}catch(e){showToast("IA: réessayez avec plus de détails",S.orange);}setAiRecLoading(false);}} disabled={aiRecLoading||!aiRecInput.trim()} style={{...Btn(S.purple,"#fff"),width:"100%",marginTop:10,fontSize:12,opacity:aiRecLoading||!aiRecInput.trim()?0.5:1}}>{aiRecLoading?"⏳ Génération...":"🤖 Générer"}</button>
        </div>
      </div>}

      {/* ══ IA ══ */}
      {tab==="ia"&&<div style={{padding:14,display:"flex",flexDirection:"column",minHeight:"calc(100vh - 160px)"}}>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={generateSuggestions} disabled={suggestLoading} style={{...Btn(S.purple,"#fff"),flex:1,fontSize:12,opacity:suggestLoading?0.5:1}}>{suggestLoading?"⏳ Analyse...":"💡 Suggestions Hebdo"}</button>
          <button onClick={generateInsight} disabled={insightLoading} style={{...Btn(S.card2,S.gold),flex:1,fontSize:12,border:`1px solid ${S.gold}`,opacity:insightLoading?0.5:1}}>{insightLoading?"⏳":"📊 Insight"}</button>
        </div>
        {aiSuggestions.length>0&&<div style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:S.purple,marginBottom:8,letterSpacing:1}}>💡 SUGGESTIONS D'AMÉLIORATION</div>
          {aiSuggestions.map(s=>(
            <div key={s.id} style={{...Card(s.impact==="high"?S.red:s.impact==="medium"?S.gold:S.border),marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <span style={{fontSize:14}}>{s.emoji}</span>
                <span style={{fontSize:9,background:s.impact==="high"?S.red:s.impact==="medium"?S.gold:S.border,color:s.impact==="high"?"#fff":S.bg,padding:"2px 6px",borderRadius:10,fontWeight:700}}>{s.impact==="high"?"URGENT":s.impact==="medium"?"IMPORTANT":"INFO"}</span>
              </div>
              <div style={{fontSize:12,fontWeight:700,marginBottom:4}}>{s.title}</div>
              <div style={{fontSize:11,color:"#ccc",lineHeight:1.5}}>{s.description}</div>
            </div>
          ))}
        </div>}
        <div ref={chatRef} style={{flex:1,overflowY:"auto",marginBottom:12,display:"flex",flexDirection:"column",gap:10,minHeight:200}}>
          {aiMessages.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"88%",background:m.role==="user"?S.gold:S.card2,color:m.role==="user"?S.bg:S.text,borderRadius:12,padding:"10px 14px",fontSize:12,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>
          ))}
          {aiLoading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:S.card2,borderRadius:12,padding:"10px 14px",fontSize:12,color:S.muted}}>⏳ Analyse...</div></div>}
        </div>
        <div style={{display:"flex",gap:8}}><input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendAiMessage()} placeholder="Posez votre question..." style={{...Inp(),fontSize:13}}/><button onClick={sendAiMessage} disabled={aiLoading||!aiInput.trim()} style={{...Btn(S.purple,"#fff"),padding:"10px 14px",fontSize:18,opacity:aiLoading||!aiInput.trim()?0.5:1}}>▶</button></div>
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
          {["🔍 Analyse les pertes","🛒 Courses pour 100 crêpes","💡 Comment augmenter le CA","📈 Meilleur produit à pousser"].map(q=><button key={q} onClick={()=>setAiInput(q)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:20,padding:"5px 10px",cursor:"pointer",fontSize:10}}>{q}</button>)}
        </div>
      </div>}

      {/* ══ BILAN ══ */}
      {tab==="bilan"&&<div style={{padding:14}}>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <button onClick={()=>setCashModal(true)} style={{...Btn(S.orange),flex:1,fontSize:12}}>💵 Clôturer</button>
          <button onClick={()=>setWhatsModal(true)} style={{...Btn("#25D366"),flex:1,fontSize:12}}>📱 WhatsApp</button>
          {user.role==="patron"&&<button onClick={()=>setEmpModal(true)} style={{...Btn(S.card2,S.gold),border:`1px solid ${S.gold}`,flex:1,fontSize:12}}>👥 Équipe</button>}
          <button onClick={()=>setExpModal(true)} style={{...Btn(S.orange,"#fff"),flex:1,fontSize:12}}>💸 Dépense</button>
        </div>
        {expenses.length>0&&<div style={Card()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:700,color:S.orange,fontSize:12}}>💸 DÉPENSES</div></div>{expenses.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontSize:12}}><div>{e.emoji} {e.label}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{color:S.red,fontWeight:700}}>{fmt(e.amount)}</span>{user.role==="patron"&&<button onClick={()=>{const ne=expenses.filter(x=>x.id!==e.id);setExpenses(ne);saveDay({expenses:ne});}} style={{background:"transparent",border:"none",color:S.muted,cursor:"pointer",fontSize:13}}>🗑</button>}</div></div>)}<div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px solid ${S.border}`,fontWeight:700}}><span>Total</span><span style={{color:S.red}}>{fmt(totalExpenses)}</span></div></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[{l:"CA TOTAL",v:totalCA,c:S.green},{l:"DÉPENSES",v:totalExpenses,c:S.red},{l:"BÉNÉFICE NET",v:netProfit,c:netProfit>=0?S.green:S.red},{l:"GAMING",v:totalGaming,c:S.blue},{l:"VENTES",v:sales.length,c:S.orange,n:true},{l:"TICKETS",v:ticketNo-1001,c:S.teal,n:true}].map(c=><div key={c.l} style={{...Card(),textAlign:"center"}}><div style={{fontSize:9,color:S.muted,letterSpacing:1,marginBottom:4}}>{c.l}</div><div style={{fontSize:c.n?28:16,fontWeight:800,color:c.c}}>{c.n?c.v:fmt(c.v)}</div></div>)}
        </div>
        <div style={Card()}><div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>📅 7 JOURS</div>{last7.map(d=><div key={d.ds} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${S.border}`,fontSize:12}}><span style={{color:S.muted,minWidth:36}}>{d.label}</span><div style={{display:"flex",gap:16}}><span style={{color:d.ca>0?S.green:S.muted,fontWeight:700}}>{fmt(d.ca)}</span><span style={{color:d.net>=0?S.green:S.red,fontSize:11}}>net {fmt(d.net)}</span></div></div>)}</div>
        <div style={Card()}><div style={{fontWeight:700,color:S.gold,marginBottom:8,fontSize:11,letterSpacing:1}}>VENTES RÉCENTES</div>{sales.length===0?<div style={{color:S.muted,fontSize:13,textAlign:"center",padding:12}}>Aucune vente</div>:[...sales].reverse().slice(0,12).map(sale=><div key={sale.id} style={{borderBottom:`1px solid ${S.border}`,paddingBottom:6,marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span style={{color:S.muted}}>{sale.time} <span style={{color:S.teal,fontSize:10}}>#{sale.ticketNo||"—"}</span> <span style={{color:S.blue,fontSize:10}}>({sale.by})</span></span><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontWeight:800,color:S.green}}>{fmt(sale.total)}</span>{user.role==="patron"&&<button onClick={()=>deleteSale(sale.id)} style={{background:"transparent",border:"none",color:S.red,cursor:"pointer",fontSize:13}}>🗑</button>}</div></div><div style={{fontSize:10,color:"#aaa",marginTop:2}}>{sale.items.map(i=>`${i.emoji||""}${i.name}×${i.qty}`).join(" • ")}</div></div>)}</div>
      </div>}

      {/* ══ AIDE ══ */}
      {tab==="aide"&&<div style={{padding:14}}>
        {guideSection===null?<>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:40,marginBottom:8}}>❓</div>
            <div style={{fontSize:18,fontWeight:800,color:S.gold}}>GUIDE EMPLOYÉ</div>
            <div style={{fontSize:12,color:S.muted,marginTop:4}}>Appuyez sur une section pour apprendre</div>
          </div>
          {/* Progress indicator */}
          <div style={Card()}>
            <div style={{fontSize:11,fontWeight:700,color:S.muted,marginBottom:10,letterSpacing:1}}>📊 VOTRE PROGRESSION</div>
            <div style={{display:"flex",gap:8}}>
              {GUIDE_SECTIONS.map((gs,i)=>(
                <div key={gs.id} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:18}}>{gs.emoji}</div>
                  <div style={{width:"100%",height:4,background:S.card2,borderRadius:2,marginTop:4}}><div style={{width:"0%",height:"100%",background:gs.color,borderRadius:2}}/></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {GUIDE_SECTIONS.map(gs=>(
              <button key={gs.id} onClick={()=>setGuideSection(gs.id)} style={{background:S.card,border:`2px solid ${gs.color}`,borderRadius:12,padding:"16px 12px",cursor:"pointer",textAlign:"center",transition:"transform .15s"}} onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"} onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}>
                <div style={{fontSize:32,marginBottom:6}}>{gs.emoji}</div>
                <div style={{fontSize:12,fontWeight:700,color:gs.color}}>{gs.title}</div>
                <div style={{fontSize:10,color:S.muted,marginTop:4}}>{gs.steps.length} étapes</div>
              </button>
            ))}
          </div>
          <div style={{...Card(S.teal),marginTop:4}}>
            <div style={{fontWeight:700,color:S.teal,fontSize:13,marginBottom:10}}>📱 VIDÉOS DE FORMATION</div>
            <div style={{fontSize:11,color:"#aaa",lineHeight:1.7}}>
              Des vidéos de formation sont disponibles sur WhatsApp.<br/>
              Demandez le lien à votre patron.
            </div>
            <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
              {["📹 Vidéo 1 : Prendre une commande","📹 Vidéo 2 : Gérer le gaming","📹 Vidéo 3 : Saisir les stocks","📹 Vidéo 4 : Rapport du soir"].map(v=>(
                <div key={v} style={{background:S.card2,borderRadius:8,padding:"8px 12px",fontSize:12,color:S.muted}}>{v}</div>
              ))}
            </div>
          </div>
          <div style={{...Card(S.gold),marginTop:4}}>
            <div style={{fontWeight:700,color:S.gold,fontSize:13,marginBottom:8}}>🚀 À RETENIR ABSOLUMENT</div>
            {["Toujours imprimer le ticket avant d'encaisser","Jamais vendre sans enregistrer dans l'outil","Compter le stock physiquement chaque soir","En cas de doute → appeler le patron"].map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontSize:12}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:S.gold,color:S.bg,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,flexShrink:0}}>{i+1}</div>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </>:
        <div>
          {(() => {
            const gs=GUIDE_SECTIONS.find(x=>x.id===guideSection);
            if(!gs) return null;
            return(<>
              <button onClick={()=>setGuideSection(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12,marginBottom:16}}>← Retour au guide</button>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:52,marginBottom:8}}>{gs.emoji}</div>
                <div style={{fontSize:20,fontWeight:800,color:gs.color}}>{gs.title}</div>
              </div>
              {gs.steps.map((step,i)=>(
                <div key={i} style={{display:"flex",gap:14,marginBottom:16,padding:14,background:S.card,borderRadius:12,border:`1px solid ${S.border}`,borderLeft:`4px solid ${gs.color}`}}>
                  <div style={{fontSize:24,flexShrink:0,marginTop:2}}>{step.icon}</div>
                  <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>{step.text}</div>
                </div>
              ))}
              <div style={{background:`${gs.color}15`,border:`1px solid ${gs.color}`,borderRadius:12,padding:16,textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:700,color:gs.color}}>✅ Compris !</div>
                <div style={{fontSize:11,color:S.muted,marginTop:4}}>Si vous avez des questions, demandez à votre responsable.</div>
              </div>
            </>);
          })()}
        </div>}
      </div>}

      {/* ══ AUDIT ══ */}
      {tab==="audit"&&<div style={{padding:14}}>
        {audit.map(e=><div key={e.id} style={{background:S.card,borderRadius:8,padding:"8px 12px",marginBottom:6,borderLeft:`3px solid ${e.action.includes("SUPPR")?S.red:e.action.includes("VENTE")||e.action.includes("SESSION")?S.green:e.action.includes("DÉP")?S.orange:S.border}`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11,fontWeight:700,color:e.action.includes("SUPPR")?S.red:S.text}}>{e.action}</span><span style={{fontSize:10,color:S.muted}}>{e.time}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:"#aaa"}}>{e.details}</span><span style={{fontSize:10,color:e.role==="patron"?S.gold:S.blue}}>{e.who}</span></div></div>)}
        {audit.length===0&&<div style={{color:S.muted,fontSize:13,textAlign:"center",padding:20}}>Aucune action</div>}
      </div>}

      {/* ══ MODALS ══ */}

      {/* Store selector */}
      {storeModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.gold}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.gold,marginBottom:16}}>🏪 SÉLECTIONNER LA BOUTIQUE</div>
          {STORES.map(store=>(
            <button key={store.id} onClick={()=>{setCurrentStore(store);setStoreModal(false);showToast(`✓ ${store.name}`);}} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:store.id===currentStore.id?S.card2:S.card,border:`2px solid ${store.id===currentStore.id?S.gold:S.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",color:S.text,marginBottom:8,textAlign:"left"}}>
              <span style={{fontSize:28}}>{store.emoji}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:store.id===currentStore.id?S.gold:S.text}}>{store.name}</div><div style={{fontSize:10,color:S.muted,marginTop:2}}>Appuyez pour sélectionner</div></div>
              {store.id===currentStore.id&&<span style={{color:S.gold,fontSize:18}}>✓</span>}
            </button>
          ))}
          <button onClick={()=>setStoreModal(false)} style={{...{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,width:"100%"},marginTop:8}}>Fermer</button>
        </div>
      </div>}

      {/* Production modal */}
      {prodModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.green}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.green,marginBottom:4}}>🍳 Production</div>
          <div style={{fontSize:13,color:S.muted,marginBottom:12}}>{prodModal.emoji} {prodModal.name}</div>
          {(() => {const rec=recipes.find(r=>r.snackId===prodModal.id);return rec?<div style={{background:S.card2,borderRadius:8,padding:10,marginBottom:12,fontSize:11,color:"#aaa"}}>{rec.ingredients.map(ri=>{const ing=ingredients.find(i=>i.id===ri.id);return ing?<div key={ri.id}>{ing.emoji} {fmtQ(ri.qty,ing.unit)} {ing.name} (dispo: {fmtQ(ingRem(ing.id),ing.unit)})</div>:null;})}</div>:null;})()}
          <input type="number" value={prodQtyVal} placeholder="Quantité à fabriquer" autoFocus onChange={e=>setProdQtyVal(e.target.value)} style={Inp()}/>
          <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={()=>setProdModal(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={recordProduction} style={{...Btn(S.green),flex:1}}>✓ Confirmer</button></div>
        </div>
      </div>}

      {/* Add ingredient */}
      {/* Modal modifier produit */}
      {editProd&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:320,border:`2px solid ${S.blue}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.blue,marginBottom:16}}>✏️ Modifier produit</div>
          {[{l:"Emoji",k:"emoji",t:"text"},{l:"Nom",k:"name",t:"text"},{l:"Prix (FCFA)",k:"price",t:"number"},{l:"Catégorie",k:"category",t:"text"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <div style={{fontSize:11,color:S.muted,marginBottom:3}}>{f.l}</div>
              <input type={f.t} value={editProd[f.k]||""} onChange={e=>setEditProd(p=>({...p,[f.k]:f.t==="number"?parseFloat(e.target.value)||0:e.target.value}))} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setEditProd(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{
              if(!editProd.name)return;
              if(editProd.cat==="boissons"){const nb=boissons.map(x=>x.id===editProd.id?editProd:x);setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}
              else{const ns=snacks.map(x=>x.id===editProd.id?editProd:x);setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}
              addAudit("MODIF",editProd.name);setEditProd(null);showToast("✓ Produit mis à jour");
            }} style={{background:S.blue,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:1}}>✓ Sauvegarder</button>
          </div>
        </div>
      </div>}

      {/* Modal ajouter produit */}
      {addProdCat&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:320,border:`2px solid ${S.gold}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.gold,marginBottom:16}}>＋ Nouveau {addProdCat==="boissons"?"boisson":"snack"}</div>
          {[{l:"Emoji",k:"emoji",t:"text",ph:"🥤"},{l:"Nom",k:"name",t:"text",ph:"Coca-Cola"},{l:"Prix (FCFA)",k:"price",t:"number",ph:"500"},{l:"Catégorie",k:"category",t:"text",ph:"Sodas"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <div style={{fontSize:11,color:S.muted,marginBottom:3}}>{f.l}</div>
              <input type={f.t} placeholder={f.ph} id={"np_"+f.k} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setAddProdCat(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{
              const emoji=document.getElementById("np_emoji")?.value||"🍽️";
              const name=document.getElementById("np_name")?.value;
              const price=parseFloat(document.getElementById("np_price")?.value)||0;
              const category=document.getElementById("np_category")?.value||"Autres";
              if(!name)return;
              const np={id:"p"+Date.now(),name,emoji,price,category,cat:addProdCat};
              if(addProdCat==="boissons"){const nb=[...boissons,np];setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}
              else{const ns=[...snacks,np];setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}
              addAudit("AJOUT",name);setAddProdCat(null);showToast("✓ "+name+" ajouté");
            }} style={{background:S.gold,color:S.bg,border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:1}}>✓ Ajouter</button>
          </div>
        </div>
      </div>}

      {/* Modal recette */}
      {editRec&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.93)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:200,padding:12,overflowY:"auto"}}>
        <div style={{background:S.card,borderRadius:16,padding:20,width:"100%",maxWidth:400,border:`2px solid ${S.orange}`,marginTop:16,marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:15,color:S.orange,marginBottom:14}}>{editRec.id?"✏️ Modifier":"＋ Nouvelle"} recette</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{width:60}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:3}}>Emoji</div>
              <input value={editRec.emoji||""} onChange={e=>setEditRec(p=>({...p,emoji:e.target.value}))} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px",fontSize:20,width:"100%",boxSizing:"border-box",outline:"none",textAlign:"center"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:S.muted,marginBottom:3}}>Nom</div>
              <input value={editRec.name||""} onChange={e=>setEditRec(p=>({...p,name:e.target.value}))} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 10px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:S.muted,marginBottom:3}}>Catégorie</div>
            <input value={editRec.category||""} onChange={e=>setEditRec(p=>({...p,category:e.target.value}))} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 10px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
          </div>
          <div style={{fontWeight:600,fontSize:11,marginBottom:6,color:S.muted}}>🌾 Ingrédients utilisés</div>
          {(editRec.ingredients||[]).map((ri,idx)=>{
            const ing=ingredients.find(x=>x.id===ri.id);
            return(
            <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 70px 32px 26px",gap:4,alignItems:"center",marginBottom:5}}>
              <select value={ri.id||""} onChange={e=>{const ni=[...editRec.ingredients];ni[idx]={...ni[idx],id:e.target.value};setEditRec(p=>({...p,ingredients:ni}));}} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:6,padding:"5px",fontSize:10,outline:"none"}}>
                {ingredients.map(x=><option key={x.id} value={x.id}>{x.emoji} {x.name}</option>)}
              </select>
              <input type="number" step="0.001" value={ri.qty||""} placeholder="qté" onChange={e=>{const ni=[...editRec.ingredients];ni[idx]={...ni[idx],qty:parseFloat(e.target.value)||0};setEditRec(p=>({...p,ingredients:ni}));}} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.gold,borderRadius:6,padding:"5px",fontSize:12,fontWeight:700,outline:"none",width:"100%",boxSizing:"border-box"}}/>
              <span style={{fontSize:9,color:S.muted,textAlign:"center"}}>{ing?.unit||"kg"}</span>
              <button onClick={()=>setEditRec(p=>({...p,ingredients:p.ingredients.filter((_,i)=>i!==idx)}))} style={{background:"transparent",border:`1px solid ${S.red}`,color:S.red,borderRadius:4,padding:"2px 4px",cursor:"pointer",fontSize:10}}>✕</button>
            </div>
          );})}
          <button onClick={()=>setEditRec(p=>({...p,ingredients:[...(p.ingredients||[]),{id:ingredients[0]?.id||"",qty:0}]}))} style={{width:"100%",background:"transparent",border:`1px dashed ${S.teal}`,color:S.teal,borderRadius:6,padding:"6px",cursor:"pointer",fontSize:11,fontWeight:700,marginBottom:12}}>＋ Ajouter un ingrédient</button>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditRec(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{
              if(!editRec.name)return;
              let nr;
              if(editRec.id){nr=recipes.map(x=>x.id===editRec.id?editRec:x);}
              else{nr=[...recipes,{...editRec,id:"r"+Date.now()}];}
              setRecipes(nr);
              saveProds(boissons,snacks,ingredients,nr,photoPrice,dailyGoal,ticketNo);
              addAudit(editRec.id?"MODIF REC":"AJOUT REC",editRec.name);
              setEditRec(null);
              showToast("✓ Recette sauvegardée");
            }} style={{background:S.orange,color:S.bg,border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:800,flex:2}}>✓ Sauvegarder</button>
          </div>
        </div>
      </div>}

      {/* Modal modifier station */}
      {editStation&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.blue}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.blue,marginBottom:14}}>✏️ Modifier console / poste</div>
          {[{l:"Emoji",k:"emoji",t:"text"},{l:"Nom",k:"name",t:"text"},{l:"Tarif 1J (FCFA/30min)",k:"rate1",t:"number"},{l:"Tarif 2J (FCFA/30min)",k:"rate2",t:"number"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <div style={{fontSize:11,color:S.muted,marginBottom:3}}>{f.l}</div>
              <input type={f.t} value={editStation[f.k]||""} onChange={e=>setEditStation(p=>({...p,[f.k]:f.t==="number"?parseFloat(e.target.value)||0:e.target.value}))} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setEditStation(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{
              if(!editStation.name)return;
              const ns=stations.map(x=>x.id===editStation.id?editStation:x);
              setStations(ns);
              saveProds(boissons,snacks,ingredients,recipes,ns,photoPrice,dailyGoal,ticketNo);
              addAudit("MODIF STATION",editStation.name);
              setEditStation(null);
              showToast("✓ Console mise à jour");
            }} style={{background:S.blue,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:1}}>✓ Sauvegarder</button>
          </div>
        </div>
      </div>}

      {/* Modal ajouter station */}
      {addStationModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.gold}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.gold,marginBottom:14}}>＋ Nouvelle console / poste</div>
          {[{l:"Emoji",k:"emoji",t:"text",ph:"🎮"},{l:"Nom",k:"name",t:"text",ph:"PS5 N°6"},{l:"Tarif 1J (FCFA/30min)",k:"rate1",t:"number",ph:"1000"},{l:"Tarif 2J (FCFA/30min)",k:"rate2",t:"number",ph:"1500"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <div style={{fontSize:11,color:S.muted,marginBottom:3}}>{f.l}</div>
              <input type={f.t} placeholder={f.ph} id={"ns_"+f.k} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.text,borderRadius:8,padding:"8px 12px",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setAddStationModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{
              const emoji=document.getElementById("ns_emoji")?.value||"🎮";
              const name=document.getElementById("ns_name")?.value;
              const rate1=parseFloat(document.getElementById("ns_rate1")?.value)||1000;
              const rate2=parseFloat(document.getElementById("ns_rate2")?.value)||1500;
              if(!name)return;
              const ns=[...stations,{id:"st"+Date.now(),name,emoji,rate1,rate2}];
              setStations(ns);
              saveProds(boissons,snacks,ingredients,recipes,ns,photoPrice,dailyGoal,ticketNo);
              addAudit("AJOUT STATION",name);
              setAddStationModal(false);
              showToast("✓ "+name+" ajoutée");
            }} style={{background:S.gold,color:S.bg,border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:700,flex:1}}>✓ Ajouter</button>
          </div>
        </div>
      </div>}

      {addIngModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.blue}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.blue,marginBottom:16}}>＋ Nouvel ingrédient</div>
          {[{l:"Emoji",k:"emoji",t:"text",ph:"🥄"},{l:"Nom",k:"name",t:"text",ph:"Farine"},{l:"Unité (kg, L, pcs)",k:"unit",t:"text",ph:"kg"},{l:"Coût/unité (F)",k:"unitCost",t:"number",ph:"300"}].map(f=><div key={f.k} style={{marginBottom:12}}><div style={{fontSize:11,color:S.muted,marginBottom:4}}>{f.l}</div><input type={f.t} value={newIng[f.k]} placeholder={f.ph} onChange={e=>setNewIng(p=>({...p,[f.k]:e.target.value}))} style={Inp()}/></div>)}
          <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setAddIngModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={()=>{if(!newIng.name)return;const i={id:`i${uid()}`,name:newIng.name,unit:newIng.unit||"kg",emoji:newIng.emoji||"🥄",unitCost:parseFloat(newIng.unitCost)||0};const ni=[...ingredients,i];setIngredients(ni);saveProds(boissons,snacks,ni,recipes,photoPrice,dailyGoal,ticketNo);addAudit("AJOUT ING",`${i.emoji}${i.name}`);setAddIngModal(false);setNewIng({name:"",unit:"kg",emoji:"🥄",unitCost:""});showToast("✓ Ingrédient ajouté");}} style={{...Btn(S.blue),flex:1}}>✓ Ajouter</button></div>
        </div>
      </div>}

      {/* Add/Edit product with AI emoji */}
      {(addProdModal||editProd)&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${addProdModal?S.gold:S.blue}`}}>
          <div style={{fontWeight:800,fontSize:15,color:addProdModal?S.gold:S.blue,marginBottom:16}}>{addProdModal?"＋ Nouveau produit":"✏️ Modifier"}</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:S.muted,marginBottom:4}}>Nom du produit</div>
            <div style={{display:"flex",gap:8}}>
              <input type="text" value={editProd?editProd.name:newProd.name} onChange={e=>{const v=e.target.value;editProd?setEditProd(p=>({...p,name:v})):setNewProd(p=>({...p,name:v}));}} style={{...Inp(),flex:1}} placeholder="Ex: Crêpe Banane"/>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:S.muted,marginBottom:4,display:"flex",justifyContent:"space-between"}}>
              <span>Emoji</span>
              <button onClick={async()=>{const name=editProd?.name||newProd.name;await suggestEmoji(name);}} disabled={emojiSuggesting||!(editProd?.name||newProd.name)} style={{background:S.purple,color:"#fff",border:"none",borderRadius:6,padding:"2px 8px",cursor:"pointer",fontSize:10,opacity:emojiSuggesting?0.5:1}}>{emojiSuggesting?"⏳ IA...":"🤖 Suggérer"}</button>
            </div>
            <input type="text" value={editProd?editProd.emoji:newProd.emoji} onChange={e=>editProd?setEditProd(p=>({...p,emoji:e.target.value})):setNewProd(p=>({...p,emoji:e.target.value}))} style={{...Inp(),fontSize:24,textAlign:"center",padding:"8px"}} maxLength={4}/>
          </div>
          <div style={{marginBottom:12}}><div style={{fontSize:11,color:S.muted,marginBottom:4}}>Prix (FCFA)</div><input type="number" value={editProd?editProd.price:newProd.price} onChange={e=>editProd?setEditProd(p=>({...p,price:e.target.value})):setNewProd(p=>({...p,price:e.target.value}))} style={Inp()}/></div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>{setAddProdModal(null);setEditProd(null);}} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button>
            <button onClick={()=>{if(editProd){const up={...editProd,price:parseInt(editProd.price)||0};if(editProd.cat==="boissons"){const nb=boissons.map(p=>p.id===up.id?up:p);setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}else{const ns=snacks.map(p=>p.id===up.id?up:p);setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}addAudit("MODIF",`${up.name}`);setEditProd(null);showToast("✓ Mis à jour");}else{if(!newProd.name||!newProd.price)return;const p={id:`c${uid()}`,name:newProd.name,price:parseInt(newProd.price)||0,emoji:newProd.emoji||"🍽️"};if(addProdModal==="boissons"){const nb=[...boissons,p];setBoissons(nb);saveProds(nb,snacks,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}else{const ns=[...snacks,p];setSnacks(ns);saveProds(boissons,ns,ingredients,recipes,photoPrice,dailyGoal,ticketNo);}addAudit("AJOUT",`${p.emoji}${p.name}`);setAddProdModal(null);setNewProd({name:"",price:"",emoji:"🍽️"});showToast("✓ Produit ajouté");}}} style={{...Btn(editProd?S.blue:S.gold),flex:1}}>✓ {editProd?"Modifier":"Ajouter"}</button>
          </div>
        </div>
      </div>}

      {/* Cash modal */}
      {cashModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:200,padding:16,overflowY:"auto"}}>
        <div style={{background:S.card,borderRadius:16,padding:20,width:"100%",maxWidth:380,border:`2px solid ${S.orange}`,marginTop:20}}>
          <div style={{fontWeight:800,fontSize:16,color:S.orange,marginBottom:16}}>💵 CLÔTURE DE CAISSE</div>
          {BILLETS.map(b=><div key={b} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><div style={{width:80,fontSize:13,fontWeight:700,color:S.gold}}>{b.toLocaleString()} F</div><input type="number" value={cashCount[b]??""} placeholder="0" onChange={e=>setCashCount(p=>({...p,[b]:Number(e.target.value)||0}))} style={{...Inp("80px"),padding:"7px 10px",fontSize:13,textAlign:"center"}}/><div style={{fontSize:12,color:"#aaa",flex:1,textAlign:"right"}}>{fmt((cashCount[b]||0)*b)}</div></div>)}
          <div style={{borderTop:`2px solid ${S.border}`,marginTop:14,paddingTop:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span>Caisse comptée</span><span style={{fontSize:16,fontWeight:800,color:S.gold}}>{fmt(cashTotal)}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span>CA système</span><span style={{fontSize:16,fontWeight:800,color:S.blue}}>{fmt(totalCA)}</span></div><div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${S.border}`}}><span style={{fontWeight:700}}>Écart</span><span style={{fontSize:18,fontWeight:800,color:cashDiff>=0?S.green:S.red}}>{cashDiff>=0?"+":""}{fmt(cashDiff)}</span></div>{cashDiff<0&&<div style={{background:"#1a0000",borderRadius:8,padding:"8px",fontSize:12,color:S.red,fontWeight:700,marginBottom:10}}>⚠️ MANQUE {fmt(Math.abs(cashDiff))} — Audit enregistré</div>}</div>
          <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setCashModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={()=>{addAudit("CLOTURE CAISSE",`Comptée:${fmt(cashTotal)} Écart:${fmt(cashDiff)}`);setCashModal(false);showToast(cashDiff>=0?"✓ Caisse OK":"⚠️ Écart noté",cashDiff>=0?S.green:S.red);}} style={{...Btn(cashDiff>=0?S.green:S.orange),flex:1}}>✓ Valider</button></div>
        </div>
      </div>}

      {/* WhatsApp */}
      {whatsModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:20,width:"100%",maxWidth:400,border:`2px solid #25D366`}}>
          <div style={{fontWeight:800,fontSize:15,color:"#25D366",marginBottom:12}}>📱 RAPPORT WHATSAPP</div>
          <div style={{background:S.card2,borderRadius:10,padding:14,fontSize:11,color:"#ccc",lineHeight:1.8,maxHeight:280,overflowY:"auto",whiteSpace:"pre-wrap",fontFamily:"monospace"}}>
            {`📊 ${currentStore.name}\n${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}\n\n💰 CA: ${fmt(totalCA)} | Net: ${fmt(netProfit)}\n🎯 Objectif: ${goalPct}%\n\n🥞 Food: ${fmt(totalFood)} (${sales.filter(s=>s.items[0]?.cat!=="gaming").length} ventes)\n🎮 Gaming: ${fmt(totalGaming)} (${doneSess.length} sessions)\n🎫 Tickets émis: ${ticketNo-1001}\n💸 Dépenses: ${fmt(totalExpenses)}\n\n${top5.length?`⭐ Top:\n${top5.map(p=>`• ${p.emoji}${p.name}: ${p.sold}×`).join("\n")}\n\n`:""}${lossAlerts.length?`🚨 PERTES:\n${lossAlerts.map(p=>`• ${p.emoji}${p.name}: ${lossQty(p.id)} manquant(s) = ${fmt(lossQty(p.id)*p.price)}`).join("\n")}\n\n`:"✅ Stock OK\n\n"}🔒 ${timeStr()} — ${user.name}`}
          </div>
          <div style={{display:"flex",gap:10,marginTop:14}}><button onClick={()=>setWhatsModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Fermer</button><button onClick={()=>{try{navigator.clipboard.writeText(`📊 ${currentStore.name}\n${new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}\n\n💰 CA: ${fmt(totalCA)} | Net: ${fmt(netProfit)}\n🎯 ${goalPct}%\n\nFood: ${fmt(totalFood)} | Gaming: ${fmt(totalGaming)}\n🎫 ${ticketNo-1001} tickets\nDépenses: ${fmt(totalExpenses)}\n\n${lossAlerts.length?`🚨 PERTES: ${lossAlerts.map(p=>`${p.name}: ${lossQty(p.id)} manquant(s)`).join(", ")}\n`:"✅ Stock OK\n"}\n🔒 ${timeStr()} — ${user.name}`);}catch(e){}showToast("✓ Copié","#25D366");}} style={{...Btn("#25D366"),flex:1}}>📋 Copier</button></div>
        </div>
      </div>}

      {/* Employees */}
      {empModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:200,padding:16,overflowY:"auto"}}>
        <div style={{background:S.card,borderRadius:16,padding:20,width:"100%",maxWidth:400,border:`2px solid ${S.gold}`,marginTop:20}}>
          <div style={{fontWeight:800,fontSize:15,color:S.gold,marginBottom:16}}>👥 ÉQUIPE</div>
          {editEmp?<div><div style={{fontSize:12,color:S.muted,marginBottom:12}}>Modifier {editEmp.name}</div>{[{l:"Nom",k:"name",t:"text"},{l:"PIN (4 chiffres)",k:"pin",t:"number"}].map(f=><div key={f.k} style={{marginBottom:12}}><div style={{fontSize:11,color:S.muted,marginBottom:4}}>{f.l}</div><input type={f.t} value={editEmp[f.k]} onChange={e=>setEditEmp(p=>({...p,[f.k]:f.k==="pin"?e.target.value.slice(0,4):e.target.value}))} style={Inp()}/></div>)}<div style={{display:"flex",gap:10}}><button onClick={()=>setEditEmp(null)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={async()=>{if(editEmp.pin.length===4&&editEmp.name){const ne=emps.map(e=>e.id===editEmp.id?editEmp:e);setEmps(ne);empRef.current=ne;await saveEmps(ne);setEditEmp(null);showToast("✓ Mis à jour");}}} disabled={editEmp.pin.length!==4} style={{...Btn(S.gold),flex:1,opacity:editEmp.pin.length===4?1:0.4}}>✓ Sauvegarder</button></div></div>
          :<div>{emps.map(e=><div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${S.border}`}}><div style={{fontSize:22}}>{e.role==="patron"?"👑":"👤"}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:e.role==="patron"?S.gold:S.text}}>{e.name}</div><div style={{fontSize:10,color:S.muted}}>PIN: {"•".repeat(4)} • {e.role}</div></div><button onClick={()=>setEditEmp({...e})} style={{background:S.card2,border:`1px solid ${S.blue}`,color:S.blue,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:13}}>✏️</button></div>)}<button onClick={()=>setEmpModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,width:"100%",marginTop:12}}>Fermer</button></div>}
        </div>
      </div>}

      {/* Expense */}
      {expModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:340,border:`2px solid ${S.orange}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.orange,marginBottom:16}}>💸 Nouvelle dépense</div>
          {[{l:"Emoji",k:"emoji",t:"text",ph:"🛒"},{l:"Description",k:"label",t:"text",ph:"Achat farine..."},{l:"Montant (FCFA)",k:"amount",t:"number",ph:"5000"}].map(f=><div key={f.k} style={{marginBottom:12}}><div style={{fontSize:11,color:S.muted,marginBottom:4}}>{f.l}</div><input type={f.t} value={newExp[f.k]} placeholder={f.ph} onChange={e=>setNewExp(p=>({...p,[f.k]:e.target.value}))} style={Inp()}/></div>)}
          <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setExpModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={()=>{if(!newExp.label||!newExp.amount)return;const e={id:uid(),label:newExp.label,amount:parseInt(newExp.amount)||0,emoji:newExp.emoji||"🛒",time:timeStr()};const ne=[...expenses,e];setExpenses(ne);saveDay({expenses:ne});addAudit("DÉPENSE",`${e.emoji}${e.label} ${fmt(e.amount)}`);setExpModal(false);setNewExp({label:"",amount:"",emoji:"🛒"});showToast("Dépense enregistrée",S.orange);}} style={{...Btn(S.orange),flex:1}}>✓ Enregistrer</button></div>
        </div>
      </div>}

      {/* Goal modal */}
      {goalModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        <div style={{background:S.card,borderRadius:16,padding:24,width:"100%",maxWidth:320,border:`2px solid ${S.gold}`}}>
          <div style={{fontWeight:800,fontSize:15,color:S.gold,marginBottom:16}}>🎯 Objectif journalier</div>
          <input type="number" value={newGoal} placeholder="150000" onChange={e=>setNewGoal(e.target.value)} style={Inp()}/>
          <div style={{display:"flex",gap:10,marginTop:16}}><button onClick={()=>setGoalModal(false)} style={{background:S.card2,border:`1px solid ${S.border}`,color:S.muted,borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,flex:1}}>Annuler</button><button onClick={()=>{const g=parseInt(newGoal)||DEFAULT_GOAL;setDailyGoal(g);saveProds(boissons,snacks,ingredients,recipes,stations,photoPrice,g,ticketNo);setGoalModal(false);showToast("✓ Objectif mis à jour");}} style={{...Btn(S.gold),flex:1}}>✓ OK</button></div>
        </div>
      </div>}
    <input ref={scanRef} type="file" accept="image/*,image/heic,image/heif" capture="environment" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){const t=e.target.dataset.target||"stock";scanIA(e.target.files[0],t);e.target.value="";}}}/>
    </div>
  );
}
