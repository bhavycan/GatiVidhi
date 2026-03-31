import { useState } from 'react'
import axios from 'axios'
import { Menu, Bell, Search, Sun, Moon, ChevronDown, LogOut } from 'lucide-react'

const BASE_URL = 'http://localhost:3000'

export default function Header({ title, subtitle, onToggleSidebar, onLogout }) {
  const [dark, setDark] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/logout`, {}, { withCredentials: true })
    } catch (_) {}
    onLogout?.()
  }

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-100 flex-shrink-0"
      style={{ boxShadow: '0 1px 0 #ece9f5' }}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-sm font-bold text-gray-900 leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Center – Search */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 w-72">
        <Search size={14} className="text-gray-400 flex-shrink-0" />
        <input
          className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search projects, clients, workers…"
        />
        <kbd className="text-[10px] text-gray-300 bg-gray-100 border border-gray-200 rounded px-1">⌘K</kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Admin dropdown */}
        <div className="relative">
          <button onClick={() => setShowMenu(m => !m)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #883bbc, #f3a9de)' }}>
              A
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-gray-800 leading-none">Admin</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Super Admin</div>
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl card-shadow border border-gray-100 z-50 overflow-hidden">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={13}/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
