import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { API_BASE } from '../config.js'

// role: 'user' | 'admin' | 'worker'
const ForgotPassword = ({ role, onClose }) => {
  const [step, setStep] = useState(1) // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', error: false })
  const [done, setDone] = useState(false)

  const sendOtp = async () => {
    if (!email) return setMsg({ text: 'Please enter your email', error: true })
    setLoading(true); setMsg({ text: '', error: false })
    try {
      await axios.post(`${API_BASE}/${role}/forgot-password`, { email })
      setStep(2)
      setMsg({ text: 'OTP sent! Check your inbox.', error: false })
    } catch (err) {
      setMsg({ text: err.response?.data || 'Failed to send OTP', error: true })
    } finally { setLoading(false) }
  }

  const resetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword)
      return setMsg({ text: 'All fields are required', error: true })
    if (newPassword !== confirmPassword)
      return setMsg({ text: 'Passwords do not match', error: true })
    if (newPassword.length < 6)
      return setMsg({ text: 'Password must be at least 6 characters', error: true })
    setLoading(true); setMsg({ text: '', error: false })
    try {
      await axios.post(`${API_BASE}/${role}/reset-password`, { email, otp, newPassword })
      setDone(true)
      setMsg({ text: 'Password reset successfully! You can now log in.', error: false })
    } catch (err) {
      setMsg({ text: err.response?.data || 'Failed to reset password', error: true })
    } finally { setLoading(false) }
  }

  const inputRow = (icon, placeholder, value, onChange, type = 'text', toggleShow = null, show = false) => (
    <div className='w-full h-12 relative z-0'>
      <div className='w-full h-full bg-[#f3a9de] rounded-md top-[8px] -z-10 left-[5px] absolute'></div>
      <div className='w-full border border-black h-full flex rounded-md overflow-hidden items-center bg-white'>
        <div className='w-12 flex items-center justify-center h-full shrink-0'>
          <i className={`${icon} text-xl opacity-55`}></i>
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className='bg-white outline-none flex-1 h-full px-3 text-sm font-semibold'
        />
        {toggleShow && (
          <button type='button' onClick={toggleShow}
            className='w-12 h-full flex items-center justify-center shrink-0'>
            <i className={`${show ? 'ri-eye-off-line' : 'ri-eye-line'} text-lg opacity-55`}></i>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/50 backdrop-blur-sm'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className='relative w-full max-w-sm'
        onClick={e => e.stopPropagation()}
      >
        {/* Pink shadow layer */}
        <div className='w-full h-full bg-[#f3a9de] rounded-2xl absolute top-[8px] left-[8px] -z-10'></div>

        <div className='bg-white rounded-2xl border border-black px-6 py-6 flex flex-col gap-5'>

          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-[#f3a9de] flex items-center justify-center shrink-0'>
                <i className='ri-lock-unlock-line text-lg text-[#883bbc]'></i>
              </div>
              <div>
                <h2 className='text-base font-bold leading-tight'>Forgot Password</h2>
                <p className='text-xs text-gray-400 font-medium'>
                  {step === 1 ? 'Enter your email to receive an OTP' : 'Enter OTP and new password'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'>
              <i className='ri-close-line text-gray-500 text-lg'></i>
            </button>
          </div>

          {/* Step indicator */}
          <div className='flex items-center gap-2'>
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-[#883bbc]' : 'bg-gray-200'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-[#883bbc]' : 'bg-gray-200'}`}></div>
          </div>

          <AnimatePresence mode='wait'>
            {step === 1 && (
              <motion.div key='step1'
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className='flex flex-col gap-4'>

                {inputRow('ri-mail-line', 'Your registered email', email, e => setEmail(e.target.value), 'email')}

                <button onClick={sendOtp} disabled={loading}
                  className='w-full py-3 rounded-xl bg-[#883bbc] text-white font-bold text-sm hover:opacity-80 transition-opacity disabled:opacity-60'>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </motion.div>
            )}

            {step === 2 && !done && (
              <motion.div key='step2'
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}
                className='flex flex-col gap-3'>

                <p className='text-xs text-gray-500 -mt-1'>
                  OTP sent to <strong>{email}</strong>
                </p>

                {inputRow('ri-shield-keyhole-line', '6-digit OTP', otp, e => setOtp(e.target.value), 'text')}
                {inputRow('ri-lock-line', 'New password', newPassword, e => setNewPassword(e.target.value),
                  showNew ? 'text' : 'password', () => setShowNew(v => !v), showNew)}
                {inputRow('ri-lock-2-line', 'Confirm password', confirmPassword, e => setConfirmPassword(e.target.value),
                  showConfirm ? 'text' : 'password', () => setShowConfirm(v => !v), showConfirm)}

                <div className='flex gap-2 mt-1'>
                  <button onClick={() => { setStep(1); setMsg({ text: '', error: false }) }}
                    className='flex-1 py-2 rounded-xl border border-[#883bbc] text-[#883bbc] font-semibold text-sm hover:bg-[#f3a9de]/30 transition-colors'>
                    Back
                  </button>
                  <button onClick={resetPassword} disabled={loading}
                    className='flex-1 py-2 rounded-xl bg-[#883bbc] text-white font-bold text-sm hover:opacity-80 transition-opacity disabled:opacity-60'>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>

                <button onClick={sendOtp} disabled={loading}
                  className='text-xs text-center text-[#883bbc] font-semibold hover:opacity-70 transition-opacity'>
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              </motion.div>
            )}

            {done && (
              <motion.div key='done'
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className='flex flex-col items-center gap-3 py-2'>
                <div className='w-14 h-14 rounded-full bg-green-100 flex items-center justify-center'>
                  <i className='ri-checkbox-circle-line text-3xl text-green-500'></i>
                </div>
                <p className='text-sm font-bold text-green-600 text-center'>Password reset successfully!</p>
                <p className='text-xs text-gray-400 text-center'>You can now log in with your new password.</p>
                <button onClick={onClose}
                  className='w-full py-3 mt-1 rounded-xl bg-[#883bbc] text-white font-bold text-sm hover:opacity-80 transition-opacity'>
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {msg.text && !done && (
            <p className={`text-xs font-semibold text-center -mt-2 ${msg.error ? 'text-red-500' : 'text-green-600'}`}>
              {msg.text}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ForgotPassword
