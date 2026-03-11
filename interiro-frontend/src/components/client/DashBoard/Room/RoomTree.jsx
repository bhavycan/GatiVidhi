
import { AnimatePresence, motion } from "motion/react";
import { div, h1 } from "motion/react-client";
import { useState } from "react";
const RoomTree = ({ setroomOpen }) => {

const opWork = ["BedRoom", "BathRoom", "Hall", "BathRoom", "BathRoom", "BathRoom"]

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => {setroomOpen(false)}}
      className="fixed inset-0 z-20 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
    >
      
      <motion.div
        initial={{ opacity: 0 , scale : 0, y : 50 }}
        animate={{ opacity: 1, scale : 1, y : 0 }}
        exit={{ opacity: 0, scale : 0, y : 50 }}
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: "bottom right" }}
        className="w-[90%] h-[40%] px-2 py-5 rounded-lg text-black shadow-current bg-white shadow-lg"
      >
        <div className="title w-full h-[10%] flex items-center justify-center">
          <div className="dot w-[15%] h-full flex items-center justify-center">
<motion.div
initial={{opacity: 0}}
animate={{opacity: 1}}
transition={{duration: 1, repeatType : "loop", repeat: Infinity, ease: "backInOut"}}
className="w-[5vw] h-[5vw] bg-green-500 rounded-full "></motion.div>

          </div>
          <div className="w-[85%] h-full flex items-center">
            <h2 className="text-xl font-semibold">Active <span className="inline-block opacity-50">Room</span></h2>
          </div>
        </div>

        <div className="sub-text w-full mt-[2%] pl-[5%]">
          <h2 className="w-[100%] opacity-80">Work of  <span className="inline-block text-lg text-black font-semibold">Lightning</span> is going on the below parts of house </h2>

        </div>

        <div className={`w-full mt-[5%]  pl-[5%] h-[60%]  overflow-y-scroll `}>
          {opWork.map((item,index)=>{
            return(
              <motion.h1 
              initial={{opacity: 0, x: 50}}
              whileInView={{opacity : 1, x : 0}}
              viewport={{once: true}}
              transition={{duration: .2, delay: index*.1, ease : "easeInOut"}}
              className="w-full text-xl  font-semibold mt-[2%]">- <span className="inline-block bg-[#fecaf6]  px-2 py-1">{item}</span></motion.h1>
            )
          })}
        </div>
      
      </motion.div>
    </motion.div>

  );
};

export default RoomTree;
