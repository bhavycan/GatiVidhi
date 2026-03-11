import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import axios from "axios";

const TicketForm = ({ setTicketOpen, showPopcard, onSubmitSuccess }) => {
  const [note, setNote] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("medium");
  const [isclick, setclick] = useState(false);
  const [loading, setLoading] = useState(false);

  const options = ["low", "medium", "high"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim() || note.trim().length < 3) {
      showPopcard("Note must be at least 3 characters", true, 2000);
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/comment/create",
        { note: note.trim(), priorityLevel },
        { withCredentials: true }
      );
      setNote("");
      setPriorityLevel("medium");
      setTicketOpen(false);
      showPopcard("Ticket submitted!", true, 2000);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error(error);
      showPopcard("Failed to submit ticket.", true, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 py-3">
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Note Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-black font-medium mb-2">
            Note / Issue Description
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="4"
            className="w-full bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#883bbc] focus:border-transparent resize-none transition-all duration-200 text-sm font-semibold placeholder:opacity-50"
            placeholder="Describe your issue or question in detail..."
            required
          />
        </motion.div>

        {/* Priority Select */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-black font-medium mb-2">
            Priority Level
          </label>
          <motion.div className="dropdown mt-[2%] relative z-50">
            <div
              onClick={() => setclick(!isclick)}
              className="w-full text-base font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-full px-4 py-2 items-center flex justify-between cursor-pointer"
            >
              <h1 className="capitalize">{priorityLevel}</h1>
              <motion.i
                animate={{ rotate: isclick ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ri-arrow-down-s-line"
              />
            </div>

            <AnimatePresence>
              {isclick && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full backdrop-blur-sm overflow-hidden rounded-b-lg border border-t-0 border-[#883bbc] bg-white/60"
                >
                  {options.map((item, index) => (
                    <motion.div
                      key={item}
                      onClick={() => { setPriorityLevel(item); setclick(false); }}
                      className="w-full px-4 py-2 cursor-pointer hover:bg-white/40 border-b border-[#883bbc]/30 last:border-0 font-semibold capitalize"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.2 }}
                    >
                      <i className="ri-arrow-right-s-line"></i>{item}
                    </motion.div>
                  ))}
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
          transition={{ delay: 0.7 }}
        >
          <button
            type="button"
            onClick={() => setTicketOpen(false)}
            className="flex-1 bg-gradient-to-tl from-[#F7D6F3] to-transparent border border-[#883bbc] rounded-md px-4 py-3 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            layoutId="create-button"
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md px-4 py-3 bg-[#883bbc] text-white font-medium hover:bg-[#9d4bd1] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading
              ? <i className="ri-loader-4-line animate-spin text-xl"></i>
              : <><i className="ri-send-plane-fill"></i><span>Submit</span></>
            }
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default TicketForm;
