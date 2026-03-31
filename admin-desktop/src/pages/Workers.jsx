import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Plus, Mail, HardHat, Edit2, Trash2, X, FolderKanban } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL
const avatarColors = ['#883bbc', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function Workers() {
  const [search, setSearch] = useState('')
  const [workers, setWorkers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'assign', worker }
  const [form, setForm] = useState({ name: '', email: '', projectId: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/worker/all`, { withCredentials: true })
      .then(res => { setWorkers(res.data.workers || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => setProjects(res.data.projects || []))
      .catch(() => {})
  }, [])

  const openCreate = () => {
    setForm({ name: '', email: '', projectId: '' })
    setFormError('')
    setModal({ mode: 'create' })
  }

  const openAssign = (worker) => {
    setForm({ name: '', email: '', projectId: worker.assignedProjectId?._id || '' })
    setFormError('')
    setModal({ mode: 'assign', worker })
  }

  const closeModal = () => { setModal(null); setFormError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (modal.mode === 'create') {
        const res = await axios.post(`${BASE_URL}/worker/create`,
          { name: form.name, email: form.email },
          { withCredentials: true }
        )
        setWorkers(prev => [res.data.worker ?? res.data, ...prev])
      } else {
        const res = await axios.post(`${BASE_URL}/worker/assign-project`,
          { workerId: modal.worker._id, projectId: form.projectId },
          { withCredentials: true }
        )
        const updated = res.data.worker ?? res.data
        setWorkers(prev => prev.map(w => w._id === modal.worker._id ? { ...w, ...updated } : w))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker?')) return
    try {
      await axios.post(`${BASE_URL}/worker/delete`, { id }, { withCredentials: true })
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
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> Add Worker</button>
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
                <button onClick={() => openAssign(w)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                <button onClick={() => handleDelete(w._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="font-bold text-gray-900 text-sm mb-0.5">{w.name}</div>
            <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <HardHat size={11}/> Worker
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5"><Mail size={11} className="text-gray-400"/>{w.email}</div>
              {w.assignedProjectId ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <FolderKanban size={11} className="text-purple-400"/>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                    {w.assignedProjectId.projectName || 'Assigned'}
                  </span>
                </div>
              ) : (
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium inline-block mt-1">
                  Unassigned
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-4 text-center text-xs text-gray-400 py-8">No workers found</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {modal.mode === 'create' ? 'Add Worker' : `Assign Project — ${modal.worker.name}`}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}

              {modal.mode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                    <input required className="admin-input" placeholder="e.g. Ramesh Kumar"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                    <input required type="email" className="admin-input" placeholder="worker@example.com"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <p className="text-[10px] text-gray-400">
                    A password will be auto-generated and sent to the worker's email.
                  </p>
                </>
              )}

              {modal.mode === 'assign' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assign to Project</label>
                  <select required className="admin-input"
                    value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                    <option value="">Select a project…</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.projectName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Add Worker' : 'Assign Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
