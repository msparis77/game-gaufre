import React, { useState, useEffect, useRef } from 'react'

// ============================================================
// DONNÉES PAR DÉFAUT
// ============================================================
const DEFAULT_PINS = {
  patron: '1234',
  employes: [
    { id: 1, nom: 'Employé 1', pin: '0001' },
    { id: 2, nom: 'Employé 2', pin: '0002' },
    { id: 3, nom: 'Employé 3', pin: '0003' },
    { id: 4, nom: 'Employé 4', pin: '0004' },
    { id: 5, nom: 'Employé 5', pin: '0005' },
  ]
}

const DEFAULT_BOISSONS = [
  { id: 'b1', nom: 'Café', emoji: '☕', prix: 150 },
  { id: 'b2', nom: 'Café lait', emoji: '🥛', prix: 200 },
  { id: 'b3', nom: 'Chocolat', emoji: '🍫', prix: 200 },
  { id: 'b4', nom: 'Thé', emoji: '🍵', prix: 150 },
  { id: 'b5', nom: 'Café Touba', emoji: '☕', prix: 150 },
  { id: 'b6', nom: 'Canette', emoji: '🥤', prix: 500 },
  { id: 'b7', nom: 'Jus', emoji: '🧃', prix: 300 },
  { id: 'b8', nom: 'Bissap', emoji: '🔴', prix: 300 },
  { id: 'b9', nom: 'Eau', emoji: '💧', prix: 200 },
]

const DEFAULT_SNACKS = [
  { id: 's1', nom: 'Crêpe Sucre', emoji: '🥞', prix: 500 },
  { id: 's2', nom: 'Crêpe Confiture', emoji: '🥞', prix: 600 },
  { id: 's3', nom: 'Crêpe Nutella', emoji: '🥞', prix: 800 },
  { id: 's4', nom: 'Crêpe Poulet', emoji: '🍗', prix: 1500 },
  { id: 's5', nom: 'Crêpe Thon', emoji: '🐟', prix: 1500 },
  { id: 's6', nom: 'Gaufre Sucre', emoji: '🧇', prix: 500 },
  { id: 's7', nom: 'Gaufre Nutella', emoji: '🧇', prix: 1000 },
  { id: 's8', nom: 'Sandwich', emoji: '🥪', prix: 1000 },
]

const DEFAULT_STATIONS = [
  { id: 'ps1', nom: 'PS5 — Console 1', emoji: '🎮', prix1j: 500, prix2j: 1000, durees: [30, 60, 90] },
  { id: 'ps2', nom: 'PS5 — Console 2', emoji: '🎮', prix1j: 500, prix2j: 1000, durees: [30, 60, 90] },
  { id: 'ps3', nom: 'PS5 — Console 3', emoji: '🎮', prix1j: 500, prix2j: 1000, durees: [30, 60, 90] },
  { id: 'ps4', nom: 'PS5 — Console 4', emoji: '🎮', prix1j: 500, prix2j: 1000, durees: [30, 60, 90] },
  { id: 'ps5', nom: 'PS5 — Console 5', emoji: '🎮', prix1j: 500, prix2j: 1000, durees: [30, 60, 90] },
  { id: 'psg', nom: 'Écran Géant', emoji: '📺', prix1j: 1500, prix2j: 2000, durees: [30, 60, 90] },
  { id: 'pc1', nom: 'PC — Poste 1', emoji: '💻', prix1j: 300, prix2j: 500, durees: [30, 60] },
  { id: 'pc2', nom: 'PC — Poste 2', emoji: '💻', prix1j: 300, prix2j: 500, durees: [30, 60] },
  { id: 'pc3', nom: 'PC — Poste 3', emoji: '💻', prix1j: 300, prix2j: 500, durees: [30, 60] },
]

const DEFAULT_INGREDIENTS = [
  { id: 'i1', nom: 'Farine', emoji: '🌾', stock: 5, unite: 'kg', prixKg: 300 },
  { id: 'i2', nom: 'Lait en poudre', emoji: '🥛', stock: 2, unite: 'kg', prixKg: 6000 },
  { id: 'i3', nom: 'Beurre', emoji: '🧈', stock: 2, unite: 'kg', prixKg: 7000 },
  { id: 'i4', nom: 'Oeufs', emoji: '🥚', stock: 30, unite: 'u', prixKg: 62 },
  { id: 'i5', nom: 'Sucre', emoji: '🍬', stock: 3, unite: 'kg', prixKg: 470 },
  { id: 'i6', nom: 'Nutella', emoji: '🍫', stock: 1, unite: 'kg', prixKg: 10000 },
  { id: 'i7', nom: 'Confiture', emoji: '🍓', stock: 1, unite: 'kg', prixKg: 5000 },
  { id: 'i8', nom: 'Poulet', emoji: '🍗', stock: 2, unite: 'kg', prixKg: 2200 },
  { id: 'i9', nom: 'Fromage', emoji: '🧀', stock: 0.5, unite: 'kg', prixKg: 6000 },
  { id: 'i10', nom: 'Pain', emoji: '🍞', stock: 10, unite: 'u', prixKg: 150 },
]

const DEFAULT_RECETTES = [
  { id: 'r1', nom: 'Crêpe Sucre', emoji: '🥞', ingredients: [{ id: 'i1', qte: 0.06 }, { id: 'i2', qte: 0.015 }, { id: 'i3', qte: 0.005 }, { id: 'i4', qte: 0.5 }, { id: 'i5', qte: 0.015 }] },
  { id: 'r2', nom: 'Crêpe Nutella', emoji: '🥞', ingredients: [{ id: 'i1', qte: 0.06 }, { id: 'i2', qte: 0.015 }, { id: 'i3', qte: 0.005 }, { id: 'i4', qte: 0.5 }, { id: 'i6', qte: 0.03 }] },
  { id: 'r3', nom: 'Gaufre Sucre', emoji: '🧇', ingredients: [{ id: 'i1', qte: 0.05 }, { id: 'i2', qte: 0.008 }, { id: 'i3', qte: 0.015 }, { id: 'i4', qte: 0.5 }, { id: 'i5', qte: 0.015 }] },
  { id: 'r4', nom: 'Crêpe Poulet', emoji: '🍗', ingredients: [{ id: 'i1', qte: 0.06 }, { id: 'i2', qte: 0.015 }, { id: 'i8', qte: 0.08 }, { id: 'i9', qte: 0.04 }] },
]

const EMOJIS = ['☕','🥛','🍫','🍵','🥤','🧃','💧','🔴','🍊','🟡','🥞','🧇','🍗','🐟','🥩','🥪','🍕','🍔','🌮','🥗','🌾','🧈','🥚','🍬','🍓','🧀','🍞','🫙','🥜','🌽','🎮','💻','📺','🏆','🔥','⚡','⭐','💎','🎯','🎪','🛒','📦','🎁','💰','📱','🖨️','🔑','📊','📋','✅','⚠️','🚨','👑','👤','🌙','☀️','🌤️']

// ============================================================
// STORAGE LOCAL
// ============================================================
function loadData(key, def) {
  try {
    const v = localStorage.getItem('gg_' + key)
    return v ? JSON.parse(v) : def
  } catch { return def }
}
function saveData(key, val) {
  try { localStorage.setItem('gg_' + key, JSON.stringify(val)) } catch {}
}

