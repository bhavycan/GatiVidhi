import React, { useState } from "react";
import Navbar from "../../templates/Navbar";
import { AnimatePresence, motion } from "motion/react";
import Butterfly from "../../templates/Butterfly";
import { div } from "motion/react-client";
import TicketForm from "../../templates/TicketForm";
import { usePopcard } from "../../context/PopCardContext";
import CustomButtom from "../../templates/CustomButtom";
import TickitInfo from "../../templates/TickitInfo";
import moment from "moment";

const Ticket = () => {
  const [isopen, setOpen] = useState(false);
  const [isTicketOpen, setTicketOpen] = useState(false);
  const [openTicketDetail,setTicketDetail] = useState(false)
  const { showPopcard, popcard } = usePopcard();
  const [ticketData,setticketData] = useState({})
  console.log(ticketData)
  const tickets = [
  {
    title: "UI Alignment Issue",
    description:
      "On smaller devices the navigation bar items are overlapping and not aligning correctly. This impacts the usability and overall layout of the header section, making it difficult for users to navigate efficiently.",
    date: "2025-08-25",
    priority: "high",
    active: true,
  },
  {
    title: "Database Migration",
    description:
      "We need to migrate legacy ticket data into the new schema. The migration process must ensure that all existing relationships are preserved, data integrity is maintained, and no duplicate entries are created during transfer.",
    date: "2025-08-20",
    priority: "medium",
    active: false,
  },
  {
    title: "Performance Optimization",
    description:
      "The dashboard takes too long to load because of multiple synchronous requests and heavy components. Implement lazy loading, code splitting, and caching strategies to reduce the time and improve user experience.",
    date: "2025-08-22",
    priority: "low",
    active: true,
  },
  {
    title: "API Authentication Error",
    description:
      "OAuth tokens are not refreshing after expiration which causes users to be logged out frequently. Investigate token lifecycle handling, refresh mechanisms, and integrate retry logic to resolve intermittent authentication issues quickly.",
    date: "2025-08-30",
    priority: "high",
    active: true,
  },
  {
    title: "Bug in Ticket Form",
    description:
      "After creating a ticket, the form does not reset fields which confuses users when they try to add new tickets. Implement auto reset on submit and confirmation message for better usability.",
    date: "2025-08-30",
    priority: "medium",
    active: false,
  },
];

  return (
    <div className="w-screen h-[100vh] relative overflow-hidden">


      <AnimatePresence>
{popcard.visible && <motion.div 
 initial={{opacity: 0, scaleY : 0}}
 key={popcard.message}
                animate={{opacity : 1, scaleY : 1, transformOrigin: "top"}}
                transition={{duration : .5, ease : [0.34, 1.56, 0.64, 1]}}
                exit={{opacity : 0, scaleY : 0}}
className='w-[80%] h-[15%]  rounded-lg  
to-transparent absolute z-20 top-0 left-0'>
    
    
        <CustomButtom  message={popcard.message}/>
    
    
    
    
    </motion.div>}
    </AnimatePresence>
      <AnimatePresence mode="wait">
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className="overflow-hidden -z-10 ">
        <figure className="w-screen h-full absolute">
          <img
            className="w-full h-full object-cover"
            src="/images/background.png"
            alt=""
          />
        </figure>

        <Butterfly parent={parent} x={10} y={7} />
        <figure className="w-[25vw] h-[30vw] absolute bottom-[2%] left-[10%]">
          <img
            className="w-full h-full object-cover "
            src="/images/butterfly2.png"
            alt=""
          />
        </figure>
      </section>
      <main className="w-full h-full px-[8%] py-[6%] relative">
        <header>
          <div className="title w-full text-5xl font-semibold tracking-tight mt-[6%]  h-[20%] flex  ">
            <h1 className="h-full">Ti</h1>
            <h1 className="h-full text-white">ckets</h1>
          </div>
          <div className="subtitle w-[100%]  mt-[2%] font-semibold text-md opacity-70 leading-5  pl-[1%] ">
            <h4 className="w-[60%] border-b-2 pb-[6%] border-white">
              Your generated querries for the ongoing project
            </h4>
          </div>
        </header>
        <nav className="w-full h-full z-10 fixed top-[5%] left-[80%] ">
          <motion.div
            onClick={() => {
              setOpen(!isopen);
            }}
            className="menuicon w-[12vw] h-[12vw]  items-center justify-center flex"
          >
            <i className="ri-menu-fill text-3xl  text-white opacity-90 "></i>
          </motion.div>
        </nav>

        <section className="main-container w-full max-h-[80vh] relative z-10 overflow-y-auto overflow-x-hidden pb-[10%]">
          <h1 className="text-xl font-bold mt-[5%]  ">Create Ticket : </h1>
          <AnimatePresence mode="wait">
            {!isTicketOpen && (
              <motion.div
                layoutId="tiket-conatiner"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="title  w-[100%]  "
              >
                <div className="px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent ">
                  {" "}
                  <p className="">
                    Ask your doubt or questions,we try out best to resolve it as
                    soon as possible
                  </p>
                  <motion.div
                    layout
                    layoutId="create-button"
                    onClick={() => setTicketOpen(true)}
                    className="create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc]"
                  >
                    <i class="ri-add-circle-fill"></i>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isTicketOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ transformOrigin: "top center" }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                className="border-1 w-full   border-[#883bbc] mt-[5%] backdrop-blur-sm rounded-lg"
              >
                <TicketForm setTicketOpen={setTicketOpen} showPopcard={showPopcard} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full flex items-center mt-[8%] ">
            <figure className="w-[40vw] h-[12vw] ml-[65%] ">
              <img
                className="w-full h-full object-cover"
                src="/images/hearts.png"
                alt=""
              />
            </figure>
            <h2 className="w-full flex items-center justify-end text-lg font-bold">
              Tickets
            </h2>
          </div>

          <div className="tickit-cards w-full   mt-[5%]">

              {tickets.map((item,index)=>{
              return(
                   <motion.div
                   initial={{opacity: 0, scaleX: 0, scaleY: 0}}
                   animate={{scaleX: .5}}
                   whileInView={{opacity: 1, scaleX :1, scaleY:1}}
                   transition={{duration: .3, delay: index*.01}}
                   onClick={()=>{setTicketDetail(true),setticketData(item)}}
                   className="w-full rounded-lg  bg-gradient-to-bl from-[#F7D6F3] to-transparent mb-[3%]  px-3 py-3">
                    
                 <div className="title  text-lg px-2 py-1 rounded-md bg-white/50 font-bold">
              <h2>{item.title.slice(0,30)+ "...."}</h2>
            </div>
             <div className="date mt-[2%] flex items-center justify-start gap-[3%] w-full">
                <div className="icon w-[8vw] h-[8vw] text-xl flex items-center justify-center rounded-full bg-[#883bbc]  text-white "><i className="ri-calendar-fill"></i></div>
                <h2 className="text-lg font-semibold opacity-80">{moment(item.date, "MMMM Do YYYY").format('LL')}</h2></div>
            <div className="w-full flex items-center justify-end">
              {item.active ?<h2 className="button flex items-center justify-center rounded-md px-2 py-1 bg-[#883bbc] text-white text-lg mt-[5%] w-[30%]">Active</h2> : <h2 className="button flex items-center justify-center rounded-md px-2 py-1  text-[#883bbc] bg-white text-lg mt-[5%] w-[30%]">Solved</h2> }
              </div>
            </motion.div>
              )
              
              })}

           
           {openTicketDetail && (<TickitInfo setTicketDetail={setTicketDetail} openTicketDetail={openTicketDetail} ticketData={ticketData}/>)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Ticket;
