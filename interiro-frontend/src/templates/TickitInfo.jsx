import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react'
import CustomButtom from './CustomButtom';

const PRIORITY_STYLES = {
  high:   { badge: 'bg-red-100 text-red-600 border border-red-300',    label: 'High Priority' },
  medium: { badge: 'bg-yellow-100 text-yellow-600 border border-yellow-300', label: 'Medium Priority' },
  low:    { badge: 'bg-green-100 text-green-600 border border-green-300',   label: 'Low Priority' },
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const TickitInfo = ({ setTicketDetail, openTicketDetail, ticketData }) => {

    const [isreminder, setReminder] = useState(false)
    const [reminderClick, setReminderClick] = useState(false)
    const [isTicketOpen, setTicketOpen] = useState(true);
    const [popMessage, setPopMessage] = useState('')
    const [popVisible, setPopVisible] = useState(false)

    const priorityStyle = PRIORITY_STYLES[ticketData.priorityLevel] || PRIORITY_STYLES.medium

    useEffect(() => {
        const date1 = new Date(ticketData.receivedDate);
        const date2 = new Date();
        const diffDays = (date2 - date1) / (1000 * 60 * 60 * 24);
        if (diffDays > 2) setReminder(true);
    }, [ticketData])

    useEffect(() => {
        if (reminderClick) {
            const timer = setTimeout(() => setReminderClick(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [reminderClick])

    useEffect(() => {
        if (isTicketOpen && openTicketDetail) {
            setPopMessage("Ticket")
            setPopVisible(true)
        } else {
            setPopVisible(false)
        }
        return () => setPopVisible(false)
    }, [isTicketOpen, openTicketDetail])

    const handleDrag = (_e, info) => {
        if (Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
            if (info.offset.y > 5) {
                setTicketOpen(false);
                setTicketDetail(false)
            }
        }
    }

  return (
    <div className='w-screen h-screen fixed inset-0 z-10 overflow-hidden'>

      {/* CustomButtom popcard */}
      <AnimatePresence>
        {popVisible && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            key={popMessage}
            animate={{ opacity: 1, scaleY: 1, transformOrigin: "top" }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            exit={{ opacity: 0, scaleY: 0 }}
            className='w-[80%] h-14 rounded-lg to-transparent absolute z-20 top-0 left-0'
          >
            <CustomButtom message={popMessage} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTicketOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setTicketOpen(false); setTicketDetail(false) }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className='absolute inset-0 px-4 bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 backdrop-blur-xs'
          >

            {/* Reminder sent animation */}
            <AnimatePresence>
              {reminderClick && (
                <div className="absolute top-[20%] w-full flex items-center justify-center h-[20%]">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className='w-[45vw] h-[45vw] backdrop-blur-md flex flex-col items-center justify-center rounded-full bg-white'
                  >
                    <motion.svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth=".6" stroke="currentColor" className="size-20 text-[#883bbc]">
                      <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "backInOut" }}
                        strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                    </motion.svg>
                    <motion.h1>Reminder Sent!</motion.h1>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              drag="y"
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 250 }}
              dragElastic={0}
              onDragEnd={(_e, info) => handleDrag(_e, info)}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="Ticket-box w-[100%] px-4 py-5 min-h-[45%] border-t-2 border-l-2 border-r-2 border-[#883bbc] backdrop-blur-sm rounded-t-4xl overflow-y-auto"
            >
              {/* Header */}
              <div className="title w-full pb-[5%] border-b-2 border-white font-semibold">
                <h1 className='text-5xl'>Your <span className='inline-block text-white'>Ticket</span>.</h1>
                <h3 className='opacity-80 mt-[2%] font-bold text-base'>Received on {formatDate(ticketData.receivedDate)}</h3>
              </div>

              {/* Priority badge */}
              <div className='mt-[4%]'>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${priorityStyle.badge}`}>
                  {priorityStyle.label}
                </span>
              </div>

              {/* Note */}
              <div className="w-full border border-white/60 mt-[4%] rounded-md min-h-[18vh] px-3 py-3 bg-white/20">
                <p className='font-semibold text-lg leading-relaxed'>{ticketData.note}</p>
              </div>

              {/* Action button */}
              <div className='mt-[4%] pb-2'>
                {ticketData.resolved ? (
                  <motion.div className='rounded-md bg-green-100 text-green-600 border border-green-300 px-2 py-3 w-full flex text-lg font-semibold justify-center items-center gap-2'>
                    <i className='ri-checkbox-circle-fill'></i> Resolved
                  </motion.div>
                ) : isreminder ? (
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    layoutId='remind-button'
                    onClick={() => { setReminderClick(true); setReminder(false) }}
                    className='rounded-md text-white bg-[#883bbc] px-2 py-3 w-full flex text-lg font-semibold justify-center items-center gap-2 cursor-pointer'
                  >
                    <i className='ri-notification-3-line'></i> Remind
                  </motion.div>
                ) : (
                  <motion.div className='rounded-md text-white bg-[#883bbc] px-2 py-3 w-full flex text-lg font-semibold justify-center items-center gap-2'>
                    <i className='ri-time-line'></i> Active
                  </motion.div>
                )}
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default TickitInfo
