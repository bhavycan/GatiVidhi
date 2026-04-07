import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { API_BASE } from '../config.js'

const ClientMsgCtx = createContext({ count: 0, clearCount: () => {} })

export const ClientMsgProvider = ({ children }) => {
  const [count, setCount] = useState(0)
  const [userId, setUserId] = useState(null)
  const { pathname } = useLocation()

  // Fetch userId once on mount
  useEffect(() => {
    axios.get(`${API_BASE}/chat/dm/my`, { withCredentials: true })
      .then(res => setUserId(String(res.data.userId)))
      .catch(() => {})
  }, [])

  // Connect socket once userId is known
  useEffect(() => {
    if (!userId) return
    const socket = io(`${API_BASE}/dm`, { auth: { clientId: userId, role: 'client' } })

    socket.on('dm:message', (msg) => {
      // Only count admin messages, and only when client is NOT on the chat page
      if (msg.senderRole === 'admin' && window.location.pathname !== '/user/support') {
        setCount(c => c + 1)
      }
    })

    return () => socket.disconnect()
  }, [userId])

  // Auto-clear when client navigates to the chat page
  useEffect(() => {
    if (pathname === '/user/support') setCount(0)
  }, [pathname])

  return (
    <ClientMsgCtx.Provider value={{ count, clearCount: () => setCount(0) }}>
      {children}
    </ClientMsgCtx.Provider>
  )
}

export const useClientMsg = () => useContext(ClientMsgCtx)
