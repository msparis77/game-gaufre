import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseCaisse.js";
import { estBoisson, prixUnitaire, nomLigne, fcfa } from "../../arena-commande/src/shared/prix.js";
import { MENU_DEPART } from "../../arena-commande/src/shared/menuDepart.js";
import { boissonsParFamille, iconeBoisson } from "../../arena-commande/src/shared/boissons.js";

// Le menu du site (config/menu dans Firebase) dans l'onglet Encaissement.
// Même menu, mêmes prix que le site : on le modifie une seule fois dans 🌐 → Menu & prix.
const CACHE = "gg3-menu-site";

function useMenuSite() {
  const [menu, setMenu] = useState(() => {
    try { const m = JSON.parse(localStorage.getItem(CACHE) || "null"); if (m && m.articles) return m; } catch (e) {}
    return MENU_DEPART;
  });
  useEffect(() => onSnapshot(doc(db, "config/menu"), (s) => {
    if (!s.exists()) return;
    const m = s.data();
    setMenu(m);
    try { localStorage.setItem(CACHE, JSON.stringify(m)); } catch (e) {}
  }, () => {}), []);
  return menu;
}

// Ligne de panier : même id pour les mêmes choix, pour que la quantité s'additionne.
function ligne(menu, a, choix) {
  const cle = [a.id, choix.formule ? "f_" + choix.boissonId : "seul", choix.fromage ? "fromage" : "", choix.sauce || ""].join("|");
  return { id: "menu:" + cle, name: nomLigne(menu, a, choix), price: prixUnitaire(menu, a, choix), cat: "menu", emoji: a.emoji || "🥖" };
}

export default function MenuCaisse({ vue, S, Btn, ajouter }) {
  const menu = useMenuSite();
  const [choix, setChoix] = useState(null); // { article, formule, boissonId, fromage, sauce }
  const dispo = (menu.articles || []).filter((a) => a.dispo !== false);
  const o = menu.options || {};
  const tuile = { background: S.card2, border: `1px solid ${S.border}`, borderRadius: 12, padding: "12px 6px", cursor: "pointer", color: S.text, textAlign: "center", width: "100%" };
  const grille = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 };
  const puce = (on) => ({ background: on ? S.gold : S.card3, color: on ? S.bg : S.text, border: `1px solid ${on ? S.gold : S.border}`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", fontSize: 13, fontWeight: 700 });

  if (vue === "boissons") {
    return <>{boissonsParFamille(dispo.filter(estBoisson)).map(({ famille, articles }) => <div key={famille.id}>
      <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, letterSpacing: 1, margin: "4px 0 8px" }}>{famille.icone} {famille.nom.toUpperCase()}</div>
      <div style={grille}>{articles.map((a) => (
        <button key={a.id} style={tuile} onClick={() => ajouter({ ...ligne(menu, a, {}), emoji: iconeBoisson(a) })}>
          <div style={{ fontSize: 26 }}>{iconeBoisson(a)}</div>
          <div style={{ fontSize: 12, fontWeight: 600, margin: "4px 0 2px", lineHeight: 1.2 }}>{a.nom}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: S.gold }}>{fcfa(a.prix)}</div>
        </button>))}</div>
    </div>)}</>;
  }

  const cats = (menu.categories || []).filter((c) => c.id !== "boissons");
  const c = choix;
  const art = c && c.article;
  const prix = art ? prixUnitaire(menu, art, c) : null;
  const ok = art && prix != null;
  const valider = () => { if (!ok) return; ajouter(ligne(menu, art, c)); setChoix(null); };

  return <>
    {cats.map((cat) => {
      const liste = dispo.filter((a) => a.categorie === cat.id);
      if (!liste.length) return null;
      return <div key={cat.id}>
        <div style={{ fontSize: 12, fontWeight: 700, color: S.muted, letterSpacing: 1, margin: "4px 0 8px" }}>{cat.emoji} {cat.nom.toUpperCase()}</div>
        <div style={grille}>{liste.map((a) => (
          <button key={a.id} style={{ ...tuile, border: `1px solid ${art && art.id === a.id ? S.gold : S.border}` }}
            onClick={() => setChoix({ article: a, formule: true, boissonId: (o.boissonsFormule || [])[0]?.id || "", fromage: false, sauce: "" })}>
            <div style={{ fontSize: 26 }}>{a.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 600, margin: "4px 0 2px", lineHeight: 1.2 }}>{a.nom.replace(/^Sandwich /, "")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: S.gold }}>{fcfa(a.prixFormule)}</div>
            <div style={{ fontSize: 10, color: S.muted }}>formule</div>
          </button>))}</div>
      </div>;
    })}

    {art && <div role="dialog" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setChoix(null)}>
      <div style={{ background: S.card, borderRadius: "16px 16px 0 0", padding: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", border: `1px solid ${S.gold}` }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{art.emoji} {art.nom}</div>
          <button onClick={() => setChoix(null)} style={{ background: "transparent", border: "none", color: S.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button style={{ ...puce(c.formule), flex: 1 }} onClick={() => setChoix({ ...c, formule: true })}>🥤 Formule (avec boisson)</button>
          <button style={{ ...puce(!c.formule), flex: 1 }} onClick={() => setChoix({ ...c, formule: false })}>Seul · {fcfa(art.prixFormule - (o.remiseSansBoisson || 0))}</button>
        </div>
        {c.formule && <>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 6 }}>Boisson de la formule</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
            {(o.boissonsFormule || []).map((b) => (
              <button key={b.id} style={puce(c.boissonId === b.id)} onClick={() => setChoix({ ...c, boissonId: b.id })}>{b.nom}{b.sup ? ` +${b.sup}` : ""}</button>))}
          </div>
        </>}
        {art.omelette && <>
          <button style={{ ...puce(c.fromage), width: "100%", marginBottom: 12 }} onClick={() => setChoix({ ...c, fromage: !c.fromage })}>🧀 Version fromage +{o.supplementFromage || 0}</button>
          <div style={{ fontSize: 12, color: S.muted, marginBottom: 6 }}>Sauce</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {(o.sauces || []).map((sc) => (
              <button key={sc} style={{ ...puce(c.sauce === sc), flex: 1 }} onClick={() => setChoix({ ...c, sauce: c.sauce === sc ? "" : sc })}>{sc}</button>))}
          </div>
        </>}
        <button disabled={!ok} onClick={valider} style={{ ...Btn(ok ? S.green : S.card3, ok ? S.bg : S.muted), width: "100%", fontSize: 16, padding: 14 }}>
          ＋ Ajouter au panier{ok ? ` · ${fcfa(prix)}` : ""}
        </button>
      </div>
    </div>}
  </>;
}
