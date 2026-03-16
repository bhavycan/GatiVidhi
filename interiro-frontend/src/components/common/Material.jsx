import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Material = () => {
  const [isOpen, setOpen] = useState(false);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/material/client", { withCredentials: true })
      .then(({ data }) => setMaterials(data.materials || []))
      .catch(console.error);
  }, []);

  return (
    <motion.div layout>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "backInOut" }}
          key="on-screen"
          onClick={() => setOpen(true)}
          className="on-screen border-2 border-[#883bbc] rounded-md overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="backdrop-blur-sm px-2 py-3"
              >
                {materials.length === 0 ? (
                  <p className="text-sm font-semibold opacity-50 px-2 py-3">No materials added yet.</p>
                ) : (
                  materials.map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="w-full h-[10vh] px-2 py-2 mb-[3%] flex flex-col justify-center bg-gradient-to-br from-[#F7D6F3] to-transparent rounded-md"
                    >
                      <h2 className="w-full text-lg font-bold">{item.label}</h2>
                      <h1 className="w-full text-xl font-semibold opacity-50">{item.materialName}</h1>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="backdrop-blur-sm px-2 py-3 font-semibold"
                >
                  We are using this material for this project. Click to see that
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Material;
