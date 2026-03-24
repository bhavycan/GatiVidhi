import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Butterfly from '../../templates/Butterfly'
import Navbar from '../../templates/Navbar'
import axios from 'axios'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import 'yet-another-react-lightbox/plugins/counter.css'
import { API_BASE } from '../../config.js'

const TaskFilterDropdown = ({ tasks, value, onChange }) => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div layout className='w-full max-w-xs'>
      <motion.div
        layout
        onClick={() => setOpen(!open)}
        className='w-full text-base font-semibold bg-white/50 border border-[#883bbc] rounded-full px-4 py-2 flex items-center justify-between cursor-pointer'
      >
        <div className='flex items-center gap-2'>
          <i className='ri-filter-3-line text-[#883bbc]'></i>
          <span>{value}</span>
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
            className='w-full backdrop-blur-sm overflow-hidden rounded-b-2xl border border-t-0 border-[#883bbc] bg-white/60 z-20 relative'
          >
            {tasks.map((task, i) => (
              <motion.div
                key={task}
                onClick={() => { onChange(task); setOpen(false) }}
                className={`w-full px-4 py-2 cursor-pointer font-semibold text-sm border-b border-[#883bbc]/30 last:border-0 flex items-center gap-2
                  ${value === task ? 'bg-[#883bbc]/10 text-[#883bbc]' : 'hover:bg-white/40'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                {value === task && <i className='ri-check-line text-xs'></i>}
                {task}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const Gallery = () => {
  const [isopen, setOpen] = useState(false)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState('All')
  const [mediaType, setMediaType] = useState('All') // 'All' | 'Images' | 'Videos'
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [videoModal, setVideoModal] = useState(null) // src string or null
  const parent = useRef(null)

  const fetchUpdates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/update/all`, { withCredentials: true })
      setUpdates(data?.updates || [])
    } catch (error) {
      console.error('Failed to fetch updates', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [])

  // Derive task list from backend updates
  const tasks = ['All', ...Array.from(new Set(updates.map(u => u.task).filter(Boolean)))]

  // Build flat list of all media items (images + videos) filtered by task and mediaType
  const allMedia = updates
    .filter(u => activeTask === 'All' || u.task === activeTask)
    .flatMap(u => [
      ...(u.images || []).map(src => ({ src, type: 'image', task: u.task || 'Update', date: u.createdAt })),
      ...(u.videos || []).map(src => ({ src, type: 'video', task: u.task || 'Update', date: u.createdAt })),
    ])
    .filter(item =>
      mediaType === 'All' ||
      (mediaType === 'Images' ? item.type === 'image' : item.type === 'video')
    )

  // Lightbox only for images — compute correct index within image-only list
  const imageItems = allMedia.filter(m => m.type === 'image')
  const slides = imageItems.map(p => ({ src: p.src }))

  const openMedia = (item) => {
    if (item.type === 'video') {
      setVideoModal(item.src)
      return
    }
    const idx = imageItems.findIndex(m => m.src === item.src)
    setLightboxIndex(idx >= 0 ? idx : 0)
    setLightboxOpen(true)
  }

  return (
    <div className='w-screen h-screen relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        {isopen && <Navbar value={{ isopen, setOpen }} />}
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

      {/* Menu button */}
      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className='menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer'
        >
          <i className='ri-menu-fill text-3xl text-white opacity-90'></i>
        </motion.div>
      </nav>

      <main className='w-full h-full px-[8%] pt-[4%] pb-0 relative overflow-hidden flex flex-col'>
        <div className='max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden'>

          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex'>
              <h1>Gal</h1>
              <h1 className='text-white'>lery</h1>
            </div>
            <div className='subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]'>
              <h4 className='w-[70%] border-b-2 pb-[6%] border-white'>
                All project photos and videos from daily updates
              </h4>
            </div>
          </header>

          {/* Scrollable section */}
          <section ref={parent} className='main-container w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>

            {/* Task filter dropdown */}
            <div className='mt-[5%]'>
              <TaskFilterDropdown tasks={tasks} value={activeTask} onChange={setActiveTask} />
            </div>

            {/* Media type filter pills */}
            <div className='flex gap-2 mt-3'>
              {[
                { key: 'All', icon: 'ri-apps-line' },
                { key: 'Images', icon: 'ri-image-line' },
                { key: 'Videos', icon: 'ri-video-line' },
              ].map(({ key, icon }) => (
                <motion.button
                  key={key}
                  onClick={() => setMediaType(key)}
                  whileTap={{ scale: 0.93 }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors
                    ${mediaType === key
                      ? 'bg-[#883bbc] text-white border-[#883bbc]'
                      : 'bg-white/40 border-[#883bbc]/40 text-black hover:bg-white/60'}`}
                >
                  <i className={icon}></i>
                  {key}
                </motion.button>
              ))}
            </div>

            {/* Count */}
            <div className='mt-4 mb-3 flex items-center gap-2'>
              <figure className='w-6 h-6 shrink-0'>
                <img className='w-full h-full object-cover' src='/images/hearts.png' alt='' />
              </figure>
              <span className='font-semibold text-sm opacity-70'>
                {loading ? 'Loading...' : `${allMedia.length} ${mediaType === 'Videos' ? 'video' : mediaType === 'Images' ? 'photo' : 'item'}${allMedia.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            {/* Loading */}
            {loading && (
              <div className='flex items-center justify-center mt-16'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className='w-10 h-10 rounded-full border-4 border-[#883bbc] border-t-transparent'
                />
              </div>
            )}

            {/* Empty state */}
            {!loading && allMedia.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-12 px-4 py-6 rounded-xl bg-gradient-to-tl from-[#F7D6F3] to-transparent text-center'
              >
                <i className={`${mediaType === 'Videos' ? 'ri-video-off-line' : 'ri-image-2-line'} text-4xl text-[#883bbc] opacity-60`}></i>
                <p className='mt-2 font-semibold opacity-60'>
                  No {mediaType === 'Videos' ? 'videos' : mediaType === 'Images' ? 'photos' : 'media'} found
                  {activeTask !== 'All' ? ` for "${activeTask}"` : ''}.
                </p>
              </motion.div>
            )}

            {/* Masonry-style grid */}
            {!loading && allMedia.length > 0 && (
              <motion.div
                layout
                className='columns-2 md:columns-3 gap-2 space-y-2'
              >
                {allMedia.map((item, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.3 }}
                    onClick={() => openMedia(item)}
                    className='relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer group bg-black'
                  >
                    {item.type === 'video' ? (
                      <>
                        <video
                          src={item.src}
                          className='w-full h-auto object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-60'
                          muted
                          preload='metadata'
                        />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                            <i className='ri-play-fill text-white text-xl'></i>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.src}
                        alt={`photo-${i}`}
                        className='w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105'
                        loading='lazy'
                      />
                    )}
                    {/* Overlay on hover */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end'>
                      <div className='w-full px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent'>
                        {item.task && (
                          <span className='text-white text-xs font-semibold px-2 py-0.5 rounded-full bg-[#883bbc]/80'>
                            {item.task}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <footer className='h-8' />
          </section>
        </div>
      </main>

      {/* Video modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideoModal(null)}
            className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4'
          >
            <motion.video
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              src={videoModal}
              controls
              autoPlay
              onClick={e => e.stopPropagation()}
              className='max-w-full max-h-[85vh] rounded-xl shadow-2xl'
            />
            <button
              onClick={() => setVideoModal(null)}
              className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl'
            >
              <i className='ri-close-line'></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Thumbnails, Zoom, Slideshow, Fullscreen, Counter]}
        styles={{
          container: {
            backgroundImage: `url('/GIF/butterflies.gif'), linear-gradient(to top, #F7D6F3, #883BBC)`,
            backgroundSize: 'auto 25%, cover',
            backgroundPosition: 'bottom,  center',
            backgroundRepeat: 'no-repeat, no-repeat',
          },
          thumbnailsContainer: {
            background: '#F7D6F3',
          },
        }}
      />
    </div>
  )
}

export default Gallery
