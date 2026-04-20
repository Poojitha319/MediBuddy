import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAnalysis } from '../services/api'

function parseGeminiText(text) {
  if (!text) return {}

  const cleanText = (t) => t.replace(/\*\*/g, '').replace(/\*/g, '').trim()

  const result = {
    about: '', formType: '', usageInstructions: [], sideEffects: [],
    ageGroup: [], expiryInfo: [], primaryPurpose: [], usefulFor: '',
    treats: '', storage: '', warnings: '', prescriptionRequired: '',
    manufacturer: '', raw: text,
  }

  const sections = [
    'about the medicine', 'form & packaging type', 'usage instructions',
    'possible side effects', 'recommended age group', 'expiry information',
    'primary purpose', 'useful for', 'treats', 'storage instructions',
    'warnings', 'prescription required', 'manufacturer information',
  ]
  const sectionPattern = sections.join('|')

  const patterns = {
    about: new RegExp(`about the medicine\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    formType: new RegExp(`form & packaging type\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    usageInstructions: new RegExp(`usage instructions\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    sideEffects: new RegExp(`possible side effects\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    ageGroup: new RegExp(`recommended age group\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    expiryInfo: new RegExp(`expiry information\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    primaryPurpose: new RegExp(`primary purpose\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    usefulFor: new RegExp(`useful for\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    treats: new RegExp(`treats\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    storage: new RegExp(`storage instructions\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    warnings: new RegExp(`warnings\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    prescriptionRequired: new RegExp(`prescription required\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    manufacturer: new RegExp(`manufacturer information\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      const value = cleanText(match[1])
      if (['usageInstructions', 'sideEffects', 'ageGroup', 'expiryInfo', 'primaryPurpose'].includes(key)) {
        result[key] = value.split(/\n+|\*|\d+\.\s+/).map((line) => cleanText(line)).filter(Boolean)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

const sectionIcons = {
  about: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      <rect x="8" y="6" width="8" height="4" rx="1" />
      <line x1="8" y1="14" x2="16" y2="14" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
  usage: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  ),
  sideEffects: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  ageGroup: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  expiry: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  purpose: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  usefulFor: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  treats: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
    </svg>
  ),
  storage: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  warnings: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  prescription: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  manufacturer: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="6" x2="9" y2="6.01" />
      <line x1="15" y1="6" x2="15" y2="6.01" />
      <line x1="9" y1="10" x2="9" y2="10.01" />
      <line x1="15" y1="10" x2="15" y2="10.01" />
      <line x1="9" y1="14" x2="9" y2="14.01" />
      <line x1="15" y1="14" x2="15" y2="14.01" />
      <path d="M9 18h6" />
    </svg>
  ),
}

const sectionConfig = [
  { key: 'about', title: 'About the Medicine', icon: 'about', border: 'border-blue-500', isList: false },
  { key: 'usageInstructions', title: 'Usage Instructions', icon: 'usage', border: 'border-gray-200', isList: true },
  { key: 'sideEffects', title: 'Side Effects', icon: 'sideEffects', border: 'border-amber-500', isList: true },
  { key: 'ageGroup', title: 'Recommended Age Group', icon: 'ageGroup', border: 'border-gray-200', isList: true },
  { key: 'expiryInfo', title: 'Expiry Information', icon: 'expiry', border: 'border-gray-200', isList: true },
  { key: 'primaryPurpose', title: 'Primary Purpose', icon: 'purpose', border: 'border-blue-500', isList: true },
  { key: 'usefulFor', title: 'Useful For', icon: 'usefulFor', border: 'border-gray-200', isList: false },
  { key: 'treats', title: 'Treats', icon: 'treats', border: 'border-gray-200', isList: false },
  { key: 'storage', title: 'Storage Instructions', icon: 'storage', border: 'border-gray-200', isList: false },
  { key: 'warnings', title: 'Warnings & Precautions', icon: 'warnings', border: 'border-amber-500', isList: false },
  { key: 'prescriptionRequired', title: 'Prescription Required', icon: 'prescription', border: 'border-gray-200', isList: false },
  { key: 'manufacturer', title: 'Manufacturer Information', icon: 'manufacturer', border: 'border-gray-200', isList: false },
]

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const ReportPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalysis(id)
      .then((data) => {
        const parsed = parseGeminiText(data.formatted_text)
        setReport(parsed)
      })
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

  if (error || !report) {
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

        {/* Card sections */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
          {sectionConfig.map(({ key, title, icon, border, isList }) => {
            const value = report[key]
            const isEmpty = isList ? (!value || value.length === 0) : !value
            if (isEmpty) return null

            return (
              <motion.div
                key={key}
                variants={itemVariants}
                className={`rounded-xl bg-white p-6 shadow-sm border-l-4 ${border}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ color: '#1E40AF' }}>{sectionIcons[icon]}</span>
                  <h2 className="text-lg font-bold" style={{ color: '#1E293B' }}>{title}</h2>
                </div>
                {isList ? (
                  <ul className="space-y-1.5 pl-8 list-disc" style={{ color: '#1E293B', fontSize: '16px' }}>
                    {value.map((item, i) => (
                      <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="leading-relaxed pl-8" style={{ color: '#1E293B', fontSize: '16px' }}>
                    {value}
                  </p>
                )}
              </motion.div>
            )
          })}
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
