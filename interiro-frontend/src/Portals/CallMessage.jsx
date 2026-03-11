import { motion } from 'motion/react'
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

const CallMessage = ({message}) => {

    const {isMessageOpen, setMessageOpen, textmessage, showPopcard} = message


    useEffect(()=>{
        if(isMessageOpen){
            const timer = setTimeout(()=>{
                setMessageOpen(false)
                showPopcard( "Sent!", false)
            },2000)

            return ()=>clearTimeout(timer)
        }
    },[isMessageOpen])
   
    
  return createPortal(
    <motion.div
    initial={{ opacity: 0,  }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={()=>{setMessageOpen(false), showPopcard( "Sent!", false)}}
    transition={{ duration: .5 }}
    className="fixed inset-0 z-50 px-2 w-screen h-screen  bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
  >
    <motion.div
     initial={{ opacity: 0, scale : 0 , y : 50 }}
    animate={{ opacity: 1 , rotate : 0, scale : 1, y : 0, ease : [0.34, 1.56, 0.64, 1]}}
    exit={{ opacity: 0 , scale : 0 , y : 50}}
    transition={ {duration : .5, ease : [0.25, 1, 0.5, 1]}}
    style={{ transformOrigin: "bottom center" }}
    onClick={(e)=> e.stopPropagation()}
    className="w-[90%] h-[10%] rounded-full px-3 py-3 flex items-center justify-center text-black shadow-current backdrop-blur-sm shadow-lg overflow-hidden bg-gradient-to-bl from-white to-transparent ">
        <h2 className='text-md w-full h-full font-semibold opacity-80 flex items-center justify-center text-center'>{textmessage}</h2>
      
    </motion.div>
  </motion.div>,
  document.body

  )
}

export default CallMessage