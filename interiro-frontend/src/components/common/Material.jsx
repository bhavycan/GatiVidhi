import { AnimatePresence, easeInOut, motion } from "motion/react";
import { div } from "motion/react-client";
import React, { useState } from "react";

const Material = () => {
  const [isOpen, setOpen] = useState(false);
  const progressCompanies = [
    { step: "Layout", company: "Structura Designs Ltd." },
    { step: "PopChannel", company: "Nova POP Creations" },
    { step: "Electrification", company: "VoltMax Solutions" },
    { step: "Ceiling", company: "Skyline Interiors Co." },
    { step: "Furniture", company: "Oak & Steel Furnishings" },
    { step: "Laminate", company: "Prime Laminates Inc." },
    { step: "Paint", company: "ColorWave Paintworks" },
    { step: "Lights", company: "LumoBright Electricals" },
    { step: "Cleaning", company: "FreshNest Services" },
    { step: "HandOver", company: "FinalTouch Constructions" },
  ];

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
                {progressCompanies.map((item, index) => {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="w-full h-[10vh] px-2 py-2 mb-[3%] flex flex-col justify-center bg-gradient-to-br from-[#F7D6F3] to-transparent rounded-md"
                    >
                      <h2 className="w-full text-lg font-bold  ">
                        {item.step}
                      </h2>
                      <h1 className="w-full text-xl font-semibold opacity-50 ">
                        {item.company}
                      </h1>
                    </motion.div>
                  );
                })}
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
                  {" "}
                  we are using this material for this project. Click to see that
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
