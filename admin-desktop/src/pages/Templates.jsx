import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Trash2 } from 'lucide-react'

const BASE_URL = 'http://localhost:3000'

const typeColors = {
  residential: 'bg-purple-50 text-purple-700',
  commercial: 'bg-blue-50 text-blue-700',
  hospitality: 'bg-amber-50 text-amber-700',
}

export default function Templates() {
  const [search, setSearch] = useState('')
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/template/all`, { withCredentials: true })
      .then(res => { setTemplates(res.data.templates || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    if (!id) return alert('Cannot delete a default template')
    if (!window.confirm('Delete this template?')) return
    try {
      await axios.post(`${BASE_URL}/api/template/delete`, { id }, { withCredentials: true })
      setTemplates(prev => prev.filter(t => t._id !== id))
    } catch (err) { alert(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.type?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Templates</h2>
          <p className="text-xs text-gray-400 mt-0.5">Reusable design templates for new projects</p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> New Template</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={14} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t._id || t.name} className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl" style={{ background: '#883bbc22' }} />
              {t._id && (
                <button onClick={() => handleDelete(t._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 size={13}/>
                </button>
              )}
            </div>
            <div className="font-bold text-gray-900 text-sm mb-1">{t.name}</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${typeColors[t.type?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
              {t.type}
            </span>
            <div className="mt-3 text-xs text-gray-500">{(t.tasks || []).length} tasks</div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-3 text-center text-xs text-gray-400 py-8">No templates found</div>
        )}
      </div>
    </div>
  )
}
