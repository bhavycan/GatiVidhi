import { useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'

const ImagePickerSheet = ({ open, onClose, onChange, multiple = false }) => {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  const handleChange = (e) => {
    onChange(e)
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <input
            ref={cameraRef}
            type='file'
            accept='image/*'
            capture='environment'
            className='hidden'
            onChange={handleChange}
          />
          <input
            ref={galleryRef}
            type='file'
            accept='image/*'
            multiple={multiple}
            className='hidden'
            onChange={handleChange}
          />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 z-50'
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6 pb-10'
          >
            <div className='w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5' />
            <p className='text-center font-semibold text-gray-700 mb-5'>Add Photo</p>
            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => cameraRef.current?.click()}
                className='flex flex-col items-center gap-2 py-5 rounded-xl bg-[#F7D6F3] text-[#883bbc] font-semibold active:scale-95 transition-transform'
              >
                <i className='ri-camera-line text-3xl' />
                <span>Camera</span>
              </button>
              <button
                type='button'
                onClick={() => galleryRef.current?.click()}
                className='flex flex-col items-center gap-2 py-5 rounded-xl bg-gray-100 text-gray-700 font-semibold active:scale-95 transition-transform'
              >
                <i className='ri-image-line text-3xl' />
                <span>Gallery</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default ImagePickerSheet
