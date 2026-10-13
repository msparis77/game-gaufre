import React, { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, updateDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfigure, connecterCaisse, deconnecterCaisse, EMAIL_CAISSE } from "./firebaseCaisse.js";
import { abonner, imprimer, imprimerNavigateur, imprimerBonLivraison, bonLivreurNavigateur, texteBonLivreur, reglerSon, reglerImpressionAuto, debloquerSon, heureRetrait, PRINT_BRIDGE_URL } from "./veille.js";
import { verifierCommande, fcfa, prixSimple } from "../../arena-commande/src/shared/prix.js";
import { hhmm, versMinutes } from "../../arena-commande/src/shared/creneaux.js";
import { nettoyerTelephone, telephoneValide } from "../../arena-commande/src/shared/commander.js";
import { MENU_DEPART, CRENEAUX_DEPART, LIVRAISON_DEPART } from "../../arena-commande/src/shared/menuDepart.js";

const STATUTS = {
  recue: { nom: "Reçue", couleur: "#FF6D00" },
  preparation: { nom: "En préparation", couleur: "#00B0FF" },
  prete: { nom: "Prête", couleur: "#00E676" },
  recuperee: { nom: "Récupérée", couleur: "#555" },
  en_route: { nom: "🛵 En route", couleur: "#B388FF" },
  livree: { nom: "Livrée", couleur: "#555" },
  annulee: { nom: "Annulée", couleur: "#FF5252" },
};
const SUIVANT = {
  recue: { statut: "preparation", label: "▶ En préparation" },
  preparation: { statut: "prete", label: "✓ Prête" },
  prete: { statut: "recuperee", label: "💵 Récupérée · encaisser" },
};
const SUIVANT_LIVRAISON = {
  recue: { statut: "preparation", label: "▶ En préparation" },
  preparation: { statut: "en_route", label: "🛵 En route" },
  en_route: { statut: "livree", label: "💵 Livrée · encaisser" },
};
const EN_COURS = ["recue", "preparation", "prete", "en_route"];
const FINAL = ["recuperee", "livree"]; // statuts où la vente est encaissée
const fraisLivraison = (c) => (c.livraison ? c.livraison.frais || 0 : 0);
// Vente à enregistrer : articles recalculés + frais de livraison
function vente(menu, c) {
  const v = menu ? verifierCommande(menu, c) : { lignes: c.lignes, total: c.total, ecart: false };
  if (!c.livraison) return v;
  return { ...v, lignes: [...v.lignes, { articleId: "livraison", nom: "🛵 Livraison " + c.livraison.nom, prixUnitaire: c.livraison.frais, qte: 1 }], total: v.total + c.livraison.frais };
}

export function useVeille() {
  const [e, setE] = useState(null);
  useEffect(() => abonner(setE), []);
  return e;
}
function useDoc(chemin, actif) {
  const [v, setV] = useState(undefined);
  useEffect(() => {
    if (!actif) return;
    return onSnapshot(doc(db, chemin), (s) => setV(s.exists() ? s.data() : null), () => setV(null));
  }, [chemin, actif]);
  return v;
}

export default function CommandesEnLigne({ S, Btn, Inp, Card, Sub, requirePatron, showToast, enregistrerVente }) {
  const veille = useVeille();
  const [vue, setVue] = useState("commandes");
  const connecte = !!veille?.connecte;
  const menu = useDoc("config/menu", connecte);
  const creneaux = useDoc("config/creneaux", connecte);
  const livraison = useDoc("config/livraison", connecte);
  const livreursDoc = useDoc("config/livreurs", connecte);
  const livreurs = (livreursDoc && livreursDoc.liste) || [];

  if (!firebaseConfigure)
    return <div style={{ padding: 14 }}><div style={Card(S.orange)}>
      <div style={{ fontWeight: 700, color: S.orange, marginBottom: 6 }}>🌐 Commande en ligne pas encore branchée</div>
      <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.6 }}>Les clés du projet Firebase ne sont pas encore ajoutées à la caisse (réglages Vercel). Voir le guide d'installation.</div>
    </div></div>;
  if (!veille || !veille.pret) return <div style={{ padding: 14, color: S.muted }}>Connexion…</div>;
  if (!connecte) return <ConnexionCaisse S={S} Btn={Btn} Inp={Inp} Card={Card} showToast={showToast} />;

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {[["commandes", "📋 Commandes"], ["menu", "🍽️ Menu & prix"], ["creneaux", "🕐 Créneaux"], ["livraison", "🛵 Livraison"]].map(([id, l]) => (
          <button key={id} style={Sub(vue === id)} onClick={() => (id === "commandes" ? setVue(id) : requirePatron(() => setVue(id)))}>{l}</button>
        ))}
      </div>
      {vue === "commandes" && <ListeCommandes {...{ S, Btn, Card, veille, menu, creneaux, livreurs, showToast, enregistrerVente }} />}
      {vue === "menu" && <EditeurMenu {...{ S, Btn, Inp, Card, menu, showToast }} />}
      {vue === "creneaux" && <EditeurCreneaux {...{ S, Btn, Inp, Card, creneaux, showToast }} />}
      {vue === "livraison" && <EditeurLivraison {...{ S, Btn, Inp, Card, livraison, livreurs, showToast }} />}
    </div>
  );
}

