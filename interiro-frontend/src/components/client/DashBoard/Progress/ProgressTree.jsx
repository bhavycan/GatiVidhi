import moment from "moment";
import { motion } from "motion/react";

const TASKS = ['Layout', 'PopChannel', 'Electrification', 'Ceiling', 'Furniture', 'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver']

const ProgressTree = ({ taskData, completedCount }) => {
  const getStatus = (task) => taskData?.[task]?.status || 'not started'
  const getDate = (task) => taskData?.[task]?.date

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, delay: 0.2 }}
      className="w-full h-full bg-gradient-to-bl from-[#F7D6F3] to-transparent"
    >
      <div className="w-full h-full px-[8%] py-3 flex">
        <div className="w-full h-full flex relative justify-between">

          {/* Timeline spine + dots */}
          <div className="w-[1.5%] py-2 rounded-full h-full flex flex-col items-center justify-between relative">
            {TASKS.map((task, index) => {
              const status = getStatus(task)
              const isCompleted = status === 'completed'
              const isOngoing = status === 'ongoing'
              return (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, backgroundColor: "#883bbc" }}
                  animate={{ opacity: isCompleted || isOngoing ? 1 : 0.3 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="w-5 h-5 md:w-6 md:h-6 bg-[#883bbc] relative z-10 rounded-full"
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, backgroundColor: "#883bbc" }}
                      animate={{ backgroundColor: "#F7D6F3", opacity: 1 }}
                      transition={{ duration: 1, delay: 1 - index * 0.1 }}
                      className="w-full h-full border-[1px] border-[#883bbc] rounded-full absolute top-1 left-1"
                    />
                  )}
                  {isOngoing && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="w-full h-full border-[1px] border-yellow-500 bg-yellow-300/60 rounded-full absolute top-1 left-1"
                    />
                  )}
                </motion.div>
              )
            })}

            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: completedCount / 10, opacity: 1, transformOrigin: "top" }}
              transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
              className="w-full top-0 rounded-full bg-[#883bbc] h-full flex flex-col items-center justify-between absolute"
            />
          </div>

          {/* Task labels */}
          <div className="w-[90%] h-full flex flex-col items-center justify-between">
            {TASKS.map((task, index) => {
              const status = getStatus(task)
              const date = getDate(task)
              const isCompleted = status === 'completed'
              const isOngoing = status === 'ongoing'

              return (
                <div key={task} className="w-full font-semibold text-xl flex flex-col items-start justify-center">
                  <motion.h1
                    className={`w-fit h-full flex overflow-hidden relative items-center justify-center rounded-4xl px-2 ${
                      isOngoing ? 'border-1 px-5 border-yellow-500 text-yellow-700' : ''
                    } ${isCompleted && index === completedCount - 1 ? 'border-1 px-5 border-pink-500' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isCompleted || isOngoing ? 1 : 1 - index * 0.1 }}
                    transition={{ duration: 1 }}
                  >
                    {task}
                  </motion.h1>

                  {isCompleted ? (
                    <h2 className="text-sm px-2 opacity-70 mt-[1%]">
                      Completed on: {date ? moment(date).format('LL') : '—'}
                    </h2>
                  ) : isOngoing ? (
                    <h2 className="text-sm px-2 text-yellow-600 font-semibold mt-[1%]">Ongoing</h2>
                  ) : (
                    <h2 className="text-sm px-2 opacity-70 mt-[1%]">Not Started</h2>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProgressTree;
