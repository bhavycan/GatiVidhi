import { createContext, useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { API_BASE } from '../config.js'

const AdminMsgCtx = createContext({ count: 0, clearCount: () => {} })

export const AdminMsgProvider = ({ children }) => {
  const [count, setCount] = useState(0)
  const { pathname } = useLocation()

  useEffect(() => {
    const socket = io(`${API_BASE}/dm`, { auth: { role: 'admin' } })

    socket.on('dm:notify', ({ lastRole }) => {
      // Only count client messages, and only when admin is NOT on the chat page
      if (lastRole === 'client' && window.location.pathname !== '/admin/chat') {
        setCount(c => c + 1)
      }
    })

    return () => socket.disconnect()
  }, [])

  // Auto-clear when admin navigates to the chat page
  useEffect(() => {
    if (pathname === '/admin/chat') setCount(0)
  }, [pathname])

  return (
    <AdminMsgCtx.Provider value={{ count, clearCount: () => setCount(0) }}>
      {children}
    </AdminMsgCtx.Provider>
  )
}

export const useAdminMsg = () => useContext(AdminMsgCtx)
