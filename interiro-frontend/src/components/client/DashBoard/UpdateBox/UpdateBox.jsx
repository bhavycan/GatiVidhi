import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import UpdateCore from "./UpdateCore";
import UpdateTree from "./UpdateTree";

const UpdateBox = ({ showPopcard }) => {
  const [updateisOpen, setUpdateOpen] = useState(false);

  useEffect(() => {
    
    if (updateisOpen) {
      showPopcard("Update Card Opened");

   
    }else{
      showPopcard("",false)
    }
  }, [updateisOpen]);

  return (
    <motion.div
      
      className={` 
       first   w-[30%] h-[100%] rounded-lg  `}
    >
      
      <div onClick={() => setUpdateOpen(true)} className="cursor-pointer flex items-center  flex-col relative justify-center  w-[100%] rounded-lg  overflow-hidden  h-[100%] ">
        <UpdateCore />
      </div>
    
      <AnimatePresence mode="wait">
        {updateisOpen && <UpdateTree setUpdateOpen={setUpdateOpen} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default UpdateBox;
