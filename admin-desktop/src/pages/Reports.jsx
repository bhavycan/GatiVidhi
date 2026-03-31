import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileBarChart2, Sparkles, Calendar } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL}/report/admin-all`, { withCredentials: true })
      .then(res => { setReports(res.data.reports || []); setLoading(false) })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load'); setLoading(false) })
  }, [])

  return (
    <div className="p-6 overflow-y-auto h-full space-y-5">
      <div className="flex items-center justify-between page-header">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reports</h2>
          <p className="text-xs text-gray-400 mt-0.5">AI-generated project summaries and reports</p>
        </div>
        <button className="btn-primary text-xs"><Sparkles size={13}/> Generate AI Report</button>
      </div>

      <div className="rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #883bbc 0%, #6a2d96 60%, #4a1a6e 100%)' }}>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white/5 -translate-y-24 translate-x-24" />
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base">AI Report Generation</div>
          <div className="text-white/70 text-xs mt-0.5">Generate comprehensive project summaries powered by AI</div>
        </div>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr><th>Project</th><th>Summary</th><th>Published</th></tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id} className="cursor-pointer">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <FileBarChart2 size={13} className="text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-800 text-xs">{r.projectId?.projectName || '—'}</span>
                  </div>
                </td>
                <td className="text-xs text-gray-500 max-w-xs truncate">
                  {r.summary ? r.summary.slice(0, 100) + '…' : '—'}
                </td>
                <td>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={11} className="text-gray-400" />
                    {r.PublishedDate ? new Date(r.PublishedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && reports.length === 0 && (
              <tr><td colSpan={3} className="text-center text-xs text-gray-400 py-8">No reports found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
