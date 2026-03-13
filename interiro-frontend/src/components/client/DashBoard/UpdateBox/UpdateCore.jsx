import React from 'react'

const UpdateCore = ({ updateCount }) => {
  return (
    <>
      <div className="background w-full h-full   absolute bg-gradient-to-t from-[#F7D6F3] to-transparent -z-10  top-0 left-0"></div>
                  <h3 className='font-semibold text-2xl'>{updateCount === null ? '—' : updateCount}</h3>
                  <h2 className='font-bold text-xl text-white'>Updates</h2>
    </>
  )
}

export default UpdateCore