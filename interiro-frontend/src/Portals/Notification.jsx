import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Notification = ({ state }) => {
  
  const { isNotification, setNotification } = state;
  const [notiarray, setnotiarray] = useState(["Alice", "Brandon", "Carlos", "Diana", "Ethan", "Fatima", "George"])
 


  useEffect(()=>{
    if(notiarray.length == 0){
     const timer = setTimeout(()=>{setNotification(false)},2000)
     return ()=> clearTimeout(timer)
    }
  },[notiarray])


const [clearing, setClearing] = useState(false);

const handleClear = () => {
  setClearing(true); // initiate exit animations
  setNotification(false)
};
  

const handleMainDrag = (e,info) =>{
  if(info.offset.y < -10 && (Math.abs(info.offset.x) < Math.abs(info.offset.y))){
    setNotification(false)
  }
}

const handleDragEnd = (index, info) => {
  if (info.offset.x > 10 && (info.offset.x > info.offset.y)) {
    setnotiarray(prev => prev.filter((_, i) => i !== index));
    console.log(notiarray)
  }
};



    const date = moment().format('LL');
        const day =  moment().format('dddd');

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setNotification(false)}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50  w-screen h-screen  bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center item-start bg-opacity-90 pb-[10%]"
    >
        
 <motion.div
        drag='y'
        dragConstraints={{top:-100, bottom : 0}}
        dragDirectionLock
        dragElastic={0.1}
        onDragEnd={(e,info)=>{handleMainDrag(e,info)}}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full   max-h-fit pt-[10%] rounded-lg px-3 py-3 backdrop-blur-lg"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeIn" }}
          className="title w-full  pb-[5%]  border-b-2 border-white font-semibold "
        >
          <h1 className="text-4xl">
            Daily <span className="inline-block text-white">Notification</span>.
          </h1>
          <h3 className="opacity-80 font-bold">Find out what's new!</h3>
          <div className="date flex mt-[2%]   items-center w-[50%] gap-[5%]">
                        <div className="icon w-[12vw] h-[12vw] rounded-full bg-[#883bbc] items-center justify-center flex">
                                <i className="ri-calendar-2-line text-3xl  text-white opacity-90 "></i>
                            
                        </div>
                        <div className="date leading-5 w-[70%] font-bold ">

                           
                                <h4>{date}</h4>
                            <h4>{day}</h4>
                        </div>
                    </div>
        </motion.div>

        
          {!clearing &&  <motion.div
        layout
      
       
        className="noti-conatiner w-full  mt-[2%] ">
             <motion.div className="noti-area w-full   overflow-y-scroll max-h-[30vh]  ">
         <AnimatePresence
  mode="wait"
  onExitComplete={() => {
    if (clearing) {
      setClearing(false);
      setNotification(false);
      setnotiarray([]);
    }
  }} >

  

{notiarray.length > 0 &&

      
      (!clearing ? notiarray : []).map((item, index) => (

        <AnimatePresence mode="wait">
  <motion.div
    key={item}
    initial={{ scale: 0.8, y: 50, opacity: .8 }}
    drag
    dragDirectionLock
    dragConstraints={{top : 0, left : 0, right : 100, bottom : 0}}
        id={index}
   onDragEnd={(e,info)=>{handleDragEnd(index,info)} }
    whileInView={{ scale: 1, y: 0, opacity: 1}}
    exit={{ opacity: 0, x: 100, transition: { delay: index * 0.1, duration: 0.2 } }}
    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    className="w-full mb-[2%] px-2 py-3 h-[10vh] rounded-lg bg-white/50"
  >

    {item}
  </motion.div>
  </AnimatePresence>
))
      }
    
          </AnimatePresence>
        </motion.div>

      
      
       {notiarray.length > 0 ? <div className="w-full h-[6vh] mt-[5%] flex items-center justify-end">
   <motion.div
          onClick={handleClear}
           whileTap={{scale: .9, opacity : 0,}}
              transition={{duration: .2}}
          className={`w-[50%]  flex items-center justify-center  rounded-md h-full bg-[#883bbc]  text-white `}><h2 className=" text-xl">clear</h2></motion.div>
</div> : <div
className="w-full h-[7%] mt-[5%] font-semibold text-2xl opacity-80 text-white flex items-center justify-center"> <h2>No Updates For you</h2></div>}

        </motion.div>  }
       
       

     
       


       
      </motion.div>

     
    
     
    </motion.div>,
    document.body
  );
};

export default Notification;