function ConnexionCaisse({ S, Btn, Inp, Card, showToast }) {
  const [mdp, setMdp] = useState("");
  const [attente, setAttente] = useState(false);
  const go = async () => {
    setAttente(true);
    try { await connecterCaisse(mdp); showToast("✓ Caisse connectée aux commandes en ligne"); }
    catch (e) { showToast("❌ Mot de passe incorrect", S.red); }
    setAttente(false);
  };
  return <div style={{ padding: 14 }}><div style={Card(S.gold)}>
    <div style={{ fontWeight: 800, color: S.gold, marginBottom: 6 }}>🌐 Connecter ce poste aux commandes en ligne</div>
    <div style={{ fontSize: 12, color: S.muted, marginBottom: 10, lineHeight: 1.6 }}>À faire une seule fois par appareil. Mot de passe du compte {EMAIL_CAISSE} (demandez au patron).</div>
    <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Mot de passe" style={{ ...Inp(), marginBottom: 10 }} onKeyDown={(e) => e.key === "Enter" && go()} />
    <button disabled={attente || !mdp} onClick={go} style={{ ...Btn(), width: "100%" }}>{attente ? "…" : "Connecter"}</button>
  </div></div>;
}

// ─────────────── Liste des commandes ───────────────
function ListeCommandes({ S, Btn, Card, veille, menu, creneaux, livreurs, showToast, enregistrerVente }) {
  const [voirFinies, setVoirFinies] = useState(false);
  const [occupe, setOccupe] = useState(null);
  const auj = new Date().toISOString().slice(0, 10);
  const jour = (c) => c.retraitAt.toDate().toISOString().slice(0, 10);
  const actives = veille.commandes.filter((c) => EN_COURS.includes(c.statut));
  const finies = veille.commandes.filter((c) => !EN_COURS.includes(c.statut) && jour(c) === auj);
  const encaisse = finies.filter((c) => FINAL.includes(c.statut)).reduce((s, c) => s + vente(menu, c).total, 0);

  const changer = async (c, statut, extra = {}) => {
    if (c.codeRetrait && statut === "recuperee" && !window.confirm(`Vérifie avant de remettre la commande ${c.code} :\n\n${c.prenom} doit te donner le code secret ${c.codeRetrait}.\n\nLe code est bon ?`)) return;
    if (c.codeRetrait && statut === "livree" && !window.confirm(`Livraison ${c.code} :\n\nLe livreur a bien reçu le code secret ${c.codeRetrait} de ${c.prenom} et l'argent (${fcfa(vente(menu, c).total)}) ?`)) return;
    setOccupe(c.id);
    try {
      if (FINAL.includes(statut)) {
        const v = vente(menu, c);
        // On marque la vente enregistrée dans Firebase d'abord : si deux caisses
        // cliquent en même temps, une seule enregistre la vente.
        const ok = await runTransaction(db, async (tx) => {
          const ref = doc(db, "commandes_en_ligne", c.id);
          const s = await tx.get(ref);
          if (!s.exists() || s.data().venteEnregistree) return false;
          tx.update(ref, { statut, venteEnregistree: true, majAt: serverTimestamp() });
          return true;
        });
        if (ok) { enregistrerVente(c, v); showToast(`✓ ${c.code} encaissée — ${fcfa(v.total)}`); }
        else showToast("Déjà encaissée sur un autre poste", S.orange);
      } else {
        await updateDoc(doc(db, "commandes_en_ligne", c.id), { statut, ...extra, majAt: serverTimestamp() });
        // Départ en livraison : on imprime le bon pour le livreur
        if (statut === "en_route") imprimerBonLivraison({ ...c, ...extra });
      }
    } catch (e) { showToast("❌ Erreur : " + (e.code || e.message), S.red); }
    setOccupe(null);
  };
  const annuler = (c) => { if (window.confirm(`Annuler la commande ${c.code} de ${c.prenom} ?`)) changer(c, "annulee"); };

  return <>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
      <button onClick={() => reglerSon(!veille.son)} style={{ ...Btn(veille.son ? S.green : S.card3, veille.son ? S.bg : S.muted), flex: 1, fontSize: 11 }}>{veille.son ? "🔔 Son activé" : "🔕 Son coupé"}</button>
      <button onClick={() => reglerImpressionAuto(!veille.impressionAuto)} style={{ ...Btn(veille.impressionAuto ? S.teal : S.card3, veille.impressionAuto ? "#fff" : S.muted), flex: 1, fontSize: 11 }}>{veille.impressionAuto ? "🖨️ Impression auto" : "🖨️ Impression manuelle"}</button>
    </div>
    {veille.son && veille.sonBloque && <button onClick={debloquerSon} style={{ ...Btn(S.orange), width: "100%", marginBottom: 10 }}>🔔 Touchez ici pour autoriser le son</button>}
    {creneaux && creneaux.ouvert === false && <div style={{ ...Card(S.red), color: S.red, fontSize: 12, fontWeight: 700 }}>⛔ Commandes en ligne FERMÉES (onglet Créneaux pour rouvrir)</div>}
    {veille.erreur && <div style={{ ...Card(S.red), color: S.red, fontSize: 12 }}>{veille.erreur}</div>}
    {veille.derniereImpression && <div style={{ fontSize: 11, color: veille.derniereImpression.startsWith("❌") ? S.red : S.muted, marginBottom: 8 }}>{veille.derniereImpression}</div>}
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <div style={{ ...Card(), flex: 1, marginBottom: 0, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: S.orange }}>{actives.length}</div><div style={{ fontSize: 10, color: S.muted }}>en cours</div></div>
      <div style={{ ...Card(), flex: 1, marginBottom: 0, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: S.green }}>{fcfa(encaisse)}</div><div style={{ fontSize: 10, color: S.muted }}>encaissé en ligne aujourd'hui</div></div>
    </div>
    {!actives.length && <div style={{ ...Card(), color: S.muted, fontSize: 13, textAlign: "center" }}>Aucune commande en cours.</div>}
    {actives.map((c) => <CarteCommande key={c.id} {...{ S, Btn, Card, c, menu, occupe, changer, annuler, auj, jour, livreurs }} />)}
    {finies.length > 0 && <button onClick={() => setVoirFinies(!voirFinies)} style={{ ...Btn(S.card2, S.muted), width: "100%", marginTop: 6 }}>{voirFinies ? "▲" : "▼"} Terminées aujourd'hui ({finies.length})</button>}
    {voirFinies && finies.map((c) => <CarteCommande key={c.id} {...{ S, Btn, Card, c, menu, occupe, changer, annuler, auj, jour, livreurs }} finie />)}
    <div style={{ fontSize: 10, color: S.muted, marginTop: 14, lineHeight: 1.6 }}>Print bridge : {PRINT_BRIDGE_URL}. Les commandes récupérées sont ajoutées aux ventes du jour (🌐) et comptent dans la clôture de caisse.</div>
  </>;
}

function CarteCommande({ S, Btn, Card, c, menu, occupe, changer, annuler, auj, jour, finie, livreurs = [] }) {
  const st = STATUTS[c.statut] || STATUTS.recue;
  const v = menu ? verifierCommande(menu, c) : null;
  const liv = c.livraison;
  const suivant = (liv ? SUIVANT_LIVRAISON : SUIVANT)[c.statut];
  const [choix, setLivreur] = useState(c.livreur || "");
  const livreur = livreurs.find((x) => x.nom === choix) || livreurs[0] || null;
  const allerSuivant = () => changer(c, suivant.statut, suivant.statut === "en_route" && livreur ? { livreur: livreur.nom, ...(livreur.tel ? { livreurTel: livreur.tel } : {}) } : {});
  const autreJour = jour(c) !== auj;
  return <div style={{ ...Card(st.couleur), borderWidth: c.statut === "recue" ? 2 : 1, opacity: finie ? 0.6 : 1 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 30, fontWeight: 900, color: S.gold, minWidth: 64 }}>{c.code}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>{c.prenom}{c.codeRetrait && <span title="Code secret de retrait" style={{ background: S.gold, color: S.bg, borderRadius: 6, padding: "1px 7px", marginLeft: 6, fontSize: 15, fontWeight: 900, letterSpacing: 2 }}>🔑 {c.codeRetrait}</span>} <a href={"tel:+221" + c.telephone} style={{ color: S.blue, fontSize: 12, textDecoration: "none" }}>📞 {c.telephone}</a></div>
        <div style={{ fontSize: 12, color: S.muted }}>{liv ? "🛵 Livraison vers" : "Retrait"} <b style={{ color: S.text }}>{heureRetrait(c)}</b>{autreJour && <b style={{ color: S.orange }}> · {c.retraitAt.toDate().toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", timeZone: "UTC" })}</b>}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: st.couleur, textAlign: "right" }}>{st.nom}<br />{c.imprimeAt ? "🖨️ imprimé" : c.statut === "recue" ? "⏳ pas imprimé" : ""}</div>
    </div>
    <div style={{ background: S.card2, borderRadius: 8, padding: 8, margin: "8px 0", fontSize: 13 }}>
      {(v ? v.lignes : c.lignes).map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "2px 0" }}>
        <span><b>{l.qte} ×</b> {l.nom}{l.inconnu && <span style={{ color: S.orange }}> (article supprimé du menu)</span>}</span><span style={{ color: S.muted, whiteSpace: "nowrap" }}>{fcfa(l.prixUnitaire * l.qte)}</span>
      </div>)}
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${S.border}`, marginTop: 4, paddingTop: 4, fontWeight: 800 }}><span>À encaisser</span><span style={{ color: S.green }}>{fcfa((v ? v.total : c.total) + fraisLivraison(c))}{liv ? ` (dont livraison ${fcfa(liv.frais)})` : ""}</span></div>
      {v && v.ecart && <div style={{ color: S.orange, fontSize: 11, marginTop: 4 }}>⚠️ Le téléphone affichait {fcfa(c.total)} : le prix a été recalculé avec le menu actuel.</div>}
    </div>
    {liv && <div style={{ background: S.card2, borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 13, borderLeft: `3px solid ${STATUTS.en_route.couleur}` }}>
      <b>🛵 {liv.nom}</b> · {liv.adresse}{c.livreur && <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>Livreur : <b style={{ color: S.text }}>{c.livreur}</b>{c.livreurTel && <> · {c.livreurTel}</>}</div>}
      {c.statut === "en_route" && <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        {c.livreurTel && <a href={`https://wa.me/221${c.livreurTel}?text=${encodeURIComponent(texteBonLivreur(c))}`} target="_blank" rel="noopener" style={{ ...Btn("#25D366", "#fff"), flex: 2, textAlign: "center", textDecoration: "none", fontSize: 12 }}>📲 Bon au livreur</a>}
        <button onClick={() => imprimerBonLivraison(c)} title="Réimprimer le bon de livraison" style={{ ...Btn(S.card3, S.text), flex: 1, fontSize: 12 }}>🖨️ Bon</button>
        <button onClick={() => bonLivreurNavigateur(c)} title="Imprimer le bon avec la fenêtre du navigateur" style={{ ...Btn(S.card3, S.text), flex: 1, fontSize: 12 }}>🪟 Bon</button>
      </div>}
    </div>}
    {!finie && liv && c.statut === "preparation" && livreurs.length > 0 && <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: S.muted }}>Qui livre ?</span>
      {livreurs.map((x) => <button key={x.nom} onClick={() => setLivreur(x.nom)} style={{ ...Btn(livreur && livreur.nom === x.nom ? STATUTS.en_route.couleur : S.card3, livreur && livreur.nom === x.nom ? S.bg : S.text), padding: "6px 10px", fontSize: 12 }}>{x.nom}</button>)}
    </div>}
    {!finie && <div style={{ display: "flex", gap: 6 }}>
      {suivant && <button disabled={occupe === c.id} onClick={allerSuivant} style={{ ...Btn(STATUTS[suivant.statut].couleur === "#555" ? S.gold : STATUTS[suivant.statut].couleur), flex: 3 }}>{occupe === c.id ? "…" : suivant.label}</button>}
      <a href={lienWhatsApp(c)} target="_blank" rel="noopener" title="Prévenir l'élève sur WhatsApp" style={{ ...Btn(["prete", "en_route"].includes(c.statut) ? "#25D366" : S.card3, ["prete", "en_route"].includes(c.statut) ? "#fff" : S.text), flex: ["prete", "en_route"].includes(c.statut) ? 2 : 1, textAlign: "center", textDecoration: "none" }}>📲{["prete", "en_route"].includes(c.statut) ? " WhatsApp" : ""}</a>
      <button onClick={() => imprimer(c, { force: true })} title="Réimprimer via le print bridge" style={{ ...Btn(S.card3, S.text), flex: 1 }}>🖨️</button>
      <button onClick={() => imprimerNavigateur(c)} title="Imprimer avec la fenêtre du navigateur" style={{ ...Btn(S.card3, S.text), flex: 1 }}>🪟</button>
      <button onClick={() => annuler(c)} title="Annuler" style={{ ...Btn(S.card3, S.red), flex: 1 }}>✕</button>
    </div>}
  </div>;
}

