import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  FolderKanban, HardHat, TrendingUp,
  CheckSquare, Clock, AlertTriangle, ArrowUpRight,
  Flame, CreditCard, Ticket, RefreshCcw, CheckCircle2,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const statusStyles = {
  ongoing: 'badge-active', completed: 'badge-completed',
  pending: 'badge-pending', overdue: 'badge-overdue', 'on-hold': 'badge-on-hold',
  approved: 'badge-active', rejected: 'badge-overdue',
}
const priorityColors = {
  high: 'bg-red-100 text-red-600',
  medium: 'bg-amber-100 text-amber-600',
  low: 'bg-green-100 text-green-600',
}
const fmtL = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}k`

// Build a 6-month time-series from payment plans and spendings
function buildFinanceChart(plans, spendings) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      expected: 0,
      received: 0,
      spending: 0,
    })
  }
  const byKey = Object.fromEntries(months.map(m => [m.key, m]))

  // Installments → expected by dueDate month, received by paidAt month
  for (const plan of plans) {
    for (const inst of plan.installments || []) {
      if (inst.dueDate) {
        const k = inst.dueDate.slice(0, 7)
        if (byKey[k]) byKey[k].expected += inst.amount
      }
      if (inst.status === 'paid' && inst.paidAt) {
        const k = inst.paidAt.slice(0, 7)
        if (byKey[k]) byKey[k].received += inst.amount
      }
    }
  }

  // Spendings by date month
  for (const s of spendings) {
    if (s.date) {
      const k = s.date.slice(0, 7)
      if (byKey[k]) byKey[k].spending += s.amount
    }
  }

  return months
}

const alertMeta = {
  task:     { label: 'Overdue Task',    color: '#ef4444', bg: '#fef2f2', border: '#fecaca', Icon: CheckSquare },
  payment:  { label: 'Payment Due',     color: '#f97316', bg: '#fff7ed', border: '#fed7aa', Icon: CreditCard },
  ticket:   { label: 'Open Ticket',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', Icon: Ticket },
  update:   { label: 'No Update',       color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', Icon: RefreshCcw },
  approval: { label: 'Approval',        color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', Icon: CheckCircle2 },
}

function timeAgo(date) {
  if (!date) return ''
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

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [approvals, setApprovals] = useState([])
  const [alerts, setAlerts] = useState([])
  // initialise with empty-month skeleton so the chart always has axes to render
  const [plans, setPlans]         = useState([])
  const [spendings, setSpendings] = useState([])
  const [workerUpdates, setWorkerUpdates] = useState([])
  const [lightbox, setLightbox] = useState(null) // { images: [], index: number }

  const financeChart = buildFinanceChart(plans, spendings)

  useEffect(() => {
    axios.get(`${BASE_URL}/admin/dashboard-stats`, { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(() => {})

    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => setProjects((res.data.projects || []).slice(0, 5)))
      .catch(() => {})

    axios.get(`${BASE_URL}/approval/all`, { withCredentials: true })
      .then(res => setApprovals((res.data.approvals || []).filter(a => a.status === 'pending').slice(0, 4)))
      .catch(() => {})

    axios.get(`${BASE_URL}/admin/notifications`, { withCredentials: true })
      .then(res => setAlerts(res.data.notifications || []))
      .catch(() => {})

    // fetch independently — one failing must not zero-out the other
    axios.get(`${BASE_URL}/payment/all`, { withCredentials: true })
      .then(r => setPlans(r.data.plans || []))
      .catch(() => {})

    axios.get(`${BASE_URL}/payment/spendings`, { withCredentials: true })
      .then(r => setSpendings(r.data.spendings || []))
      .catch(() => {})

    axios.get(`${BASE_URL}/worker/recent-images`, { withCredentials: true })
      .then(r => setWorkerUpdates(r.data.updates || []))
      .catch(() => {})
  }, [])

  const statCards = [
    { label: 'Total Projects', value: projects.length || '—', icon: FolderKanban, gradient: 'stat-purple' },
    { label: 'Pending Tasks', value: stats?.dueTaskUpdates ?? '—', icon: CheckSquare, gradient: 'stat-orange' },
    { label: 'Due Updates', value: stats?.dueUpdates ?? '—', icon: Clock, gradient: 'stat-teal' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? '—', icon: AlertTriangle, gradient: 'stat-pink' },
    { label: 'Reports Created', value: stats?.createdReports ?? '—', icon: TrendingUp, gradient: 'stat-green' },
    { label: 'Worker Updates', value: stats?.workerUpdatesReceived ?? '—', icon: HardHat, gradient: 'stat-blue' },
  ]

  const projectStatusData = [
    { name: 'Ongoing', value: projects.filter(p => p.status === 'ongoing').length, color: '#883bbc' },
    { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#10b981' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#f59e0b' },
    { name: 'Overdue', value: projects.filter(p => p.status === 'overdue').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Live data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">Export Report</button>
          <button className="btn-primary text-xs">+ New Project</button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className={`${gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute right-0 top-0 w-20 h-20 rounded-full bg-white/10 -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/20">
                  <ArrowUpRight size={10} /> Live
                </span>
              </div>
              <div className="text-2xl font-black leading-none">{value}</div>
              <div className="text-xs opacity-80 mt-1 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <Flame size={15} className="text-red-500" />
            <span className="text-sm font-bold text-gray-900">Urgent Alerts</span>
            <span className="ml-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-red-500">{alerts.length}</span>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-gray-400 font-medium">
              {['task','payment','ticket','update','approval'].map(type => {
                const count = alerts.filter(a => a.type === type).length
                if (!count) return null
                const { label, color } = alertMeta[type]
                return (
                  <span key={type} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    {count} {label}{count > 1 ? 's' : ''}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
            {alerts.map((alert, i) => {
              const meta = alertMeta[alert.type] || alertMeta.task
              const { Icon, color, bg, border } = meta
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{alert.message}</div>
                    <div className="text-[10px] text-gray-400 truncate">{alert.projectName}</div>
                  </div>
                  {alert.dueDate && (
                    <div className="text-[10px] font-medium text-red-500 shrink-0">
                      Due {new Date(alert.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  )}
                  {alert.amount && !alert.dueDate && (
                    <div className="text-[10px] font-bold text-orange-500 shrink-0">
                      ₹{alert.amount.toLocaleString('en-IN')}
                    </div>
                  )}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                    style={{ background: bg, color, border: `1px solid ${border}` }}>
                    {meta.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-2xl p-6 card-shadow">
          <div className="text-sm font-bold text-gray-900 mb-1">Finance Overview</div>
          <div className="flex items-center gap-4 mb-4">
            {[
              { label: 'Expected', color: '#883bbc' },
              { label: 'Received', color: '#10b981' },
              { label: 'Spending', color: '#f59e0b' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: color }} />
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={financeChart} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtL} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value, name) => [fmtL(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ border: '1px solid #ece9f5', borderRadius: 10, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="expected" stroke="#883bbc" strokeWidth={2} dot={{ r: 3, fill: '#883bbc' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="spending" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 bg-white rounded-2xl p-6 card-shadow">
          <div className="text-sm font-bold text-gray-900 mb-1">Project Status</div>
          <div className="text-xs text-gray-400 mb-4">{projects.length} loaded projects</div>
          {projectStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                    paddingAngle={3} dataKey="value">
                    {projectStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: '1px solid #ece9f5', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {projectStatusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs text-gray-500">{name}</span>
                    <span className="text-xs font-bold text-gray-800 ml-auto">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 text-center py-8">No data</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
            <div>
              <div className="text-sm font-bold text-gray-900">Recent Projects</div>
              <div className="text-xs text-gray-400">Latest 5 projects</div>
            </div>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr><th>Project</th><th>Client</th><th>Status</th><th>Due</th></tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} className="cursor-pointer">
                  <td>
                    <div className="font-semibold text-gray-800 text-xs">{p.projectName}</div>
                    <div className="text-gray-400 text-[10px]">{p._id?.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="text-gray-600 text-xs">{p.clientId?.name || '—'}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyles[p.status] || 'badge-pending'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">
                    {p.estimatedEndDate ? new Date(p.estimatedEndDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-6">No projects yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="col-span-4 bg-white rounded-2xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">Pending Approvals</div>
            {approvals.length > 0 && (
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                style={{ background: '#883bbc' }}>{approvals.length}</span>
            )}
          </div>
          <div className="space-y-2.5">
            {approvals.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">{a.title}</div>
                  <div className="text-[10px] text-gray-400 truncate">{a.projectName}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${priorityColors[a.priority] || 'bg-gray-100 text-gray-600'}`}>
                    {a.priority}
                  </span>
                </div>
              </div>
            ))}
            {approvals.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-4">No pending approvals</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Worker Photos ──────────────────────────────────────────── */}
      {workerUpdates.length > 0 && (
        <div className="bg-white rounded-2xl card-shadow overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#883bbc18' }}>
              <HardHat size={14} style={{ color: '#883bbc' }} />
            </div>
            <span className="text-sm font-bold text-gray-900">Recent Worker Photos</span>
            <span className="text-[10px] text-gray-400">last 7 days</span>
          </div>
          <div className="flex gap-4 p-4 overflow-x-auto pb-4">
            {workerUpdates.map((u) => (
              <div key={u._id} className="shrink-0 w-52 rounded-xl border border-gray-100 bg-gray-50 p-3">
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
                        className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
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
                {u.notes && (
                  <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1 italic">"{u.notes}"</p>
                )}
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
          <div className="absolute bottom-4 text-white/60 text-xs">{lightbox.index + 1} / {lightbox.images.length}</div>
          <button onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <X size={14} className="text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
