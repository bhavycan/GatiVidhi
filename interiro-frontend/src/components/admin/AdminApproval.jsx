import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import ImagePickerSheet from '../common/ImagePickerSheet'
import axios from 'axios'
import { API_BASE } from '../../config.js'
import moment from 'moment'

// ─── Toast ───────────────────────────────────────────────────────────────────
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

// ─── Animated Dropdown ────────────────────────────────────────────────────────
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

// ─── Image Slot ───────────────────────────────────────────────────────────────
const ImageSlot = ({ index, file, onFileChange, onRemove }) => {
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

      {!file && (
        <div
          onClick={() => setPickerOpen(true)}
          className='w-full h-full flex flex-col items-center justify-center gap-1 text-[#883bbc] opacity-70 cursor-pointer hover:opacity-100 transition-opacity'
        >
          <i className='ri-image-add-line text-3xl'></i>
          <span className='text-xs font-semibold'>Optional</span>
        </div>
      )}

      {file && (
        <>
          <img src={preview} alt={`upload-${index}`} className='w-full h-full object-cover' />

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

          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className='absolute inset-0 bg-black/50 flex items-center justify-center gap-3'
              >
                <motion.button
                  type='button'
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPickerOpen(true)}
                  className='w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-[#883bbc] hover:bg-white transition-colors'
                  title='Change image'
                >
                  <i className='ri-pencil-line text-base'></i>
                </motion.button>

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

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending:  'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  }
  const labels = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || 'Pending'}
    </span>
  )
}

