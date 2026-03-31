import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter, Plus, Edit2, Trash2, X } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  ongoing: 'badge-active', completed: 'badge-completed',
  pending: 'badge-pending', overdue: 'badge-overdue', 'on-hold': 'badge-on-hold',
}

const EMPTY_FORM = { projectName: '', clientEmail: '', description: '', estimatedEndDate: '', status: 'ongoing' }

export default function Projects() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', project }
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => { setProjects(res.data.projects || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal({ mode: 'create' })
  }

  const openEdit = (project) => {
    setForm({
      projectName: project.projectName || '',
      clientEmail: project.clientId?.email || '',
      description: project.description || '',
      estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.slice(0, 10) : '',
      status: project.status || 'ongoing',
    })
    setFormError('')
    setModal({ mode: 'edit', project })
  }

  const closeModal = () => { setModal(null); setFormError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (modal.mode === 'create') {
        const res = await axios.post(`${BASE_URL}/project/create`, {
          projectName: form.projectName,
          clientEmail: form.clientEmail,
          description: form.description,
          estimatedEndDate: form.estimatedEndDate,
        }, { withCredentials: true })
        setProjects(prev => [res.data, ...prev])
      } else {
        const res = await axios.post(`${BASE_URL}/project/update`, {
          id: modal.project._id,
          projectName: form.projectName,
          description: form.description,
          estimatedEndDate: form.estimatedEndDate,
          status: form.status,
        }, { withCredentials: true })
        setProjects(prev => prev.map(p => p._id === modal.project._id ? { ...p, ...res.data } : p))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await axios.post(`${BASE_URL}/project/delete`, { id }, { withCredentials: true })
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
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> New Project</button>
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
                    <button onClick={() => openEdit(p)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {modal.mode === 'create' ? 'New Project' : 'Edit Project'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project Name</label>
                <input required className="admin-input" placeholder="e.g. Sharma Residence"
                  value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} />
              </div>

              {modal.mode === 'create' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Client Email</label>
                  <input required type="email" className="admin-input" placeholder="client@email.com"
                    value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea required rows={3} className="admin-input resize-none" placeholder="Project description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estimated End Date</label>
                <input required type="date" className="admin-input"
                  value={form.estimatedEndDate} onChange={e => setForm(f => ({ ...f, estimatedEndDate: e.target.value }))} />
              </div>

              {modal.mode === 'edit' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <select className="admin-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="overdue">Overdue</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal.mode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
