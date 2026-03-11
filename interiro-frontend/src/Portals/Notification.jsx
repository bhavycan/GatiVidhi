import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TYPE_STYLES = {
  update: { icon: 'ri-refresh-line',     color: 'bg-[#883bbc] text-white',   label: 'Update',  path: '/user/update' },
  task:   { icon: 'ri-task-line',         color: 'bg-blue-500 text-white',    label: 'Task',    path: '/user/profile' },
  ticket: { icon: 'ri-ticket-line',       color: 'bg-green-500 text-white',   label: 'Ticket',  path: '/user/ticket' },
  report: { icon: 'ri-file-text-line',    color: 'bg-orange-400 text-white',  label: 'Report',  path: '/user/report' },
}

const Notification = ({ state, onClear }) => {
  const { isNotification, setNotification } = state;
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const date = moment().format('LL');
  const day = moment().format('dddd');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/project/notifications', { withCredentials: true });
        setNotifications(data?.notifications || []);
      } catch (_) {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

   const deleteNotification = (index) => {
  const fetch = async () => {
    try {
      await axios.get(`http://localhost:3000/project/notifications/delete/${index}`, {
        withCredentials: true
      });
    } catch (_) {}
    finally { setLoading(false); }
  };
  fetch();
};

  useEffect(() => {
    if (!loading && notifications.length === 0) {
      const timer = setTimeout(() => setNotification(false), 2000);
      return () => clearTimeout(timer);
    }

    
   


  }, [notifications, loading]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await axios.post('http://localhost:3000/project/notifications/clear', {}, { withCredentials: true });
      setNotifications([]);
      if (onClear) onClear();
    } catch (_) {}
    setClearing(false);
    setNotification(false);
  };

  const handleNotifClick = (type) => {
    const path = TYPE_STYLES[type]?.path;
    if (path) {
      
      setNotification(false);
      navigate(path);
      handleRemove(index)
    }
  };

  const handleRemove = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    console.log(index)
    deleteNotification(index)
  };

  const handleMainDrag = (e, info) => {
    if (info.offset.y < -10 && Math.abs(info.offset.x) < Math.abs(info.offset.y)) {
      setNotification(false);
    }
  };

  const handleDragEnd = (index, info) => {
    if (info.offset.x > 60 && info.offset.x > Math.abs(info.offset.y)) {
      handleRemove(index);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setNotification(false)}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 w-screen h-screen bg-gradient-to-tr from-[#F7D6F3] to-transparent flex justify-center items-start bg-opacity-90"
    >
      <motion.div
        drag="y"
        dragConstraints={{ top: -100, bottom: 0 }}
        dragDirectionLock
        dragElastic={0.1}
        onDragEnd={(e, info) => handleMainDrag(e, info)}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-fit pt-[10%] rounded-lg px-3 py-3 backdrop-blur-lg"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeIn" }}
          className="title w-full pb-[5%] border-b-2 border-white font-semibold"
        >
          <h1 className="text-4xl">
            Daily <span className="inline-block text-white">Notification</span>.
          </h1>
          <h3 className="opacity-80 font-bold">Find out what's new!</h3>
          <div className="date flex mt-[2%] items-center w-[50%] gap-[5%]">
            <div className="icon w-[12vw] h-[12vw] rounded-full bg-[#883bbc] items-center justify-center flex">
              <i className="ri-calendar-2-line text-3xl text-white opacity-90"></i>
            </div>
            <div className="date leading-5 w-[70%] font-bold">
              <h4>{date}</h4>
              <h4>{day}</h4>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {!clearing && (
          <motion.div layout className="noti-container w-full mt-[2%]">
            <motion.div className="noti-area w-full overflow-y-scroll max-h-[40vh]">

              {loading && (
                <div className="flex items-center justify-center py-6">
                  <i className="ri-loader-4-line animate-spin text-2xl text-[#883bbc]"></i>
                </div>
              )}

              <AnimatePresence mode="popLayout">
                {!loading && notifications.map((item, index) => {
                  const style = TYPE_STYLES[item.type] || TYPE_STYLES.update;
                  return (
                    <motion.div
                      key={item._id || index}
                      layout
                      initial={{ scale: 0.8, y: 50, opacity: 0.8 }}
                      whileInView={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
                      drag
                      dragDirectionLock
                      dragConstraints={{ top: 0, left: 0, right: 100, bottom: 0 }}
                      onDragEnd={(e, info) => handleDragEnd(index, info)}
                      onClick={() => handleNotifClick(item.type,index)}
                      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                      className="w-full mb-[2%] px-3 py-3 rounded-lg bg-white/50 flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.color}`}>
                        <i className={`${style.icon} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono opacity-50 capitalize">{style.label}</p>
                        <p className="font-semibold text-sm leading-snug">{item.message}</p>
                        <p className="text-xs opacity-50 mt-[2px]">{moment(item.createdAt).fromNow()}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

            </motion.div>

            {!loading && (
              notifications.length > 0 ? (
                <div className="w-full h-[6vh] mt-[5%] flex items-center justify-end">
                  <motion.div
                    onClick={handleClear}
                    whileTap={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-[50%] flex items-center justify-center rounded-md h-full bg-[#883bbc] text-white cursor-pointer"
                  >
                    <h2 className="text-xl">clear</h2>
                  </motion.div>
                </div>
              ) : (
                <div className="w-full h-[7%] mt-[5%] font-semibold text-2xl opacity-80 text-white flex items-center justify-center">
                  <h2>No Updates For you</h2>
                </div>
              )
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default Notification;
