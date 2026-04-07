import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAdminMsg } from '../../context/AdminMsgContext.jsx'
import { AnimatePresence, motion } from 'motion/react'
import axios from 'axios'
import AdminNavbar from '../../templates/AdminNavbar'
import Butterfly from '../../templates/Butterfly'
import { API_BASE } from '../../config.js'

const avatarColors = ['#883bbc', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

const MessageImages = ({ images }) => (
  <div className={`grid gap-1 mt-1 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
    {images.map((url, i) => (
      <a key={i} href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="" className="rounded-lg object-cover w-full max-h-48 cursor-pointer hover:opacity-90 transition-opacity" />
      </a>
    ))}
  </div>
)

const UpdateRefCard = ({ updateRef, dark }) => (
  <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-1 border ${dark ? 'bg-white/20 border-white/30' : 'bg-[#883bbc]/10 border-[#883bbc]/30'}`}>
    <i className={`ri-link text-sm mt-0.5 shrink-0 ${dark ? 'text-white/80' : 'text-[#883bbc]'}`}></i>
    <div className='min-w-0'>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/70' : 'text-[#883bbc]'}`}>Referencing Update</p>
      <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : ''}`}>{updateRef.date}</p>
      {updateRef.workDone && (
        <p className={`text-[11px] line-clamp-2 ${dark ? 'text-white/60' : 'opacity-60'}`}>{updateRef.workDone}</p>
      )}
    </div>
  </div>
)

const TicketRefCard = ({ ticketRef, dark, onRemove }) => (
  <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-1 border ${dark ? 'bg-white/20 border-white/30' : 'bg-[#883bbc]/10 border-[#883bbc]/30'}`}>
    <i className={`ri-ticket-2-line text-sm mt-0.5 shrink-0 ${dark ? 'text-white/80' : 'text-[#883bbc]'}`}></i>
    <div className='min-w-0 flex-1'>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/70' : 'text-[#883bbc]'}`}>Referencing Ticket</p>
      <p className={`text-xs font-semibold line-clamp-2 ${dark ? 'text-white' : ''}`}>{ticketRef.note}</p>
      {ticketRef.projectName && (
        <p className={`text-[11px] line-clamp-1 ${dark ? 'text-white/60' : 'opacity-60'}`}>{ticketRef.projectName}</p>
      )}
    </div>
    {onRemove && (
      <button onClick={onRemove} className={`shrink-0 text-lg leading-none ${dark ? 'text-white/60' : 'text-[#883bbc]/60'}`}>
        <i className='ri-close-line'></i>
      </button>
    )}
  </div>
)

const ApprovalRefCard = ({ approvalRef, dark, onRemove }) => (
  <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-1 border ${dark ? 'bg-white/20 border-white/30' : 'bg-[#883bbc]/10 border-[#883bbc]/30'}`}>
    <i className={`ri-ticket-2-line text-sm mt-0.5 shrink-0 ${dark ? 'text-white/80' : 'text-[#883bbc]'}`}></i>
    <div className='min-w-0 flex-1'>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/70' : 'text-[#883bbc]'}`}>Referencing Ticket</p>
      <p className={`text-xs font-semibold truncate ${dark ? 'text-white' : ''}`}>{approvalRef.title}</p>
      {approvalRef.projectName && (
        <p className={`text-[11px] line-clamp-1 ${dark ? 'text-white/60' : 'opacity-60'}`}>{approvalRef.projectName}</p>
      )}
    </div>
    {onRemove && (
      <button onClick={onRemove} className={`shrink-0 text-lg leading-none ${dark ? 'text-white/60' : 'text-[#883bbc]/60'}`}>
        <i className='ri-close-line'></i>
      </button>
    )}
  </div>
)

