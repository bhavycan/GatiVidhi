import { Suspense, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Center, Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'

// ── Model loader ─────────────────────────────────────────────────────────────
const Model = ({ url }) => {
  const { scene } = useGLTF(url)
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  )
}

// ── Loading spinner inside the canvas ────────────────────────────────────────
const CanvasLoader = () => (
  <Html center>
    <div className='flex flex-col items-center gap-2'>
      <div className='w-10 h-10 rounded-full border-4 border-[#883bbc] border-t-transparent animate-spin' />
      <p className='text-xs font-semibold text-white/80'>Loading 3D model…</p>
    </div>
  </Html>
)

// ── Main component ────────────────────────────────────────────────────────────
const ModelViewer = ({ url, onClose }) => {
  const overlayRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col'
      >
        {/* Header bar */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className='flex items-center justify-between px-5 py-3 bg-black/60 border-b border-white/10 shrink-0'
        >
          <div className='flex items-center gap-2'>
            <i className='ri-box-3-line text-[#c084fc] text-xl'></i>
            <span className='text-white font-bold text-sm'>3D Design Preview</span>
          </div>
          <div className='flex items-center gap-3'>
            <p className='text-white/40 text-xs hidden sm:block'>Drag to rotate · Scroll to zoom · Two-finger to pan</p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className='w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors'
            >
              <i className='ri-close-line text-white text-lg'></i>
            </motion.button>
          </div>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
          onClick={e => e.stopPropagation()}
          className='flex-1 w-full'
        >
          <Canvas
            camera={{ position: [3, 2, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-5, -3, -5]} intensity={0.4} />

            <Suspense fallback={<CanvasLoader />}>
              <Model url={url} />
              <Environment preset='apartment' />
            </Suspense>

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              autoRotate
              autoRotateSpeed={0.6}
              minDistance={0.5}
              maxDistance={30}
            />
          </Canvas>
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          className='flex items-center justify-center gap-4 py-2 bg-black/60 border-t border-white/10 shrink-0 sm:hidden'
        >
          <span className='text-white/40 text-xs'>Drag to rotate</span>
          <span className='text-white/20 text-xs'>·</span>
          <span className='text-white/40 text-xs'>Pinch to zoom</span>
          <span className='text-white/20 text-xs'>·</span>
          <span className='text-white/40 text-xs'>Two-finger pan</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

export default ModelViewer
