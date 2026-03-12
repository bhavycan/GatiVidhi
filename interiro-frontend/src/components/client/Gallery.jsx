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

const TASKS = ['All', 'Layout', 'PopChannel', 'Electrification', 'Ceiling', 'Furniture', 'Laminate', 'Paint', 'Lights', 'Cleaning', 'HandOver']

const Gallery = () => {
  const [isopen, setOpen] = useState(false)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const parent = useRef(null)

  const fetchUpdates = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/update/all', { withCredentials: true })
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

  // Build flat list of { src, updateDate, task } filtered by activeTask
  const allPhotos = updates
    .filter(u => activeTask === 'All' || u.task === activeTask)
    .flatMap(u =>
      (u.images || []).map(src => ({
        src,
        task: u.task || 'Update',
        date: u.createdAt,
      }))
    )

  const slides = allPhotos.map(p => ({ src: p.src }))

  const openLightbox = (index) => {
    setLightboxIndex(index)
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
                All project photos from daily updates
              </h4>
            </div>
          </header>

          {/* Scrollable section */}
          <section ref={parent} className='main-container w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>

            {/* Task filter chips */}
            <div className='mt-[5%] flex gap-2 flex-wrap'>
              {TASKS.map(task => (
                <motion.button
                  key={task}
                  onClick={() => setActiveTask(task)}
                  whileTap={{ scale: 0.93 }}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors
                    ${activeTask === task
                      ? 'bg-[#883bbc] text-white border-[#883bbc]'
                      : 'bg-white/50 border-[#883bbc]/40 text-black hover:border-[#883bbc]'
                    }`}
                >
                  {task}
                </motion.button>
              ))}
            </div>

            {/* Count */}
            <div className='mt-4 mb-3 flex items-center gap-2'>
              <figure className='w-6 h-6 shrink-0'>
                <img className='w-full h-full object-cover' src='/images/hearts.png' alt='' />
              </figure>
              <span className='font-semibold text-sm opacity-70'>
                {loading ? 'Loading...' : `${allPhotos.length} photo${allPhotos.length !== 1 ? 's' : ''}`}
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
            {!loading && allPhotos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='mt-12 px-4 py-6 rounded-xl bg-gradient-to-tl from-[#F7D6F3] to-transparent text-center'
              >
                <i className='ri-image-2-line text-4xl text-[#883bbc] opacity-60'></i>
                <p className='mt-2 font-semibold opacity-60'>No photos found{activeTask !== 'All' ? ` for "${activeTask}"` : ''}.</p>
              </motion.div>
            )}

            {/* Masonry-style grid */}
            {!loading && allPhotos.length > 0 && (
              <motion.div
                layout
                className='columns-2 md:columns-3 gap-2 space-y-2'
              >
                {allPhotos.map((photo, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.3 }}
                    onClick={() => openLightbox(i)}
                    className='relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer group'
                  >
                    <img
                      src={photo.src}
                      alt={`photo-${i}`}
                      className='w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105'
                      loading='lazy'
                    />
                    {/* Overlay on hover */}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end'>
                      <div className='w-full px-2 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent'>
                        {photo.task && (
                          <span className='text-white text-xs font-semibold px-2 py-0.5 rounded-full bg-[#883bbc]/80'>
                            {photo.task}
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
