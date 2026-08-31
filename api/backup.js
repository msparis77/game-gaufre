const OWNER = 'msparis77'
const REPO = 'game-gaufre'
const TOKEN = process.env.GITHUB_TOKEN
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data`

export default async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers['authorization'] || ''
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: 'unauthorized' })
  }

  const headers = {
    'Authorization': `token ${TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  }

  try {
    const listR = await fetch(BASE, { headers })
    if (!listR.ok) { const e = await listR.json(); return res.status(500).json({ error: 'list failed: ' + e.message }) }
    const items = await listR.json()
    const files = {}
    for (const item of items) {
      if (item.type !== 'file' || !item.name.endsWith('.json')) continue
      const fr = await fetch(`${BASE}/${item.name}`, { headers })
      if (!fr.ok) continue
      const fd = await fr.json()
      try { files[item.name.replace(/\.json$/, '')] = JSON.parse(Buffer.from(fd.content, 'base64').toString()) }
      catch (e) {}
    }
    const dateStr = new Date().toISOString().split('T')[0]
    const backup = { date: dateStr, generatedAt: new Date().toISOString(), files }
    const content = Buffer.from(JSON.stringify(backup)).toString('base64')
    const backupUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/backups/backup-${dateStr}.json`
    let sha = null
    const check = await fetch(backupUrl, { headers })
    if (check.ok) { const ex = await check.json(); sha = ex.sha }
    const put = await fetch(backupUrl, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: `backup automatique ${dateStr}`, content, ...(sha ? { sha } : {}) })
    })
    if (!put.ok) { const e = await put.json(); return res.status(500).json({ error: e.message }) }
    return res.status(200).json({ ok: true, date: dateStr, filesCount: Object.keys(files).length })
  } catch (e) { return res.status(500).json({ error: e.message }) }
}