// Message WhatsApp prêt à envoyer à l'élève (le caissier n'a plus qu'à appuyer sur Envoyer).
function lienWhatsApp(c) {
  const texte = c.statut === "en_route"
    ? `Bonjour ${c.prenom}, ta commande ${c.code} de l'Arena Café est en route${c.livreur ? ` avec ${c.livreur}` : ""}${c.livreurTel ? ` (${c.livreurTel})` : ""} !${c.codeRetrait ? ` Donne ton code secret ${c.codeRetrait} au livreur.` : ""} À tout de suite 😊`
    : c.statut === "prete"
    ? `Bonjour ${c.prenom}, ta commande ${c.code} est prête à l'Arena Café !${c.codeRetrait ? ` Ton code de retrait : ${c.codeRetrait}.` : ""} À tout de suite 😊`
    : `Bonjour ${c.prenom}, c'est l'Arena Café pour ta commande ${c.code}.`;
  return `https://wa.me/221${c.telephone}?text=${encodeURIComponent(texte)}`;
}

// ─────────────── Éditeur du menu ───────────────
const nouvelId = (p) => p + "_" + Date.now().toString(36);

function EditeurMenu({ S, Btn, Inp, Card, menu, showToast }) {
  const [brouillon, setBrouillon] = useState(null);
  const [sauve, setSauve] = useState(false);
  useEffect(() => { if (menu && !brouillon) setBrouillon(JSON.parse(JSON.stringify(menu))); }, [menu]);

  if (menu === undefined) return <div style={{ color: S.muted }}>Chargement…</div>;
  if (menu === null) return <Initialiser {...{ S, Btn, Card, showToast }} />;
  if (!brouillon) return null;

  const m = brouillon;
  const maj = (f) => { const n = JSON.parse(JSON.stringify(m)); f(n); setBrouillon(n); };
  const majArticle = (id, champ, val) => maj((n) => { const a = n.articles.find((x) => x.id === id); a[champ] = val; });
  const nombre = (v) => Math.max(0, Math.round(Number(v) || 0));
  const modifie = JSON.stringify(m) !== JSON.stringify(menu);

  const enregistrer = async () => {
    setSauve(true);
    try { await setDoc(doc(db, "config/menu"), { ...m, majAt: serverTimestamp() }); showToast("✓ Menu enregistré, visible tout de suite sur le site"); }
    catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
    setSauve(false);
  };

  return <>
    <div style={{ fontSize: 12, color: S.muted, marginBottom: 10, lineHeight: 1.6 }}>Modifiez puis appuyez sur <b>Enregistrer</b>. Un article décoché « dispo » disparaît du site.</div>
    {m.categories.map((cat) => <div key={cat.id} style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 8 }}>{cat.emoji} {cat.nom}</div>
      {m.articles.filter((a) => a.categorie === cat.id).map((a) => {
        const boisson = cat.id === "boissons" || prixSimple(a); // prix unique, sans formule
        return <div key={a.id} style={{ borderTop: `1px solid ${S.border}`, padding: "8px 0" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={a.emoji || ""} onChange={(e) => majArticle(a.id, "emoji", e.target.value)} style={{ ...Inp(44), textAlign: "center", padding: 6 }} />
            <input value={a.nom} onChange={(e) => majArticle(a.id, "nom", e.target.value)} placeholder="Nom" style={Inp()} />
          </div>
          {!boisson && <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={a.nomWolof || ""} onChange={(e) => majArticle(a.id, "nomWolof", e.target.value)} placeholder="Nom wolof" style={Inp()} />
          </div>}
          {cat.id !== "boissons" && <input value={a.description || ""} onChange={(e) => majArticle(a.id, "description", e.target.value)} placeholder="Description" style={{ ...Inp(), marginBottom: 6 }} />}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: S.muted }}>{boisson ? "Prix" : "Prix formule"}</span>
            <input type="number" value={boisson ? a.prix : a.prixFormule} onChange={(e) => majArticle(a.id, boisson ? "prix" : "prixFormule", nombre(e.target.value))} style={Inp(90)} />
            {!boisson && <span style={{ fontSize: 11, color: S.muted }}>seul : {fcfa(a.prixFormule - m.options.remiseSansBoisson)}</span>}
            {!boisson && <label style={{ fontSize: 11, color: S.muted }}><input type="checkbox" checked={!!a.omelette} onChange={(e) => majArticle(a.id, "omelette", e.target.checked)} /> omelette (choix de sauce)</label>}
            {!boisson && <label style={{ fontSize: 11, color: S.muted }}><input type="checkbox" checked={!a.sansChoixPain} onChange={(e) => majArticle(a.id, "sansChoixPain", !e.target.checked)} /> choix du pain</label>}
            {prixSimple(a) && cat.plats && <label style={{ fontSize: 11, color: S.muted }}>accompagnements <input type="number" min="0" max="5" value={a.accompagnements || 0} onChange={(e) => majArticle(a.id, "accompagnements", nombre(e.target.value))} style={Inp(50)} /></label>}
            <label style={{ fontSize: 11, color: a.dispo !== false ? S.green : S.red }}><input type="checkbox" checked={a.dispo !== false} onChange={(e) => majArticle(a.id, "dispo", e.target.checked)} /> dispo</label>
            <button onClick={() => window.confirm(`Supprimer « ${a.nom} » ?`) && maj((n) => { n.articles = n.articles.filter((x) => x.id !== a.id); })} style={{ ...Btn(S.card3, S.red), padding: "4px 8px", fontSize: 11 }}>Supprimer</button>
          </div>
          <input value={a.photo || ""} onChange={(e) => majArticle(a.id, "photo", e.target.value.trim())} placeholder="Lien de la photo (optionnel)" style={{ ...Inp(), marginTop: 6, fontSize: 11 }} />
        </div>;
      })}
      <button onClick={() => maj((n) => n.articles.push(cat.id === "boissons"
        ? { id: nouvelId("b"), categorie: cat.id, nom: "Nouvelle boisson", nomWolof: "", description: "", prix: 100, emoji: "🥤", photo: "", dispo: false }
        : cat.prixUnique
        ? { id: nouvelId("c"), categorie: cat.id, nom: "Nouvel article", nomWolof: "", description: "", prix: 1000, emoji: "🧇", photo: "", dispo: false }
        : { id: nouvelId("a"), categorie: cat.id, nom: "Nouveau sandwich", nomWolof: "", description: "", prixFormule: 500, omelette: cat.id === "omelettes", emoji: "🥪", photo: "", dispo: false }))}
        style={{ ...Btn(S.card3, S.text), width: "100%", marginTop: 6, fontSize: 12 }}>+ Ajouter</button>
    </div>)}

    <div style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 8 }}>⚙️ Règles de prix</div>
      <Ligne S={S} label="Réduction sandwich seul (sans boisson)"><input type="number" value={m.options.remiseSansBoisson} onChange={(e) => maj((n) => { n.options.remiseSansBoisson = nombre(e.target.value); })} style={Inp(90)} /></Ligne>
      <Ligne S={S} label="Supplément fromage (tous les sandwichs)"><input type="number" value={m.options.supplementFromage} onChange={(e) => maj((n) => { n.options.supplementFromage = nombre(e.target.value); })} style={Inp(90)} /></Ligne>
      <div style={{ fontSize: 12, fontWeight: 700, margin: "10px 0 4px" }}>Boissons de la formule (supplément)</div>
      {m.options.boissonsFormule.map((b, i) => <div key={b.id} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        <input value={b.nom} onChange={(e) => maj((n) => { n.options.boissonsFormule[i].nom = e.target.value; })} style={Inp()} />
        <input type="number" value={b.sup} onChange={(e) => maj((n) => { n.options.boissonsFormule[i].sup = nombre(e.target.value); })} style={Inp(80)} />
        <button onClick={() => maj((n) => { n.options.boissonsFormule.splice(i, 1); })} style={{ ...Btn(S.card3, S.red), padding: "4px 8px" }}>✕</button>
      </div>)}
      <button onClick={() => maj((n) => { n.options.boissonsFormule.push({ id: nouvelId("f"), nom: "Nouvelle boisson", sup: 0 }); })} style={{ ...Btn(S.card3, S.text), fontSize: 11 }}>+ Boisson de formule</button>
      <div style={{ fontSize: 12, fontWeight: 700, margin: "10px 0 4px" }}>Sauces des omelettes (séparées par des virgules)</div>
      <input value={m.options.sauces.join(", ")} onChange={(e) => maj((n) => { n.options.sauces = e.target.value.split(",").map((x) => x.trim()).filter(Boolean); })} style={Inp()} />
      <div style={{ fontSize: 12, fontWeight: 700, margin: "10px 0 4px" }}>Pains au choix (séparés par des virgules)</div>
      <input value={(m.options.pains || []).join(", ")} onChange={(e) => maj((n) => { n.options.pains = e.target.value.split(",").map((x) => x.trim()).filter(Boolean); })} placeholder="Baguette, Pain local brioché" style={Inp()} />
      {(m.options.pains || []).map((p) => <Ligne key={p} S={S} label={"Supplément " + p}><input type="number" value={(m.options.supplementsPain || {})[p] || 0} onChange={(e) => maj((n) => { n.options.supplementsPain = { ...(n.options.supplementsPain || {}), [p]: nombre(e.target.value) }; })} style={Inp(90)} /></Ligne>)}
      <div style={{ fontSize: 12, fontWeight: 700, margin: "10px 0 4px" }}>Accompagnements du poulet (séparés par des virgules)</div>
      <input value={(m.options.accompagnements || []).join(", ")} onChange={(e) => maj((n) => { n.options.accompagnements = e.target.value.split(",").map((x) => x.trim()).filter(Boolean); })} placeholder="Riz blanc, Vermicelle…" style={Inp()} />
    </div>

    <div style={{ position: "sticky", bottom: 64, display: "flex", gap: 8 }}>
      <button disabled={!modifie} onClick={() => setBrouillon(JSON.parse(JSON.stringify(menu)))} style={{ ...Btn(S.card3, S.muted), flex: 1 }}>Annuler</button>
      <button disabled={!modifie || sauve} onClick={enregistrer} style={{ ...Btn(modifie ? S.green : S.card3, modifie ? S.bg : S.muted), flex: 2 }}>{sauve ? "…" : modifie ? "💾 Enregistrer" : "✓ À jour"}</button>
    </div>
  </>;
}

