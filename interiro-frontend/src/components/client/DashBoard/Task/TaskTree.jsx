import { motion } from 'motion/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import moment from 'moment'

const buildChartData = (tasks, startDate, endDate) => {
  if (!startDate || !endDate || !tasks?.length) return []

  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  const total = tasks.length

  const completionDates = tasks
    .filter(t => t.status === 'completed' && t.date)
    .map(t => new Date(t.date))

  const data = []
  for (let i = 0; i <= totalDays; i++) {
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
    const expected = parseFloat(((i / totalDays) * 100).toFixed(1))
    const entry = { name: moment(dayDate).format('D MMM'), expected }

    if (dayDate <= today) {
      const doneByDay = completionDates.filter(d => d <= dayDate).length
      entry.actual = parseFloat(((doneByDay / total) * 100).toFixed(1))
    }

    data.push(entry)
  }
  return data
}

const TaskTree = ({ settaskOpen, taskData, startDate, endDate }) => {
  const tasks = taskData?.tasks || []
  const chartData = buildChartData(tasks, startDate, endDate)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => settaskOpen(false)}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-10 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
    >
      <motion.div
        initial={{ opacity: 0, rotateX: 180, scale: 0, y: 50 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
        exit={{ opacity: 0, rotateX: -180, scale: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: 'bottom' }}
        onClick={e => e.stopPropagation()}
        className="w-[90%] h-[40%] px-2 py-3 rounded-lg text-black bg-white shadow-lg"
      >
        {chartData.length === 0 ? (
          <div className='w-full h-full flex items-center justify-center'>
            <p className='text-sm opacity-40 font-semibold'>No data available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
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
        )}
      </motion.div>
    </motion.div>
  )
}

export default TaskTree
