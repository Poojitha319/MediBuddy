import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAnalyses, deleteAnalysis } from '../services/api'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const HistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const fetchHistory = (query = '') => {
    setLoading(true)
    getAnalyses(query)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchHistory(search)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')
    if (!confirmed) return
    await deleteAnalysis(id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        {/* Heading with count badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-6"
        >
          <h1 className="text-3xl font-bold" style={{ color: '#1E40AF' }}>
            Analysis History
          </h1>
          {!loading && history.length > 0 && (
            <span
              className="inline-flex items-center justify-center rounded-full px-3 py-0.5 text-sm font-semibold text-white"
              style={{ backgroundColor: '#3B82F6' }}
            >
              {history.length}
            </span>
          )}
        </motion.div>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#64748B' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your analyses..."
              className="w-full rounded-lg border bg-white py-3 pl-12 pr-4 text-base outline-none transition-shadow focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              style={{ borderColor: '#E2E8F0', color: '#1E293B', minHeight: '48px', fontSize: '16px' }}
            />
          </div>
        </motion.form>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200" style={{ borderTopColor: '#1E40AF' }}></div>
            <p className="mt-4 text-base" style={{ color: '#64748B' }}>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl bg-white p-12 shadow-sm text-center"
          >
            <div className="mb-6 rounded-full p-4" style={{ backgroundColor: '#EFF6FF' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" style={{ color: '#3B82F6' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#1E293B' }}>No analyses yet</h2>
            <p className="text-base mb-6" style={{ color: '#64748B' }}>
              Upload your first medicine image to get started
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg px-6 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1E40AF', minHeight: '48px', fontSize: '16px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Go to Dashboard
            </button>
          </motion.div>
        ) : (
          /* History cards */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-4"
          >
            {history.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="rounded-xl bg-white p-5 shadow-sm border transition-shadow hover:shadow-md"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-base leading-relaxed truncate" style={{ color: '#1E293B', fontSize: '16px' }}>
                      {item.summary}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: '#64748B' }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <Link
                        to={`/report/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
                        style={{ color: '#3B82F6' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        View Report
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:underline"
                        style={{ color: '#DC2626', minHeight: '48px' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