const Ligne = ({ S, label, children }) => <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 12, color: S.muted }}>{label}</span>{children}</div>;

function Initialiser({ S, Btn, Card, showToast }) {
  const [attente, setAttente] = useState(false);
  const go = async () => {
    setAttente(true);
    try {
      await setDoc(doc(db, "config/menu"), MENU_DEPART);
      await setDoc(doc(db, "config/creneaux"), CRENEAUX_DEPART);
      showToast("✓ Menu et créneaux de départ chargés");
    } catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
    setAttente(false);
  };
  return <div style={Card(S.gold)}>
    <div style={{ fontWeight: 800, color: S.gold, marginBottom: 6 }}>Menu en ligne vide</div>
    <div style={{ fontSize: 12, color: S.muted, marginBottom: 10 }}>Charger le menu petit-déjeuner de départ (sandwichs, omelettes, boissons) et les créneaux 7h30 → 10h00.</div>
    <button disabled={attente} onClick={go} style={{ ...Btn(), width: "100%" }}>{attente ? "…" : "Charger le menu de départ"}</button>
  </div>;
}

// ─────────────── Réglages de la livraison ───────────────
function EditeurLivraison({ S, Btn, Inp, Card, livraison, livreurs, showToast }) {
  const [b, setB] = useState(null);
  const [liv, setLiv] = useState(null);
  useEffect(() => { if (!liv) setLiv(livreurs.map((x) => ({ ...x }))); }, [livreurs, liv]);
  useEffect(() => {
    if (livraison !== undefined && !b) {
      const l = livraison || LIVRAISON_DEPART;
      setB({ ...l, zones: Object.entries(l.zones || {}).sort(([x], [y]) => x.localeCompare(y, "fr", { numeric: true })).map(([id, z]) => ({ id, ...z })) });
    }
  }, [livraison, b]);
  if (livraison === undefined || !b || !liv) return <div style={{ color: S.muted }}>Chargement…</div>;
  const nombre = (v) => Math.max(0, Math.round(Number(v) || 0));
  const majZone = (i, champ, v) => setB({ ...b, zones: b.zones.map((z, j) => (j === i ? { ...z, [champ]: v } : z)) });
  const donnees = (actif) => {
    const zones = {};
    b.zones.forEach((z, i) => { zones["z" + (i + 1)] = { nom: String(z.nom).trim(), frais: nombre(z.frais), actif: !!z.actif }; });
    return { actif, minimum: nombre(b.minimum), zones };
  };
  const enregistrer = async (actif = b.actif) => {
    if (b.zones.some((z) => !String(z.nom).trim())) return showToast("❌ Donne un nom à chaque zone", S.red);
    if (actif && !b.zones.some((z) => z.actif)) return showToast("❌ Active au moins une zone avant d'ouvrir la livraison", S.red);
    const liste = liv.map((x) => ({ nom: String(x.nom).trim(), tel: nettoyerTelephone(x.tel) })).filter((x) => x.nom);
    const telFaux = liste.find((x) => x.tel && !telephoneValide(x.tel));
    if (telFaux) return showToast(`❌ Numéro invalide pour ${telFaux.nom} (ex. 77 123 45 67)`, S.red);
    try {
      const d = donnees(actif);
      await setDoc(doc(db, "config/livraison"), d);
      await setDoc(doc(db, "config/livreurs"), { liste });
      setB(null); setLiv(null);
      showToast(actif !== !!(livraison && livraison.actif) ? (actif ? "🛵 Livraison ACTIVÉE sur le site" : "⛔ Livraison désactivée") : "✓ Réglages de livraison enregistrés");
    } catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  const actif = !!(livraison && livraison.actif);
  return <>
    <button onClick={() => window.confirm(actif ? "Désactiver la livraison ? Les élèves ne pourront plus la choisir." : "Activer la livraison ? Les élèves pourront la choisir sur le site.") && enregistrer(!actif)} style={{ ...Btn(actif ? S.green : S.red, S.bg), width: "100%", marginBottom: 12, padding: 14 }}>
      {actif ? "🛵 Livraison ACTIVÉE — toucher pour désactiver" : "⛔ Livraison DÉSACTIVÉE — toucher pour activer"}
    </button>
    <div style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 4 }}>📍 Zones de livraison</div>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 10, lineHeight: 1.6 }}>Une ligne par ville ou quartier, avec ses frais. Décochez « ouverte » pour une zone pas encore livrée : elle n'apparaît pas sur le site.</div>
      <div style={{ display: "flex", gap: 6, fontSize: 10, color: S.muted, marginBottom: 4 }}><span style={{ flex: 1 }}>Zone</span><span style={{ width: 80 }}>Frais (F)</span><span>Ouverte</span></div>
      {b.zones.map((z, i) => <div key={z.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
        <input value={z.nom} onChange={(e) => majZone(i, "nom", e.target.value)} style={{ ...Inp(), flex: 1 }} />
        <input type="number" value={z.frais} onChange={(e) => majZone(i, "frais", e.target.value)} style={Inp(80)} />
        <input type="checkbox" checked={!!z.actif} onChange={(e) => majZone(i, "actif", e.target.checked)} />
        <button onClick={() => setB({ ...b, zones: b.zones.filter((_, j) => j !== i) })} style={{ ...Btn(S.card3, S.red), padding: "4px 8px" }}>✕</button>
      </div>)}
      <button onClick={() => setB({ ...b, zones: [...b.zones, { id: nouvelId("z"), nom: "", frais: 500, actif: false }] })} style={{ ...Btn(S.card3, S.text), width: "100%", fontSize: 12, marginBottom: 10 }}>+ Ajouter une zone</button>
      <Ligne S={S} label="Minimum de commande pour être livré (F)"><input type="number" value={b.minimum} onChange={(e) => setB({ ...b, minimum: e.target.value })} style={Inp(90)} /></Ligne>
    </div>
    <div style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 4 }}>🛵 Livreurs</div>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 8, lineHeight: 1.6 }}>On choisit le livreur en passant une commande « En route ». Le client reçoit son prénom et son numéro, et le livreur reçoit le bon de livraison (imprimé, ou sur WhatsApp). Ces numéros ne sont visibles que par la caisse et par le client livré.</div>
      {liv.map((x, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        <input value={x.nom} onChange={(e) => setLiv(liv.map((y, j) => (j === i ? { ...y, nom: e.target.value } : y)))} placeholder="Prénom" style={{ ...Inp(), flex: 1 }} />
        <input value={x.tel} type="tel" onChange={(e) => setLiv(liv.map((y, j) => (j === i ? { ...y, tel: e.target.value } : y)))} placeholder="77 123 45 67" style={{ ...Inp(), flex: 1 }} />
        <button onClick={() => setLiv(liv.filter((_, j) => j !== i))} style={{ ...Btn(S.card3, S.red), padding: "4px 8px" }}>✕</button>
      </div>)}
      <button onClick={() => setLiv([...liv, { nom: "", tel: "" }])} style={{ ...Btn(S.card3, S.text), width: "100%", fontSize: 12 }}>+ Ajouter un livreur</button>
    </div>
    <button onClick={() => enregistrer()} style={{ ...Btn(S.green, S.bg), width: "100%" }}>💾 Enregistrer les réglages</button>
  </>;
}

