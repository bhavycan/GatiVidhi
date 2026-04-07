import { useState, useEffect } from 'react'
import axios from 'axios'
import { User, Palette, Save, Check } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const tabs = [
  { label: 'Profile', icon: User },
  { label: 'Appearance', icon: Palette },
]

const themes = [
  { primary: '#883bbc', dark: '#6a2d96', light: '#a855f7', name: 'Purple' },
  { primary: '#3b82f6', dark: '#2563eb', light: '#60a5fa', name: 'Blue' },
  { primary: '#10b981', dark: '#059669', light: '#34d399', name: 'Green' },
  { primary: '#ef4444', dark: '#dc2626', light: '#f87171', name: 'Red' },
  { primary: '#f97316', dark: '#ea580c', light: '#fb923c', name: 'Orange' },
]

function applyTheme(primary, dark, light) {
  document.documentElement.style.setProperty('--purple', primary)
  document.documentElement.style.setProperty('--purple-dark', dark)
  document.documentElement.style.setProperty('--purple-light', light)
  localStorage.setItem('adminTheme', JSON.stringify({ primary, dark, light }))
}

export default function Settings() {
  const [tab, setTab] = useState('Profile')
  const [admin, setAdmin] = useState(null)
  const [name, setName] = useState('')
  const [activeTheme, setActiveTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminTheme'))?.primary || '#883bbc' }
    catch { return '#883bbc' }
  })

  useEffect(() => {
    axios.get(`${BASE_URL}/admin/profile-info`, { withCredentials: true })
      .then(res => { setAdmin(res.data.admin); setName(res.data.admin?.name || '') })
      .catch(() => {})
  }, [])

  const handleThemeChange = (t) => {
    setActiveTheme(t.primary)
    applyTheme(t.primary, t.dark, t.light)
  }

  const handleSaveProfile = async () => {
    try {
      await axios.post(`${BASE_URL}/admin/update-self`, { name }, { withCredentials: true })
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
        <div className="w-48 shrink-0">
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

          {tab === 'Appearance' && (
            <div className="bg-white rounded-2xl p-6 card-shadow space-y-5">
              <div className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">Theme & Appearance</div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-3">Color Theme</label>
                <div className="flex gap-3">
                  {themes.map(t => (
                    <button key={t.primary} onClick={() => handleThemeChange(t)}
                      title={t.name}
                      className="relative w-10 h-10 rounded-xl shadow-md hover:scale-110 transition-transform"
                      style={{
                        background: t.primary,
                        outline: activeTheme === t.primary ? `3px solid ${t.primary}` : '3px solid transparent',
                        outlineOffset: '2px',
                      }}>
                      {activeTheme === t.primary && (
                        <Check size={14} className="text-white absolute inset-0 m-auto" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Theme is saved automatically and persists across sessions.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
