import moment from 'moment'
import { useRef, useState, useEffect } from 'react'
import Butterfly from '../../templates/Butterfly';
import AdminNavbar from '../../templates/AdminNavbar';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const date = moment().format('LL');
    const day =  moment().format('dddd');
    const parent = useRef(null)
    const [isopen, setOpen] = useState(false)
    const navigate = useNavigate()

    const [ongoingCount, setOngoingCount] = useState(null)
    const [completedCount, setCompletedCount] = useState(null)
    const [updates, setUpdates] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: projectData } = await axios.get('http://localhost:3000/project/all', { withCredentials: true })
                const projects = projectData?.projects || []
                setOngoingCount(projects.filter(p => p.status === 'ongoing').length)
                setCompletedCount(projects.filter(p => p.status === 'completed').length)
            } catch (error) {
                console.error('Failed to fetch projects', error)
                if (error.response?.status === 401 || error.response?.status === 400) {
                    navigate('/admin/login')
                }
            }

            try {
                const { data: updateData } = await axios.get('http://localhost:3000/update/admin-all', { withCredentials: true })
                setUpdates(updateData?.updates || [])
            } catch (error) {
                console.error('Failed to fetch updates', error)
            }
        }
        fetchData()
    }, [])

  return (
    <div className='w-screen min-h-screen relative overflow-hidden'>

      {/* Menu icon — fixed top-right */}
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

      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} x={20} y={10} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      <main className='w-full min-h-screen px-[8%] py-[6%] relative'>
        <div className='max-w-3xl mx-auto'>

          <header>
            <div className="title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-[3%]">
              <h1>Hi</h1>
              <h1 className='text-white'>Piyush <span className='inline-block text-black'>!</span></h1>
            </div>
            <div className="subtitle w-full md:w-[65%] font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]">
              <h4>Welcome back to your Dashboard</h4>
            </div>
            <div className="date-create w-full flex items-center mt-[3%] justify-between">
              <div className="date border-b-2 pb-4 border-white flex items-center w-[60%] gap-4">
                <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0">
                  <i className="ri-calendar-2-line text-2xl text-white opacity-90"></i>
                </div>
                <div className="date  leading-5 font-bold">
                  <h4>{date}</h4>
                  <h4>{day}</h4>
                </div>
              </div>
              <div className="create flex items-center justify-center">
                <button onClick={() => navigate('/admin/client')} className='w-10 h-10 md:w-12 md:h-12 bg-[#883bbc] rounded-full flex items-center justify-center'>
                  <i className="ri-add-line text-2xl text-white opacity-90"></i>
                </button>
              </div>
            </div>
          </header>

          <section className='completion-data w-full mt-[5%]'>
            <h4 className='text-lg font-bold'>Completion Status:</h4>
            <div className='card-container mt-[2%] w-full relative flex items-center justify-between gap-4'>

              {/* Ongoing card */}
              <div className="card w-[45%] md:w-5/12 bg-gradient-to-br backdrop-blur-lg from-white to-transparent relative rounded-md shadow-2xl shadow-current h-32 md:h-40 flex flex-col items-center justify-center gap-1">
                <i className="ri-loader-line text-3xl text-[#883bbc]"></i>
                <h2 className='text-4xl md:text-5xl font-bold'>
                  {ongoingCount === null ? <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i> : ongoingCount}
                </h2>
                <p className='text-sm font-semibold opacity-60'>Ongoing</p>
              </div>

              {/* Completed card */}
              <div className="card w-[45%] md:w-5/12 bg-gradient-to-br backdrop-blur-lg from-white to-transparent shadow-2xl shadow-current rounded-md h-32 md:h-40 flex flex-col items-center justify-center gap-1">
                <i className="ri-checkbox-circle-line text-3xl text-[#883bbc]"></i>
                <h2 className='text-4xl md:text-5xl font-bold'>
                  {completedCount === null ? <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i> : completedCount}
                </h2>
                <p className='text-sm font-semibold opacity-60'>Completed</p>
              </div>

            </div>
          </section>

          <section className='daily-update-log w-full mt-[5%]'>
            <h4 className='text-lg w-full h-12 border-b-2 border-zinc-400 flex items-center justify-center font-bold'>Daily Updates</h4>

            <div ref={parent} className="update-log-cards mt-[4%] flex flex-col justify-center max-h-[40vh] overflow-y-auto">
              {updates.length === 0 && (
                <div className='flex items-center justify-center h-20 opacity-50 font-semibold text-sm'>
                  No updates yet.
                </div>
              )}
              {updates.map((item, index) => (
                <div key={item._id || index} className="update-card px-[2%] mt-[5%] py-[1%] bg-gradient-to-r from-white to-transparent w-full h-20 md:h-16 rounded-md flex-shrink-0 shadow-xl backdrop-blur-lg flex items-center justify-center">
                  <div className='name w-[40%] h-full flex items-center justify-center'>
                    <h4 className='text-lg leading-5'>{item.projectName}</h4>
                  </div>
                  <div className='name w-[60%] flex items-end flex-col justify-center h-full'>
                    <h4 className='text-base h-6 flex items-center justify-center font-bold'>
                      {moment(item.createdAt).format('LL')}
                    </h4>
                    <h4 className='text-base h-6 flex items-center justify-center font-bold'>
                      {moment(item.createdAt).format('dddd')}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

    </div>
  )
}

export default AdminDashboard
