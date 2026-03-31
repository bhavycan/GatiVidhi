import { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle2, XCircle, Clock, Search } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  approved: 'badge-active',
  pending:  'badge-pending',
  rejected: 'badge-overdue',
}

const priorityColors = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low:    'bg-green-50 text-green-600',
}

export default function Approvals() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/approval/all`, { withCredentials: true })
      .then(res => { setApprovals(res.data.approvals || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const filtered = approvals.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.projectName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Approvals</h2>
          <p className="text-xs text-gray-400 mt-0.5">Client approval requests across all projects</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: counts.pending, icon: Clock, color: '#f59e0b' },
          { label: 'Approved', value: counts.approved, icon: CheckCircle2, color: '#10b981' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{loading ? '—' : value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            placeholder="Search approvals…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors capitalize
                ${filter === s ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:border-purple-300'}`}
              style={filter === s ? { background: '#883bbc' } : {}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a._id} className="bg-white rounded-2xl p-5 card-shadow flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm truncate">{a.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColors[a.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {a.priority}
                </span>
              </div>
              <div className="text-xs text-gray-400">{a.projectName}</div>
              {a.note && <div className="text-xs text-gray-500 mt-1 italic">"{a.note}"</div>}
              {a.clientNote && <div className="text-xs text-blue-500 mt-1">Client: "{a.clientNote}"</div>}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[a.status]}`}>
                {a.status}
              </span>
              <span className="text-[10px] text-gray-400">{a.images?.length || 0} images</span>
              <span className="text-[10px] text-gray-400">
                {a.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}
              </span>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">No approvals found</div>
        )}
      </div>
    </div>
  )
}
