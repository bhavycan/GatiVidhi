import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter, Plus, Edit2, Trash2 } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  ongoing: 'badge-active', completed: 'badge-completed',
  pending: 'badge-pending', overdue: 'badge-overdue', 'on-hold': 'badge-on-hold',
}

export default function Projects() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/project/all`, { withCredentials: true })
      .then(res => { setProjects(res.data.projects || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await axios.post(`${BASE_URL}/api/project/delete`, { id }, { withCredentials: true })
      setProjects(prev => prev.filter(p => p._id !== id))
    } catch (err) { alert(err.response?.data || 'Delete failed') }
  }

  const filtered = projects.filter(p => {
    const clientName = p.clientId?.name || ''
    const matchSearch = p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projects</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${projects.length} total projects`}
          </p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> New Project</button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Filter size={13} className="text-gray-400" />
          <select className="bg-transparent outline-none text-sm text-gray-700"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} projects</span>
      </div>

      {error && <div className="text-xs text-red-500 px-1">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Project</th><th>Client</th><th>Status</th><th>Start Date</th><th>Due Date</th><th>Rooms</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id} className="cursor-pointer">
                <td>
                  <div className="font-semibold text-gray-800 text-xs">{p.projectName}</div>
                  <div className="text-gray-400 text-[10px] font-mono">{p._id?.slice(-6).toUpperCase()}</div>
                </td>
                <td className="text-gray-600 text-xs">{p.clientId?.name || '—'}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyles[p.status] || 'badge-pending'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="text-xs text-gray-500">{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="text-xs text-gray-500">{p.estimatedEndDate ? new Date(p.estimatedEndDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="text-xs text-gray-600">{p.totalRooms || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-xs text-gray-400 py-8">No projects found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