// ─── Approval History Card (expandable) ──────────────────────────────────────
const ApprovalHistoryCard = ({ item, index, clientPhone, reminderLoading, onRemind, onEdit, onChat }) => {
  const [expanded, setExpanded] = useState(false)

  const priorityColor = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-green-600' }
  const priorityIcon  = { high: 'ri-arrow-up-double-line', medium: 'ri-arrow-right-line', low: 'ri-arrow-down-double-line' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
      className='w-full bg-gradient-to-r from-white/70 to-transparent backdrop-blur-sm border border-[#883bbc]/30 rounded-lg shadow-sm overflow-hidden'
    >
      {/* Header row — always visible, click to expand */}
      <div
        className='px-4 py-3 flex items-center justify-between cursor-pointer'
        onClick={() => setExpanded(v => !v)}
      >
        <div className='flex flex-col gap-0.5 min-w-0 flex-1 pr-2'>
          <h4 className='font-bold text-sm leading-5 truncate'>{item.title}</h4>
          <p className='text-xs opacity-60 font-semibold'>
            {moment(item.date || item.createdAt).format('DD MMM YYYY')}
          </p>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <StatusBadge status={item.status} />
          <motion.i
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className='ri-arrow-down-s-line text-lg opacity-50'
          />
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className='overflow-hidden border-t border-[#883bbc]/15'
          >
            <div className='px-4 py-3 space-y-3'>

              {/* Priority */}
              <div className='flex items-center gap-2'>
                <span className='text-xs opacity-60 font-semibold'>Priority:</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${priorityColor[item.priority] || 'text-green-600'}`}>
                  <i className={priorityIcon[item.priority] || 'ri-arrow-down-double-line'}></i>
                  {item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Low'}
                </span>
              </div>

              {/* Admin note sent to client */}
              {item.note && (
                <div className='bg-white/50 rounded-lg px-3 py-2'>
                  <p className='text-xs font-bold text-[#883bbc] mb-1'>Your Note</p>
                  <p className='text-sm font-semibold leading-5'>{item.note}</p>
                </div>
              )}

              {/* Attached images */}
              {item.images && item.images.length > 0 && (
                <div>
                  <p className='text-xs font-bold opacity-60 mb-2'>Attachments ({item.images.length})</p>
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    {item.images.map((url, i) => (
                      <a key={i} href={url} target='_blank' rel='noreferrer'>
                        <img
                          src={url}
                          alt={`img-${i}`}
                          className='w-20 h-20 rounded-lg object-cover border border-[#883bbc]/30 shrink-0 cursor-pointer hover:opacity-90 transition-opacity'
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Client's response note */}
              {item.clientNote && item.status !== 'pending' && (
                <div className='bg-white/50 rounded-lg px-3 py-2'>
                  <p className={`text-xs font-bold mb-1 ${item.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                    Client Note
                  </p>
                  <p className='text-sm font-semibold leading-5'>{item.clientNote}</p>
                </div>
              )}

              {/* Responded at */}
              {item.respondedAt && (
                <p className='text-xs opacity-40 font-semibold'>
                  Responded {moment(item.respondedAt).fromNow()}
                </p>
              )}

              {/* Actions */}
              <div className='flex items-center gap-2 pt-1 flex-wrap'>
                {/* Pending — Remind */}
                {item.status === 'pending' && (
                  <motion.button
                    type='button'
                    whileTap={{ scale: 0.92 }}
                    disabled={reminderLoading === item._id}
                    onClick={(e) => { e.stopPropagation(); onRemind(item._id) }}
                    className='text-xs font-bold px-3 py-1.5 rounded-full border border-[#883bbc] text-[#883bbc] flex items-center gap-1 disabled:opacity-50'
                  >
                    {reminderLoading === item._id
                      ? <i className='ri-loader-4-line animate-spin'></i>
                      : <i className='ri-notification-2-line'></i>}
                    Remind
                  </motion.button>
                )}

                {/* Rejected — Call + Edit */}
                {item.status === 'rejected' && (
                  <>
                    {clientPhone && (
                      <motion.a
                        href={`tel:${clientPhone}`}
                        whileTap={{ scale: 0.92 }}
                        onClick={e => e.stopPropagation()}
                        className='text-xs font-bold px-3 py-1.5 rounded-full border border-green-500 text-green-600 flex items-center gap-1'
                      >
                        <i className='ri-phone-line'></i> Call
                      </motion.a>
                    )}
                    <motion.button
                      type='button'
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => { e.stopPropagation(); onEdit(item) }}
                      className='text-xs font-bold px-3 py-1.5 rounded-full border border-[#883bbc] text-[#883bbc] flex items-center gap-1'
                    >
                      <i className='ri-pencil-line'></i> Edit
                    </motion.button>
                  </>
                )}

                {/* Chat — always visible */}
                <motion.button
                  type='button'
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => { e.stopPropagation(); onChat(item) }}
                  className='text-xs font-bold px-3 py-1.5 rounded-full border border-[#883bbc] text-[#883bbc] flex items-center gap-1'
                >
                  <i className='ri-chat-3-line'></i> Chat
                </motion.button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminApproval = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)

  // Projects
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)

  // Form visibility
  const [isFormOpen, setFormOpen] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'))
  const [priority, setPriority] = useState(null)
  const [images, setImages] = useState([null, null, null])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Past approvals
  const [approvals, setApprovals] = useState([])
  const [approvalsLoading, setApprovalsLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(null)
  const [clientPhone, setClientPhone] = useState(null)

  // Edit mode — holds the approval being edited (null = create mode)
  const [editingApproval, setEditingApproval] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const formRef = useRef(null)

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (msg) => setToast(msg)
  const hideToast = () => setToast(null)

  const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

  // ── Fetch projects on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/project/all`, { withCredentials: true })
        setProjects(data?.projects || [])
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          navigate('/admin/login')
        }
      }
    }
    fetchProjects()
  }, [])

  // ── Fetch approvals when project changes ─────────────────────────────────
  useEffect(() => {
    if (!selectedProject) {
      setApprovals([])
      setClientPhone(null)
      return
    }
    const fetchApprovals = async () => {
      setApprovalsLoading(true)
      try {
        const { data } = await axios.get(`${API_BASE}/approval/by-project/${selectedProject._id}`, { withCredentials: true })
        setApprovals(data?.approvals || [])
        setClientPhone(data?.clientPhone || null)
      } catch {
        setApprovals([])
      } finally {
        setApprovalsLoading(false)
      }
    }
    fetchApprovals()
  }, [selectedProject])

  // ── Image handlers ────────────────────────────────────────────────────────
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

  // ── Reset form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle('')
    setDate(moment().format('YYYY-MM-DD'))
    setPriority(null)
    setImages([null, null, null])
    setNote('')
    setFormOpen(false)
    setEditingApproval(null)
  }

  // ── Navigate to chat with approval reference draft ───────────────────────
  const handleChat = (item) => {
    navigate('/admin/chat', {
      state: {
        approvalRef: { approvalId: item._id, title: item.title, projectName: selectedProject?.projectName || item.projectName || '' },
        targetProjectName: selectedProject?.projectName || item.projectName || '',
      }
    })
  }

  // ── Open form pre-filled with a rejected approval ─────────────────────────
  const handleEditStart = (item) => {
    setEditingApproval(item)
    setTitle(item.title)
    setDate(moment(item.date || item.createdAt).format('YYYY-MM-DD'))
    setPriority(item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : null)
    setNote(item.note || '')
    setImages([null, null, null])
    setFormOpen(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  // ── Submit (create or edit) ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showToast('Please select a project first')
    if (!title.trim()) return showToast('Title is required')
    if (!priority) return showToast('Please select a priority')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('date', date)
    formData.append('priority', priority.toLowerCase())
    formData.append('note', note)
    images.filter(Boolean).forEach(img => formData.append('images', img))

    // ── Edit mode ──
    if (editingApproval) {
      setEditLoading(true)
      try {
        const { data } = await axios.put(`${API_BASE}/approval/edit/${editingApproval._id}`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const updated = data?.approval || data
        setApprovals(prev => prev.map(a => a._id === updated._id ? updated : a))
        resetForm()
        showToast('Approval updated and resubmitted!')
      } catch (error) {
        showToast(error.response?.data?.message || 'Something went wrong.')
      } finally {
        setEditLoading(false)
      }
      return
    }

    // ── Create mode ──
    formData.append('projectId', selectedProject._id)
    formData.append('projectName', selectedProject.projectName)

    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/approval/create`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setApprovals(prev => [data?.approval || data, ...prev])
      resetForm()
      showToast('Approval request sent!')
    } catch (error) {
      showToast(error.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Send reminder ──────────────────────────────────────────────────────────
  const handleReminder = async (approvalId) => {
    setReminderLoading(approvalId)
    try {
      await axios.post(`${API_BASE}/approval/remind/${approvalId}`, {}, { withCredentials: true })
      showToast('Reminder sent to client!')
    } catch (error) {
      const detail = error.response?.data?.detail || error.response?.data?.message || 'Failed to send reminder.'
      showToast(detail)
    } finally {
      setReminderLoading(null)
    }
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      {/* Nav */}
      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer"
        >
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={hideToast} />}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          {/* Header */}
          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-[2%]'>
              <h1>Client</h1>
              <h1 className='text-white'>Approvals</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Request approvals from clients on project decisions
              </h4>
            </div>
          </header>

          {/* ── Project Selector (outside form) ── */}
          <section className='w-full mt-[5%]'>
            <h1 className='text-xl font-bold mb-3'>Select Project :</h1>
            <AnimatedDropdown
              label='Choose a project'
              options={projects}
              selected={selectedProject}
              onSelect={(p) => { setSelectedProject(p); setFormOpen(false); resetForm() }}
              renderSelected={(p) => p.projectName}
              renderOption={(p) => (
                <>
                  <p className='font-semibold text-base'>{p.projectName}</p>
                  <p className='text-xs opacity-50 font-mono mt-[2px]'>{p._id}</p>
                </>
              )}
              scrollable
            />
            {selectedProject && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='text-xs font-mono opacity-50 mt-1 pl-2'
              >
                ID: {selectedProject._id}
              </motion.p>
            )}
          </section>

          {/* ── New / Edit Approval Form ── */}
          <section ref={formRef} className='w-full mt-[6%] relative z-10 pb-4'>
            <h1 className='text-xl font-bold'>
              {editingApproval ? 'Edit Approval :' : 'New Approval :'}
            </h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p className='text-sm font-semibold opacity-70'>
                      {selectedProject
                        ? `Create an approval request for ${selectedProject.projectName}.`
                        : 'Select a project above, then create an approval request.'}
                    </p>
                    <motion.div
                      layoutId='approval-open-btn'
                      onClick={() => selectedProject ? setFormOpen(true) : showToast('Select a project first')}
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
                  className='border border-[#883bbc] w-full mt-[4%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleSubmit}
                    className='px-3 py-4 space-y-5'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >

                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <label className='block text-black font-medium mb-2'>Title</label>
                      <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='e.g. Approve flooring material selection...'
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Date */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className='block text-black font-medium mb-2'>Date</label>
                      <input
                        type='date'
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Priority */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      <label className='block text-black font-medium mb-2'>Priority</label>
                      <AnimatedDropdown
                        label='Select priority'
                        options={PRIORITY_OPTIONS}
                        selected={priority}
                        onSelect={setPriority}
                        renderOption={(p) => {
                          const color = p === 'High' ? 'text-red-600' : p === 'Medium' ? 'text-amber-600' : 'text-green-600'
                          const icon = p === 'High' ? 'ri-arrow-up-double-line' : p === 'Medium' ? 'ri-arrow-right-line' : 'ri-arrow-down-double-line'
                          return (
                            <p className={`font-semibold text-base flex items-center gap-2 ${color}`}>
                              <i className={icon}></i>{p}
                            </p>
                          )
                        }}
                        renderSelected={(p) => {
                          const color = p === 'High' ? 'text-red-600' : p === 'Medium' ? 'text-amber-600' : 'text-green-600'
                          const icon = p === 'High' ? 'ri-arrow-up-double-line' : p === 'Medium' ? 'ri-arrow-right-line' : 'ri-arrow-down-double-line'
                          return (
                            <span className={`flex items-center gap-2 ${color}`}>
                              <i className={icon}></i>{p}
                            </span>
                          )
                        }}
                      />
                    </motion.div>

                    {/* Images (optional) */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <label className='block text-black font-medium mb-2'>
                        Photos
                        <span className='text-xs opacity-60 font-normal ml-1'>(optional · {images.filter(Boolean).length} added)</span>
                      </label>
                      <div className='grid grid-cols-3 md:grid-cols-5 gap-2'>
                        {images.map((file, i) => (
                          <ImageSlot
                            key={i}
                            index={i}
                            file={file}
                            onFileChange={handleImageChange}
                            onRemove={handleImageRemove}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Note */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 }}
                    >
                      <label className='block text-black font-medium mb-2'>Note</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        placeholder='Describe what needs client approval...'
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-2 text-sm font-semibold placeholder:opacity-50 resize-none focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                      />
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className='flex items-center gap-3 pt-1'
                    >
                      <motion.button
                        type='submit'
                        disabled={loading || editLoading}
                        whileTap={{ scale: 0.97 }}
                        className='flex-1 py-2.5 rounded-full bg-[#883bbc] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60'
                      >
                        {(loading || editLoading)
                          ? <><i className='ri-loader-4-line animate-spin'></i> {editingApproval ? 'Saving...' : 'Sending...'}</>
                          : editingApproval
                            ? <><i className='ri-refresh-line'></i> Resubmit</>
                            : <><i className='ri-send-plane-fill'></i> Send</>}
                      </motion.button>
                      <motion.button
                        type='button'
                        whileTap={{ scale: 0.97 }}
                        onClick={resetForm}
                        className='flex-1 py-2.5 rounded-full border border-[#883bbc] text-[#883bbc] font-bold text-sm flex items-center justify-center gap-2'
                      >
                        <i className='ri-close-line'></i> Cancel
                      </motion.button>
                    </motion.div>

                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Past Approvals ── */}
          <section className='w-full mt-[6%] pb-20'>
            <h1 className='text-xl font-bold border-b-2 border-zinc-400 pb-3 mb-4'>
              Approvals {selectedProject ? `— ${selectedProject.projectName}` : ''}
            </h1>

            {!selectedProject && (
              <p className='text-sm font-semibold opacity-50 text-center py-8'>
                Select a project to view past approvals.
              </p>
            )}

            {selectedProject && approvalsLoading && (
              <div className='flex items-center justify-center py-10'>
                <i className='ri-loader-4-line animate-spin text-3xl text-[#883bbc]'></i>
              </div>
            )}

            {selectedProject && !approvalsLoading && approvals.length === 0 && (
              <p className='text-sm font-semibold opacity-50 text-center py-8'>
                No approvals yet for this project.
              </p>
            )}

            <div className='flex flex-col gap-3'>
              {approvals.map((item, index) => (
                <ApprovalHistoryCard
                  key={item._id || index}
                  item={item}
                  index={index}
                  clientPhone={clientPhone}
                  reminderLoading={reminderLoading}
                  onRemind={handleReminder}
                  onEdit={handleEditStart}
                  onChat={handleChat}
                />
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminApproval
