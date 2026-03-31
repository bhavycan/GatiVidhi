import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Mail, Phone, Edit2, Trash2, X } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL
const avatarColors = ['#883bbc','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const EMPTY_FORM = { name: '', email: '', phone: '' }

export default function Clients() {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', client }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/user/all`, { withCredentials: true })
      .then(res => { setClients(res.data.users || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal({ mode: 'create' })
  }

  const openEdit = (client) => {
    setForm({ name: client.name || '', email: client.email || '', phone: client.phone || '' })
    setFormError('')
    setModal({ mode: 'edit', client })
  }

  const closeModal = () => { setModal(null); setFormError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (modal.mode === 'create') {
        const res = await axios.post(`${BASE_URL}/user/create`,
          { name: form.name, email: form.email, phone: form.phone },
          { withCredentials: true }
        )
        setClients(prev => [res.data, ...prev])
      } else {
        await axios.post(`${BASE_URL}/user/update`,
          { id: modal.client._id, name: form.name, phone: form.phone },
          { withCredentials: true }
        )
        setClients(prev => prev.map(c =>
          c._id === modal.client._id ? { ...c, name: form.name, phone: form.phone } : c
        ))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return
    try {
      await axios.post(`${BASE_URL}/user/delete`, { id }, { withCredentials: true })
      setClients(prev => prev.filter(c => c._id !== id))
    } catch (err) { alert(err.response?.data || 'Delete failed') }
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Clients</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : `${clients.length} registered clients`}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> Add Client</button>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 flex-1 max-w-xs">
            <Search size={13} className="text-gray-400" />
            <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} clients</span>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr><th>Client</th><th>Email</th><th>Phone</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c._id} className="cursor-pointer">
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ background: avatarColors[i % avatarColors.length] }}>
                      {initials(c.name)}
                    </div>
                    <span className="font-semibold text-gray-800 text-xs">{c.name}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Mail size={11} className="text-gray-400" />{c.email}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Phone size={11} className="text-gray-400" />{c.phone || '—'}
                  </div>
                </td>
                <td className="text-xs text-gray-500">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(c._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-xs text-gray-400 py-8">No clients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {modal.mode === 'create' ? 'Add Client' : 'Edit Client'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input required className="admin-input" placeholder="e.g. Rahul Sharma"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              {modal.mode === 'create' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input required type="email" className="admin-input" placeholder="client@example.com"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <input required className="admin-input" placeholder="e.g. 9876543210"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>

              {modal.mode === 'create' && (
                <p className="text-[10px] text-gray-400">
                  A password will be auto-generated and sent to the client's email.
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Add Client' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
