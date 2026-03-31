import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Mail, HardHat, Edit2, Trash2 } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL
const avatarColors = ['#883bbc', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function Workers() {
  const [search, setSearch] = useState('')
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/worker/all`, { withCredentials: true })
      .then(res => { setWorkers(res.data.workers || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker?')) return
    try {
      await axios.post(`${BASE_URL}/api/worker/delete`, { id }, { withCredentials: true })
      setWorkers(prev => prev.filter(w => w._id !== id))
    } catch (err) { alert(err.response?.data || 'Delete failed') }
  }

  const filtered = workers.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Workers</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${workers.length} team members`}
          </p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> Add Worker</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={13} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search workers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="grid grid-cols-4 gap-4">
        {filtered.map((w, i) => (
          <div key={w._id} className="bg-white rounded-2xl p-6 card-shadow hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: avatarColors[i % avatarColors.length] }}>
                {initials(w.name)}
              </div>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                <button onClick={() => handleDelete(w._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="font-bold text-gray-900 text-sm mb-0.5">{w.name}</div>
            <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <HardHat size={11}/> Worker
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><Mail size={11} className="text-gray-400"/>{w.email}</div>
              {w.assignedProjectId && (
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium inline-block mt-1">
                  Assigned to project
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-4 text-center text-xs text-gray-400 py-8">No workers found</div>
        )}
      </div>
    </div>
  )
}
