import moment from "moment";
import { motion } from "motion/react";

const statusConfig = {
  completed: {
    dot: 'bg-[#883bbc] border-[#883bbc]',
    ring: 'ring-4 ring-[#F7D6F3]',
    connector: 'bg-[#883bbc]',
    label: 'text-[#883bbc]',
    badge: 'bg-[#883bbc] text-white',
    icon: '✓',
  },
  ongoing: {
    dot: 'bg-yellow-400 border-yellow-400',
    ring: 'ring-4 ring-yellow-100',
    connector: 'bg-gradient-to-b from-[#883bbc] to-yellow-300',
    label: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    icon: '●',
  },
  'not started': {
    dot: 'bg-white border-gray-300',
    ring: '',
    connector: 'bg-gray-200',
    label: 'text-gray-400',
    badge: '',
    icon: '',
  },
}

const ProgressTree = ({ tasks = [], completedCount, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-gradient-to-bl from-[#F7D6F3]/60 to-transparent overflow-y-auto"
    >
      <div className="w-full px-6 md:px-10 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={(e) => { e.stopPropagation(); onBack?.() }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-full bg-white/60 border border-[#883bbc]/20 flex items-center justify-center text-[#883bbc] hover:bg-white transition-colors"
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </motion.button>
            <h2 className="text-xl font-bold text-[#883bbc]">Project Timeline</h2>
          </div>
          <div className="text-sm font-semibold opacity-60">
            {completedCount} / {tasks.length} done
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-0">
          {tasks.map((task, index) => {
            const isCompleted = task.status === 'completed'
            const isOngoing = task.status === 'ongoing'
            const isLast = index === tasks.length - 1
            const cfg = isCompleted
              ? statusConfig.completed
              : isOngoing
              ? statusConfig.ongoing
              : statusConfig['not started']

            return (
              <motion.div
                key={task.name}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-4 relative"
              >
                {/* Left column: dot + connector */}
                <div className="flex flex-col items-center w-6 shrink-0">

                  {/* Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.35, delay: index * 0.07 + 0.1, type: 'spring', stiffness: 300 }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 relative ${cfg.dot} ${cfg.ring}`}
                  >
                    {isCompleted && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.07 + 0.25, duration: 0.25 }}
                        className="text-white text-[9px] font-black leading-none"
                      >
                        ✓
                      </motion.span>
                    )}
                    {isOngoing && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                        className="w-2 h-2 rounded-full bg-yellow-500"
                      />
                    )}
                  </motion.div>

                  {/* Connector line */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.07 + 0.2, ease: 'easeInOut', transformOrigin: 'top' }}
                      className={`w-[2px] flex-1 mt-[2px] origin-top rounded-full ${
                        isCompleted ? 'bg-[#883bbc]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>

                {/* Right column: content card */}
                <div className={`pb-5 flex-1 min-w-0 ${isLast ? 'pb-2' : ''}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.07 + 0.15 }}
                    className={`w-full rounded-xl px-4 py-3 border transition-all ${
                      isCompleted
                        ? 'bg-white border-[#883bbc]/20 shadow-sm'
                        : isOngoing
                        ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                        : 'bg-white/40 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm md:text-base truncate ${cfg.label} ${!isCompleted && !isOngoing ? 'opacity-40' : ''}`}>
                          {task.name}
                        </p>

                        {isCompleted && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.07 + 0.3 }}
                            className="text-xs text-gray-400 mt-[2px]"
                          >
                            Completed {task.date ? moment(task.date).format('D MMM YYYY') : ''}
                          </motion.p>
                        )}

                        {isOngoing && (
                          <p className="text-xs text-yellow-600 font-semibold mt-[2px]">In progress</p>
                        )}

                        {!isCompleted && !isOngoing && (
                          <p className="text-xs text-gray-300 mt-[2px]">Upcoming</p>
                        )}
                      </div>

                      {/* Status badge */}
                      {isCompleted && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.07 + 0.3, type: 'spring' }}
                          className="text-xs font-bold px-2 py-[2px] rounded-full bg-[#F7D6F3] text-[#883bbc] shrink-0"
                        >
                          Done
                        </motion.span>
                      )}
                      {isOngoing && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.6 }}
                          className="text-xs font-bold px-2 py-[2px] rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 shrink-0"
                        >
                          Active
                        </motion.span>
                      )}

                      {/* Step number */}
                      <span className={`text-xs font-mono shrink-0 ${isCompleted || isOngoing ? 'opacity-40' : 'opacity-20'}`}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}

          {tasks.length === 0 && (
            <p className="text-center text-sm opacity-40 py-8">No tasks defined for this project.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProgressTree
