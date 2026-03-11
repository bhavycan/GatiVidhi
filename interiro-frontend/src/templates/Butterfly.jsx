import gsap from 'gsap';
import { MotionPathPlugin, ScrollTrigger } from 'gsap/all';
import { motion } from 'motion/react';
import React, { useEffect } from 'react'

const Butterfly = ({parent, x, y}) => {

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  

    useEffect(()=>{

 const tl = gsap.timeline({
        scrollTrigger:{
                    trigger : parent.current,
                     scroller: parent.current,
                    start : 'top 0%',
                    end: "max",
                    scrub : true,
                    markers: false
        }
    })


//     tl.to(".butterfly", {
//   duration: 6,
//   ease: "power1.inOut",
//   motionPath: {
//     path: [
//       { x: 0, y: -100 },
//       { x: 0, y: 0 },
//       { x: 40, y: 100 },
//       { x: -150, y: 200 },
//       { x: 100, y: 300 },
//       { x: 150, y: 400 },
//       { x: -200, y: 500 },
//       { x: 80, y: 600 }
//     ],
//     curviness: 2,
  
//   },
  
// });


    tl.to(".butterfly", { x: 0, y: -100, rotateY: 180, duration: 2, ease : "power1.inOut" })
  .to(".butterfly", { x: 0, y: 0,  duration: 1 , ease : "power1.inOut"})
   .to(".butterfly", { x: "10%", y: "10%", rotateY: 0, duration: 1 , ease : "power1.inOut"})
  .to(".butterfly", { x: "-100%", y: "100%",rotateY: 180, duration: 1, ease : "power1.inOut" })
  .to(".butterfly", { x: "80%", y: "200%", duration: 1 , ease : "power1.inOut"})
  .to(".butterfly", { x: "90%", y: "250%", rotateY: 0,duration: 1 , ease : "power1.inOut"})
  .to(".butterfly", { x: "-90%", y: "300%", duration: 1 , ease : "power1.inOut"})
   .to(".butterfly", { x: "60%", y: "400%", duration: 1 , ease : "power1.inOut"});

     setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
     return () => {
      tl.kill();
    };

    },[])


  return (
<motion.figure
             style={{ top: `${y}%`, right: `${x}%` }}
           
          className={`butterfly flap w-[30vw] pointer-events-none h-[35vw] absolute  `}>
            <motion.img 
              animate={{ scale: [1, 1.05, 1],
        rotate: [0, 2, 0],}}
         transition={{
        duration: 0.3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop",
      }}
            className='  w-full h-full object-cover ' src="/images/butterfly.png" alt="" />


            
          </motion.figure>
  )
}

export default Butterfly