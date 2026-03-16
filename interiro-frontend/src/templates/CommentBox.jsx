import { AnimatePresence, motion, scale } from 'motion/react'
import { div } from 'motion/react-client'
import React, { useState } from 'react'
import CallMessage from '../Portals/CallMessage'
import { usePopcard } from '../context/PopCardContext'
import axios from 'axios'

const CommentBox = ({isComOpen, setComOpen, isType, setType, commentText, setCommentText}) => {
 const { showPopcard, popcard } = usePopcard();
  const [isMessageOpen, setMessageOpen] = useState(false)

  const textmessage = "Thank You for your valuable feedback! Highly appreciate it."

  const handleSentMessage = async () => {
    if(isType){
      try {
        await axios.post('http://localhost:3000/comment/create', { note: commentText, priorityLevel: 'normal' }, { withCredentials: true })
        setComOpen(false)
        setMessageOpen(true)
        showPopcard("Sent!", true)
        setType(false)
        setCommentText('')
      } catch {
        showPopcard("Something went wrong.", false)
      }
    }
  }


  return (
  <motion.div 
 
 
  
  className='w-[50%] h-full  relative'>



    {!isComOpen && (<motion.div
    
   whileTap={{scale: .9}}
   onClick={()=>{setComOpen(true)}}
      transition={{duration: .2}}
  className='w-[100%] px-2 py-2  bg-[#883bbc] flex items-center justify-center text-white rounded-md h-full '><i className="ri-chat-ai-fill text-2xl"></i></ motion.div>) }

  {isComOpen && (<motion.div
    onClick={handleSentMessage}
   whileTap={{scale: .9}}
      transition={{duration: .2}}
  className={`w-[100%] px-2 py-2  flex items-center justify-center  rounded-md h-full ${isType ? 'bg-[#883bbc] border-1  border-[#883bbc] text-white' : 'border-1  border-[#883bbc] text-[#883bbc]'}`}><i className="ri-send-plane-fill text-2xl"></i></motion.div>)}

<AnimatePresence mode='wait'>
  {isMessageOpen && (<CallMessage message= {{isMessageOpen, setMessageOpen, textmessage, showPopcard}} />)}
</AnimatePresence>
  
  </motion.div> 
  )
}

export default CommentBox