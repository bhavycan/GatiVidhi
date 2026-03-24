import moment from 'moment'
import { useRef, useState, useEffect } from 'react'
import Butterfly from '../../templates/Butterfly';
import AdminNavbar from '../../templates/AdminNavbar';
import NotificationPanel from '../../templates/NotificationPanel';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config.js'

const AdminDashboard = () => {
    const date = moment().format('LL');
    const day =  moment().format('dddd');
    const parent = useRef(null)
    const [isopen, setOpen] = useState(false)
    const navigate = useNavigate()

    const [ongoingCount, setOngoingCount] = useState(null)
    const [completedCount, setCompletedCount] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [notifOpen, setNotifOpen] = useState(false)
    const [stats, setStats] = useState(null)
    const [paymentPlans, setPaymentPlans] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: projectData } = await axios.get(`${API_BASE}/project/all`, { withCredentials: true })
                const projects = projectData?.projects || []
                setOngoingCount(projects.filter(p => p.status === 'ongoing').length)
                setCompletedCount(projects.filter(p => p.status === 'completed').length)
            } catch (error) {
                console.error('Failed to fetch projects', error)
                if (error.response?.status === 401 || error.response?.status === 400) {
                    navigate('/admin/login')
                }
            }

            try {
                const { data: notifData } = await axios.get(`${API_BASE}/admin/notifications`, { withCredentials: true })
                setNotifications(notifData?.notifications || [])
            } catch (error) {
                console.error('Failed to fetch notifications', error)
            }

            try {
                const { data: statsData } = await axios.get(`${API_BASE}/admin/dashboard-stats`, { withCredentials: true })
                setStats(statsData)
            } catch (error) {
                console.error('Failed to fetch dashboard stats', error)
            }

            try {
                const { data: payData } = await axios.get(`${API_BASE}/payment/all`, { withCredentials: true })
                setPaymentPlans(payData?.plans || [])
            } catch (error) {
                console.error('Failed to fetch payment plans', error)
            }
        }
        fetchData()
    }, [])

  return (
    <div className='w-screen min-h-screen relative overflow-hidden'>

      {/* Nav icons — fixed top-right */}
      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8 flex items-center gap-3'>
        {/* Notification bell */}
        <motion.div
          onClick={() => setNotifOpen(true)}
          className="relative w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-notification-3-line text-3xl text-white opacity-90"></i>
          {notifications.length > 0 && (
            <span className='absolute top-0 right-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center'>
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </motion.div>
        {/* Menu */}
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <NotificationPanel isOpen={notifOpen} setOpen={setNotifOpen} notifications={notifications} />

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} x={20} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      <main className='w-full min-h-screen px-[8%] py-[6%] relative'>
        <div className='max-w-3xl mx-auto'>

          <header>
            <div className="title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-[3%]">
              <h1>Hi</h1>
              <h1 className='text-white'>Piyush <span className='inline-block text-black'>!</span></h1>
            </div>
            <div className="subtitle w-full md:w-[65%] font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]">
              <h4>Welcome back to your Dashboard</h4>
            </div>
            <div className="date-create w-full flex items-center mt-[3%] justify-between">
              <div className="date border-b-2 pb-4 border-white flex items-center w-[60%] gap-4">
                <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0">
                  <i className="ri-calendar-2-line text-2xl text-white opacity-90"></i>
                </div>
                <div className="date  leading-5 font-bold">
                  <h4>{date}</h4>
                  <h4>{day}</h4>
                </div>
              </div>
              <div className="create flex items-center justify-center">
                <button onClick={() => navigate('/admin/client')} className='w-10 h-10 md:w-12 md:h-12 bg-[#883bbc] rounded-full flex items-center justify-center'>
                  <i className="ri-add-line text-2xl text-white opacity-90"></i>
                </button>
              </div>
            </div>
          </header>

          <section className='completion-data w-full mt-[5%]'>
            <h4 className='text-lg font-bold'>Completion Status:</h4>
            <div className='card-container mt-[2%] w-full relative flex items-center justify-between gap-4'>

              {/* Ongoing card */}
              <div className="card w-[45%] md:w-5/12 bg-gradient-to-br backdrop-blur-lg from-white to-transparent relative rounded-md shadow-2xl shadow-current h-32 md:h-40 flex flex-col items-center justify-center gap-1">
                <i className="ri-loader-line text-3xl text-[#883bbc]"></i>
                <h2 className='text-4xl md:text-5xl font-bold'>
                  {ongoingCount === null ? <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i> : ongoingCount}
                </h2>
                <p className='text-sm font-semibold opacity-60'>Ongoing</p>
              </div>

              {/* Completed card */}
              <div className="card w-[45%] md:w-5/12 bg-gradient-to-br backdrop-blur-lg from-white to-transparent shadow-2xl shadow-current rounded-md h-32 md:h-40 flex flex-col items-center justify-center gap-1">
                <i className="ri-checkbox-circle-line text-3xl text-[#883bbc]"></i>
                <h2 className='text-4xl md:text-5xl font-bold'>
                  {completedCount === null ? <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i> : completedCount}
                </h2>
                <p className='text-sm font-semibold opacity-60'>Completed</p>
              </div>

            </div>
          </section>

          {/* Payment Progress */}
          {paymentPlans.length > 0 && (
            <section className='w-full mt-[5%]'>
              <div
                onClick={() => navigate('/admin/payments')}
                className='flex items-center justify-between mb-3 cursor-pointer group'
              >
                <h4 className='text-lg font-bold flex items-center gap-2'>
                  <i className='ri-money-rupee-circle-line text-[#883bbc]'></i>
                  Payment Progress
                </h4>
                <span className='text-xs font-semibold text-[#883bbc] opacity-70 group-hover:opacity-100 flex items-center gap-1'>
                  View all <i className='ri-arrow-right-s-line'></i>
                </span>
              </div>
              <div className='space-y-3'>
                {paymentPlans.map((plan) => {
                  const paid = plan.installments.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
                  const pct = plan.totalAmount > 0 ? Math.round((paid / plan.totalAmount) * 100) : 0
                  const paidCount = plan.installments.filter(i => i.status === 'paid').length
                  const total = plan.installments.length
                  return (
                    <div
                      key={plan._id}
                      onClick={() => navigate('/admin/payments')}
                      className='w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-md border border-[#883bbc]/20 shadow-sm cursor-pointer active:scale-[0.98] transition-transform'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <p className='font-bold text-sm truncate'>{plan.projectId?.projectName || 'Project'}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                          ${pct === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-[#883bbc]/10 text-[#883bbc]'}`}>
                          {pct === 100 ? 'Paid' : `${pct}%`}
                        </span>
                      </div>
                      <div className='w-full h-2.5 rounded-full bg-white/60 border border-[#883bbc]/10 overflow-hidden'>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                          className='h-full rounded-full bg-gradient-to-r from-[#883bbc] to-[#c084fc]'
                        />
                      </div>
                      <p className='text-xs opacity-50 font-semibold mt-1.5'>
                        {paidCount}/{total} installments · ₹{paid.toLocaleString('en-IN')} of ₹{plan.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <section className='w-full mt-[5%]'>
            <h4 className='text-lg w-full h-12 border-b-2 border-zinc-400 flex items-center justify-center font-bold'>Activity Log</h4>

            <div className='mt-[4%] grid grid-cols-2 gap-3'>
              {[
                { label: 'Worker Updates', value: stats?.workerUpdatesReceived, icon: 'ri-user-line', color: 'text-purple-600', bg: 'bg-purple-100', path: '/admin/updates' },
                { label: 'Due Updates', value: stats?.dueUpdates, icon: 'ri-time-line', color: 'text-orange-500', bg: 'bg-orange-100', path: '/admin/updates' },
                { label: 'Due Tasks', value: stats?.dueTaskUpdates, icon: 'ri-alarm-warning-line', color: 'text-red-500', bg: 'bg-red-100', path: '/admin/task' },
                { label: 'Created Updates', value: stats?.createdUpdates, icon: 'ri-refresh-line', color: 'text-blue-500', bg: 'bg-blue-100', path: '/admin/updates' },
                { label: 'Created Reports', value: stats?.createdReports, icon: 'ri-file-text-line', color: 'text-green-600', bg: 'bg-green-100', path: '/admin/report' },
                { label: 'Pending Approvals', value: stats?.pendingApprovals, icon: 'ri-time-fill', color: 'text-amber-500', bg: 'bg-amber-100', path: '/admin/approval' },
                { label: 'Approved', value: stats?.approvedApprovals, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600', bg: 'bg-emerald-100', path: '/admin/approval' },
                { label: 'Rejected', value: stats?.rejectedApprovals, icon: 'ri-close-circle-line', color: 'text-rose-500', bg: 'bg-rose-100', path: '/admin/approval' },
              ].map(({ label, value, icon, color, bg, path }) => (
                <div
                  key={label}
                  onClick={() => navigate(path)}
                  className='bg-white/50 backdrop-blur-md rounded-xl shadow-md px-4 py-4 flex items-center gap-3 cursor-pointer active:scale-95 transition-transform'
                >
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <i className={`${icon} text-xl ${color}`}></i>
                  </div>
                  <div className='min-w-0'>
                    <p className='text-2xl font-bold leading-none'>
                      {value === undefined || value === null
                        ? <i className='ri-loader-4-line animate-spin text-lg text-[#883bbc]'></i>
                        : value}
                    </p>
                    <p className='text-xs font-semibold opacity-60 mt-0.5 leading-tight'>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

    </div>
  )
}

export default AdminDashboard
