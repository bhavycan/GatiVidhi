import { useState, useEffect } from 'react'
import axios from 'axios'
import { CreditCard, TrendingUp, AlertCircle, Search } from 'lucide-react'

const BASE_URL = 'http://localhost:3000'

const fmt = (v) => v > 0 ? `₹${(v / 100000).toFixed(1)}L` : '—'
const fmtShort = (v) => v > 0 ? `₹${Number(v).toLocaleString('en-IN')}` : '—'
const statusStyles = {
  'on-track': 'badge-active',
  paid: 'badge-completed',
  overdue: 'badge-overdue',
  pending: 'badge-pending',
}

function getPlanStatus(plan) {
  const all = plan.installments || []
  if (all.length === 0) return 'pending'
  if (all.every(i => i.status === 'paid')) return 'paid'
  const overdue = all.some(i => i.status === 'pending' && new Date(i.dueDate) < new Date())
  return overdue ? 'overdue' : 'on-track'
}

function getNextDue(plan) {
  const pending = (plan.installments || []).filter(i => i.status === 'pending')
  if (pending.length === 0) return null
  return pending.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]
}

export default function Payments() {
  const [search, setSearch] = useState('')
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/api/payment/all`, { withCredentials: true })
      .then(res => { setPlans(res.data.plans || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
  }, [])

  const filtered = plans.filter(p =>
    p.projectId?.projectName?.toLowerCase().includes(search.toLowerCase())
  )

  const totalReceived = plans.reduce((sum, p) =>
    sum + (p.installments || []).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 0)
  const totalAmount = plans.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
  const overdueCount = plans.filter(p => getPlanStatus(p) === 'overdue').length

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payments</h2>
          <p className="text-xs text-gray-400 mt-0.5">Installment plans and billing overview</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed', value: loading ? '—' : fmt(totalAmount), icon: CreditCard, color: '#883bbc' },
          { label: 'Received', value: loading ? '—' : fmt(totalReceived), icon: TrendingUp, color: '#10b981' },
          { label: 'Overdue Plans', value: loading ? '—' : overdueCount, icon: AlertCircle, color: '#ef4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 card-shadow flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={13} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search by project…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Project</th><th>Total</th><th>Installments</th><th>Next Due</th><th>Next Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const status = getPlanStatus(p)
              const next = getNextDue(p)
              return (
                <tr key={p._id} className="cursor-pointer">
                  <td className="font-semibold text-gray-800 text-xs">{p.projectId?.projectName || '—'}</td>
                  <td className="font-semibold text-xs text-gray-900">{fmt(p.totalAmount)}</td>
                  <td className="text-xs text-gray-600">{(p.installments || []).length}</td>
                  <td className="text-xs text-gray-500">
                    {next ? new Date(next.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="font-semibold text-xs text-gray-700">{next ? fmtShort(next.amount) : '—'}</td>
                  <td>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center text-xs text-gray-400 py-8">No payment plans found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
