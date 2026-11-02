import React, { useState } from "react";
import { useMenuSite } from "../enligne/MenuCaisse.jsx";
import { tableauCouts, REVENTE, FORMULES, trouverRecette, trouverIngParNoms } from "./coutRevient.js";

// Onglet 💰 Coûts : pour chaque article du menu, prix de vente, coût de revient et marge.
// On peut ouvrir un produit pour changer sa recette (quantités) et les prix d'achat :
// le calcul se refait tout de suite, et les autres produits qui utilisent le même ingrédient suivent.
const FILTRES = [["tous", "Tous"], ["bon", "✅ Bonne marge"], ["moyen", "🟡 À surveiller"], ["faible", "🔴 Faible marge"], ["a_faire", "📝 À compléter"]];

const niveau = (l) => (l.pct == null ? "a_faire" : l.pct <= 35 ? "bon" : l.pct <= 50 ? "moyen" : "faible");
const nombre = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) && n >= 0 ? n : 0; };
// Unités : le prix d'achat est au kg, au litre ou à la pièce ; la quantité d'une recette peut se
// saisir en g, kg, ml, L ou pièce. On enregistre toujours la quantité dans l'unité d'achat.
const UNITES = ["g", "kg", "ml", "L", "pcs"];
const UNITES_ACHAT = ["kg", "L", "pcs"];
const FACTEUR = { g: 0.001, kg: 1, ml: 0.001, L: 1, pcs: 1 };
const BASE = { g: "kg", kg: "kg", ml: "L", L: "L", pcs: "pcs" };
const uniteAchat = (unit) => { const u = String(unit || "").trim().toLowerCase(); return u === "kg" ? "kg" : u === "l" ? "L" : "pcs"; };
const nomUnite = (u) => (u === "pcs" ? "pièce" : u);
const uniteSaisie = (base) => (base === "kg" ? "g" : base === "L" ? "ml" : "pcs");
const versSaisie = (qty, u) => String(Math.round((qty / FACTEUR[u]) * 1000) / 1000);
const sansAccent = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe").trim();
// Recherche par le début du nom : « t » trouve Thon, Thé, Tomates…
const commencePar = (nom, q) => !q || sansAccent(nom).startsWith(sansAccent(q));

