import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'

const CommentBox = ({ update }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    const state = update
      ? {
          update: {
            updateId: update._id,
            date: update.createdAt
              ? new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : '',
            workDone: update.workDone || '',
          },
        }
      : {}
    navigate('/user/support', { state })
  }

  return (
    <motion.div className='w-[50%] h-full relative'>
      <motion.div
        whileTap={{ scale: .9 }}
        onClick={handleClick}
        transition={{ duration: .2 }}
        className='w-[100%] px-2 py-2 bg-[#883bbc] flex items-center justify-center text-white rounded-md h-full cursor-pointer'
      >
        <i className="ri-chat-ai-fill text-2xl"></i>
      </motion.div>
    </motion.div>
  )
}

export default CommentBox
