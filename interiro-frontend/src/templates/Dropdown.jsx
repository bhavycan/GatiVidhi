import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useState } from 'react'

const Dropdown = ({option, onSelect, placeholder}) => {

const [isclick, setclick] = useState(false)
      const [text,settext] = useState(placeholder || "Short By")

  return (
         <motion.div className="dropdown mt-[2%] relative z-50">
                <div onClick={() => setclick(!isclick)} className="w-full text-lg font-semibold bg-gradient-to-tl from-[#F7D6F3] to-transparent border-1 border-[#883bbc] rounded-full px-4  py-2 items-center flex justify-between "><h1>{text}</h1>
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
                                    onClick={() => {settext(item); setclick(false); onSelect && onSelect(item)}}
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

  )
}

export default Dropdown