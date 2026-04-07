import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Plus, X, Upload, RefreshCcw, AlertCircle,
  Image, Video, ChevronDown, Check, Edit2, Trash2,
  Play, ZoomIn, ChevronLeft, ChevronRight, RotateCcw,
  Home, Send, Loader2
} from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'
const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''

// ── Project / Task dropdown ────────────────────────────────────────────────
function Dropdown({ label, options, selected, onSelect, renderLabel, renderOption, disabled, scrollable }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? (renderLabel ? renderLabel(selected) : selected) : label}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg ${scrollable ? 'max-h-48 overflow-y-auto' : ''}`}>
          {options.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400">No options available</p>
          )}
          {options.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onSelect(item); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0"
            >
              {renderOption ? renderOption(item) : <span className="font-medium">{item}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Image slot (desktop file input) ───────────────────────────────────────
function ImageSlot({ index, file, onFileChange, onRemove, isRequired }) {
  const inputRef = useRef(null)
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="relative aspect-square rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 overflow-hidden flex items-center justify-center group">
      {!file ? (
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors">
          <Image size={20} className="text-purple-300 mb-1" />
          <span className="text-[10px] font-semibold text-purple-300">{isRequired ? 'Required' : 'Optional'}</span>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => onFileChange(index, e.target.files[0])} />
        </label>
      ) : (
        <>
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center cursor-pointer hover:bg-white transition-colors" title="Change">
              <Edit2 size={12} className="text-purple-600" />
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => onFileChange(index, e.target.files[0])} />
            </label>
            <button type="button" onClick={() => onRemove(index)}
              className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors" title="Remove">
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center pointer-events-none">
            <Check size={10} className="text-white" />
          </div>
        </>
      )}
    </div>
  )
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center" onClick={onClose}>
      <img src={src} alt="" onClick={e => e.stopPropagation()}
        className="max-w-[85vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
        <X size={16} className="text-white" />
      </button>
    </div>
  )
}

// ── Video modal ───────────────────────────────────────────────────────────
function VideoModal({ src, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center" onClick={onClose}>
      <video src={src} controls autoPlay onClick={e => e.stopPropagation()}
        className="max-w-[85vw] max-h-[85vh] rounded-2xl shadow-2xl" />
      <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
        <X size={16} className="text-white" />
      </button>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [msg])
  if (!msg) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
      <AlertCircle size={15} className="text-purple-300 shrink-0" />
      {msg}
      <button onClick={onClose}><X size={13} /></button>
    </div>
  )
}

export default function Updates() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [projectTasks, setProjectTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [dueProjects, setDueProjects] = useState([])
  const [workerUpdates, setWorkerUpdates] = useState([])
  const [editedPhotos, setEditedPhotos] = useState({})

  // Pre-loaded worker media into form
  const [workerImageUrls, setWorkerImageUrls] = useState([])
  const [workerVideoUrls, setWorkerVideoUrls] = useState([])

  // Form fields
  const [isFormOpen, setFormOpen] = useState(false)
  const [images, setImages] = useState([null, null, null])
  const [videos, setVideos] = useState([])
  const [videoPreviews, setVideoPreviews] = useState([])
  const [workDone, setWorkDone] = useState('')
  const [workLeft, setWorkLeft] = useState('')
  const [notes, setNotes] = useState('')
  const [activeRooms, setActiveRooms] = useState([])
  const [roomInput, setRoomInput] = useState('')
  const [editingRoomIdx, setEditingRoomIdx] = useState(null)
  const [editingRoomVal, setEditingRoomVal] = useState('')
  const [loading, setLoading] = useState(false)

  // Modals / toast
  const [lightbox, setLightbox] = useState(null)
  const [videoModal, setVideoModal] = useState(null)
  const [toast, setToast] = useState(null)

  const formRef = useRef(null)

  const showToast = (msg) => setToast(msg)

  // ── Fetch on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => setProjects((res.data.projects || []).filter(p => p.status === 'ongoing')))
      .catch(() => {})

    axios.get(`${BASE_URL}/update/due-today`, { withCredentials: true })
      .then(res => setDueProjects(res.data || []))
      .catch(() => {})
  }, [])

  // ── Project select ─────────────────────────────────────────────────────
  const handleProjectSelect = async (project) => {
    setSelectedProject(project)
    setSelectedTask(null)
    setProjectTasks([])
    setWorkerUpdates([])
    setWorkerImageUrls([])
    setWorkerVideoUrls([])

    try {
      const { data } = await axios.get(`${BASE_URL}/task/${project._id}`, { withCredentials: true })
      setLastUpdated(data.lastUpdated || null)
      setProjectTasks((data.tasks || []).map(t => t.name))
    } catch (_) { setLastUpdated(null) }

    try {
      const { data } = await axios.get(`${BASE_URL}/worker/updates/${project._id}`, { withCredentials: true })
      setWorkerUpdates(data.updates || [])
    } catch (_) {}
  }

  // ── Due project click ──────────────────────────────────────────────────
  const handleDueClick = async (p) => {
    const proj = projects.find(x => x._id === p.projectId.toString())
      || { _id: p.projectId, projectName: p.projectName }
    setFormOpen(true)
    await handleProjectSelect(proj)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // ── Worker photo editing helpers ───────────────────────────────────────
  const getEditedPhotos = (wu) =>
    editedPhotos[wu._id] ?? { keepUrls: wu.updateImages || [], newFiles: [], newPreviews: [], videoUrls: wu.updateVideos || [] }

  const handleUseWorkerUpdate = async (wu) => {
    const ep = getEditedPhotos(wu)
    setNotes(wu.notes || '')
    setWorkerImageUrls(ep.keepUrls)
    setWorkerVideoUrls(ep.videoUrls)
    if (ep.newFiles.length > 0) {
      setImages(prev => {
        const slots = [...prev]
        ep.newFiles.forEach(f => {
          const empty = slots.findIndex(s => s === null)
          if (empty !== -1) slots[empty] = f; else slots.push(f)
        })
        return slots
      })
    }
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    try {
      await axios.post(`${BASE_URL}/worker/use/${wu._id}`, {}, { withCredentials: true })
      setWorkerUpdates(prev => prev.map(u => u._id === wu._id ? { ...u, status: 'used' } : u))
    } catch (_) {}
  }

  const handleRetakeWorkerUpdate = async (wu) => {
    try {
      await axios.post(`${BASE_URL}/worker/retake/${wu._id}`, {}, { withCredentials: true })
      setWorkerUpdates(prev => prev.map(u => u._id === wu._id ? { ...u, status: 'retake' } : u))
      showToast('Retake notification sent to worker.')
    } catch (_) { showToast('Failed to send retake request.') }
  }

  // ── Image slot handlers ────────────────────────────────────────────────
  const handleImageChange = (index, file) => {
    if (!file) return
    setImages(prev => {
      const updated = [...prev]
      updated[index] = file
      if (index === updated.length - 1) updated.push(null)
      return updated
    })
  }

  const handleImageRemove = (index) => {
    setImages(prev => {
      const updated = [...prev]
      updated[index] = null
      while (updated.length > 3 && updated[updated.length - 1] === null) updated.pop()
      return updated
    })
  }

  // ── Room helpers ───────────────────────────────────────────────────────
  const addRoom = () => {
    const val = roomInput.trim()
    if (!val) return
    setActiveRooms(prev => [...prev, val])
    setRoomInput('')
  }

  const deleteRoom = (idx) => setActiveRooms(prev => prev.filter((_, i) => i !== idx))

  const commitEditRoom = (idx) => {
    const val = editingRoomVal.trim()
    if (val) setActiveRooms(prev => prev.map((r, i) => i === idx ? val : r))
    setEditingRoomIdx(null)
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showToast('Please select a project')
    const uploadedImages = images.filter(Boolean)
    const totalImages = uploadedImages.length + workerImageUrls.length
    if (totalImages < 3) return showToast('At least 3 photos required')
    if (!workDone.trim()) return showToast('Work Done is required')
    if (!workLeft.trim()) return showToast('Work Left is required')
    if (!notes.trim() || notes.trim().length < 3) return showToast('Notes must be at least 3 characters')

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('projectName', selectedProject.projectName)
      fd.append('workDone', workDone)
      fd.append('workLeft', workLeft)
      fd.append('notes', notes)
      if (selectedTask) fd.append('task', selectedTask)
      fd.append('activeRooms', JSON.stringify(activeRooms))
      uploadedImages.forEach(img => fd.append('images', img))
      workerImageUrls.forEach(url => fd.append('existingImages', url))
      videos.forEach(vid => fd.append('images', vid))
      workerVideoUrls.forEach(url => fd.append('existingVideos', url))

      await axios.post(`${BASE_URL}/update/create`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Reset
      setFormOpen(false)
      setSelectedProject(null)
      setSelectedTask(null)
      setProjectTasks([])
      setImages([null, null, null])
      videoPreviews.forEach(url => URL.revokeObjectURL(url))
      setVideos([])
      setVideoPreviews([])
      setWorkDone('')
      setWorkLeft('')
      setNotes('')
      setActiveRooms([])
      setRoomInput('')
      setLastUpdated(null)
      setWorkerImageUrls([])
      setWorkerVideoUrls([])
      setEditedPhotos({})

      // Refresh due-today list
      const { data } = await axios.get(`${BASE_URL}/update/due-today`, { withCredentials: true })
      setDueProjects(data || [])

      showToast('Update submitted successfully!')
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      <VideoModal src={videoModal} onClose={() => setVideoModal(null)} />
      <Toast msg={toast} onClose={() => setToast(null)} />

      {/* Page header */}
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Updates</h2>
          <p className="text-xs text-gray-400 mt-0.5">Submit progress updates with photos for active projects</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary text-xs">
          <Plus size={13} /> New Update
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* ── Left: New Update Form ──────────────────────────────────── */}
        <div className="col-span-7 space-y-4" ref={formRef}>
          {!isFormOpen ? (
            <div className="bg-white rounded-2xl card-shadow p-8 flex flex-col items-center justify-center text-center gap-3 min-h-48">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#883bbc18' }}>
                <Upload size={20} style={{ color: '#883bbc' }} />
              </div>
              <p className="text-sm font-semibold text-gray-600">No update in progress</p>
              <p className="text-xs text-gray-400">Click "New Update" or select a due project to get started</p>
              <button onClick={() => setFormOpen(true)} className="btn-primary text-xs mt-1">
                <Plus size={13} /> Start Update
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h3 className="text-sm font-bold text-gray-900">New Update</h3>
                <button type="button" onClick={() => setFormOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={15} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">

                {/* Project */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project</label>
                  <Dropdown
                    label="Select an ongoing project…"
                    options={projects}
                    selected={selectedProject}
                    onSelect={handleProjectSelect}
                    renderLabel={(p) => p.projectName}
                    renderOption={(p) => (
                      <div>
                        <div className="font-semibold text-gray-900">{p.projectName}</div>
                        <div className="text-[10px] font-mono text-gray-400">{p._id}</div>
                      </div>
                    )}
                    scrollable
                  />
                  {selectedProject && (
                    <p className="text-[10px] text-gray-400 mt-1 pl-1">
                      Last update: <span style={{ color: '#883bbc' }} className="font-semibold">{formatDate(lastUpdated)}</span>
                    </p>
                  )}
                </div>

                {/* Task */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Task <span className="font-normal text-gray-300">(optional)</span></label>
                  <Dropdown
                    label={selectedProject ? 'Select a task…' : 'Select a project first'}
                    options={projectTasks}
                    selected={selectedTask}
                    onSelect={setSelectedTask}
                    disabled={!selectedProject}
                    scrollable
                  />
                </div>

                {/* Worker pre-loaded images */}
                {workerImageUrls.length > 0 && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                    <p className="text-xs font-bold text-purple-600 mb-3">
                      Worker Photos ({workerImageUrls.length}) — hover to delete or replace
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workerImageUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 group">
                          <img src={url} alt="" onClick={() => setLightbox(url)}
                            className="w-full h-full rounded-lg object-cover border border-purple-200 cursor-pointer" />
                          <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setWorkerImageUrls(prev => prev.filter((_, j) => j !== i))}
                              className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center" title="Remove">
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Worker pre-loaded videos */}
                {workerVideoUrls.length > 0 && (
                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-4">
                    <p className="text-xs font-bold text-purple-600 mb-3">Worker Videos ({workerVideoUrls.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {workerVideoUrls.map((url, i) => (
                        <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-purple-200 bg-black group">
                          <video src={url} className="w-full h-full object-cover opacity-70" muted preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Play size={16} className="text-white" />
                          </div>
                          <button type="button" onClick={() => setWorkerVideoUrls(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo slots */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Photos <span className="font-normal text-gray-400">(min. 3 · {images.filter(Boolean).length + workerImageUrls.length} total)</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((file, i) => (
                      <ImageSlot key={i} index={i} file={file}
                        onFileChange={handleImageChange} onRemove={handleImageRemove}
                        isRequired={i < 3} />
                    ))}
                  </div>
                </div>

                {/* Videos */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Videos <span className="font-normal text-gray-400">(optional · {videos.length} selected)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {videoPreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-purple-200 bg-black group">
                        <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play size={16} className="text-white" />
                        </div>
                        <button type="button" onClick={() => {
                          URL.revokeObjectURL(src)
                          setVideos(prev => prev.filter((_, j) => j !== i))
                          setVideoPreviews(prev => prev.filter((_, j) => j !== i))
                        }} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={9} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-16 rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                      <Video size={16} className="text-purple-300 mb-0.5" />
                      <span className="text-[10px] text-purple-300 font-semibold">Add</span>
                      <input type="file" accept="video/mp4,video/quicktime,video/webm,video/avi" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files)
                          if (!files.length) return
                          setVideos(prev => [...prev, ...files])
                          setVideoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
                          e.target.value = ''
                        }} />
                    </label>
                  </div>
                </div>

                {/* Work Done */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Done</label>
                  <textarea rows={3} value={workDone} onChange={e => setWorkDone(e.target.value)}
                    placeholder="Describe what was completed today…"
                    className="admin-input resize-none" />
                </div>

                {/* Work Left */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Work Left</label>
                  <textarea rows={3} value={workLeft} onChange={e => setWorkLeft(e.target.value)}
                    placeholder="Describe what remains to be done…"
                    className="admin-input resize-none" />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any additional notes…"
                    className="admin-input resize-none" />
                </div>

                {/* Active Rooms */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Active Rooms</label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                      <Home size={13} className="text-gray-400 shrink-0" />
                      <input type="text" value={roomInput} onChange={e => setRoomInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRoom())}
                        placeholder="e.g. Bedroom, Hall…"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400" />
                    </div>
                    <button type="button" onClick={addRoom}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ background: '#883bbc' }}>
                      <Plus size={16} />
                    </button>
                  </div>
                  {activeRooms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeRooms.map((room, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          {editingRoomIdx === idx ? (
                            <input autoFocus value={editingRoomVal}
                              onChange={e => setEditingRoomVal(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') commitEditRoom(idx); if (e.key === 'Escape') setEditingRoomIdx(null) }}
                              onBlur={() => commitEditRoom(idx)}
                              className="bg-transparent outline-none text-xs font-semibold w-20" />
                          ) : (
                            <span className="text-xs font-semibold text-gray-700">{room}</span>
                          )}
                          <button type="button" onClick={() => { setEditingRoomIdx(idx); setEditingRoomVal(room) }}
                            className="w-4 h-4 rounded-full bg-purple-200 flex items-center justify-center ml-0.5">
                            <Edit2 size={8} className="text-purple-600" />
                          </button>
                          <button type="button" onClick={() => deleteRoom(idx)}
                            className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                            <X size={8} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary flex-1 justify-center text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <><Send size={13} /> Submit Update</>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Right: Due Today + Worker Updates ─────────────────────── */}
        <div className="col-span-5 space-y-4">

          {/* Due Today */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
              <RefreshCcw size={14} className="text-orange-500" />
              <span className="text-sm font-bold text-gray-900">Updates Due Today</span>
              {dueProjects.length > 0 && (
                <span className="ml-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-orange-500">
                  {dueProjects.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-gray-50">
              {dueProjects.length === 0 ? (
                <p className="px-5 py-4 text-xs text-gray-400">All projects are up to date.</p>
              ) : dueProjects.map((p) => (
                <button key={p.projectId} onClick={() => handleDueClick(p)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-orange-50 transition-colors text-left">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={13} className="text-orange-400 shrink-0" />
                    <span className="text-xs font-semibold text-gray-800">{p.projectName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-gray-400">Last update</p>
                    <p className="text-[10px] font-semibold" style={{ color: '#883bbc' }}>{formatDate(p.lastUpdate)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Worker Received */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Worker Submissions</span>
              {workerUpdates.length > 0 && (
                <span className="ml-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: '#883bbc' }}>
                  {workerUpdates.length}
                </span>
              )}
            </div>

            {!selectedProject ? (
              <p className="px-5 py-4 text-xs text-gray-400">Select a project to view worker submissions.</p>
            ) : workerUpdates.length === 0 ? (
              <p className="px-5 py-4 text-xs text-gray-400">No pending worker submissions for this project.</p>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {workerUpdates.map((wu) => {
                  const ep = getEditedPhotos(wu)
                  const totalPhotos = ep.keepUrls.length + ep.newFiles.length
                  return (
                    <div key={wu._id} className="px-5 py-4 space-y-3">
                      {/* Worker header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: '#883bbc' }}>
                            {(wu.workerId?.name || 'W').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{wu.workerId?.name || 'Worker'}</p>
                            <p className="text-[10px] text-gray-400">{formatDate(wu.date)} · {formatTime(wu.date)}</p>
                          </div>
                        </div>
                        {wu.status === 'retake' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500">Retake</span>
                        )}
                        {wu.status === 'used' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">Used</span>
                        )}
                      </div>

                      {/* Notes */}
                      {wu.notes && (
                        <p className="text-[11px] text-gray-500 italic">"{wu.notes}"</p>
                      )}

                      {/* Photos */}
                      {totalPhotos > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 mb-1.5">
                            Photos ({totalPhotos}) — hover to delete · click to view
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ep.keepUrls.map((src, j) => (
                              <div key={`url-${j}`} className="relative w-14 h-14 group">
                                <img src={src} alt="" onClick={() => setLightbox(src)}
                                  className="w-full h-full rounded-lg object-cover border border-gray-200 cursor-pointer" />
                                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <button type="button"
                                    onClick={() => setEditedPhotos(prev => {
                                      const cur = getEditedPhotos(wu)
                                      return { ...prev, [wu._id]: { ...cur, keepUrls: cur.keepUrls.filter((_, i) => i !== j) } }
                                    })}
                                    className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <X size={9} className="text-white" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {ep.newFiles.map((f, j) => {
                              const prev = URL.createObjectURL(f)
                              return (
                                <div key={`new-${j}`} className="relative w-14 h-14 group">
                                  <img src={prev} alt="" onClick={() => setLightbox(prev)}
                                    className="w-full h-full rounded-lg object-cover border border-purple-200 cursor-pointer" />
                                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                    <button type="button"
                                      onClick={() => {
                                        const cur = getEditedPhotos(wu)
                                        URL.revokeObjectURL(cur.newPreviews[j])
                                        setEditedPhotos(prev2 => ({
                                          ...prev2, [wu._id]: {
                                            ...cur,
                                            newFiles: cur.newFiles.filter((_, i) => i !== j),
                                            newPreviews: cur.newPreviews.filter((_, i) => i !== j),
                                          }
                                        }))
                                      }}
                                      className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                      <X size={9} className="text-white" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {ep.videoUrls?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {ep.videoUrls.map((url, j) => (
                            <div key={j} className="relative w-16 h-14 rounded-lg overflow-hidden border border-gray-200 bg-black group cursor-pointer"
                              onClick={() => setVideoModal(url)}>
                              <video src={url} className="w-full h-full object-cover opacity-70" muted preload="metadata" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play size={14} className="text-white" />
                              </div>
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); setEditedPhotos(prev => { const cur = getEditedPhotos(wu); return { ...prev, [wu._id]: { ...cur, videoUrls: cur.videoUrls.filter((_, i) => i !== j) } } }) }}
                                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={8} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      {wu.status !== 'used' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUseWorkerUpdate(wu)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                            style={{ background: '#883bbc' }}>
                            <Check size={11} /> Use in Update
                          </button>
                          <button onClick={() => handleRetakeWorkerUpdate(wu)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                            <RotateCcw size={11} /> Request Retake
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
