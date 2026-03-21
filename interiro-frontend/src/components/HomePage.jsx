import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      label: "Admin",
      icon: "ri-shield-user-line",
      desc: "Manage projects, tasks and reports",
      path: "/admin/login",
    },
    {
      label: "Client",
      icon: "ri-user-3-line",
      desc: "Track your project progress",
      path: "/user/login",
    },
    {
      label: "Worker",
      icon: "ri-tools-line",
      desc: "View daily tasks and updates",
      path: "/worker/login",
    },
  ];

  return (
    <div className="login w-full min-h-screen relative overflow-hidden">
      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img
            className="w-full h-full object-cover"
            src="/images/background.png"
            alt=""
          />
        </figure>
        <figure className="w-24 h-28 md:w-32 md:h-40 absolute top-[18%] right-[10%]">
          <img
            className="w-full h-full object-cover"
            src="/images/butterfly.png"
            alt=""
          />
        </figure>
        <figure className="w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]">
          <img
            className="w-full h-full object-cover"
            src="/images/butterfly2.png"
            alt=""
          />
        </figure>
      </section>

      <main className="w-full min-h-screen relative z-40 flex flex-col items-center justify-center px-[8%] py-[10%]">
        <header className="text-center mb-12 ">
          <div className="text-5xl md:text-6xl font-semibold tracking-tight flex justify-center mt-[10%]">
            <h1>Gati</h1>
            <h1 className="text-zinc-500">Vidhi</h1>
          </div>
          <p className="text-zinc-500 font-bold text-md opacity-70 mt-3">
            Welcome! Who are you?
          </p>
        </header>

        <div className="w-full max-w-sm flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.label}
              onClick={() => navigate(role.path)}
              className="relative flex items-center gap-4 bg-white rounded-xl px-5 py-3 border border-black shadow-md hover:shadow-[#883bbc] hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="w-full h-full bg-[#f3a9de] rounded-xl absolute top-[5px] left-[5px] -z-10"></div>
              <div className="w-10 h-10 rounded-full bg-[#f3a9de] flex items-center justify-center shrink-0">
                <i className={`${role.icon} text-xl text-[#883bbc]`}></i>
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold tracking-tight">
                  {role.label}
                </h2>
                <p className="text-xs text-gray-500 font-medium leading-4">
                  {role.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm mt-16 opacity-40 text-white font-semibold">
          All rights @ GatiVidhi
        </p>
      </main>
    </div>
  );
};

export default HomePage;
