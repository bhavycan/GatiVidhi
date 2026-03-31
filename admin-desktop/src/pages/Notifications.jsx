import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell, CheckCheck, FolderKanban, CreditCard, CheckSquare, MessageSquare, AlertTriangle } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const typeIcons = {
  task:     { icon: CheckSquare,   color: '#ef4444' },
  update:   { icon: FolderKanban,  color: '#3b82f6' },
  ticket:   { icon: MessageSquare, color: '#f59e0b' },
  approval: { icon: Bell,          color: '#883bbc' },
  payment:  { icon: CreditCard,    color: '#10b981' },
  default:  { icon: AlertTriangle, color: '#6b7280' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/notifications`, { withCredentials: true })
      .then(res => { setNotifications(res.data.notifications || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
  }, [])

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          {!loading && notifications.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
              style={{ background: '#883bbc' }}>{notifications.length}</span>
          )}
        </div>
        <button className="btn-secondary text-xs"><CheckCheck size={13}/> Mark all read</button>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="space-y-2 max-w-2xl">
        {notifications.map((n, i) => {
          const { icon: Icon, color } = typeIcons[n.type] || typeIcons.default
          return (
            <div key={i} className="bg-white rounded-2xl p-5 card-shadow flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm capitalize">{n.type}</div>
                <div className="text-xs text-gray-600 mt-0.5">{n.message}</div>
                {n.projectName && (
                  <div className="text-[10px] text-gray-400 mt-1">{n.projectName}</div>
                )}
              </div>
              {n.date && (
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(n.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>
          )
        })}
        {!loading && notifications.length === 0 && (
          <div className="text-center text-xs text-gray-400 py-8">No notifications</div>
        )}
      </div>
    </div>
  )
}
