import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell, CheckCheck, FolderKanban, CreditCard, CheckSquare, MessageSquare, AlertTriangle, X, HardHat, ChevronLeft, ChevronRight } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const typeIcons = {
  task:     { icon: CheckSquare,   color: '#ef4444', label: 'Task' },
  update:   { icon: FolderKanban,  color: '#3b82f6', label: 'Update' },
  ticket:   { icon: MessageSquare, color: '#f59e0b', label: 'Ticket' },
  approval: { icon: Bell,          color: '#883bbc', label: 'Approval' },
  payment:  { icon: CreditCard,    color: '#10b981', label: 'Payment' },
  default:  { icon: AlertTriangle, color: '#6b7280', label: 'Alert' },
}

function timeAgo(date) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export default function Notifications({ onCountChange }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState(false)
  const [dismissing, setDismissing] = useState(null) // index being dismissed

  // Worker recent images
  const [workerUpdates, setWorkerUpdates] = useState([])
  const [lightbox, setLightbox] = useState(null) // { images: [], index: number }

  useEffect(() => {
    axios.get(`${BASE_URL}/admin/notifications`, { withCredentials: true })
      .then(res => {
        const list = res.data.notifications || []
        setNotifications(list)
        onCountChange?.(list.length)
        setLoading(false)
      })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })

    axios.get(`${BASE_URL}/worker/recent-images`, { withCredentials: true })
      .then(res => setWorkerUpdates(res.data.updates || []))
      .catch(() => {})
  }, [])

  const dismiss = async (index) => {
    const n = notifications[index]
    setDismissing(index)
    // For approval notifications: mark as seen on the backend so it doesn't reappear
    if (n.type === 'approval' && n.approvalId) {
      try {
        await axios.post(`${BASE_URL}/admin/notifications/mark-seen`, {}, { withCredentials: true })
      } catch (_) {}
    }
    const updated = notifications.filter((_, i) => i !== index)
    setNotifications(updated)
    onCountChange?.(updated.length)
    setDismissing(null)
  }

  const handleMarkAllRead = async () => {
    setMarking(true)
    try {
      await axios.post(`${BASE_URL}/admin/notifications/mark-seen`, {}, { withCredentials: true })
      setNotifications([])
      onCountChange?.(0)
    } catch (err) {
      setError(err.response?.data || 'Failed to mark as read')
    } finally {
      setMarking(false)
    }
  }

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
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="btn-secondary text-xs disabled:opacity-50"
          >
            <CheckCheck size={13}/> {marking ? 'Clearing…' : 'Clear all'}
          </button>
        )}
      </div>

      {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />
        </div>
      )}

      {/* ── Worker Recent Photos ───────────────────────────────────────── */}
      {workerUpdates.length > 0 && (
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#883bbc18' }}>
              <HardHat size={14} style={{ color: '#883bbc' }} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Recent Worker Photos</h3>
            <span className="text-[10px] text-gray-400">last 7 days</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {workerUpdates.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl card-shadow p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                    style={{ background: '#883bbc' }}>
                    {(u.workerId?.name || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-800 truncate">{u.workerId?.name || 'Worker'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.projectId?.projectName || ''}</p>
                  </div>
                  <span className="text-[9px] text-gray-300 ml-auto shrink-0">{timeAgo(u.date)}</span>
                </div>
                <div className={`grid gap-1 ${u.updateImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {u.updateImages.slice(0, 4).map((img, ii) => (
                    <div key={ii} className="relative">
                      <img
                        src={img}
                        alt=""
                        onClick={() => setLightbox({ images: u.updateImages, index: ii })}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      />
                      {ii === 3 && u.updateImages.length > 4 && (
                        <div onClick={() => setLightbox({ images: u.updateImages, index: 3 })}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center cursor-pointer">
                          <span className="text-white text-xs font-bold">+{u.updateImages.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {u.notes && <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1 italic">"{u.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length })) }}
            className="absolute left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-w-[80vw] max-h-[80vh] rounded-2xl object-contain shadow-2xl"
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length })) }}
            className="absolute right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
          <div className="absolute bottom-4 text-white/60 text-xs">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      <div className="space-y-2 max-w-2xl">
        {notifications.map((n, i) => {
          const { icon: Icon, color, label } = typeIcons[n.type] || typeIcons.default
          const ago = timeAgo(n.date || n.dueDate || n.respondedAt)
          return (
            <div key={i} className="bg-white rounded-2xl p-4 card-shadow flex items-start gap-3 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${color}15`, color }}>
                    {label}
                  </span>
                  {ago && <span className="text-[10px] text-gray-400">{ago}</span>}
                </div>
                <div className="text-sm text-gray-800 font-medium leading-snug">{n.message}</div>
                {n.projectName && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{n.projectName}</div>
                )}
              </div>
              <button
                onClick={() => dismiss(i)}
                disabled={dismissing === i}
                title="Dismiss"
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-30"
              >
                {dismissing === i
                  ? <div className="w-3 h-3 rounded-full border border-gray-400 border-t-transparent animate-spin" />
                  : <X size={12} />
                }
              </button>
            </div>
          )
        })}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: '#883bbc18' }}>
              <Bell size={20} style={{ color: '#883bbc' }} />
            </div>
            <p className="text-sm font-semibold text-gray-400">All caught up</p>
            <p className="text-xs text-gray-300 mt-1">No pending notifications</p>
          </div>
        )}
      </div>
    </div>
  )
}
