import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import AdminNavbar from '../../templates/AdminNavbar'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const TYPE_OPTIONS = ['home', 'office', 'modular kitchen', 'renovation', 'furniture', 'small']

const typeColorMap = {
  home: 'text-purple-700 bg-purple-100 border-purple-300',
  office: 'text-blue-700 bg-blue-100 border-blue-300',
  'modular kitchen': 'text-orange-700 bg-orange-100 border-orange-300',
  renovation: 'text-yellow-700 bg-yellow-100 border-yellow-300',
  furniture: 'text-green-700 bg-green-100 border-green-300',
  small: 'text-pink-700 bg-pink-100 border-pink-300',
}

const TypeDropdown = ({ value, onChange, placeholder = 'Select type' }) => {
  const [open, setOpen] = useState(false)
  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <span className={value ? '' : 'opacity-50'}>{value || placeholder}</span>
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
            {TYPE_OPTIONS.map((t, i) => (
              <motion.div
                key={t}
                onClick={() => { onChange(t); setOpen(false) }}
                className='w-full text-base font-semibold px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 capitalize'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <i className='ri-arrow-right-s-line'></i>{t}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TemplateCard = ({ template, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className='w-full border border-[#883bbc]/40 rounded-lg bg-gradient-to-br from-[#F7D6F3]/60 to-transparent backdrop-blur-sm overflow-hidden'
    >
      <div
        className='w-full px-4 py-3 flex items-center justify-between cursor-pointer'
        onClick={() => setExpanded(!expanded)}
      >
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <div className='flex flex-col flex-1 min-w-0'>
            <h3 className='font-bold text-base truncate'>{template.name}</h3>
            <div className='flex items-center gap-2 mt-1'>
              <span className={`text-xs font-semibold px-2 py-[1px] rounded-full border capitalize ${typeColorMap[template.type] || 'text-gray-600 bg-gray-100 border-gray-300'}`}>
                {template.type}
              </span>
              <span className='text-xs opacity-50 font-mono'>{template.tasks.length} tasks</span>
              {template.isDefault && (
                <span className='text-xs font-semibold px-2 py-[1px] rounded-full border text-[#883bbc] bg-[#F7D6F3] border-[#883bbc]/40'>
                  default
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2 ml-2 shrink-0'>
          {!template.isDefault && (
            <>
              <motion.button
                type='button'
                onClick={(e) => { e.stopPropagation(); onEdit(template) }}
                className='w-8 h-8 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc]'
                whileTap={{ scale: 0.9 }}
              >
                <i className='ri-edit-2-line text-sm'></i>
              </motion.button>
              <motion.button
                type='button'
                onClick={(e) => { e.stopPropagation(); onDelete(template._id) }}
                className='w-8 h-8 rounded-full bg-red-50 border border-red-300 flex items-center justify-center text-red-400'
                whileTap={{ scale: 0.9 }}
              >
                <i className='ri-delete-bin-line text-sm'></i>
              </motion.button>
            </>
          )}
          <motion.i
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className='ri-arrow-down-s-line text-lg opacity-60'
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='overflow-hidden border-t border-[#883bbc]/20'
          >
            <div className='px-4 py-3 space-y-1'>
              {template.tasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className='flex items-center gap-2 text-sm font-medium'
                >
                  <span className='w-5 h-5 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center text-xs text-[#883bbc] shrink-0'>{i + 1}</span>
                  <span>{task.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const AdminTemplates = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [templates, setTemplates] = useState([])
  const [filterType, setFilterType] = useState('')
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  // Create/Edit form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('')
  const [formTasks, setFormTasks] = useState([])
  const [newTaskInput, setNewTaskInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingFormIdx, setEditingFormIdx] = useState(-1)
  const [editingFormName, setEditingFormName] = useState('')

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/template/all`, { withCredentials: true })
      setTemplates(data.templates || [])
    } catch (error) {
      console.error(error)
      if (error.response?.status === 401 || error.response?.status === 400) navigate('/admin/login')
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const openCreate = () => {
    setEditingTemplate(null)
    setFormName('')
    setFormType('')
    setFormTasks([])
    setNewTaskInput('')
    setCreateOpen(true)
  }

  const openEdit = (template) => {
    setEditingTemplate(template)
    setFormName(template.name)
    setFormType(template.type)
    setFormTasks(template.tasks.map(t => t.name))
    setNewTaskInput('')
    setCreateOpen(true)
  }

  const closeForm = () => {
    setCreateOpen(false)
    setEditingTemplate(null)
    setFormName('')
    setFormType('')
    setFormTasks([])
    setNewTaskInput('')
    setEditingFormIdx(-1)
  }

  const handleAddFormTask = () => {
    const trimmed = newTaskInput.trim()
    if (!trimmed) return
    if (formTasks.includes(trimmed)) return showPopcard('Task already added.', false, 1500)
    setFormTasks(prev => [...prev, trimmed])
    setNewTaskInput('')
  }

  const handleRemoveFormTask = (index) => {
    setFormTasks(prev => prev.filter((_, i) => i !== index))
  }

  const handleFormMoveUp = (i) => {
    if (i === 0) return
    setFormTasks(prev => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  const handleFormMoveDown = (i) => {
    setFormTasks(prev => {
      if (i === prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  const handleFormRenameCommit = (i) => {
    const trimmed = editingFormName.trim()
    if (!trimmed) { setEditingFormIdx(-1); return }
    if (formTasks.some((t, idx) => idx !== i && t.toLowerCase() === trimmed.toLowerCase())) {
      showPopcard('Task name already exists.', false, 1500)
      return
    }
    setFormTasks(prev => prev.map((t, idx) => idx === i ? trimmed : t))
    setEditingFormIdx(-1)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formName.trim()) return showPopcard('Template name is required.', false, 1500)
    if (!formType) return showPopcard('Please select a type.', false, 1500)
    if (formTasks.length === 0) return showPopcard('Add at least one task.', false, 1500)

    setSaving(true)
    try {
      if (editingTemplate) {
        await axios.post(`${API_BASE}/template/update`, {
          id: editingTemplate._id,
          name: formName.trim(),
          type: formType,
          tasks: formTasks.map(n => ({ name: n })),
        }, { withCredentials: true })
        showPopcard('Template updated!', true, 2000)
      } else {
        await axios.post(`${API_BASE}/template/create`, {
          name: formName.trim(),
          type: formType,
          tasks: formTasks.map(n => ({ name: n })),
        }, { withCredentials: true })
        showPopcard('Template created!', true, 2000)
      }
      closeForm()
      fetchTemplates()
    } catch (error) {
      console.error(error)
      showPopcard('Something went wrong.', false, 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.post(`${API_BASE}/template/delete`, { id }, { withCredentials: true })
      showPopcard('Template deleted.', true, 2000)
      fetchTemplates()
    } catch (error) {
      console.error(error)
      showPopcard('Something went wrong.', false, 2000)
    }
  }

  const filtered = filterType
    ? templates.filter(t => t.type === filterType)
    : templates

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
              <h1>Task</h1>
              <h1 className='text-white'>Templates</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-full md:w-[70%] border-b-2 pb-[6%] border-white'>
                Reusable task lists for different project types
              </h4>
            </div>
          </header>

          {/* Filter + Create */}
          <section className='w-full relative z-10 mt-[5%]'>
            <div className='flex items-center gap-3'>
              <div className='flex-1'>
                <TypeDropdown value={filterType} onChange={setFilterType} placeholder='All types' />
              </div>
              {filterType && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setFilterType('')}
                  className='w-10 h-10 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] shrink-0'
                  whileTap={{ scale: 0.9 }}
                >
                  <i className='ri-close-line'></i>
                </motion.button>
              )}
            </div>
          </section>

          {/* Template list */}
          <section className='w-full relative z-10 mt-4 pb-4 space-y-3'>
            <AnimatePresence>
              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  className='text-center py-6 font-semibold text-sm'
                >
                  No templates found.
                </motion.div>
              )}
              {filtered.map(template => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </section>

          {/* Create / Edit Template */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%]'>{editingTemplate ? 'Edit Template :' : 'Create Template :'}</h1>

            <AnimatePresence mode='wait'>
              {!isCreateOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Create a custom reusable template for any project type.</p>
                    <motion.div
                      layoutId='template-open-btn'
                      onClick={openCreate}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-add-circle-fill'></i>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode='wait'>
              {isCreateOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg'
                >
                  <motion.form
                    onSubmit={handleSave}
                    className='px-3 py-4 space-y-5'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Name */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Template Name</label>
                      <div className='bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-file-list-3-line text-[#883bbc]'></i>
                        <input
                          type='text'
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder='e.g. Luxury Villa Interior'
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                        />
                      </div>
                    </motion.div>

                    {/* Type */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <label className='block text-black font-medium mb-2'>Type</label>
                      <TypeDropdown value={formType} onChange={setFormType} placeholder='Select type' />
                    </motion.div>

                    {/* Add task input */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                      <label className='block text-black font-medium mb-2'>Tasks</label>
                      <div className='flex gap-2'>
                        <div className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                          <i className='ri-list-check text-[#883bbc]'></i>
                          <input
                            type='text'
                            value={newTaskInput}
                            onChange={(e) => setNewTaskInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFormTask() } }}
                            placeholder='e.g. Site measurement...'
                            className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                          />
                        </div>
                        <motion.button
                          type='button'
                          onClick={handleAddFormTask}
                          className='w-10 h-10 bg-[#883bbc] rounded-full flex items-center justify-center text-white shrink-0'
                          whileTap={{ scale: 0.9 }}
                        >
                          <i className='ri-add-line text-xl'></i>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Task rows */}
                    <motion.div layout className='space-y-2'>
                      <AnimatePresence>
                        {formTasks.length === 0 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className='text-sm font-semibold text-center py-2'>
                            No tasks yet — add one above.
                          </motion.p>
                        )}
                        {formTasks.map((taskName, i) => (
                          <motion.div
                            key={taskName + i}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            transition={{ layout: { duration: 0.25, ease: 'easeInOut' }, delay: i * 0.03 }}
                            className='flex items-center flex-col gap-2'
                          >
                            <div className='w-full h-full flex items-center justify-center gap-2'>
                              <span className='w-6 h-6 shrink-0 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center text-xs font-bold text-[#883bbc]'>
                                {i + 1}
                              </span>
                              {editingFormIdx === i ? (
                                <input
                                  autoFocus
                                  value={editingFormName}
                                  onChange={(e) => setEditingFormName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleFormRenameCommit(i) }
                                    if (e.key === 'Escape') setEditingFormIdx(-1)
                                  }}
                                  onBlur={() => handleFormRenameCommit(i)}
                                  className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-[6px] font-semibold text-sm outline-none'
                                />
                              ) : (
                                <div className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-3 py-[6px]'>
                                  <p className='font-semibold text-sm truncate'>{taskName}</p>
                                </div>
                              )}
                            </div>

                            <div className='w-[80%] ml-[2%] h-full flex items-center gap-2'>
                              <motion.button
                                type='button'
                                onClick={() => handleFormMoveUp(i)}
                                disabled={i === 0}
                                className='w-8 h-8 shrink-0 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] disabled:opacity-20'
                                whileTap={{ scale: 0.9 }}
                              >
                                <i className='ri-arrow-up-s-line text-base'></i>
                              </motion.button>
                              <motion.button
                                type='button'
                                onClick={() => handleFormMoveDown(i)}
                                disabled={i === formTasks.length - 1}
                                className='w-8 h-8 shrink-0 rounded-full bg-white/60 border border-[#883bbc]/30 flex items-center justify-center text-[#883bbc] disabled:opacity-20'
                                whileTap={{ scale: 0.9 }}
                              >
                                <i className='ri-arrow-down-s-line text-base'></i>
                              </motion.button>
                              <motion.button
                                type='button'
                                onClick={() => {
                                  if (editingFormIdx === i) { handleFormRenameCommit(i) }
                                  else { setEditingFormIdx(i); setEditingFormName(taskName) }
                                }}
                                className='w-8 h-8 shrink-0 rounded-full bg-[#F7D6F3] border border-[#883bbc]/40 flex items-center justify-center text-[#883bbc]'
                                whileTap={{ scale: 0.9 }}
                              >
                                <i className={editingFormIdx === i ? 'ri-check-line text-sm' : 'ri-edit-2-line text-sm'}></i>
                              </motion.button>
                              <motion.button
                                type='button'
                                onClick={() => { if (editingFormIdx === i) setEditingFormIdx(-1); handleRemoveFormTask(i) }}
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
                        onClick={closeForm}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='template-open-btn'
                        type='submit'
                        disabled={saving}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {saving
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-save-line'></i><span>{editingTemplate ? 'Update' : 'Save Template'}</span></>
                        }
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

export default AdminTemplates
