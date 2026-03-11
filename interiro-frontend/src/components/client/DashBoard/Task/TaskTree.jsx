import { AnimatePresence, motion } from 'motion/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const TASKS = ['Layout', 'PopChannel', 'Electrification', 'Ceiling', 'Furniture', 'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver']

const buildChartData = (taskData, startDate, endDate) => {
  if (!startDate || !endDate) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))

  // Completion timestamps for all completed tasks
  const completionDates = TASKS
    .filter(t => taskData?.[t]?.status === 'completed' && taskData?.[t]?.date)
    .map(t => new Date(taskData[t].date))

  const data = []

  for (let i = 0; i <= totalDays; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
    const expected = parseFloat(((i / totalDays) * 100).toFixed(1))
    const entry = { name: moment(dayDate).format('D MMM'), expected }

    // Actual only up to today
    if (dayDate <= today) {
      const doneByDay = completionDates.filter(d => d <= dayDate).length
      entry.actual = doneByDay * 10
    }

    data.push(entry)
  }

  return data
}

const TaskTree = ({ settaskOpen, taskData, startDate, endDate }) => {
  const chartData = buildChartData(taskData, startDate, endDate)

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => settaskOpen(false)}
        exit={{ opacity: 0 }}
        transition={{ duration: .5 }}
        className="fixed inset-0 z-10 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
      >
        <motion.div
          initial={{ opacity: 0, rotateX: 180, scale: 0, y: 50 }}
          animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
          exit={{ opacity: 0, rotateX: -180, scale: 0, y: 50 }}
          transition={{ duration: .5, ease: [0.25, 1, 0.5, 1] }}
          style={{ transformOrigin: "bottom" }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90%] h-[40%] px-2 py-3 rounded-lg text-black shadow-current bg-white shadow-lg"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize="3vw" />
              <YAxis domain={[0, 100]} unit="%" fontSize="3vw" />
              <Tooltip formatter={(val) => `${val}%`} />
              <Legend wrapperStyle={{ fontSize: '3vw' }} />
              <Line
                type="monotone"
                dataKey="expected"
                stroke="#c084fc"
                strokeDasharray="5 4"
                dot={false}
                strokeWidth={2}
                name="Expected"
              />
              <Line
                type="stepAfter"
                dataKey="actual"
                stroke="#883bbc"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                connectNulls={false}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default TaskTree
