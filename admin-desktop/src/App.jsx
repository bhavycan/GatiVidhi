import { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Clients from './pages/Clients'
import Workers from './pages/Workers'
import Tasks from './pages/Tasks'
import Approvals from './pages/Approvals'
import Payments from './pages/Payments'
import Designs from './pages/Designs'
import Materials from './pages/Materials'
import Templates from './pages/Templates'
import Reports from './pages/Reports'
import Messages from './pages/Messages'
import Tickets from './pages/Tickets'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'

const BASE_URL = 'http://localhost:3000'

const pageMeta = {
  '/':              { title: 'Dashboard',     subtitle: 'Welcome back, Admin' },
  '/projects':      { title: 'Projects',      subtitle: 'Manage all design projects' },
  '/clients':       { title: 'Clients',       subtitle: 'Client accounts & profiles' },
  '/workers':       { title: 'Workers',       subtitle: 'Design team management' },
  '/tasks':         { title: 'Tasks',         subtitle: 'Track task progress' },
  '/approvals':     { title: 'Approvals',     subtitle: 'Client approval requests' },
  '/payments':      { title: 'Payments',      subtitle: 'Installments & billing' },
  '/designs':       { title: 'Designs',       subtitle: 'Design gallery & boards' },
  '/materials':     { title: 'Materials',     subtitle: 'Interior materials catalog' },
  '/templates':     { title: 'Templates',     subtitle: 'Reusable design templates' },
  '/reports':       { title: 'Reports',       subtitle: 'AI-generated project reports' },
  '/messages':      { title: 'Messages',      subtitle: 'Client & worker communication' },
  '/tickets':       { title: 'Tickets',       subtitle: 'Support requests' },
  '/notifications': { title: 'Notifications', subtitle: 'Recent activity & alerts' },
  '/settings':      { title: 'Settings',      subtitle: 'Account & system configuration' },
}

function Layout({ collapsed, onToggle, onLogout }) {
  const { pathname } = useLocation()
  const meta = pageMeta[pathname] || { title: 'Admin', subtitle: '' }
  const isMessages = pathname === '/messages'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--body-bg)' }}>
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} onToggleSidebar={onToggle} onLogout={onLogout} />
        <main className={`flex-1 overflow-hidden ${isMessages ? '' : ''}`}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/projects"      element={<Projects />} />
            <Route path="/clients"       element={<Clients />} />
            <Route path="/workers"       element={<Workers />} />
            <Route path="/tasks"         element={<Tasks />} />
            <Route path="/approvals"     element={<Approvals />} />
            <Route path="/payments"      element={<Payments />} />
            <Route path="/designs"       element={<Designs />} />
            <Route path="/materials"     element={<Materials />} />
            <Route path="/templates"     element={<Templates />} />
            <Route path="/reports"       element={<Reports />} />
            <Route path="/messages"      element={<Messages />} />
            <Route path="/tickets"       element={<Tickets />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings"      element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [auth, setAuth] = useState(null) // null = checking, true = logged in, false = logged out

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/profile-info`, { withCredentials: true })
      .then(() => setAuth(true))
      .catch(() => setAuth(false))
  }, [])

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--body-bg, #f5f3ff)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  if (auth === false) {
    return <Login onLogin={() => setAuth(true)} />
  }

  return (
    <BrowserRouter>
      <Layout collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} onLogout={() => setAuth(false)} />
    </BrowserRouter>
  )
}
