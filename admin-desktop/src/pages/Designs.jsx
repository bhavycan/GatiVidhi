import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Trash2 } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

export default function Designs() {
  const [search, setSearch] = useState('')
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/design/all`, { withCredentials: true })
      .then(res => { setDesigns(res.data.designs || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this design?')) return
    try {
      await axios.post(`${BASE_URL}/design/delete`, { id }, { withCredentials: true })
      setDesigns(prev => prev.filter(d => d._id !== id))
    } catch (err) { alert(err.response?.data || 'Delete failed') }
  }

  const filtered = designs.filter(d =>
    d.projectId?.projectName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Designs</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${designs.length} design entries`}
          </p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> Upload Design</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={13} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search by project…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(d => (
          <div key={d._id} className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="grid grid-cols-2 gap-0.5 bg-gray-100" style={{ height: 140 }}>
              {(d.images || []).slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover" />
              ))}
              {(d.images || []).length === 0 && (
                <div className="col-span-2 flex items-center justify-center h-full text-gray-300 text-xs">No images</div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800 text-sm">{d.projectId?.projectName || '—'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{(d.images || []).length} images</div>
              </div>
              <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-3 text-center text-xs text-gray-400 py-8">No designs found</div>
        )}
      </div>
    </div>
  )
}
