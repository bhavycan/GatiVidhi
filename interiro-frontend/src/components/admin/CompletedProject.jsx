import moment from 'moment';
import React, { useRef, useState } from 'react'
import Butterfly from '../../templates/Butterfly';
import AdminNavbar from '../../templates/AdminNavbar';
import { AnimatePresence, motion } from 'motion/react';

const CompletedProject = () => {

    const text= "Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum velit soluta explicabo deleniti enim ofreg ficiis eergergos nisi auregergtem molergregstias quregertgergergergod?"
      const trimmedText = text.length > 30 ? text.slice(0, 20) + '...' : text;
      const date = moment().format('LL')
      const parent = useRef(null)
      const [isopen, setOpen] = useState(false)
  return (
  <div className='w-screen h-[100vh] relative overflow-hidden'>

      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="admin-menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <AdminNavbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

            <section className='overflow-hidden -z-10 '>
          <figure className='w-screen h-full absolute'>
            <img className='w-full h-full object-cover' src="/images/background.png" alt="" />
          </figure>
          <Butterfly parent={parent} x={5} y={0} />
 <figure className='w-[25vw] h-[30vw] absolute bottom-[2%] left-[10%]'>
            <img className='w-full h-full object-cover ' src="/images/butterfly2.png" alt="" />
          </figure>

        </section>
        <main className='w-full h-full px-[8%] py-[6%] relative'>
      
        <header>
            <div className="title w-full text-6xl font-semibold tracking-tight mt-[6%]  h-[20%] flex  ">
               
                <h1 className='h-full text-white'>Completed</h1>
            </div>
            <div className="subtitle w-[100%] mt-[1] pb-[6%] font-semibold text-md opacity-70 leading-5  pl-[2%] border-b-2 border-white">
                <h4 className='w-[65%]'>Projects executed sucessfully</h4>
            </div>
        </header>

        <section ref={parent} className='w-full max-h-[80%] flex  flex-col gap-[%] items-center overflow-y-auto mt-[5%]'>

            {Array.from({length: 6}).map((item,index)=>{
                return(  <div className='card h-[70%] w-full flex-shrink-0 rounded-2xl shadow-2xl shadow-[#883bbc]  bg-gradient-to-t backdrop-blur-lg mb-[10%]  from-white to-transparent  px-[5%] py-[4%]'>
                <figure className='w-full h-[60vw] rounded-2xl overflow-hidden'>
                    <img className='w-full h-full object-cover' src="https://images.unsplash.com/photo-1558981082-c7d43331cd8c?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                </figure>
                <div className="name w-full h-[10%] mt-[3%] text-4xl font-bold text-black flex items-center"><h1>Malabar Exotica</h1></div>
                <div className="sub-text w-full  mt-[2%] text-md  h-[20%]">
                    <h4 className='leading-5'>{text.length > 150 ? text.slice(0, 150) + "..." : text}</h4>
                </div>
                <div className="date w-full mt-[2%] h-[20%]">
                    <h2 className='text-xl font-semibold text-zinc-400  w-full'>Estimated Finishing Date</h2>
                     <div className="date flex items-center mt-[2%] w-[100%] gap-[5%]">
                        <div className="icon w-[12vw] h-[12vw] rounded-full bg-[#883bbc] items-center justify-center flex">
                                <i className="ri-calendar-2-line text-3xl  text-white opacity-90 "></i>
                            
                        </div>
                        <div className="date text-xl leading-5 w-[50%] font-bold ">

                           
                                <h4>{date}</h4>
                            
                        </div>
                    </div>
                </div>
            </div>)
            })}
          
        </section>
        </main>
    </div>
  )
}

export default CompletedProject