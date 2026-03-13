import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import axios from 'axios'

const initialForm = { name: '', email: '', phone: '' }

const AdminClient = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(true)

  // Update state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [updateLoading, setUpdateLoading] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchClients = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/user/all', { withCredentials: true })
      setClients(data?.users || [])
    } catch {
      setClients([])
    } finally {
      setClientsLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('http://localhost:3000/admin/', { withCredentials: true })
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          navigate('/admin/login')
        }
      }
    }
    checkAuth()
    fetchClients()
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, phone } = form
    if (!name || !email || !phone) {
      return showPopcard('All fields are required.', false, 2500)
    }
    setLoading(true)
    try {
      await axios.post('http://localhost:3000/user/create', { name, email, phone }, { withCredentials: true })
      showPopcard('Client added!', true, 1500)
      setForm(initialForm)
      setFormOpen(false)
      setTimeout(() => navigate('/admin/project'), 1600)
    } catch (error) {
      const msg = error.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (client) => {
    setEditingId(client._id)
    setEditForm({ name: client.name, phone: client.phone })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', phone: '' })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await axios.post('http://localhost:3000/user/delete', { id: deleteTarget._id }, { withCredentials: true })
      showPopcard('Client deleted.', true, 2500)
      setDeleteTarget(null)
      fetchClients()
    } catch (error) {
      const msg = error.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleUpdate = async (e, clientId) => {
    e.preventDefault()
    if (!editForm.name || !editForm.phone) {
      return showPopcard('Name and phone are required.', false, 2500)
    }
    setUpdateLoading(true)
    try {
      await axios.post(
        'http://localhost:3000/user/update',
        { id: clientId, name: editForm.name, phone: editForm.phone },
        { withCredentials: true }
      )
      showPopcard('Client updated!', true, 2500)
      cancelEdit()
      fetchClients()
    } catch (error) {
      const msg = error.response?.data || 'Something went wrong.'
      showPopcard(typeof msg === 'string' ? msg : 'Something went wrong.', false, 2500)
    } finally {
      setUpdateLoading(false)
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
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Add</h1>
              <h1 className='text-white'>Client</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Create login credentials for a new client
              </h4>
            </div>
          </header>

          {/* Add Client Form */}
          <section className='w-full relative z-10 pb-10'>
            <h1 className='text-xl font-bold mt-[5%]'>New Client :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Fill in the client's details to create their account.</p>
                    <motion.div
                      layoutId='client-open-btn'
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
                  className='border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleSubmit}
                    className='px-3 py-4 space-y-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Full Name</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-user-line text-[#883bbc]'></i>
                        <input type='text' name='name' value={form.name} onChange={handleChange} placeholder='Client full name' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Email</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-mail-line text-[#883bbc]'></i>
                        <input type='email' name='email' value={form.email} onChange={handleChange} placeholder='client@email.com' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.49 }}>
                      <label className='block text-black font-medium mb-2'>Phone Number</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-phone-line text-[#883bbc]'></i>
                        <input type='tel' name='phone' value={form.phone} onChange={handleChange} placeholder='10-digit phone number' className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50' />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.56 }} className='flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc]/40'>
                      <i className='ri-mail-send-line text-[#883bbc]'></i>
                      <p className='text-sm font-semibold opacity-70'>Password will be auto-generated and emailed to the client.</p>
                    </motion.div>

                    <motion.div className='flex gap-4 pt-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
                      <button type='button' onClick={() => { setFormOpen(false); setForm(initialForm) }} className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'>Cancel</button>
                      <motion.button layoutId='client-open-btn' type='submit' disabled={loading} className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {loading ? <i className='ri-loader-4-line animate-spin text-xl'></i> : <><i className='ri-user-add-line'></i><span>Add Client</span></>}
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Existing Clients List */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%] mb-3'>Existing Clients :</h1>

            {clientsLoading ? (
              <div className='flex items-center justify-center h-16'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : clients.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No clients added yet.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                {clients.map((client, i) => (
                  <motion.div
                    key={client._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className='rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/40 overflow-hidden'
                  >
                    {/* Client Info Row */}
                    <div className='flex  items-center justify-between px-4 py-3'>
                      <div className='flex items-center  gap-3'>
                        <div className='w-9 h-9 rounded-full bg-[#883bbc] flex items-center  justify-center shrink-0'>
                          <i className='ri-user-line text-white text-base'></i>
                        </div>
                        <div>
                          <p className='font-semibold text-base leading-5'>{client.name}</p>
                          <p className='text-xs opacity-60 font-mono'>{client.email}</p>
                          <p className='text-sm font-semibold text-[#883bbc]'>{client.phone}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='text-right'>
                          
                          {client.isVerified && (
                            <p className='text-xs text-green-600 font-semibold'>
                              <i className='ri-shield-check-line'></i> Verified
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => editingId === client._id ? cancelEdit() : openEdit(client)}
                          className='w-8 h-8 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/40 flex items-center justify-center shrink-0'
                        >
                          <i className={`text-[#883bbc] text-sm ${editingId === client._id ? 'ri-close-line' : 'ri-edit-line'}`}></i>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(client)}
                          className='w-8 h-8 rounded-full bg-red-50 border border-red-300 flex items-center justify-center shrink-0'
                        >
                          <i className='ri-delete-bin-line text-red-500 text-sm'></i>
                        </button>
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    <AnimatePresence>
                      {editingId === client._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className='overflow-hidden border-t border-[#883bbc]/30'
                        >
                          <form onSubmit={(e) => handleUpdate(e, client._id)} className='px-4 py-3 space-y-3'>
                            <p className='text-xs font-bold opacity-50 uppercase tracking-wide'>Edit Client</p>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                              <i className='ri-user-line text-[#883bbc]'></i>
                              <input
                                type='text'
                                value={editForm.name}
                                onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                                placeholder='Full name'
                                className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                              />
                            </div>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                              <i className='ri-mail-line text-[#883bbc]/40'></i>
                              <span className='flex-1 font-semibold text-base opacity-40 select-none'>{client.email}</span>
                              <i className='ri-lock-line text-[#883bbc]/40 text-sm'></i>
                            </div>

                            <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                              <i className='ri-phone-line text-[#883bbc]'></i>
                              <input
                                type='tel'
                                value={editForm.phone}
                                onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                placeholder='Phone number'
                                className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                              />
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

      {/* Delete Confirmation Popup */}
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
              className='w-full max-w-sm bg rounded-2xl bg-[#F7D6F3]   shadow-2xl border border-[#883bbc] overflow-hidden'
            >
              <div className='px-6 py-5'>
                <div className='w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-4'>
                  <i className='ri-delete-bin-2-line text-white text-2xl'></i>
                </div>
                <h3 className='text-lg font-bold'>Delete Client?</h3>
                <p className='text-sm font-semibold opacity-60 mt-1'>
                  This will permanently delete <span className='text-black opacity-100'>{deleteTarget.name}</span> and all their related projects, updates, reports, tasks, and comments. This cannot be undone.
                </p>
              </div>
              <div className='flex border-t border-[#883bbc]'>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className='flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className='flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60'
                >
                  {deleteLoading
                    ? <i className='ri-loader-4-line animate-spin'></i>
                    : <><i className='ri-delete-bin-line'></i> Yes, Delete</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminClient
