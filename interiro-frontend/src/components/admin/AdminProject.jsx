import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import axios from 'axios'

const initialForm = { projectName: '', description: '', estimatedEndDate: '' }
const STATUS_OPTIONS = ['ongoing', 'completed', 'cancelled']

const statusColor = {
  ongoing: 'text-yellow-700',
  completed: 'text-green-700',
  cancelled: 'text-red-600',
}

const ClientDropdown = ({ clients, selected, onSelect }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <div className='flex items-center gap-2'>
          <i className='ri-user-line text-[#883bbc]'></i>
          <span className={selected ? '' : 'opacity-50'}>{selected ? selected.name : 'Select a client'}</span>
        </div>
        <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className='ri-arrow-down-s-line shrink-0' />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-2xl border border-t-0 border-[#883bbc] bg-white/60'
          >
            {clients.length === 0 && <p className='px-4 py-2 text-sm opacity-60 font-semibold'>No clients found</p>}
            {clients.map((client, i) => (
              <motion.div
                key={client._id}
                onClick={() => { onSelect(client); setOpen(false) }}
                className='w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 flex items-center gap-3'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <div className='w-7 h-7 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                  <i className='ri-user-line text-white text-xs'></i>
                </div>
                <div>
                  <p className='font-semibold text-sm leading-4'>{client.name}</p>
                  <p className='text-xs opacity-50 font-mono'>{client.email}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-1 pl-2'>
          <p className='text-xs font-mono opacity-50'>{selected.email} · {selected.phone}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

const StatusDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span className={`capitalize ${statusColor[value] || 'opacity-60'}`}>{value}</span>
        <motion.i animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className='ri-arrow-down-s-line shrink-0' />
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60'
          >
            {STATUS_OPTIONS.map((s, i) => (
              <motion.div
                key={s}
                onClick={() => { onChange(s); setOpen(false) }}
                className={`w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 font-semibold text-sm capitalize ${statusColor[s]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                {s}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const AdminProject = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Update state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ projectName: '', description: '', estimatedEndDate: '', status: '' })
  const [updateLoading, setUpdateLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [{ data: userData }, { data: projectData }] = await Promise.all([
        axios.get('http://localhost:3000/user/all', { withCredentials: true }),
        axios.get('http://localhost:3000/project/all', { withCredentials: true }),
      ])
      setClients(userData?.users || [])
      setProjects(projectData?.projects || [])
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        navigate('/admin/login')
      }
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { projectName, description, estimatedEndDate } = form
    if (!projectName || !description || !estimatedEndDate || !selectedClient) {
      return showPopcard('All fields are required.', false, 2500)
    }
    setLoading(true)
    try {
      await axios.post(
        'http://localhost:3000/project/create',
        { projectName, description, clientEmail: selectedClient.email, estimatedEndDate },
        { withCredentials: true }
      )
      showPopcard('Project created!', true, 1500)
      setForm(initialForm)
      setSelectedClient(null)
      setFormOpen(false)
      setTimeout(() => navigate('/admin/task'), 1600)
    } catch (error) {
      const msg = error.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (project) => {
    setEditingId(project._id)
    setEditForm({
      projectName: project.projectName,
      description: project.description || '',
      estimatedEndDate: project.estimatedEndDate ? project.estimatedEndDate.split('T')[0] : '',
      status: project.status || 'ongoing',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ projectName: '', description: '', estimatedEndDate: '', status: '' })
  }

  const handleUpdate = async (e, projectId) => {
    e.preventDefault()
    if (!editForm.projectName || !editForm.description || !editForm.estimatedEndDate) {
      return showPopcard('All fields are required.', false, 2500)
    }
    setUpdateLoading(true)
    try {
      await axios.post(
        'http://localhost:3000/project/update',
        { id: projectId, ...editForm },
        { withCredentials: true }
      )
      showPopcard('Project updated!', true, 2500)
      cancelEdit()
      fetchData()
    } catch (error) {
      const msg = error.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setUpdateLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>New</h1>
              <h1 className='text-white'>Project</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Create and assign a project to a client
              </h4>
            </div>
          </header>

          {/* Create Project Form */}
          <section className='w-full relative z-10 pb-10'>
            <h1 className='text-xl font-bold mt-[5%]'>Create Project :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Fill in the project details and assign it to a client.</p>
                    <motion.div
                      layoutId='project-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-folder-add-line'></i>
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
                  <motion.form onSubmit={handleSubmit} className='px-3 py-4 space-y-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Project Name</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-folder-line text-[#883bbc]'></i>
                        <input type='text' name='projectName' value={form.projectName} onChange={handleChange} placeholder='e.g. Malabar Exotica' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Assign Client</label>
                      <ClientDropdown clients={clients} selected={selectedClient} onSelect={setSelectedClient} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.49 }}>
                      <label className='block text-black font-medium mb-2'>Description</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-2xl px-4 py-3'>
                        <textarea name='description' value={form.description} onChange={handleChange} placeholder='Brief description of the project scope...' rows={3} className='w-full bg-transparent outline-none font-semibold text-base placeholder:opacity-50 resize-none' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.56 }}>
                      <label className='block text-black font-medium mb-2'>Estimated End Date</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-calendar-2-line text-[#883bbc]'></i>
                        <input type='date' name='estimatedEndDate' value={form.estimatedEndDate} onChange={handleChange} className='flex-1 bg-transparent outline-none font-semibold text-base' />
                      </div>
                    </motion.div>

                    <motion.div className='flex gap-4 pt-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                      <button type='button' onClick={() => { setFormOpen(false); setForm(initialForm); setSelectedClient(null) }} className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'>Cancel</button>
                      <motion.button layoutId='project-open-btn' type='submit' disabled={loading} className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {loading ? <i className='ri-loader-4-line animate-spin text-xl'></i> : <><i className='ri-folder-add-line'></i><span>Create Project</span></>}
                      </motion.button>
                    </motion.div>

                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* All Projects List */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%] mb-3'>All Projects :</h1>

            {dataLoading ? (
              <div className='flex items-center justify-center h-16'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : projects.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No projects created yet.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {projects.map((project, i) => (
                  <motion.div
                    key={project._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className='rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 overflow-hidden'
                  >
                    {/* Project Info Row */}
                    <div className='px-4 py-3'>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                            <i className='ri-folder-line text-white text-base'></i>
                          </div>
                          <div>
                            <p className='font-semibold text-base leading-5'>{project.projectName}</p>
                            <p className='text-xs opacity-60 leading-4 mt-[2px]'>
                              {project.description?.length > 50 ? project.description.slice(0, 50) + '...' : project.description}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <span className={`text-xs font-bold capitalize ${statusColor[project.status] || 'opacity-60'}`}>{project.status}</span>
                          <button
                            onClick={() => editingId === project._id ? cancelEdit() : openEdit(project)}
                            className='w-8 h-8 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/40 flex items-center justify-center'
                          >
                            <i className={`text-[#883bbc] text-sm ${editingId === project._id ? 'ri-close-line' : 'ri-edit-line'}`}></i>
                          </button>
                        </div>
                      </div>

                      <div className='flex items-center justify-between mt-2 pt-2 border-t border-[#883bbc]/20'>
                        <div className='flex items-center gap-1 text-xs opacity-60 font-semibold'>
                          <i className='ri-calendar-line text-[#883bbc]'></i>
                          <span>Start: {formatDate(project.startDate)}</span>
                        </div>
                        <div className='flex items-center gap-1 text-xs opacity-60 font-semibold'>
                          <i className='ri-calendar-check-line text-[#883bbc]'></i>
                          <span>Est. End: {formatDate(project.estimatedEndDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    <AnimatePresence>
                      {editingId === project._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className='overflow-hidden border-t border-[#883bbc]/30'
                        >
                          <form onSubmit={(e) => handleUpdate(e, project._id)} className='px-4 py-3 space-y-3'>
                            <p className='text-xs font-bold opacity-50 uppercase tracking-wide'>Edit Project</p>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                              <i className='ri-folder-line text-[#883bbc]'></i>
                              <input
                                type='text'
                                value={editForm.projectName}
                                onChange={(e) => setEditForm(p => ({ ...p, projectName: e.target.value }))}
                                placeholder='Project name'
                                className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                              />
                            </div>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-2xl px-4 py-3'>
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                                placeholder='Description'
                                rows={2}
                                className='w-full bg-transparent outline-none font-semibold text-base placeholder:opacity-50 resize-none'
                              />
                            </div>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                              <i className='ri-calendar-2-line text-[#883bbc]'></i>
                              <input
                                type='date'
                                value={editForm.estimatedEndDate}
                                onChange={(e) => setEditForm(p => ({ ...p, estimatedEndDate: e.target.value }))}
                                className='flex-1 bg-transparent outline-none font-semibold text-base'
                              />
                            </div>

                            <div>
                              <label className='block text-black font-medium mb-1 text-sm'>Status</label>
                              <StatusDropdown value={editForm.status} onChange={(s) => setEditForm(p => ({ ...p, status: s }))} />
                            </div>

                            <div className='flex gap-3 pt-1'>
                              <button type='button' onClick={cancelEdit} className='flex-1 bg-white/40 border border-[#883bbc] rounded-md px-3 py-2 font-medium text-sm'>Cancel</button>
                              <motion.button
                                type='submit'
                                disabled={updateLoading}
                                className='flex-1 bg-[#883bbc] text-white rounded-md px-3 py-2 font-medium text-sm flex items-center justify-center gap-1 disabled:opacity-60'
                                whileTap={{ scale: 0.97 }}
                              >
                                {updateLoading ? <i className='ri-loader-4-line animate-spin'></i> : <><i className='ri-save-line'></i><span>Save</span></>}
                              </motion.button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

export default AdminProject
