
const OWNER = 'msparis77'
const REPO = 'game-gaufre'
const TOKEN = process.env.GITHUB_TOKEN
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data`

   export default async function handler(req, res) {
     
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
      const url = `${BASE}/${k}.json`
      const content = Buffer.from(JSON.stringify(data)).toString('base64')
      let lastErr = null
      for (let attempt = 0; attempt < 5; attempt++) {
        let sha = null
        const check = await fetch(url, { headers })
        if (check.ok) { const ex = await check.json(); sha = ex.sha }
        const r = await fetch(url, {
          method: 'PUT', headers,
          body: JSON.stringify({ message: `update ${k}`, content, ...(sha ? { sha } : {}) })
        })
        if (r.ok) return res.status(200).json({ ok: true })
        const e = await r.json().catch(()=>({}))
        lastErr = e
        const isConflict = r.status === 409 || r.status === 422 || /does not match|is at .* but expected|sha/i.test(e.message||'')
        if (!isConflict) return res.status(500).json({ error: e.message || 'write failed' })
        await new Promise(r2=>setTimeout(r2, 150*(attempt+1)+Math.random()*150))
      }
      return res.status(500).json({ error: (lastErr&&lastErr.message) || 'write failed after retries' })
    }
  } catch (e) { return res.status(500).json({ error: e.message }) }
  return res.status(405).end()
}