const AdminChat = () => {
  const location = useLocation()
  const { clearCount } = useAdminMsg()

  // Clear unread badge when this page mounts
  useEffect(() => { clearCount() }, [])
  const [isopen, setOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [approvalRef, setApprovalRef] = useState(null)
  const [pendingApprovalNav, setPendingApprovalNav] = useState(
    () => location.state?.approvalRef ? location.state : null
  )
  const [ticketRef, setTicketRef] = useState(null)
  const [pendingTicketNav, setPendingTicketNav] = useState(
    () => location.state?.ticketRef ? location.state : null
  )
  const socketRef = useRef(null)
  const chatRef = useRef(null)
  const parent = useRef(null)
  const activeRef = useRef(null)

  // Load conversations
  useEffect(() => {
    axios.get(`${API_BASE}/chat/dm/conversations`, { withCredentials: true })
      .then(res => { setConversations(res.data.conversations || []); setLoadingConvs(false) })
      .catch(() => setLoadingConvs(false))
  }, [])

  // Auto-select conversation when navigating from Approvals page
  useEffect(() => {
    if (!pendingApprovalNav || loadingConvs || conversations.length === 0) return
    const match = conversations.find(c =>
      c.projectName?.toLowerCase() === pendingApprovalNav.targetProjectName?.toLowerCase()
    )
    if (match) {
      setActive(match)
      setApprovalRef(pendingApprovalNav.approvalRef)
      setPendingApprovalNav(null)
    }
  }, [conversations, loadingConvs, pendingApprovalNav])

  // Auto-select conversation when navigating from Tickets page
  useEffect(() => {
    if (!pendingTicketNav || loadingConvs || conversations.length === 0) return
    const match = conversations.find(c =>
      c.projectName?.toLowerCase() === pendingTicketNav.targetProjectName?.toLowerCase()
    )
    if (match) {
      setActive(match)
      setTicketRef(pendingTicketNav.ticketRef)
      setPendingTicketNav(null)
    }
  }, [conversations, loadingConvs, pendingTicketNav])

  // Keep ref in sync so socket handlers can read active without stale closures
  useEffect(() => { activeRef.current = active }, [active])

  // Connect admin socket — joins admin-broadcast automatically to receive all messages
  useEffect(() => {
    const socket = io(`${API_BASE}/dm`, {
      auth: { role: 'admin' },
    })
    socketRef.current = socket

    // dm:message → full message for the open chat view (from specific room join)
    socket.on('dm:message', (msg) => {
      if (msg.senderRole !== 'client') return
      const cid = String(msg.clientId)
      if (activeRef.current && String(activeRef.current.clientId) === cid) {
        setMessages(m => [...m, {
          id: msg._id,
          from: 'client',
          text: msg.text,
          images: msg.images || [],
          updateRef: msg.updateRef || null,
          approvalRef: msg.approvalRef || null,
          ticketRef: msg.ticketRef || null,
          createdAt: msg.createdAt,
        }])
      }
    })

    // dm:notify → lightweight event for conversations list (from admin-broadcast)
    socket.on('dm:notify', ({ clientId: cid, lastText, lastRole, lastAt }) => {
      const cidStr = String(cid)
      setConversations(prev => {
        const exists = prev.find(c => String(c.clientId) === cidStr)
        if (exists) {
          return prev.map(c =>
            String(c.clientId) === cidStr
              ? { ...c, lastText, lastRole, lastAt }
              : c
          )
        }
        return [{ clientId: cid, clientName: 'Client', projectName: '', lastText, lastRole, lastAt }, ...prev]
      })
    })

    return () => socket.disconnect()
  }, [])

  // Load history when a conversation is selected
  useEffect(() => {
    if (!active) return
    setLoadingMsgs(true)
    socketRef.current?.emit('dm:join', String(active.clientId))

    axios.get(`${API_BASE}/chat/dm/history/${active.clientId}`, { withCredentials: true })
      .then(res => {
        setMessages((res.data.messages || []).map(m => ({
          id: m._id,
          from: m.senderRole,
          text: m.text,
          images: m.images || [],
          updateRef: m.updateRef || null,
          approvalRef: m.approvalRef || null,
          ticketRef: m.ticketRef || null,
          createdAt: m.createdAt,
        })))
        setLoadingMsgs(false)
      })
      .catch(() => setLoadingMsgs(false))
  }, [active])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !active || !socketRef.current) return

    const clientId = String(active.clientId)
    const now = new Date().toISOString()
    setMessages(prev => [...prev, { id: `local-${Date.now()}`, from: 'admin', text, updateRef: null, approvalRef: approvalRef || null, ticketRef: ticketRef || null, createdAt: now }])
    const payload = { targetClientId: clientId, text }
    if (approvalRef) payload.approvalRef = approvalRef
    if (ticketRef) payload.ticketRef = ticketRef
    socketRef.current.emit('dm:send', payload)
    setConversations(prev => prev.map(c =>
      String(c.clientId) === clientId
        ? { ...c, lastText: text, lastRole: 'admin', lastAt: now }
        : c
    ))
    setInput('')
    setApprovalRef(null)
    setTicketRef(null)
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Menu */}
      <nav className="z-10 fixed mt-[10%] right-4 md:top-6 md:right-8">
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer"
        >
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode="wait">
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      {/* Background */}
      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img className="w-full h-full object-cover" src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} y={16} x={5} />
      </section>

      <main className="w-full h-full pt-[4%] pb-[2%] relative flex flex-col overflow-hidden">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden px-[5%]">

          {/* Header */}
          <header className="shrink-0 mt-[6%]">
            <div className="text-4xl md:text-5xl font-semibold tracking-tight flex gap-[3%]">
              <h1>Client</h1>
              <h1 className="text-white">Chats<span className="text-black">.</span></h1>
            </div>
            <div className="w-[50%] pb-3 border-b-2 border-white mt-[3%]" />
          </header>

          {active ? (
            // ── Chat view ─────────────────────────────────────────────────
            <div className="flex flex-col flex-1 overflow-hidden mt-4">
              {/* Back + name bar */}
              <div className="flex items-center gap-3 mb-3 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActive(null)}
                  className="w-9 h-9 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center border border-white shadow"
                >
                  <i className="ri-arrow-left-s-line text-xl text-[#883bbc]"></i>
                </motion.button>
                <div className="w-9 h-9 rounded-full bg-[#883bbc] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials(active.clientName)}
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{active.clientName}</p>
                  <p className="text-[11px] opacity-60">{active.projectName}</p>
                </div>
              </div>

              {/* Messages */}
              <section ref={chatRef} className="flex-1 overflow-y-auto flex flex-col gap-3 py-2">
                {loadingMsgs && <p className="text-center text-xs opacity-50">Loading…</p>}
                {!loadingMsgs && messages.length === 0 && (
                  <p className="text-center text-xs opacity-50 mt-6">No messages yet</p>
                )}
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isAdmin = msg.from === 'admin'
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        {/* Update reference card */}
                        {msg.updateRef?.updateId && (
                          <div className={`w-[75%] ${isAdmin ? 'mr-0' : 'ml-9'}`}>
                            <UpdateRefCard updateRef={msg.updateRef} dark={isAdmin} />
                          </div>
                        )}
                        {/* Approval reference card */}
                        {msg.approvalRef?.approvalId && (
                          <div className={`w-[75%] ${isAdmin ? 'mr-0' : 'ml-9'}`}>
                            <ApprovalRefCard approvalRef={msg.approvalRef} dark={isAdmin} />
                          </div>
                        )}
                        {/* Ticket reference card */}
                        {msg.ticketRef?.ticketId && (
                          <div className={`w-[75%] ${isAdmin ? 'mr-0' : 'ml-9'}`}>
                            <TicketRefCard ticketRef={msg.ticketRef} dark={isAdmin} />
                          </div>
                        )}

                        <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}>
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-[#883bbc]/80 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-1">
                              {initials(active.clientName)}
                            </div>
                          )}
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium
                            ${isAdmin
                              ? 'bg-[#883bbc] text-white rounded-br-none shadow-lg shadow-[#883bbc]/30'
                              : 'bg-white/70 backdrop-blur-md text-black rounded-bl-none shadow-md border border-white'
                            }`}
                          >
                            {msg.images?.length > 0 && <MessageImages images={msg.images} />}
                            {msg.text && <p className={msg.images?.length > 0 ? 'mt-1' : ''}>{msg.text}</p>}
                            {msg.createdAt && (
                              <p className={`text-[9px] mt-1 ${isAdmin ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </section>

              {/* Input */}
              <form onSubmit={sendMessage} className="shrink-0 flex flex-col gap-2 py-3 border-t border-white/40">
                {approvalRef && (
                  <ApprovalRefCard approvalRef={approvalRef} onRemove={() => setApprovalRef(null)} />
                )}
                {ticketRef && (
                  <TicketRefCard ticketRef={ticketRef} onRemove={() => setTicketRef(null)} />
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Reply to client..."
                    className="flex-1 bg-white/50 backdrop-blur-md border border-white rounded-full px-5 py-3 text-sm font-medium outline-none placeholder:opacity-60 focus:bg-white/70 transition-colors"
                    autoComplete="off"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    disabled={!input.trim()}
                    className="w-11 h-11 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    <i className="ri-send-plane-fill text-white text-lg"></i>
                  </motion.button>
                </div>
              </form>
            </div>
          ) : (
            // ── Conversations list ─────────────────────────────────────────
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col gap-2">
              {loadingConvs && <p className="text-center text-sm opacity-50 mt-8">Loading…</p>}
              {!loadingConvs && conversations.length === 0 && (
                <p className="text-center text-sm opacity-50 mt-8">No conversations yet</p>
              )}
              {conversations.map((c, i) => (
                <motion.button
                  key={String(c.clientId)}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActive(c)}
                  className="w-full flex items-center gap-3 bg-white/60 backdrop-blur-md border border-white/70 rounded-xl px-4 py-3 text-left shadow"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: avatarColors[i % avatarColors.length] }}
                  >
                    {initials(c.clientName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold truncate">{c.clientName}</span>
                      <span className="text-[10px] opacity-50 shrink-0 ml-2">{timeAgo(c.lastAt)}</span>
                    </div>
                    <p className="text-[11px] opacity-50 truncate">{c.projectName}</p>
                    <p className="text-xs font-medium opacity-70 truncate mt-0.5">{c.lastText}</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-[#883bbc] text-xl shrink-0"></i>
                </motion.button>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default AdminChat
