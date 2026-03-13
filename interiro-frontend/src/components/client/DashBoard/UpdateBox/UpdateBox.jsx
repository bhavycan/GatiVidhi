import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import UpdateCore from "./UpdateCore";
import UpdateTree from "./UpdateTree";

const UpdateBox = ({ showPopcard }) => {
  const [updateisOpen, setUpdateOpen] = useState(false);
  const [updateCount, setUpdateCount] = useState(null);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/update/all", { withCredentials: true });
        const list = data?.updates ?? [];
        setUpdateCount(list.length);
        setUpdates([...list].reverse()); // oldest first (welcome update at top)
      } catch (_) {}
    };
    fetchUpdates();
  }, []);

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
        <UpdateCore updateCount={updateCount} />
      </div>
    
      <AnimatePresence mode="wait">
        {updateisOpen && <UpdateTree setUpdateOpen={setUpdateOpen} updates={updates} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default UpdateBox;
