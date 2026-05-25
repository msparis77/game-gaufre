
// Proxy stockage Firebase — même principe que chat.js pour l'IA
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const FB = 'https://firestore.googleapis.com/v1/projects/game-gaufre-dakar/databases/(default)/documents/game-gaufre-dakar'

  try {
    if (req.method === 'GET') {
      const key = (req.query.key || '').replace(/[^a-zA-Z0-9]/g, '_')
      if (!key) return res.status(400).json(null)
      const r = await fetch(`${FB}/${key}`)
      if (!r.ok) return res.status(200).json(null)
      const d = await r.json()
      const val = d.fields?.v?.stringValue ? JSON.parse(d.fields.v.stringValue) : null
      return res.status(200).json(val)
    }

    if (req.method === 'POST') {
      const { key, data } = req.body || {}
      if (!key) return res.status(400).json({ error: 'key required' })
      const k = key.replace(/[^a-zA-Z0-9]/g, '_')
      const r = await fetch(`${FB}/${k}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            v: { stringValue: JSON.stringify(data) },
            t: { integerValue: String(Date.now()) }
          }
        })
      })
      const d = await r.json()
      if (!r.ok) return res.status(200).json({ error: d.error?.message })
      return res.status(200).json({ ok: true })
    }
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
