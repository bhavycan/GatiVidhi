import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import CustomButtom from '../../templates/CustomButtom'
import Dropdown from '../../templates/Dropdown'
import { usePopcard } from '../../context/PopCardContext'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const AdminWorker = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)

  const [workers, setWorkers] = useState([])
  const [workersLoading, setWorkersLoading] = useState(true)

  const [projects, setProjects] = useState([])
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [assigning, setAssigning] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchWorkers = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/worker/all`, { withCredentials: true })
      setWorkers(data?.workers || [])
    } catch {
      setWorkers([])
    } finally {
      setWorkersLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/project/all`, { withCredentials: true })
      setProjects((data?.projects || []).filter(p => p.status === 'ongoing'))
    } catch {
      setProjects([])
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_BASE}/admin/`, { withCredentials: true })
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 400) navigate('/admin/login')
      }
    }
    checkAuth()
    fetchWorkers()
    fetchProjects()
  }, [])

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return showPopcard('Name and email are required.', false, 2500)
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/worker/create`, form, { withCredentials: true })
      showPopcard('Worker created!', true, 1500)
      setForm({ name: '', email: '' })
      setFormOpen(false)
      fetchWorkers()
    } catch (err) {
      const msg = err.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedWorker || !selectedProject) return showPopcard('Select both worker and project.', false, 2500)
    const project = projects.find(p => p.projectName === selectedProject)
    const worker = workers.find(w => w.name === selectedWorker)
    if (!project || !worker) return
    setAssigning(true)
    try {
      await axios.post(`${API_BASE}/worker/assign-project`, { workerId: worker._id, projectId: project._id }, { withCredentials: true })
      showPopcard('Project assigned!', true, 1500)
      setSelectedWorker(null)
      setSelectedProject(null)
      fetchWorkers()
    } catch (err) {
      const msg = err.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setAssigning(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await axios.post(`${API_BASE}/worker/delete`, { id: deleteTarget._id }, { withCredentials: true })
      showPopcard('Worker deleted.', true, 2500)
      setDeleteTarget(null)
      fetchWorkers()
    } catch (err) {
      const msg = err.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setDeleteLoading(false)
    }
  }

  const workerNames = workers.map(w => w.name)
  const projectNames = projects.map(p => p.projectName)

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
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Manage</h1>
              <h1 className='text-white'>Workers</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Create worker accounts and assign them to projects
              </h4>
            </div>
          </header>

          {/* ── Section 1: Create Worker ── */}
          <section className='w-full relative z-10 pb-6 mt-[5%]'>
            <h1 className='text-xl font-bold mb-3'>New Worker :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}>
                  <div className='px-3 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                    <p className='font-semibold opacity-70'>Fill in the worker's details to create their account.</p>
                    <motion.div
                      layoutId='worker-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-user-add-line'></i>
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
                  className='border border-[#883bbc] w-full backdrop-blur-sm rounded-lg'
                >
                  <motion.form onSubmit={handleSubmit} className='px-3 py-4 space-y-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Full Name</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-user-line text-[#883bbc]'></i>
                        <input type='text' name='name' value={form.name} onChange={handleChange} placeholder='Worker full name' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Email</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-mail-line text-[#883bbc]'></i>
                        <input type='email' name='email' value={form.email} onChange={handleChange} placeholder='worker@email.com' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.49 }} className='flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc]/40'>
                      <i className='ri-mail-send-line text-[#883bbc]'></i>
                      <p className='text-sm font-semibold opacity-70'>Password will be auto-generated and emailed to the worker.</p>
                    </motion.div>

                    <motion.div className='flex gap-4 pt-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
                      <button type='button' onClick={() => { setFormOpen(false); setForm({ name: '', email: '' }) }} className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'>Cancel</button>
                      <motion.button layoutId='worker-open-btn' type='submit' disabled={loading} className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60' whileTap={{ scale: 0.98 }}>
                        {loading ? <i className='ri-loader-4-line animate-spin text-xl'></i> : <><i className='ri-user-add-line'></i><span>Add Worker</span></>}
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Section 2: Assign Project ── */}
          <section className='w-full relative z-10 pb-6'>
            <h1 className='text-xl font-bold mb-1'>Assign Project :</h1>
            <p className='text-sm font-semibold opacity-60 mb-3'>Assign an ongoing project to a worker</p>

            <div className='border border-[#883bbc] rounded-lg px-3 py-4 backdrop-blur-sm bg-gradient-to-br from-[#F7D6F3]/30 to-transparent space-y-1'>
              <label className='block font-medium text-sm mb-1'>Select Worker</label>
              <Dropdown
                option={workerNames}
                placeholder='Choose a worker'
                onSelect={(name) => setSelectedWorker(name)}
              />

              <div className='pt-3'>
                <label className='block font-medium text-sm mb-1'>Select Project</label>
                <Dropdown
                  option={projectNames}
                  placeholder='Choose an ongoing project'
                  onSelect={(name) => setSelectedProject(name)}
                />
              </div>

              <div className='pt-4'>
                <motion.button
                  onClick={handleAssign}
                  disabled={assigning || !selectedWorker || !selectedProject}
                  whileTap={{ scale: 0.97 }}
                  className='w-full py-3 rounded-lg bg-[#883bbc] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50'
                >
                  {assigning
                    ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                    : <><i className='ri-links-line'></i><span>Assign Project</span></>}
                </motion.button>
              </div>
            </div>
          </section>

          {/* ── Section 3: Workers List ── */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%] mb-3'>Existing Workers :</h1>

            {workersLoading ? (
              <div className='flex items-center justify-center h-16'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : workers.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No workers added yet.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {workers.map((worker, i) => (
                  <motion.div
                    key={worker._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className='rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 px-4 py-3 flex items-center justify-between'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                        <i className='ri-hard-hat-line text-white text-base'></i>
                      </div>
                      <div>
                        <p className='font-semibold text-base leading-5'>{worker.name}</p>
                        <p className='text-xs opacity-60 font-mono'>{worker.email}</p>
                        {worker.assignedProjectId ? (
                          <p className='text-xs text-[#883bbc] font-semibold mt-0.5'>
                            <i className='ri-folder-line mr-1'></i>{worker.assignedProjectId.projectName}
                          </p>
                        ) : (
                          <p className='text-xs opacity-40 font-semibold mt-0.5'>No project assigned</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(worker)}
                      className='w-8 h-8 rounded-full bg-red-50 border border-red-300 flex items-center justify-center shrink-0'
                    >
                      <i className='ri-delete-bin-line text-red-500 text-sm'></i>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

        </div>
      </main>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6'
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              onClick={e => e.stopPropagation()}
              className='w-full max-w-sm rounded-2xl bg-[#F7D6F3] shadow-2xl border border-[#883bbc] overflow-hidden'
            >
              <div className='px-6 py-5'>
                <div className='w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-4'>
                  <i className='ri-delete-bin-2-line text-white text-2xl'></i>
                </div>
                <h3 className='text-lg font-bold'>Delete Worker?</h3>
                <p className='text-sm font-semibold opacity-60 mt-1'>
                  This will permanently delete <span className='text-black opacity-100'>{deleteTarget.name}</span>. This cannot be undone.
                </p>
              </div>
              <div className='flex border-t border-[#883bbc]'>
                <button onClick={() => setDeleteTarget(null)} className='flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors'>Cancel</button>
                <button onClick={handleDelete} disabled={deleteLoading} className='flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60'>
                  {deleteLoading ? <i className='ri-loader-4-line animate-spin'></i> : <><i className='ri-delete-bin-line'></i> Yes, Delete</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminWorker
