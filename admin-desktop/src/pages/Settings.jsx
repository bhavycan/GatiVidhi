import { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Bell, Shield, Database, Palette, Globe, Save } from 'lucide-react'

const BASE_URL = 'http://localhost:3000'

const tabs = [
  { label: 'Profile', icon: User },
  { label: 'Notifications', icon: Bell },
  { label: 'Security', icon: Shield },
  { label: 'Appearance', icon: Palette },
  { label: 'Integrations', icon: Globe },
]

export default function Settings() {
  const [tab, setTab] = useState('Profile')
  const [admin, setAdmin] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/profile-info`, { withCredentials: true })
      .then(res => { setAdmin(res.data.admin); setName(res.data.admin?.name || '') })
      .catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/update-self`, { name }, { withCredentials: true })
      setAdmin(prev => ({ ...prev, name }))
      alert('Profile updated')
    } catch (err) { alert(err.response?.data || 'Update failed') }
  }

  return (
    <div className="p-8 overflow-y-auto h-full space-y-5">
      <div className="page-header">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your admin account and preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl p-2 card-shadow">
            {tabs.map(({ label, icon: Icon }) => (
              <button key={label} onClick={() => setTab(label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5
                  ${tab === label ? 'text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                style={tab === label ? { background: '#883bbc' } : {}}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {tab === 'Profile' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-5">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Profile Information</div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black"
                  style={{ background: 'linear-gradient(135deg, #883bbc, #f3a9de)' }}>A</div>
                <div>
                  <button className="btn-secondary text-xs">Change Photo</button>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                  <input type="email" value={admin?.email || ''} readOnly className="admin-input opacity-60" />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveProfile} className="btn-primary text-xs"><Save size={13}/> Save Changes</button>
              </div>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Notification Preferences</div>
              {[
                { label: 'New project created', desc: 'When a new project is added to the system' },
                { label: 'Payment received', desc: 'When a client makes an installment payment' },
                { label: 'Approval submitted', desc: 'When a client submits an approval request' },
                { label: 'Task overdue', desc: 'When a task passes its due date' },
                { label: 'Worker daily update', desc: 'When a worker submits a daily update' },
                { label: 'New client registered', desc: 'When a new client signs up' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-purple-600 transition-colors
                      after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full
                      after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === 'Security' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-5">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Security Settings</div>
              <div className="space-y-4">
                {[
                  { label: 'Current Password', type: 'password' },
                  { label: 'New Password', type: 'password' },
                  { label: 'Confirm New Password', type: 'password' },
                ].map(({ label, type }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <input type={type} className="admin-input" placeholder="••••••••" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div>
                  <div className="text-sm font-semibold text-amber-800">Two-Factor Authentication</div>
                  <div className="text-xs text-amber-600 mt-0.5">Add an extra layer of security</div>
                </div>
                <button className="btn-secondary text-xs border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100">
                  Enable 2FA
                </button>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary text-xs"><Save size={13}/> Update Password</button>
              </div>
            </div>
          )}

          {tab === 'Appearance' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-5">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Theme & Appearance</div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Color Theme</label>
                <div className="flex gap-3">
                  {['#883bbc','#3b82f6','#10b981','#ef4444','#f97316'].map(color => (
                    <button key={color} className="w-10 h-10 rounded-xl border-2 border-white shadow-md hover:scale-110 transition-transform"
                      style={{ background: color }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Sidebar Width</label>
                <div className="flex gap-2">
                  {['Compact (64px)', 'Default (230px)'].map(v => (
                    <button key={v}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors
                        ${v.includes('Default') ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white'}`}
                      style={v.includes('Default') ? { background: '#883bbc' } : {}}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'Integrations' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-4">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Connected Services</div>
              {[
                { name: 'Google Gemini AI', desc: 'AI-powered report generation', status: 'connected', color: '#4285f4' },
                { name: 'Cloudinary', desc: 'Image & video storage', status: 'connected', color: '#3448c5' },
                { name: 'Nodemailer (SMTP)', desc: 'Email notifications', status: 'connected', color: '#ea4335' },
                { name: 'Socket.io', desc: 'Real-time notifications', status: 'connected', color: '#010101' },
                { name: 'Razorpay', desc: 'Payment gateway', status: 'disconnected', color: '#072654' },
              ].map(({ name, desc, status, color }) => (
                <div key={name} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: color }}>
                    {name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{name}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                    ${status === 'connected' ? 'badge-active' : 'badge-on-hold'}`}>
                    {status}
                  </span>
                  <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors
                    ${status === 'connected'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'text-white border-transparent hover:opacity-90'}`}
                    style={status !== 'connected' ? { background: '#883bbc' } : {}}>
                    {status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
