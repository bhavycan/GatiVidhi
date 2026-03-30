import { useEffect, useRef, useState } from "react";
import Butterfly from "../../templates/Butterfly";
import PdfViewer from "../../templates/PdfViewer";
import Material from "./Material";
import Navbar from "../../templates/Navbar";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { API_BASE } from '../../config.js'
import ARViewer from "../client/ARViewer";

const ProjectView = () => {
  const [isopen, setOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [arDesigns, setArDesigns] = useState([]);
  const [viewArUrl, setViewArUrl] = useState(null);
  const parent = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/user/profile`, { withCredentials: true })
      .then(({ data }) => {
        setProject(data?.project);
        if (data?.project?._id) {
          return axios.get(`${API_BASE}/ar/project/${data.project._id}`, { withCredentials: true });
        }
      })
      .then(res => { if (res) setArDesigns(res.data); })
      .catch(console.error);
  }, []);

  return (
    <div ref={parent} className="w-screen min-h-screen relative overflow-hidden">
      {viewArUrl && <ARViewer url={viewArUrl} onClose={() => setViewArUrl(null)} />}

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

            {/* AR Designs section */}
            <section className="w-full mt-[10%]">
              <div className="w-full flex items-center mb-3">
                <figure className="w-28 h-10 md:w-36 md:h-12 ml-auto shrink-0">
                  <img className="w-full h-full object-cover" src="/images/hearts.png" alt="" />
                </figure>
                <h2 className="flex items-center justify-end text-lg font-bold ml-2 whitespace-nowrap">
                  AR Designs
                </h2>
              </div>

              {arDesigns.length === 0 ? (
                <div className="w-full min-h-[12vh] rounded-lg bg-gradient-to-br from-[#F7D6F3] to-transparent flex items-center justify-center">
                  <p className="text-sm font-semibold opacity-50">No AR designs available yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {arDesigns.map(design => (
                    <motion.div
                      key={design._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-gradient-to-br from-[#F7D6F3] to-transparent rounded-xl px-4 py-4 flex items-center gap-3 border border-[#883bbc]/20"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#883bbc]/10 border border-[#883bbc]/30 flex items-center justify-center shrink-0">
                        <i className="ri-box-3-line text-xl text-[#883bbc]"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{design.title}</p>
                        <p className="text-xs opacity-40 font-semibold mt-0.5">Tap to explore in AR</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setViewArUrl(design.glbUrl)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#883bbc] text-white font-bold text-xs shadow shrink-0"
                      >
                        <i className="ri-camera-lens-line text-sm"></i>
                        View AR
                      </motion.button>
                    </motion.div>
                  ))}
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
