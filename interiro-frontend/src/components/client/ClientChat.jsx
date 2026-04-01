import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AnimatePresence, motion } from 'motion/react'
import axios from 'axios'
import Navbar from '../../templates/Navbar'
import Butterfly from '../../templates/Butterfly'
import { API_BASE } from '../../config.js'

const UpdateRefCard = ({ updateRef }) => (
  <div className='flex items-start gap-2 bg-[#883bbc]/10 border border-[#883bbc]/30 rounded-xl px-3 py-2 mb-1'>
    <i className='ri-link text-[#883bbc] text-sm mt-0.5 shrink-0'></i>
    <div className='min-w-0'>
      <p className='text-[10px] font-bold text-[#883bbc] uppercase tracking-wide'>Referencing Update</p>
      <p className='text-xs font-semibold truncate'>{updateRef.date}</p>
      {updateRef.workDone && (
        <p className='text-[11px] opacity-60 line-clamp-2'>{updateRef.workDone}</p>
      )}
    </div>
  </div>
)

const ClientChat = () => {
  const { state } = useLocation()
  const taggedUpdate = state?.update || null

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isopen, setOpen] = useState(false)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const socketRef = useRef(null)
  const chatRef = useRef(null)
  const parent = useRef(null)
  const tagSentRef = useRef(false)

  // Fetch userId and load history
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/chat/dm/my`, { withCredentials: true })
        setUserId(String(data.userId))
        setMessages(
          (data.messages || []).map((m) => ({
            id: m._id,
            from: m.senderRole,
            text: m.text,
            updateRef: m.updateRef || null,
            createdAt: m.createdAt,
          }))
        )
      } catch (err) {
        console.error('Failed to load DM history:', err)
        setError('Could not load messages. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Connect socket once userId is available
  useEffect(() => {
    if (!userId) return

    const socket = io(`${API_BASE}/dm`, {
      auth: { clientId: userId, role: 'client' },
    })
    socketRef.current = socket

    // Receive admin replies
    socket.on('dm:message', (msg) => {
      if (msg.senderRole === 'admin') {
        setMessages((prev) => [...prev, {
          id: msg._id,
          from: 'admin',
          text: msg.text,
          updateRef: msg.updateRef || null,
          createdAt: msg.createdAt,
        }])
      }
    })

    socket.on('dm:error', (errMsg) => {
      setError(errMsg)
    })

    return () => socket.disconnect()
  }, [userId])

  // Auto-send tagged update reference once when chat opens from an update
  useEffect(() => {
    if (!taggedUpdate || !userId || !socketRef.current || tagSentRef.current) return
    tagSentRef.current = true

    const refMsg = {
      id: `local-${Date.now()}`,
      from: 'client',
      text: `📎 Commenting on update: ${taggedUpdate.date}`,
      updateRef: taggedUpdate,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, refMsg])
    socketRef.current.emit('dm:send', {
      targetClientId: userId,
      text: refMsg.text,
      updateRef: taggedUpdate,
    })
  }, [taggedUpdate, userId])

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || !socketRef.current) return

    setMessages((prev) => [...prev, {
      id: `local-${Date.now()}`,
      from: 'client',
      text,
      updateRef: null,
      createdAt: new Date().toISOString(),
    }])
    socketRef.current.emit('dm:send', { targetClientId: userId, text })
    setInput('')
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <nav className="z-10 fixed mt-[10%] right-4 md:top-6 md:right-8">
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer"
        >
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode="wait">
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img className="w-full h-full object-cover" src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} y={16} x={5} />
        <figure className="w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]">
          <img className="w-full h-full object-cover" src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      <main className="w-full h-full px-[8%] pt-[4%] pb-[2%] relative flex flex-col">
        <div className="max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden">

          <header className="shrink-0 mt-[6%]">
            <div className="text-4xl md:text-5xl font-semibold tracking-tight flex gap-[3%]">
              <h1>Chat</h1>
              <h1 className="text-white">Support<span className="inline-block text-black">.</span></h1>
            </div>
            <div className="font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]">
              <h4>Talk directly with the admin about your project</h4>
            </div>
            <div className="w-[50%] pb-4 border-b-2 border-white mt-[3%]" />
          </header>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 px-4 py-2 bg-red-100 border border-red-300 rounded-xl text-xs font-semibold text-red-600"
            >
              {error}
            </motion.div>
          )}

          <section ref={chatRef} className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 mt-2">
            {loading && (
              <div className="flex items-center justify-center gap-2 mt-10 opacity-60">
                <div className="w-4 h-4 rounded-full border-2 border-[#883bbc] border-t-transparent animate-spin" />
                <p className="text-sm font-semibold">Loading messages…</p>
              </div>
            )}

            {!loading && !error && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center mt-10 gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#883bbc]/20 flex items-center justify-center">
                  <i className="ri-chat-3-line text-2xl text-[#883bbc]"></i>
                </div>
                <p className="text-sm font-semibold opacity-60">No messages yet. Say hi!</p>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isClient = msg.from === 'client'
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                  >
                    {msg.updateRef?.updateId && (
                      <div className={`w-[75%] ${isClient ? 'mr-0' : 'ml-10'}`}>
                        <UpdateRefCard updateRef={msg.updateRef} />
                      </div>
                    )}
                    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} w-full`}>
                      {!isClient && (
                        <div className="w-8 h-8 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0 mr-2 mt-1">
                          <i className="ri-user-star-fill text-white text-sm"></i>
                        </div>
                      )}
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium
                        ${isClient
                          ? 'bg-[#883bbc] text-white rounded-br-none shadow-lg shadow-[#883bbc]/30'
                          : 'bg-white/70 backdrop-blur-md text-black rounded-bl-none shadow-md border border-white'
                        }`}>
                        <p>{msg.text}</p>
                        {msg.createdAt && (
                          <p className={`text-[9px] mt-1 ${isClient ? 'text-white/60' : 'text-gray-400'}`}>
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

          <form onSubmit={sendMessage} className="shrink-0 flex items-center gap-3 py-4 border-t border-white/40">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
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
          </form>

        </div>
      </main>
    </div>
  )
}

export default ClientChat
