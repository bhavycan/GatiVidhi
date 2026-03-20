import { useEffect, useRef, useState } from 'react'
import Butterfly from '../../templates/Butterfly'
import { AnimatePresence, motion } from 'motion/react'
import UpdateCard from '../../templates/UpdateCard'
import { usePopcard } from '../../context/PopCardContext'
import CustomButtom from '../../templates/CustomButtom'
import Navbar from '../../templates/Navbar'
import Dropdown from '../../templates/Dropdown'
import axios from 'axios'
import { API_BASE } from '../../config.js'

const Update = () => {
  const [isopen, setOpen] = useState(false)
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const { showPopcard, popcard } = usePopcard();
  const parent = useRef(null)
  const option = ["Date", "Part"]

  const fetchUpdates = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/update/all`, { withCredentials: true })
      setUpdates(data?.updates || [])
    } catch (error) {
      console.error("Failed to fetch updates", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [])

  return (
    <div className='w-screen h-screen relative overflow-hidden'>
      <AnimatePresence mode='wait'>
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <AnimatePresence>
        {popcard.visible && <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          key={popcard.message}
          animate={{ opacity: 1, scaleY: 1, transformOrigin: "top" }}
          transition={{ duration: .5, ease: [0.34, 1.56, 0.64, 1] }}
          exit={{ opacity: 0, scaleY: 0 }}
          className='w-[80%] md:w-[40%] h-14 rounded-lg to-transparent absolute z-20 top-0 left-0'>
          <CustomButtom message={popcard.message} />
        </motion.div>}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} x={5} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      {/* Menu button */}
      <nav className='z-10 fixed mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={() => setOpen(!isopen)}
          className="menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <main className='w-full h-full px-[8%] pt-[4%] pb-0 relative overflow-hidden flex flex-col'>
        <div className='max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden'>

          <header className='shrink-0'>
            <div className="title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex">
              <h1>Up</h1>
              <h1 className='text-white'>dates</h1>
            </div>
            <div className="subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]">
              <h4 className='w-[70%] md:w-[70%] border-b-2 pb-[6%] border-white'>
                Your daily Updates regarding the ongoing project
              </h4>
            </div>
          </header>

          {/* Scrollable section */}
          <section ref={parent} className='main-container w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>

            {/* AI Chatbot banner */}
            <div className='mt-[5%]'>
              <h2 className='text-2xl font-semibold opacity-80'>Try Our</h2>
              <h2 className='text-3xl font-bold'>AI ChatBot</h2>
              <motion.div
                layout
                className="logo-title bg-gradient-to-tl from-[#F7D6F3] to-transparent mt-[2%] flex items-center w-full gap-4 py-2 px-2 rounded-lg shadow-2xl cursor-pointer">
                <div className='w-10 h-10 md:w-12 md:h-12 bg-[#883bbc] rounded-full flex items-center justify-center shrink-0'>
                  <i className="ri-gemini-fill text-2xl text-white opacity-90"></i>
                </div>
                <h4 className='text-lg opacity-70 font-semibold'>Unlock the Potential!</h4>
              </motion.div>
            </div>

            {/* Updates heading */}
            <div className='w-full flex items-center mt-[10%]'>
              <figure className='w-8 h-8 md:w-20 md:h-8 ml-auto shrink-0'>
                <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
              </figure>
              <h2 className='flex items-center justify-end text-lg font-bold ml-3 whitespace-nowrap'>Updates</h2>
            </div>

            <Dropdown option={option} />

            {/* Updates list */}
            <motion.div
              layout
              className='updates w-full relative z-0 mt-[2%]'
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {loading && (
                <p className='text-center font-semibold opacity-60 mt-8'>Loading updates...</p>
              )}

              {!loading && updates.length === 0 && (
                <p className='text-center font-semibold opacity-60 mt-8'>No updates yet.</p>
              )}

              {!loading && updates.map((update) => (
                <motion.div
                  key={update._id}
                  layout
                  className='w-full mt-[5%]'
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <UpdateCard update={update} />
                </motion.div>
              ))}
            </motion.div>

          </section>
        </div>
      </main>
    </div>
  )
}

export default Update
