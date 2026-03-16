
import { motion } from "motion/react";

const RoomTree = ({ setroomOpen, rooms = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => setroomOpen(false)}
      className="fixed inset-0 z-20 px-4 py-3 bg-gradient-to-t from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 pb-[10%]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        style={{ transformOrigin: "bottom right" }}
        className="w-[90%] h-[40%] px-2 py-5 rounded-lg text-black shadow-current bg-white shadow-lg flex flex-col"
      >
        <div className="title w-full flex items-center gap-3 px-2 shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeatType: "loop", repeat: Infinity, ease: "backInOut" }}
            className="w-4 h-4 bg-green-500 rounded-full shrink-0"
          />
          <h2 className="text-xl font-semibold">Active <span className="inline-block opacity-50">Rooms</span></h2>
        </div>

        <div className="sub-text w-full mt-[2%] pl-[5%] shrink-0">
          <h2 className="w-full opacity-80 text-sm">
            Work is currently going on in the below areas
          </h2>
        </div>

        <div className="w-full mt-[4%] pl-[5%] flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <p className="text-sm opacity-40 font-semibold mt-2">No active rooms at the moment.</p>
          ) : (
            rooms.map((item, index) => (
              <motion.h1
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: index * 0.1, ease: "easeInOut" }}
                className="w-full text-xl font-semibold mt-[2%]"
              >
                - <span className="inline-block bg-[#fecaf6] px-2 py-1">{item}</span>
              </motion.h1>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoomTree;
