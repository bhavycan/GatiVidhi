import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import axios from 'axios'

const AdminNotes = () => {
  const parent = useRef(null)
  const navigate = useNavigate()
  const [isopen, setOpen] = useState(false)
  const { showPopcard, popcard } = usePopcard()

  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/note/all', { withCredentials: true })
      setNotes(data)
    } catch {
      setNotes([])
    } finally {
      setNotesLoading(false)
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
    fetchNotes()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return showPopcard('Title is required.', false, 2000)
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:3000/note/create', form, { withCredentials: true })
      setNotes(prev => [data, ...prev])
      setForm({ title: '', body: '' })
      setFormOpen(false)
      showPopcard('Note added!', true, 1800)
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong.'
      showPopcard(msg, false, 2500)
    } finally {
      setLoading(false)
    }
  }

  const toggleDone = async (id) => {
    try {
      const { data } = await axios.post('http://localhost:3000/note/toggle', { id }, { withCredentials: true })
      setNotes(prev => prev.map(n => n._id === id ? data : n))
    } catch {
      showPopcard('Failed to update note.', false, 2000)
    }
  }

  const deleteNote = async (id) => {
    try {
      await axios.post('http://localhost:3000/note/delete', { id }, { withCredentials: true })
      setNotes(prev => prev.filter(n => n._id !== id))
      showPopcard('Note deleted.', true, 1500)
    } catch {
      showPopcard('Failed to delete note.', false, 2000)
    }
  }

  const filtered = notes.filter(n => {
    if (filter === 'todo') return !n.done
    if (filter === 'done') return n.done
    return true
  })

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      {/* Menu icon */}
      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className='admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer'>
          <i className='ri-menu-fill text-3xl text-white opacity-90'></i>
        </motion.div>
      </nav>

      {/* Navbar */}
      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      {/* Popcard */}
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

      {/* Main content */}
      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-2'>
              <h1>My</h1>
              <h1 className='text-white'>Notes</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-full md:w-[70%] border-b-2 pb-[6%] border-white'>
                Keep track of todos & personal thoughts
              </h4>
            </div>
          </header>

          {/* Add Note */}
          <section className='w-full relative z-10 pb-4'>
            <h1 className='text-xl font-bold mt-[5%]'>New Note :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Jot down a note or add a todo.</p>
                    <motion.div
                      layoutId='note-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-sticky-note-line'></i>
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
                    onSubmit={handleAdd}
                    className='px-3 py-4 space-y-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Title</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-bookmark-line text-[#883bbc]'></i>
                        <input
                          type='text'
                          value={form.title}
                          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                          placeholder='Note title...'
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Body</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-lg px-4 py-2 flex gap-2'>
                        <i className='ri-file-text-line text-[#883bbc] mt-1'></i>
                        <textarea
                          value={form.body}
                          onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                          placeholder='Write your note here...'
                          rows={3}
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50 resize-none'
                        />
                      </div>
                    </motion.div>

                    <motion.div className='flex gap-4 pt-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <button
                        type='button'
                        onClick={() => { setFormOpen(false); setForm({ title: '', body: '' }) }}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='note-open-btn'
                        type='submit'
                        disabled={loading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-save-line'></i><span>Save Note</span></>}
                      </motion.button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Filter + Notes list */}
          <section className='w-full relative z-10 pb-16'>
            <div className='flex items-center justify-between mt-[2%] mb-3'>
              <h1 className='text-xl font-bold'>All Notes :</h1>
              <div className='flex gap-2'>
                {['all', 'todo', 'done'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors
                      ${filter === f ? 'bg-[#883bbc] text-white' : 'bg-white/50 text-gray-600 hover:bg-white/80'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {notesLoading ? (
              <div className='flex items-center justify-center h-16'>
                <i className='ri-loader-4-line animate-spin text-2xl text-[#883bbc]'></i>
              </div>
            ) : filtered.length === 0 ? (
              <div className='px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent'>
                <p className='text-sm font-semibold opacity-70'>No notes here yet.</p>
              </div>
            ) : (
              <motion.div layout className='space-y-3'>
                <AnimatePresence>
                  {filtered.map((note, i) => (
                    <motion.div
                      key={note._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className={`rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent border overflow-hidden
                        ${note.done ? 'border-green-400/50 opacity-75' : 'border-[#883bbc]/40'}`}
                    >
                      <div className='flex items-start gap-3 px-4 py-3'>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleDone(note._id)}
                          className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                            ${note.done ? 'bg-green-400 border-green-400' : 'border-[#883bbc] hover:border-[#6e2ea0]'}`}
                        >
                          {note.done && <i className='ri-check-line text-white text-xs'></i>}
                        </button>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          <p className={`font-semibold text-base leading-5 ${note.done ? 'line-through opacity-50' : ''}`}>
                            {note.title}
                          </p>
                          {note.body && (
                            <p className={`text-sm opacity-70 mt-1 whitespace-pre-wrap ${note.done ? 'line-through' : ''}`}>
                              {note.body}
                            </p>
                          )}
                          <p className='text-xs opacity-40 mt-1'>
                            {new Date(note.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => deleteNote(note._id)}
                          className='text-[#883bbc]/40 hover:text-red-400 transition-colors flex-shrink-0'
                        >
                          <i className='ri-delete-bin-line text-lg'></i>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminNotes
