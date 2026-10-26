import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseCaisse.js";
import { nettoyerTelephone, telephoneValide } from "../../arena-commande/src/shared/commander.js";
import { CLUB_DEPART, PROFILS, nomProfil, vcardsClub, csvClub, telecharger } from "../../arena-commande/src/shared/club.js";

// Sous-onglet 📣 Club (patron) : les clients inscrits avec le QR « Club Arena ».
// Liste, cadeau de bienvenue, désinscription (STOP), fichiers à télécharger et réglages.
const LIEN_CLUB = "https://arena-commande.vercel.app/#/club";

export default function Club({ S, Btn, Inp, Card, showToast }) {
  const [membres, setMembres] = useState(null);
  const [cfg, setCfg] = useState(undefined);
  const [cherche, setCherche] = useState("");
  const [profil, setProfil] = useState("tous");
  const [message, setMessage] = useState("");
  useEffect(() => onSnapshot(collection(db, "club"), (s) => {
    setMembres(s.docs.map((d) => d.data()).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
  }, () => setMembres([])), []);
  useEffect(() => onSnapshot(doc(db, "config/club"), (s) => setCfg(s.exists() ? s.data() : null), () => setCfg(null)), []);

  if (!membres || cfg === undefined) return <div style={{ color: S.muted }}>Chargement…</div>;
  const q = cherche.trim().toLowerCase();
  const vus = membres.filter((m) => (profil === "tous" || m.profil === profil)
    && (!q || m.prenom.toLowerCase().includes(q) || m.telephone.includes(q.replace(/\s/g, ""))));
  const date = new Date().toISOString().slice(0, 10);
  const semaine = membres.filter((m) => m.createdAt && Date.now() - m.createdAt.toMillis() < 7 * 86400000).length;
  // Classement des parrains (prénom écrit dans « Qui t'a parlé du Club ? »)
  const parrains = Object.entries(membres.reduce((t, m) => {
    const p = (m.parrain || "").trim();
    if (p) { const k = p.toLowerCase(); t[k] = { nom: t[k]?.nom || p, n: (t[k]?.n || 0) + 1 }; }
    return t;
  }, {})).map(([, v]) => v).sort((a, b) => b.n - a.n).slice(0, 5);

  const cadeau = async (m) => {
    try { await updateDoc(doc(db, "club", m.telephone), { cadeauDonne: !m.cadeauDonne, majAt: serverTimestamp() }); }
    catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  const retirer = async (m) => {
    if (!window.confirm(`Retirer ${m.prenom} (${m.telephone}) du Club ? À faire quand la personne a répondu STOP.`)) return;
    try { await deleteDoc(doc(db, "club", m.telephone)); showToast("✓ Retiré du Club"); }
    catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  const copier = async () => {
    const t = vus.map((m) => "+221" + m.telephone).join("\n");
    try { await navigator.clipboard.writeText(t); showToast(`✓ ${vus.length} numéros copiés`); }
    catch (e) { window.prompt("Copiez les numéros :", t); }
  };
  const wa = (m) => `https://wa.me/221${m.telephone}${message.trim() ? "?text=" + encodeURIComponent(message.trim()) : ""}`;

  return <>
    <div style={Card(S.gold)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: S.gold }}>📣 Club Arena</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: S.green }}>{membres.length}</div>
      </div>
      <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>
        Inscrits avec le QR du Club ({semaine} cette semaine). Ils ont accepté de recevoir vos offres sur WhatsApp.
        Lien du QR : <b style={{ color: S.text }}>{LIEN_CLUB}</b>
      </div>
      {parrains.length > 0 && <div style={{ fontSize: 11, color: S.muted, marginTop: 8 }}>🏆 Parrains : {parrains.map((p) => `${p.nom} (${p.n})`).join(" · ")}</div>}
    </div>

    <div style={Card()}>
      <div style={{ fontWeight: 800, color: S.gold, marginBottom: 6 }}>📲 Envoyer une offre</div>
      <div style={{ fontSize: 11, color: S.muted, lineHeight: 1.6, marginBottom: 10 }}>
        1. Téléchargez les contacts et ouvrez le fichier sur le téléphone WhatsApp Business : tous les inscrits s'ajoutent aux contacts.<br />
        2. Dans WhatsApp Business : Nouvelle diffusion, puis choisissez les contacts « Club Arena » (256 maximum par liste).<br />
        3. Collez le message préparé avec Claude. Il doit finir par « Réponds STOP pour ne plus recevoir nos offres ».
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button disabled={!vus.length} onClick={() => telecharger(`club-arena-contacts-${date}.vcf`, vcardsClub(vus), "text/vcard")} style={{ ...Btn(S.green, S.bg), flex: 1 }}>📇 Contacts ({vus.length})</button>
        <button disabled={!vus.length} onClick={() => telecharger(`club-arena-${date}.csv`, csvClub(vus), "text/csv;charset=utf-8")} style={{ ...Btn(S.card3, S.text), flex: 1 }}>📄 Excel</button>
        <button disabled={!vus.length} onClick={copier} style={{ ...Btn(S.card3, S.text), flex: 1 }}>📋 Copier</button>
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message de l'offre (facultatif) : il sera pré-rempli quand vous touchez 💬 sur un client" style={{ ...Inp(), height: 60, resize: "vertical", marginTop: 10, fontSize: 12 }} />
    </div>

    <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
      <input value={cherche} onChange={(e) => setCherche(e.target.value)} placeholder="🔍 Prénom ou numéro" style={{ ...Inp(), flex: 1, minWidth: 140 }} />
      <select value={profil} onChange={(e) => setProfil(e.target.value)} style={Inp(130)}>
        <option value="tous">Tous</option>
        {PROFILS.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
      </select>
    </div>
    {!vus.length && <div style={{ color: S.muted, fontSize: 12, padding: 10 }}>{membres.length ? "Personne ne correspond." : "Pas encore d'inscrit. Affichez le QR du Club au comptoir !"}</div>}
    {vus.map((m) => <div key={m.telephone} style={{ ...Card(), padding: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700 }}>{m.prenom} <span style={{ color: S.blue, fontSize: 12 }}>{m.telephone}</span></div>
        <div style={{ fontSize: 10, color: S.muted }}>
          {nomProfil(m.profil)}{m.parrain ? ` · parrain ${m.parrain}` : ""}{m.createdAt ? " · " + m.createdAt.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}{m.source === "commande" ? " · via commande" : ""}
        </div>
      </div>
      <button onClick={() => cadeau(m)} title="Cadeau de bienvenue" style={{ ...Btn(m.cadeauDonne ? S.card3 : S.gold, m.cadeauDonne ? S.muted : S.bg), padding: "6px 8px", fontSize: 11 }}>{m.cadeauDonne ? "🎁 donné" : "🎁 à donner"}</button>
      <a href={wa(m)} target="_blank" rel="noopener" style={{ ...Btn("#25D366", "#fff"), padding: "6px 8px", textDecoration: "none" }}>💬</a>
      <button onClick={() => retirer(m)} title="Retirer (STOP)" style={{ ...Btn(S.card3, S.red), padding: "6px 8px" }}>✕</button>
    </div>)}

    <ReglagesClub {...{ S, Btn, Inp, Card, cfg, showToast }} />
  </>;
}

function ReglagesClub({ S, Btn, Inp, Card, cfg, showToast }) {
  const [b, setB] = useState(null);
  useEffect(() => { if (!b) setB({ ...CLUB_DEPART, ...(cfg || {}) }); }, [cfg, b]);
  if (!b) return null;
  const actif = !!(cfg ? cfg.actif : CLUB_DEPART.actif);
  const enregistrer = async (nouvelActif = b.actif) => {
    const telephone = nettoyerTelephone(b.telephone);
    if (telephone && !telephoneValide(telephone)) return showToast("❌ Numéro WhatsApp invalide (ex. 77 123 45 67)", S.red);
    const lienChaine = String(b.lienChaine || "").trim();
    if (lienChaine && !/^https:\/\//.test(lienChaine)) return showToast("❌ Le lien de la Chaîne doit commencer par https://", S.red);
    try {
      await setDoc(doc(db, "config/club"), { actif: !!nouvelActif, cadeau: String(b.cadeau || "").trim().slice(0, 60), telephone, lienChaine });
      setB(null);
      showToast(nouvelActif !== actif ? (nouvelActif ? "✓ Inscriptions au Club OUVERTES" : "⛔ Inscriptions au Club fermées") : "✓ Réglages du Club enregistrés");
    } catch (e) { showToast("❌ " + (e.code || e.message), S.red); }
  };
  return <div style={{ ...Card(), marginTop: 12 }}>
    <div style={{ fontWeight: 800, color: S.gold, marginBottom: 8 }}>⚙️ Réglages du Club</div>
    <button onClick={() => enregistrer(!actif)} style={{ ...Btn(actif ? S.green : S.red, S.bg), width: "100%", marginBottom: 10 }}>
      {actif ? "✓ Inscriptions OUVERTES — toucher pour fermer" : "⛔ Inscriptions FERMÉES — toucher pour ouvrir"}
    </button>
    <label style={{ fontSize: 11, color: S.muted }}>Cadeau de bienvenue (vide = pas de cadeau)</label>
    <input value={b.cadeau} maxLength={60} onChange={(e) => setB({ ...b, cadeau: e.target.value })} style={{ ...Inp(), marginBottom: 8 }} />
    <label style={{ fontSize: 11, color: S.muted }}>Numéro WhatsApp Business d'Arena Café (le client l'enregistre dans ses contacts)</label>
    <input value={b.telephone} inputMode="tel" placeholder="77 123 45 67" onChange={(e) => setB({ ...b, telephone: e.target.value })} style={{ ...Inp(), marginBottom: 8 }} />
    <label style={{ fontSize: 11, color: S.muted }}>Lien de la Chaîne WhatsApp (facultatif)</label>
    <input value={b.lienChaine} placeholder="https://whatsapp.com/channel/..." onChange={(e) => setB({ ...b, lienChaine: e.target.value })} style={{ ...Inp(), marginBottom: 10 }} />
    <button onClick={() => enregistrer()} style={{ ...Btn(), width: "100%" }}>💾 Enregistrer</button>
  </div>;
}
