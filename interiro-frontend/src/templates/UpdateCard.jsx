import React, { useEffect, useState } from 'react'
import Share from './Share';
import CommentBox from './CommentBox';
import { AnimatePresence, motion } from 'motion/react';
import ImagePortal from '../Portals/ImagePortal';
import 'photoswipe/style.css';


const UpdateCard = ({ update }) => {

  const images = (update?.images && update.images.length > 0)
    ? update.images
    : [
        'https://images.unsplash.com/photo-1629746958979-08060ed5bf0b?q=80&w=1170&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1626367771676-96d7bf35953f?q=80&w=1170&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1636071659185-5e2b6596a42c?q=80&w=1246&auto=format&fit=crop',
      ]

  const dateLabel = update?.createdAt
    ? new Date(update.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'No updates yet'

  const [isclick, setclick] = useState(0)
  const [tapNumber, setTapNumber] = useState(0)
  const [isComOpen, setComOpen] = useState(false)

  const handleClick = () => {
    setclick((prev) => (prev + 1) % images.length);
  };

  const [isType, setType] = useState(false)
  const [isTap, setTap] = useState(false)

  const handleChange = (text) => {
    if(text.length > 2){
      setType(true)
    }else{
      setType(false)
    }
  }

  const handleTap = (isclick) => {
    setTap(true)
    setTapNumber(isclick)
  }

  useEffect(() => {
    if(!isTap){
      const interval = setInterval(() => {
        setclick((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  },[isTap])


  return (
    <motion.div className='w-full h-auto relative rounded-lg bg-gradient-to-r from-[#f7d6f3] to-transparent px-2 py-3'>

      {/* Date header */}
      <div className="date-title w-full">
        <div className="date flex items-center mt-[2%] w-full gap-4">
          <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0">
            <i className="ri-megaphone-fill text-2xl text-white opacity-90"></i>
          </div>
          <div className="date text-xl leading-5 font-bold">
            <h4>{dateLabel}</h4>
          </div>
        </div>
      </div>

      {/* Image carousel */}
      <div className='w-full mt-[5%] z-0 relative'>
        <div className="button w-12 h-12 bg-gradient-to-br from-white to-transparent z-10 top-[40%] right-2 border border-[#883bbc] rounded-full absolute">
          <button onClick={handleClick} className='w-full h-full flex items-center justify-center'>
            <i className="ri-arrow-right-s-line text-3xl text-[#883bbc]"></i>
          </button>
        </div>

        <motion.div className='w-full h-56 md:h-72 lg:h-80'>
          {!isTap && <motion.figure className='w-full h-full'>
            <AnimatePresence mode='wait'>
              <motion.img
                key={isclick}
                initial={{ opacity: 0, x: -150, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 150, scale: 0.8}}
                onTap={() => handleTap(isclick)}
                transition={{ duration: .5, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full border border-white shadow-2xl shadow-[#39393a] relative rounded-2xl overflow-hidden object-cover"
                src={images[isclick]}
                alt=""
              />
            </AnimatePresence>
          </motion.figure>}

          <AnimatePresence mode='wait'>
            {isTap && <ImagePortal tapNumber={tapNumber} setTap={setTap} />}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Work Done */}
      <div className="wortk-title w-full mt-[10%]">
        <div className="workdone flex items-center mt-[2%] w-full gap-4">
          <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-white to-transparent items-center justify-center flex border border-[#883bbc] shrink-0">
            <i className="ri-check-double-line text-2xl text-[#883bbc] opacity-90"></i>
          </div>
          <div className="date text-xl leading-5 font-bold">
            <h4>Work Done</h4>
          </div>
        </div>
        <article className='w-full text-md font-semibold leading-5 mt-[2%]'>
          {update?.workDone || 'No details provided.'}
        </article>
      </div>

      {/* Work Left */}
      <div className="wortk-title w-full mt-[5%]">
        <div className="workdone flex items-center mt-[2%] w-full gap-4">
          <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-white to-transparent items-center justify-center flex border border-[#883bbc] shrink-0">
            <i className="ri-time-fill text-2xl text-[#883bbc] opacity-90"></i>
          </div>
          <div className="date text-xl leading-5 font-bold">
            <h4>Work Left</h4>
          </div>
        </div>
        <article className='w-full text-md font-semibold leading-5 mt-[2%]'>
          {update?.workLeft || 'No details provided.'}
        </article>
      </div>

      {/* Actions */}
      <motion.div className='w-full mt-[4%] font-semibold text-lg'>
        <div className='w-full flex items-center gap-2 justify-center h-full'>
          <Share update={update} />
          <CommentBox isType={isType} isComOpen={isComOpen} setComOpen={setComOpen} setType={setType} />
        </div>

        <AnimatePresence mode='wait'>
          {isComOpen && (<motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 500, opacity: 1, scaleY: 1 }}
            exit={{
              maxHeight: 0, opacity: 0, scaleY: 0,
              transition: {
                maxHeight: { duration: 0.25, ease: [0.4, 0, 1, 1] },
                opacity: { duration: 0.15, ease: [0.4, 0, 1, 1] }
              }
            }}
            transition={{
              maxHeight: { duration: 0.25, ease: [0.215, 0.61, 0.355, 1] },
              opacity: { duration: 0.25 }
            }}
            style={{ overflow: 'hidden', transformOrigin: "top" }}
            className='w-full border-[#883bbc] border mt-[2%] rounded-lg backdrop-blur-lg px-3 py-2'>
            <motion.div
              layout
              transition={{ duration: 0.25, delay: .1, ease: [0.215, 0.61, 0.355, 1] }}
              className="textarea">
              <form action="" method='post'>
                <textarea
                  onChange={(e) => handleChange(e.target.value)}
                  name="issue" id="issue"
                  placeholder='Type Your Issue Here...'
                  className='w-full h-[20vh] decoration-none outline-none text-md font-semibold'
                ></textarea>
              </form>
            </motion.div>
          </motion.div>)}
        </AnimatePresence>

        <AnimatePresence mode='wait'>
          {!isType && isComOpen && (<motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: .8, x: 0 }}
            exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.2 }}
            className='w-full h-full'>
            <h2>Please type at least 3 characters</h2>
          </motion.div>)}
        </AnimatePresence>
      </motion.div>

    </motion.div>
  )
}

export default UpdateCard