export default function CoutRevient({ S, Card, fmt, ingredients, recipes, onSave }) {
  const menu = useMenuSite();
  const [filtre, setFiltre] = useState("tous");
  const [vue, setVue] = useState("produits");
  const [ouvert, setOuvert] = useState(null); // id de l'article en cours de modification
  const [brouillon, setBrouillon] = useState(null); // { lignes: [{id, q}], prix: {ingId: texte}, venteTest }
  const [prixAchat, setPrixAchat] = useState({}); // vue « Prix d'achat » : { ingId: texte }
  const [cherche, setCherche] = useState("");
  const [chercheProduit, setChercheProduit] = useState("");

  const articles = menu.articles || [];
  const couleur = { bon: S.green, moyen: S.gold, faible: S.red, a_faire: S.muted };
  const puce = (on) => ({ background: on ? S.gold : S.card2, color: on ? S.bg : S.text, border: `1px solid ${on ? S.gold : S.border}`, borderRadius: 20, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 700 });
  const champ = { background: S.bg, border: `1px solid ${S.border}`, color: S.text, borderRadius: 6, padding: "6px 6px", fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box" };
  const bouton = (c, plein) => ({ background: plein ? c : "transparent", color: plein ? S.bg : c, border: `1px solid ${c}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 12, fontWeight: 800 });
  const ingTries = [...ingredients].sort((a, b) => String(a.name).localeCompare(String(b.name), "fr"));
  const nbRecettes = (ingId) => recipes.filter((r) => (r.ingredients || []).some((ri) => ri.id === ingId)).length;

  // Ingrédients avec les prix du brouillon (pour voir le résultat avant d'enregistrer).
  const avecPrix = (prix, unites) => ingredients.map((i) => {
    let x = prix && prix[i.id] != null ? { ...i, unitCost: nombre(prix[i.id]) } : i;
    if (unites && unites[i.id] && unites[i.id] !== uniteAchat(i.unit)) x = { ...x, unit: unites[i.id] };
    return x;
  });

  const ouvrir = (a) => {
    if (ouvert === a.id) { setOuvert(null); setBrouillon(null); return; }
    const rec = trouverRecette(a, recipes);
    const lignes = rec ? (rec.ingredients || []).map((ri) => { const ing = ingredients.find((i) => i.id === ri.id); const u = uniteSaisie(uniteAchat(ing && ing.unit)); return { id: ri.id, u, q: versSaisie(ri.qty || 0, u) }; }) : [];
    const prix = {};
    lignes.forEach((l) => { const ing = ingredients.find((i) => i.id === l.id); if (ing) prix[l.id] = String(ing.unitCost || 0); });
    const rv = REVENTE[a.id] && trouverIngParNoms(ingredients, REVENTE[a.id]);
    if (rv) prix[rv.id] = String(rv.unitCost || 0);
    setOuvert(a.id);
    setBrouillon({ lignes, prix, unites: {}, venteTest: "", ajout: "" });
  };

  const enregistrer = (a) => {
    const b = brouillon;
    const ni = avecPrix(b.prix, b.unites);
    const prixChanges = ni.filter((i, k) => i.unitCost !== ingredients[k].unitCost || i.unit !== ingredients[k].unit).map((i) => i.name);
    let nr = recipes;
    let recetteChangee = false;
    if (!REVENTE[a.id]) {
      const nouvellesLignes = b.lignes.filter((l) => l.id).map((l) => ({ id: l.id, qty: Math.round(nombre(l.q) * FACTEUR[l.u] * 100000) / 100000 }));
      const rec = trouverRecette(a, recipes);
      const cat = (menu.categories || []).find((c) => c.id === a.categorie);
      if (rec) {
        recetteChangee = JSON.stringify(rec.ingredients || []) !== JSON.stringify(nouvellesLignes);
        if (recetteChangee) nr = recipes.map((r) => (r.id === rec.id ? { ...r, ingredients: nouvellesLignes, prixVente: r.prixVente || a.prix } : r));
      } else if (nouvellesLignes.length) {
        recetteChangee = true;
        nr = [...recipes, { id: "rf_" + a.id, name: a.nom, emoji: a.emoji || "🍽️", category: cat ? cat.nom : "Autres", snackId: "", prixVente: typeof a.prix === "number" ? a.prix : undefined, ingredients: nouvellesLignes }];
      }
    }
    if (!prixChanges.length && !recetteChangee) { setOuvert(null); setBrouillon(null); return; }
    onSave(ni, nr, [recetteChangee ? "recette " + a.nom : "", prixChanges.length ? "prix " + prixChanges.join(", ") : ""].filter(Boolean).join(" · "));
    setOuvert(null);
    setBrouillon(null);
  };

  const editeur = (a) => {
    const b = brouillon;
    const ni = avecPrix(b.prix, b.unites);
    const majB = (f) => setBrouillon((p) => f({ ...p }));
    // Changer l'unité d'une quantité : si elle n'est pas du même type que l'unité d'achat
    // (ex. des grammes pour un produit acheté à la pièce), l'unité d'achat suit (au kg, au litre, à la pièce).
    const changerUnite = (k, u) => majB((p) => {
      const ls = [...p.lignes];
      const l = ls[k];
      ls[k] = { ...l, u };
      const ing = ingredients.find((i) => i.id === l.id);
      const actuelle = (p.unites || {})[l.id] || uniteAchat(ing && ing.unit);
      return { ...p, lignes: ls, unites: BASE[u] !== actuelle ? { ...(p.unites || {}), [l.id]: BASE[u] } : p.unites };
    });
    const changerUniteAchat = (id, ua) => majB((p) => ({ ...p, unites: { ...(p.unites || {}), [id]: ua }, lignes: p.lignes.map((l) => (l.id === id && BASE[l.u] !== ua ? { ...l, u: uniteSaisie(ua) } : l)) }));
    const ajouterIng = (ing) => majB((p) => ({ ...p, ajout: "", lignes: [...p.lignes, { id: ing.id, u: uniteSaisie(uniteAchat(ing.unit)), q: "" }], prix: p.prix[ing.id] == null ? { ...p.prix, [ing.id]: String(ing.unitCost || 0) } : p.prix }));
    const vente = b.venteTest !== "" ? nombre(b.venteTest) : typeof a.prix === "number" ? a.prix : a.prixFormule || 0;

    if (FORMULES[a.id]) {
      return <div style={{ fontSize: 11, color: S.muted, marginTop: 8 }}>Une formule se calcule toute seule avec les produits qu'elle contient. Modifie plutôt ces produits.</div>;
    }
    if (REVENTE[a.id]) {
      const ing = trouverIngParNoms(ingredients, REVENTE[a.id]);
      if (!ing) return <div style={{ fontSize: 11, color: S.orange, marginTop: 8 }}>Ajoute d'abord « {REVENTE[a.id][0]} » dans 📦 Stocks → Ingrédients.</div>;
      const cout = nombre(b.prix[ing.id]);
      return (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>Prix d'achat d'une bouteille ({ing.name})</div>
          <input inputMode="decimal" value={b.prix[ing.id]} onChange={(e) => majB((p) => ({ ...p, prix: { ...p.prix, [ing.id]: e.target.value } }))} style={{ ...champ, fontSize: 14, color: S.gold, fontWeight: 700 }} />
          {resultat(vente, cout)}
          {boutons(a)}
        </div>
      );
    }

    const lignes = b.lignes.map((l) => {
      const ing = ni.find((i) => i.id === l.id);
      const qty = nombre(l.q) * FACTEUR[l.u];
      return { ...l, ing, qty, cout: ing ? qty * (ing.unitCost || 0) : 0 };
    });
    const cout = Math.round(lignes.reduce((s, l) => s + l.cout, 0));
    const manque = lignes.filter((l) => l.ing && !l.ing.unitCost).map((l) => l.ing.name);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 10, color: S.muted, marginBottom: 6 }}>Quantités pour UNE portion, en g, kg, ml, L ou pièce. Le prix d'achat est celui du kg, du litre ou de la pièce : si tu le changes, tous les produits qui utilisent cet ingrédient sont recalculés.</div>
        {lignes.map((l, k) => {
          const ua = l.ing ? uniteAchat(l.ing.unit) : null;
          const change = l.ing && (b.unites || {})[l.id] && (b.unites || {})[l.id] !== uniteAchat((ingredients.find((i) => i.id === l.id) || {}).unit);
          return (
            <div key={k} style={{ background: S.bg, borderRadius: 8, padding: 6, marginBottom: 5 }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <select value={l.id || ""} onChange={(e) => { const id = e.target.value; const ing = ingredients.find((i) => i.id === id); majB((p) => { const ls = [...p.lignes]; ls[k] = { ...ls[k], id, u: uniteSaisie(uniteAchat(ing && ing.unit)) }; return { ...p, lignes: ls, prix: ing && p.prix[id] == null ? { ...p.prix, [id]: String(ing.unitCost || 0) } : p.prix }; }); }} style={{ ...champ, fontSize: 12, padding: "6px 4px", flex: 1, fontWeight: 700 }}>
                  <option value="">— choisir —</option>
                  {ingTries.map((i) => <option key={i.id} value={i.id}>{i.emoji} {i.name}</option>)}
                </select>
                <span style={{ fontSize: 12, fontWeight: 800, minWidth: 52, textAlign: "right" }}>{fmt(Math.round(l.cout))}</span>
                <button onClick={() => majB((p) => ({ ...p, lignes: p.lignes.filter((_, j) => j !== k) }))} style={{ background: "transparent", border: `1px solid ${S.red}`, color: S.red, borderRadius: 4, padding: "4px 6px", cursor: "pointer", fontSize: 10 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 1fr 66px", gap: 4, marginTop: 4, alignItems: "center" }}>
                <input inputMode="decimal" placeholder="qté" value={l.q} onChange={(e) => majB((p) => { const ls = [...p.lignes]; ls[k] = { ...ls[k], q: e.target.value }; return { ...p, lignes: ls }; })} style={{ ...champ, color: S.gold, fontWeight: 700 }} />
                <select value={l.u} onChange={(e) => changerUnite(k, e.target.value)} style={{ ...champ, padding: "6px 2px" }}>
                  {UNITES.map((u) => <option key={u} value={u}>{nomUnite(u)}</option>)}
                </select>
                <input inputMode="decimal" disabled={!l.ing} placeholder="prix" value={l.ing ? b.prix[l.id] ?? "" : ""} onChange={(e) => majB((p) => ({ ...p, prix: { ...p.prix, [l.id]: e.target.value } }))} style={{ ...champ, color: l.ing && !l.ing.unitCost ? S.orange : S.text }} />
                <select disabled={!l.ing} value={ua || "pcs"} onChange={(e) => changerUniteAchat(l.id, e.target.value)} style={{ ...champ, padding: "6px 2px", fontSize: 11 }}>
                  {UNITES_ACHAT.map((u) => <option key={u} value={u}>F / {nomUnite(u)}</option>)}
                </select>
              </div>
              {change && <div style={{ fontSize: 9, color: S.orange, marginTop: 3 }}>⚠️ {l.ing.name} sera acheté au {nomUnite(ua)} : vérifie que le prix est bien celui d'1 {nomUnite(ua)}.</div>}
            </div>
          );
        })}
        <div style={{ marginTop: 4 }}>
          <input placeholder="＋ Ajouter : tape le début du nom (ex. T)" value={b.ajout || ""} onChange={(e) => majB((p) => ({ ...p, ajout: e.target.value }))} style={{ ...champ, fontSize: 13, padding: "8px 10px", borderStyle: "dashed", borderColor: S.blue }} />
          {(b.ajout || "").trim() && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
              {ingTries.filter((i) => commencePar(i.name, b.ajout)).map((i) => <button key={i.id} onClick={() => ajouterIng(i)} style={{ ...bouton(S.blue), padding: "5px 8px", fontSize: 11 }}>{i.emoji} {i.name}</button>)}
              {!ingTries.some((i) => commencePar(i.name, b.ajout)) && <span style={{ fontSize: 10, color: S.muted }}>Aucun ingrédient ne commence par « {b.ajout} ». Ajoute-le d'abord dans 📦 Stocks.</span>}
            </div>
          )}
        </div>
        {manque.length > 0 && <div style={{ fontSize: 10, color: S.orange, marginTop: 6 }}>⚠️ Prix d'achat à 0 : {manque.join(", ")}</div>}
        {resultat(vente, cout)}
        {boutons(a)}
      </div>
    );

    function resultat(vente, cout) {
      const marge = vente - cout;
      const pct = vente ? Math.round((cout / vente) * 100) : null;
      return (
        <div style={{ background: S.bg, borderRadius: 8, padding: 8, marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, fontSize: 11 }}>
            <div><div style={{ color: S.muted }}>Vente</div><div style={{ fontWeight: 700 }}>{fmt(vente)}</div></div>
            <div><div style={{ color: S.muted }}>Coût</div><div style={{ fontWeight: 800, color: S.gold }}>{fmt(cout)}</div></div>
            <div><div style={{ color: S.muted }}>Marge</div><div style={{ fontWeight: 800, color: marge >= 0 ? S.green : S.red }}>{fmt(marge)}{pct != null ? ` · ${pct} %` : ""}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 10, color: S.muted }}>
            <span>Essayer un autre prix de vente :</span>
            <input inputMode="numeric" placeholder={String(typeof a.prix === "number" ? a.prix : "")} value={b.venteTest} onChange={(e) => majB((p) => ({ ...p, venteTest: e.target.value }))} style={{ ...champ, width: 80 }} />
          </div>
          <div style={{ fontSize: 9, color: S.muted, marginTop: 4 }}>Ce prix d'essai n'est pas enregistré : le prix de la carte ne change pas.</div>
        </div>
      );
    }
    function boutons(a) {
      return (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={() => { setOuvert(null); setBrouillon(null); }} style={{ ...bouton(S.muted), flex: 1 }}>Annuler</button>
          <button onClick={() => enregistrer(a)} style={{ ...bouton(S.green, true), flex: 2 }}>✓ Enregistrer</button>
        </div>
      );
    }
  };

  // ── Vue « Prix d'achat » : tous les ingrédients, prix modifiables, recalcul de tous les produits.
  const vuePrix = () => {
    const ni = avecPrix(prixAchat);
    const avant = tableauCouts(menu, ingredients, recipes);
    const apres = tableauCouts(menu, ni, recipes);
    const touches = apres.filter((l, k) => l.cout !== avant[k].cout);
    const changes = Object.keys(prixAchat).filter((id) => { const i = ingredients.find((x) => x.id === id); return i && nombre(prixAchat[id]) !== (i.unitCost || 0); });
    const q = cherche.trim().toLowerCase();
    return (
      <div>
        <input placeholder="🔍 Chercher : tape le début du nom (ex. T)" value={cherche} onChange={(e) => setCherche(e.target.value)} style={{ ...champ, fontSize: 13, padding: "9px 10px", marginBottom: 10 }} />
        <div style={Card()}>
          {ingTries.filter((i) => commencePar(i.name, q)).map((i) => {
            const n = nbRecettes(i.id);
            const v = prixAchat[i.id] ?? String(i.unitCost || 0);
            return (
              <div key={i.id} style={{ display: "grid", gridTemplateColumns: "1fr 96px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${S.border}` }}>
                <div><div style={{ fontSize: 12, fontWeight: 700 }}>{i.emoji} {i.name}</div><div style={{ fontSize: 9, color: S.muted }}>{n ? `utilisé dans ${n} recette${n > 1 ? "s" : ""}` : "dans aucune recette"}</div></div>
                <div style={{ position: "relative" }}>
                  <input inputMode="decimal" value={v} onChange={(e) => setPrixAchat((p) => ({ ...p, [i.id]: e.target.value }))} style={{ ...champ, paddingRight: 26, color: nombre(v) ? S.text : S.orange, fontWeight: changes.includes(i.id) ? 800 : 400, borderColor: changes.includes(i.id) ? S.gold : S.border }} />
                  <span style={{ position: "absolute", right: 4, top: 7, fontSize: 9, color: S.muted }}>/{i.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        {changes.length > 0 && (
          <div style={{ ...Card(S.gold), position: "sticky", bottom: 70 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: S.gold }}>{changes.length} prix changé{changes.length > 1 ? "s" : ""} · {touches.length} produit{touches.length > 1 ? "s" : ""} recalculé{touches.length > 1 ? "s" : ""}</div>
            <div style={{ fontSize: 10, color: "#ccc", marginTop: 4, maxHeight: 90, overflow: "auto" }}>{touches.map((l) => { const k = avant.find((x) => x.id === l.id); return `${l.nom} : ${fmt(k.cout || 0)} → ${fmt(l.cout || 0)}`; }).join(" · ")}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setPrixAchat({})} style={{ ...bouton(S.muted), flex: 1 }}>Annuler</button>
              <button onClick={() => { onSave(ni, recipes, "prix " + changes.map((id) => ingredients.find((x) => x.id === id).name).join(", ")); setPrixAchat({}); }} style={{ ...bouton(S.green, true), flex: 2 }}>✓ Enregistrer les prix</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const lignes = tableauCouts(menu, ingredients, recipes);
  const nb = (n) => lignes.filter((l) => niveau(l) === n).length;
  const calcules = lignes.filter((l) => l.cout != null);
  const vus = lignes.filter((l) => (filtre === "tous" || niveau(l) === filtre) && commencePar(l.nom, chercheProduit));
  const cats = (menu.categories || []).filter((c) => vus.some((l) => l.categorie === c.id));

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
        <div style={{ fontSize: 10, color: S.muted, marginTop: 8 }}>{calcules.length} produits calculés sur {lignes.length}. Touche un produit pour changer sa recette et ses prix d'achat.</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setVue("produits")} style={{ ...puce(vue === "produits"), flex: 1, fontSize: 12, padding: "8px" }}>🍽️ Produits</button>
        <button onClick={() => setVue("prix")} style={{ ...puce(vue === "prix"), flex: 1, fontSize: 12, padding: "8px" }}>🏷️ Prix d'achat</button>
      </div>
      {vue === "prix" ? vuePrix() : <>
        <input placeholder="🔍 Chercher un produit : tape le début du nom (ex. S)" value={chercheProduit} onChange={(e) => setChercheProduit(e.target.value)} style={{ ...champ, fontSize: 13, padding: "9px 10px", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {FILTRES.map(([id, nom]) => <button key={id} onClick={() => setFiltre(id)} style={puce(filtre === id)}>{nom}</button>)}
        </div>
        {cats.map((c) => (
          <div key={c.id} style={Card()}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.orange, letterSpacing: 2, marginBottom: 10 }}>{(c.emoji || "") + " " + c.nom.toUpperCase()}</div>
            {vus.filter((l) => l.categorie === c.id).map((l) => {
              const n = niveau(l);
              const a = articles.find((x) => x.id === l.id);
              const estOuvert = ouvert === l.id && brouillon;
              return (
                <div key={l.id} style={{ background: S.card2, borderRadius: 10, padding: 10, marginBottom: 6, borderLeft: `3px solid ${couleur[n]}`, outline: estOuvert ? `1px solid ${S.gold}` : "none" }}>
                  <div onClick={() => a && ouvrir(a)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{l.emoji} {l.nom}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {l.pct != null && <span style={{ fontSize: 11, fontWeight: 800, color: S.bg, background: couleur[n], borderRadius: 10, padding: "2px 8px", whiteSpace: "nowrap" }}>{l.pct} %</span>}
                        <span style={{ fontSize: 11, color: S.blue }}>{estOuvert ? "▲" : "✏️"}</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 6, fontSize: 11 }}>
                      <div><div style={{ color: S.muted }}>Vente</div><div style={{ fontWeight: 700 }}>{fmt(l.vente)}</div></div>
                      <div><div style={{ color: S.muted }}>{l.source === "achat" ? "Prix d'achat" : "Coût"}</div><div style={{ fontWeight: 700, color: S.gold }}>{l.cout == null ? "—" : fmt(l.cout)}</div></div>
                      <div><div style={{ color: S.muted }}>Marge</div><div style={{ fontWeight: 700, color: l.marge == null ? S.muted : l.marge < 0 ? S.red : S.green }}>{l.marge == null ? "—" : fmt(l.marge)}</div></div>
                    </div>
                    {!estOuvert && l.manque.length > 0 && <div style={{ fontSize: 10, color: l.cout == null ? S.muted : S.orange, marginTop: 6 }}>{l.cout == null ? "📝 À compléter : " : "⚠️ Pas encore compté : "}{l.manque.join(", ")}</div>}
                  </div>
                  {estOuvert && a && editeur(a)}
                </div>
              );
            })}
          </div>
        ))}
      </>}
    </div>
  );
}
