import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react'
import axios from 'axios';
import TaskCore from './TaskCore';
import TaskTree from './TaskTree';
import { API_BASE } from '../../../../config.js'

const TaskBox = ({ showPopcard, projectId, startDate, endDate }) => {
  const [taskIsOpen, settaskOpen] = useState(false)
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
    if (taskIsOpen) {
      showPopcard("Task Is opened")
    } else {
      showPopcard("", false)
    }
  }, [taskIsOpen])

  return (
    <motion.div className='first w-[30%] h-[100%] rounded-lg'>
      <div onClick={() => settaskOpen(true)} className="cursor-pointer flex items-center flex-col relative justify-center w-[100%] rounded-lg overflow-hidden h-[100%]">
        <TaskCore
          completedCount={taskData?.tasks?.filter(t => t.status === 'completed').length ?? null}
          totalCount={taskData?.tasks?.length ?? null}
        />
      </div>

      <AnimatePresence mode="wait">
        {taskIsOpen && (
          <TaskTree
            settaskOpen={settaskOpen}
            taskData={taskData}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TaskBox
