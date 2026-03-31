import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  FolderKanban, Users, HardHat, CreditCard, TrendingUp,
  CheckSquare, Clock, AlertTriangle, ArrowUpRight
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
const fmt = (v) => `₹${(v / 100000).toFixed(1)}L`

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [approvals, setApprovals] = useState([])

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/dashboard-stats`, { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(() => {})

    axios.get(`${BASE_URL}/api/project/all`, { withCredentials: true })
      .then(res => setProjects((res.data.projects || []).slice(0, 5)))
      .catch(() => {})

    axios.get(`${BASE_URL}/api/approval/all`, { withCredentials: true })
      .then(res => setApprovals((res.data.approvals || []).filter(a => a.status === 'pending').slice(0, 4)))
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

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-2xl p-6 card-shadow">
          <div className="text-sm font-bold text-gray-900 mb-1">Approval Status</div>
          <div className="text-xs text-gray-400 mb-4">Pending vs Approved vs Rejected</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { name: 'Pending', value: stats?.pendingApprovals ?? 0 },
              { name: 'Approved', value: stats?.approvedApprovals ?? 0 },
              { name: 'Rejected', value: stats?.rejectedApprovals ?? 0 },
            ]} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #ece9f5', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" fill="#883bbc" radius={[6, 6, 0, 0]} />
            </BarChart>
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
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
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
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
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
    </div>
  )
}
