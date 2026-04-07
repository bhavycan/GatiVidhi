import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const PRIORITY_STYLES = {
  high:   { badge: 'bg-red-100 text-red-600 border border-red-300',    icon: 'ri-error-warning-line',  dot: 'bg-red-500' },
  medium: { badge: 'bg-yellow-100 text-yellow-600 border border-yellow-300', icon: 'ri-time-line', dot: 'bg-yellow-500' },
  low:    { badge: 'bg-green-100 text-green-600 border border-green-300',   icon: 'ri-checkbox-circle-line', dot: 'bg-green-500' },
}

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

const TicketDetail = ({ ticket, onClose, onResolve, onChat }) => {
  const style = PRIORITY_STYLES[ticket.priorityLevel] || PRIORITY_STYLES.medium
  const client = ticket.projectId?.clientId
  const [resolving, setResolving] = useState(false)
  const [resolved, setResolved] = useState(ticket.resolved || false)

  const handleResolve = async () => {
    setResolving(true)
    try {
      await axios.patch(`${API_BASE}/comment/${ticket._id}/resolve`, {}, { withCredentials: true })
      setResolved(true)
      if (onResolve) onResolve(ticket._id)
    } catch (e) {
      console.error(e)
    } finally {
      setResolving(false)
    }
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center px-[8%] pb-[5%]"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#F7D6F3] to-white border border-[#883bbc]/40 px-5 py-5 shadow-2xl space-y-4"
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className={`capitalize text-base font-semibold px-3 py-1 rounded-full ${style.badge}`}>
            <i className={`${style.icon} mr-1`}></i>{ticket.priorityLevel} priority
          </span>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/60 flex items-center justify-center text-[#883bbc]">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Project */}
        <div>
          <p className="text-xs font-mono opacity-50 mb-1">Project</p>
          <p className="font-bold text-lg">{ticket.projectId?.projectName || '—'}</p>
        </div>

        {/* Note */}
        <div>
          <p className="text-xs font-mono opacity-50 mb-1">Note</p>
          <div className="rounded-lg border border-[#883bbc]/30 bg-white/40 px-3 py-3">
            <p className="font-semibold text-base leading-relaxed">{ticket.note}</p>
          </div>
        </div>

        {/* Received date */}
        <div>
          <p className="text-xs font-mono opacity-50 mb-1">Received</p>
          <p className="font-semibold text-base">{formatDate(ticket.receivedDate)}</p>
        </div>

        {/* Client contact */}
        {client && (
          <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-white/50 border border-[#883bbc]/30">
            <div>
              <p className="text-xs font-mono opacity-50 mb-[2px]">Client Contact</p>
              <p className="font-bold text-lg">{client.name}</p>
              <p className="text-base font-semibold opacity-80">{client.phone}</p>
              <p className="text-sm opacity-60">{client.email}</p>
            </div>
            <motion.a
              href={`tel:${client.phone}`}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 rounded-full bg-[#883bbc] flex items-center justify-center text-white shadow-md shrink-0"
            >
              <i className="ri-phone-fill text-xl"></i>
            </motion.a>
          </div>
        )}

        {/* Chat button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onChat}
          className="w-full rounded-lg border border-[#883bbc] text-[#883bbc] px-4 py-3 flex items-center justify-center gap-2 text-lg font-semibold bg-white/50"
        >
          <i className="ri-chat-3-line"></i> Chat with Client
        </motion.button>

        {/* Resolve button */}
        {resolved ? (
          <div className="w-full rounded-lg bg-green-100 text-green-600 border border-green-300 px-4 py-3 flex items-center justify-center gap-2 text-lg font-semibold">
            <i className="ri-checkbox-circle-fill"></i> Resolved
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleResolve}
            disabled={resolving}
            className="w-full rounded-lg bg-[#883bbc] text-white px-4 py-3 flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-60"
          >
            {resolving
              ? <i className="ri-loader-4-line animate-spin text-xl"></i>
              : <><i className="ri-check-double-line"></i> Mark as Resolved</>
            }
          </motion.button>
        )}
      </motion.div>
    </motion.div>,
    document.body
  )
}

const AdminTickets = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const showToast = (msg) => setToast(msg)
  const hideToast = () => setToast(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/comment/all`, { withCredentials: true })
        setTickets(data?.comments || [])
      } catch (error) {
        console.error(error)
        if (error.response?.status === 400 || error.response?.status === 401) {
          navigate('/admin/login')
        } else {
          showToast('Failed to load tickets')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.priorityLevel === filter)

  const counts = {
    all: tickets.length,
    high: tickets.filter(t => t.priorityLevel === 'high').length,
    medium: tickets.filter(t => t.priorityLevel === 'medium').length,
    low: tickets.filter(t => t.priorityLevel === 'low').length,
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

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={hideToast} />}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <TicketDetail
            ticket={selected}
            onClose={() => setSelected(null)}
            onResolve={(id) => setTickets(prev => prev.map(t => t._id === id ? { ...t, resolved: true } : t))}
            onChat={() => navigate('/admin/chat', {
              state: {
                ticketRef: { ticketId: selected._id, note: selected.note, projectName: selected.projectId?.projectName || '' },
                targetProjectName: selected.projectId?.projectName || '',
              }
            })}
          />
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Client</h1>
              <h1 className='text-white'>Tickets</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                View and manage all client-submitted queries and issues
              </h4>
            </div>
          </header>

          {/* Filter tabs */}
          <section className='w-full relative z-10 mt-[5%]'>
            <div className='flex gap-2 flex-wrap'>
              {['all', 'high', 'medium', 'low'].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setFilter(level)}
                  whileTap={{ scale: 0.96 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors capitalize ${
                    filter === level
                      ? 'bg-[#883bbc] text-white border-[#883bbc]'
                      : 'bg-white/40 border-[#883bbc]/40 hover:border-[#883bbc]'
                  }`}
                >
                  {level} <span className='opacity-60'>({counts[level]})</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Ticket list */}
          <section className='w-full relative z-10 mt-[4%] pb-16'>
            {loading ? (
              <div className='flex items-center justify-center py-10'>
                <i className='ri-loader-4-line animate-spin text-3xl text-[#883bbc]'></i>
              </div>
            ) : filtered.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No tickets found.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {filtered.map((ticket, i) => {
                  const style = PRIORITY_STYLES[ticket.priorityLevel] || PRIORITY_STYLES.medium
                  return (
                    <motion.div
                      key={ticket._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      onClick={() => setSelected(ticket)}
                      className='flex items-start justify-between px-4 py-4 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 cursor-pointer hover:border-[#883bbc] transition-colors'
                    >
                      <div className='flex items-start gap-3 flex-1 min-w-0'>
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${style.dot}`}></div>
                        <div className='min-w-0'>
                          <p className='font-semibold text-base leading-snug truncate'>
                            {ticket.note.slice(0, 70)}{ticket.note.length > 70 ? '...' : ''}
                          </p>
                          <p className='text-xs opacity-60 font-mono mt-1'>
                            {ticket.projectId?.projectName || 'Unknown Project'}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col items-end gap-2 ml-3 shrink-0'>
                        {ticket.resolved ? (
                          <span className='text-xs font-semibold px-2 py-[2px] rounded-full bg-green-100 text-green-600 border border-green-300'>
                            Resolved
                          </span>
                        ) : (
                          <span className={`capitalize text-xs font-semibold px-2 py-[2px] rounded-full ${style.badge}`}>
                            {ticket.priorityLevel}
                          </span>
                        )}
                        <p className='text-xs opacity-50 font-mono'>{formatDate(ticket.receivedDate)}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminTickets
