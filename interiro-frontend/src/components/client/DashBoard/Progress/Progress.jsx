import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProgressTree from "./ProgressTree";
import ProfressCore from "./ProfressCore";
import { API_BASE } from '../../../../config.js'

const Progress = ({ showPopcard, projectId }) => {
  const [progressisOpen, setprogressOpen] = useState(false)
  const [taskData, setTaskData] = useState(null)

  useEffect(() => {
    if (!projectId) return
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/task/client/${projectId}`, { withCredentials: true })
        setTaskData(data)
      } catch (error) {
        console.error('Failed to fetch task data', error)
      }
    }
    fetchTasks()
  }, [projectId])

  useEffect(() => {
    if (!progressisOpen) return
    showPopcard("Progress Card Opened", true, 2000)
  }, [progressisOpen])

  const tasks = taskData?.tasks || []
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <>
      <motion.div
        layout
        layoutId="pop-up"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          duration: 0.5,
          layout: { duration: 0.4, ease: "easeInOut" },
        }}
        className={`relative w-full rounded-lg backdrop-blur-2xl overflow-hidden mt-4 ${
          progressisOpen ? "h-[90vh]" : "h-auto bg-white z-10"
        }`}
        onClick={() => setprogressOpen(true)}
      >
        <AnimatePresence>
          {progressisOpen
            ? <ProgressTree tasks={tasks} completedCount={completedCount} onBack={() => setprogressOpen(false)} />
            : <ProfressCore completedCount={completedCount} totalCount={tasks.length} lastUpdated={taskData?.lastUpdated} />
          }
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Progress;
