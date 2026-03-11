import { motion } from 'motion/react'
import React from 'react'

const CustomButtom = ({message}) => {
  
  return (
    
        <motion.div
        // initial={{opacity: 0, scaleY : 0}}
        //         animate={{opacity : 1, scaleY : 1, transformOrigin: "top"}}
        //         transition={{duration : 1, ease : [0.34, 1.56, 0.64, 1]}}
        className='w-full h-[100%] relative z-0 flex items-center flex-col'>
                <motion.div 
                // initial={{opacity: 0, scaleY : 0}}
                // animate={{opacity : 1, scaleY : 1, transformOrigin: "top"}}
                // transition={{duration : 1, ease : [0.34, 1.56, 0.64, 1]}}
                className="lines w-[40%] h-[75%] relative border-l-2 border-r-2 border-black">
                    <div className="circle w-[3vw] h-[3vw] rounded-full absolute -bottom-[3%] -left-[5%] border-2 border-black bg-white"></div>
                    <div className="circle w-[3vw] h-[3vw] rounded-full absolute -bottom-[3%] -right-[5%] border-2 border-black  bg-white"></div>
                </motion.div>
                <motion.button
                //  initial={{opacity: 0, rotateX : -180 , transformOrigin : "top"}}
                // animate={{opacity : 1, rotateX  :0 }}
                // transition={{duration : 1, delay: 1, ease : [0.87, 0, 0.13, 1]}}
                className="rectangle w-[75%] max-h-[100%] min-h-[70%] flex items-end justify-center border-2 border-black bg-white absolute -z-10 top-[35%] pb-[3%]  ">
                   <h2 className='text-xl w-full h-[80%] pt-[2%]   flex items-center justify-center mt-[5%]  font-bold text-[#883bbc]'>{message}</h2>
                </motion.button>
                <motion.div
                // initial={{opacity : 0}}
                // animate={{opacity : 1}}
                // transition={{delay : 1.2, duration: 1}}
                className="rectangle w-[80%] h-[85%] blur bg-[#883bbc] absolute -z-20 top-[35%] ">
                   
                </motion.div>
        </motion.div>
  
  )
}

export default CustomButtom