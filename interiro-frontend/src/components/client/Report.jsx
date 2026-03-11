import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Butterfly from '../../templates/Butterfly'
import Navbar from '../../templates/Navbar'
import Dropdown from '../../templates/Dropdown'
import ReportSummary from '../../templates/ReportSummary'
import CustomButtom from '../../templates/CustomButtom'
import { usePopcard } from '../../context/PopCardContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Report = () => {
  const [isopen, setOpen] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const { showPopcard, popcard } = usePopcard()
  const parent = useRef(null)
  const navigate = useNavigate()
  const option = ["Latest", "Oldest"]

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/report/all", { withCredentials: true })
      setReports(data?.reports || [])
    } catch (error) {
      console.error("Failed to fetch reports", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
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
        <Butterfly parent={parent} x={5} y={7} />
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
              <h1>Re</h1>
              <h1 className='text-white'>ports</h1>
            </div>
            <div className="subtitle w-full mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]">
              <h4 className='w-[70%] md:w-[70%] border-b-2 pb-[6%] border-white'>
                Weekly reports regarding the ongoing project
              </h4>
            </div>
          </header>

          {/* Scrollable section */}
          <section ref={parent} className='main-container w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>

            {/* Note banner */}
            <div className="note mt-[5%]">
              <h2 className='w-full text-lg opacity-80 font-bold'>Note:</h2>
              <div className="px-2 py-3 rounded-md backdrop-blur-sm w-full bg-gradient-to-tl mt-[2%] from-[#F7D6F3] to-transparent">
                <p>The report contains the summary of work done during the last week. For full details, checkout the updates section.</p>
                <div
                  onClick={() => navigate('/user/update')}
                  className="redirect-update px-2 py-2 bg-[#883bbc] rounded-lg text-lg flex items-center justify-center mt-[5%] text-white font-semibold cursor-pointer">
                  <h1>Updates</h1>
                  <i className="ri-arrow-right-up-line"></i>
                </div>
              </div>
            </div>

            {/* Reports heading */}
            <div className='w-full flex items-center mt-[8%]'>
              <figure className='w-8 h-8 md:w-20 md:h-8 ml-auto shrink-0'>
                <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
              </figure>
              <h2 className='flex items-center justify-end text-lg font-bold ml-3 whitespace-nowrap'>Reports</h2>
            </div>

            <Dropdown option={option} />

            {/* Reports list */}
            <motion.div
              layout
              className='reports w-full relative z-0 mt-[2%]'
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {loading && (
                <p className='text-center font-semibold opacity-60 mt-8'>Loading reports...</p>
              )}

              {!loading && reports.length === 0 && (
                <p className='text-center font-semibold opacity-60 mt-8'>No reports yet.</p>
              )}

              {!loading && reports.map((report) => (
                <motion.div
                  key={report._id}
                  layout
                  className='w-full mt-[5%]'
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ReportSummary report={report} />
                </motion.div>
              ))}
            </motion.div>

          </section>
        </div>
      </main>
    </div>
  )
}

export default Report
