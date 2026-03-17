import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import Dropdown from '../templates/Dropdown';
import Butterfly from '../templates/Butterfly';

const WorkerDashboard = () => {
  const date = moment().format('LL');
  const day = moment().format('dddd');
  const parent = useRef(null);

  const [workerInfo, setWorkerInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [todayUpdate, setTodayUpdate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/worker/profile', { withCredentials: true });
      setWorkerInfo(data?.worker);
      setProjects(data?.projects || []);
    } catch (err) {
      console.log('Worker fetch failed:', err.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/worker/notifications', { withCredentials: true });
      setNotifications((data?.notifications || []).filter(n => !n.read));
    } catch (_) {}
  };

  const dismissNotifications = async () => {
    try {
      await axios.post('http://localhost:3000/worker/notifications/read', {}, { withCredentials: true });
      setNotifications([]);
    } catch (_) {}
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const handleProjectSelect = async (projectName) => {
    const project = projects.find(p => p.projectName === projectName);
    if (!project) return;
    setSelectedProject(project);
    setShowForm(false);
    setTodayUpdate(null);
    setError('');
    try {
      const { data } = await axios.get(
        `http://localhost:3000/worker/today-update/${project._id}`,
        { withCredentials: true }
      );
      setTodayUpdate(data?.update || null);
    } catch (_) {
      setTodayUpdate(null);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const deletePhoto = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const replacePhoto = (index, file) => {
    URL.revokeObjectURL(previews[index]);
    const newPreviews = [...previews];
    const newImages = [...images];
    newPreviews[index] = URL.createObjectURL(file);
    newImages[index] = file;
    setPreviews(newPreviews);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (images.length < 3) {
      setError('Please upload at least 3 site photos.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('projectId', selectedProject._id);
      formData.append('notes', notes);
      images.forEach(img => formData.append('updateImages', img));

      const { data } = await axios.post(
        'http://localhost:3000/worker/update',
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setTodayUpdate(data?.update);
      setShowForm(false);
      setNotes('');
      setImages([]);
      setPreviews([]);
    } catch (err) {
      setError(err.response?.data || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const projectNames = projects.map(p => p.projectName);

  return (
    <div className='w-screen h-screen relative overflow-hidden'>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4'
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              src={lightbox}
              alt='preview'
              onClick={e => e.stopPropagation()}
              className='max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl'
            />
            <button
              onClick={() => setLightbox(null)}
              className='absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-xl'
            >
              <i className='ri-close-line'></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <Butterfly parent={parent} y={16} x={5} />
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      <main className='w-full h-full px-[8%] pt-[4%] pb-0 relative overflow-hidden flex flex-col'>
        <div className='max-w-3xl w-full mx-auto flex flex-col flex-1 overflow-hidden'>

          {/* Header */}
          <header className='shrink-0'>
            <div className='title w-full text-4xl md:text-5xl font-semibold tracking-tight mt-[6%] flex gap-[3%]'>
              <h1>Hi</h1>
              <h1 className='text-white'>{workerInfo?.name || 'Worker'} <span className='inline-block text-black'>!</span></h1>
            </div>
            <div className='subtitle w-full md:w-[65%] font-semibold mt-[1%] text-md opacity-70 leading-5 pl-[1%]'>
              <h4>Ready to post today's site update?</h4>
            </div>
            <div className='date-create w-full flex items-center mt-[3%] justify-between'>
              <div className='date flex pb-4 border-b-2 border-white items-center w-[50%] gap-4'>
                <div className='backdrop-blur-3xl px-2 py-2 bg-white/20 rounded-md leading-5 w-full font-bold'>
                  <h4>{date}</h4>
                  <h4>{day}</h4>
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <section ref={parent} className='w-full flex-1 relative z-10 overflow-y-auto overflow-x-hidden pb-6'>

            {/* Retake notifications */}
            <AnimatePresence>
              {notifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className='w-full mt-[6%] px-4 py-4 rounded-2xl bg-red-50 border border-red-300'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-start gap-3'>
                      <div className='w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0'>
                        <i className='ri-refresh-line text-red-500 text-lg'></i>
                      </div>
                      <div>
                        <p className='font-bold text-sm text-red-600'>Retake Requested</p>
                        {notifications.map((n, i) => (
                          <p key={i} className='text-sm opacity-80 leading-5 mt-0.5'>{n.message}</p>
                        ))}
                      </div>
                    </div>
                    <button onClick={dismissNotifications} className='shrink-0 text-red-400 active:scale-90 transition-transform'>
                      <i className='ri-close-line text-xl'></i>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Worker info card */}
            {workerInfo && (
              <div className='w-full mt-[10%] px-4 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center gap-4'>
                <div className='w-12 h-12 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                  <i className='ri-user-3-fill text-2xl text-white'></i>
                </div>
                <div className='font-semibold leading-5'>
                  <h3 className='text-lg'>{workerInfo.name}</h3>
                  <h4 className='text-sm opacity-60'>Site Worker</h4>
                </div>
              </div>
            )}

            {/* Project selection */}
            <div className='w-full mt-[8%]'>
              <div className='flex items-center gap-3 mb-2'>
                <figure className='w-8 h-8 shrink-0'>
                  <img className='w-full h-full object-cover' src='/images/hearts.png' alt='' />
                </figure>
                <h2 className='text-lg font-bold'>Select Project</h2>
              </div>

              {projectNames.length > 0 ? (
                <Dropdown
                  option={projectNames}
                  placeholder='Choose a project'
                  onSelect={handleProjectSelect}
                />
              ) : (
                <div className='w-full py-4 px-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-center'>
                  <p className='font-semibold opacity-70'>No projects assigned yet</p>
                </div>
              )}
            </div>

            {/* After project selected */}
            <AnimatePresence mode='wait'>
              {selectedProject && (
                <motion.div
                  key={selectedProject._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className='w-full mt-[8%]'
                >
                  {/* Project name */}
                  <h1 className='text-3xl font-bold uppercase'>{selectedProject.projectName}</h1>

                  {/* If update already posted today */}
                  {todayUpdate && !showForm ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='w-full mt-6 px-4 py-5 rounded-2xl bg-white/20 backdrop-blur-sm border border-[#883bbc]/40'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <div className='w-10 h-10 rounded-full bg-[#883bbc] flex items-center justify-center shrink-0'>
                          <i className='ri-check-line text-xl text-white'></i>
                        </div>
                        <div className='font-semibold leading-5'>
                          <h3 className='text-base'>Update already posted</h3>
                          <h4 className='text-sm opacity-60'>
                            {moment(todayUpdate.date).format('hh:mm A')} · {moment(todayUpdate.date).format('Do MMM YYYY')}
                          </h4>
                        </div>
                      </div>

                      {todayUpdate.notes && (
                        <p className='text-sm opacity-80 mb-3 px-1 leading-5'>{todayUpdate.notes}</p>
                      )}

                      {todayUpdate.updateImages?.length > 0 && (
                        <div className='flex gap-2 overflow-x-auto pb-2 mb-3'>
                          {todayUpdate.updateImages.map((src, i) => (
                            <div key={i} className='relative shrink-0 w-20 h-20'>
                              <img
                                src={src}
                                alt='update'
                                onClick={() => setLightbox(src)}
                                className='w-full h-full rounded-lg object-cover border border-white/30 cursor-pointer'
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setShowForm(true)}
                        className='w-full py-3 mt-2 rounded-xl bg-[#883bbc] text-white font-bold text-base active:scale-95 transition-transform'
                      >
                        <i className='ri-add-line mr-2'></i>Create Another Update
                      </button>
                    </motion.div>
                  ) : (

                    /* Update form */
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='w-full mt-6'
                    >
                      <div className='flex items-center gap-3 mb-4'>
                        <figure className='w-8 h-8 shrink-0'>
                          <img className='w-full h-full object-cover' src='/images/hearts.png' alt='' />
                        </figure>
                        <h2 className='text-lg font-bold'>Post Update</h2>
                      </div>

                      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                        {/* Notes */}
                        <div className='w-full relative'>
                          <div className='w-full h-full bg-[#f3a9de] rounded-xl top-[6px] -z-10 left-[4px] absolute'></div>
                          <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder='Site notes for today...'
                            rows={4}
                            className='w-full border border-black rounded-xl bg-white px-4 py-3 text-base font-semibold outline-none resize-none'
                          />
                        </div>

                        {/* Image upload — editable grid */}
                        <div className='w-full'>
                          <p className='text-sm font-semibold opacity-70 mb-2'>
                            Photos (min. 3) · {images.length} selected
                            {images.length > 0 && images.length < 3 && (
                              <span className='text-red-400 ml-1'>— need {3 - images.length} more</span>
                            )}
                          </p>
                          <div className='flex gap-2 overflow-x-auto pb-2'>
                            {previews.map((src, i) => (
                              <div key={i} className='relative shrink-0 w-20 h-20'>
                                <img
                                  src={src}
                                  alt='preview'
                                  onClick={() => setLightbox(src)}
                                  className='w-full h-full rounded-lg object-cover border border-white/30 cursor-pointer'
                                />
                                {/* Delete */}
                                <button
                                  type='button'
                                  onClick={() => deletePhoto(i)}
                                  className='absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs'
                                >
                                  <i className='ri-close-line'></i>
                                </button>
                                {/* Replace */}
                                <label className='absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs cursor-pointer'>
                                  <i className='ri-arrow-left-right-line'></i>
                                  <input type='file' accept='image/*' className='hidden' onChange={e => { if (e.target.files[0]) replacePhoto(i, e.target.files[0]); e.target.value = ''; }} />
                                </label>
                              </div>
                            ))}
                            {/* Add slot */}
                            <label className='shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-[#883bbc]/40 flex flex-col items-center justify-center cursor-pointer hover:border-[#883bbc] transition-colors'>
                              <i className='ri-image-add-line text-2xl text-[#883bbc] opacity-60'></i>
                              <span className='text-[10px] font-semibold opacity-50 mt-0.5'>Add</span>
                              <input type='file' accept='image/*' multiple className='hidden' onChange={handleImageChange} />
                            </label>
                          </div>
                        </div>

                        {error && <p className='text-red-500 font-semibold text-sm'>{error}</p>}

                        <button
                          type='submit'
                          disabled={submitting}
                          className='w-full py-3 rounded-xl bg-[#883bbc] text-white font-bold text-base active:scale-95 transition-transform disabled:opacity-60'
                        >
                          {submitting ? 'Posting...' : 'Submit Update'}
                        </button>

                        {showForm && (
                          <button
                            type='button'
                            onClick={() => setShowForm(false)}
                            className='w-full py-3 rounded-xl border border-[#883bbc] text-[#883bbc] font-bold text-base active:scale-95 transition-transform'
                          >
                            Cancel
                          </button>
                        )}
                      </form>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <article className='w-full leading-loose mt-[12%] mb-4'>
              <div className='flex items-center mt-[2%] w-full gap-4'>
                <div className='w-10 h-10 rounded-full bg-[#883bbc] items-center justify-center flex shrink-0'>
                  <i className='ri-arrow-up-fill text-2xl text-white opacity-90'></i>
                </div>
                <div className='text-md opacity-80 leading-5 font-bold'>
                  <h4>Scroll Up</h4>
                </div>
              </div>
              <h4 className='w-fit mt-[2%] px-2 backdrop-blur-md rounded-md text-4xl md:text-5xl font-bold'>Keep Up</h4>
              <h2 className='w-full text-5xl md:text-7xl font-bold text-white'>The Work<span className='inline-block text-black'>!</span></h2>
            </article>

          </section>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
