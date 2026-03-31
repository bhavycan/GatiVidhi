import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, CheckSquare, Clock, AlertCircle, Search, ChevronDown, X, FolderKanban, TriangleAlert } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const isOverdue = (t) => t.date && t.status !== 'completed' && new Date(t.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const statusStyles = {
  'ongoing':     'badge-pending',
  'completed':   'badge-completed',
  'not started': 'badge-on-hold',
  'overdue':     'badge-overdue',
}

function getDisplayStatus(t) {
  if (isOverdue(t)) return 'overdue'
  return t.status
}

export default function Tasks() {
  const [projects, setProjects] = useState([])
  const [staleProjects, setStaleProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [taskList, setTaskList] = useState(null)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', status: 'not started' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => { setProjects(res.data.projects || []); setProjectsLoading(false) })
      .catch(() => setProjectsLoading(false))
    axios.get(`${BASE_URL}/task/stale`, { withCredentials: true })
      .then(res => setStaleProjects(res.data || []))
      .catch(() => {})
  }, [])

  const selectProject = async (project) => {
    setSelectedProject(project)
    setTaskList(null)
    setTasksError(null)
    setTasksLoading(true)
    setFilter('all')
    setSearch('')
    try {
      const res = await axios.get(`${BASE_URL}/task/${project._id}`, { withCredentials: true })
      setTaskList(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setTaskList({ tasks: [] })
      } else {
        setTasksError(err.response?.data?.message || 'Failed to load tasks')
      }
    } finally {
      setTasksLoading(false)
    }
  }

  const saveTasks = async (updatedTasks) => {
    await axios.post(`${BASE_URL}/task/update`,
      { projectId: selectedProject._id, tasks: updatedTasks },
      { withCredentials: true }
    )
    setTaskList(prev => ({ ...prev, tasks: updatedTasks }))
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const current = taskList?.tasks || []
      const newTasks = [...current, {
        name: form.name,
        status: form.status,
        date: form.date || null,
      }]
      await saveTasks(newTasks)
      setModal(false)
      setForm({ name: '', date: '', status: 'not started' })
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (idx, newStatus) => {
    const updated = taskList.tasks.map((t, i) => i === idx ? { ...t, status: newStatus } : t)
    try { await saveTasks(updated) } catch (_) {}
  }

  const handleDeleteTask = async (idx) => {
    const updated = taskList.tasks.filter((_, i) => i !== idx)
    try { await saveTasks(updated) } catch (_) {}
  }

  const tasks = taskList?.tasks || []
  const overdueCount = tasks.filter(isOverdue).length

  const filtered = tasks.filter(t => {
    const disp = getDisplayStatus(t)
    const matchFilter = filter === 'all' || (filter === 'overdue' ? isOverdue(t) : t.status === filter)
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    overdue: overdueCount,
  }

  // ── Project selector screen ──────────────────────────────────────────────
  if (!selectedProject) {
    return (
      <div className="p-6 overflow-y-auto h-full space-y-6">
        <div className="page-header">
          <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
          <p className="text-xs text-gray-400 mt-0.5">Select a project to view its tasks</p>
        </div>

        {/* Not Updated / Stale section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TriangleAlert size={15} className="text-orange-500" />
            <h3 className="text-sm font-bold text-gray-800">Projects Not Updated</h3>
            {staleProjects.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                {staleProjects.length}
              </span>
            )}
          </div>
          {staleProjects.length === 0 ? (
            <div className="px-4 py-3 rounded-xl border border-green-100 bg-green-50">
              <p className="text-xs font-semibold text-green-600">All projects are up to date.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {staleProjects.map(p => {
                const fullProject = projects.find(pr => pr._id === p.projectId)
                  || { _id: p.projectId, projectName: p.projectName }
                const daysAgo = p.lastUpdated
                  ? Math.floor((Date.now() - new Date(p.lastUpdated)) / 86400000)
                  : null
                return (
                  <button key={p.projectId} onClick={() => selectProject(fullProject)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left
                      border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-100">
                        <TriangleAlert size={14} className="text-orange-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{p.projectName}</div>
                        <div className="text-[10px] text-orange-500 font-semibold mt-0.5">
                          {daysAgo === null ? 'Never updated' : `Last updated ${daysAgo}d ago`}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={14} className="-rotate-90 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* All projects */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">All Projects</h3>
          {projectsLoading ? (
            <div className="text-xs text-gray-400 text-center py-16">Loading projects…</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {projects.map(p => {
                const isStale = staleProjects.some(s => s.projectId === p._id)
                return (
                  <button key={p._id} onClick={() => selectProject(p)}
                    className="bg-white rounded-2xl p-5 card-shadow text-left hover:shadow-md transition-all hover:-translate-y-0.5 group relative">
                    {isStale && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-400" title="Not updated recently" />
                    )}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: 'linear-gradient(135deg,#883bbc18,#f3a9de18)' }}>
                      <FolderKanban size={18} style={{ color: '#883bbc' }} />
                    </div>
                    <div className="font-bold text-gray-900 text-sm mb-1">{p.projectName}</div>
                    <div className="text-[10px] text-gray-400">{p.clientId?.name || '—'}</div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold"
                      style={{ color: '#883bbc' }}>
                      View tasks <ChevronDown size={10} className="-rotate-90 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                )
              })}
              {projects.length === 0 && (
                <div className="col-span-3 text-center text-xs text-gray-400 py-16">No projects found</div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Task list screen ─────────────────────────────────────────────────────
  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <button onClick={() => setSelectedProject(null)}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
            ← All Projects
          </button>
          <h2 className="text-xl font-bold text-gray-900">{selectedProject.projectName}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {tasksLoading ? 'Loading…' : `${tasks.length} tasks${overdueCount ? ` · ${overdueCount} overdue` : ''}`}
          </p>
        </div>
        <button onClick={() => { setModal(true); setFormError('') }} className="btn-primary text-xs">
          <Plus size={13}/> Add Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: counts.total,     icon: CheckSquare, color: '#883bbc' },
          { label: 'Ongoing',   value: counts.ongoing,   icon: Clock,       color: '#f59e0b' },
          { label: 'Completed', value: counts.completed, icon: CheckSquare, color: '#10b981' },
          { label: 'Overdue',   value: counts.overdue,   icon: AlertCircle, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{tasksLoading ? '—' : value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 card-shadow">
          <Search size={13} className="text-gray-400" />
          <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-40"
            placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'not started', 'ongoing', 'completed', 'overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors capitalize
                ${filter === s ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:border-purple-300'}`}
              style={filter === s ? { background: s === 'overdue' ? '#ef4444' : '#883bbc' } : {}}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {tasksError && <div className="text-xs text-red-500">{tasksError}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Task</th><th>Status</th><th>Start Date</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const overdue = isOverdue(t)
              const displayStatus = getDisplayStatus(t)
              const realIdx = tasks.indexOf(t)
              return (
                <tr key={i} className={overdue ? 'bg-red-50/40' : ''}>
                  <td>
                    <div className="font-semibold text-gray-800 text-xs flex items-center gap-2">
                      {t.name}
                      {overdue && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500">
                          <AlertCircle size={10}/> OVERDUE
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(realIdx, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer outline-none capitalize ${statusStyles[displayStatus] || 'badge-on-hold'}`}
                      style={{ background: 'transparent' }}
                    >
                      <option value="not started">Not Started</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {t.date ? new Date(t.date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteTask(realIdx)}
                      className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                      <X size={12}/>
                    </button>
                  </td>
                </tr>
              )
            })}
            {!tasksLoading && filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Task Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Add Task</h3>
              <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleAddTask} className="px-6 py-5 space-y-4">
              {formError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{formError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Task Name</label>
                <input required className="admin-input" placeholder="e.g. Install flooring"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                <input type="date" className="admin-input"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <select className="admin-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="not started">Not Started</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {saving ? 'Saving…' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
