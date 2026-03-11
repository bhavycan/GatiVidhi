import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import RoomCore from "./RoomCore";
import RoomTree from "./RoomTree";

const RoomBox = ({ showPopcard }) => {
  const [roomIsOpen, setroomOpen] = useState(false);

  useEffect(() => {
    if (roomIsOpen) {
      showPopcard("room Is opened");
    } else {
      showPopcard("", false);
    }
  }, [roomIsOpen]);

  return (
    <motion.div
      
      className={` 
       first   w-[30%] h-[100%] rounded-lg  `}
    >
      
      <div onClick={() => setroomOpen(true)} className="cursor-pointer flex items-center  flex-col relative justify-center  w-[100%] rounded-lg  overflow-hidden  h-[100%] ">
        <RoomCore />
      </div>
    
      <AnimatePresence mode="wait">
        {roomIsOpen && <RoomTree setroomOpen={setroomOpen} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default RoomBox;
