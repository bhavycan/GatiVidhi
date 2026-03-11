import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react'
import { usePopcard } from '../context/PopCardContext';
import { h1 } from 'motion/react-client';

const TickitInfo = ({setTicketDetail,openTicketDetail,ticketData}) => {

    const { showPopcard, popcard } = usePopcard();
    const [isreminder, setReminder] = useState(false)
    const [reminderClick, setReminderClick] = useState(false)
        const media = ['/images/logos/whatshapp.png','/images/logos/facebook.png','/images/logos/x.png','/images/logos/copy.png']
        const [isTicketOpen, setTicketOpen] = useState(true);
    

    useEffect(()=>{
                   
           const date1 = new Date(ticketData.date);
const date2 = new Date();
                const diffTime = date2 - date1; // in ms
const diffDays = diffTime / (1000 * 60 * 60 * 24);
console.log(diffDays)
if(diffDays > 2){
setReminder(true);

}






        
    },[ticketData])



    useEffect(()=>{
if(reminderClick){
const timer = setTimeout(()=>{
    setReminderClick(false)
    console.log("tiomer done")
},2000)

return() => clearTimeout(timer)

}
    },[reminderClick])
     
         
    
      const handleDrag = (e,info) =>{
    
        if(Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
        if(info.offset.y > 5){
            setTicketOpen(false);
            setTicketDetail(false)
        }
      }
      }
    
    
      useEffect(()=>{
  console.log("Effect triggered with:", { isTicketOpen, openTicketDetail });
  
  if (isTicketOpen && openTicketDetail ){
    console.log("Running open branch");
    showPopcard("Ticket");
  } else {
    console.log("Running close branch");
    showPopcard("", false);
  }


    return () => {
    // when component unmounts
    showPopcard("", false);
    console.log("cleanup: force closing popcard");
  };
}, [isTicketOpen, openTicketDetail]);


         
        
    
     
  return (
    <>
      

<AnimatePresence>
 {isTicketOpen && (
        <motion.div
        initial={{opacity : 0}}
        animate={{opacity: 1}}
        exit={{opacity : 0}}
        onClick={() => {setTicketOpen(false),setTicketDetail(false)}}
        transition={{duration: .2, ease: "easeInOut"}}
        className='fixed inset-0 z-10 px-4  bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 backdrop-blur-xs '>

<AnimatePresence>
{reminderClick && (  <div className="div absolute top-[20%] w-full flex items-center justify-center  h-[20%] ">
                <motion.div
                initial={{scale: 0, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                exit={{scale: 1.2, opacity: 0}}
                transition={{duration: .5, ease: "easeInOut"}}
                className='w-[45vw] h-[45vw] backdrop-blur-md  flex flex-col items-center justify-center rounded-full bg-white'>
                       <motion.svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width=".6" stroke="currentColor" className="size-20 text-[#883bbc]">
  <motion.path
  initial={{pathLength : 0, opacity: 0}}
whileInView={{pathLength : 1, opacity: 1}}
transition={{duration: 2, ease : "backInOut"}}
  stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
</motion.svg>
<motion.h1

>Reminder Sent!</motion.h1>
                </motion.div>
             

            </div>)}
          </AnimatePresence>

            <motion.div 
            initial={{y: 100}}
            animate={{y: 0}}
            drag="y"
            dragConstraints={{ top: 0, left : 0, right : 0, bottom : 250 }}
          
            dragElastic= {0}
            onDragEnd={(e,info)=> handleDrag(e,info)}
          
                exit={{ y: 100 }}
                
             onClick={(e) => e.stopPropagation()} 
            transition={{duration : .2, ease: "easeInOut"}}
            className="Ticket-box w-[100%] px-4 py-5 h-[50%]     border-t-2  border-l-2 border-r-2 border-[#883bbc]   backdrop-blur-sm rounded-t-4xl">
                <div className="title w-full  pb-[5%]  border-b-2 border-white font-semibold "><h1 className='text-4xl'>Your <span className='inline-block text-white'>Ticket</span>.</h1>
                <h3  className='opacity-80 mt-[2%] font-bold'>This Ticket is Generated On {ticketData.date}</h3>
                </div>


 <div className="w-full py-2 mt-[2%] font-bold text-xl"><h1>{ticketData.title}</h1></div>

                <div className="div w-full border-1 border-white min-h-[50%] mt-[1%] rounded-md  px-2 py-2
                  ">

                   
                    <p>{ticketData.description}</p>
                 
                    
                  </div>
              


{ !ticketData.active ? <div className='mt-[4%] rounded-md text-white bg-[#883bbc] px-2 py-2 w-full items-center flex text-xl font-semibold justify-center '>Resolved</div> : 


isreminder ? <motion.div whileTap={{scale: .8}} transition={{duration: .2}} layoutId='remind-button' onClick={()=>{setReminderClick(true), setReminder(false)}} className='mt-[4%] rounded-md text-white bg-[#883bbc] px-2 py-2 w-full items-center flex text-xl font-semibold justify-center '>Remind

</motion.div> : 

<motion.div className='mt-[4%] rounded-md text-white bg-[#883bbc] px-2 py-2 w-full items-center flex text-xl font-semibold justify-center '>Active</motion.div>}
                
            </motion.div>
            
        </motion.div>
      )}
      </AnimatePresence>

      </>
  )
}

export default TickitInfo