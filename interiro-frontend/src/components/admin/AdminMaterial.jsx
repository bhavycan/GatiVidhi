import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const AdminMaterial = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setFormOpen] = useState(false)
  const [formLabel, setFormLabel] = useState('')
  const [formMaterial, setFormMaterial] = useState('')
  const [saving, setSaving] = useState(false)

  // inline edit state
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState('')
  const [editMaterial, setEditMaterial] = useState('')

  const fetchMaterials = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/material/all`, { withCredentials: true })
      setMaterials(data.materials || [])
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMaterials() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formLabel.trim() || !formMaterial.trim()) return showPopcard('Both fields are required.', false, 2000)
    setSaving(true)
    try {
      await axios.post(`${API_BASE}/material/create`, { label: formLabel.trim(), materialName: formMaterial.trim() }, { withCredentials: true })
      showPopcard('Material added!', true, 1500)
      setFormLabel('')
      setFormMaterial('')
      setFormOpen(false)
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (mat) => {
    setEditingId(mat._id)
    setEditLabel(mat.label)
    setEditMaterial(mat.materialName)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
    setEditMaterial('')
  }

  const handleUpdate = async (id) => {
    if (!editLabel.trim() || !editMaterial.trim()) return showPopcard('Both fields are required.', false, 2000)
    try {
      await axios.post(`${API_BASE}/material/update`, { id, label: editLabel.trim(), materialName: editMaterial.trim() }, { withCredentials: true })
      showPopcard('Updated!', true, 1500)
      cancelEdit()
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.post(`${API_BASE}/material/delete`, { id }, { withCredentials: true })
      showPopcard('Deleted.', true, 1500)
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  const handleToggleDefault = async (id) => {
    try {
      await axios.post(`${API_BASE}/material/set-default`, { id }, { withCredentials: true })
      fetchMaterials()
    } catch {
      showPopcard('Something went wrong.', false, 2000)
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
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-2'>
              <h1>Material</h1>
              <h1 className='text-white'>List</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-full md:w-[70%] border-b-2 pb-[6%] border-white'>
                Manage materials and vendors used across projects
              </h4>
            </div>
          </header>

          {/* Materials list */}
          <section className='w-full relative z-10 mt-[5%] space-y-3'>
            {loading ? (
              <div className='flex justify-center py-8'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : materials.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No materials yet. Add one below.</p>
              </div>
            ) : (
              <AnimatePresence>
                {materials.map((mat, i) => (
                  <motion.div
                    key={mat._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className='rounded-lg bg-gradient-to-br from-[#F7D6F3]/60 to-transparent border border-[#883bbc]/40 overflow-hidden'
                  >
                    {/* View row */}
                    {editingId !== mat._id ? (
                      <div className='px-4 py-3 flex items-center justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <p className='font-bold text-base truncate'>{mat.label}</p>
                            {mat.isDefault && (
                              <span className='text-xs font-semibold px-2 py-[1px] rounded-full border text-[#883bbc] bg-[#F7D6F3] border-[#883bbc]/40 shrink-0'>
                                default
                              </span>
                            )}
                          </div>
                          <p className='text-sm opacity-60 font-semibold truncate mt-0.5'>{mat.materialName}</p>
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <motion.button
                            onClick={() => handleToggleDefault(mat._id)}
                            whileTap={{ scale: 0.9 }}
                            title={mat.isDefault ? 'Remove default' : 'Set as default'}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm ${mat.isDefault ? 'bg-[#F7D6F3] border-[#883bbc] text-[#883bbc]' : 'bg-white/60 border-[#883bbc]/30 text-[#883bbc]/50'}`}
                          >
                            <i className='ri-star-fill'></i>
                          </motion.button>
                          <motion.button
                            onClick={() => openEdit(mat)}
                            whileTap={{ scale: 0.9 }}
                            className='w-8 h-8 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc]'
                          >
                            <i className='ri-edit-2-line text-sm'></i>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(mat._id)}
                            whileTap={{ scale: 0.9 }}
                            className='w-8 h-8 rounded-full bg-red-50 border border-red-300 flex items-center justify-center text-red-400'
                          >
                            <i className='ri-delete-bin-line text-sm'></i>
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      /* Inline edit row */
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='px-4 py-3 space-y-2'
                      >
                        <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                          <i className='ri-price-tag-3-line text-[#883bbc]'></i>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            placeholder='Label (e.g. Paint)'
                            className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                          />
                        </div>
                        <div className='w-full bg-white/40 border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                          <i className='ri-building-2-line text-[#883bbc]'></i>
                          <input
                            value={editMaterial}
                            onChange={e => setEditMaterial(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleUpdate(mat._id); if (e.key === 'Escape') cancelEdit() }}
                            placeholder='Material / Vendor name'
                            className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                          />
                        </div>
                        <div className='flex gap-2 pt-1'>
                          <button onClick={cancelEdit} className='flex-1 border border-[#883bbc] rounded-md py-2 text-sm font-medium bg-gradient-to-tl from-[#F7D6F3] to-transparent'>Cancel</button>
                          <motion.button
                            onClick={() => handleUpdate(mat._id)}
                            whileTap={{ scale: 0.97 }}
                            className='flex-1 bg-[#883bbc] text-white rounded-md py-2 text-sm font-medium flex items-center justify-center gap-1'
                          >
                            <i className='ri-save-line'></i> Save
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </section>

          {/* Add material */}
          <section className='w-full relative z-10 pb-16 mt-[5%]'>
            <h1 className='text-xl font-bold'>Add Material :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Add a new material label and vendor/product name.</p>
                    <motion.div
                      layoutId='material-open-btn'
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
                    onSubmit={handleCreate}
                    className='px-3 py-4 space-y-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Label</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-price-tag-3-line text-[#883bbc]'></i>
                        <input
                          type='text'
                          value={formLabel}
                          onChange={e => setFormLabel(e.target.value)}
                          placeholder='e.g. Paint, Ceiling, Lights'
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Material / Vendor Name</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-building-2-line text-[#883bbc]'></i>
                        <input
                          type='text'
                          value={formMaterial}
                          onChange={e => setFormMaterial(e.target.value)}
                          placeholder='e.g. ColorWave Paintworks'
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                        />
                      </div>
                    </motion.div>

                    <motion.div className='flex gap-4 pt-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.49 }}>
                      <button
                        type='button'
                        onClick={() => { setFormOpen(false); setFormLabel(''); setFormMaterial('') }}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >Cancel</button>
                      <motion.button
                        layoutId='material-open-btn'
                        type='submit'
                        disabled={saving}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      >
                        {saving ? <i className='ri-loader-4-line animate-spin text-xl'></i> : <><i className='ri-add-line'></i><span>Add Material</span></>}
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminMaterial
