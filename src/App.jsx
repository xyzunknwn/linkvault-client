import { useState } from 'react'
import axios from 'axios'

const API = axios.create({ baseURL: 'https://link-vault-k9li.onrender.com/' })
const SHORT_BASE = 'https://link-vault-k9li.onrender.com/'

// Wireframe gear outline (purely decorative)
function gearPath(teeth, rOuter, rInner) {
  const pts = []
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const o = [
      [a - step * 0.28, rInner],
      [a - step * 0.16, rOuter],
      [a + step * 0.16, rOuter],
      [a + step * 0.28, rInner],
    ]
    o.forEach(([t, r]) => pts.push(`${(r * Math.cos(t)).toFixed(2)},${(r * Math.sin(t)).toFixed(2)}`))
  }
  return `M${pts.join('L')}Z`
}

function Gear({ className, teeth = 16, size = 200 }) {
  const rOuter = size / 2
  const rInner = rOuter * 0.86
  return (
    <svg
      className={`bg-gear ${className}`}
      viewBox={`${-rOuter - 2} ${-rOuter - 2} ${size + 4} ${size + 4}`}
      aria-hidden="true"
    >
      <path d={gearPath(teeth, rOuter, rInner)} />
      <circle r={rInner * 0.68} />
      <circle r={rInner * 0.2} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line key={deg} x1="0" y1={rInner * 0.2} x2="0" y2={rInner * 0.68} transform={`rotate(${deg})`} />
      ))}
    </svg>
  )
}

function TechBackground() {
  return (
    <div className="tech-bg" aria-hidden="true">
      <svg className="bg-grid" width="100%" height="100%">
        <defs>
          <pattern id="dotgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#444444" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotgrid)" />
      </svg>
      <Gear className="gear-a" teeth={18} size={360} />
      <Gear className="gear-b" teeth={12} size={240} />
      <Gear className="gear-c" teeth={14} size={180} />
      <svg className="bg-circuit" viewBox="0 0 400 200" aria-hidden="true">
        <path d="M0 40H80L110 70H220L250 40H400" />
        <path d="M0 100H60L90 130H180V170H320L350 140H400" />
        <path d="M120 0V30L150 60H260" />
        <circle cx="80" cy="40" r="4" />
        <circle cx="220" cy="70" r="4" />
        <circle cx="180" cy="170" r="4" />
        <circle cx="350" cy="140" r="4" />
      </svg>
    </div>
  )
}

export default function App() {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [genError, setGenError] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const [lookupId, setLookupId] = useState('')
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState('')

  const shorten = async (e) => {
    e.preventDefault()
    setGenError('')
    setShortUrl('')
    setCopied(false)
    setLoading(true)
    try {
      const payload = { originalUrl: url }
      if (customAlias.trim()) payload.customAlias = customAlias.trim()
      // datetime-local has no timezone; convert to an ISO UTC string
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString()
      const { data } = await API.post('/api/shorten', payload)
      setShortUrl(`${SHORT_BASE}${data.shortId}`)
    } catch (err) {
      setGenError(err.response?.data?.error || 'Failed to shorten URL')
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lookup = async (e) => {
    e.preventDefault()
    setStats(null)
    setStatsError('')
    try {
      const { data } = await API.get(`/api/analytics/${lookupId.trim()}`)
      setStats(data)
    } catch (err) {
      setStatsError(err.response?.data?.error || 'Failed to fetch analytics')
    }
  }

  return (
    <div className="page">
      <TechBackground />
      <div className="container">
        <h1 className="title">LinkVault</h1>

        <section className="card">
          <h2>Shorten a URL</h2>
          <form onSubmit={shorten} className="stack">
            <div>
              <label className="label" htmlFor="url">Long URL</label>
              <input
                id="url"
                type="url"
                required
                className="input"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="alias">Custom alias (optional)</label>
              <div className="prefix-group">
                <span className="prefix">{SHORT_BASE}</span>
                <input
                  id="alias"
                  className="input"
                  placeholder="my-alias"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="expires">Expires at (optional)</label>
              <input
                id="expires"
                type="datetime-local"
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <button className="btn" disabled={loading}>
              {loading ? '...' : 'Shorten'}
            </button>
          </form>
          {genError && <p className="error">{genError}</p>}
          {shortUrl && (
            <div className="result">
              <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
              <button onClick={copy} className="btn">
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Dashboard</h2>
          <form onSubmit={lookup} className="row">
            <input
              required
              className="input"
              placeholder="Enter short ID (e.g. ab12cd)"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
            <button className="btn">Get Stats</button>
          </form>
          {statsError && <p className="error">{statsError}</p>}
          {stats && (
            <table>
              <thead>
                <tr>
                  <th>Short ID</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{stats.shortId}</td>
                  <td>{stats.originalUrl}</td>
                  <td>{stats.clicks}</td>
                  <td>{new Date(stats.createdAt).toLocaleString()}</td>
                  <td>{stats.expiresAt ? new Date(stats.expiresAt).toLocaleString() : 'Never'}</td>
                </tr>
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
