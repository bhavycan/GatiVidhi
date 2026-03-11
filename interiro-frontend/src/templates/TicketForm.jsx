import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import Dropdown from "./Dropdown";
import { option } from "motion/react-client";
import CallMessage from "../Portals/CallMessage";

const TicketForm = ({ setTicketOpen ,showPopcard}) => {
  const [ticketData, setTicketData] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const option = ["Low", "Medium", "High"]
const [isclick, setclick] = useState(false)

      const [text,settext] = useState("Medium")
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket submitted:", ticketData);
    // Reset form and close
    setTicketData({ title: "", description: "", priority: "medium" });
    setTicketOpen(false);
  };
  useEffect(()=>{
          setTicketData({ ...ticketData, priority: text })
  },[text])
  return (
    <div className="px-2 py-3">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Title Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-black font-medium mb-2">
            Ticket Title
          </label>
          <input
            type="text"
            value={ticketData.title}
            onChange={(e) =>
              setTicketData({ ...ticketData, title: e.target.value })
            }
            className="w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border-1 border-[#883bbc] rounded-md px-4  py-2 focus:outline-none focus:ring-1 focus:ring-[#883bbc] focus:border-transparent transition-all duration-200"
            placeholder="Enter your ticket title..."
            required
          />
        </motion.div>

        {/* Description Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-black font-medium mb-2">
            Description
          </label>
          <textarea
            value={ticketData.description}
            onChange={(e) =>
              setTicketData({ ...ticketData, description: e.target.value })
            }
            rows="4"
            className="w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border-1 border-[#883bbc] rounded-md px-4  py-2 focus:outline-none focus:ring-1 focus:ring-[#883bbc] focus:border-transparent resize-none transition-all duration-200"
            placeholder="Describe your issue or question in detail..."
            required
          />
        </motion.div>

        {/* Priority Select */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-black font-medium mb-2">
            Priority Level
          </label>
             <motion.div className="dropdown mt-[2%] relative z-50">
                <div onClick={() => setclick(!isclick)}  
             className="w-full text-lg font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border-1 border-[#883bbc] rounded-full px-4  py-2 items-center flex justify-between "><h1>{text}</h1>
                {isclick? <i class="ri-arrow-up-s-line"></i>: <i class="ri-arrow-down-s-line"></i>}
                </div>
                
                <AnimatePresence>
                {isclick && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className='w-[90%] mx-auto backdrop-blur-sm overflow-hidden'
                    >
                        {option.map((item, index) => {
                            return(
                                <motion.h1
                                    key={item}
                                    onClick={() => {settext(item); setclick(false)}}
                                    className='w-full text-lg font-semibold opacity-70 px-2 py-1 border-b-1 border-l-1 border-r-1 border-[#883bbc] cursor-pointer hover:bg-white/10'
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut", delay: index * 0.05 }}
                                >
                                    <i class="ri-arrow-right-s-line"></i>{item}
                                </motion.h1>
                            )
                        })}
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            type="button"
            onClick={() => setTicketOpen(false)}
            className="flex-1  bg-gradient-to-tl from-[#F7D6F3] to-transparent border-1 border-[#883bbc] rounded-md px-4  py-3 transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            layoutId="create-button"
            type="submit"
            className="flex-1 rounded-md px-4  py-3 bg-[#883bbc] text-white font-medium hover:bg-[#9d4bd1] transition-all duration-200 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={()=>showPopcard("Ticket sent", true,2000)}
          >
            <i className="ri-send-plane-fill"></i>
            Submit 
          </motion.button>
        </motion.div>
      </motion.form>


    </div>
  );
};

export default TicketForm;
