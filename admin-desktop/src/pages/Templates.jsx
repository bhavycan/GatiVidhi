import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Search, Trash2, Edit2, X, Layers } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const TYPE_OPTIONS = ['home', 'office', 'modular kitchen', 'renovation', 'furniture', 'small']

const typeColors = {
  home:              'bg-purple-50 text-purple-700',
  office:            'bg-blue-50 text-blue-700',
  'modular kitchen': 'bg-amber-50 text-amber-700',
  renovation:        'bg-orange-50 text-orange-700',
  furniture:         'bg-green-50 text-green-700',
  small:             'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = { name: '', type: 'home', tasks: [''] }

export default function Templates() {
  const [search, setSearch]       = useState('')
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [modal, setModal]         = useState(null) // null | 'create' | { mode:'edit', template }
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/template/all`, { withCredentials: true })
      .then(res => { setTemplates(res.data.templates || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setModal('create')
  }

  const openEdit = (t) => {
    setForm({ name: t.name, type: t.type || 'home', tasks: (t.tasks || []).map(tk => tk.name || tk) })
    setFormError('')
    setModal({ mode: 'edit', template: t })
  }

  const closeModal = () => { setModal(null); setFormError('') }

  const addTaskRow    = () => setForm(f => ({ ...f, tasks: [...f.tasks, ''] }))
  const removeTaskRow = (i) => setForm(f => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }))
  const updateTask    = (i, val) => setForm(f => ({ ...f, tasks: f.tasks.map((t, idx) => idx === i ? val : t) }))

  const handleSave = async (e) => {
    e.preventDefault()
    const cleanTasks = form.tasks.filter(t => t.trim())
    if (cleanTasks.length === 0) { setFormError('Add at least one task'); return }
    setSaving(true); setFormError('')
    try {
      if (modal === 'create') {
        const res = await axios.post(`${BASE_URL}/template/create`,
          { name: form.name, type: form.type, tasks: cleanTasks.map(t => ({ name: t })) },
          { withCredentials: true }
        )
        setTemplates(prev => [...prev, res.data])
      } else {
        const res = await axios.post(`${BASE_URL}/template/update`,
          { id: modal.template._id, name: form.name, type: form.type, tasks: cleanTasks.map(t => ({ name: t })) },
          { withCredentials: true }
        )
        setTemplates(prev => prev.map(t => t._id === modal.template._id ? res.data : t))
      }
      closeModal()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return
    try {
      await axios.post(`${BASE_URL}/template/delete`, { id }, { withCredentials: true })
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
          <p className="text-xs text-gray-400 mt-0.5">{loading ? 'Loading…' : `${templates.length} templates`}</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> New Template</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={14} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(t => {
          const isDefault = !t._id
          return (
            <div key={t._id || t.name} className="bg-white rounded-2xl p-6 card-shadow hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#883bbc18' }}>
                  <Layers size={16} style={{ color: '#883bbc' }} />
                </div>
                {!isDefault && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={13}/></button>
                    <button onClick={() => handleDelete(t._id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={13}/></button>
                  </div>
                )}
                {isDefault && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">DEFAULT</span>
                )}
              </div>
              <div className="font-bold text-gray-900 text-sm mb-1.5">{t.name}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${typeColors[t.type?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                {t.type}
              </span>
              <div className="mt-3 space-y-1">
                {(t.tasks || []).slice(0, 3).map((task, i) => (
                  <div key={i} className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                    {task.name || task}
                  </div>
                ))}
                {(t.tasks || []).length > 3 && (
                  <div className="text-[10px] text-gray-300">+{(t.tasks || []).length - 3} more</div>
                )}
              </div>
              <div className="mt-3 text-[10px] text-gray-400 font-semibold">{(t.tasks || []).length} tasks total</div>
            </div>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div className="col-span-3 text-center text-xs text-gray-400 py-8">No templates found</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900">
                {modal === 'create' ? 'New Template' : 'Edit Template'}
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4 overflow-y-auto">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Template Name</label>
                <input required className="admin-input" placeholder="e.g. Standard Bedroom Renovation"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
                <select className="admin-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Tasks</label>
                  <button type="button" onClick={addTaskRow}
                    className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                    <Plus size={10}/> Add Task
                  </button>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {form.tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input className="admin-input flex-1" placeholder={`Task ${i + 1}`}
                        value={task} onChange={e => updateTask(i, e.target.value)} />
                      {form.tasks.length > 1 && (
                        <button type="button" onClick={() => removeTaskRow(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                          <X size={14}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Template' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
