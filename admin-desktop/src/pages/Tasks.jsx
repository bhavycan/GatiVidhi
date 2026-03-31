import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, CheckSquare, Clock, AlertCircle, Search } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  'ongoing':      'badge-pending',
  'completed':    'badge-completed',
  'not started':  'badge-on-hold',
}

export default function Tasks() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [taskLists, setTaskLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/task/all`, { withCredentials: true })
      .then(res => { setTaskLists(res.data.taskLists || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const allTasks = taskLists.flatMap(list =>
    (list.tasks || []).map(t => ({
      ...t,
      projectName: list.projectId?.projectName || 'Unknown',
    }))
  )

  const filtered = allTasks.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    ongoing: allTasks.filter(t => t.status === 'ongoing').length,
    notStarted: allTasks.filter(t => t.status === 'not started').length,
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          <p className="text-xs text-gray-400 mt-0.5">All tasks across projects</p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> Add Task</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, icon: CheckSquare, color: '#883bbc' },
          { label: 'Ongoing', value: counts.ongoing, icon: Clock, color: '#f59e0b' },
          { label: 'Completed', value: counts.completed, icon: CheckSquare, color: '#10b981' },
          { label: 'Not Started', value: counts.notStarted, icon: AlertCircle, color: '#6b7280' },
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

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'not started', 'ongoing', 'completed'].map(s => (
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

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Task</th><th>Project</th><th>Status</th><th>Due Date</th></tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="cursor-pointer">
                <td className="font-semibold text-gray-800 text-xs">{t.name}</td>
                <td>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                    {t.projectName}
                  </span>
                </td>
                <td>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyles[t.status] || 'badge-on-hold'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="text-xs text-gray-500">
                  {t.date ? new Date(t.date).toLocaleDateString('en-IN') : '—'}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
