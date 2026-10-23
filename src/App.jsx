import { useState } from 'react'
import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5001' })
const SHORT_BASE = 'https://link-vault-k9li.onrender.com/'

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
