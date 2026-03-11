import moment from 'moment';
import { useEffect, useRef, useState } from 'react'
import UpdateCard from '../../templates/UpdateCard';
import IssueWindow from '../../templates/IssueWindow';
import ReportSummary from '../../templates/ReportSummary';
import Navbar from '../../templates/Navbar';
import { AnimatePresence, motion } from 'motion/react';
import gsap, { MotionPathPlugin, ScrollTrigger } from 'gsap/all';
import Butterfly from '../../templates/Butterfly';
import Progress from './DashBoard/Progress/Progress';
import CustomButtom from '../../templates/CustomButtom';
import UpdateBox from './DashBoard/UpdateBox/UpdateBox';
import TaskBox from './DashBoard/Task/TaskBox';
import RoomBox from './DashBoard/Room/RoomBox';
import Notification from '../../Portals/Notification';
import { usePopcard } from '../../context/PopCardContext';
import axios from 'axios';


const ClientDashboard = () => {

const { showPopcard, popcard } = usePopcard();
    const date = moment().format('LL');
        const day =  moment().format('dddd');

    const [userinfo,setUserInfo] = useState({});
    const [projectinfo, setProjectInfo] = useState({});
    const [lastupdate, setlastUpdate] = useState(null)
    const [lastreport, setLastReport] = useState(null)
    const [isopen, setOpen] = useState(false)
    const [isNotification,setNotification] = useState(false)
    const startingDay = moment(projectinfo?.startDate).format("Do MMMM YYYY");
    const EndingDay = moment(projectinfo?.estimatedEndDate).format("Do MMMM YYYY");

    const fetchProfile = async() =>{
                try {
                const {data} = await axios.get("http://localhost:3000/user/profile",{withCredentials: true});
                setUserInfo(data?.user);
                setProjectInfo(data?.project)
                setlastUpdate(data?.lastUpdate)
                setLastReport(data?.report)
            } catch (error) {
                console.log("Fetching failed"+ error)
                console.log(error.response?.data || error.message);
            }
    }

    useEffect(()=>{
            fetchProfile()
    },[])

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const parent = useRef(null)

  return userinfo && projectinfo  && (
    <div className='w-screen h-screen relative overflow-hidden'>

      <AnimatePresence>
        {popcard.visible && <motion.div
          initial={{opacity: 0, scaleY : 0}}
          key={popcard.message}
          animate={{opacity : 1, scaleY : 1, transformOrigin: "top"}}
          transition={{duration : .5, ease : [0.34, 1.56, 0.64, 1]}}
          exit={{opacity : 0, scaleY : 0}}
          className='w-[80%] md:w-[40%] h-14 rounded-lg to-transparent absolute z-20 top-0 left-0'>
          <CustomButtom  message={popcard.message}/>
        </motion.div>}
      </AnimatePresence>

      {/* Menu button — fixed top-right, responsive position */}
      <nav className='z-10 fixed  mt-[10%] right-4 md:top-6 md:right-8'>
        <motion.div
          onClick={()=> setOpen(!isopen)}
          className="menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
          <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
        </motion.div>
      </nav>

      <AnimatePresence mode='wait'>
        {isopen && <Navbar value={{isopen,setOpen}} />}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} y={16} x={5}/>
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      <main className='w-full h-full px-[8%] pt-[4%] pb-0 relative overflow-hidden flex flex-col'>
        {/* Constrain content width on large screens */}
        <div className='max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden'>

          <header className='shrink-0'>
            <div className="title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-[3%]">
              <h1>Hi</h1>
              <h1 className='text-white'>{userinfo?.name} <span className='inline-block text-black'>!</span></h1>
            </div>
            <div className="subtitle w-full md:w-[65%] font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]">
              <h4 className='w-[70%]'>Love to see you back! Check Your updates Now</h4>
            </div>
            <div className="date-create w-full flex items-center mt-[3%] justify-between">
              <div className="date flex pb-4 border-b-2 border-white items-center w-[50%] gap-4">
                <div className="date backdrop-blur-3xl px-2 py-2 bg-white/20 rounded-md leading-5 w-full font-bold">
                  <h4>{date}</h4>
                  <h4>{day}</h4>
                </div>
              </div>
              <div className="create pb-4 z-30 flex items-center justify-center">
                <div onClick={()=>setNotification(true)} className='w-10 h-10 md:w-12 md:h-12 bg-[#883bbc] rounded-full flex items-center justify-center cursor-pointer'>
                  <i className="ri-notification-3-fill text-2xl text-white opacity-90"></i>
                </div>
                <AnimatePresence mode='wait'>
                  {isNotification && <Notification state={{isNotification,setNotification}} />}
                </AnimatePresence>
              </div>
            </div>
          </header>

          <section ref={parent} className='main-container w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>
            <section className='title w-full mt-[10%]'>
              <div className='w-full'>
                <h1 className='text-3xl md:text-4xl w-full md:w-[70%] leading-9 uppercase font-bold'>{projectinfo?.projectName}</h1>
              </div>
              <div className="sub-text opacity-80 mt-[2%] text-sm">
                <h4 className='leading-5'>{projectinfo?.description}</h4>
              </div>
              <div className="date-create w-full flex items-center mt-[3%] pb-4">
                <div className="date flex items-center w-full gap-4">
                  <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0">
                    <i className="ri-calendar-2-line text-2xl text-white opacity-90"></i>
                  </div>
                  <div className="date leading-5 flex items-center justify-center h-full font-bold">
                    <div className="date-tag text-lg md:text-xl flex flex-col items-center h-full">
                      <h3>StartedOn</h3>
                      <h3>Estimated</h3>
                    </div>
                  </div>
                  <div className="date text-sm md:text-md flex flex-col h-full">
                    <h4>{startingDay}</h4>
                    <h4>{EndingDay}</h4>
                  </div>
                </div>
              </div>

              <Progress showPopcard={showPopcard} projectId={projectinfo?._id} />

              <div className="sub-stat mt-4 w-full h-24 md:h-28 flex items-center justify-between gap-2">
                <UpdateBox showPopcard={showPopcard} />
                <TaskBox showPopcard={showPopcard} projectId={projectinfo?._id} startDate={projectinfo?.startDate} endDate={projectinfo?.estimatedEndDate} />
                <RoomBox showPopcard={showPopcard} />
              </div>
            </section>

            <div className='w-full flex items-center mt-[10%]'>
              <figure className='w-10 h-10 mr-3 shrink-0'>
                <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
              </figure>
              <h2 className='w-full flex items-center justify-start text-lg font-bold'>Recent Update</h2>
            </div>
            <div className="card w-full mt-[2%]">
              <UpdateCard update={lastupdate} />
            </div>

            <div className='w-full mt-[2%] bg-white rounded-lg border border-neutral-300 font-semibold opacity-70 text-lg px-2 py-2 flex items-center justify-center'>
              <button>View all Updates</button>
            </div>

            <div className='w-full mt-[10%] flex items-center'>
              <figure className='w-[30vw] h-[12vw] ml-[50%]'>
                <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
              </figure>
              <h2 className='w-full flex items-center justify-end text-lg font-bold'>Having Issue?</h2>
            </div>
            <div className='issue w-full mt-[2%]'>
              <IssueWindow />
            </div>

            <div className='w-full flex items-center mt-[10%]'>
              <figure className='w-10 h-10 mr-3 shrink-0'>
                <img className='w-full h-full object-cover' src="/images/hearts.png" alt="" />
              </figure>
              <h2 className='w-full flex items-center justify-start text-lg font-bold'>Recent Report</h2>
            </div>
            <div className="short-report w-full mt-[5%]">
              <ReportSummary report={lastreport} />
            </div>
            <div className='w-full mt-[2%] bg-white rounded-lg border border-neutral-300 font-semibold opacity-70 mb-[10%] text-lg px-2 py-2 flex items-center justify-center'>
              <button>View all Reports</button>
            </div>

            <article className='w-full leading-loose mb-4'>
              <div className="date flex items-center mt-[2%] w-full gap-4">
                <div className="icon w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0">
                  <i className="ri-arrow-up-fill text-2xl text-white opacity-90"></i>
                </div>
                <div className="date text-md opacity-80 leading-5 font-bold">
                  <h4>Scroll Up</h4>
                </div>
              </div>
              <h4 className='w-fit mt-[2%] px-2 backdrop-blur-md rounded-md overflow-hidden text-4xl md:text-5xl font-bold'>You Are</h4>
              <h2 className='w-full text-5xl md:text-7xl font-bold text-white'>UpTODate<span className='inline-block text-black'>!</span></h2>
            </article>

            <footer></footer>
          </section>

        </div>
      </main>
    </div>
  )
}

export default ClientDashboard