// ============================================================
// FORMATAGE
// ============================================================
function fmt(n) {
  return (n || 0).toLocaleString('fr-FR') + ' F'
}
function fmtKg(n) {
  if (!n && n !== 0) return '0'
  if (n >= 1) return n.toFixed(3).replace(/\.?0+$/, '') + ' kg'
  return (n * 1000).toFixed(0) + ' g'
}
function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function today() {
  return new Date().toLocaleDateString('fr-FR')
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function App() {
  // AUTH
  const [user, setUser] = useState(null) // null | 'patron' | {id, nom}
  const [pins, setPins] = useState(() => loadData('pins', DEFAULT_PINS))
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [locked, setLocked] = useState(false)
  const lockTimer = useRef(null)

  // DONNÉES
  const [boissons, setBoissons] = useState(() => loadData('boissons', DEFAULT_BOISSONS))
  const [snacks, setSnacks] = useState(() => loadData('snacks', DEFAULT_SNACKS))
  const [stations, setStations] = useState(() => loadData('stations', DEFAULT_STATIONS))
  const [ingredients, setIngredients] = useState(() => loadData('ingredients', DEFAULT_INGREDIENTS))
  const [recettes, setRecettes] = useState(() => loadData('recettes', DEFAULT_RECETTES))

  // CAISSE
  const [panier, setPanier] = useState([])
  const [ventes, setVentes] = useState(() => loadData('ventes_' + today(), []))
  const [ticketVisible, setTicketVisible] = useState(false)
  const [ticketData, setTicketData] = useState(null)
  const [ticketNum, setTicketNum] = useState(() => loadData('ticket_num', 1000))

  // GAMING
  const [sessions, setSessions] = useState({}) // id -> {status, duree, joueurs, prixPaye, startTime, elapsed}
  const [gamingVentes, setGamingVentes] = useState(() => loadData('gaming_ventes_' + today(), []))

  // STOCKS
  const [stockMatin, setStockMatin] = useState(() => loadData('stock_matin_' + today(), {}))
  const [productions, setProductions] = useState(() => loadData('productions_' + today(), []))
  const [stockSoir, setStockSoir] = useState(() => loadData('stock_soir_' + today(), {}))

  // ACHATS
  const [achats, setAchats] = useState(() => loadData('achats_' + today(), []))
  const [photoLoading, setPhotoLoading] = useState(false)
  const fileInputRef = useRef(null)

  // AUDIT
  const [audit, setAudit] = useState(() => loadData('audit_' + today(), []))

  // NAVIGATION
  const [onglet, setOnglet] = useState('accueil')

  // MODALS
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [emojiPicker, setEmojiPicker] = useState(null)

  // IA
  const [iaMessages, setIaMessages] = useState([])
  const [iaInput, setIaInput] = useState('')
  const [iaLoading, setIaLoading] = useState(false)

  // Boutique
  const [boutique, setBoutique] = useState(() => loadData('boutique', 'Limamoulaye'))

  // Auto-save
  useEffect(() => { saveData('pins', pins) }, [pins])
  useEffect(() => { saveData('boissons', boissons) }, [boissons])
  useEffect(() => { saveData('snacks', snacks) }, [snacks])
  useEffect(() => { saveData('stations', stations) }, [stations])
  useEffect(() => { saveData('ingredients', ingredients) }, [ingredients])
  useEffect(() => { saveData('recettes', recettes) }, [recettes])
  useEffect(() => { saveData('ventes_' + today(), ventes) }, [ventes])
  useEffect(() => { saveData('gaming_ventes_' + today(), gamingVentes) }, [gamingVentes])
  useEffect(() => { saveData('stock_matin_' + today(), stockMatin) }, [stockMatin])
  useEffect(() => { saveData('productions_' + today(), productions) }, [productions])
  useEffect(() => { saveData('stock_soir_' + today(), stockSoir) }, [stockSoir])
  useEffect(() => { saveData('achats_' + today(), achats) }, [achats])
  useEffect(() => { saveData('audit_' + today(), audit) }, [audit])
  useEffect(() => { saveData('ticket_num', ticketNum) }, [ticketNum])
  useEffect(() => { saveData('boutique', boutique) }, [boutique])

  // Timer gaming
  useEffect(() => {
    const iv = setInterval(() => {
      setSessions(prev => {
        const next = { ...prev }
        let changed = false
        Object.keys(next).forEach(id => {
          const s = next[id]
          if (s.status === 'en_cours' && s.startTime) {
            const elapsed = Math.floor((Date.now() - s.startTime) / 1000)
            if (elapsed !== s.elapsed) {
              next[id] = { ...s, elapsed }
              changed = true
            }
          }
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  // Lock auto
  const resetLock = () => {
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => { if (user) { setUser(null); setPinInput('') } }, 5 * 60 * 1000)
  }
  useEffect(() => {
    if (user) resetLock()
    return () => clearTimeout(lockTimer.current)
  }, [user])

  // LOG AUDIT
  function logAudit(action) {
    const nom = user === 'patron' ? '👑 Patron' : (user && user.nom ? user.nom : '?')
    setAudit(prev => [...prev, { heure: now(), who: nom, action }])
  }

  // ============================================================
  // LOGIN
  // ============================================================
  function tryLogin(p) {
    if (p === pins.patron) {
      setUser('patron')
      setPinInput('')
      setPinError('')
      logAudit('Connexion patron')
      return
    }
    for (const e of pins.employes) {
      if (p === e.pin) {
        setUser(e)
        setPinInput('')
        setPinError('')
        logAudit('Connexion ' + e.nom)
        return
      }
    }
    setPinError('PIN incorrect')
    setPinInput('')
    setTimeout(() => setPinError(''), 2000)
  }

  function handlePinPress(v) {
    if (v === 'del') { setPinInput(p => p.slice(0, -1)); return }
    if (v === 'ok') { if (pinInput.length >= 4) tryLogin(pinInput); return }
    const next = pinInput + v
    setPinInput(next)
    if (next.length === 4) setTimeout(() => tryLogin(next), 100)
  }

  // ============================================================
  // CAISSE
  // ============================================================
  function addToPanier(produit, cat) {
    setPanier(prev => {
      const ex = prev.find(x => x.id === produit.id && x.cat === cat)
      if (ex) return prev.map(x => x.id === produit.id && x.cat === cat ? { ...x, qte: x.qte + 1 } : x)
      return [...prev, { ...produit, cat, qte: 1 }]
    })
  }
  function removeFromPanier(id, cat) {
    setPanier(prev => prev.filter(x => !(x.id === id && x.cat === cat)))
  }
  function totalPanier() { return panier.reduce((s, x) => s + x.prix * x.qte, 0) }

  function validerVente(sansPrint = false) {
    if (panier.length === 0) return
    const num = ticketNum + 1
    setTicketNum(num)
    const t = {
      num,
      heure: now(),
      items: [...panier],
      total: totalPanier(),
      employe: user === 'patron' ? 'Patron' : (user && user.nom),
      sansPrint
    }
    setTicketData(t)
    setVentes(prev => [...prev, t])
    logAudit(`Vente #${num} — ${fmt(t.total)}${sansPrint ? ' [SANS TICKET]' : ''}`)
    setPanier([])
    setTicketVisible(true)
  }

  function imprimerTicket() {
    const t = ticketData
    if (!t) return
    const contenu = `
================================
    🎮 GAME & GAUFRE
    ${boutique}
================================
Ticket #${t.num}     ${t.heure}
Employé: ${t.employe}
--------------------------------
${t.items.map(i => `${i.emoji} ${i.nom}\n   ${i.qte} × ${fmt(i.prix)} = ${fmt(i.prix * i.qte)}`).join('\n')}
--------------------------------
TOTAL: ${fmt(t.total)}
================================
     Merci & à bientôt !
================================`
    const w = window.open('', '_blank', 'width=300,height=400')
    if (w) {
      w.document.write(`<pre style="font-family:monospace;font-size:12px;padding:10px">${contenu}</pre>`)
      w.document.close()
      w.print()
    }
  }

  // ============================================================
  // GAMING
  // ============================================================
  function payerSession(stId, duree, joueurs) {
    const st = stations.find(s => s.id === stId)
    if (!st) return
    const prix = joueurs === 2 ? st.prix2j : st.prix1j
    const num = ticketNum + 1
    setTicketNum(num)
    const t = {
      num,
      heure: now(),
      items: [{ nom: `${st.nom} — ${duree}min ${joueurs}J`, emoji: st.emoji, qte: 1, prix }],
      total: prix,
      employe: user === 'patron' ? 'Patron' : (user && user.nom),
      gaming: true
    }
    setTicketData(t)
    setGamingVentes(prev => [...prev, { ...t, stId, duree, joueurs }])
    setSessions(prev => ({ ...prev, [stId]: { status: 'paye', duree, joueurs, prix, prixPaye: prix, startTime: null, elapsed: 0 } }))
    logAudit(`Gaming #${num} — ${st.nom} ${duree}min — ${fmt(prix)}`)
    setTicketVisible(true)
  }

  function demarrerSession(stId) {
    setSessions(prev => {
      const s = prev[stId]
      if (!s) return prev
      return { ...prev, [stId]: { ...s, status: 'en_cours', startTime: Date.now(), elapsed: 0 } }
    })
    logAudit('Démarrage partie ' + stId)
  }

  function terminerSession(stId) {
    setSessions(prev => {
      const next = { ...prev }
      delete next[stId]
      return next
    })
  }

  function fmtTimer(s) {
    if (!s || !s.elapsed) return '0:00'
    const m = Math.floor(s.elapsed / 60)
    const sec = s.elapsed % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  // ============================================================
  // ACHATS (photo facture)
  // ============================================================
  async function analyserPhoto(file) {
    setPhotoLoading(true)
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(r.result.split(',')[1])
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
              { type: 'text', text: 'Lis cette facture et liste les produits achetés avec quantité et prix. Réponds UNIQUEMENT en JSON: {"achats":[{"nom":"...","quantite":0,"unite":"kg","prixTotal":0}]}' }
            ]
          }]
        })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error?.message || 'Erreur serveur')
      const txt = data.content?.[0]?.text || ''
      const match = txt.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setModal({ type: 'confirm_achats', data: parsed.achats })
      } else {
        alert('Impossible de lire la facture. Essaie la saisie manuelle.')
      }
    } catch (e) {
      alert('Erreur: ' + e.message)
    }
    setPhotoLoading(false)
  }

  function confirmerAchats(liste) {
    const now2 = now()
    const nouveaux = liste.map(a => ({
      id: Date.now() + Math.random(),
      heure: now2,
      nom: a.nom,
      quantite: parseFloat(a.quantite) || 0,
      unite: a.unite || 'kg',
      prixTotal: parseInt(a.prixTotal) || 0,
      employe: user === 'patron' ? 'Patron' : (user && user.nom)
    }))
    setAchats(prev => [...prev, ...nouveaux])
    nouveaux.forEach(a => logAudit(`Achat: ${a.nom} ${a.quantite}${a.unite} = ${fmt(a.prixTotal)}`))
    setModal(null)
  }

  // ============================================================
  // IA ASSISTANT
  // ============================================================
  async function envoyerIA(msg) {
    if (!msg.trim()) return
    const userMsg = { role: 'user', content: msg }
    setIaMessages(prev => [...prev, userMsg])
    setIaInput('')
    setIaLoading(true)
    try {
      const caTotal = ventes.reduce((s, v) => s + v.total, 0)
      const caGaming = gamingVentes.reduce((s, v) => s + v.total, 0)
      const totalAchats = achats.reduce((s, a) => s + a.prixTotal, 0)
      const context = `Tu es l'assistant IA de Game & Gaufre ${boutique}. Données du jour:
- CA food: ${fmt(caTotal)} (${ventes.length} ventes)
- CA gaming: ${fmt(caGaming)} (${gamingVentes.length} sessions)
- Achats fournisseurs: ${fmt(totalAchats)}
- Bénéfice estimé: ${fmt(caTotal + caGaming - totalAchats)}
- Productions: ${productions.map(p => p.nom + ' ×' + p.qte).join(', ') || 'aucune'}
Réponds en français, de façon concise et pratique.`
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: context,
          messages: [...iaMessages, userMsg]
        })
      })
      if (!resp.ok) {
        const err = await resp.json()
        throw new Error(err.error?.message || `Erreur ${resp.status}`)
      }
      const data = await resp.json()
      const reply = data.content?.[0]?.text || 'Pas de réponse'
      setIaMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setIaMessages(prev => [...prev, { role: 'assistant', content: '❌ ' + e.message }])
    }
    setIaLoading(false)
  }

  // ============================================================
  // BILAN
  // ============================================================
  function getBilan() {
    const caFood = ventes.reduce((s, v) => s + v.total, 0)
    const caGaming = gamingVentes.reduce((s, v) => s + v.total, 0)
    const totalAchats = achats.reduce((s, a) => s + a.prixTotal, 0)
    const ca = caFood + caGaming
    const net = ca - totalAchats
    return { caFood, caGaming, ca, totalAchats, net }
  }

  function rapportWhatsApp() {
    const b = getBilan()
    const txt = `🎮 GAME & GAUFRE — ${boutique}
📅 ${today()} à ${now()}

💰 CA Food: ${fmt(b.caFood)}
🎮 CA Gaming: ${fmt(b.caGaming)}
📦 Achats: ${fmt(b.totalAchats)}
─────────────────
✅ NET: ${fmt(b.net)}

Tickets: ${ventes.length} | Sessions: ${gamingVentes.length}
${audit.filter(a => a.action.includes('SANS TICKET')).length > 0 ? '⚠️ Ventes sans ticket: ' + audit.filter(a => a.action.includes('SANS TICKET')).length : ''}
Envoyé depuis l'app Game & Gaufre`
    navigator.clipboard.writeText(txt).then(() => alert('Rapport copié ! Colle-le dans WhatsApp ✅'))
  }

  // ============================================================
  // GESTION PRODUITS (CRUD)
  // ============================================================
  function genId() { return 'x' + Date.now() + Math.random().toString(36).slice(2, 6) }

  function sauvegarderProduit(data) {
    const { type, item } = data
    if (type === 'boisson') {
      if (item.id) setBoissons(prev => prev.map(x => x.id === item.id ? item : x))
      else setBoissons(prev => [...prev, { ...item, id: genId() }])
    } else if (type === 'snack') {
      if (item.id) setSnacks(prev => prev.map(x => x.id === item.id ? item : x))
      else setSnacks(prev => [...prev, { ...item, id: genId() }])
    } else if (type === 'station') {
      if (item.id) setStations(prev => prev.map(x => x.id === item.id ? item : x))
      else setStations(prev => [...prev, { ...item, id: genId() }])
    } else if (type === 'ingredient') {
      if (item.id) setIngredients(prev => prev.map(x => x.id === item.id ? item : x))
      else setIngredients(prev => [...prev, { ...item, id: genId() }])
    } else if (type === 'recette') {
      if (item.id) setRecettes(prev => prev.map(x => x.id === item.id ? item : x))
      else setRecettes(prev => [...prev, { ...item, id: genId() }])
    }
    logAudit((item.id ? 'Modifié' : 'Ajouté') + ': ' + (item.nom || ''))
    setModal(null)
  }

  function supprimerProduit(type, id) {
    if (!window.confirm('Supprimer ce produit ?')) return
    if (type === 'boisson') setBoissons(prev => prev.filter(x => x.id !== id))
    else if (type === 'snack') setSnacks(prev => prev.filter(x => x.id !== id))
    else if (type === 'station') setStations(prev => prev.filter(x => x.id !== id))
    else if (type === 'ingredient') setIngredients(prev => prev.filter(x => x.id !== id))
    else if (type === 'recette') setRecettes(prev => prev.filter(x => x.id !== id))
    logAudit('Supprimé produit ' + id)
  }

  // ============================================================
  // STYLES
  // ============================================================
  const S = {
    app: { background: '#0f0f1a', minHeight: '100vh', color: '#e8e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' },
    header: { background: '#1a1a2e', borderBottom: '2px solid #4a4a8a', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#fff', flex: 1 },
    tabs: { display: 'flex', gap: 2, padding: '6px 8px', background: '#12122a', overflowX: 'auto', flexShrink: 0 },
    tab: (active) => ({ background: active ? '#4a4a8a' : '#1e1e3a', color: active ? '#fff' : '#aaa', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 52, whiteSpace: 'nowrap' }),
    tabEmoji: { fontSize: 18 },
    tabLabel: { fontSize: 9 },
    body: { flex: 1, overflowY: 'auto', padding: '10px 8px 60px' },
    card: { background: '#1e1e3a', borderRadius: 12, padding: 12, marginBottom: 10 },
    btn: (col = '#4a4a8a') => ({ background: col, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }),
    btnSmall: (col = '#4a4a8a') => ({ background: col, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }),
    prodBtn: { background: '#252545', border: '1px solid #3a3a6a', borderRadius: 10, padding: '10px 8px', cursor: 'pointer', textAlign: 'center', fontSize: 12 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
    input: { background: '#252545', border: '1px solid #4a4a8a', color: '#e8e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 13, width: '100%', boxSizing: 'border-box' },
    label: { fontSize: 11, color: '#9090b0', marginBottom: 2, display: 'block' },
    h2: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#c0c0ff' },
    h3: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#9090c0' },
    badge: (col) => ({ background: col, borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 'bold' }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
    modalBox: { background: '#1e1e3a', borderRadius: 14, padding: 16, width: '100%', maxWidth: 380, maxHeight: '90vh', overflowY: 'auto' },
    pinScreen: { position: 'fixed', inset: 0, background: '#0f0f1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
    pinDots: { display: 'flex', gap: 8 },
    pinDot: (filled) => ({ width: 14, height: 14, borderRadius: '50%', background: filled ? '#7070ff' : '#3a3a5a', border: '2px solid #5a5a9a' }),
    pinGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: 240 },
    pinBtn: { background: '#1e1e3a', border: '2px solid #3a3a6a', color: '#fff', borderRadius: 10, padding: '14px 0', fontSize: 20, fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' },
  }

  // ============================================================
  // ECRAN PIN
  // ============================================================
  if (!user) {
    return (
      <div style={S.pinScreen} onClick={resetLock}>
        <div style={{ fontSize: 48 }}>🎮</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>GAME & GAUFRE</div>
        <div style={{ fontSize: 12, color: '#7070b0' }}>{boutique}</div>
        {pinError && <div style={{ color: '#ff6060', fontSize: 13 }}>{pinError}</div>}
        <div style={S.pinDots}>
          {[0,1,2,3].map(i => <div key={i} style={S.pinDot(i < pinInput.length)} />)}
        </div>
        <div style={S.pinGrid}>
          {['1','2','3','4','5','6','7','8','9','del','0','ok'].map(v => (
            <button key={v} style={{...S.pinBtn, background: v === 'ok' ? '#4a6a4a' : v === 'del' ? '#6a4a4a' : '#1e1e3a'}}
              onClick={() => handlePinPress(v)}>
              {v === 'del' ? '⌫' : v === 'ok' ? '✓' : v}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#5a5a7a', marginTop: 8 }}>Entrez votre PIN à 4 chiffres</div>
      </div>
    )
  }

  const isPatron = user === 'patron'
  const userName = isPatron ? '👑 Patron' : user.nom

  // ============================================================
  // ONGLETS VISIBLES
  // ============================================================
  const TABS = [
    { id: 'accueil', emoji: '🏠', label: 'Accueil' },
    { id: 'caisse', emoji: '🛒', label: 'Caisse' },
    { id: 'gaming', emoji: '🎮', label: 'Gaming' },
    { id: 'achats', emoji: '📸', label: 'Achats' },
    { id: 'stocks', emoji: '📦', label: 'Stocks' },
    { id: 'bilan', emoji: '📊', label: 'Bilan' },
    ...(isPatron ? [
      { id: 'recettes', emoji: '📖', label: 'Recettes' },
      { id: 'produits', emoji: '✏️', label: 'Produits' },
      { id: 'equipe', emoji: '👥', label: 'Équipe' },
      { id: 'audit', emoji: '🔍', label: 'Audit' },
    ] : []),
    { id: 'ia', emoji: '🤖', label: 'Assistant' },
    { id: 'guide', emoji: '❓', label: 'Guide' },
  ]

  // ============================================================
  // RENDER ONGLET — ACCUEIL
  // ============================================================
  function renderAccueil() {
    const b = getBilan()
    const steps = [
      { id: 'achats', label: 'Enregistrer les achats', done: achats.length > 0, emoji: '📸', onglet: 'achats' },
      { id: 'stock', label: 'Saisir le stock matin', done: Object.keys(stockMatin).length > 0, emoji: '📦', onglet: 'stocks' },
      { id: 'prod', label: 'Enregistrer la production', done: productions.length > 0, emoji: '🍳', onglet: 'stocks' },
      { id: 'caisse', label: 'Ouvrir la caisse', done: ventes.length > 0 || gamingVentes.length > 0, emoji: '🛒', onglet: 'caisse' },
      { id: 'bilan', label: 'Clôturer et rapport', done: false, emoji: '📊', onglet: 'bilan' },
    ]
    return (
      <div>
        <div style={{ ...S.card, background: '#1a1a3a', textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🎮</div>
          <div style={{ fontWeight: 'bold', fontSize: 16 }}>Game & Gaufre</div>
          <div style={{ color: '#7070b0', fontSize: 12 }}>{boutique} — {today()}</div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#7070ff' }}>Bonjour {userName} !</div>
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>📊 Résumé du jour</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div style={{ background: '#0f2a1f', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#7070b0' }}>CA Total</div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: '#50e090' }}>{fmt(b.ca)}</div>
            </div>
            <div style={{ background: '#1a1a0f', borderRadius: 8, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#7070b0' }}>Bénéfice</div>
              <div style={{ fontSize: 15, fontWeight: 'bold', color: b.net >= 0 ? '#90e050' : '#ff6060' }}>{fmt(b.net)}</div>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>📋 Tâches du jour</div>
          {steps.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #2a2a4a', cursor: 'pointer' }}
              onClick={() => setOnglet(s.onglet)}>
              <span style={{ fontSize: 20 }}>{s.done ? '✅' : '🔲'}</span>
              <span style={{ fontSize: 13, flex: 1 }}>{s.emoji} {s.label}</span>
              <span style={{ color: '#5a5a8a', fontSize: 14 }}>›</span>
            </div>
          ))}
        </div>
        <div style={{ ...S.grid2, marginBottom: 10 }}>
          <button style={{ ...S.btn('#2a4a2a'), padding: 14, fontSize: 13, borderRadius: 12 }} onClick={() => setOnglet('caisse')}>🛒 Caisse</button>
          <button style={{ ...S.btn('#2a2a5a'), padding: 14, fontSize: 13, borderRadius: 12 }} onClick={() => setOnglet('gaming')}>🎮 Gaming</button>
          <button style={{ ...S.btn('#4a2a2a'), padding: 14, fontSize: 13, borderRadius: 12 }} onClick={() => setOnglet('achats')}>📸 Achats</button>
          <button style={{ ...S.btn('#2a3a4a'), padding: 14, fontSize: 13, borderRadius: 12 }} onClick={() => setOnglet('bilan')}>📊 Bilan</button>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — CAISSE
  // ============================================================
  function renderCaisse() {
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>☕ Boissons</div>
          <div style={S.grid}>
            {boissons.map(b => (
              <button key={b.id} style={S.prodBtn} onClick={() => addToPanier(b, 'boisson')}>
                <div style={{ fontSize: 22 }}>{b.emoji}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{b.nom}</div>
                <div style={{ fontSize: 11, color: '#80e0a0', fontWeight: 'bold' }}>{fmt(b.prix)}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>🥞 Snacks</div>
          <div style={S.grid}>
            {snacks.map(s => (
              <button key={s.id} style={S.prodBtn} onClick={() => addToPanier(s, 'snack')}>
                <div style={{ fontSize: 22 }}>{s.emoji}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{s.nom}</div>
                <div style={{ fontSize: 11, color: '#80e0a0', fontWeight: 'bold' }}>{fmt(s.prix)}</div>
              </button>
            ))}
          </div>
        </div>
        {panier.length > 0 && (
          <div style={{ ...S.card, position: 'sticky', bottom: 60, zIndex: 10, background: '#12122a', border: '2px solid #4a4a8a' }}>
            <div style={S.h2}>🛒 Panier</div>
            {panier.map(item => (
              <div key={item.id + item.cat} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ flex: 1, fontSize: 12 }}>{item.emoji} {item.nom} ×{item.qte}</span>
                <span style={{ fontSize: 12, color: '#80e0a0' }}>{fmt(item.prix * item.qte)}</span>
                <button style={S.btnSmall('#6a2a2a')} onClick={() => removeFromPanier(item.id, item.cat)}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid #3a3a6a' }}>
              <span style={{ fontWeight: 'bold', color: '#80e0a0' }}>TOTAL: {fmt(totalPanier())}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={S.btnSmall('#3a3a3a')} onClick={() => setPanier([])}>Vider</button>
                <button style={S.btn('#2a4a2a')} onClick={() => validerVente(false)}>🖨️ Ticket</button>
                <button style={{ ...S.btnSmall('#4a3a1a') }} onClick={() => validerVente(true)}>⚠️ Sans impr.</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — GAMING
  // ============================================================
  function renderGaming() {
    return (
      <div>
        {stations.map(st => {
          const sess = sessions[st.id]
          const status = sess ? sess.status : 'libre'
          let cardColor = '#1e1e3a'
          if (status === 'paye') cardColor = '#1a2a1a'
          if (status === 'en_cours') cardColor = '#2a1a1a'
          return (
            <div key={st.id} style={{ ...S.card, background: cardColor, border: status !== 'libre' ? '1px solid #4a6a4a' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{st.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{st.nom}</div>
                  <div style={{ fontSize: 11, color: '#9090b0' }}>1J: {fmt(st.prix1j)}/30min &nbsp; 2J: {fmt(st.prix2j)}/30min</div>
                </div>
                {status === 'libre' && <span style={{ ...S.badge('#2a4a2a'), fontSize: 10 }}>🟢 LIBRE</span>}
                {status === 'paye' && <span style={{ ...S.badge('#4a4a2a'), fontSize: 10 }}>🟡 PAYÉ</span>}
                {status === 'en_cours' && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...S.badge('#4a2a2a'), fontSize: 10, display: 'block' }}>🔴 EN JEU</span>
                    <span style={{ fontSize: 14, fontWeight: 'bold', color: '#ff8060' }}>{fmtTimer(sess)}</span>
                    <span style={{ fontSize: 10, color: '#9090b0', display: 'block' }}>{sess.duree} min</span>
                  </div>
                )}
              </div>
              {status === 'libre' && (
                <div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {[30, 60, 90].map(d => (
                      <React.Fragment key={d}>
                        <button style={S.btnSmall('#2a3a5a')} onClick={() => payerSession(st.id, d, 1)}>
                          {d}min 1J — {fmt(st.prix1j * d / 30)}
                        </button>
                        <button style={S.btnSmall('#3a3a2a')} onClick={() => payerSession(st.id, d, 2)}>
                          {d}min 2J — {fmt(st.prix2j * d / 30)}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
              {status === 'paye' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#70b070' }}>✅ Payé — {sess.duree}min {sess.joueurs}J — {fmt(sess.prixPaye)}</span>
                  <button style={S.btn('#2a6a2a')} onClick={() => demarrerSession(st.id)}>▶ Démarrer la partie</button>
                </div>
              )}
              {status === 'en_cours' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={S.btnSmall('#6a2a2a')} onClick={() => terminerSession(st.id)}>⏹ Fin de partie</button>
                </div>
              )}
              {isPatron && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, paddingTop: 6, borderTop: '1px solid #2a2a4a' }}>
                  <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'station', item: st })}>✏️</button>
                  <button style={S.btnSmall('#5a2a2a')} onClick={() => supprimerProduit('station', st.id)}>🗑</button>
                </div>
              )}
            </div>
          )
        })}
        {isPatron && (
          <button style={{ ...S.btn('#2a4a2a'), width: '100%', padding: 12, marginTop: 6 }}
            onClick={() => setModal({ type: 'edit_produit', prodType: 'station', item: { nom: '', emoji: '🎮', prix1j: 500, prix2j: 1000 } })}>
            ＋ Ajouter une station
          </button>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — ACHATS
  // ============================================================
  function renderAchats() {
    const totalJ = achats.reduce((s, a) => s + a.prixTotal, 0)
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>📸 Enregistrer un achat</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={S.btn('#4a2a5a')} onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              {photoLoading ? '⏳ Analyse...' : '📷 Photo de facture'}
            </button>
            <button style={S.btn('#2a3a5a')} onClick={() => setModal({ type: 'achat_manuel' })}>
              ✏️ Saisie manuelle
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) analyserPhoto(e.target.files[0]) }} />
          <div style={{ fontSize: 11, color: '#6060a0', marginTop: 8 }}>
            📷 Prends en photo une facture fournisseur → l'IA lit et enregistre automatiquement
          </div>
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={S.h2}>📋 Achats du jour</span>
            <span style={{ fontSize: 13, color: '#ff8060', fontWeight: 'bold' }}>−{fmt(totalJ)}</span>
          </div>
          {achats.length === 0 && <div style={{ color: '#5a5a7a', fontSize: 12 }}>Aucun achat enregistré</div>}
          {achats.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #2a2a4a' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{a.nom}</div>
                <div style={{ fontSize: 11, color: '#7070b0' }}>{a.quantite} {a.unite} — {a.heure}</div>
              </div>
              <div style={{ color: '#ff8060', fontSize: 13, fontWeight: 'bold' }}>−{fmt(a.prixTotal)}</div>
              <button style={S.btnSmall('#5a2a2a')} onClick={() => setAchats(prev => prev.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — STOCKS
  // ============================================================
  function renderStocks() {
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>📦 Stock matin (en kg/unités)</div>
          {ingredients.map(ing => (
            <div key={ing.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
              <span style={{ width: 24, fontSize: 16 }}>{ing.emoji}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{ing.nom}</span>
              <input type="number" step="0.01" style={{ ...S.input, width: 80 }}
                value={stockMatin[ing.id] ?? ''}
                onChange={e => setStockMatin(prev => ({ ...prev, [ing.id]: parseFloat(e.target.value) || 0 }))}
                placeholder={`${ing.unite}`} />
              <span style={{ fontSize: 10, color: '#7070b0', width: 20 }}>{ing.unite}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.h2}>🍳 Production du jour</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button style={S.btnSmall('#2a4a2a')} onClick={() => setModal({ type: 'production' })}>
              ＋ Ajouter une production
            </button>
          </div>
          {productions.length === 0 && <div style={{ color: '#5a5a7a', fontSize: 12 }}>Aucune production enregistrée</div>}
          {productions.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #2a2a4a' }}>
              <span style={{ flex: 1, fontSize: 12 }}>{p.emoji} {p.nom} × {p.qte}</span>
              <button style={S.btnSmall('#5a2a2a')} onClick={() => setProductions(prev => prev.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.h2}>🌙 Stock soir (comptage physique)</div>
          {ingredients.map(ing => {
            const matin = stockMatin[ing.id] || 0
            const theorique = matin // simplifié — à affiner avec déduction recettes
            const soir = stockSoir[ing.id]
            const ecart = soir !== undefined ? soir - theorique : null
            return (
              <div key={ing.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                <span style={{ width: 24, fontSize: 16 }}>{ing.emoji}</span>
                <span style={{ flex: 1, fontSize: 12 }}>{ing.nom}</span>
                <input type="number" step="0.01" style={{ ...S.input, width: 80 }}
                  value={stockSoir[ing.id] ?? ''}
                  onChange={e => setStockSoir(prev => ({ ...prev, [ing.id]: parseFloat(e.target.value) || 0 }))}
                  placeholder="soir" />
                {ecart !== null && (
                  <span style={{ fontSize: 10, color: ecart < -0.05 ? '#ff6060' : '#50e090', width: 50 }}>
                    {ecart < -0.05 ? `⚠️ ${fmtKg(Math.abs(ecart))}` : '✅'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — BILAN
  // ============================================================
  function renderBilan() {
    const b = getBilan()
    return (
      <div>
        <div style={{ ...S.card, background: '#0f2a1f' }}>
          <div style={S.h2}>💰 Bilan du {today()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>🛒 CA Food ({ventes.length} ventes)</span>
              <span style={{ color: '#80e0a0', fontWeight: 'bold' }}>{fmt(b.caFood)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>🎮 CA Gaming ({gamingVentes.length} sessions)</span>
              <span style={{ color: '#80e0a0', fontWeight: 'bold' }}>{fmt(b.caGaming)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13 }}>📦 Achats fournisseurs</span>
              <span style={{ color: '#ff8060', fontWeight: 'bold' }}>−{fmt(b.totalAchats)}</span>
            </div>
            <div style={{ borderTop: '2px solid #3a5a3a', paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 16, fontWeight: 'bold' }}>✅ BÉNÉFICE NET</span>
              <span style={{ fontSize: 18, fontWeight: 'bold', color: b.net >= 0 ? '#90e050' : '#ff6060' }}>{fmt(b.net)}</span>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>📱 Rapport WhatsApp</div>
          <button style={{ ...S.btn('#25a25a'), width: '100%', padding: 12 }} onClick={rapportWhatsApp}>
            📋 Copier le rapport
          </button>
        </div>
        {isPatron && (
          <div style={S.card}>
            <div style={S.h2}>🏪 Boutique</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Limamoulaye', 'Guédiawaye 2', 'Pikine', 'Paris'].map(b => (
                <button key={b} style={{ ...S.btnSmall(boutique === b ? '#4a4a8a' : '#2a2a4a') }} onClick={() => setBoutique(b)}>
                  {boutique === b ? '✓ ' : ''}{b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — PRODUITS (patron)
  // ============================================================
  function renderProduits() {
    return (
      <div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={S.h2}>☕ Boissons</div>
            <button style={S.btnSmall('#2a4a2a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'boisson', item: { nom: '', emoji: '☕', prix: 200 } })}>＋ Ajouter</button>
          </div>
          {boissons.map(b => (
            <div key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #2a2a4a' }}>
              <span style={{ fontSize: 20 }}>{b.emoji}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{b.nom}</span>
              <span style={{ fontSize: 12, color: '#80e0a0' }}>{fmt(b.prix)}</span>
              <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'boisson', item: b })}>✏️</button>
              <button style={S.btnSmall('#5a2a2a')} onClick={() => supprimerProduit('boisson', b.id)}>🗑</button>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={S.h2}>🥞 Snacks</div>
            <button style={S.btnSmall('#2a4a2a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'snack', item: { nom: '', emoji: '🥞', prix: 500 } })}>＋ Ajouter</button>
          </div>
          {snacks.map(s => (
            <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #2a2a4a' }}>
              <span style={{ fontSize: 20 }}>{s.emoji}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{s.nom}</span>
              <span style={{ fontSize: 12, color: '#80e0a0' }}>{fmt(s.prix)}</span>
              <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'snack', item: s })}>✏️</button>
              <button style={S.btnSmall('#5a2a2a')} onClick={() => supprimerProduit('snack', s.id)}>🗑</button>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={S.h2}>🌾 Ingrédients</div>
            <button style={S.btnSmall('#2a4a2a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'ingredient', item: { nom: '', emoji: '🌾', stock: 0, unite: 'kg', prixKg: 0 } })}>＋ Ajouter</button>
          </div>
          {ingredients.map(i => (
            <div key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #2a2a4a' }}>
              <span style={{ fontSize: 20 }}>{i.emoji}</span>
              <span style={{ flex: 1, fontSize: 12 }}>{i.nom}</span>
              <span style={{ fontSize: 11, color: '#7070b0' }}>{fmt(i.prixKg)}/{i.unite}</span>
              <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_produit', prodType: 'ingredient', item: i })}>✏️</button>
              <button style={S.btnSmall('#5a2a2a')} onClick={() => supprimerProduit('ingredient', i.id)}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — RECETTES (patron)
  // ============================================================
  function renderRecettes() {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button style={S.btnSmall('#2a4a2a')} onClick={() => setModal({ type: 'edit_recette', item: { nom: '', emoji: '🥞', ingredients: [] } })}>
            ＋ Nouvelle recette
          </button>
        </div>
        {recettes.map(r => {
          const cout = r.ingredients.reduce((s, ri) => {
            const ing = ingredients.find(x => x.id === ri.id)
            return s + (ing ? ri.qte * ing.prixKg : 0)
          }, 0)
          return (
            <div key={r.id} style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 13 }}>{r.nom}</div>
                  <div style={{ fontSize: 11, color: '#9090b0' }}>Coût de revient: {fmt(Math.round(cout))}</div>
                </div>
                <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_recette', item: r })}>✏️</button>
                <button style={S.btnSmall('#5a2a2a')} onClick={() => supprimerProduit('recette', r.id)}>🗑</button>
              </div>
              {r.ingredients.map((ri, i) => {
                const ing = ingredients.find(x => x.id === ri.id)
                return (
                  <div key={i} style={{ fontSize: 11, color: '#7070b0', paddingLeft: 32 }}>
                    • {ing ? ing.emoji + ' ' + ing.nom : '?'}: {fmtKg(ri.qte)}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — ÉQUIPE (patron)
  // ============================================================
  function renderEquipe() {
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>👑 Patron</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ flex: 1, fontSize: 13 }}>PIN Patron</span>
            <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'change_pin', who: 'patron' })}>Changer PIN</button>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.h2}>👥 Employés</div>
          {pins.employes.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #2a2a4a' }}>
              <span style={{ fontSize: 20 }}>👤</span>
              <span style={{ flex: 1, fontSize: 13 }}>{e.nom}</span>
              <button style={S.btnSmall('#2a2a5a')} onClick={() => setModal({ type: 'edit_employe', employe: e, idx: i })}>✏️</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — AUDIT (patron)
  // ============================================================
  function renderAudit() {
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>🔍 Journal d'audit — {today()}</div>
          {audit.length === 0 && <div style={{ color: '#5a5a7a', fontSize: 12 }}>Aucune action enregistrée</div>}
          {[...audit].reverse().map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid #1a1a3a', fontSize: 11 }}>
              <span style={{ color: '#5a5a8a', minWidth: 40 }}>{a.heure}</span>
              <span style={{ color: '#8080c0', minWidth: 70 }}>{a.who}</span>
              <span style={{ color: a.action.includes('SANS TICKET') ? '#ff6060' : '#c0c0e0', flex: 1 }}>{a.action}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — IA
  // ============================================================
  function renderIA() {
    return (
      <div>
        <div style={S.card}>
          <div style={S.h2}>🤖 Assistant IA</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {['Analyse mes ventes', 'Optimise mes stocks', 'Donne-moi 3 conseils', 'Compare cette semaine'].map(q => (
              <button key={q} style={S.btnSmall('#2a2a5a')} onClick={() => envoyerIA(q)}>{q}</button>
            ))}
          </div>
          <div style={{ background: '#12122a', borderRadius: 8, padding: 8, minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 8 }}>
            {iaMessages.length === 0 && <div style={{ color: '#5a5a7a', fontSize: 12, textAlign: 'center', marginTop: 80 }}>Pose-moi une question sur ton business !</div>}
            {iaMessages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={{ display: 'inline-block', background: m.role === 'user' ? '#2a4a2a' : '#2a2a4a', borderRadius: 8, padding: '6px 10px', maxWidth: '85%', fontSize: 12, textAlign: 'left' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {iaLoading && <div style={{ color: '#7070b0', fontSize: 12 }}>⏳ Analyse en cours...</div>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input style={{ ...S.input, flex: 1 }} value={iaInput} onChange={e => setIaInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && envoyerIA(iaInput)}
              placeholder="Pose une question..." />
            <button style={S.btn('#4a4a8a')} onClick={() => envoyerIA(iaInput)}>▶</button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER ONGLET — GUIDE
  // ============================================================
  function renderGuide() {
    const sections = [
      { emoji: '🔑', titre: 'Se connecter', texte: 'Entrez votre PIN à 4 chiffres sur l\'écran d\'accueil. PIN Patron: 1234. Employés: voir votre responsable.' },
      { emoji: '🛒', titre: 'Encaisser', texte: 'Onglet Caisse → tapez les produits → le panier s\'affiche → appuyez "Ticket" → imprimez → validé.' },
      { emoji: '🎮', titre: 'Gaming', texte: 'Choisissez durée + joueurs → ticket s\'affiche → client paie → appuyez "Démarrer" quand la partie commence.' },
      { emoji: '📸', titre: 'Achats matin', texte: 'Onglet Achats → photo de facture → l\'IA lit automatiquement → confirmer. Ou saisie manuelle.' },
      { emoji: '📦', titre: 'Stock matin', texte: 'Onglet Stocks → entrez la quantité de chaque ingrédient disponible ce matin (en kg).' },
      { emoji: '📊', titre: 'Rapport soir', texte: 'Onglet Bilan → "Copier le rapport" → collez dans WhatsApp pour le patron.' },
      { emoji: '🚫', titre: 'Interdit', texte: 'Ne JAMAIS: annuler une vente sans le patron, donner le PIN à quelqu\'un, encaisser sans ticket.' },
    ]
    return (
      <div>
        {sections.map((s, i) => (
          <div key={i} style={S.card}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 28 }}>{s.emoji}</span>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>{s.titre}</div>
                <div style={{ fontSize: 12, color: '#a0a0c0', lineHeight: 1.5 }}>{s.texte}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ============================================================
  // MODALS
  // ============================================================
  function renderModal() {
    if (!modal) return null
    const close = () => setModal(null)

    // TICKET
    if (ticketVisible && ticketData) {
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>🎫</div>
              <div style={{ fontWeight: 'bold', fontSize: 16 }}>Ticket #{ticketData.num}</div>
              <div style={{ fontSize: 11, color: '#7070b0' }}>{ticketData.heure}</div>
            </div>
            {ticketData.items.map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                <span>{it.emoji} {it.nom} ×{it.qte}</span>
                <span style={{ color: '#80e0a0' }}>{fmt(it.prix * it.qte)}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #3a3a6a', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>TOTAL</span>
              <span style={{ color: '#80e0a0' }}>{fmt(ticketData.total)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => { imprimerTicket(); setTicketVisible(false); setTicketData(null) }}>🖨️ Imprimer</button>
              <button style={{ ...S.btnSmall('#3a3a3a'), padding: '8px 12px' }} onClick={() => { setTicketVisible(false); setTicketData(null) }}>Fermer</button>
            </div>
          </div>
        </div>
      )
    }

    // CONFIRM ACHATS (depuis photo IA)
    if (modal.type === 'confirm_achats') {
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>📸 Achats détectés</div>
            {modal.data.map((a, i) => (
              <div key={i} style={{ padding: '4px 0', fontSize: 12, borderBottom: '1px solid #2a2a4a' }}>
                {a.nom} — {a.quantite}{a.unite} — {fmt(a.prixTotal)}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => confirmerAchats(modal.data)}>✅ Confirmer</button>
              <button style={S.btnSmall('#5a2a2a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // ACHAT MANUEL
    if (modal.type === 'achat_manuel') {
      const [form, setForm] = useState({ nom: '', quantite: '', unite: 'kg', prixTotal: '' })
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>✏️ Saisie achat</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={S.label}>Produit</label><input style={S.input} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} placeholder="Ex: Farine" /></div>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1 }}><label style={S.label}>Quantité</label><input type="number" style={S.input} value={form.quantite} onChange={e => setForm(f => ({ ...f, quantite: e.target.value }))} /></div>
                <div style={{ width: 70 }}>
                  <label style={S.label}>Unité</label>
                  <select style={S.input} value={form.unite} onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}>
                    <option>kg</option><option>g</option><option>L</option><option>u</option>
                  </select>
                </div>
              </div>
              <div><label style={S.label}>Prix total (FCFA)</label><input type="number" style={S.input} value={form.prixTotal} onChange={e => setForm(f => ({ ...f, prixTotal: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => { if (form.nom) { confirmerAchats([form]); close() } }}>✅ Ajouter</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // PRODUCTION
    if (modal.type === 'production') {
      const [selRec, setSelRec] = useState('')
      const [qte, setQte] = useState('')
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>🍳 Enregistrer une production</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={S.label}>Produit</label>
                <select style={S.input} value={selRec} onChange={e => setSelRec(e.target.value)}>
                  <option value="">-- Choisir --</option>
                  {recettes.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.nom}</option>)}
                  <option value="custom">Autre...</option>
                </select>
              </div>
              <div><label style={S.label}>Quantité produite</label><input type="number" style={S.input} value={qte} onChange={e => setQte(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => {
                if (!selRec || !qte) return
                const rec = recettes.find(r => r.id === selRec)
                const nom = rec ? rec.nom : 'Autre'
                const emoji = rec ? rec.emoji : '🍳'
                setProductions(prev => [...prev, { nom, emoji, qte: parseInt(qte), recId: selRec, heure: now() }])
                logAudit(`Production: ${nom} × ${qte}`)
                close()
              }}>✅ Enregistrer</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // EDIT PRODUIT (boisson/snack/station/ingredient)
    if (modal.type === 'edit_produit') {
      const [form, setForm] = useState({ ...modal.item })
      const [showEmoji, setShowEmoji] = useState(false)
      const isNew = !form.id
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>{isNew ? '＋ Nouveau' : '✏️ Modifier'} {modal.prodType}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={S.label}>Emoji</label>
                <button style={{ background: '#252545', border: '1px solid #4a4a8a', borderRadius: 8, padding: '8px 16px', fontSize: 24, cursor: 'pointer' }}
                  onClick={() => setShowEmoji(!showEmoji)}>{form.emoji || '?'}</button>
                {showEmoji && (
                  <div style={{ background: '#12122a', borderRadius: 8, padding: 8, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
                    {EMOJIS.map(e => (
                      <button key={e} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 2 }}
                        onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmoji(false) }}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <div><label style={S.label}>Nom</label><input style={S.input} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
              {(modal.prodType === 'boisson' || modal.prodType === 'snack') && (
                <div><label style={S.label}>Prix (FCFA)</label><input type="number" style={S.input} value={form.prix} onChange={e => setForm(f => ({ ...f, prix: parseInt(e.target.value) || 0 }))} /></div>
              )}
              {modal.prodType === 'station' && (
                <>
                  <div><label style={S.label}>Prix 1 joueur / 30min (FCFA)</label><input type="number" style={S.input} value={form.prix1j} onChange={e => setForm(f => ({ ...f, prix1j: parseInt(e.target.value) || 0 }))} /></div>
                  <div><label style={S.label}>Prix 2 joueurs / 30min (FCFA)</label><input type="number" style={S.input} value={form.prix2j} onChange={e => setForm(f => ({ ...f, prix2j: parseInt(e.target.value) || 0 }))} /></div>
                </>
              )}
              {modal.prodType === 'ingredient' && (
                <>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1 }}><label style={S.label}>Stock actuel</label><input type="number" step="0.01" style={S.input} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseFloat(e.target.value) || 0 }))} /></div>
                    <div style={{ width: 70 }}>
                      <label style={S.label}>Unité</label>
                      <select style={S.input} value={form.unite} onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}>
                        <option>kg</option><option>g</option><option>L</option><option>u</option>
                      </select>
                    </div>
                  </div>
                  <div><label style={S.label}>Prix d'achat / unité (FCFA)</label><input type="number" style={S.input} value={form.prixKg} onChange={e => setForm(f => ({ ...f, prixKg: parseInt(e.target.value) || 0 }))} /></div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => sauvegarderProduit({ type: modal.prodType, item: form })}>✅ Sauvegarder</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // EDIT RECETTE
    if (modal.type === 'edit_recette') {
      const [form, setForm] = useState({ ...modal.item, ingredients: [...(modal.item.ingredients || [])] })
      const [showEmoji, setShowEmoji] = useState(false)
      const isNew = !form.id
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>{isNew ? '＋ Nouvelle' : '✏️ Modifier'} recette</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={S.label}>Emoji</label>
                <button style={{ background: '#252545', border: '1px solid #4a4a8a', borderRadius: 8, padding: '8px 16px', fontSize: 24, cursor: 'pointer' }}
                  onClick={() => setShowEmoji(!showEmoji)}>{form.emoji || '?'}</button>
                {showEmoji && (
                  <div style={{ background: '#12122a', borderRadius: 8, padding: 8, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 100, overflowY: 'auto' }}>
                    {EMOJIS.map(e => (
                      <button key={e} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 2 }}
                        onClick={() => { setForm(f => ({ ...f, emoji: e })); setShowEmoji(false) }}>{e}</button>
                    ))}
                  </div>
                )}
              </div>
              <div><label style={S.label}>Nom de la recette</label><input style={S.input} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
              <div style={S.h3}>Ingrédients</div>
              {form.ingredients.map((ri, i) => {
                const ing = ingredients.find(x => x.id === ri.id)
                return (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select style={{ ...S.input, flex: 1 }} value={ri.id} onChange={e => {
                      const newIngs = [...form.ingredients]
                      newIngs[i] = { ...newIngs[i], id: e.target.value }
                      setForm(f => ({ ...f, ingredients: newIngs }))
                    }}>
                      {ingredients.map(x => <option key={x.id} value={x.id}>{x.emoji} {x.nom}</option>)}
                    </select>
                    <input type="number" step="0.001" style={{ ...S.input, width: 80 }} value={ri.qte} onChange={e => {
                      const newIngs = [...form.ingredients]
                      newIngs[i] = { ...newIngs[i], qte: parseFloat(e.target.value) || 0 }
                      setForm(f => ({ ...f, ingredients: newIngs }))
                    }} placeholder="kg" />
                    <span style={{ fontSize: 9, color: '#6a6a8a' }}>{ing ? ing.unite : 'kg'}</span>
                    <button style={S.btnSmall('#5a2a2a')} onClick={() => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, j) => j !== i) }))}>✕</button>
                  </div>
                )
              })}
              <button style={S.btnSmall('#2a3a5a')} onClick={() => setForm(f => ({ ...f, ingredients: [...f.ingredients, { id: ingredients[0]?.id || '', qte: 0 }] }))}>
                ＋ Ajouter ingrédient
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => sauvegarderProduit({ type: 'recette', item: form })}>✅ Sauvegarder</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // EDIT EMPLOYE
    if (modal.type === 'edit_employe') {
      const [form, setForm] = useState({ nom: modal.employe.nom, pin: '' })
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>✏️ Modifier employé</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={S.label}>Nom</label><input style={S.input} value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
              <div><label style={S.label}>Nouveau PIN (4 chiffres)</label><input type="password" maxLength={4} style={S.input} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} placeholder="Laisser vide = inchangé" /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => {
                setPins(prev => ({
                  ...prev,
                  employes: prev.employes.map((e, i) => i === modal.idx ? { ...e, nom: form.nom, pin: form.pin || e.pin } : e)
                }))
                logAudit('Modification employé: ' + form.nom)
                close()
              }}>✅ Sauvegarder</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    // CHANGE PIN PATRON
    if (modal.type === 'change_pin') {
      const [p1, setP1] = useState('')
      const [p2, setP2] = useState('')
      return (
        <div style={S.overlay}>
          <div style={S.modalBox}>
            <div style={S.h2}>🔑 Changer le PIN Patron</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><label style={S.label}>Nouveau PIN</label><input type="password" maxLength={4} style={S.input} value={p1} onChange={e => setP1(e.target.value)} /></div>
              <div><label style={S.label}>Confirmer</label><input type="password" maxLength={4} style={S.input} value={p2} onChange={e => setP2(e.target.value)} /></div>
              {p1 && p2 && p1 !== p2 && <div style={{ color: '#ff6060', fontSize: 12 }}>Les PINs ne correspondent pas</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...S.btn('#2a4a2a'), flex: 1 }} onClick={() => {
                if (p1 === p2 && p1.length === 4) { setPins(prev => ({ ...prev, patron: p1 })); logAudit('PIN patron modifié'); close() }
              }}>✅ Changer</button>
              <button style={S.btnSmall('#3a3a3a')} onClick={close}>Annuler</button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  const sessionCount = Object.values(sessions).filter(s => s.status === 'en_cours').length
  const paidCount = Object.values(sessions).filter(s => s.status === 'paye').length

  return (
    <div style={S.app} onClick={resetLock}>
      <div style={S.header}>
        <span style={{ fontSize: 20 }}>🎮</span>
        <span style={S.headerTitle}>Game & Gaufre</span>
        <span style={{ fontSize: 11, color: '#7070b0' }}>{userName}</span>
        {sessionCount > 0 && <span style={{ ...S.badge('#4a2a2a'), fontSize: 10 }}>🎮 {sessionCount}</span>}
        {paidCount > 0 && <span style={{ ...S.badge('#4a4a2a'), fontSize: 10 }}>💰 {paidCount}</span>}
        <button style={{ background: 'none', border: 'none', color: '#7070b0', cursor: 'pointer', fontSize: 16 }}
          onClick={() => { setUser(null); setPinInput('') }}>⎋</button>
      </div>
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(onglet === t.id)} onClick={() => setOnglet(t.id)}>
            <span style={S.tabEmoji}>{t.emoji}</span>
            <span style={S.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={S.body}>
        {onglet === 'accueil' && renderAccueil()}
        {onglet === 'caisse' && renderCaisse()}
        {onglet === 'gaming' && renderGaming()}
        {onglet === 'achats' && renderAchats()}
        {onglet === 'stocks' && renderStocks()}
        {onglet === 'bilan' && renderBilan()}
        {onglet === 'recettes' && isPatron && renderRecettes()}
        {onglet === 'produits' && isPatron && renderProduits()}
        {onglet === 'equipe' && isPatron && renderEquipe()}
        {onglet === 'audit' && isPatron && renderAudit()}
        {onglet === 'ia' && renderIA()}
        {onglet === 'guide' && renderGuide()}
      </div>
      {ticketVisible ? renderModal() : modal ? renderModal() : null}
    </div>
  )
}
