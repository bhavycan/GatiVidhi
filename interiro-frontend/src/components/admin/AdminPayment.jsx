import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import { API_BASE } from '../../config.js'

// ── Toast (same pattern as AdminUpdate) ────────────────────────────────────
import { createPortal } from 'react-dom'
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [message])
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className='fixed inset-0 z-50 px-2 w-screen h-screen bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end pb-[10%]'
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: 'bottom center' }}
        onClick={e => e.stopPropagation()}
        className='w-[90%] h-[10%] rounded-full px-3 py-3 flex items-center justify-center text-black shadow-lg backdrop-blur-sm overflow-hidden bg-gradient-to-bl from-white to-transparent'
      >
        <h2 className='text-md w-full h-full font-semibold opacity-80 flex items-center justify-center text-center'>
          {message}
        </h2>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ── Animated project dropdown ───────────────────────────────────────────────
const ProjectDropdown = ({ projects, selected, onSelect }) => {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span>{selected ? selected.projectName : 'Select a project'}</span>
        <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className='ri-arrow-down-s-line' />
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60 z-10 relative'
          >
            <div className='max-h-52 overflow-y-auto'>
              {projects.length === 0 && (
                <p className='px-4 py-2 text-sm opacity-60 font-semibold'>No ongoing projects</p>
              )}
              {projects.map((p, i) => (
                <motion.div
                  key={p._id}
                  onClick={() => { onSelect(p); setOpen(false) }}
                  className={`w-full px-4 py-2.5 cursor-pointer border-b border-[#883bbc]/30 last:border-0 hover:bg-white/40
                    ${selected?._id === p._id ? 'bg-[#883bbc]/10 text-[#883bbc]' : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <p className='font-semibold text-sm'>{p.projectName}</p>
                  <p className='text-xs opacity-40 font-mono mt-0.5'>{p._id}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Progress bar ────────────────────────────────────────────────────────────
const PaymentProgressBar = ({ plan }) => {
  const paid = plan.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const pct = plan.totalAmount > 0 ? Math.round((paid / plan.totalAmount) * 100) : 0
  const paidCount = plan.installments.filter(i => i.status === 'paid').length
  const total = plan.installments.length

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-xs font-bold text-[#883bbc]'>{paidCount}/{total} installments paid</span>
        <span className='text-xs font-bold'>{pct}%</span>
      </div>
      <div className='w-full h-3 rounded-full bg-white/50 border border-[#883bbc]/20 overflow-hidden'>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='h-full rounded-full bg-gradient-to-r from-[#883bbc] to-[#c084fc]'
        />
      </div>
      <div className='flex items-center justify-between mt-1'>
        <span className='text-xs opacity-50 font-semibold'>
          ₹{paid.toLocaleString('en-IN')} paid
        </span>
        <span className='text-xs opacity-50 font-semibold'>
          ₹{plan.totalAmount.toLocaleString('en-IN')} total
        </span>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
const AdminPayment = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [existingPlan, setExistingPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)

  // create-form state
  const [showForm, setShowForm] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')
  const [installmentCount, setInstallmentCount] = useState(1)
  const [installments, setInstallments] = useState([{ amount: '', dueDate: '', notes: '' }])
  const [submitting, setSubmitting] = useState(false)

  // edit installment state
  const [editingId, setEditingId] = useState(null)
  const [editFields, setEditFields] = useState({ amount: '', dueDate: '', notes: '' })
  const [editSaving, setEditSaving] = useState(false)

  // due installments state
  const [dueInstallments, setDueInstallments] = useState([])
  const [dueLoading, setDueLoading] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(null)

  const [toast, setToast] = useState(null)
  const showToast = msg => setToast(msg)

  // spendings state
  const [spendings, setSpendings]         = useState([])
  const [spendName, setSpendName]         = useState('')
  const [spendAmount, setSpendAmount]     = useState('')
  const [spendDate, setSpendDate]         = useState(() => new Date().toISOString().slice(0, 10))
  const [addingSpend, setAddingSpend]     = useState(false)
  const [deletingSpend, setDeletingSpend] = useState(null)

  // fetch projects + due installments + spendings on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/project/all`, { withCredentials: true })
        setProjects((data?.projects || []).filter(p => p.status === 'ongoing'))
      } catch (err) {
        if (err.response?.status === 401) navigate('/admin/login')
      }
    }
    load()
    loadDueInstallments()
    axios.get(`${API_BASE}/payment/spendings`, { withCredentials: true })
      .then(res => setSpendings(res.data.spendings || []))
      .catch(() => {})
  }, [])

  const loadDueInstallments = async () => {
    setDueLoading(true)
    try {
      const { data } = await axios.get(`${API_BASE}/payment/due`, { withCredentials: true })
      setDueInstallments(data.due || [])
    } catch (_) {}
    finally { setDueLoading(false) }
  }

  // fetch plan when project changes
  useEffect(() => {
    if (!selectedProject) { setExistingPlan(null); return }
    const load = async () => {
      setPlanLoading(true)
      try {
        const { data } = await axios.get(`${API_BASE}/payment/project/${selectedProject._id}`, { withCredentials: true })
        setExistingPlan(data.plan)
      } catch (err) {
        if (err.response?.status === 404) setExistingPlan(null)
      } finally {
        setPlanLoading(false)
      }
    }
    load()
    setShowForm(false)
  }, [selectedProject])

  // sync installment rows when count changes
  const handleCountChange = (n) => {
    const count = Math.max(1, Math.min(24, Number(n)))
    setInstallmentCount(count)
    setInstallments(prev => {
      const next = [...prev]
      while (next.length < count) next.push({ amount: '', dueDate: '', notes: '' })
      return next.slice(0, count)
    })
  }

  const updateInstallment = (idx, field, value) => {
    setInstallments(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const startEdit = (ins) => {
    setEditingId(ins._id)
    setEditFields({
      amount: ins.amount,
      dueDate: ins.dueDate ? new Date(ins.dueDate).toISOString().split('T')[0] : '',
      notes: ins.notes || '',
    })
  }

  const handleEditSave = async () => {
    setEditSaving(true)
    try {
      const { data } = await axios.post(`${API_BASE}/payment/edit-installment`, {
        planId: existingPlan._id,
        installmentId: editingId,
        amount: editFields.amount,
        dueDate: editFields.dueDate,
        notes: editFields.notes,
      }, { withCredentials: true })
      setExistingPlan(data.plan)
      setEditingId(null)
      showToast('Installment updated')
      loadDueInstallments()
    } catch (err) {
      showToast('Failed to save')
    } finally {
      setEditSaving(false)
    }
  }

  const handleSendReminder = async (due) => {
    setSendingReminder(due.installmentId)
    try {
      await axios.post(`${API_BASE}/payment/send-reminder`, {
        planId: due.planId,
        installmentId: due.installmentId,
      }, { withCredentials: true })
      showToast('Reminder sent to client')
      loadDueInstallments()
    } catch (err) {
      showToast(err.response?.data || 'Failed to send reminder')
    } finally {
      setSendingReminder(null)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showToast('Select a project first')
    const total = parseFloat(totalAmount)
    if (!total || total <= 0) return showToast('Enter a valid total amount')
    for (const [i, ins] of installments.entries()) {
      if (!ins.amount || parseFloat(ins.amount) <= 0) return showToast(`Enter amount for installment ${i + 1}`)
      if (!ins.dueDate) return showToast(`Enter due date for installment ${i + 1}`)
    }
    const sum = installments.reduce((s, i) => s + parseFloat(i.amount || 0), 0)
    if (Math.abs(sum - total) > 0.01) return showToast(`Installment amounts (₹${sum}) must equal total (₹${total})`)

    setSubmitting(true)
    try {
      const { data } = await axios.post(`${API_BASE}/payment/create`, {
        projectId: selectedProject._id,
        totalAmount: total,
        installments: installments.map(i => ({ amount: parseFloat(i.amount), dueDate: i.dueDate, notes: i.notes || '' })),
      }, { withCredentials: true })
      setExistingPlan(data.plan)
      setShowForm(false)
      setTotalAmount('')
      setInstallmentCount(1)
      setInstallments([{ amount: '', dueDate: '', notes: '' }])
      showToast('Payment plan created')
      loadDueInstallments()
    } catch (err) {
      showToast(err.response?.data || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async (installmentId) => {
    try {
      const { data } = await axios.post(`${API_BASE}/payment/mark-paid`, {
        planId: existingPlan._id,
        installmentId,
      }, { withCredentials: true })
      setExistingPlan(data.plan)
      showToast('Marked as paid')
      loadDueInstallments()
    } catch (err) {
      showToast('Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!existingPlan) return
    try {
      await axios.post(`${API_BASE}/payment/delete`, { planId: existingPlan._id }, { withCredentials: true })
      setExistingPlan(null)
      showToast('Payment plan deleted')
    } catch (err) {
      showToast('Failed to delete')
    }
  }

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  const handleAddSpend = async (e) => {
    e.preventDefault()
    if (!spendName.trim() || !spendAmount) return
    setAddingSpend(true)
    try {
      const { data } = await axios.post(`${API_BASE}/payment/spending`,
        { name: spendName.trim(), amount: Number(spendAmount), date: spendDate },
        { withCredentials: true }
      )
      setSpendings(prev => [data.spending, ...prev])
      setSpendName('')
      setSpendAmount('')
      setSpendDate(new Date().toISOString().slice(0, 10))
      showToast('Spending added!')
    } catch {
      showToast('Failed to add spending')
    } finally {
      setAddingSpend(false)
    }
  }

  const handleDeleteSpend = async (id) => {
    setDeletingSpend(id)
    try {
      await axios.delete(`${API_BASE}/payment/spending/${id}`, { withCredentials: true })
      setSpendings(prev => prev.filter(s => s._id !== id))
    } catch {
      showToast('Failed to delete')
    } finally {
      setDeletingSpend(null)
    }
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className='admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer'
        >
          <i className='ri-menu-fill text-3xl text-white opacity-90'></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[4%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto pb-20'>

          {/* Header */}
          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Pay</h1>
              <h1 className='text-white'>ments</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Manage installment plans for each project
              </h4>
            </div>
          </header>

          {/* Project selector */}
          <section className='w-full mt-[6%]'>
            <h2 className='text-lg font-bold mb-3'>Select Project</h2>
            <ProjectDropdown
              projects={projects}
              selected={selectedProject}
              onSelect={setSelectedProject}
            />
            {selectedProject && (
              <p className='text-xs font-mono opacity-40 mt-1 pl-2'>ID: {selectedProject._id}</p>
            )}
          </section>

          {/* Plan area */}
          <AnimatePresence mode='wait'>
            {selectedProject && (
              <motion.section
                key={selectedProject._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3 }}
                className='w-full mt-[6%]'
              >

                {planLoading && (
                  <div className='flex items-center justify-center py-10'>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className='w-8 h-8 rounded-full border-4 border-[#883bbc] border-t-transparent'
                    />
                  </div>
                )}

                {/* ── Existing plan ── */}
                {!planLoading && existingPlan && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='space-y-4'
                  >
                    <div className='flex items-center justify-between'>
                      <h2 className='text-lg font-bold'>Payment Plan</h2>
                      <button
                        onClick={handleDelete}
                        className='flex items-center gap-1 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200 bg-red-50/60 hover:bg-red-100 transition-colors'
                      >
                        <i className='ri-delete-bin-line'></i> Delete Plan
                      </button>
                    </div>

                    {/* Progress card */}
                    <div className='w-full px-4 py-4 rounded-2xl bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc]/30 backdrop-blur-sm'>
                      <PaymentProgressBar plan={existingPlan} />
                    </div>

                    {/* Installment list */}
                    <div className='space-y-3'>
                      {existingPlan.installments.map((ins, i) => (
                        <motion.div
                          key={ins._id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`w-full rounded-xl border px-4 py-3
                            ${ins.status === 'paid'
                              ? 'bg-emerald-50/60 border-emerald-300'
                              : 'bg-white/50 border-[#883bbc]/30'}`}
                        >
                          {editingId === ins._id ? (
                            /* ── Edit mode ── */
                            <div className='space-y-2'>
                              <div className='grid grid-cols-2 gap-2'>
                                <div>
                                  <label className='block text-xs font-semibold opacity-60 mb-1'>Amount (₹)</label>
                                  <input
                                    type='number'
                                    min='1'
                                    value={editFields.amount}
                                    onChange={e => setEditFields(f => ({ ...f, amount: e.target.value }))}
                                    className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-[#883bbc]'
                                  />
                                </div>
                                <div>
                                  <label className='block text-xs font-semibold opacity-60 mb-1'>Due Date</label>
                                  <input
                                    type='date'
                                    value={editFields.dueDate}
                                    onChange={e => setEditFields(f => ({ ...f, dueDate: e.target.value }))}
                                    className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-[#883bbc]'
                                  />
                                </div>
                              </div>
                              <div>
                                <label className='block text-xs font-semibold opacity-60 mb-1'>Notes (optional)</label>
                                <textarea
                                  rows={2}
                                  value={editFields.notes}
                                  onChange={e => setEditFields(f => ({ ...f, notes: e.target.value }))}
                                  placeholder='Any notes about this installment…'
                                  className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold placeholder:opacity-40 outline-none focus:ring-1 focus:ring-[#883bbc] resize-none'
                                />
                              </div>
                              <div className='flex gap-2 pt-1'>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className='flex-1 text-xs font-bold py-1.5 rounded-lg border border-[#883bbc]/30 bg-white/40'
                                >
                                  Cancel
                                </button>
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={handleEditSave}
                                  disabled={editSaving}
                                  className='flex-1 text-xs font-bold py-1.5 rounded-lg bg-[#883bbc] text-white flex items-center justify-center gap-1 disabled:opacity-60'
                                >
                                  {editSaving
                                    ? <i className='ri-loader-4-line animate-spin'></i>
                                    : <><i className='ri-save-line'></i> Save</>
                                  }
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            /* ── View mode ── */
                            <div className='flex items-start justify-between gap-3'>
                              <div className='flex items-start gap-3 min-w-0'>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                                  ${ins.status === 'paid' ? 'bg-emerald-500' : 'bg-[#883bbc]/20'}`}>
                                  {ins.status === 'paid'
                                    ? <i className='ri-check-line text-white text-sm'></i>
                                    : <span className='text-xs font-bold text-[#883bbc]'>{i + 1}</span>
                                  }
                                </div>
                                <div className='min-w-0'>
                                  <p className='font-bold text-base'>₹{ins.amount.toLocaleString('en-IN')}</p>
                                  <p className='text-xs opacity-50 font-semibold'>Due: {formatDate(ins.dueDate)}</p>
                                  {ins.paidAt && (
                                    <p className='text-xs text-emerald-600 font-semibold'>Paid: {formatDate(ins.paidAt)}</p>
                                  )}
                                  {ins.notes && (
                                    <p className='text-xs opacity-60 mt-0.5 italic'>"{ins.notes}"</p>
                                  )}
                                </div>
                              </div>
                              <div className='flex items-center gap-2 shrink-0'>
                                {ins.status === 'pending' && (
                                  <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => startEdit(ins)}
                                    className='p-1.5 rounded-full border border-[#883bbc]/30 bg-white/40 text-[#883bbc]'
                                  >
                                    <i className='ri-edit-line text-sm'></i>
                                  </motion.button>
                                )}
                                {ins.status === 'pending' && (
                                  <motion.button
                                    whileTap={{ scale: 0.93 }}
                                    onClick={() => handleMarkPaid(ins._id)}
                                    className='px-3 py-1.5 rounded-full bg-[#883bbc] text-white text-xs font-bold flex items-center gap-1'
                                  >
                                    <i className='ri-money-rupee-circle-line'></i> Mark Paid
                                  </motion.button>
                                )}
                                {ins.status === 'paid' && (
                                  <span className='px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold'>
                                    Paid
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── No plan yet ── */}
                {!planLoading && !existingPlan && (
                  <div>
                    <AnimatePresence mode='wait'>
                      {!showForm && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className='px-4 py-4 rounded-xl bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/30'
                        >
                          <p className='text-sm font-semibold opacity-70 mb-4'>
                            No payment plan set up for <span className='text-[#883bbc]'>{selectedProject.projectName}</span> yet.
                          </p>
                          <motion.button
                            layoutId='pay-open-btn'
                            onClick={() => setShowForm(true)}
                            whileTap={{ scale: 0.95 }}
                            className='flex items-center gap-2 px-5 py-2.5 bg-[#883bbc] text-white rounded-lg font-bold text-sm'
                          >
                            <i className='ri-add-circle-fill text-lg'></i> Create Plan
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Create form */}
                    <AnimatePresence mode='wait'>
                      {showForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className='border border-[#883bbc] rounded-xl backdrop-blur-sm overflow-hidden'
                        >
                          <motion.form
                            onSubmit={handleCreate}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className='px-4 py-5 space-y-5'
                          >
                            <h2 className='text-base font-bold'>New Payment Plan</h2>

                            {/* Total amount */}
                            <motion.div
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <label className='block text-sm font-medium text-black mb-1.5'>Total Amount (₹)</label>
                              <input
                                type='number'
                                min='1'
                                value={totalAmount}
                                onChange={e => setTotalAmount(e.target.value)}
                                placeholder='e.g. 500000'
                                className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold placeholder:opacity-40 outline-none focus:ring-1 focus:ring-[#883bbc]'
                              />
                            </motion.div>

                            {/* Number of installments */}
                            <motion.div
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.35 }}
                            >
                              <label className='block text-sm font-medium text-black mb-1.5'>
                                Number of Installments
                              </label>
                              <div className='flex items-center gap-3'>
                                <motion.button
                                  type='button'
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCountChange(installmentCount - 1)}
                                  className='w-9 h-9 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] font-bold text-lg'
                                >
                                  −
                                </motion.button>
                                <span className='text-2xl font-bold w-8 text-center'>{installmentCount}</span>
                                <motion.button
                                  type='button'
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCountChange(installmentCount + 1)}
                                  className='w-9 h-9 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] font-bold text-lg'
                                >
                                  +
                                </motion.button>
                                <span className='text-xs opacity-50 font-semibold ml-2'>max 24</span>
                              </div>
                            </motion.div>

                            {/* Installment rows */}
                            <motion.div
                              initial={{ opacity: 0, x: -16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className='space-y-3'
                            >
                              <label className='block text-sm font-medium text-black'>Installment Details</label>

                              {/* Amount sum hint */}
                              {totalAmount && (
                                <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#883bbc]/5 border border-[#883bbc]/20'>
                                  <i className='ri-information-line text-[#883bbc] text-sm'></i>
                                  <p className='text-xs font-semibold opacity-70'>
                                    Amounts must sum to ₹{parseFloat(totalAmount || 0).toLocaleString('en-IN')}.
                                    Current: ₹{installments.reduce((s, i) => s + parseFloat(i.amount || 0), 0).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              )}

                              {installments.map((ins, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.04 }}
                                  className='w-full rounded-xl border border-[#883bbc]/30 bg-white/40 backdrop-blur-sm px-3 py-3'
                                >
                                  <div className='flex items-center gap-2 mb-2'>
                                    <div className='w-6 h-6 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                                      <span className='text-[10px] font-bold text-white'>{idx + 1}</span>
                                    </div>
                                    <span className='text-xs font-bold opacity-60'>Installment {idx + 1}</span>
                                  </div>
                                  <div className='grid grid-cols-2 gap-2'>
                                    <div>
                                      <label className='block text-xs font-semibold opacity-60 mb-1'>Amount (₹)</label>
                                      <input
                                        type='number'
                                        min='1'
                                        value={ins.amount}
                                        onChange={e => updateInstallment(idx, 'amount', e.target.value)}
                                        placeholder='0'
                                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold placeholder:opacity-40 outline-none focus:ring-1 focus:ring-[#883bbc]'
                                      />
                                    </div>
                                    <div>
                                      <label className='block text-xs font-semibold opacity-60 mb-1'>Due Date</label>
                                      <input
                                        type='date'
                                        value={ins.dueDate}
                                        onChange={e => updateInstallment(idx, 'dueDate', e.target.value)}
                                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-[#883bbc]'
                                      />
                                    </div>
                                  </div>
                                  <div className='mt-2'>
                                    <label className='block text-xs font-semibold opacity-60 mb-1'>Notes (optional)</label>
                                    <input
                                      type='text'
                                      value={ins.notes}
                                      onChange={e => updateInstallment(idx, 'notes', e.target.value)}
                                      placeholder='e.g. Foundation work, advance…'
                                      className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-3 py-1.5 text-sm font-semibold placeholder:opacity-40 outline-none focus:ring-1 focus:ring-[#883bbc]'
                                    />
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>

                            {/* Buttons */}
                            <motion.div
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              className='flex gap-3 pt-1'
                            >
                              <button
                                type='button'
                                onClick={() => setShowForm(false)}
                                className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-3 font-medium text-sm'
                              >
                                Cancel
                              </button>
                              <motion.button
                                layoutId='pay-open-btn'
                                type='submit'
                                disabled={submitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className='flex-1 rounded-lg px-4 py-3 bg-[#883bbc] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60'
                              >
                                {submitting
                                  ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                                  : <><i className='ri-save-line'></i> Save Plan</>
                                }
                              </motion.button>
                            </motion.div>
                          </motion.form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          {/* No project selected hint */}
          {!selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mt-[6%] px-4 py-5 rounded-xl bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/20 text-center'
            >
              <i className='ri-money-rupee-circle-line text-4xl text-[#883bbc] opacity-50'></i>
              <p className='mt-2 font-semibold opacity-60 text-sm'>Select a project to view or create its payment plan.</p>
            </motion.div>
          )}

          {/* ── Due Installments ── */}
          <section className='w-full mt-[8%]'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-bold flex items-center gap-2'>
                <i className='ri-alarm-warning-line text-red-500'></i> Due Installments
              </h2>
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={loadDueInstallments}
                className='text-xs font-bold text-[#883bbc] flex items-center gap-1 opacity-70 hover:opacity-100'
              >
                <i className='ri-refresh-line'></i> Refresh
              </motion.button>
            </div>

            {dueLoading && (
              <div className='flex items-center justify-center py-8'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className='w-7 h-7 rounded-full border-4 border-[#883bbc] border-t-transparent'
                />
              </div>
            )}

            {!dueLoading && dueInstallments.length === 0 && (
              <div className='px-4 py-5 rounded-xl bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/20 text-center'>
                <i className='ri-checkbox-circle-line text-3xl text-emerald-500 opacity-70'></i>
                <p className='mt-2 font-semibold opacity-60 text-sm'>No overdue installments. All caught up!</p>
              </div>
            )}

            {!dueLoading && dueInstallments.length > 0 && (
              <div className='space-y-3'>
                {dueInstallments.map((due, i) => (
                  <motion.div
                    key={due.installmentId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className='w-full rounded-xl border border-red-200 bg-red-50/50 backdrop-blur-sm px-4 py-3'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <p className='font-bold text-base'>₹{due.amount.toLocaleString('en-IN')}</p>
                          <span className='text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold'>
                            Overdue
                          </span>
                        </div>
                        <p className='text-xs font-semibold opacity-70 mt-0.5'>{due.projectName}</p>
                        <p className='text-xs text-red-400 font-semibold mt-0.5'>
                          Due: {formatDate(due.dueDate)}
                        </p>
                        {due.clientName && (
                          <p className='text-xs opacity-50 font-semibold mt-0.5'>Client: {due.clientName}</p>
                        )}
                        {due.notes && (
                          <p className='text-xs opacity-60 italic mt-0.5'>"{due.notes}"</p>
                        )}
                        {due.lastReminderAt && (
                          <p className='text-xs opacity-40 font-semibold mt-0.5'>
                            Last reminder: {formatDate(due.lastReminderAt)}
                          </p>
                        )}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => handleSendReminder(due)}
                        disabled={sendingReminder === due.installmentId}
                        className='shrink-0 px-3 py-2 rounded-lg bg-[#883bbc] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-60'
                      >
                        {sendingReminder === due.installmentId
                          ? <i className='ri-loader-4-line animate-spin text-sm'></i>
                          : <><i className='ri-mail-send-line'></i> Remind</>
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* ── Spendings Section ───────────────────────────────────────── */}
          <section className='w-full mt-[6%] pb-24'>
            <div className='flex items-center gap-2 border-b-2 border-zinc-400 pb-3 mb-4'>
              <i className='ri-wallet-3-line text-[#883bbc] text-xl'></i>
              <h1 className='text-xl font-bold'>Spendings</h1>
            </div>

            {/* Add form */}
            <form onSubmit={handleAddSpend} className='w-full space-y-3 mb-5'>
              <div>
                <label className='block text-sm font-semibold mb-1.5 opacity-70'>Bill name</label>
                <input
                  type='text'
                  required
                  value={spendName}
                  onChange={e => setSpendName(e.target.value)}
                  placeholder='e.g. Material purchase'
                  className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                />
              </div>
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <label className='block text-sm font-semibold mb-1.5 opacity-70'>Amount (₹)</label>
                  <input
                    type='number'
                    required
                    min='1'
                    value={spendAmount}
                    onChange={e => setSpendAmount(e.target.value)}
                    placeholder='e.g. 25000'
                    className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                  />
                </div>
                <div className='flex-1'>
                  <label className='block text-sm font-semibold mb-1.5 opacity-70'>Date</label>
                  <input
                    type='date'
                    value={spendDate}
                    onChange={e => setSpendDate(e.target.value)}
                    className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#883bbc]'
                  />
                </div>
              </div>
              <motion.button
                type='submit'
                whileTap={{ scale: 0.97 }}
                disabled={addingSpend}
                className='w-full py-2.5 rounded-full bg-[#883bbc] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60'
              >
                {addingSpend
                  ? <><i className='ri-loader-4-line animate-spin'></i> Adding…</>
                  : <><i className='ri-add-circle-line'></i> Add Spending</>
                }
              </motion.button>
            </form>

            {/* List */}
            {spendings.length === 0 ? (
              <div className='px-4 py-4 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No spendings recorded yet.</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {spendings.map((s, i) => (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className='flex items-center justify-between bg-gradient-to-r from-white/70 to-transparent backdrop-blur-sm border border-[#883bbc]/20 rounded-lg px-4 py-3'
                  >
                    <div>
                      <p className='text-sm font-bold leading-5'>{s.name}</p>
                      <p className='text-xs opacity-50 font-semibold mt-0.5'>{formatDate(s.date)}</p>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm font-black text-[#883bbc]'>
                        ₹{Number(s.amount).toLocaleString('en-IN')}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteSpend(s._id)}
                        disabled={deletingSpend === s._id}
                        className='w-7 h-7 rounded-full bg-red-100 text-red-400 flex items-center justify-center disabled:opacity-40'
                      >
                        {deletingSpend === s._id
                          ? <i className='ri-loader-4-line animate-spin text-xs'></i>
                          : <i className='ri-delete-bin-line text-sm'></i>
                        }
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                <div className='flex items-center justify-between px-4 py-2 border-t-2 border-zinc-300 mt-2'>
                  <span className='text-sm font-bold opacity-60'>Total spent</span>
                  <span className='text-sm font-black text-[#883bbc]'>
                    ₹{spendings.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminPayment
