import { useState } from 'react'
import axios from 'axios'
import { Eye, EyeOff, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

export default function Login({ onLogin }) {
  const [view, setView] = useState('login') // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post(`${BASE_URL}/admin/login`, { email, password }, { withCredentials: true })
      onLogin()
    } catch (err) {
      setError(err.response?.data || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await axios.post(`${BASE_URL}/admin/forgot-password`, { email }, { withCredentials: true })
      setInfo('OTP sent to your email')
      setView('reset')
    } catch (err) {
      setError(err.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post(`${BASE_URL}/admin/reset-password`, { email, otp, newPassword }, { withCredentials: true })
      setInfo('Password reset successful. Please log in.')
      setView('login')
      setOtp('')
      setNewPassword('')
    } catch (err) {
      setError(err.response?.data || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--body-bg, #f5f3ff)' }}>
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, #883bbc, #b96ddc)' }}>G</div>
          <h1 className="text-2xl font-black text-gray-900">GatiVidhi</h1>
          <p className="text-sm text-gray-400 mt-1">Interior Design Admin</p>
        </div>

        <div className="bg-white rounded-3xl p-8 card-shadow">

          {/* LOGIN */}
          {view === 'login' && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-xs text-gray-400 mb-6">Sign in to your admin account</p>

              {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-4">{error}</div>}
              {info  && <div className="text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 mb-4">{info}</div>}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 transition-colors">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <input type="email" required
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                      placeholder="admin@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 transition-colors">
                    <Lock size={14} className="text-gray-400 flex-shrink-0" />
                    <input type={showPass ? 'text' : 'password'} required
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                      placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => { setView('forgot'); setError(''); setInfo('') }}
                    className="text-xs font-semibold" style={{ color: '#883bbc' }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #883bbc, #b96ddc)' }}>
                  {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={15}/></>)}
                </button>
              </form>
            </>
          )}

          {/* FORGOT PASSWORD */}
          {view === 'forgot' && (
            <>
              <button onClick={() => { setView('login'); setError(''); setInfo('') }}
                className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Back to login
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Reset password</h2>
              <p className="text-xs text-gray-400 mb-6">We'll send an OTP to your admin email</p>

              {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-4">{error}</div>}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Email</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 transition-colors">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <input type="email" required
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                      placeholder="admin@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #883bbc, #b96ddc)' }}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* RESET PASSWORD */}
          {view === 'reset' && (
            <>
              <button onClick={() => { setView('forgot'); setError(''); setInfo('') }}
                className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Back
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Enter OTP</h2>
              <p className="text-xs text-gray-400 mb-6">Check your email for the 6-digit code</p>

              {error && <div className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 mb-4">{error}</div>}
              {info  && <div className="text-xs text-green-600 bg-green-50 rounded-xl px-3 py-2 mb-4">{info}</div>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">OTP Code</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 transition-colors">
                    <KeyRound size={14} className="text-gray-400 flex-shrink-0" />
                    <input type="text" required maxLength={6}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 tracking-widest"
                      placeholder="123456"
                      value={otp} onChange={e => setOtp(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 transition-colors">
                    <Lock size={14} className="text-gray-400 flex-shrink-0" />
                    <input type={showPass ? 'text' : 'password'} required
                      className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                      placeholder="New password"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #883bbc, #b96ddc)' }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
