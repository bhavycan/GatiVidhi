import { AnimatePresence, motion } from 'motion/react';
import { div } from 'motion/react-client';
import React, { use, useEffect, useRef, useState } from 'react'
import { usePopcard } from '../context/PopCardContext';

const Share = () => {
 const { showPopcard, popcard } = usePopcard();

    const media = ['/images/logos/whatshapp.png','/images/logos/facebook.png','/images/logos/x.png','/images/logos/copy.png']
    const [isShareOpen, setShareOpen] = useState(false);

      const shareData = {
    title: 'Awesome Component!',
    text: 'Check out this cool info from my component.',
    url: 'http://localhost:5173/user/login'
  };

  const handleDrag = (e,info) =>{

    if(Math.abs(info.offset.y) > Math.abs(info.offset.x)) {
    if(info.offset.y > 5){
        setShareOpen(false)
    }
  }
  }


    useEffect(()=>{
      
        if(isShareOpen){
            showPopcard("Share")
        }else{
            showPopcard("",false)
        }



        
         return () => {
    // when component unmounts
    showPopcard("", false);
    console.log("cleanup: force closing popcard");
  };

    },[isShareOpen])
    

 
  return (
 <>
       <button onClick={()=>setShareOpen(true)} className='w-[50%] px-2 py-2 bg-[#883bbc] text-white rounded-md h-full '><i className="ri-share-fill text-2xl"></i></button>

<AnimatePresence>
 {isShareOpen && (
        <motion.div
        initial={{opacity : 0}}
        animate={{opacity: 1}}
        exit={{opacity : 0}}
        onClick={() => {setShareOpen(false)}}
        transition={{duration: .2, ease: "easeInOut"}}
        className='fixed inset-0 z-10 px-4  bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center items-end bg-opacity-90 '>
            <motion.div 
            initial={{y: 100}}
            animate={{y: 0}}
            drag="y"
            dragConstraints={{ top: 0, left : 0, right : 0, bottom : 250 }}
          
            dragElastic= {0}
            onDragEnd={(e,info)=> handleDrag(e,info)}
          
                exit={{ y: 100 }}
                
             onClick={(e) => e.stopPropagation()} 
            transition={{duration : .2, ease: "easeInOut"}}
            className="share-box w-[100%] px-4 py-5 h-[25%]  pb-[2%]   border-t-2  border-l-2 border-r-2 border-[#883bbc]   backdrop-blur-sm rounded-t-4xl">
                <div className="title w-full h-[50%]  pb-[5%] border-b-2 border-white font-semibold "><h1 className='text-4xl'>Share <span className='inline-block text-white'>It</span>.</h1>
                <h3 className='opacity-80 font-bold'>share this with your loved ones!</h3>
                </div>

                <div className="div w-full border-1 border-white h-[40%] mt-[5%] rounded-md flex items-center justify-between px-2 py-2
                  ">

                    {media.map((item,index)=>{

                        return (
                             <div className="w-[23%] h-full rounded-md overflow-hidden ">
                              <img className='w-full h-full object-contain ' src={item}></img>
                             </div>
                        )

                    })}
                 
                    
                  </div>
              

                
            </motion.div>
            
        </motion.div>
      )}
      </AnimatePresence>

      </>
  )
}

export default Share