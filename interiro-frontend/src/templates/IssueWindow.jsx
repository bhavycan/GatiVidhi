import moment from 'moment'
import { AnimatePresence, motion } from 'motion/react'
import React, { use, useEffect, useRef, useState } from 'react'
import CallMessage from '../Portals/CallMessage';
import { usePopcard } from '../context/PopCardContext';

const IssueWindow = () => {

  const { showPopcard, popcard } = usePopcard();
  const box = useRef(null);
  const [istype, setIstype] = useState("")
  const [isSent, setIsSent] = useState(false)
  const [isMessageOpen, setMessageOpen] = useState(false)
  const textmessage = "Thank You for your valuable feedback! You can expect a call from us in 24 hours."
  const handleType = (text) => {
    setIstype(text)
  }

  const handleSentMessage = () => {
    setIsSent(true)
    setIstype("")
    setMessageOpen(true)
    showPopcard( "Sent!", true)

  }

  useEffect(()=>{
    const input = box.current;
  if (!input) return;

  const handleFocus = () => {
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  input.addEventListener("focus", handleFocus);
  return () => input.removeEventListener("focus", handleFocus);
  },[istype])

  
  return (
    <div className='w-full backdrop-blur-md border-1 px-3 py-2 border-[#883bbc] mb-[10%] rounded-md overflow-hidden'>
        <div ref={box} className="textarea">
            <form action="" method='post' onSubmit={(e)=>e.preventDefault()}>
                <textarea name="issue" id="issue" value={istype} placeholder='Type Your Issue Here...' className='w-full h-[20vh]   decoration-none outline-none  text-md font-semibold' onChange={(e)=>handleType(e.target.value)}></textarea>
            </form>
        </div>


        <motion.div className='w-full  overflow-hidden max-h-[5.7vh] mb-[2%]'>
        <AnimatePresence mode='wait'>
        {!(istype?.length > 2 ) &&   <motion.h4
        initial={{opacity: 0 , x: -50}}
      animate={{opacity : 1, x: 0}}
      transition={{duration : .5, ease : [0.34, 1.56, 0.64, 1]}}
      exit={{opacity : 0, x: 50}}
        className='text-black h-[5.7vh] text-[2vh]   font-bold'>
          
          {isSent ? `Your issue has been sent to our team at ${moment().format('LL')}` : "You can also ask our chatBot for update related Questions"}
          
          </motion.h4> }

          </AnimatePresence>



          <AnimatePresence mode='wait'>
        {(istype?.length > 2) &&  <motion.div
    onClick={handleSentMessage}
   whileTap={{scale: .9, transition : {duration: .2}}}
      
      initial={{opacity: 0 , x: -50}}
      animate={{opacity : 1, x: 0}}
      transition={{duration : .5, delay : .5, ease : [0.34, 1.56, 0.64, 1]}}
      exit={{opacity : 0, x: 50, transition : {duration: .2}}}
  className='w-[50%] px-2 py-2 h-[5.7vh] bg-[#883bbc] flex items-center justify-center text-white rounded-md '><i className="ri-send-plane-fill text-2xl"></i></motion.div>}

</AnimatePresence>
 




        </motion.div>


        
 <AnimatePresence mode='wait'>
  {isMessageOpen && (<CallMessage message={{isMessageOpen, setMessageOpen, textmessage, showPopcard}} />)}
</AnimatePresence>
    </div>
  )
}

export default IssueWindow