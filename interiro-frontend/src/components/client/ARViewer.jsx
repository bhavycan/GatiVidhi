import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import '@google/model-viewer'

/**
 * ARViewer — full-screen 3D + AR viewer using Google's <model-viewer>.
 *
 * On Android (Capacitor):
 *   "View in AR" fires the Scene Viewer intent → ARCore starts camera →
 *   detects flat surface → user taps to place the 3D model.
 *
 * On iOS:
 *   Falls back to AR Quick Look (supports GLB on iOS 15+).
 *
 * On desktop / unsupported:
 *   AR button is hidden automatically by model-viewer.
 */
const ARViewer = ({ url, onClose }) => {
  const mvRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleViewAR = () => {
    if (mvRef.current) {
      mvRef.current.activateAR()
    }
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='fixed inset-0 z-50 bg-black flex flex-col'
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
        className='flex items-center justify-between px-5 py-3 bg-black/70 border-b border-white/10 shrink-0'
      >
        <div className='flex items-center gap-2'>
          <i className='ri-box-3-line text-[#c084fc] text-xl'></i>
          <span className='text-white font-bold text-sm'>3D Design Preview</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-white/30 text-xs hidden sm:block'>
            Drag to rotate · Scroll to zoom
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
          >
            <i className='ri-close-line text-white text-lg'></i>
          </motion.button>
        </div>
      </motion.div>

      {/* ── model-viewer canvas ── */}
      <div className='flex-1 relative w-full'>
        {/*
          ar-modes order:
            1. scene-viewer  → Android: fires ARCore Scene Viewer intent
            2. webxr         → Browser WebXR fallback
            3. quick-look    → iOS: AR Quick Look (GLB supported on iOS 15+)
        */}
        <model-viewer
          ref={mvRef}
          src={url}
          ar
          ar-modes='scene-viewer webxr quick-look'
          ar-scale='auto'
          camera-controls
          auto-rotate
          auto-rotate-delay='800'
          shadow-intensity='1'
          environment-image='neutral'
          exposure='1'
          style={{ width: '100%', height: '100%', background: '#111' }}
        >
          {/* Hide the default AR button — we use our own styled button below */}
          <button slot='ar-button' style={{ display: 'none' }} aria-hidden='true' />
        </model-viewer>
      </div>

      {/* ── Footer: AR + Download ── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
        className='px-5 py-4 bg-black/70 border-t border-white/10 shrink-0 flex items-center gap-3'
      >
        {/* View in AR */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleViewAR}
          className='flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#883bbc] text-white font-bold text-sm shadow-lg'
        >
          <i className='ri-camera-lens-line text-base'></i>
          View in AR
        </motion.button>

        {/* Download */}
        <a
          href={url}
          download='design.glb'
          className='w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0'
          title='Download .glb file'
        >
          <i className='ri-download-2-line text-white text-lg'></i>
        </a>
      </motion.div>

      {/* Mobile hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className='text-center text-white/25 text-xs pb-2 bg-black/70 sm:hidden'
      >
        Drag · Pinch to zoom · Two-finger pan
      </motion.p>
    </motion.div>,
    document.body
  )
}

export default ARViewer
