import { useEffect, useRef, useState } from "react";
import Butterfly from "../../templates/Butterfly";
import PdfViewer from "../../templates/PdfViewer";
import Material from "./Material";
import Navbar from "../../templates/Navbar";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { API_BASE } from '../../config.js'
import ModelViewer from "../client/ModelViewer";

const ProjectView = () => {
  const [isopen, setOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [show3D, setShow3D] = useState(false);
  const parent = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/user/profile`, { withCredentials: true })
      .then(({ data }) => setProject(data?.project))
      .catch(console.error);
  }, []);

  return (
    <div ref={parent} className="w-screen min-h-screen relative overflow-hidden">
      {show3D && project?.modelGlbUrl && (
        <ModelViewer url={project.modelGlbUrl} onClose={() => setShow3D(false)} />
      )}

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
                  {project?.projectName || '—'}
                </h1>
              </div>
            </section>

            <div className="stat w-full mt-[2%] rounded-lg">
              <div className="stat-1 w-full py-2 bg-gradient-to-tr from-[#F7D6F3] to-transparent px-2 flex rounded-lg backdrop-blur-lg items-center justify-between">
                <h1 className="text-md font-bold opacity-60">Total Carpet Area:</h1>
                <h2 className="text-lg font-semibold opacity-80">{project?.squareFeet ? `${project.squareFeet} sq ft` : '—'}</h2>
              </div>
              <div className="stat-1 w-full py-2 bg-gradient-to-bl from-[#F7D6F3] to-transparent px-2 flex rounded-lg backdrop-blur-lg items-center justify-between mt-[1%]">
                <h1 className="text-md font-bold opacity-60">Total Rooms:</h1>
                <h2 className="text-lg font-semibold opacity-80">{project?.totalRooms ?? '—'}</h2>
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
              {project?.designPdfUrl ? (
                <>
                  <div className="pdg-viewer w-full min-h-[60vh] mt-[2%]">
                    <PdfViewer pdfUrl={project.designPdfUrl} />
                  </div>
                  <a
                    href={project.designPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-button w-full px-2 py-2 mt-[2%] bg-[#883bbc] rounded-lg flex items-center justify-center font-semibold text-white text-lg"
                  >
                    Download
                  </a>
                </>
              ) : (
                <div className="w-full min-h-[20vh] mt-[2%] rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent flex items-center justify-center">
                  <p className="text-sm font-semibold opacity-50">No design PDF uploaded yet.</p>
                </div>
              )}
            </section>

            {/* 3D Model section */}
            <section className="w-full mt-[10%]">
              <div className="w-full flex items-center">
                <figure className="w-28 h-10 md:w-36 md:h-12 ml-auto shrink-0">
                  <img className="w-full h-full object-cover" src="/images/hearts.png" alt="" />
                </figure>
                <h2 className="flex items-center justify-end text-lg font-bold ml-2 whitespace-nowrap">
                  3D Model
                </h2>
              </div>

              {project?.modelGlbUrl ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full mt-[2%] rounded-xl bg-gradient-to-br from-[#F7D6F3] to-transparent border border-[#883bbc]/30 px-4 py-5 flex flex-col gap-3"
                >
                  {/* Preview thumbnail / call-to-action */}
                  <div className="w-full rounded-lg bg-black/10 border border-[#883bbc]/20 flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center">
                      <i className="ri-box-3-line text-3xl text-[#883bbc]"></i>
                    </div>
                    <p className="text-sm font-semibold opacity-60">Interactive 3D design is ready</p>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShow3D(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#883bbc] text-white font-bold text-sm shadow"
                    >
                      <i className="ri-eye-line text-base"></i>
                      View 3D Design
                    </motion.button>
                  </div>

                  {/* Download */}
                  <a
                    href={project.modelGlbUrl}
                    download
                    className="w-full px-2 py-3 bg-white/60 border border-[#883bbc]/30 rounded-lg flex items-center justify-center gap-2 font-semibold text-[#883bbc] text-sm"
                  >
                    <i className="ri-download-2-line text-lg"></i>
                    Download 3D Model (.glb)
                  </a>
                </motion.div>
              ) : (
                <div className="w-full min-h-[12vh] mt-[2%] rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent flex items-center justify-center">
                  <p className="text-sm font-semibold opacity-50">No 3D model uploaded yet.</p>
                </div>
              )}
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
