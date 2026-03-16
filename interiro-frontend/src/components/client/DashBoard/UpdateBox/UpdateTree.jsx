import { motion } from "motion/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Rectangle, ResponsiveContainer } from 'recharts';

const UpdateTree = ({ setUpdateOpen }) => {
  const [taskCounts, setTaskCounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/update/task-counts', { withCredentials: true })
        setTaskCounts(data?.taskCounts || [])
      } catch (_) {
        setTaskCounts([])
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  const chartData = taskCounts.map(t => ({
    name: t.name.length > 9 ? t.name.slice(0, 8) + '…' : t.name,
    fullName: t.name,
    update: t.update,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setUpdateOpen(false)}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-10 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: "bottom left" }}
        onClick={e => e.stopPropagation()}
        className="w-[90%] relative flex items-center justify-center h-[40%] rounded-lg px-2 py-2 text-black bg-white shadow-lg"
      >
        {loading ? (
          <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i>
        ) : chartData.length === 0 ? (
          <p className="text-sm opacity-40 font-semibold">No update data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={false} label="Tasks" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(val, _, props) => [val, props.payload.fullName]}
                labelFormatter={() => ''}
              />
              <Bar
                dataKey="update"
                fill="#8884d8"
                activeBar={<Rectangle fill="pink" stroke="#883bbc" />}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UpdateTree;
