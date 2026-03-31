import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, CheckCircle2, MessageSquare } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const priorityColors = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  normal: 'bg-blue-50 text-blue-600',
  low:    'bg-green-50 text-green-600',
}

export default function Tickets() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/comment/all`, { withCredentials: true })
      .then(res => { setTickets(res.data.comments || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const handleResolve = async (id) => {
    try {
      await axios.patch(`${BASE_URL}/api/comment/${id}/resolve`, {}, { withCredentials: true })
      setTickets(prev => prev.map(t => t._id === id ? { ...t, resolved: true } : t))
    } catch (err) { alert(err.response?.data || 'Failed to resolve') }
  }

  const filtered = tickets.filter(t => {
    const matchFilter = filter === 'all' || (filter === 'open' ? !t.resolved : t.resolved)
    const matchSearch = t.note?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const openCount = tickets.filter(t => !t.resolved).length
  const resolvedCount = tickets.filter(t => t.resolved).length

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${openCount} open · ${resolvedCount} resolved`}
          </p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> New Ticket</button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors capitalize
                ${filter === s ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:border-purple-300'}`}
              style={filter === s ? { background: '#883bbc' } : {}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t._id} className="bg-white rounded-2xl p-5 card-shadow flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: t.resolved ? '#10b98118' : '#883bbc18' }}>
              <MessageSquare size={14} style={{ color: t.resolved ? '#10b981' : '#883bbc' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[t.priorityLevel] || 'bg-gray-100 text-gray-600'}`}>
                  {t.priorityLevel}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.resolved ? 'badge-completed' : 'badge-pending'}`}>
                  {t.resolved ? 'resolved' : 'open'}
                </span>
              </div>
              <div className="text-sm text-gray-800 font-medium">{t.note}</div>
              <div className="text-xs text-gray-400 mt-1">
                {t.receivedDate ? new Date(t.receivedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
            {!t.resolved && (
              <button onClick={() => handleResolve(t._id)}
                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 flex-shrink-0">
                <CheckCircle2 size={13}/> Resolve
              </button>
            )}
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">No tickets found</div>
        )}
      </div>
    </div>
  )
}
