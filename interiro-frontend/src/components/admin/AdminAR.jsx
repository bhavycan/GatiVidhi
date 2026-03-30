import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import Butterfly from '../../templates/Butterfly'
import AdminNavbar from '../../templates/AdminNavbar'
import ARViewer from '../client/ARViewer'
import axios from 'axios'
import { API_BASE } from '../../config.js'

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [message])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
      className='fixed inset-0 z-50 px-2 w-screen h-screen bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end pb-[10%]'
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 50 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: 'bottom center' }}
        onClick={(e) => e.stopPropagation()}
        className='w-[90%] h-[10%] rounded-full px-3 py-3 flex items-center justify-center text-black shadow-lg backdrop-blur-sm overflow-hidden bg-gradient-to-bl from-white to-transparent'
      >
        <h2 className='text-md w-full h-full font-semibold opacity-80 flex items-center justify-center text-center'>
          {message}
        </h2>
      </motion.div>
    </motion.div>,
    document.body
  )
}

// ─── Project Dropdown (mirrors ClientDropdown from AdminProject) ───────────────
const ProjectDropdown = ({ projects, selected, onSelect }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <div className='flex items-center gap-2'>
          <i className='ri-folder-line text-[#883bbc]'></i>
          <span className={selected ? '' : 'opacity-50'}>
            {selected ? selected.projectName : 'Select a project'}
          </span>
        </div>
        <motion.i
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className='ri-arrow-down-s-line shrink-0'
        />
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
            <div className='max-h-48 overflow-y-auto'>
              {projects.length === 0 && (
                <p className='px-4 py-2 text-sm opacity-60 font-semibold'>No projects found</p>
              )}
              {projects.map((p, i) => (
                <motion.div
                  key={p._id}
                  onClick={() => { onSelect(p); setOpen(false) }}
                  className='w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 flex items-center gap-3'
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <div className='w-7 h-7 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                    <i className='ri-folder-line text-white text-xs'></i>
                  </div>
                  <div>
                    <p className='font-semibold text-sm leading-4'>{p.projectName}</p>
                    <p className='text-xs opacity-50 font-mono'>{p._id}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-1 pl-2'>
          <p className='text-xs font-mono opacity-50'>ID: {selected._id}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminAR = () => {
  const [isopen, setOpen] = useState(false)
  const parent = useRef(null)

  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [title, setTitle] = useState('')
  const [glbFile, setGlbFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [isFormOpen, setFormOpen] = useState(false)

  const [designs, setDesigns] = useState([])
  const [viewUrl, setViewUrl] = useState(null)
  const [replaceId, setReplaceId] = useState(null)
  const [replaceFile, setReplaceFile] = useState(null)
  const [replaceLoading, setReplaceLoading] = useState(false)

  const uploadFileRef = useRef(null)
  const replaceFileRef = useRef(null)

  // Fetch projects — API returns { projects: [...] }
  useEffect(() => {
    axios.get(`${API_BASE}/project/all`, { withCredentials: true })
      .then(({ data }) => {
        const list = Array.isArray(data?.projects) ? data.projects : []
        setProjects(list)
      })
      .catch(console.error)
  }, [])

  // Fetch AR designs when project changes
  useEffect(() => {
    if (!selectedProject) return setDesigns([])
    axios.get(`${API_BASE}/ar/project/${selectedProject._id}`, { withCredentials: true })
      .then(({ data }) => setDesigns(Array.isArray(data) ? data : []))
      .catch(console.error)
  }, [selectedProject])

  const handleUpload = async () => {
    if (!selectedProject) return setToast('Please select a project')
    if (!title.trim()) return setToast('Please enter a title')
    if (!glbFile) return setToast('Please select a .glb file')

    setLoading(true)
    const fd = new FormData()
    fd.append('projectId', selectedProject._id)
    fd.append('title', title.trim())
    fd.append('glbFile', glbFile)

    try {
      const { data } = await axios.post(`${API_BASE}/ar/upload`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDesigns(prev => [data, ...prev])
      setTitle('')
      setGlbFile(null)
      if (uploadFileRef.current) uploadFileRef.current.value = ''
      setFormOpen(false)
      setToast('AR Design uploaded!')
    } catch (err) {
      setToast(err.response?.data || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReplace = async (id) => {
    if (!replaceFile) return setToast('Select a .glb file to replace with')
    setReplaceLoading(true)
    const fd = new FormData()
    fd.append('glbFile', replaceFile)
    try {
      const { data } = await axios.patch(`${API_BASE}/ar/replace/${id}`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDesigns(prev => prev.map(d => d._id === id ? data : d))
      setReplaceId(null)
      setReplaceFile(null)
      if (replaceFileRef.current) replaceFileRef.current.value = ''
      setToast('Design replaced!')
    } catch (err) {
      setToast(err.response?.data || 'Replace failed')
    } finally {
      setReplaceLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/ar/${id}`, { withCredentials: true })
      setDesigns(prev => prev.filter(d => d._id !== id))
      setToast('Design deleted')
    } catch {
      setToast('Delete failed')
    }
  }

  const handleCancel = () => {
    setTitle('')
    setGlbFile(null)
    setSelectedProject(null)
    if (uploadFileRef.current) uploadFileRef.current.value = ''
    setFormOpen(false)
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className='admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer'
        >
          <i className='ri-menu-fill text-3xl text-white opacity-90'></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        {viewUrl && <ARViewer url={viewUrl} onClose={() => setViewUrl(null)} />}
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

      <main ref={parent} className='w-full h-full px-[8%] pt-[6%] pb-0 relative overflow-y-auto overflow-x-hidden'>
        <div className='max-w-3xl w-full mx-auto'>

          {/* Header */}
          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>AR</h1>
              <h1 className='text-white'>Designs</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                Upload and manage 3D models for AR viewing
              </h4>
            </div>
          </header>

          {/* ── Upload Section ── */}
          <section className='w-full relative z-10 pb-10'>
            <h1 className='text-xl font-bold mt-[5%]'>Upload AR Design :</h1>

            <AnimatePresence mode='wait'>
              {!isFormOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                >
                  <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
                    <p>Select a project, give the file a title and upload its .glb file.</p>
                    <motion.div
                      layoutId='ar-open-btn'
                      onClick={() => setFormOpen(true)}
                      className='create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer'
                    >
                      <i className='ri-box-3-line'></i>
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
                  <motion.div
                    className='px-3 py-4 space-y-4'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {/* Project selector */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <label className='block text-black font-medium mb-2'>Select Project</label>
                      <ProjectDropdown
                        projects={projects}
                        selected={selectedProject}
                        onSelect={setSelectedProject}
                      />
                    </motion.div>

                    {/* Title */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <label className='block text-black font-medium mb-2'>Design Title</label>
                      <div className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 flex items-center gap-2'>
                        <i className='ri-file-3-line text-[#883bbc]'></i>
                        <input
                          type='text'
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder='e.g. Living Room v1'
                          className='flex-1 bg-transparent outline-none font-semibold text-base placeholder:opacity-50'
                        />
                      </div>
                    </motion.div>

                    {/* GLB file picker */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.49 }}>
                      <label className='block text-black font-medium mb-2'>.GLB File</label>
                      <div
                        onClick={() => uploadFileRef.current?.click()}
                        className='w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-dashed border-[#883bbc] rounded-2xl px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-white/20 transition-colors'
                      >
                        <i className='ri-box-3-line text-2xl text-[#883bbc] opacity-70'></i>
                        <span className='font-semibold text-base opacity-60 truncate'>
                          {glbFile ? glbFile.name : 'Tap to select .glb file'}
                        </span>
                      </div>
                      <input
                        ref={uploadFileRef}
                        type='file'
                        accept='.glb,model/gltf-binary,application/octet-stream'
                        className='hidden'
                        onChange={e => setGlbFile(e.target.files[0] || null)}
                      />
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className='flex gap-4 pt-2'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.56 }}
                    >
                      <button
                        type='button'
                        onClick={handleCancel}
                        className='flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium'
                      >
                        Cancel
                      </button>
                      <motion.button
                        layoutId='ar-open-btn'
                        type='button'
                        onClick={handleUpload}
                        disabled={loading}
                        className='flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading
                          ? <i className='ri-loader-4-line animate-spin text-xl'></i>
                          : <><i className='ri-upload-2-line'></i><span>Upload Design</span></>
                        }
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── View Design Section ── */}
          <section className='w-full relative z-10 pb-16'>
            <h1 className='text-xl font-bold mt-[2%]'>View Design :</h1>

            <div className='px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent'>
              <p>Select a project above to preview its AR designs below.</p>
            </div>

            {!selectedProject ? (
              <div className='w-full min-h-[15vh] rounded-xl mt-[3%] bg-gradient-to-br from-[#F7D6F3] to-transparent flex items-center justify-center'>
                <p className='text-sm font-semibold opacity-40'>No project selected</p>
              </div>
            ) : designs.length === 0 ? (
              <div className='w-full min-h-[15vh] rounded-xl mt-[3%] bg-gradient-to-br from-[#F7D6F3] to-transparent flex items-center justify-center'>
                <p className='text-sm font-semibold opacity-40'>No AR designs for this project yet</p>
              </div>
            ) : (
              <div className='flex flex-col gap-4 mt-[3%]'>
                {designs.map(design => (
                  <motion.div
                    key={design._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='w-full border border-[#883bbc] backdrop-blur-sm rounded-lg px-4 py-4 flex flex-col gap-3'
                  >
                    {/* Design row */}
                    <div className='flex items-center gap-3'>
                      <div className='w-11 h-11 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center shrink-0'>
                        <i className='ri-box-3-line text-xl text-[#883bbc]'></i>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-sm truncate'>{design.title}</p>
                        <p className='text-xs opacity-40 font-semibold'>
                          {new Date(design.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setViewUrl(design.glbUrl)}
                          className='flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#883bbc] text-white font-bold text-xs shadow'
                        >
                          <i className='ri-camera-lens-line text-sm'></i>
                          View AR
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => { setReplaceId(replaceId === design._id ? null : design._id); setReplaceFile(null) }}
                          className='w-8 h-8 rounded-full bg-white/60 border border-[#883bbc]/40 flex items-center justify-center'
                          title='Replace file'
                        >
                          <i className='ri-refresh-line text-[#883bbc] text-sm'></i>
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleDelete(design._id)}
                          className='w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center'
                          title='Delete'
                        >
                          <i className='ri-delete-bin-line text-red-500 text-sm'></i>
                        </motion.button>
                      </div>
                    </div>

                    {/* Replace panel */}
                    <AnimatePresence>
                      {replaceId === design._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className='overflow-hidden'
                        >
                          <div className='flex gap-2 pt-1 border-t border-[#883bbc]/20'>
                            <div
                              onClick={() => replaceFileRef.current?.click()}
                              className='flex-1 h-10 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-dashed border-[#883bbc]/60 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-white/40 transition-colors'
                            >
                              <i className='ri-upload-2-line text-[#883bbc] text-sm'></i>
                              <span className='text-xs font-semibold opacity-60 truncate max-w-[60%]'>
                                {replaceFile ? replaceFile.name : 'Choose new .glb'}
                              </span>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleReplace(design._id)}
                              disabled={replaceLoading}
                              className='px-4 py-2 rounded-lg bg-[#883bbc] text-white font-bold text-xs disabled:opacity-50'
                            >
                              {replaceLoading ? '...' : 'Replace'}
                            </motion.button>
                          </div>
                          <input
                            ref={replaceFileRef}
                            type='file'
                            accept='.glb,model/gltf-binary,application/octet-stream'
                            className='hidden'
                            onChange={e => setReplaceFile(e.target.files[0] || null)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}

export default AdminAR
