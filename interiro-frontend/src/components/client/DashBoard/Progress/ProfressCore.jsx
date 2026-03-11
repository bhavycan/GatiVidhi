import moment from 'moment';
import { motion } from 'motion/react';
import React from 'react'

const ProfressCore = ({ completedCount, lastUpdated }) => {
  const lastUpdatedText = lastUpdated
    ? moment(lastUpdated).format('LL')
    : 'Not updated yet'

  return (
    <motion.div
      whileTap={{ scale: .9 }}
      className='popup-content w-full px-4 py-5'>
      <div className="background absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#F7D6F3] to-transparent"></div>

      <motion.div className='w-full'>
        <motion.div
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: .5, ease: [0.37, 0, 0.63, 1] }}
          className="flex items-center">

          <div className='w-full flex items-center'>
            <figure className='w-8 h-8 md:w-20 md:h-8 ml-auto shrink-0'>
              <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
            </figure>
            <h2 className='flex items-center justify-end text-lg font-bold ml-3 whitespace-nowrap'>Progress</h2>
          </div>
        </motion.div>

        <div className="bar w-full mt-2 h-[5vh] px-2 py-2 border border-[#883bbc] flex gap-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className={`bar-inside w-[9%] h-full bg-[#883bbc] ${completedCount > index ? '' : 'opacity-20'}`}
            ></div>
          ))}
        </div>

        <motion.article
          initial={{ x: -150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: .5, ease: [0.37, 0, 0.63, 1] }}
          className="mt-2">
          <h2 className="text-lg font-bold">{completedCount * 10}% Work is Completed</h2>
          <h4 className="text-sm font-semibold opacity-70">Last updated: {lastUpdatedText}</h4>
        </motion.article>
      </motion.div>
    </motion.div>
  )
}

export default ProfressCore
