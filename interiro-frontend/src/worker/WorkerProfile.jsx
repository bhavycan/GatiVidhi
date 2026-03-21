import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../config.js'

const Field = ({ icon, label, value, editing, onChange, disabled = false }) => (
  <div className='w-full'>
    <p className='text-xs font-bold text-[#883bbc] uppercase tracking-widest mb-1 pl-1'>{label}</p>
    <div className='w-full h-12 relative z-0'>
      <div className='w-full h-full bg-[#f3a9de] rounded-md top-[8px] -z-10 left-[5px] absolute'></div>
      <div className={`w-full border border-black h-full flex rounded-md overflow-hidden items-center ${disabled ? 'opacity-60' : ''}`}>
        <div className='icon w-12 bg-white flex items-center justify-center h-full shrink-0'>
          <i className={`${icon} text-xl opacity-55`}></i>
        </div>
        <input
          type='text'
          value={value}
          onChange={onChange}
          readOnly={!editing || disabled}
          className={`bg-white outline-none flex-1 h-full px-3 text-sm font-semibold ${!editing || disabled ? 'cursor-default' : 'cursor-text'}`}
        />
      </div>
    </div>
  </div>
)

const WorkerProfile = () => {
  const navigate = useNavigate()

  const [worker, setWorker] = useState({ name: '', email: '', assignedProjectId: null, assignedClientId: null })
  const [formName, setFormName] = useState('')
  const [editing, setEditing] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const [pwdSection, setPwdSection] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdMsg, setPwdMsg] = useState({ text: '', error: false })

  useEffect(() => {
    axios.get(`${API_BASE}/worker/profile`, { withCredentials: true })
      .then(({ data }) => {
        setWorker(data.worker)
        setFormName(data.worker.name)
      })
      .catch(() => navigate('/worker/login'))
  }, [])

  const handleSave = async () => {
    setSaveLoading(true); setSaveMsg('')
    try {
      const { data } = await axios.post(`${API_BASE}/worker/update-self`, { name: formName }, { withCredentials: true })
      setWorker(prev => ({ ...prev, name: data.worker.name }))
      setEditing(false); setSaveMsg('Profile updated!')
    } catch (err) {
      setSaveMsg(err.response?.data || 'Failed to update')
    } finally { setSaveLoading(false) }
  }

  const handleSendOtp = async () => {
    setOtpLoading(true); setPwdMsg({ text: '', error: false })
    try {
      await axios.post(`${API_BASE}/worker/send-otp`, {}, { withCredentials: true })
      setOtpSent(true); setPwdMsg({ text: 'OTP sent to your registered email!', error: false })
    } catch (err) {
      setPwdMsg({ text: err.response?.data || 'Failed to send OTP', error: true })
    } finally { setOtpLoading(false) }
  }

  const handleChangePassword = async () => {
    if (!otp || !newPassword || !confirmPassword)
      return setPwdMsg({ text: 'All fields are required', error: true })
    if (newPassword !== confirmPassword)
      return setPwdMsg({ text: 'Passwords do not match', error: true })
    if (newPassword.length < 6)
      return setPwdMsg({ text: 'Password must be at least 6 characters', error: true })
    setPwdLoading(true); setPwdMsg({ text: '', error: false })
    try {
      await axios.post(`${API_BASE}/worker/verify-change-password`, { otp, newPassword }, { withCredentials: true })
      setPwdMsg({ text: 'Password changed successfully!', error: false })
      setOtp(''); setNewPassword(''); setConfirmPassword(''); setOtpSent(false)
      setTimeout(() => setPwdSection(false), 2000)
    } catch (err) {
      setPwdMsg({ text: err.response?.data || 'Failed to change password', error: true })
    } finally { setPwdLoading(false) }
  }

  const togglePwdSection = () => {
    setPwdSection(v => !v)
    setOtpSent(false); setOtp(''); setNewPassword(''); setConfirmPassword('')
    setPwdMsg({ text: '', error: false })
  }

  const projectName = worker.assignedProjectId?.projectName || null
  const clientName = worker.assignedClientId?.name || null

  return (
    <div className='w-screen min-h-screen relative overflow-hidden'>
      {/* Background */}
      <section className='overflow-hidden -z-10'>
        <figure className='w-screen h-full absolute'>
          <img className='w-full h-full object-cover' src='/images/background.png' alt='' />
        </figure>
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute top-[18%] right-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly.png' alt='' />
        </figure>
        <figure className='w-24 h-28 md:w-32 md:h-40 absolute bottom-[2%] left-[10%]'>
          <img className='w-full h-full object-cover' src='/images/butterfly2.png' alt='' />
        </figure>
      </section>

      <main className='w-full min-h-screen relative z-10 px-[8%] py-[14%] md:py-[6%] flex flex-col items-center'>
        <div className='w-full max-w-md'>

          {/* Header */}
          <header className='mb-8'>
            <button
              onClick={() => navigate('/worker/profile')}
              className='flex items-center gap-2 text-white opacity-70 hover:opacity-100 transition-opacity mb-4'>
              <i className='ri-arrow-left-line text-xl'></i>
              <span className='font-semibold text-sm'>Back</span>
            </button>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-full bg-[#f3a9de] border-2 border-[#883bbc] flex items-center justify-center shrink-0'>
                <i className='ri-tools-line text-3xl text-[#883bbc]'></i>
              </div>
              <div>
                <h1 className='text-3xl font-bold'>{worker.name || '—'}</h1>
                <p className='text-sm text-white opacity-70 font-medium'>{worker.email}</p>
                <span className='text-xs bg-[#883bbc] text-white px-2 py-0.5 rounded-full font-semibold mt-1 inline-block'>Site Worker</span>
              </div>
            </div>
          </header>

          {/* Assignment Card */}
          {(projectName || clientName) && (
            <div className='relative z-0 mb-4'>
              <div className='w-full h-full bg-[#f3a9de] rounded-2xl absolute top-[8px] left-[8px] -z-10'></div>
              <div className='bg-white rounded-2xl border border-black px-5 py-4 flex flex-col gap-3'>
                <h2 className='text-base font-bold mb-1'>Current Assignment</h2>
                {projectName && (
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-[#f3a9de] flex items-center justify-center shrink-0'>
                      <i className='ri-building-2-line text-lg text-[#883bbc]'></i>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 font-semibold uppercase tracking-wide'>Project</p>
                      <p className='font-bold text-sm'>{projectName}</p>
                    </div>
                  </div>
                )}
                {clientName && (
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-[#f3a9de] flex items-center justify-center shrink-0'>
                      <i className='ri-user-3-line text-lg text-[#883bbc]'></i>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 font-semibold uppercase tracking-wide'>Client</p>
                      <p className='font-bold text-sm'>{clientName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className='relative z-0 mb-4'>
            <div className='w-full h-full bg-[#f3a9de] rounded-2xl absolute top-[8px] left-[8px] -z-10'></div>
            <div className='bg-white rounded-2xl border border-black px-5 py-5 flex flex-col gap-4'>
              <div className='flex items-center justify-between mb-1'>
                <h2 className='text-lg font-bold'>My Information</h2>
                {!editing
                  ? <button onClick={() => { setFormName(worker.name); setEditing(true); setSaveMsg('') }}
                      className='flex items-center gap-1 text-sm font-semibold text-[#883bbc] hover:opacity-70 transition-opacity'>
                      <i className='ri-pencil-line'></i> Edit
                    </button>
                  : <div className='flex gap-3'>
                      <button onClick={() => setEditing(false)} className='text-sm font-semibold text-gray-400'>Cancel</button>
                      <button onClick={handleSave} disabled={saveLoading}
                        className='text-sm font-semibold text-white bg-[#883bbc] px-3 py-1 rounded-lg hover:opacity-80 transition-opacity'>
                        {saveLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                }
              </div>

              <Field icon='ri-user-line' label='Full Name' value={editing ? formName : worker.name}
                editing={editing} onChange={e => setFormName(e.target.value)} />
              <Field icon='ri-mail-line' label='Email Address' value={worker.email}
                editing={false} disabled onChange={() => {}} />

              {saveMsg && (
                <p className={`text-sm font-semibold text-center ${saveMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className='relative z-0 mb-10'>
            <div className='w-full h-full bg-[#f3a9de] rounded-2xl absolute top-[8px] left-[8px] -z-10'></div>
            <div className='bg-white rounded-2xl border border-black px-5 py-5'>
              <button onClick={togglePwdSection} className='w-full flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-full bg-[#f3a9de] flex items-center justify-center'>
                    <i className='ri-lock-password-line text-lg text-[#883bbc]'></i>
                  </div>
                  <h2 className='text-base font-bold'>Change Password</h2>
                </div>
                <i className={`ri-arrow-${pwdSection ? 'up' : 'down'}-s-line text-xl text-gray-400`}></i>
              </button>

              <AnimatePresence>
                {pwdSection && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className='overflow-hidden'>
                    <div className='flex flex-col gap-4 mt-5'>
                      {!otpSent ? (
                        <div className='flex flex-col gap-3'>
                          <p className='text-sm text-gray-500 leading-5'>
                            We'll send a 6-digit OTP to <strong>{worker.email}</strong> to verify your identity.
                          </p>
                          <button onClick={handleSendOtp} disabled={otpLoading}
                            className='w-full py-3 rounded-xl bg-[#883bbc] text-white font-bold text-sm hover:opacity-80 transition-opacity'>
                            {otpLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                          </button>
                        </div>
                      ) : (
                        <div className='flex flex-col gap-3'>
                          {[
                            { label: 'OTP Code', icon: 'ri-shield-keyhole-line', value: otp, setter: setOtp, type: 'text', maxLen: 6, extra: 'tracking-widest', show: null, setShow: null },
                            { label: 'New Password', icon: 'ri-lock-line', value: newPassword, setter: setNewPassword, type: showNew ? 'text' : 'password', maxLen: null, extra: '', show: showNew, setShow: setShowNew },
                            { label: 'Confirm Password', icon: 'ri-lock-2-line', value: confirmPassword, setter: setConfirmPassword, type: showConfirm ? 'text' : 'password', maxLen: null, extra: '', show: showConfirm, setShow: setShowConfirm },
                          ].map(({ label, icon, value, setter, type, maxLen, extra, show, setShow }) => (
                            <div key={label}>
                              <p className='text-xs font-bold text-[#883bbc] uppercase tracking-widest mb-1 pl-1'>{label}</p>
                              <div className='w-full h-12 relative z-0'>
                                <div className='w-full h-full bg-[#f3a9de] rounded-md top-[8px] -z-10 left-[5px] absolute'></div>
                                <div className='w-full border border-black h-full flex rounded-md overflow-hidden items-center'>
                                  <div className='w-12 bg-white flex items-center justify-center h-full shrink-0'>
                                    <i className={`${icon} text-xl opacity-55`}></i>
                                  </div>
                                  <input type={type} maxLength={maxLen} value={value}
                                    onChange={e => setter(e.target.value)}
                                    className={`bg-white outline-none flex-1 h-full px-3 text-sm font-semibold ${extra}`} />
                                  {setShow && (
                                    <button type='button' onClick={() => setShow(v => !v)}
                                      className='w-12 bg-white h-full flex items-center justify-center shrink-0'>
                                      <i className={`${show ? 'ri-eye-off-line' : 'ri-eye-line'} text-lg opacity-55`}></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className='flex gap-2 mt-1'>
                            <button onClick={handleSendOtp} disabled={otpLoading}
                              className='flex-1 py-2 rounded-xl border border-[#883bbc] text-[#883bbc] font-semibold text-sm hover:bg-[#f3a9de]/30 transition-colors'>
                              {otpLoading ? 'Resending...' : 'Resend OTP'}
                            </button>
                            <button onClick={handleChangePassword} disabled={pwdLoading}
                              className='flex-1 py-2 rounded-xl bg-[#883bbc] text-white font-bold text-sm hover:opacity-80 transition-opacity'>
                              {pwdLoading ? 'Changing...' : 'Change Password'}
                            </button>
                          </div>
                        </div>
                      )}
                      {pwdMsg.text && (
                        <p className={`text-sm font-semibold text-center ${pwdMsg.error ? 'text-red-500' : 'text-green-600'}`}>
                          {pwdMsg.text}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default WorkerProfile
