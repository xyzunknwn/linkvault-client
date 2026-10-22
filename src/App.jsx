import { useState } from 'react'
import axios from 'axios'

const API = axios.create({ baseURL: 'https://link-vault-k9li.onrender.com' })

export default function App() {
  const [url, setUrl] = useState('')
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
      const { data } = await API.post('/api/shorten', { originalUrl: url })
      setShortUrl(`${API.defaults.baseURL}/${data.shortId}`)
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

  const input = 'flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const btn = 'rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50'

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-center text-4xl font-bold text-indigo-700">LinkVault</h1>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Shorten a URL</h2>
          <form onSubmit={shorten} className="flex gap-2">
            <input
              type="url"
              required
              className={input}
              placeholder="https://example.com/very/long/url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className={btn} disabled={loading}>
              {loading ? '...' : 'Shorten'}
            </button>
          </form>
          {genError && <p className="mt-3 text-red-600">{genError}</p>}
          {shortUrl && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
              <a href={shortUrl} target="_blank" rel="noreferrer" className="flex-1 truncate text-indigo-600 underline">
                {shortUrl}
              </a>
              <button onClick={copy} className={btn}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Dashboard</h2>
          <form onSubmit={lookup} className="flex gap-2">
            <input
              required
              className={input}
              placeholder="Enter short ID (e.g. ab12cd)"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
            <button className={btn}>Get Stats</button>
          </form>
          {statsError && <p className="mt-3 text-red-600">{statsError}</p>}
          {stats && (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="border-b text-slate-500">
                <tr>
                  <th className="py-2">Short ID</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 font-mono">{stats.shortId}</td>
                  <td className="max-w-[200px] truncate">{stats.originalUrl}</td>
                  <td className="font-semibold">{stats.clicks}</td>
                  <td>{new Date(stats.createdAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
