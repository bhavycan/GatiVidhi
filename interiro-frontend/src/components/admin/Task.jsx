import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'

const TASKS = [
  'Layout', 'PopChannel', 'Electrification', 'Ceiling', 'Furniture',
  'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver'
]
const STATUS_OPTIONS = ['not started', 'ongoing', 'completed']

const initialTaskState = () =>
  Object.fromEntries(TASKS.map(t => [t, { status: 'not started' }]))

// Reusable animated dropdown
const TaskDropdown = ({ taskName, value, onChange }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (status) => {
    onChange(taskName, status)
    setOpen(false)
  }

  const colorMap = {
    'not started': 'opacity-60',
    'ongoing': 'text-yellow-700',
    'completed': 'text-green-700',
  }

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span className={colorMap[value]}>{value}</span>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className='ri-arrow-down-s-line'
        />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60'
          >
            {STATUS_OPTIONS.map((s, i) => (
              <motion.div
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full text-base font-semibold px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 ${colorMap[s]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
              >
                <i className='ri-arrow-right-s-line'></i>{s}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Project picker dropdown
const ProjectDropdown = ({ projects, selected, onSelect, lastUpdated }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (project) => {
    onSelect(project)
    setOpen(false)
  }

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span>{selected ? selected.projectName : 'Select a project'}</span>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className='ri-arrow-down-s-line'
        />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60'
          >
            {projects.length === 0 && (
              <p className='px-4 py-2 text-sm opacity-60 font-semibold'>No ongoing projects found</p>
            )}
            {projects.map((p, i) => (
              <motion.div
                key={p._id}
                onClick={() => handleSelect(p)}
                className='w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.2 }}
              >
                <p className='font-semibold text-base'>{p.projectName}</p>
                <p className='text-xs opacity-50 font-mono mt-[2px]'>{p._id}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show selected project's ID and last task updated below */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mt-1 pl-2 space-y-[2px]'
        >
          <p className='text-xs font-mono opacity-50'>ID: {selected._id}</p>
          <p className='text-xs font-mono opacity-50'>
            Last task updated: <span className='text-[#883bbc] opacity-100'>{formatDate(lastUpdated)}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

const Task = () => {
  const parent = useRef(null)
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isFormOpen, setFormOpen] = useState(false)
  const [tasks, setTasks] = useState(initialTaskState())
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [staleProjects, setStaleProjects] = useState([])

  const fetchStaleProjects = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/task/stale', { withCredentials: true })
      setStaleProjects(data)
    } catch (error) {
      console.error('Failed to fetch stale projects', error)
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/project/all', { withCredentials: true })
        const ongoing = (data?.projects || []).filter(p => p.status === 'ongoing')
        setProjects(ongoing)
      } catch (error) {
        console.error('Failed to fetch projects', error)
        if (error.response?.status === 400 || error.response?.status === 401) {
          navigate('/admin/login')
        }
      }
    }

    fetchProjects()
    fetchStaleProjects()
  }, [])

  const handleProjectSelect = async (project) => {
    setSelectedProject(project)
    try {
      const { data } = await axios.get(`http://localhost:3000/task/${project._id}`, { withCredentials: true })
      const filled = Object.fromEntries(
        TASKS.map(t => [t, { status: data[t]?.status || 'not started' }])
      )
      setTasks(filled)
      setLastUpdated(data.lastUpdated || null)
    } catch (_) {
      // No existing task list — keep defaults
      setTasks(initialTaskState())
      setLastUpdated(null)
    }
  }

  const handleStaleProjectClick = async (staleProject) => {
    const project = projects.find(p => p._id === staleProject.projectId)
      || { _id: staleProject.projectId, projectName: staleProject.projectName }
    setFormOpen(true)
    await handleProjectSelect(project)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleStatusChange = (taskName, status) => {
    setTasks(prev => ({ ...prev, [taskName]: { status } }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showPopcard('Please select a project', false, 2000)

    const projectId = selectedProject._id
    setLoading(true)
    try {
      try {
        await axios.post('http://localhost:3000/task/create', { projectId }, { withCredentials: true })
      } catch (_) {}

      await Promise.all(
        TASKS.map(task => {
          const { status } = tasks[task]
          const date = (status === 'ongoing' || status === 'completed') ? new Date().toISOString() : null
          return axios.post('http://localhost:3000/task/update', { projectId, task, status, date }, { withCredentials: true })
        })
      )

      showPopcard('Task list saved!', true, 2000)
      setFormOpen(false)
      fetchStaleProjects()
    } catch (error) {
      console.error(error)
      showPopcard('Something went wrong.', false, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      <AnimatePresence>
        {popcard.visible && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            key={popcard.message}
            animate={{ opacity: 1, scaleY: 1, transformOrigin: 'top' }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            exit={{ opacity: 0, scaleY: 0 }}
            className='w-[80%] md:w-[40%] h-[10%] rounded-lg absolute z-20 top-0 left-0'
          >

            <div className='flex items-center justify-center text-4xl'></div>
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Task</h1>
              <h1 className='text-white'>List</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-full md:w-[70%] border-b-2 pb-[6%] border-white'>
                Manage and update project task statuses
              </h4>
            </div>
          </header>

          <section ref={formRef} className='w-full relative z-10 pb-10'>

            <h1 className='text-xl font-bold mt-[5%]'>Update Task List :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Select a project and set the status for each task in the workflow.</p>
                    <motion.div
                      layoutId='task-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-add-circle-fill'></i>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {isFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleSubmit}
                    className='px-3 py-4 space-y-5'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Project picker */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className='block text-black font-medium mb-2'>Project</label>
                      <ProjectDropdown
                        projects={projects}
                        selected={selectedProject}
                        onSelect={handleProjectSelect}
                        lastUpdated={lastUpdated}
                      />
                    </motion.div>

                    {/* Task rows */}
                    <motion.div layout className='space-y-4'>
                      {TASKS.map((task, i) => (
                        <motion.div
                          key={task}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ layout: { duration: 0.3, ease: 'easeInOut' }, delay: 0.45 + i * 0.05 }}
                          className='flex items-start gap-4'
                        >
                          <div className='w-[42%] shrink-0 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-2 mt-[2px]'>
                            <h3 className='font-semibold text-sm md:text-base'>{task}</h3>
                          </div>
                          <div className='flex-1'>
                            <TaskDropdown
                              taskName={task}
                              value={tasks[task].status}
                              onChange={handleStatusChange}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className='flex gap-4 pt-2'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <button
                        type='button'
                        onClick={() => setFormOpen(false)}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium transition-all duration-200'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='task-open-btn'
                        type='submit'
                        disabled={loading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium hover:bg-[#9d4bd1] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-save-line'></i><span>Save All</span></>
                        }
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* Stale projects section */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%] mb-3'>Projects Not Updated :</h1>

            {staleProjects.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>All projects are up to date.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {staleProjects.map((p, i) => (
                  <motion.div
                    key={p.projectId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    onClick={() => handleStaleProjectClick(p)}
                    className='flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 cursor-pointer hover:border-[#883bbc]'
                  >
                    <div className='flex items-center gap-2'>
                      <i className='ri-error-warning-line text-[#883bbc] text-lg'></i>
                      <span className='font-semibold text-base'>{p.projectName}</span>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs opacity-50 font-mono'>Last updated</p>
                      <p className='text-sm font-semibold text-[#883bbc]'>{formatDate(p.lastUpdated)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default Task
