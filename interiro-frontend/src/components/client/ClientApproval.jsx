import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Butterfly from '../../templates/Butterfly'
import Navbar from '../../templates/Navbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'
import moment from 'moment'

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge = ({ priority }) => {
  const styles = {
    high:   { cls: 'bg-red-100 text-red-600',    icon: 'ri-arrow-up-double-line' },
    medium: { cls: 'bg-amber-100 text-amber-600', icon: 'ri-arrow-right-line' },
    low:    { cls: 'bg-green-100 text-green-600', icon: 'ri-arrow-down-double-line' },
  }
  const s = styles[priority] || styles.low
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${s.cls}`}>
      <i className={s.icon}></i>
      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Low'}
    </span>
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ src, onClose }) =>
  createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4'
    >
      <motion.img
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.2 }}
        src={src}
        alt='approval'
        onClick={e => e.stopPropagation()}
        className='max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl'
      />
      <button
        onClick={onClose}
        className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl'
      >
        <i className='ri-close-line'></i>
      </button>
    </motion.div>,
    document.body
  )

// ─── Approval Card ────────────────────────────────────────────────────────────
const ApprovalCard = ({ item, onRespond }) => {
  const [expanded, setExpanded] = useState(false)
  const [clientNote, setClientNote] = useState('')
  const [loading, setLoading] = useState(null) // 'approve' | 'reject' | null
  const [lightbox, setLightbox] = useState(null)
  const isPending = item.status === 'pending'

  const handleRespond = async (action) => {
    setLoading(action)
    try {
      await onRespond(item._id, action, clientNote)
    } finally {
      setLoading(null)
    }
  }

  return (
    <motion.div
      layout
      className={`w-full rounded-lg backdrop-blur-sm border shadow-sm overflow-hidden
        ${item.status === 'approved' ? 'border-green-400/40 bg-gradient-to-r from-green-50/60 to-transparent'
        : item.status === 'rejected' ? 'border-red-400/40 bg-gradient-to-r from-red-50/60 to-transparent'
        : 'border-[#883bbc]/30 bg-gradient-to-r from-white/70 to-transparent'}`}
    >
      {/* Card header — always visible */}
      <div
        className='px-4 py-3 flex items-center justify-between cursor-pointer'
        onClick={() => setExpanded(v => !v)}
      >
        <div className='flex flex-col gap-1 min-w-0 flex-1 pr-3'>
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
            className='ri-arrow-down-s-line text-lg opacity-60'
          />
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='overflow-hidden'
          >
            <div className='px-4 pb-4 space-y-3 border-t border-[#883bbc]/20 pt-3'>

              {/* Priority */}
              <div className='flex items-center gap-2'>
                <span className='text-xs font-semibold opacity-60'>Priority:</span>
                <PriorityBadge priority={item.priority} />
              </div>

              {/* Admin Note */}
              {item.note && (
                <div className='bg-white/60 rounded-lg px-3 py-2'>
                  <p className='text-xs font-bold text-[#883bbc] mb-1'>Admin Note</p>
                  <p className='text-sm font-semibold leading-5'>{item.note}</p>
                </div>
              )}

              {/* Images */}
              {item.images && item.images.length > 0 && (
                <div>
                  <p className='text-xs font-bold opacity-60 mb-2'>Attachments ({item.images.length})</p>
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    {item.images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`img-${i}`}
                        onClick={() => setLightbox(url)}
                        className='w-20 h-20 rounded-lg object-cover border border-[#883bbc]/30 cursor-pointer shrink-0'
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Client's past response note */}
              {!isPending && item.clientNote && (
                <div className='bg-white/60 rounded-lg px-3 py-2'>
                  <p className={`text-xs font-bold mb-1 ${item.status === 'approved' ? 'text-green-600' : 'text-red-500'}`}>
                    Your Note
                  </p>
                  <p className='text-sm font-semibold leading-5'>{item.clientNote}</p>
                </div>
              )}

              {/* Action panel — only for pending */}
              {isPending && (
                <div className='space-y-3 pt-1'>
                  <div>
                    <label className='block text-xs font-bold opacity-60 mb-1'>
                      Note for admin <span className='font-normal'>(optional)</span>
                    </label>
                    <textarea
                      value={clientNote}
                      onChange={e => setClientNote(e.target.value)}
                      rows={3}
                      placeholder='Share your reason or feedback...'
                      className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-2 text-sm font-semibold placeholder:opacity-40 resize-none focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                    />
                  </div>
                  <div className='flex gap-2'>
                    <motion.button
                      type='button'
                      whileTap={{ scale: 0.96 }}
                      disabled={!!loading}
                      onClick={() => handleRespond('approve')}
                      className='flex-1 py-2 rounded-full bg-green-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60'
                    >
                      {loading === 'approve'
                        ? <i className='ri-loader-4-line animate-spin'></i>
                        : <i className='ri-check-line'></i>}
                      Approve
                    </motion.button>
                    <motion.button
                      type='button'
                      whileTap={{ scale: 0.96 }}
                      disabled={!!loading}
                      onClick={() => handleRespond('reject')}
                      className='flex-1 py-2 rounded-full bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-60'
                    >
                      {loading === 'reject'
                        ? <i className='ri-loader-4-line animate-spin'></i>
                        : <i className='ri-close-line'></i>}
                      Reject
                    </motion.button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ClientApproval = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)

  const [approvals, setApprovals] = useState([])
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)

  const [toast, setToast] = useState(null)
  const showToast = (msg) => setToast(msg)
  const hideToast = () => setToast(null)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/approval/my`, { withCredentials: true })
        setApprovals(data?.approvals || [])
        setProjectName(data?.projectName || '')
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 401) {
          navigate('/user/login')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  const handleRespond = async (id, action, clientNote) => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject'
      const { data } = await axios.post(
        `${API_BASE}/approval/${endpoint}/${id}`,
        { clientNote },
        { withCredentials: true }
      )
      const updated = data?.approval || data
      setApprovals(prev => prev.map(a => a._id === updated._id ? updated : a))
      showToast(action === 'approve' ? 'Approval confirmed!' : 'Approval rejected.')
    } catch {
      showToast('Something went wrong. Please try again.')
    }
  }

  const pending  = approvals.filter(a => a.status === 'pending')
  const resolved = approvals.filter(a => a.status !== 'pending')

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      {/* Nav */}
      <nav className='w-full h-full z-10 fixed top-[5%] left-[80%]'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className='menuicon w-[12vw] h-[12vw] items-center justify-center flex'
        >
          <i className='ri-menu-fill text-3xl text-white opacity-90'></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={10} y={7} />
        <figure className='w-[25vw] h-[30vw] absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={hideToast} />}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] py-[6%] relative overflow-y-auto overflow-x-hidden'>

        {/* Header */}
        <header>
          <div className='title w-full text-5xl font-semibold tracking-tight mt-[6%] flex'>
            <h1>Ap</h1>
            <h1 className='text-white'>provals</h1>
          </div>
          <div className='subtitle w-[100%] mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
            <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
              {projectName ? `Project: ${projectName}` : 'Review and respond to approval requests'}
            </h4>
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className='flex items-center justify-center py-20'>
            <i className='ri-loader-4-line animate-spin text-4xl text-white opacity-70'></i>
          </div>
        )}

        {!loading && (
          <section className='w-full relative z-10 pb-20 mt-[5%] space-y-8'>

            {/* ── Pending Approvals ── */}
            <div>
              <div className='flex items-center gap-3 mb-3'>
                <h2 className='text-lg font-bold'>Pending</h2>
                {pending.length > 0 && (
                  <span className='w-5 h-5 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center'>
                    {pending.length}
                  </span>
                )}
              </div>

              {pending.length === 0 ? (
                <div className='px-4 py-4 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                  <p className='text-sm font-semibold opacity-70'>No pending approvals right now.</p>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  {pending.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ApprovalCard item={item} onRespond={handleRespond} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Past Approvals ── */}
            {resolved.length > 0 && (
              <div>
                <h2 className='text-lg font-bold border-b-2 border-zinc-400 pb-3 mb-3'>History</h2>
                <div className='flex flex-col gap-3'>
                  {resolved.map((item, i) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ApprovalCard item={item} onRespond={handleRespond} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </section>
        )}

      </main>
    </div>
  )
}

export default ClientApproval
