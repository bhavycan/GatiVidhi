import { useEffect, useState } from 'react'
import CommentBox from './CommentBox';
import { AnimatePresence, motion } from 'motion/react';
import ImagePortal from '../Portals/ImagePortal';
import 'photoswipe/style.css';
import { createPortal } from 'react-dom';

const VideoModal = ({ src, onClose }) => createPortal(
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4'
  >
    <motion.video
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      src={src}
      controls
      autoPlay
      onClick={e => e.stopPropagation()}
      className='max-w-full max-h-[85vh] rounded-xl shadow-2xl'
    />
    <button
      onClick={onClose}
      className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl'
    >
      <i className='ri-close-line'></i>
    </button>
  </motion.div>,
  document.body
);


const UpdateCard = ({ update, setShareOpen }) => {

  const images = (update?.images && update.images.length > 0)
    ? update.images
    : [
        'https://images.unsplash.com/photo-1629746958979-08060ed5bf0b?q=80&w=1170&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1626367771676-96d7bf35953f?q=80&w=1170&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1636071659185-5e2b6596a42c?q=80&w=1246&auto=format&fit=crop',
      ]

  const dateLabel = update?.createdAt
    ? new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'No updates yet'

  const [isclick, setclick] = useState(0)
  const [tapNumber, setTapNumber] = useState(0)

  const handleClick = () => {
    setclick((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setclick((prev) => (prev - 1 + images.length) % images.length);
  };

  const [isTap, setTap] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  const videos = update?.videos?.length > 0 ? update.videos : []

  const handleTap = (isclick) => {
    setTap(true)
    setTapNumber(isclick)
  }

  useEffect(() => {
    if(!isTap){
      const interval = setInterval(() => {
        setclick((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  },[isTap])


  return (
    <motion.div className='w-full h-auto relative rounded-2xl overflow-hidden bg-white/60 backdrop-blur-md border border-white/70 shadow-xl shadow-[#883bbc]/10'>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#883bbc] via-[#c084fc] to-[#F7D6F3]" />

      <div className="px-4 py-4">

        {/* Date header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#883bbc] flex items-center justify-center shadow-md shadow-[#883bbc]/30 shrink-0">
            <i className="ri-megaphone-fill text-lg text-white"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#883bbc]/70 uppercase tracking-wider">Latest Update</p>
            <h4 className="text-base font-bold leading-tight">{dateLabel}</h4>
          </div>
        </div>

        {/* Image carousel */}
        <div className='w-full relative rounded-xl overflow-hidden'>
          <motion.div className='w-full h-56 md:h-72 lg:h-80 rounded-xl overflow-hidden'>
            {!isTap && (
              <motion.figure className='w-full h-full'>
                <AnimatePresence mode='wait'>
                  <motion.img
                    key={isclick}
                    initial={{ opacity: 0, x: -80, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 80, scale: 0.95 }}
                    onTap={() => handleTap(isclick)}
                    transition={{ duration: .4, ease: [0.25, 1, 0.5, 1] }}
                    className="w-full h-full object-cover cursor-pointer"
                    src={images[isclick]}
                    alt=""
                  />
                </AnimatePresence>
              </motion.figure>
            )}

            <AnimatePresence mode='wait'>
              {isTap && <ImagePortal tapNumber={tapNumber} setTap={setTap} images={images} />}
            </AnimatePresence>
          </motion.div>

          {/* Prev / Next buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white shadow-md flex items-center justify-center"
          >
            <i className="ri-arrow-left-s-line text-xl text-[#883bbc]"></i>
          </button>
          <button
            onClick={handleClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-white shadow-md flex items-center justify-center"
          >
            <i className="ri-arrow-right-s-line text-xl text-[#883bbc]"></i>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setclick(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === isclick
                    ? 'w-5 h-2 bg-[#883bbc]'
                    : 'w-2 h-2 bg-white/70'
                }`}
              />
            ))}z
          </div>
        </div>

        {/* Video previews */}
        <AnimatePresence>
          {activeVideo && <VideoModal src={activeVideo} onClose={() => setActiveVideo(null)} />}
        </AnimatePresence>

        {videos.length > 0 && (
          <div className='mt-4'>
            <p className='text-xs font-bold text-[#883bbc]/70 uppercase tracking-wider mb-2 flex items-center gap-1'>
              <i className='ri-video-line'></i> Videos ({videos.length})
            </p>
            <div className='flex gap-2 overflow-x-auto pb-1'>
              {videos.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setActiveVideo(src)}
                  className='relative shrink-0 w-28 h-20 rounded-xl overflow-hidden bg-black cursor-pointer border border-[#883bbc]/20'
                >
                  <video
                    src={src}
                    className='w-full h-full object-cover opacity-80'
                    muted
                    preload='metadata'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20'>
                    <div className='w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                      <i className='ri-play-fill text-white text-lg'></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Done */}
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#883bbc]/10 border border-[#883bbc]/20 flex items-center justify-center shrink-0">
              <i className="ri-check-double-line text-sm text-[#883bbc]"></i>
            </div>
            <h4 className="text-sm font-bold text-[#883bbc] uppercase tracking-wide">Work Done</h4>
          </div>
          <p className='text-sm font-semibold leading-relaxed text-gray-700 pl-9'>
            {update?.workDone || 'No details provided.'}
          </p>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-gradient-to-r from-[#883bbc]/20 via-[#F7D6F3] to-transparent" />

        {/* Work Left */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#883bbc]/10 border border-[#883bbc]/20 flex items-center justify-center shrink-0">
              <i className="ri-time-fill text-sm text-[#883bbc]"></i>
            </div>
            <h4 className="text-sm font-bold text-[#883bbc] uppercase tracking-wide">Work Left</h4>
          </div>
          <p className='text-sm font-semibold leading-relaxed text-gray-700 pl-9'>
            {update?.workLeft || 'No details provided.'}
          </p>
        </div>

        {/* Actions */}
        <motion.div className='w-full mt-5 font-semibold text-lg'>
          <div className='w-full flex items-center gap-2 justify-center h-12'>
            <button onClick={() => setShareOpen(true)} className='w-[50%] px-2 py-2 bg-[#883bbc] text-white rounded-md h-full'>
              <i className="ri-share-fill text-2xl"></i>
            </button>
            <CommentBox update={update} />
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}

export default UpdateCard
