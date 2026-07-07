import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAnalysis } from '../services/api'

// Render inline **bold** spans safely (React escapes text, no dangerouslySetInnerHTML).
function renderInline(text) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  )
}

// Lightweight, language-agnostic markdown renderer for Gemini's report text.
// Handles: **full-line headings**, `* ` / `- ` bullet lists, and paragraphs.
// Replaces the old rigid 13-section regex parser that silently rendered nothing
// whenever Gemini's headings or language didn't match the hard-coded English labels.
function MarkdownReport({ text }) {
  const lines = (text || '').split('\n')
  const blocks = []
  let list = null

  const flushList = () => {
    if (list) {
      blocks.push({ type: 'ul', items: list })
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushList()
      continue
    }
    const heading = line.match(/^\*\*(.+?)\*\*$/)
    const bullet = line.match(/^[*-]\s+(.+)$/)
    if (heading) {
      flushList()
      blocks.push({ type: 'h', text: heading[1].replace(/:$/, '') })
    } else if (bullet) {
      if (!list) list = []
      list.push(bullet[1])
    } else {
      flushList()
      blocks.push({ type: 'p', text: line })
    }
  }
  flushList()

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return (
            <h2 key={i} className="text-lg font-bold mt-2" style={{ color: '#1E293B' }}>
              {b.text}
            </h2>
          )
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6" style={{ color: '#1E293B', fontSize: '16px' }}>
              {b.items.map((item, j) => (
                <li key={j} className="leading-relaxed">{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="leading-relaxed" style={{ color: '#1E293B', fontSize: '16px' }}>
            {renderInline(b.text)}
          </p>
        )
      })}
    </div>
  )
}

const ReportPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalysis(id)
      .then((data) => setMeta(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200" style={{ borderTopColor: '#1E40AF' }}></div>
          <p className="text-base font-medium" style={{ color: '#64748B' }}>Loading your report...</p>
        </div>
      </div>
    )
  }

  if (error || !meta) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: '#F8FAFC' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-full max-w-lg rounded-xl bg-white p-8 shadow-lg border-l-4"
          style={{ borderLeftColor: '#DC2626' }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1E293B' }}>Unable to Load Report</h3>
              <p className="mt-2 text-base" style={{ color: '#64748B' }}>
                {error || 'No report data found. Please analyze a medicine image first.'}
              </p>
            </div>
          </div>
          <button
            className="mt-6 w-full rounded-lg px-6 font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1E40AF', minHeight: '48px', fontSize: '16px' }}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const grounded = meta?.parsed_report?.grounded
  const drugName = meta?.parsed_report?.drug_name

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold" style={{ color: '#1E40AF' }}>
            Medicine Analysis Report
          </h1>
          <p className="mt-2 text-base" style={{ color: '#64748B' }}>
            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Drug name */}
          {drugName && (
            <p className="mt-3 text-2xl font-bold" style={{ color: '#1E293B' }}>
              {drugName}
            </p>
          )}

          {/* Grounding badge */}
          {grounded === true && (
            <span
              className="inline-block mt-3 rounded-full px-4 py-1 text-sm font-semibold"
              style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
            >
              ✓ Verified · {meta.parsed_report.source}
            </span>
          )}
          {grounded === false && (
            <span
              className="inline-block mt-3 rounded-full px-4 py-1 text-sm font-semibold"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              ⚠ Unverified — please confirm with your doctor
            </span>
          )}

          {/* Read-aloud controls */}
          {typeof window !== 'undefined' && window.speechSynthesis && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => {
                  const u = new SpeechSynthesisUtterance(meta.plain_text || '')
                  u.lang = meta.language === 'te' ? 'te-IN' : 'en-US'
                  window.speechSynthesis.cancel()
                  window.speechSynthesis.speak(u)
                }}
                className="inline-flex items-center gap-2 rounded-xl px-6 font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1E40AF', minHeight: '48px', fontSize: '16px' }}
              >
                🔊 Read aloud
              </button>
              <button
                onClick={() => window.speechSynthesis.cancel()}
                className="inline-flex items-center gap-2 rounded-xl px-4 font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#E2E8F0', color: '#1E293B', minHeight: '48px', fontSize: '14px' }}
              >
                ⏹ Stop
              </button>
            </div>
          )}
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg border px-5 font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: '#E2E8F0', color: '#1E293B', minHeight: '48px', fontSize: '16px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg px-5 font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#059669', minHeight: '48px', fontSize: '16px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Analyze Another
          </button>
        </motion.div>

        {/* Report body */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl bg-white p-6 sm:p-8 shadow-sm border-l-4 border-blue-500"
        >
          <MarkdownReport text={meta.formatted_text} />
        </motion.div>

        {/* Disclaimer banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-xl p-5"
          style={{ backgroundColor: '#F1F5F9' }}
        >
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#64748B' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-sm" style={{ color: '#64748B' }}>
              This analysis is generated by AI. Always consult a healthcare professional for medical advice.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportPage
