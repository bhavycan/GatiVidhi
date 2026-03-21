import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'
import ImagePickerSheet from '../common/ImagePickerSheet'

// Wrapper that shows a Camera / Gallery picker sheet on click
const PickerButton = ({ onChange, multiple = false, className, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className={className} onClick={() => setOpen(true)}>
        {children}
      </div>
      <ImagePickerSheet open={open} onClose={() => setOpen(false)} onChange={onChange} multiple={multiple} />
    </>
  )
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// CallMessage-style toast portal
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [message])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className="fixed inset-0 z-50 px-2 w-screen h-screen bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end pb-[10%]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: 'bottom center' }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] h-[10%] rounded-full px-3 py-3 flex items-center justify-center text-black shadow-lg backdrop-blur-sm overflow-hidden bg-gradient-to-bl from-white to-transparent"
      >
        <h2 className="text-md w-full h-full font-semibold opacity-80 flex items-center justify-center text-center">
          {message}
        </h2>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// Reusable animated dropdown
const AnimatedDropdown = ({ label, options, selected, onSelect, renderOption, renderSelected, scrollable }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (item) => {
    onSelect(item)
    setOpen(false)
  }

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span>{selected ? (renderSelected ? renderSelected(selected) : selected) : label}</span>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className='ri-arrow-down-s-line'
        />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60'
          >
            <div className={scrollable ? 'max-h-48 overflow-y-auto' : ''}>
              {options.length === 0 && (
                <p className='px-4 py-2 text-sm opacity-60 font-semibold'>No options found</p>
              )}
              {options.map((item, i) => (
                <motion.div
                  key={i}
                  onClick={() => handleSelect(item)}
                  className='w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0'
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                >
                  {renderOption ? renderOption(item) : <p className='font-semibold text-base'>{item}</p>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Image upload slot with change/delete overlay
const ImageSlot = ({ index, file, onFileChange, onRemove, isRequired }) => {
  const preview = file ? URL.createObjectURL(file) : null
  const [hovered, setHovered] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className='relative aspect-square rounded-lg border border-dashed border-[#883bbc] bg-gradient-to-tl from-[#F7D6F3] to-transparent overflow-hidden flex items-center justify-center'
    >
      <ImagePickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChange={(e) => onFileChange(index, e.target.files[0])}
      />

      {/* Empty state — click to upload */}
      {!file && (
        <div
          onClick={() => setPickerOpen(true)}
          className='w-full h-full flex flex-col items-center justify-center gap-1 text-[#883bbc] opacity-70 cursor-pointer hover:opacity-100 transition-opacity'
        >
          <i className='ri-image-add-line text-3xl'></i>
          <span className='text-xs font-semibold'>{isRequired ? 'Required' : 'Optional'}</span>
        </div>
      )}

      {/* Filled state — preview + hover overlay */}
      {file && (
        <>
          <img src={preview} alt={`upload-${index}`} className='w-full h-full object-cover' />

          {/* Check badge — hides when hovered */}
          <AnimatePresence>
            {!hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='absolute top-1 right-1 bg-[#883bbc] text-white rounded-full w-5 h-5 flex items-center justify-center'
              >
                <i className='ri-check-line text-xs'></i>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Change / Delete overlay — appears when hovered */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='absolute inset-0 bg-black/50 flex items-center justify-center gap-3'
              >
                {/* Change */}
                <motion.button
                  type='button'
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPickerOpen(true)}
                  className='w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#883bbc] hover:bg-white transition-colors'
                  title='Change image'
                >
                  <i className='ri-pencil-line text-base'></i>
                </motion.button>

                {/* Delete */}
                <motion.button
                  type='button'
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(index)}
                  className='w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-red-500 hover:bg-white transition-colors'
                  title='Remove image'
                >
                  <i className='ri-delete-bin-line text-base'></i>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

const AdminUpdate = () => {
  const parent = useRef(null)
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isopen, setOpen] = useState(false)

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [projectTasks, setProjectTasks] = useState([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dueProjects, setDueProjects] = useState([])
  const [workerUpdates, setWorkerUpdates] = useState([])
  const [workerImageUrls, setWorkerImageUrls] = useState([])
  // per-update edited photo state: { [updateId]: { keepUrls: string[], newFiles: File[], newPreviews: string[] } }
  const [editedPhotos, setEditedPhotos] = useState({})
  const [lightbox, setLightbox] = useState(null) // src string or null

  // Dynamic slots — start with 3
  const [images, setImages] = useState([null, null, null])
  const [workDone, setWorkDone] = useState('')
  const [workLeft, setWorkLeft] = useState('')
  const [notes, setNotes] = useState('')

  // Active rooms
  const [activeRooms, setActiveRooms] = useState([])
  const [roomInput, setRoomInput] = useState('')
  const [editingRoomIdx, setEditingRoomIdx] = useState(null)
  const [editingRoomVal, setEditingRoomVal] = useState('')

  const addRoom = () => {
    const val = roomInput.trim()
    if (!val) return
    setActiveRooms(prev => [...prev, val])
    setRoomInput('')
  }

  const deleteRoom = (idx) => setActiveRooms(prev => prev.filter((_, i) => i !== idx))

  const startEditRoom = (idx) => {
    setEditingRoomIdx(idx)
    setEditingRoomVal(activeRooms[idx])
  }

  const commitEditRoom = (idx) => {
    const val = editingRoomVal.trim()
    if (val) setActiveRooms(prev => prev.map((r, i) => i === idx ? val : r))
    setEditingRoomIdx(null)
    setEditingRoomVal('')
  }

  // Unified toast
  const [toast, setToast] = useState(null)
  const showToast = (msg) => setToast(msg)
  const hideToast = () => setToast(null)

  const fetchDueProjects = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/update/due-today`, { withCredentials: true })
      setDueProjects(data)
    } catch (error) {
      console.error('Failed to fetch due projects', error)
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/project/all`, { withCredentials: true })
        const ongoing = (data?.projects || []).filter(p => p.status === 'ongoing')
        setProjects(ongoing)
        const paramId = searchParams.get('projectId')
        if (paramId) {
          const found = ongoing.find(p => p._id === paramId)
          if (found) {
            setFormOpen(true)
            await handleProjectSelect(found)
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects', error)
        if (error.response?.status === 400 || error.response?.status === 401) {
          navigate('/admin/login')
        }
      }
    }
    fetchProjects()
    fetchDueProjects()
  }, [])

  const handleDueProjectClick = async (dueProject) => {
    const project = projects.find(p => p._id === dueProject.projectId.toString())
      || { _id: dueProject.projectId, projectName: dueProject.projectName }
    setFormOpen(true)
    await handleProjectSelect(project)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleProjectSelect = async (project) => {
    setSelectedProject(project)
    setSelectedTask(null)
    setProjectTasks([])
    setWorkerUpdates([])
    setWorkerImageUrls([])
    try {
      const { data } = await axios.get(`${API_BASE}/task/${project._id}`, { withCredentials: true })
      setLastUpdated(data.lastUpdated || null)
      setProjectTasks((data.tasks || []).map(t => t.name))
    } catch (_) {
      setLastUpdated(null)
    }
    try {
      const { data } = await axios.get(`${API_BASE}/worker/updates/${project._id}`, { withCredentials: true })
      setWorkerUpdates(data.updates || [])
    } catch (_) {}
  }

  // Initialise editable photo state for an update (lazy)
  const getEditedPhotos = (wu) =>
    editedPhotos[wu._id] ?? { keepUrls: wu.updateImages || [], newFiles: [], newPreviews: [] }

  const deleteWorkerPhoto = (wu, index) => {
    const current = getEditedPhotos(wu)
    setEditedPhotos(prev => ({
      ...prev,
      [wu._id]: { ...current, keepUrls: current.keepUrls.filter((_, i) => i !== index) },
    }))
  }

  const deleteNewWorkerPhoto = (wu, index) => {
    const current = getEditedPhotos(wu)
    URL.revokeObjectURL(current.newPreviews[index])
    setEditedPhotos(prev => ({
      ...prev,
      [wu._id]: {
        ...current,
        newFiles: current.newFiles.filter((_, i) => i !== index),
        newPreviews: current.newPreviews.filter((_, i) => i !== index),
      },
    }))
  }

  const addWorkerPhotos = (wu, files) => {
    const current = getEditedPhotos(wu)
    const newFiles = [...current.newFiles, ...files]
    const newPreviews = [...current.newPreviews, ...files.map(f => URL.createObjectURL(f))]
    setEditedPhotos(prev => ({ ...prev, [wu._id]: { ...current, newFiles, newPreviews } }))
  }

  const replaceWorkerPhoto = (wu, index, file) => {
    const current = getEditedPhotos(wu)
    const updatedUrls = current.keepUrls.filter((_, i) => i !== index)
    const newFiles = [...current.newFiles, file]
    const newPreviews = [...current.newPreviews, URL.createObjectURL(file)]
    setEditedPhotos(prev => ({
      ...prev,
      [wu._id]: { keepUrls: updatedUrls, newFiles, newPreviews },
    }))
  }

  const handleUseWorkerUpdate = async (wu) => {
    const edited = getEditedPhotos(wu)
    setNotes(wu.notes || '')
    setWorkerImageUrls(edited.keepUrls)
    // Merge worker's new files into the form's image slots
    if (edited.newFiles.length > 0) {
      setImages(prev => {
        const slots = [...prev]
        edited.newFiles.forEach(f => {
          const empty = slots.findIndex(s => s === null)
          if (empty !== -1) slots[empty] = f
          else slots.push(f)
        })
        return slots
      })
    }
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    try {
      await axios.post(`${API_BASE}/worker/use/${wu._id}`, {}, { withCredentials: true })
      setWorkerUpdates(prev => prev.map(u => u._id === wu._id ? { ...u, status: 'used' } : u))
    } catch (_) {}
  }

  const handleRetakeWorkerUpdate = async (wu) => {
    try {
      await axios.post(`${API_BASE}/worker/retake/${wu._id}`, {}, { withCredentials: true })
      setWorkerUpdates(prev => prev.map(u => u._id === wu._id ? { ...u, status: 'retake' } : u))
      showToast('Retake notification sent to worker.')
    } catch (_) {
      showToast('Failed to send retake request.')
    }
  }

  const handleImageChange = (index, file) => {
    if (!file) return
    setImages(prev => {
      const updated = [...prev]
      updated[index] = file
      // When the last slot is filled, append a new empty slot
      if (index === updated.length - 1) {
        updated.push(null)
      }
      return updated
    })
  }

  const handleImageRemove = (index) => {
    setImages(prev => {
      const updated = [...prev]
      updated[index] = null
      // Remove trailing empty slots beyond the 3rd, keeping at least 3
      while (updated.length > 3 && updated[updated.length - 1] === null) {
        updated.pop()
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showToast('Please select a project')

    const uploadedImages = images.filter(Boolean)
    const totalImages = uploadedImages.length + workerImageUrls.length
    if (totalImages < 3) return showToast('Please upload at least 3 images')
    if (!workDone.trim()) return showToast('Please fill in Work Done')
    if (!workLeft.trim()) return showToast('Please fill in Work Left')
    if (!notes.trim() || notes.trim().length < 3) return showToast('Notes must be at least 3 characters')

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('projectName', selectedProject.projectName)
      formData.append('workDone', workDone)
      formData.append('workLeft', workLeft)
      formData.append('notes', notes)
      if (selectedTask) formData.append('task', selectedTask)
      formData.append('activeRooms', JSON.stringify(activeRooms))
      uploadedImages.forEach(img => formData.append('images', img))
      workerImageUrls.forEach(url => formData.append('existingImages', url))

      await axios.post(`${API_BASE}/update/create`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFormOpen(false)
      setSelectedProject(null)
      setSelectedTask(null)
      setProjectTasks([])
      setImages([null, null, null])
      setWorkDone('')
      setWorkLeft('')
      setNotes('')
      setActiveRooms([])
      setRoomInput('')
      setLastUpdated(null)
      setWorkerImageUrls([])
      showToast('update has been submitted')
    } catch (error) {
      console.error(error)
      showToast('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4'
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              src={lightbox}
              alt='preview'
              onClick={e => e.stopPropagation()}
              className='max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl'
            />
            <button
              onClick={() => setLightbox(null)}
              className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl'
            >
              <i className='ri-close-line'></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CallMessage-style toast */}
      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={hideToast} />}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Daily</h1>
              <h1 className='text-white'>Update</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Submit progress updates with images for active projects
              </h4>
            </div>
          </header>

          <section ref={formRef} className='w-full relative z-10 pb-16'>

            <h1 className='text-xl font-bold mt-[5%]'>New Update :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Select a project and submit daily progress with photos, work done, and work left.</p>
                    <motion.div
                      layoutId='update-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-add-circle-fill'></i>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleSubmit}
                    className='px-3 py-4 space-y-5'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >

                    {/* Project picker */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className='block text-black font-medium mb-2'>Project</label>
                      <AnimatedDropdown
                        label='Select a project'
                        options={projects}
                        selected={selectedProject}
                        onSelect={handleProjectSelect}
                        renderSelected={(p) => p.projectName}
                        renderOption={(p) => (
                          <>
                            <p className='font-semibold text-base'>{p.projectName}</p>
                            <p className='text-xs opacity-50 font-mono mt-[2px]'>{p._id}</p>
                          </>
                        )}
                      />
                      {selectedProject && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className='mt-1 pl-2 space-y-[2px]'
                        >
                          <p className='text-xs font-mono opacity-50'>ID: {selectedProject._id}</p>
                          <p className='text-xs font-mono opacity-50'>
                            Last update: <span className='text-[#883bbc] opacity-100'>{formatDate(lastUpdated)}</span>
                          </p>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Task picker */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <label className='block text-black font-medium mb-2'>Task</label>
                      <AnimatedDropdown
                        label={selectedProject ? 'Select a task' : 'Select a project first'}
                        options={projectTasks}
                        selected={selectedTask}
                        onSelect={setSelectedTask}
                        scrollable
                        renderOption={(t) => (
                          <p className='font-semibold text-base'><i className='ri-arrow-right-s-line'></i>{t}</p>
                        )}
                      />
                    </motion.div>

                    {/* Worker pre-loaded images — full editable grid */}
                    {workerImageUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className='px-3 py-3 rounded-lg bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc]/40'
                      >
                        <p className='text-xs font-bold text-[#883bbc] mb-2 flex items-center gap-2'>
                          <i className='ri-user-settings-line'></i> Worker photos ({workerImageUrls.length})
                          <span className='opacity-50 font-normal'>tap · <i className='ri-close-circle-line text-red-400'></i> del · <i className='ri-arrow-left-right-line text-blue-400'></i> replace</span>
                        </p>
                        <div className='flex gap-2 overflow-x-auto pb-1'>
                          {workerImageUrls.map((url, i) => (
                            <div key={i} className='relative shrink-0 w-20 h-20'>
                              <img
                                src={url}
                                alt='worker'
                                onClick={() => setLightbox(url)}
                                className='w-full h-full rounded-lg object-cover border border-[#883bbc]/30 cursor-pointer'
                              />
                              {/* Delete */}
                              <button
                                type='button'
                                onClick={() => setWorkerImageUrls(prev => prev.filter((_, j) => j !== i))}
                                className='absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs'
                              >
                                <i className='ri-close-line'></i>
                              </button>
                              {/* Replace */}
                              <PickerButton
                                className='absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs cursor-pointer'
                                onChange={e => {
                                  const f = e.target.files[0]
                                  if (!f) return
                                  setWorkerImageUrls(prev => prev.filter((_, j) => j !== i))
                                  setImages(prev => {
                                    const slots = [...prev]
                                    const empty = slots.findIndex(s => s === null)
                                    if (empty !== -1) slots[empty] = f
                                    else slots.push(f)
                                    return slots
                                  })
                                }}
                              >
                                <i className='ri-arrow-left-right-line'></i>
                              </PickerButton>
                            </div>
                          ))}
                          {/* Add more to worker section */}
                          <PickerButton
                            multiple
                            className='shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-[#883bbc]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#883bbc] transition-colors'
                            onChange={e => {
                              const files = Array.from(e.target.files)
                              if (!files.length) return
                              setImages(prev => {
                                const slots = [...prev]
                                files.forEach(f => {
                                  const empty = slots.findIndex(s => s === null)
                                  if (empty !== -1) slots[empty] = f
                                  else slots.push(f)
                                })
                                return slots
                              })
                            }}
                          >
                            <i className='ri-image-add-line text-xl text-[#883bbc] opacity-60'></i>
                            <span className='text-[10px] font-semibold opacity-50 mt-0.5'>Add</span>
                          </PickerButton>
                        </div>
                      </motion.div>
                    )}

                    {/* Image uploads — dynamic slots */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className='block text-black font-medium mb-2'>
                        Photos
                        <span className='text-xs opacity-60 font-normal ml-1'>
                          (min. 3 required · {images.filter(Boolean).length + workerImageUrls.length} total)
                        </span>
                      </label>
                      <div className='grid grid-cols-3 md:grid-cols-5 gap-2'>
                        {images.map((file, i) => (
                          <ImageSlot
                            key={i}
                            index={i}
                            file={file}
                            onFileChange={handleImageChange}
                            onRemove={handleImageRemove}
                            isRequired={i < 3}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Work Done */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <label className='block text-black font-medium mb-2'>Work Done</label>
                      <textarea
                        value={workDone}
                        onChange={(e) => setWorkDone(e.target.value)}
                        rows={4}
                        placeholder='Describe what was completed today...'
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-2 text-sm font-semibold placeholder:opacity-50 resize-none focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Work Left */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <label className='block text-black font-medium mb-2'>Work Left</label>
                      <textarea
                        value={workLeft}
                        onChange={(e) => setWorkLeft(e.target.value)}
                        rows={4}
                        placeholder='Describe what remains to be done...'
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-2 text-sm font-semibold placeholder:opacity-50 resize-none focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Notes */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 }}
                    >
                      <label className='block text-black font-medium mb-2'>Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder='Any additional notes...'
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-2 text-sm font-semibold placeholder:opacity-50 resize-none focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Active Rooms */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.68 }}
                    >
                      <label className='block text-black font-medium mb-2'>Active Rooms</label>

                      {/* Add room input */}
                      <div className='flex gap-2'>
                        <div className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                          <i className='ri-home-4-line text-[#883bbc]'></i>
                          <input
                            type='text'
                            value={roomInput}
                            onChange={e => setRoomInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRoom())}
                            placeholder='e.g. Bedroom, Hall...'
                            className='flex-1 bg-transparent outline-none font-semibold text-sm placeholder:opacity-50'
                          />
                        </div>
                        <motion.button
                          type='button'
                          onClick={addRoom}
                          whileTap={{ scale: 0.9 }}
                          className='w-10 h-10 rounded-full bg-[#883bbc] text-white flex items-center justify-center shrink-0'
                        >
                          <i className='ri-add-line text-lg'></i>
                        </motion.button>
                      </div>

                      {/* Room list */}
                      <AnimatePresence>
                        {activeRooms.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className='mt-3 space-y-2 overflow-hidden'
                          >
                            {activeRooms.map((room, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className='flex items-center gap-2 bg-white/50 border border-[#883bbc]/30 rounded-full px-4 py-2'
                              >
                                <div className='w-2 h-2 rounded-full bg-green-500 shrink-0'></div>

                                {editingRoomIdx === idx ? (
                                  <input
                                    autoFocus
                                    value={editingRoomVal}
                                    onChange={e => setEditingRoomVal(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') commitEditRoom(idx)
                                      if (e.key === 'Escape') setEditingRoomIdx(null)
                                    }}
                                    onBlur={() => commitEditRoom(idx)}
                                    className='flex-1 bg-transparent outline-none font-semibold text-sm'
                                  />
                                ) : (
                                  <span className='flex-1 font-semibold text-sm'>{room}</span>
                                )}

                                <button type='button' onClick={() => startEditRoom(idx)} className='w-6 h-6 rounded-full bg-[#883bbc]/10 flex items-center justify-center'>
                                  <i className='ri-edit-line text-[#883bbc] text-xs'></i>
                                </button>
                                <button type='button' onClick={() => deleteRoom(idx)} className='w-6 h-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center'>
                                  <i className='ri-delete-bin-line text-red-400 text-xs'></i>
                                </button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className='flex gap-4 pt-2'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <button
                        type='button'
                        onClick={() => setFormOpen(false)}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium transition-all duration-200'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='update-open-btn'
                        type='submit'
                        disabled={loading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium hover:bg-[#9d4bd1] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-upload-cloud-line'></i><span>Submit</span></>
                        }
                      </motion.button>
                    </motion.div>

                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* Due today section */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%] mb-3'>Updates Due Today :</h1>

            {dueProjects.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>All projects have been updated today.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {dueProjects.map((p, i) => (
                  <motion.div
                    key={p.projectId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    onClick={() => handleDueProjectClick(p)}
                    className='flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 cursor-pointer hover:border-[#883bbc]'
                  >
                    <div className='flex items-center gap-2'>
                      <i className='ri-error-warning-line text-[#883bbc] text-lg'></i>
                      <span className='font-semibold text-base'>{p.projectName}</span>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs opacity-50 font-mono'>Last update</p>
                      <p className='text-sm font-semibold text-[#883bbc]'>{formatDate(p.lastUpdate)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Worker Received section */}
          <section className='w-full relative z-10 pb-20'>
            <h1 className='text-xl font-bold mt-[2%] mb-3 flex items-center gap-2'>
              <i className='ri-user-settings-line text-[#883bbc]'></i> Worker Received :
            </h1>

            {!selectedProject ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>Select a project above to view worker submissions.</p>
              </div>
            ) : workerUpdates.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No pending worker updates for this project.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-4'>
                {workerUpdates.map((wu, i) => (
                  <motion.div
                    key={wu._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.07 }}
                    className='w-full rounded-xl border border-[#883bbc]/40 bg-gradient-to-br from-[#F7D6F3]/60 to-transparent backdrop-blur-sm overflow-hidden'
                  >
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-[#883bbc]/20'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                          <i className='ri-user-3-fill text-white text-sm'></i>
                        </div>
                        <div className='leading-4'>
                          <p className='font-bold text-sm'>{wu.workerId?.name || 'Worker'}</p>
                          <p className='text-xs opacity-50'>{new Date(wu.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {new Date(wu.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      {wu.status === 'retake' && (
                        <span className='text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-500'>Retake</span>
                      )}
                    </div>

                    {/* Editable Photos */}
                    {(() => {
                      const ep = getEditedPhotos(wu)
                      const total = ep.keepUrls.length + ep.newFiles.length
                      return (
                        <div className='px-4 pt-3'>
                          <p className='text-xs font-bold opacity-60 mb-2'>
                            Photos ({total}) — tap to view · <i className='ri-close-circle-line text-red-400'></i> delete · <i className='ri-arrow-left-right-line text-blue-400'></i> replace
                          </p>
                          <div className='flex gap-2 overflow-x-auto pb-2'>

                            {/* Existing URL photos */}
                            {ep.keepUrls.map((src, j) => (
                              <div key={`url-${j}`} className='relative shrink-0 w-24 h-24 group'>
                                <img
                                  src={src}
                                  alt='worker'
                                  onClick={() => setLightbox(src)}
                                  className='w-full h-full rounded-lg object-cover border border-white/30 cursor-pointer'
                                />
                                {/* Delete */}
                                <button
                                  type='button'
                                  onClick={() => deleteWorkerPhoto(wu, j)}
                                  className='absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs leading-none'
                                >
                                  <i className='ri-close-line'></i>
                                </button>
                                {/* Replace */}
                                <PickerButton
                                  className='absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs cursor-pointer'
                                  onChange={e => { if (e.target.files[0]) replaceWorkerPhoto(wu, j, e.target.files[0]) }}
                                >
                                  <i className='ri-arrow-left-right-line'></i>
                                </PickerButton>
                              </div>
                            ))}

                            {/* Newly added file previews */}
                            {ep.newPreviews.map((src, j) => (
                              <div key={`new-${j}`} className='relative shrink-0 w-24 h-24'>
                                <img
                                  src={src}
                                  alt='new'
                                  onClick={() => setLightbox(src)}
                                  className='w-full h-full rounded-lg object-cover border-2 border-[#883bbc]/60 cursor-pointer'
                                />
                                <button
                                  type='button'
                                  onClick={() => deleteNewWorkerPhoto(wu, j)}
                                  className='absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs leading-none'
                                >
                                  <i className='ri-close-line'></i>
                                </button>
                              </div>
                            ))}

                            {/* Add more slot */}
                            <PickerButton
                              multiple
                              className='shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-[#883bbc]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#883bbc] transition-colors'
                              onChange={e => { if (e.target.files.length) addWorkerPhotos(wu, Array.from(e.target.files)) }}
                            >
                              <i className='ri-image-add-line text-2xl text-[#883bbc] opacity-60'></i>
                              <span className='text-[10px] font-semibold opacity-50 mt-1'>Add</span>
                            </PickerButton>

                          </div>
                        </div>
                      )
                    })()}

                    {/* Notes */}
                    {wu.notes && (
                      <div className='px-4 py-3'>
                        <p className='text-xs font-bold opacity-60 mb-1'>Notes</p>
                        <p className='text-sm font-semibold leading-5 opacity-80'>{wu.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex gap-2 px-4 pb-4'>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUseWorkerUpdate(wu)}
                        className='flex-1 py-2.5 rounded-lg bg-[#883bbc] text-white font-bold text-sm flex items-center justify-center gap-2'
                      >
                        <i className='ri-check-line'></i> Use
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRetakeWorkerUpdate(wu)}
                        className='flex-1 py-2.5 rounded-lg border border-[#883bbc] text-[#883bbc] font-bold text-sm flex items-center justify-center gap-2'
                      >
                        <i className='ri-refresh-line'></i> Retake
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminUpdate
