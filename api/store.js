
const OWNER = 'msparis77'
const REPO = 'game-gaufre'
const TOKEN = process.env.GITHUB_TOKEN
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data`

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  }

  try {
    if (req.method === 'GET') {
      const key = (req.query.key || '').replace(/[^a-zA-Z0-9_-]/g, '_')
      if (!key) return res.status(200).json(null)
      const r = await fetch(`${BASE}/${key}.json`, { headers })
      if (!r.ok) return res.status(200).json(null)
      const d = await r.json()
      const content = JSON.parse(Buffer.from(d.content, 'base64').toString())
      return res.status(200).json(content)
    }
    if (req.method === 'POST') {
      const { key, data } = req.body || {}
      if (!key) return res.status(400).json({ error: 'key required' })
      const k = key.replace(/[^a-zA-Z0-9_-]/g, '_')
      const content = Buffer.from(JSON.stringify(data)).toString('base64')
      let sha = null
      const check = await fetch(`${BASE}/${k}.json`, { headers })
      if (check.ok) { const ex = await check.json(); sha = ex.sha }
      const r = await fetch(`${BASE}/${k}.json`, {
        method: 'PUT', headers,
        body: JSON.stringify({ message: `update ${k}`, content, ...(sha ? { sha } : {}) })
      })
      if (!r.ok) { const e = await r.json(); return res.status(500).json({ error: e.message }) }
      return res.status(200).json({ ok: true })
    }
  } catch (e) { return res.status(500).json({ error: e.message }) }
  return res.status(405).end()
}
