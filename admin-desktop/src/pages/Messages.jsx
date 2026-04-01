import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Search, MoreHorizontal, Send } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL
const avatarColors = ['#883bbc','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']

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

function UpdateRefCard({ updateRef, dark }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3 py-2 mb-1 border text-xs
      ${dark ? 'bg-white/20 border-white/30' : 'bg-purple-50 border-purple-200'}`}>
      <span className={`mt-0.5 shrink-0 ${dark ? 'text-white/70' : 'text-purple-500'}`}>📎</span>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/70' : 'text-purple-500'}`}>
          Referencing Update
        </p>
        <p className={`font-semibold truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{updateRef.date}</p>
        {updateRef.workDone && (
          <p className={`text-[11px] line-clamp-2 ${dark ? 'text-white/60' : 'text-gray-500'}`}>{updateRef.workDone}</p>
        )}
      </div>
    </div>
  )
}

export default function Messages() {
  const [search, setSearch] = useState('')
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const socketRef = useRef(null)
  const bottomRef = useRef(null)
  const activeRef = useRef(null)

  // Keep ref in sync so socket handlers can read active without stale closures
  useEffect(() => { activeRef.current = active }, [active])

  // Load conversations
  useEffect(() => {
    axios.get(`${BASE_URL}/chat/dm/conversations`, { withCredentials: true })
      .then(res => { setConversations(res.data.conversations || []); setLoadingConvs(false) })
      .catch(() => setLoadingConvs(false))
  }, [])

  // Connect admin socket — joins admin-broadcast to receive all client messages
  useEffect(() => {
    const socket = io(`${BASE_URL}/dm`, {
      auth: { role: 'admin' },
    })
    socketRef.current = socket

    // dm:message → full message for the open chat view (specific room)
    socket.on('dm:message', (msg) => {
      if (msg.senderRole !== 'client') return
      const cid = String(msg.clientId)
      if (activeRef.current && String(activeRef.current.clientId) === cid) {
        setMessages(m => [...m, {
          id: msg._id,
          from: 'client',
          text: msg.text,
          updateRef: msg.updateRef || null,
          createdAt: msg.createdAt,
        }])
      }
    })

    // dm:notify → lightweight event for conversations list (admin-broadcast)
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

  // Load history when conversation selected
  useEffect(() => {
    if (!active) return
    setLoadingMsgs(true)
    socketRef.current?.emit('dm:join', String(active.clientId))

    axios.get(`${BASE_URL}/chat/dm/history/${active.clientId}`, { withCredentials: true })
      .then(res => {
        setMessages((res.data.messages || []).map(m => ({
          id: m._id,
          from: m.senderRole,
          text: m.text,
          updateRef: m.updateRef || null,
          createdAt: m.createdAt,
        })))
        setLoadingMsgs(false)
      })
      .catch(() => setLoadingMsgs(false))
  }, [active])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !active || !socketRef.current) return

    const clientId = String(active.clientId)
    const now = new Date().toISOString()
    setMessages(prev => [...prev, { id: `local-${Date.now()}`, from: 'admin', text, updateRef: null, createdAt: now }])
    socketRef.current.emit('dm:send', { targetClientId: clientId, text })
    setConversations(prev => prev.map(c =>
      String(c.clientId) === clientId
        ? { ...c, lastText: text, lastRole: 'admin', lastAt: now }
        : c
    ))
    setInput('')
  }

  const filtered = conversations.filter(c =>
    c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.projectName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-50">
          <div className="text-sm font-bold text-gray-900 mb-3">Messages</div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Search size={13} className="text-gray-400" />
            <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              placeholder="Search conversations…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && (
            <div className="text-xs text-gray-400 text-center py-6">Loading…</div>
          )}
          {!loadingConvs && filtered.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-6">No conversations yet</div>
          )}
          {filtered.map((c, i) => (
            <button key={String(c.clientId)} onClick={() => setActive(c)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50
                ${active?.clientId === c.clientId ? 'bg-purple-50 border-l-2' : ''}`}
              style={active?.clientId === c.clientId ? { borderLeftColor: '#883bbc' } : {}}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: avatarColors[i % avatarColors.length] }}>
                {initials(c.clientName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 truncate">{c.clientName}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(c.lastAt)}</span>
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">{c.projectName}</div>
                <div className="text-[10px] text-gray-400 truncate">{c.lastText}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Header */}
          <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: '#883bbc' }}>
                {initials(active.clientName)}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">{active.clientName}</div>
                <div className="text-[10px] text-gray-400">Client · {active.projectName}</div>
              </div>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={16}/></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {loadingMsgs && <div className="text-xs text-gray-400 text-center">Loading messages…</div>}
            {messages.map((m, i) => (
              <div key={m.id || i} className={`flex flex-col ${m.from === 'admin' ? 'items-end' : 'items-start'}`}>
                {/* Update reference card */}
                {m.updateRef?.updateId && (
                  <div className={`max-w-sm w-full ${m.from === 'admin' ? 'mr-0' : 'ml-0'}`}>
                    <UpdateRefCard updateRef={m.updateRef} dark={m.from === 'admin'} />
                  </div>
                )}
                <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-xs
                  ${m.from === 'admin'
                    ? 'text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'}`}
                  style={m.from === 'admin' ? { background: '#883bbc' } : {}}>
                  <p>{m.text}</p>
                  <p className={`text-[9px] mt-1 ${m.from === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            ))}
            {!loadingMsgs && messages.length === 0 && (
              <div className="text-xs text-gray-400 text-center py-8">No messages yet</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <form onSubmit={sendMessage} className="bg-white border-t border-gray-100 p-4 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Reply to client…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-purple-300 transition-colors"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
              style={{ background: '#883bbc' }}
            >
              <Send size={14} className="text-white" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-400">Select a conversation</div>
            <div className="text-xs text-gray-300 mt-1">Choose a client chat from the left</div>
          </div>
        </div>
      )}
    </div>
  )
}