// ─────────────── Éditeur des créneaux ───────────────
function EditeurCreneaux({ S, Btn, Inp, Card, creneaux, showToast }) {
  const [liste, setListe] = useState(null);
  const [delai, setDelai] = useState(15);
  useEffect(() => {
    if (creneaux && !liste) {
      setListe(Object.entries(creneaux.creneaux || {}).map(([id, c]) => ({ id, ...c, heure: hhmm(c.minutes) })).sort((a, b) => a.minutes - b.minutes));
      setDelai(creneaux.delaiFermetureMin ?? 15);
    }
  }, [creneaux]);
  if (creneaux === undefined) return <div style={{ color: S.muted }}>Chargement…</div>;
  if (creneaux === null) return <Initialiser {...{ S, Btn, Card, showToast }} />;
  if (!liste) return null;

  const basculer = async () => {
    try { await updateDoc(doc(db, "config/creneaux"), { ouvert: !creneaux.ouvert }); showToast(creneaux.ouvert ? "⛔ Commandes en ligne fermées" : "✓ Commandes en ligne ouvertes"); }
    catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  const maj = (i, champ, v) => setListe(liste.map((c, j) => (j === i ? { ...c, [champ]: v } : c)));
  const enregistrer = async () => {
    const out = {};
    const codes = new Set();
    for (const c of liste) {
      const minutes = versMinutes(c.heure);
      const code = String(c.code || "").trim().toUpperCase();
      if (minutes == null) return showToast(`❌ Heure invalide : ${c.heure} (ex. 07h30)`, S.red);
      if (!/^[A-Z]$/.test(code)) return showToast(`❌ Lettre invalide pour ${c.heure} (une lettre A-Z)`, S.red);
      if (codes.has(code)) return showToast(`❌ La lettre ${code} est utilisée deux fois`, S.red);
      codes.add(code);
      out[c.id] = { code, minutes, max: Math.max(1, Math.round(Number(c.max) || 1)), actif: !!c.actif };
    }
    try {
      await setDoc(doc(db, "config/creneaux"), { ouvert: creneaux.ouvert, delaiFermetureMin: Math.max(0, Math.round(Number(delai) || 0)), creneaux: out });
      setListe(null);
      showToast("✓ Créneaux enregistrés");
    } catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  // Un créneau par heure de 6h à minuit : 19 créneaux, lettres A à S.
  // Minuit s'écrit 00h00 (les règles Firestore comparent l'heure du jour du retrait).
  const remplirJournee = () => {
    if (!window.confirm("Remplacer tous les créneaux par un créneau par heure, de 6h à minuit ?")) return;
    setListe(Array.from({ length: 19 }, (_, i) => { const h = (6 + i) % 24; return { id: "c" + String(h).padStart(2, "0") + "00", heure: hhmm(h * 60), code: "ABCDEFGHIJKLMNOPQRS"[i], max: 20, actif: true }; }));
    showToast("Créneaux préparés : touche « Enregistrer » pour valider");
  };
  const lettreLibre = () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find((l) => !liste.some((c) => String(c.code).toUpperCase() === l)) || "Z";

  return <>
    <button onClick={basculer} style={{ ...Btn(creneaux.ouvert ? S.green : S.red, S.bg), width: "100%", marginBottom: 12, padding: 14 }}>
      {creneaux.ouvert ? "✓ Commandes en ligne OUVERTES — toucher pour fermer" : "⛔ Commandes en ligne FERMÉES — toucher pour ouvrir"}
    </button>
    <div style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 4 }}>🕐 Créneaux de retrait</div>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 10, lineHeight: 1.6 }}>La lettre sert au numéro de commande (B12 = 12ᵉ commande du créneau B). Max = nombre de commandes maximum par créneau.</div>
      <div style={{ display: "flex", gap: 6, fontSize: 10, color: S.muted, marginBottom: 4 }}><span style={{ width: 80 }}>Heure</span><span style={{ width: 48 }}>Lettre</span><span style={{ width: 64 }}>Max</span><span>Actif</span></div>
      {liste.map((c, i) => <div key={c.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
        <input value={c.heure} onChange={(e) => maj(i, "heure", e.target.value)} style={Inp(80)} />
        <input value={c.code} maxLength={1} onChange={(e) => maj(i, "code", e.target.value.toUpperCase())} style={{ ...Inp(48), textAlign: "center" }} />
        <input type="number" value={c.max} onChange={(e) => maj(i, "max", e.target.value)} style={Inp(64)} />
        <input type="checkbox" checked={!!c.actif} onChange={(e) => maj(i, "actif", e.target.checked)} />
        <button onClick={() => setListe(liste.filter((_, j) => j !== i))} style={{ ...Btn(S.card3, S.red), padding: "4px 8px", marginLeft: "auto" }}>✕</button>
      </div>)}
      <button onClick={() => setListe([...liste, { id: nouvelId("c"), heure: "10h30", code: lettreLibre(), max: 20, actif: true }])} style={{ ...Btn(S.card3, S.text), width: "100%", fontSize: 12 }}>+ Ajouter un créneau</button>
      <button onClick={remplirJournee} style={{ ...Btn(S.card3, S.gold), width: "100%", fontSize: 12, marginTop: 6 }}>⚡ Remplacer par : toutes les heures de 6h à minuit</button>
      <Ligne S={S} label="Fermeture des commandes avant le créneau (minutes)"><input type="number" value={delai} onChange={(e) => setDelai(e.target.value)} style={Inp(70)} /></Ligne>
    </div>
    <button onClick={enregistrer} style={{ ...Btn(S.green, S.bg), width: "100%" }}>💾 Enregistrer les créneaux</button>
    <button onClick={() => window.confirm("Déconnecter ce poste des commandes en ligne ?") && deconnecterCaisse()} style={{ ...Btn(S.card3, S.muted), width: "100%", marginTop: 20, fontSize: 11 }}>Déconnecter ce poste des commandes en ligne</button>
  </>;
}
