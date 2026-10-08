import React, { useState } from "react";
import { useMenuSite } from "../enligne/MenuCaisse.jsx";
import { tableauCouts } from "./coutRevient.js";

// Onglet 💰 Coûts : pour chaque article du menu, prix de vente, coût de revient et marge.
// Les prix d'achat viennent de Stocks → Ingrédients, les quantités de Recettes.
const FILTRES = [["tous", "Tous"], ["bon", "✅ Bonne marge"], ["moyen", "🟡 À surveiller"], ["faible", "🔴 Faible marge"], ["a_faire", "📝 À compléter"]];

const niveau = (l) => (l.pct == null ? "a_faire" : l.pct <= 35 ? "bon" : l.pct <= 50 ? "moyen" : "faible");

export default function CoutRevient({ S, Card, fmt, ingredients, recipes }) {
  const menu = useMenuSite();
  const [filtre, setFiltre] = useState("tous");
  const lignes = tableauCouts(menu, ingredients, recipes);
  const couleur = { bon: S.green, moyen: S.gold, faible: S.red, a_faire: S.muted };
  const nb = (n) => lignes.filter((l) => niveau(l) === n).length;
  const calcules = lignes.filter((l) => l.cout != null);
  const vus = lignes.filter((l) => filtre === "tous" || niveau(l) === filtre);
  const cats = (menu.categories || []).filter((c) => vus.some((l) => l.categorie === c.id));
  const puce = (on) => ({ background: on ? S.gold : S.card2, color: on ? S.bg : S.text, border: `1px solid ${on ? S.gold : S.border}`, borderRadius: 20, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 });

  return (
    <div style={{ padding: 14 }}>
      <div style={Card(S.gold)}>
        <div style={{ fontSize: 15, fontWeight: 800, color: S.gold, marginBottom: 6 }}>💰 Coût de revient</div>
        <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>
          Pour chaque produit : le prix de vente, ce qu'il nous coûte et ce qu'il nous reste (la marge).
          Le pourcentage est la part du prix de vente qui part dans les ingrédients : plus il est bas, plus le produit est rentable.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", fontSize: 11 }}>
          <span style={{ color: S.green }}>✅ {nb("bon")} bonne marge (35 % ou moins)</span>
          <span style={{ color: S.gold }}>🟡 {nb("moyen")} à surveiller</span>
          <span style={{ color: S.red }}>🔴 {nb("faible")} faible marge (plus de 50 %)</span>
          <span style={{ color: S.muted }}>📝 {nb("a_faire")} à compléter</span>
        </div>
        <div style={{ fontSize: 10, color: S.muted, marginTop: 8 }}>{calcules.length} produits calculés sur {lignes.length}. Les prix d'achat se changent dans 📦 Stocks → Ingrédients, les quantités dans 📖 Recettes.</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {FILTRES.map(([id, nom]) => <button key={id} onClick={() => setFiltre(id)} style={puce(filtre === id)}>{nom}</button>)}
      </div>
      {cats.map((c) => (
        <div key={c.id} style={Card()}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.orange, letterSpacing: 2, marginBottom: 10 }}>{(c.emoji || "") + " " + c.nom.toUpperCase()}</div>
          {vus.filter((l) => l.categorie === c.id).map((l) => {
            const n = niveau(l);
            return (
              <div key={l.id} style={{ background: S.card2, borderRadius: 10, padding: 10, marginBottom: 6, borderLeft: `3px solid ${couleur[n]}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{l.emoji} {l.nom}</div>
                  {l.pct != null && <span style={{ fontSize: 11, fontWeight: 800, color: S.bg, background: couleur[n], borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap" }}>{l.pct} %</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 6, fontSize: 11 }}>
                  <div><div style={{ color: S.muted }}>Vente</div><div style={{ fontWeight: 700 }}>{fmt(l.vente)}</div></div>
                  <div><div style={{ color: S.muted }}>{l.source === "achat" ? "Prix d'achat" : "Coût"}</div><div style={{ fontWeight: 700, color: S.gold }}>{l.cout == null ? "—" : fmt(l.cout)}</div></div>
                  <div><div style={{ color: S.muted }}>Marge</div><div style={{ fontWeight: 700, color: l.marge == null ? S.muted : S.green }}>{l.marge == null ? "—" : fmt(l.marge)}</div></div>
                </div>
                {l.manque.length > 0 && <div style={{ fontSize: 10, color: l.cout == null ? S.muted : S.orange, marginTop: 6 }}>{l.cout == null ? "📝 À compléter : " : "⚠️ Pas encore compté : "}{l.manque.join(", ")}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
