import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const CATEGORIES = ['Flooring', 'Walls', 'Ceiling', 'Furniture', 'Lighting', 'Kitchen', 'Other']
const CAT_TABS   = ['All', ...CATEGORIES]
const stockStyles = { 'in-stock': 'badge-active', 'low-stock': 'badge-pending', 'out-of-stock': 'badge-overdue' }
const fmt = (v) => `₹${Number(v).toLocaleString('en-IN')}`

const EMPTY_FORM = { label: '', materialName: '', category: '', brand: '', unit: '', price: '', stock: '' }

function deriveStatus(stock) {
  if (stock === 0) return 'out-of-stock'
  if (stock < 20) return 'low-stock'
  return 'in-stock'
}

export default function Materials() {
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [materials, setMaterials] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Modal state — null = closed, 'create' = new, object = edit
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/material/all`, { withCredentials: true })
      .then(res => { setMaterials(res.data.materials || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load materials'); setLoading(false) })
  }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal('create')
  }

  const openEdit = (m) => {
    setForm({
      label:        m.label        || '',
      materialName: m.materialName || '',
      category:     m.category     || '',
      brand:        m.brand        || '',
      unit:         m.unit         || '',
      price:        String(m.price ?? ''),
      stock:        String(m.stock ?? ''),
    })
    setFormError('')
    setModal(m)
  }

  const closeModal = () => { setModal(null); setFormError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      label:        form.label,
      materialName: form.materialName,
      category:     form.category,
      brand:        form.brand,
      unit:         form.unit,
      price:        Number(form.price) || 0,
      stock:        Number(form.stock) || 0,
    }
    try {
      if (modal === 'create') {
        const res = await axios.post(`${BASE_URL}/material/create`, payload, { withCredentials: true })
        setMaterials(prev => [...prev, res.data.material])
      } else {
        const res = await axios.post(`${BASE_URL}/material/update`, { id: modal._id, ...payload }, { withCredentials: true })
        setMaterials(prev => prev.map(m => m._id === modal._id ? res.data.material : m))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return
    try {
      await axios.post(`${BASE_URL}/material/delete`, { id }, { withCredentials: true })
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
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> Add Material</button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CAT_TABS.map(c => (
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

        {error && <div className="px-5 py-4 text-xs text-red-500">{error}</div>}

        {!loading && !error && (
          <table className="w-full data-table">
            <thead>
              <tr><th>ID</th><th>Label</th><th>Material</th><th>Category</th><th>Brand</th>
                <th>Price / Unit</th><th>Unit</th><th>Stock</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const status = deriveStatus(m.stock)
                return (
                  <tr key={m._id} className="cursor-pointer">
                    <td className="text-[10px] text-gray-400 font-mono">{m._id?.slice(-6).toUpperCase()}</td>
                    <td className="text-xs text-gray-500">{m.label || '—'}</td>
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
                        <button onClick={() => openEdit(m)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={() => handleDelete(m._id)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="text-center text-xs text-gray-400 py-8">No materials found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">
                {modal === 'create' ? 'Add Material' : 'Edit Material'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={16}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3 overflow-y-auto">
              {formError && (
                <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Label <span className="text-red-400">*</span></label>
                  <input required className="admin-input" placeholder="e.g. MAT-001"
                    value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Material Name <span className="text-red-400">*</span></label>
                  <input required className="admin-input" placeholder="e.g. Marble Tile"
                    value={form.materialName} onChange={e => setForm(f => ({ ...f, materialName: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                  <select className="admin-input" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand</label>
                  <input className="admin-input" placeholder="e.g. Asian Paints"
                    value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
                  <input className="admin-input" placeholder="e.g. sqft"
                    value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (₹)</label>
                  <input type="number" min="0" className="admin-input" placeholder="0"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock</label>
                  <input type="number" min="0" className="admin-input" placeholder="0"
                    value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal === 'create' ? 'Add Material' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
