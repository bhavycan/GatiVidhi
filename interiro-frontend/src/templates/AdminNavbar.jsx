import { motion } from "motion/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminNavbar = ({ value }) => {
  const { setOpen } = value;
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard",  icon: "ri-dashboard-line",       path: "/admin/profile" },
  ];

  const actionItems = [
    { label: "Updates",  icon: "ri-refresh-line",         path: "/admin/updates" },
    { label: "Task",     icon: "ri-task-line",            path: "/admin/task" },
    { label: "Tickets",  icon: "ri-ticket-line",          path: "/admin/tickets" },
    { label: "Client",   icon: "ri-user-add-line",        path: "/admin/client" },
    { label: "Project",  icon: "ri-folder-add-line",      path: "/admin/project" },
    { label: "Notes",    icon: "ri-sticky-note-line",     path: "/admin/notes" },
    { label: "Templates", icon: "ri-layout-3-line",        path: "/admin/templates" },
    { label: "Material",  icon: "ri-hammer-line",           path: "/admin/material" },
    { label: "Workers",   icon: "ri-user-settings-line",    path: "/admin/worker" },
  ];

  const handleNav = (path) => {
    if (!path) return;
    setOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/admin/logout", {}, { withCredentials: true });
    } catch (_) {
      // proceed regardless
    }
    setOpen(false);
    navigate("/admin/login");
  };

  useEffect(() => {
    const handleClick = (event) => {
      if (
        !event.target.closest(".admin-menu") &&
        !event.target.closest(".admin-menuicon")
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
      <motion.div className="admin-menu w-[75%] sm:w-[55%] md:w-[35%] lg:w-[25%] min-h-full relative px-3 py-4 flex items-center flex-col bg-gradient-to-br from-[#F7D6F3] to-transparent bg-black/30 ml-auto">
        <div className="menu-title w-full text-4xl font-semibold text-white pb-2 border-b-2">
          <h1>Admin</h1>
          <h1 className="bg-white/50 w-fit text-black">Panel!</h1>
        </div>

        {/* Main nav */}
        <div className="part-1 w-full mt-[10%] pb-[10%] border-b-2 border-white">
          <h2 className="w-full font-semibold opacity-80 text-xl">Projects:</h2>
          <div className="tags w-full flex flex-col items-center justify-center mt-[2%]">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNav(item.path)}
                className={`w-full px-[5%] py-[4%] bg-white/50 mt-[2%] rounded-lg transition-colors flex items-center gap-3
                  ${item.path ? "cursor-pointer hover:bg-white/70" : "cursor-not-allowed opacity-50"}`}
              >
                <i className={`${item.icon} text-lg text-[#883bbc]`}></i>
                <h1 className="text-base font-bold">{item.label}</h1>
              </div>
            ))}
          </div>
        </div>

        {/* Action nav */}
        <div className="part-2 w-full mt-[5%] pb-[10%] border-b-2 border-white">
          <h2 className="w-full font-semibold opacity-80 text-xl">Actions:</h2>
          <div className="tags w-full flex flex-col items-center justify-center mt-[2%]">
            {actionItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleNav(item.path)}
                className={`w-full px-[5%] py-[4%] bg-white/50 mt-[2%] rounded-lg transition-colors flex items-center gap-3
                  ${item.path ? "cursor-pointer hover:bg-white/70" : "cursor-not-allowed opacity-50"}`}
              >
                <i className={`${item.icon} text-lg text-[#883bbc]`}></i>
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
          <i className="ri-logout-box-r-line text-lg text-[#883bbc]"></i>
          <h1 className="text-base font-bold">LogOut</h1>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminNavbar;
