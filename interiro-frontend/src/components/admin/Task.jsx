import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'

const STATUS_OPTIONS = ['not started', 'ongoing', 'completed']

const TYPE_OPTIONS_FILTER = ['home', 'office', 'modular kitchen', 'renovation', 'furniture', 'small']

const TemplatePickerPanel = ({ templates, onSelect, onClose }) => {
  const [filter, setFilter] = useState('')
  const filtered = filter ? templates.filter(t => t.type === filter) : templates

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className='w-full max-w-md max-h-[75vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-[#883bbc]/20 bg-gradient-to-r from-[#F7D6F3] to-transparent'>
          <h2 className='font-bold text-lg'>Load from Template</h2>
          <motion.button type='button' onClick={onClose} whileTap={{ scale: 0.9 }} className='w-8 h-8 rounded-full bg-white/60 flex items-center justify-center'>
            <i className='ri-close-line text-lg'></i>
          </motion.button>
        </div>

        {/* Type filter */}
        <div className='flex gap-2 px-4 py-2 overflow-x-auto border-b border-[#883bbc]/10'>
          <button
            type='button'
            onClick={() => setFilter('')}
            className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${!filter ? 'bg-[#883bbc] text-white border-[#883bbc]' : 'border-[#883bbc]/40 text-[#883bbc]'}`}
          >
            All
          </button>
          {TYPE_OPTIONS_FILTER.map(t => (
            <button
              key={t}
              type='button'
              onClick={() => setFilter(filter === t ? '' : t)}
              className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full border capitalize transition-colors ${filter === t ? 'bg-[#883bbc] text-white border-[#883bbc]' : 'border-[#883bbc]/40 text-[#883bbc]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Template list */}
        <div className='flex-1 overflow-y-auto px-4 py-3 space-y-2'>
          {filtered.length === 0 && (
            <p className='text-center text-sm opacity-50 py-4'>No templates found.</p>
          )}
          {filtered.map((template) => (
            <motion.div
              key={template._id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(template)}
              className='w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[#883bbc]/30 bg-gradient-to-br from-[#F7D6F3]/40 to-transparent cursor-pointer hover:border-[#883bbc]'
            >
              <div>
                <p className='font-bold text-base'>{template.name}</p>
                <p className='text-xs opacity-50 capitalize mt-[1px]'>{template.type} · {template.tasks.length} tasks</p>
              </div>
              <i className='ri-arrow-right-s-line text-[#883bbc] text-xl'></i>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

const colorMap = {
  'not started': 'opacity-60',
  'ongoing': 'text-yellow-700',
  'completed': 'text-green-700',
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TaskDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span className={colorMap[value]}>{value}</span>
        <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className='ri-arrow-down-s-line' />
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
                onClick={() => { onChange(s); setOpen(false) }}
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

const ProjectDropdown = ({ projects, selected, onSelect, lastUpdated }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span>{selected ? selected.projectName : 'Select a project'}</span>
        <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className='ri-arrow-down-s-line' />
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
                onClick={() => { onSelect(p); setOpen(false) }}
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

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-1 pl-2 space-y-[2px]'>
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
  const [tasks, setTasks] = useState([])        // [{ name, status }]
  const [newTaskName, setNewTaskName] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [staleProjects, setStaleProjects] = useState([])
  const [templates, setTemplates] = useState([])
  const [isTemplateOpen, setTemplateOpen] = useState(false)
  const [editingIdx, setEditingIdx] = useState(-1)
  const [editingName, setEditingName] = useState('')

  // Update section state
  const [isUpdateOpen, setUpdateOpen] = useState(false)
  const [updateProject, setUpdateProject] = useState(null)
  const [updateTasks, setUpdateTasks] = useState([])
  const [updateLastUpdated, setUpdateLastUpdated] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchStaleProjects = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/task/stale', { withCredentials: true })
      setStaleProjects(data)
    } catch (error) {
      console.error('Failed to fetch stale projects', error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/template/all', { withCredentials: true })
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates', error)
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
    fetchTemplates()
  }, [])

  const handleProjectSelect = async (project) => {
    setSelectedProject(project)
    try {
      const { data } = await axios.get(`http://localhost:3000/task/${project._id}`, { withCredentials: true })
      setTasks(data.tasks?.map(t => ({ name: t.name, status: t.status || 'not started' })) || [])
      setLastUpdated(data.lastUpdated || null)
    } catch (_) {
      setTasks([])
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

  const handleAddTask = () => {
    const trimmed = newTaskName.trim()
    if (!trimmed) return
    if (tasks.find(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      return showPopcard('Task already exists.', false, 1500)
    }
    setTasks(prev => [...prev, { name: trimmed, status: 'not started' }])
    setNewTaskName('')
  }

  const handleRemoveTask = (name) => {
    setTasks(prev => prev.filter(t => t.name !== name))
  }

  const handleMoveUp = (i) => {
    if (i === 0) return
    setTasks(prev => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  const handleMoveDown = (i) => {
    setTasks(prev => {
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  const handleRenameCommit = (i) => {
    const trimmed = editingName.trim()
    if (!trimmed) { setEditingIdx(-1); return }
    if (tasks.some((t, idx) => idx !== i && t.name.toLowerCase() === trimmed.toLowerCase())) {
      showPopcard('Task name already exists.', false, 1500)
      return
    }
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, name: trimmed } : t))
    setEditingIdx(-1)
  }

  const handleUpdateProjectSelect = async (project) => {
    setUpdateProject(project)
    try {
      const { data } = await axios.get(`http://localhost:3000/task/${project._id}`, { withCredentials: true })
      setUpdateTasks(data.tasks?.map(t => ({ name: t.name, status: t.status || 'not started' })) || [])
      setUpdateLastUpdated(data.lastUpdated || null)
    } catch (_) {
      setUpdateTasks([])
      setUpdateLastUpdated(null)
    }
  }

  const handleUpdateStatusChange = (name, status) => {
    setUpdateTasks(prev => prev.map(t => t.name === name ? { ...t, status } : t))
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    if (!updateProject) return showPopcard('Please select a project', false, 2000)
    if (updateTasks.length === 0) return showPopcard('No tasks to update.', false, 2000)

    setUpdateLoading(true)
    try {
      await axios.post(
        'http://localhost:3000/task/update',
        { projectId: updateProject._id, tasks: updateTasks },
        { withCredentials: true }
      )
      showPopcard('Task statuses updated!', true, 2000)
      setUpdateLastUpdated(new Date().toISOString())
      fetchStaleProjects()
    } catch (error) {
      console.error(error)
      showPopcard('Something went wrong.', false, 2000)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) return showPopcard('Please select a project', false, 2000)
    if (tasks.length === 0) return showPopcard('Add at least one task.', false, 2000)

    const projectId = selectedProject._id
    setLoading(true)
    try {
      await axios.post(
        'http://localhost:3000/task/update',
        { projectId, tasks },
        { withCredentials: true }
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
                Build and manage custom task lists per project
              </h4>
            </div>
          </header>

          <section ref={formRef} className='w-full relative z-10 pb-10'>
            <h1 className='text-xl font-bold mt-[5%]'>Task List :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Select a project, create custom tasks, and set their status.</p>
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
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <label className='block text-black font-medium mb-2'>Project</label>
                      <ProjectDropdown
                        projects={projects}
                        selected={selectedProject}
                        onSelect={handleProjectSelect}
                        lastUpdated={lastUpdated}
                      />
                    </motion.div>

                    {/* Add task input */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                      <label className='block text-black font-medium mb-2'>Add Task</label>
                      <div className='flex gap-2'>
                        <div className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                          <i className='ri-list-check text-[#883bbc]'></i>
                          <input
                            type='text'
                            value={newTaskName}
                            onChange={(e) => setNewTaskName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask() } }}
                            placeholder='e.g. Flooring, Plumbing...'
                            className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                          />
                        </div>
                        <motion.button
                          type='button'
                          onClick={handleAddTask}
                          className='w-10 h-10 bg-[#883bbc] rounded-full flex items-center justify-center text-white shrink-0'
                          whileTap={{ scale: 0.9 }}
                        >
                          <i className='ri-add-line text-xl'></i>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Load from Template button */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                      <motion.button
                        type='button'
                        onClick={() => setTemplateOpen(true)}
                        className='w-full flex items-center justify-center gap-2 border border-dashed border-[#883bbc] rounded-lg py-2 text-[#883bbc] font-semibold text-sm hover:bg-[#F7D6F3]/30'
                        whileTap={{ scale: 0.98 }}
                      >
                        <i className='ri-layout-3-line'></i>
                        Load from Template
                      </motion.button>
                    </motion.div>

                    {/* Task rows */}
                    <motion.div layout className='space-y-3'>
                      <AnimatePresence>
                        {tasks.length === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className='text-sm font-semibold text-center py-2'
                          >
                            No tasks yet — add one above.
                          </motion.p>
                        )}
                        {tasks.map((task, i) => (
                          <motion.div
                            key={task.name + i}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            transition={{ layout: { duration: 0.25, ease: 'easeInOut' }, delay: i * 0.03 }}
                            className='flex items-center flex-col  gap-2'
                          >

                            <div className='w-full h-full  flex items-center justify-center gap-2'>
                            {/* Index badge */}
                            <span className='w-6 h-6 shrink-0 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center text-xs font-bold text-[#883bbc]'>
                              {i + 1}
                            </span>

                            {/* Name / inline edit */}
                            {editingIdx === i ? (
                              <input
                                autoFocus
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { e.preventDefault(); handleRenameCommit(i) }
                                  if (e.key === 'Escape') setEditingIdx(-1)
                                }}
                                onBlur={() => handleRenameCommit(i)}
                                className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-[6px] font-semibold text-sm outline-none'
                              />
                            ) : (
                              <div className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-[6px]'>
                                <p className='font-semibold text-sm truncate'>{task.name}</p>
                              </div>
                            )}
</div>



                            <div className='w-[80%] ml-[2%] h-full  flex items-center  gap-2'>
                            {/* Move up */}
                            <motion.button
                              type='button'
                              onClick={() => handleMoveUp(i)}
                              disabled={i === 0}
                              className='w-8 h-8 shrink-0 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] disabled:opacity-20'
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className='ri-arrow-up-s-line text-base'></i>
                            </motion.button>

                            {/* Move down */}
                            <motion.button
                              type='button'
                              onClick={() => handleMoveDown(i)}
                              disabled={i === tasks.length - 1}
                              className='w-8 h-8 shrink-0 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] disabled:opacity-20'
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className='ri-arrow-down-s-line text-base'></i>
                            </motion.button>

                            {/* Edit / Confirm */}
                            <motion.button
                              type='button'
                              onClick={() => {
                                if (editingIdx === i) { handleRenameCommit(i) }
                                else { setEditingIdx(i); setEditingName(task.name) }
                              }}
                              className='w-8 h-8 shrink-0 rounded-full bg-[#F7D6F3] border border-[#883bbc]/40 flex items-center justify-center text-[#883bbc]'
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className={editingIdx === i ? 'ri-check-line text-sm' : 'ri-edit-2-line text-sm'}></i>
                            </motion.button>

                            {/* Delete */}
                            <motion.button
                              type='button'
                              onClick={() => { if (editingIdx === i) setEditingIdx(-1); handleRemoveTask(task.name) }}
                              className='w-8 h-8 shrink-0 rounded-full bg-red-50 border border-red-300 flex items-center justify-center text-red-400'
                              whileTap={{ scale: 0.9 }}
                            >
                              <i className='ri-delete-bin-line text-sm'></i>
                            </motion.button>

                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className='flex gap-4 pt-2'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type='button'
                        onClick={() => { setFormOpen(false); setTasks([]); setSelectedProject(null) }}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='task-open-btn'
                        type='submit'
                        disabled={loading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
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

          {/* Update Task Status */}
          <section className='w-full relative z-10 pb-10'>
            <h1 className='text-xl font-bold mt-[2%]'>Update Task Status :</h1>

            <AnimatePresence mode='wait'>
              {!isUpdateOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Select a project to update individual task statuses.</p>
                    <motion.div
                      layoutId='update-open-btn'
                      onClick={() => setUpdateOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-edit-2-line'></i>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {isUpdateOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleUpdateSubmit}
                    className='px-3 py-4 space-y-5'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Project picker */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <label className='block text-black font-medium mb-2'>Project</label>
                      <ProjectDropdown
                        projects={projects}
                        selected={updateProject}
                        onSelect={handleUpdateProjectSelect}
                        lastUpdated={updateLastUpdated}
                      />
                    </motion.div>

                    {/* Task rows with status dropdowns */}
                    <motion.div layout className='space-y-3'>
                      <AnimatePresence>
                        {updateTasks.length === 0 && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className='text-sm font-semibold text-center py-2'
                          >
                            {updateProject ? 'No tasks found for this project.' : 'Select a project to load tasks.'}
                          </motion.p>
                        )}
                        {updateTasks.map((task, i) => (
                          <motion.div
                            key={task.name}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            transition={{ layout: { duration: 0.3, ease: 'easeInOut' }, delay: i * 0.04 }}
                            className='flex items-start gap-2'
                          >
                            <div className='w-[38%] shrink-0 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-2 mt-[2px]'>
                              <h3 className='font-semibold text-sm md:text-base truncate'>{task.name}</h3>
                            </div>
                            <div className='flex-1'>
                              <TaskDropdown
                                value={task.status}
                                onChange={(status) => handleUpdateStatusChange(task.name, status)}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className='flex gap-4 pt-2'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type='button'
                        onClick={() => { setUpdateOpen(false); setUpdateTasks([]); setUpdateProject(null) }}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='update-open-btn'
                        type='submit'
                        disabled={updateLoading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {updateLoading
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-save-line'></i><span>Update</span></>
                        }
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Stale projects */}
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

      <AnimatePresence>
        {isTemplateOpen && (
          <TemplatePickerPanel
            templates={templates}
            onSelect={(template) => {
              setTasks(template.tasks.map(t => ({ name: t.name, status: 'not started' })))
              setTemplateOpen(false)
              showPopcard('Template loaded!', true, 1500)
            }}
            onClose={() => setTemplateOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Task
