import { motion } from "motion/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ value }) => {
  const { setOpen } = value;
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home",        path: "/user/profile",     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg> },
    { label: "ProjectView", path: "/user/projectview", icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg> },
    { label: "Updates",     path: "/user/update",      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
    { label: "Reports",     path: "/user/report",      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
    { label: "Tickets",     path: "/user/ticket",      icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
    { label: "Gallery",     path: "/user/gallery",     icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ];

  const helpItems = [
    { label: "Contact",  path: null,           icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    { label: "ChatBot",  path: "/user/chat",   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
  ];

  const handleNav = (path) => {
    if (!path) return;
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/user/logout", {}, { withCredentials: true });
    } catch (_) {
      // proceed regardless
    }
    setOpen(false);
    navigate("/user/login");
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (
        !event.target.closest(".menu") &&
        !event.target.closest(".menuicon")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, x: 50 }}
      className="w-full right-0 backdrop-blur-sm h-full z-50 absolute"
    >
      <div className="w-full -bottom-[5%] pointer-events-none absolute z-20">
        <img
          className="w-full h-full object-contain"
          src="/GIF/butterflies.gif"
          alt=""
        />
      </div>

      {/* Sidebar */}
      <motion.div className="menu w-[75%] sm:w-[55%] md:w-[35%] lg:w-[25%] min-h-full relative px-3 py-4 flex items-center flex-col bg-gradient-to-br from-[#F7D6F3] to-transparent bg-black/30 ml-auto">
        <div className="menu-title w-full text-4xl font-semibold text-white pb-2 border-b-2">
          <h1>Find Out</h1>
          <h1 className="bg-white/50 w-fit text-black">More!</h1>
        </div>

        {/* Main nav */}
        <div className="part-1 w-full mt-[10%] pb-[10%] border-b-2 border-white">
          <h2 className="w-full font-semibold opacity-80 text-xl">For You:</h2>
          <div className="tags w-full flex flex-col items-center justify-center mt-[2%]">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNav(item.path)}
                className={`w-full px-[5%] py-[4%] bg-white/50 mt-[2%] rounded-lg transition-colors flex items-center gap-3
                  ${item.path ? "cursor-pointer hover:bg-white/70" : "cursor-not-allowed opacity-50"}`}
              >
                {item.icon}
                <h1 className="text-base font-bold">{item.label}</h1>
              </div>
            ))}
          </div>
        </div>

        {/* Help nav */}
        <div className="part-2 w-full mt-[5%] pb-[10%] border-b-2 border-white">
          <h2 className="w-full font-semibold opacity-80 text-xl">For Help:</h2>
          <div className="tags w-full flex flex-col items-center justify-center mt-[2%]">
            {helpItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNav(item.path)}
                className={`w-full px-[5%] py-[4%] bg-white/50 mt-[2%] rounded-lg transition-colors flex items-center gap-3
                  ${item.path ? "cursor-pointer hover:bg-white/70" : "cursor-not-allowed opacity-50"}`}
              >
                {item.icon}
                <h1 className="text-base font-bold">{item.label}</h1>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          className="w-full px-[5%] py-[4%] bg-white/50 mt-[5%] rounded-lg cursor-pointer hover:bg-white/70 transition-colors flex items-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <h1 className="text-base font-bold">LogOut</h1>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Navbar;
