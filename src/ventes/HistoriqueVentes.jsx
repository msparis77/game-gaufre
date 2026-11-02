// 📅 Historique des ventes (Firebase) : n'importe quelle période, totaux par jour,
// par mode de paiement et par produit. Réservé au patron et au gérant.
import React, { useEffect, useMemo, useState } from "react";
import { chargerPeriode, importerAnciennes, surEtat, nbEnAttente } from "./ventesCloud.js";

const DEBUT_DONNEES = "2026-08-31";
const decaler = (ds, jours) => { const d = new Date(ds + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + jours); return d.toISOString().split("T")[0]; };
const moisAvant = (ds, m) => { const d = new Date(ds + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() - m); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().split("T")[0]; };
const joliJour = (ds) => new Date(ds + "T12:00:00Z").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const mode = (v) => v.paiement || "especes";

export default function HistoriqueVentes({ S, Card, Btn, Inp, fmt, boutique, paiements, aujourdhui, isPatron, lireJour }) {
  const [connecte, setConnecte] = useState(false);
  const [attente, setAttente] = useState(nbEnAttente());
  const [debut, setDebut] = useState(decaler(aujourdhui, -6));
  const [fin, setFin] = useState(aujourdhui);
  const [choix, setChoix] = useState("7j");
  const [ventes, setVentes] = useState(null);
  const [erreur, setErreur] = useState("");
  const [vue, setVue] = useState("jours");
  const [imp, setImp] = useState(null);

  useEffect(() => surEtat((c) => { setConnecte(c); setAttente(nbEnAttente()); }), []);
  const charger = async (d = debut, f = fin) => {
    setErreur(""); setVentes(null);
    try { setVentes(await chargerPeriode(boutique, d, f)); }
    catch (e) { setErreur("Lecture impossible (" + (e.code || e.message) + "). Vérifie internet et la connexion du poste."); setVentes([]); }
  };
  useEffect(() => { if (connecte) charger(); }, [connecte]);

  const periode = (id, d) => { setChoix(id); setDebut(d); setFin(aujourdhui); if (connecte) charger(d, aujourdhui); };
  const PERIODES = [["auj", "Aujourd'hui", aujourdhui], ["7j", "7 jours", decaler(aujourdhui, -6)], ["1m", "1 mois", moisAvant(aujourdhui, 1)],
    ["2m", "2 mois", moisAvant(aujourdhui, 2)], ["6m", "6 mois", moisAvant(aujourdhui, 6)], ["tout", "Tout", DEBUT_DONNEES]];

  const st = useMemo(() => {
    if (!ventes) return null;
    const total = ventes.reduce((s, v) => s + (v.total || 0), 0);
    const parMode = Object.fromEntries(paiements.map((m) => [m.id, 0]));
    const jours = {}, produits = {};
    for (const v of ventes) {
      parMode[mode(v)] = (parMode[mode(v)] || 0) + (v.total || 0);
      const j = jours[v.jour] || (jours[v.jour] = { jour: v.jour, n: 0, total: 0, ...Object.fromEntries(paiements.map((m) => [m.id, 0])) });
      j.n++; j.total += v.total || 0; j[mode(v)] = (j[mode(v)] || 0) + (v.total || 0);
      for (const it of v.items || []) {
        const nom = String(it.name || "?").replace(/^🌐 /, "");
        const p = produits[nom] || (produits[nom] = { nom, qte: 0, ca: 0 });
        p.qte += it.qty || 1; p.ca += (it.price || 0) * (it.qty || 1);
      }
    }
    return { total, n: ventes.length, parMode, jours: Object.values(jours).sort((a, b) => b.jour.localeCompare(a.jour)),
      produits: Object.values(produits).sort((a, b) => b.ca - a.ca), nbJours: Object.keys(jours).length };
  }, [ventes, paiements]);

  const csv = () => {
    const l = [["Date", "Heure", "Ticket", "Total", "Paiement", "Caissier", "Articles"]].concat(
      [...ventes].sort((a, b) => (a.jour + a.time).localeCompare(b.jour + b.time)).map((v) => [v.jour, v.time || "", v.ticketNo || "", v.total, mode(v), v.by || "",
        (v.items || []).map((i) => `${i.name} x${i.qty}`).join(" / ")]));
    const txt = "﻿" + l.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv" }));
    a.download = `ventes_${debut}_${fin}.csv`; a.click();
  };
  const importer = async () => {
    if (!window.confirm("Recopier dans l'historique toutes les ventes depuis le 31 août ? (sans danger si on le refait)")) return;
    const jours = []; for (let d = DEBUT_DONNEES; d < aujourdhui; d = decaler(d, 1)) jours.push(d);
    setImp({ j: 0, total: jours.length, n: 0 });
    try {
      const n = await importerAnciennes(boutique, jours, (k) => lireJour("gg3-" + boutique + "-day-" + k), (j, t, nb) => setImp({ j, total: t, n: nb }));
      setImp({ fini: true, n }); charger();
    } catch (e) { setImp({ erreur: e.code || e.message }); }
  };

  const T = { fontSize: 11, color: S.muted };
  if (!connecte) return <div style={{ padding: 14 }}><div style={Card(S.orange)}>
    <div style={{ fontWeight: 700, marginBottom: 6 }}>📅 Historique des ventes</div>
    <div style={T}>Ce poste n'est pas connecté. Va dans 🌐 En ligne et connecte la caisse avec le mot de passe, puis reviens ici.
      {attente > 0 && <><br /><b style={{ color: S.orange }}>{attente} vente(s) attendent d'être envoyées.</b></>}</div></div></div>;

  return <div style={{ padding: 14 }}>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
      {PERIODES.map(([id, nom, d]) => <button key={id} onClick={() => periode(id, d)} style={{ ...Btn(choix === id ? S.gold : S.card2, choix === id ? S.bg : S.text), padding: "8px 12px", fontSize: 12 }}>{nom}</button>)}
    </div>
    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
      <span style={T}>Du</span><input type="date" value={debut} onChange={(e) => { setDebut(e.target.value); setChoix(""); }} style={Inp(150)} />
      <span style={T}>au</span><input type="date" value={fin} onChange={(e) => { setFin(e.target.value); setChoix(""); }} style={Inp(150)} />
      <button onClick={() => charger()} style={{ ...Btn(S.gold), padding: "8px 12px", fontSize: 12 }}>Voir</button>
    </div>
    {attente > 0 && <div style={{ ...T, color: S.orange, marginBottom: 8 }}>{attente} vente(s) de ce poste pas encore envoyée(s) : elles partent dès que le réseau revient.</div>}
    {erreur && <div style={{ ...Card(S.red), fontSize: 12 }}>{erreur}</div>}
    {!st ? <div style={T}>Chargement…</div> : <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8, marginBottom: 12 }}>
        <div style={Card(S.gold)}><div style={T}>Chiffre d'affaires</div><div style={{ fontSize: 20, fontWeight: 800, color: S.gold }}>{fmt(st.total)}</div></div>
        <div style={Card()}><div style={T}>Ventes</div><div style={{ fontSize: 20, fontWeight: 800 }}>{st.n}</div><div style={T}>{st.nbJours} jour(s) · moy. {fmt(st.nbJours ? Math.round(st.total / st.nbJours) : 0)}/jour</div></div>
        {paiements.map((m) => <div key={m.id} style={Card(m.c)}><div style={T}>{m.l}</div><div style={{ fontSize: 17, fontWeight: 800, color: m.c }}>{fmt(st.parMode[m.id])}</div></div>)}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["jours", "Par jour"], ["produits", "Par produit"]].map(([id, nom]) => <button key={id} onClick={() => setVue(id)} style={{ ...Btn(vue === id ? S.text : S.card2, vue === id ? S.bg : S.text), padding: "7px 12px", fontSize: 12 }}>{nom}</button>)}
        {st.n > 0 && <button onClick={csv} style={{ ...Btn(S.card2, S.text), padding: "7px 12px", fontSize: 12, marginLeft: "auto" }}>⬇ Excel (CSV)</button>}
      </div>
      {st.n === 0 && <div style={{ ...Card(), ...T }}>Aucune vente enregistrée sur cette période.{isPatron && " Pour voir les ventes d'avant, utilise « Recopier les anciennes ventes » en bas."}</div>}
      {vue === "jours" && st.jours.map((j) => <div key={j.jour} style={{ ...Card(), padding: 10, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div><div style={{ fontWeight: 700, textTransform: "capitalize" }}>{joliJour(j.jour)}</div><div style={T}>{j.n} ventes · {paiements.map((m) => `${m.l.split(" ")[0]} ${fmt(j[m.id])}`).join(" · ")}</div></div>
        <div style={{ fontWeight: 800, color: S.gold, alignSelf: "center" }}>{fmt(j.total)}</div></div>)}
      {vue === "produits" && <div style={Card()}>{st.produits.map((p, i) => <div key={p.nom} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 0", borderTop: i ? `1px solid ${S.border}` : "none", fontSize: 13 }}>
        <span>{p.nom} <span style={T}>× {p.qte}</span></span><b>{fmt(p.ca)}</b></div>)}</div>}
    </>}
    {isPatron && <div style={{ ...Card(), marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Recopier les anciennes ventes</div>
      <div style={{ ...T, marginBottom: 8 }}>Une seule fois : copie dans l'historique les ventes enregistrées avant (depuis le 31 août).</div>
      {!imp || imp.fini || imp.erreur ? <button onClick={importer} style={{ ...Btn(S.card2, S.gold), border: `1px solid ${S.gold}`, fontSize: 12 }}>📥 Recopier les anciennes ventes</button>
        : <div style={T}>Copie en cours… jour {imp.j}/{imp.total} · {imp.n} ventes</div>}
      {imp && imp.fini && <div style={{ ...T, color: S.green, marginTop: 6 }}>✓ {imp.n} ventes recopiées.</div>}
      {imp && imp.erreur && <div style={{ ...T, color: S.red, marginTop: 6 }}>Erreur : {imp.erreur}. Réessaie.</div>}
    </div>}
  </div>;
}
