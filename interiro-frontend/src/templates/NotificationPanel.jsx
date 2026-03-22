import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config.js';

const priorityColor = (p) => ({
  high: 'text-red-500 bg-red-100',
  medium: 'text-orange-500 bg-orange-100',
  normal: 'text-blue-500 bg-blue-100',
  low: 'text-gray-500 bg-gray-100',
}[p] || 'text-gray-500 bg-gray-100');

const NotificationPanel = ({ isOpen, setOpen, notifications }) => {
  const tasks     = notifications.filter(n => n.type === 'task');
  const updates   = notifications.filter(n => n.type === 'update');
  const tickets   = notifications.filter(n => n.type === 'ticket');
  const approvals = notifications.filter(n => n.type === 'approval');
  const navigate  = useNavigate();

  // Mark approval notifications as seen when the panel opens
  useEffect(() => {
    if (isOpen && approvals.length > 0) {
      axios.post(`${API_BASE}/approval/admin-clear`, {}, { withCredentials: true }).catch(() => {});
    }
  }, [isOpen]);

  const handleDrag = (e, info) => {
    if (info.offset.y > 60) setOpen(false);
  };

  const goTo = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
          className='fixed inset-0 z-50 flex items-end justify-center px-4 bg-black/20 backdrop-blur-sm'
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            drag='y'
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDrag}
            onClick={e => e.stopPropagation()}
            className='w-full max-w-lg bg-gradient-to-br from-[#F7D6F3] to-white/90 backdrop-blur-md rounded-t-3xl border-t-2 border-l-2 border-r-2 border-[#883bbc]/40 px-5 py-5 max-h-[75vh] flex flex-col'
          >
            {/* Drag handle */}
            <div className='w-10 h-1 rounded-full bg-[#883bbc]/40 mx-auto mb-4 shrink-0' />

            <div className='flex items-center justify-between mb-4 shrink-0'>
              <h2 className='text-2xl font-bold'>Notifications</h2>
              <span className='px-2 py-0.5 rounded-full bg-[#883bbc] text-white text-xs font-bold'>
                {notifications.length}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className='flex-1 flex flex-col items-center justify-center opacity-60 gap-2'>
                <i className='ri-notification-off-line text-4xl text-[#883bbc]'></i>
                <p className='font-semibold'>All caught up!</p>
              </div>
            ) : (
              <div className='flex-1 overflow-y-auto flex flex-col gap-4 pb-4'>

                {tasks.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-2'>
                      <i className='ri-task-line text-[#883bbc]'></i> Overdue Tasks
                    </h3>
                    <div className='flex flex-col gap-2'>
                      {tasks.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => goTo(`/admin/task?projectId=${n.projectId}`)}
                          className='w-full px-4 py-3 rounded-xl bg-white/60 border border-[#883bbc]/20 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform'
                        >
                          <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5'>
                            <i className='ri-alarm-warning-line text-red-500 text-base'></i>
                          </div>
                          <div className='leading-5 flex-1'>
                            <p className='font-bold text-sm'>{n.message}</p>
                            <p className='text-xs opacity-60 mt-0.5'>{n.projectName}</p>
                            {n.date && (
                              <p className='text-xs text-red-400 font-semibold mt-0.5'>
                                Due: {moment(n.date).format('Do MMM YYYY')}
                              </p>
                            )}
                          </div>
                          <i className='ri-arrow-right-s-line text-[#883bbc] text-lg mt-0.5 shrink-0'></i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {updates.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-2'>
                      <i className='ri-refresh-line text-[#883bbc]'></i> Stale Updates
                    </h3>
                    <div className='flex flex-col gap-2'>
                      {updates.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => goTo(`/admin/updates?projectId=${n.projectId}`)}
                          className='w-full px-4 py-3 rounded-xl bg-white/60 border border-[#883bbc]/20 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform'
                        >
                          <div className='w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5'>
                            <i className='ri-time-line text-yellow-500 text-base'></i>
                          </div>
                          <div className='leading-5 flex-1'>
                            <p className='font-bold text-sm'>{n.projectName}</p>
                            <p className='text-xs opacity-60 mt-0.5'>{n.message}</p>
                          </div>
                          <i className='ri-arrow-right-s-line text-[#883bbc] text-lg mt-0.5 shrink-0'></i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tickets.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-2'>
                      <i className='ri-ticket-line text-[#883bbc]'></i> Open Tickets ({tickets.length})
                    </h3>
                    <div className='flex flex-col gap-2'>
                      {tickets.map((n, i) => (
                        <div
                          key={i}
                          onClick={() => goTo('/admin/tickets')}
                          className='w-full px-4 py-3 rounded-xl bg-white/60 border border-[#883bbc]/20 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform'
                        >
                          <div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5'>
                            <i className='ri-ticket-line text-[#883bbc] text-base'></i>
                          </div>
                          <div className='leading-5 flex-1'>
                            <div className='flex items-center gap-2 mb-0.5'>
                              <p className='font-bold text-sm flex-1'>{n.projectName}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priorityColor(n.priority)}`}>
                                {n.priority}
                              </span>
                            </div>
                            <p className='text-xs opacity-70 leading-4'>{n.message}</p>
                            {n.date && (
                              <p className='text-xs opacity-40 mt-0.5'>{moment(n.date).fromNow()}</p>
                            )}
                          </div>
                          <i className='ri-arrow-right-s-line text-[#883bbc] text-lg mt-0.5 shrink-0'></i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approvals.length > 0 && (
                  <div>
                    <h3 className='text-sm font-bold opacity-60 uppercase tracking-wide mb-2 flex items-center gap-2'>
                      <i className='ri-checkbox-circle-line text-[#883bbc]'></i> Client Responses ({approvals.length})
                    </h3>
                    <div className='flex flex-col gap-2'>
                      {approvals.map((n, i) => {
                        const isApproved = n.message.includes('approved');
                        return (
                          <div
                            key={i}
                            onClick={() => goTo('/admin/approval')}
                            className='w-full px-4 py-3 rounded-xl bg-white/60 border border-[#883bbc]/20 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform'
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isApproved ? 'bg-green-100' : 'bg-red-100'}`}>
                              <i className={`text-base ${isApproved ? 'ri-check-line text-green-600' : 'ri-close-line text-red-500'}`}></i>
                            </div>
                            <div className='leading-5 flex-1'>
                              <p className='font-bold text-sm'>{n.message}</p>
                              <p className='text-xs opacity-60 mt-0.5'>{n.projectName}</p>
                              {n.date && (
                                <p className='text-xs opacity-40 mt-0.5'>{moment(n.date).fromNow()}</p>
                              )}
                            </div>
                            <i className='ri-arrow-right-s-line text-[#883bbc] text-lg mt-0.5 shrink-0'></i>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
