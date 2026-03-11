import { useRef, useState } from "react";
import Butterfly from "../../templates/Butterfly";
import PdfViewer from "../../templates/PdfViewer";
import Material from "./Material";
import Navbar from "../../templates/Navbar";
import { AnimatePresence, motion } from "motion/react";

const ProjectView = () => {
  const images = [
    "https://images.unsplash.com/photo-1629746958979-08060ed5bf0b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1626367771676-96d7bf35953f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1636071659185-5e2b6596a42c?q=80&w=1246&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const [isclick, setclick] = useState(0);
  const [isopen, setOpen] = useState(false);
  const src =
    "https://drive.google.com/file/d/1itead-F4Sv2P-h-JvpUHsFLbZz_GWzTg/view";
  const parent = useRef(null);
  const handleClick = () => {
    setclick((prev) => (prev + 1) % images.length);
  };

  return (
    <div ref={parent} className="w-screen min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isopen && <Navbar value={{ isopen, setOpen }} />}
      </AnimatePresence>

      <section className="overflow-hidden -z-10">
        <figure className="w-screen h-full absolute">
          <img className="w-full h-full object-cover" src="/images/background.png" alt="" />
        </figure>
        <Butterfly parent={parent} y={13} x={10} />
      </section>

      <main className="w-full min-h-screen px-[8%] py-[6%] relative overflow-hidden">
        <div className="max-w-3xl mx-auto">

          <header>
            <div className="title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex">
              <h1 className="text-white">Design</h1>
              <h1 className="text-black">View</h1>
            </div>
            <div className="subtitle w-full md:w-[60%] mt-[2%] border-b-2 border-white pb-[5%] font-semibold text-md opacity-70 leading-5 px-[1%]">
              <h4>Full detailed Project's design.</h4>
            </div>

            {/* Menu button — fixed top-right */}
            <nav className="z-10 fixed top-4 right-4 md:top-6 md:right-8">
              <motion.div
                onClick={() => setOpen(!isopen)}
                className="menuicon w-10 h-10 md:w-12 md:h-12 items-center justify-center flex cursor-pointer">
                <i className="ri-menu-fill text-3xl text-white opacity-90"></i>
              </motion.div>
            </nav>
          </header>

          <section className="main-container w-full relative z-10 overflow-y-auto overflow-x-hidden pb-[10%]">
            <section className="title w-full mt-[10%]">
              <div className="w-full">
                <h1 className="text-3xl md:text-4xl w-full leading-9 uppercase font-bold">
                  Malabar Exotica
                </h1>
              </div>
              <div className="sub-text opacity-80 mt-[2%] text-sm">
                <h4 className="leading-5">
                  B203 Akash Residency near Dev city, Opp Nirman Tower. Ahmedabd, Gujarat, India
                </h4>
              </div>
            </section>

            <div className="stat w-full mt-[2%] rounded-lg">
              <div className="stat-1 w-full py-2 bg-gradient-to-tr from-[#F7D6F3] to-transparent px-2 flex rounded-lg backdrop-blur-lg items-center justify-between">
                <h1 className="text-md font-bold opacity-60">Total Carpet Area:</h1>
                <h2 className="text-lg font-semibold opacity-80">1200sq</h2>
              </div>
              <div className="stat-1 w-full py-2 bg-gradient-to-bl from-[#F7D6F3] to-transparent px-2 flex rounded-lg backdrop-blur-lg items-center justify-between mt-[1%]">
                <h1 className="text-md font-bold opacity-60">Total BHK:</h1>
                <h2 className="text-lg font-semibold opacity-80">3.5</h2>
              </div>
            </div>

            <section className="w-full mt-[5%]">
              <div className="w-full flex items-center">
                <figure className="w-28 h-10 md:w-36 md:h-12 ml-auto shrink-0">
                  <img className="w-full h-full object-cover" src="/images/hearts.png" alt="" />
                </figure>
                <h2 className="flex items-center justify-end text-lg font-bold ml-2 whitespace-nowrap">
                  Design
                </h2>
              </div>
              <div className="pdg-viewer w-full min-h-[60vh] mt-[2%] bg-red-500">
                <PdfViewer pdfUrl={src} />
              </div>
              <div className="download-button w-full px-2 py-2 mt-[2%] bg-[#883bbc] rounded-lg flex items-center justify-center font-semibold text-white text-lg">
                Download
              </div>
            </section>

            <section className="w-full mt-[10%]">
              <div className="w-full flex items-center">
                <figure className="w-28 h-10 md:w-36 md:h-12 ml-auto shrink-0">
                  <img className="w-full h-full object-cover" src="/images/hearts.png" alt="" />
                </figure>
                <h2 className="flex items-center justify-end text-lg font-bold ml-2 whitespace-nowrap">
                  Material
                </h2>
              </div>
            </section>

            <div className="w-full mt-[2%]">
              <Material />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ProjectView;
