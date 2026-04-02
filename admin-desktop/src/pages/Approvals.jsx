import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CheckCircle2, XCircle, Clock, Search, Plus, X, Bell, Edit2, Image, MessageSquare } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  approved: 'badge-active',
  pending:  'badge-pending',
  rejected: 'badge-overdue',
}
const priorityColors = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low:    'bg-green-50 text-green-600',
}

const EMPTY_FORM = { projectId: '', projectName: '', title: '', date: '', priority: 'medium', note: '' }

export default function Approvals() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [approvals, setApprovals] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create modal
  const [modal, setModal] = useState(null) // null | 'create' | { mode:'edit', approval }
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])          // File objects (new uploads)
  const [previews, setPreviews] = useState([])      // local object URLs for preview
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Reminders
  const [reminding, setReminding] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/approval/all`, { withCredentials: true })
      .then(res => { setApprovals(res.data.approvals || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => setProjects(res.data.projects || []))
      .catch(() => {})
  }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setImages([])
    setPreviews([])
    setFormError('')
    setModal('create')
  }

  const openEdit = (approval) => {
    setForm({
      projectId: approval.projectId || '',
      projectName: approval.projectName || '',
      title: approval.title || '',
      date: approval.date ? approval.date.slice(0, 10) : '',
      priority: approval.priority || 'medium',
      note: approval.note || '',
    })
    setImages([])
    setPreviews(approval.images || [])   // show existing Cloudinary URLs as previews
    setFormError('')
    setModal({ mode: 'edit', approval })
  }

  const closeModal = () => {
    // revoke any local object URLs we created
    previews.forEach(p => { if (p.startsWith('blob:')) URL.revokeObjectURL(p) })
    setModal(null)
    setFormError('')
  }

  const handleImageFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...files].slice(0, 10))
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 10))
    e.target.value = ''
  }

  const removePreview = (index) => {
    setPreviews(prev => {
      const p = prev[index]
      if (p.startsWith('blob:')) URL.revokeObjectURL(p)
      return prev.filter((_, i) => i !== index)
    })
    // Also remove from images array if it's a new file (blob previews map to images)
    // existing Cloudinary previews have no matching file — count blob: entries before this index
    const blobCount = previews.slice(0, index).filter(p => p.startsWith('blob:')).length
    const isBlob = previews[index]?.startsWith('blob:')
    if (isBlob) {
      setImages(prev => prev.filter((_, i) => i !== blobCount))
    }
  }

  const handleProjectChange = (e) => {
    const proj = projects.find(p => p._id === e.target.value)
    setForm(f => ({ ...f, projectId: e.target.value, projectName: proj?.projectName || '' }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const fd = new FormData()
      fd.append('projectId', form.projectId)
      fd.append('projectName', form.projectName)
      fd.append('title', form.title)
      fd.append('date', form.date)
      fd.append('priority', form.priority)
      if (form.note) fd.append('note', form.note)
      images.forEach(img => fd.append('images', img))

      let res
      if (modal === 'create') {
        res = await axios.post(`${BASE_URL}/approval/create`, fd, { withCredentials: true })
        setApprovals(prev => [res.data.approval ?? res.data, ...prev])
      } else {
        res = await axios.put(`${BASE_URL}/approval/edit/${modal.approval._id}`, fd, { withCredentials: true })
        const updated = res.data.approval ?? res.data
        setApprovals(prev => prev.map(a => a._id === modal.approval._id ? { ...a, ...updated } : a))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleRemind = async (id) => {
    setReminding(id)
    try {
      await axios.post(`${BASE_URL}/approval/remind/${id}`, {}, { withCredentials: true })
      alert('Reminder sent to client.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reminder')
    } finally {
      setReminding(null)
    }
  }

  const filtered = approvals.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter
    const matchSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.projectName?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    pending:  approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Approvals</h2>
          <p className="text-xs text-gray-400 mt-0.5">Client approval requests across all projects</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> New Approval</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  value: counts.pending,  icon: Clock,        color: '#f59e0b' },
          { label: 'Approved', value: counts.approved, icon: CheckCircle2, color: '#10b981' },
          { label: 'Rejected', value: counts.rejected, icon: XCircle,      color: '#ef4444' },
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-48"
            placeholder="Search approvals…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
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

      <div className="space-y-3">
        {filtered.map(a => (
          <div key={a._id} className="bg-white rounded-2xl p-5 card-shadow flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm truncate">{a.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${priorityColors[a.priority] || 'bg-gray-100 text-gray-600'}`}>
                  {a.priority}
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-1">{a.projectName}</div>
              {a.note && <div className="text-xs text-gray-500 italic">"{a.note}"</div>}
              {a.clientNote && <div className="text-xs text-blue-500 mt-1">Client: "{a.clientNote}"</div>}
              {a.images?.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {a.images.slice(0, 4).map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="" className="w-12 h-12 rounded-lg object-cover border border-purple-100 cursor-pointer hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                  {a.images.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-500">
                      +{a.images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusStyles[a.status]}`}>
                {a.status}
              </span>
              <span className="text-[10px] text-gray-400">
                {a.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}
              </span>
              <div className="flex gap-1 mt-1">
                {a.status === 'pending' && (
                  <button onClick={() => handleRemind(a._id)} disabled={reminding === a._id}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50">
                    <Bell size={10}/> {reminding === a._id ? 'Sending…' : 'Remind'}
                  </button>
                )}
                {a.status === 'rejected' && (
                  <button onClick={() => openEdit(a)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                    <Edit2 size={10}/> Edit & Resubmit
                  </button>
                )}
                <button
                  onClick={() => navigate('/messages', {
                    state: {
                      approvalRef: { approvalId: a._id, title: a.title, projectName: a.projectName },
                      targetProjectName: a.projectName,
                    }
                  })}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <MessageSquare size={10}/> Chat
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">No approvals found</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900">
                {modal === 'create' ? 'New Approval Request' : 'Edit & Resubmit'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}

              {modal === 'create' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project</label>
                  <select required className="admin-input" value={form.projectId} onChange={handleProjectChange}>
                    <option value="">Select a project…</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
                <input required className="admin-input" placeholder="e.g. Living room colour palette"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date</label>
                  <input required type="date" className="admin-input"
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
                  <select className="admin-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note <span className="text-gray-300 font-normal">(optional)</span></label>
                <textarea rows={2} className="admin-input resize-none" placeholder="Additional context for the client…"
                  value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Images <span className="text-gray-300 font-normal">(optional, up to 10)</span>
                </label>
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-purple-200" />
                        <button
                          type="button"
                          onClick={() => removePreview(i)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px]"
                          style={{ background: '#883bbc' }}
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {previews.length < 10 && (
                  <label className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors">
                    <Image size={12} /> Add images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Approval' : 'Resubmit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
