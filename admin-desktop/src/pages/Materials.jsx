import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Layers, Edit2, Trash2 } from 'lucide-react'

const BASE_URL = 'http://localhost:3000'

const categories = ['All', 'Flooring', 'Walls', 'Ceiling', 'Furniture', 'Lighting', 'Kitchen']
const stockStyles = { 'in-stock': 'badge-active', 'low-stock': 'badge-pending', 'out-of-stock': 'badge-overdue' }
const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`

function deriveStatus(stock) {
  if (stock === 0) return 'out-of-stock'
  if (stock < 20) return 'low-stock'
  return 'in-stock'
}

export default function Materials() {
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/material/all`, { withCredentials: true })
      .then(res => {
        setMaterials(res.data.materials || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.response?.data || 'Failed to load materials')
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return
    try {
      await axios.post(`${BASE_URL}/api/material/delete`, { id }, { withCredentials: true })
      setMaterials(prev => prev.filter(m => m._id !== id))
    } catch (err) {
      alert(err.response?.data || 'Delete failed')
    }
  }

  const filtered = materials.filter(m =>
    (cat === 'All' || m.category === cat) &&
    m.materialName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Materials</h2>
          <p className="text-xs text-gray-400 mt-0.5">Interior material catalog and inventory</p>
        </div>
        <button className="btn-primary text-xs"><Plus size={13}/> Add Material</button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border
              ${cat === c ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:border-purple-300 hover:text-purple-700'}`}
            style={cat === c ? { background: '#883bbc', border: 'transparent' } : {}}>
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400" />
            <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              placeholder="Search materials…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-xs text-gray-400">
            {loading ? 'Loading…' : `Showing ${filtered.length} items`}
          </span>
        </div>

        {error && (
          <div className="px-5 py-4 text-xs text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <table className="w-full data-table">
            <thead>
              <tr><th>ID</th><th>Material</th><th>Category</th><th>Brand</th>
                <th>Price / Unit</th><th>Unit</th><th>Stock</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const status = deriveStatus(m.stock)
                return (
                  <tr key={m._id} className="cursor-pointer">
                    <td className="text-[10px] text-gray-400 font-mono">{m._id?.slice(-6).toUpperCase()}</td>
                    <td className="font-semibold text-gray-800 text-xs">{m.materialName}</td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                        {m.category || '—'}
                      </span>
                    </td>
                    <td className="text-xs text-gray-600">{m.brand || '—'}</td>
                    <td className="font-semibold text-xs text-gray-900">{fmt(m.price)}</td>
                    <td className="text-xs text-gray-500">{m.unit || '—'}</td>
                    <td className="text-xs font-semibold text-gray-800">{Number(m.stock).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stockStyles[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                        <button onClick={() => handleDelete(m._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-xs text-gray-400 py-8">No materials found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
