import { useState, useEffect } from 'react'
import axios from 'axios'
import { CreditCard, TrendingUp, AlertCircle, Search, Plus, X, ChevronDown, CheckCircle2, Clock, Wallet, Trash2 } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const fmt      = (v) => v > 0 ? `₹${(v / 100000).toFixed(1)}L` : '—'
const fmtShort = (v) => v > 0 ? `₹${Number(v).toLocaleString('en-IN')}` : '—'

const statusStyles = {
  'on-track': 'badge-active',
  paid:       'badge-completed',
  overdue:    'badge-overdue',
  pending:    'badge-pending',
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

const EMPTY_INST = { amount: '', dueDate: '', notes: '' }

export default function Payments() {
  const [search, setSearch]   = useState('')
  const [plans, setPlans]     = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [expanded, setExpanded] = useState(null)

  // Create plan modal
  const [createModal, setCreateModal] = useState(false)
  const [projectId, setProjectId]     = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [installments, setInstallments] = useState([{ ...EMPTY_INST }])
  const [creating, setCreating]         = useState(false)
  const [createError, setCreateError]   = useState('')

  // Add installment modal
  const [addModal, setAddModal]   = useState(null) // plan object
  const [newInst, setNewInst]     = useState({ ...EMPTY_INST })
  const [adding, setAdding]       = useState(false)
  const [addError, setAddError]   = useState('')

  // Mark paid
  const [markingPaid, setMarkingPaid] = useState(null)

  // Spendings
  const [spendings, setSpendings]           = useState([])
  const [spendName, setSpendName]           = useState('')
  const [spendAmount, setSpendAmount]       = useState('')
  const [spendDate, setSpendDate]           = useState(() => new Date().toISOString().slice(0, 10))
  const [spendProjectId, setSpendProjectId] = useState('general')
  const [addingSpend, setAddingSpend]       = useState(false)
  const [spendError, setSpendError]         = useState('')
  const [deletingSpend, setDeletingSpend]   = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/payment/all`, { withCredentials: true })
      .then(res => { setPlans(res.data.plans || []); setLoading(false) })
      .catch(err => { setError(err.response?.data || 'Failed to load'); setLoading(false) })
    axios.get(`${BASE_URL}/project/all`, { withCredentials: true })
      .then(res => setProjects(res.data.projects || []))
      .catch(() => {})
    axios.get(`${BASE_URL}/payment/spendings`, { withCredentials: true })
      .then(res => setSpendings(res.data.spendings || []))
      .catch(() => {})
  }, [])

  // ── Create plan ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setProjectId(''); setTotalAmount(''); setInstallments([{ ...EMPTY_INST }])
    setCreateError(''); setCreateModal(true)
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setCreating(true); setCreateError('')
    try {
      const res = await axios.post(`${BASE_URL}/payment/create`, {
        projectId,
        totalAmount: Number(totalAmount),
        installments: installments.map(i => ({
          amount: Number(i.amount),
          dueDate: i.dueDate,
          notes: i.notes || '',
        })),
      }, { withCredentials: true })
      setPlans(prev => [res.data.plan, ...prev])
      setCreateModal(false)
    } catch (err) {
      setCreateError(err.response?.data || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const addInstRow    = () => setInstallments(prev => [...prev, { ...EMPTY_INST }])
  const removeInstRow = (i) => setInstallments(prev => prev.filter((_, idx) => idx !== i))
  const updateInstRow = (i, field, val) =>
    setInstallments(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  // ── Add installment to existing plan ────────────────────────────────────
  const openAddInst = (plan) => {
    setNewInst({ ...EMPTY_INST }); setAddError(''); setAddModal(plan)
  }

  const handleAddInst = async (e) => {
    e.preventDefault()
    setAdding(true); setAddError('')
    try {
      const existing = addModal.installments.map(i => ({
        amount: i.amount, dueDate: i.dueDate, notes: i.notes || '', status: i.status,
        _id: i._id,
      }))
      const updated = [...existing, {
        amount: Number(newInst.amount),
        dueDate: newInst.dueDate,
        notes: newInst.notes || '',
      }]
      const res = await axios.post(`${BASE_URL}/payment/update`, {
        planId: addModal._id,
        totalAmount: addModal.totalAmount,
        installments: updated,
      }, { withCredentials: true })
      const updatedPlan = res.data.plan
      setPlans(prev => prev.map(p => p._id === addModal._id ? updatedPlan : p))
      if (expanded === addModal._id) setExpanded(updatedPlan._id)
      setAddModal(null)
    } catch (err) {
      setAddError(err.response?.data || 'Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  // ── Mark paid ────────────────────────────────────────────────────────────
  const handleMarkPaid = async (plan, installmentId) => {
    setMarkingPaid(installmentId)
    try {
      const res = await axios.post(`${BASE_URL}/payment/mark-paid`,
        { planId: plan._id, installmentId },
        { withCredentials: true }
      )
      const updatedPlan = res.data.plan
      setPlans(prev => prev.map(p => p._id === plan._id ? updatedPlan : p))
    } catch (err) {
      alert(err.response?.data || 'Failed to mark paid')
    } finally {
      setMarkingPaid(null)
    }
  }

  // ── Spendings ─────────────────────────────────────────────────────────────
  const handleAddSpend = async (e) => {
    e.preventDefault()
    setSpendError('')
    if (!spendName.trim() || !spendAmount) {
      setSpendError('Bill name and amount are required.')
      return
    }
    setAddingSpend(true)
    const proj = spendProjectId === 'general' ? null : projects.find(p => p._id === spendProjectId)
    try {
      const res = await axios.post(`${BASE_URL}/payment/spending`, {
        name: spendName.trim(),
        amount: Number(spendAmount),
        date: spendDate,
        projectId:   proj?._id   || null,
        projectName: proj?.projectName || 'General',
      }, { withCredentials: true })
      setSpendings(prev => [res.data.spending, ...prev])
      setSpendName('')
      setSpendAmount('')
      setSpendDate(new Date().toISOString().slice(0, 10))
      setSpendProjectId('general')
    } catch (err) {
      setSpendError(err.response?.data?.message || err.response?.data || 'Failed to add spending — check console.')
      console.error('[SPEND ADD]', err)
    } finally {
      setAddingSpend(false)
    }
  }

  const handleDeleteSpend = async (id) => {
    setDeletingSpend(id)
    try {
      await axios.delete(`${BASE_URL}/payment/spending/${id}`, { withCredentials: true })
      setSpendings(prev => prev.filter(s => s._id !== id))
    } catch {
      alert('Failed to delete')
    } finally {
      setDeletingSpend(null)
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────
  const filtered = plans.filter(p =>
    p.projectId?.projectName?.toLowerCase().includes(search.toLowerCase())
  )
  const totalReceived = plans.reduce((sum, p) =>
    sum + (p.installments || []).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), 0)
  const totalBilled   = plans.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
  const overdueCount  = plans.filter(p => getPlanStatus(p) === 'overdue').length

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payments</h2>
          <p className="text-xs text-gray-400 mt-0.5">Installment plans and billing overview</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs"><Plus size={13}/> New Plan</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Billed',  value: loading ? '—' : fmt(totalBilled),    icon: CreditCard,  color: '#883bbc' },
          { label: 'Received',      value: loading ? '—' : fmt(totalReceived),  icon: TrendingUp,  color: '#10b981' },
          { label: 'Overdue Plans', value: loading ? '—' : overdueCount,        icon: AlertCircle, color: '#ef4444' },
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

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm card-shadow">
        <Search size={13} className="text-gray-400" />
        <input className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          placeholder="Search by project…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {/* Plans table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Project</th><th>Total</th><th>Installments</th><th>Next Due</th><th>Next Amount</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const status = getPlanStatus(p)
              const next   = getNextDue(p)
              const isOpen = expanded === p._id
              return (
                <>
                  <tr key={p._id} className="cursor-pointer" onClick={() => setExpanded(isOpen ? null : p._id)}>
                    <td className="font-semibold text-gray-800 text-xs">{p.projectId?.projectName || '—'}</td>
                    <td className="font-semibold text-xs text-gray-900">{fmt(p.totalAmount)}</td>
                    <td className="text-xs text-gray-600">{(p.installments || []).length}</td>
                    <td className="text-xs text-gray-500">{next ? new Date(next.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="font-semibold text-xs text-gray-700">{next ? fmtShort(next.amount) : '—'}</td>
                    <td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${p._id}-expand`}>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-700">Installments</span>
                            <button onClick={(e) => { e.stopPropagation(); openAddInst(p) }}
                              className="btn-secondary text-xs py-1 px-3 flex items-center gap-1">
                              <Plus size={11}/> Add Installment
                            </button>
                          </div>
                          {(p.installments || []).map((inst, idx) => {
                            const overdue = inst.status === 'pending' && new Date(inst.dueDate) < new Date()
                            return (
                              <div key={inst._id || idx}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border
                                  ${inst.status === 'paid' ? 'bg-green-50 border-green-100' : overdue ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-center gap-3">
                                  {inst.status === 'paid'
                                    ? <CheckCircle2 size={14} className="text-green-500"/>
                                    : <Clock size={14} className={overdue ? 'text-red-400' : 'text-amber-400'}/>
                                  }
                                  <div>
                                    <div className="text-sm font-bold text-gray-800">{fmtShort(inst.amount)}</div>
                                    {inst.notes && <div className="text-[10px] text-gray-400">{inst.notes}</div>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-[10px] text-gray-500">{inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : '—'}</div>
                                    {inst.paidAt && <div className="text-[10px] text-green-500">Paid {new Date(inst.paidAt).toLocaleDateString('en-IN')}</div>}
                                  </div>
                                  {inst.status === 'pending' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleMarkPaid(p, inst._id) }}
                                      disabled={markingPaid === inst._id}
                                      className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50">
                                      {markingPaid === inst._id ? '…' : 'Mark Paid'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {(p.installments || []).length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-3">No installments yet</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-xs text-gray-400 py-8">No payment plans found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Plan Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-sm font-bold text-gray-900">New Payment Plan</h3>
              <button onClick={() => setCreateModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
              {createError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{createError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project</label>
                <select required className="admin-input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                  <option value="">Select a project…</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Amount (₹)</label>
                <input required type="number" min="1" className="admin-input" placeholder="e.g. 500000"
                  value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-600">Installments</label>
                  <button type="button" onClick={addInstRow} className="text-[10px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                    <Plus size={10}/> Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {installments.map((inst, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <input required type="number" min="1" placeholder="Amount ₹" className="admin-input flex-1"
                        value={inst.amount} onChange={e => updateInstRow(i, 'amount', e.target.value)} />
                      <input required type="date" className="admin-input flex-1"
                        value={inst.dueDate} onChange={e => updateInstRow(i, 'dueDate', e.target.value)} />
                      <input placeholder="Note" className="admin-input flex-1"
                        value={inst.notes} onChange={e => updateInstRow(i, 'notes', e.target.value)} />
                      {installments.length > 1 && (
                        <button type="button" onClick={() => removeInstRow(i)} className="text-gray-300 hover:text-red-400">
                          <X size={14}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {creating ? 'Creating…' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Installment Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl card-shadow w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Add Installment</h3>
                <p className="text-[10px] text-gray-400">{addModal.projectId?.projectName}</p>
              </div>
              <button onClick={() => setAddModal(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleAddInst} className="px-6 py-5 space-y-4">
              {addError && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{addError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amount (₹)</label>
                <input required type="number" min="1" className="admin-input" placeholder="e.g. 100000"
                  value={newInst.amount} onChange={e => setNewInst(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Date</label>
                <input required type="date" className="admin-input"
                  value={newInst.dueDate} onChange={e => setNewInst(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note <span className="text-gray-300 font-normal">(optional)</span></label>
                <input className="admin-input" placeholder="e.g. Foundation payment"
                  value={newInst.notes} onChange={e => setNewInst(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setAddModal(null)} className="btn-secondary flex-1 justify-center text-xs">Cancel</button>
                <button type="submit" disabled={adding} className="btn-primary flex-1 justify-center text-xs disabled:opacity-60">
                  {adding ? 'Adding…' : 'Add Installment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Spendings Section ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl card-shadow p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#883bbc18' }}>
            <Wallet size={14} style={{ color: '#883bbc' }} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Spendings</h3>
          <span className="text-[10px] text-gray-400 ml-auto">{spendings.length} entr{spendings.length === 1 ? 'y' : 'ies'}</span>
        </div>

        {/* Add spending form */}
        {spendError && (
          <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{spendError}</div>
        )}
        <form onSubmit={handleAddSpend} className="flex items-end gap-2 flex-wrap">
          <div className="flex-1 min-w-36">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Bill name</label>
            <input
              required
              className="admin-input text-xs"
              placeholder="e.g. Material purchase"
              value={spendName}
              onChange={e => setSpendName(e.target.value)}
            />
          </div>
          <div className="w-44">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Project</label>
            <select
              className="admin-input text-xs"
              value={spendProjectId}
              onChange={e => setSpendProjectId(e.target.value)}
            >
              <option value="general">General (no project)</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.projectName}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input
              required
              type="number"
              min="1"
              className="admin-input text-xs"
              placeholder="e.g. 25000"
              value={spendAmount}
              onChange={e => setSpendAmount(e.target.value)}
            />
          </div>
          <div className="w-36">
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              className="admin-input text-xs"
              value={spendDate}
              onChange={e => setSpendDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={addingSpend}
            className="btn-primary text-xs h-9 px-4 flex items-center gap-1 disabled:opacity-60 shrink-0"
          >
            <Plus size={12} /> {addingSpend ? 'Adding…' : 'Add'}
          </button>
        </form>

        {/* Spendings list */}
        {spendings.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">No spendings recorded yet</div>
        ) : (
          <div className="space-y-2">
            {spendings.map(s => (
              <div key={s._id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{s.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: s.projectId ? '#883bbc18' : '#f3f4f6', color: s.projectId ? '#883bbc' : '#9ca3af' }}>
                      {s.projectName || 'General'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{fmtShort(s.amount)}</span>
                  <button
                    onClick={() => handleDeleteSpend(s._id)}
                    disabled={deletingSpend === s._id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100 px-1">
              <span className="text-[10px] font-semibold text-gray-400">Total spent</span>
              <span className="text-xs font-bold text-gray-700">
                {fmtShort(spendings.reduce((s, e) => s + e.amount, 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
