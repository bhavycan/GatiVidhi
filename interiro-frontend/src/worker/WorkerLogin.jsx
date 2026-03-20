import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CustomButtom from '../templates/CustomButtom'
import { API_BASE } from '../config.js'

const WorkerLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(
        `${API_BASE}/worker/login`,
        { email, password },
        { withCredentials: true }
      )
      navigate('/worker/profile')
    } catch (err) {
      setError(err.response?.data || 'Something went wrong')
    }
  }

  return (
    <div className='login w-full min-h-screen relative overflow-hidden'>

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

      <main className='w-full min-h-screen relative z-40 flex flex-col md:flex-row'>

        {/* Left column */}
        <div className='w-full md:w-1/2 px-[8%] py-[6%] flex flex-col justify-between'>
          <header>
            <div className='title w-full text-5xl md:text-6xl font-semibold tracking-tight mt-[6%] md:mt-[20%] flex'>
              <h1>Worker</h1>
              <h1 className='text-white'>Portal</h1>
            </div>
            <div className='subtitle w-[75%] text-white font-bold text-md opacity-70 leading-5 pl-[2%] mt-2'>
              <h4>Track your daily tasks and project updates</h4>
            </div>
          </header>

          <figure className='hidden md:block w-56 h-72 lg:w-64 lg:h-80 mx-auto overflow-hidden shadow-2xl shadow-[#883bbc] rounded-t-full border-2 border-[#883bbc] px-1 py-1 mt-10'>
            <img className='w-full h-full object-cover' src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60' alt='' />
          </figure>

          <article className='hidden md:flex w-full mt-6 flex-col items-start font-semibold opacity-80'>
            <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white opacity-70 hover:opacity-100 transition-opacity'>
              <i className='ri-arrow-left-line text-xl'></i>
              <span>Back to Home</span>
            </button>
            <h1 className='text-sm mt-4 opacity-50 text-white'>All right@TanikaAssociate</h1>
          </article>
        </div>

        {/* Right column — form */}
        <div className='w-full md:w-1/2 flex flex-col items-center justify-center px-[8%] py-[6%] md:py-[4%]'>

          <figure className='md:hidden w-36 h-44 overflow-hidden shadow-2xl shadow-[#883bbc] rounded-t-full border-2 border-[#883bbc] px-1 py-1 mb-6'>
            <img className='w-full h-full object-cover' src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60' alt='' />
          </figure>

          <form onSubmit={handleSubmit} className='logininfo w-full max-w-sm md:max-w-md px-[5%] py-[4%] flex flex-col gap-6'>

            <div className='fields w-full h-14 relative z-0'>
              <div className='w-full h-full bg-[#f3a9de] rounded-md top-[10%] -z-10 left-[3%] absolute'></div>
              <div className='w-full border border-black h-full flex rounded-md overflow-hidden items-center justify-center'>
                <div className='icon w-14 bg-white flex items-center justify-center h-full shrink-0'>
                  <i className='ri-mail-line w-full h-full text-2xl flex items-center justify-center opacity-55'></i>
                </div>
                <input
                  onChange={e => setEmail(e.target.value)}
                  type='email' value={email}
                  placeholder='Worker email'
                  className='bg-white outline-none flex-1 h-full px-4 py-2 text-base font-semibold'
                  required
                />
              </div>
            </div>

            <div className='fields w-full h-14 relative z-0'>
              <div className='w-full h-full bg-[#f3a9de] rounded-md top-[10%] -z-10 left-[3%] absolute'></div>
              <div className='w-full border border-black h-full flex rounded-md overflow-hidden items-center justify-center'>
                <div className='icon w-14 bg-white flex items-center justify-center h-full shrink-0'>
                  <i className='ri-lock-line w-full h-full text-2xl flex items-center justify-center opacity-55'></i>
                </div>
                <input
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} value={password}
                  placeholder='Password'
                  className='bg-white outline-none flex-1 h-full px-4 py-2 text-base font-semibold'
                  required
                />
                <button type='button' onClick={() => setShowPassword(p => !p)} className='w-12 bg-white h-full flex items-center justify-center shrink-0'>
                  <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-xl opacity-55`}></i>
                </button>
              </div>
            </div>

            <div className='w-full h-[10vh] -mt-[9%]'>
              <CustomButtom text='Login' />
            </div>

            {error && <p className='text-red-500 font-semibold'>{error}</p>}
          </form>

          <article className='md:hidden w-full mt-8 leading-5 flex flex-col items-center font-semibold opacity-80'>
            <button onClick={() => navigate('/')} className='flex items-center gap-2 text-white opacity-70 hover:opacity-100 transition-opacity'>
              <i className='ri-arrow-left-line text-xl'></i>
              <span>Back to Home</span>
            </button>
            <h1 className='text-sm mt-4 opacity-50 text-white'>All right@TanikaAssociate</h1>
          </article>
        </div>

      </main>
    </div>
  )
}

export default WorkerLogin
