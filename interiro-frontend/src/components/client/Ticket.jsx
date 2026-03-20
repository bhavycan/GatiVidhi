import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../templates/Navbar";
import { AnimatePresence, motion } from "motion/react";
import Butterfly from "../../templates/Butterfly";
import TicketForm from "../../templates/TicketForm";
import { usePopcard } from "../../context/PopCardContext";
import CustomButtom from "../../templates/CustomButtom";
import TickitInfo from "../../templates/TickitInfo";
import moment from "moment";
import axios from "axios";
import { API_BASE } from '../../config.js'

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-600 border-red-300",
  medium: "bg-yellow-100 text-yellow-600 border-yellow-300",
  low: "bg-green-100 text-green-600 border-green-300",
};

const Ticket = () => {
  const parent = useRef(null);
  const [isopen, setOpen] = useState(false);
  const [isTicketOpen, setTicketOpen] = useState(false);
  const [openTicketDetail, setTicketDetail] = useState(false);
  const { showPopcard, popcard } = usePopcard();
  const [ticketData, setticketData] = useState({});
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/comment/my`, { withCredentials: true });
      setTickets(data?.comments || []);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="w-screen h-[100vh] relative overflow-hidden">

      <AnimatePresence>
        {popcard.visible && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            key={popcard.message}
            animate={{ opacity: 1, scaleY: 1, transformOrigin: "top" }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="w-[80%] h-[15%] rounded-lg to-transparent absolute z-20 top-0 left-0"
          >
            <CustomButtom message={popcard.message} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img className="w-full h-full object-cover" src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} x={10} y={7} />
        <figure className="w-[25vw] h-[30vw] absolute bottom-[2%] left-[10%]">
          <img className="w-full h-full object-cover" src="/images/butterfly2.png" alt="" />
        </figure>
      </section>

      <main className="w-full h-full px-[8%] py-[6%] relative">
        <header>
          <div className="title w-full text-5xl font-semibold tracking-tight mt-[6%] h-[20%] flex">
            <h1 className="h-full">Ti</h1>
            <h1 className="h-full text-white">ckets</h1>
          </div>
          <div className="subtitle w-[100%] mt-[2%] font-semibold text-md opacity-70 leading-5 pl-[1%]">
            <h4 className="w-[60%] border-b-2 pb-[6%] border-white">
              Your generated queries for the ongoing project
            </h4>
          </div>
        </header>

        <nav className="w-full h-full z-10 fixed top-[5%] left-[80%]">
          <motion.div
            onClick={() => setOpen(!isopen)}
            className="menuicon w-[12vw] h-[12vw] items-center justify-center flex"
          >
            <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
          </motion.div>
        </nav>

        <section className="main-container w-full max-h-[80vh] relative z-10 overflow-y-auto overflow-x-hidden pb-[10%]">
          <h1 className="text-xl font-bold mt-[5%]">Create Ticket :</h1>

          <AnimatePresence mode="wait">
            {!isTicketOpen && (
              <motion.div
                layoutId="tiket-conatiner"
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.1 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
              >
                <div className="px-2 py-2 rounded-lg bg-gradient-to-br mt-[2%] from-[#F7D6F3] to-transparent">
                  <p>Ask your doubt or questions, we try our best to resolve it as soon as possible</p>
                  <motion.div
                    layout
                    layoutId="create-button"
                    onClick={() => setTicketOpen(true)}
                    className="create-button w-[50%] mt-[5%] rounded-lg flex items-center justify-center text-3xl px-1 py-2 text-white bg-[#883bbc] cursor-pointer"
                  >
                    <i className="ri-add-circle-fill"></i>
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
                className="border border-[#883bbc] w-full mt-[5%] backdrop-blur-sm rounded-lg"
              >
                <TicketForm
                  setTicketOpen={setTicketOpen}
                  showPopcard={showPopcard}
                  onSubmitSuccess={fetchTickets}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full flex items-center mt-[8%]">
            <figure className="w-[40vw] h-[12vw] ml-[65%]">
              <img className="w-full h-full object-cover" src="/images/hearts.png" alt="" />
            </figure>
            <h2 className="w-full flex items-center justify-end text-lg font-bold">Tickets</h2>
          </div>

          <div className="tickit-cards w-full mt-[5%]">
            {tickets.length === 0 && (
              <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent">
                <p className="text-sm font-semibold opacity-70">No tickets submitted yet.</p>
              </div>
            )}
            {tickets.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scaleX: 0, scaleY: 0 }}
                whileInView={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => { setTicketDetail(true); setticketData(item); }}
                className="w-full rounded-lg bg-gradient-to-bl from-[#F7D6F3] to-transparent mb-[3%] px-3 py-3 cursor-pointer"
              >
                <div className="title text-base px-2 py-1 rounded-md bg-white/50 font-bold">
                  <h2>{item.note.slice(0, 60)}{item.note.length > 60 ? "..." : ""}</h2>
                </div>
                <div className="date mt-[2%] flex items-center justify-start gap-[3%] w-full">
                  <div className="icon w-[8vw] h-[8vw] text-xl flex items-center justify-center rounded-full bg-[#883bbc] text-white">
                    <i className="ri-calendar-fill"></i>
                  </div>
                  <h2 className="text-lg font-semibold opacity-80">
                    {moment(item.receivedDate).format("LL")}
                  </h2>
                </div>
                <div className="w-full flex items-center justify-end">
                  {item.resolved ? (
                    <span className="text-sm font-semibold px-3 py-1 rounded-md border mt-[5%] bg-green-100 text-green-600 border-green-300">
                      Resolved
                    </span>
                  ) : (
                    <span className={`capitalize text-sm font-semibold px-3 py-1 rounded-md border mt-[5%] ${PRIORITY_COLORS[item.priorityLevel] || ''}`}>
                      {item.priorityLevel}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {openTicketDetail && (
              <TickitInfo
                setTicketDetail={setTicketDetail}
                openTicketDetail={openTicketDetail}
                ticketData={ticketData}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Ticket;
