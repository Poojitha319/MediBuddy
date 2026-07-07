import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { askHealth } from '../services/api'

const AGENT_LABELS = {
  triage: { icon: '🩺', en: 'Symptom triage', te: 'లక్షణ సహాయం' },
  medicine: { icon: '💊', en: 'Medicine info', te: 'మందు సమాచారం' },
  general: { icon: '💬', en: 'General help', te: 'సాధారణ సహాయం' },
}

const AskPage = () => {
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [speaking, setSpeaking] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please type a question first.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await askHealth(question.trim(), language)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !result) return
    const u = new SpeechSynthesisUtterance(result.answer)
    u.lang = language === 'te' ? 'te-IN' : 'en-US'
    u.onstart = () => setSpeaking(true)
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    setSpeaking(true)
  }

  const handleStop = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const speechSupported =
    typeof window !== 'undefined' && Boolean(window.speechSynthesis)

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            Ask a Health Question
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">
            Get plain-language answers about your medicines and health
          </p>
        </motion.div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          {/* Language Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 rounded-full text-base font-semibold transition-colors duration-150 ${
                language === 'en'
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ minHeight: '44px' }}
              type="button"
            >
              English
            </button>
            <button
              onClick={() => setLanguage('te')}
              className={`flex-1 rounded-full text-base font-semibold transition-colors duration-150 ${
                language === 'te'
                  ? 'bg-[#1E40AF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{ minHeight: '44px' }}
              type="button"
            >
              తెలుగు
            </button>
          </div>

          {/* Textarea */}
          <div className="mb-5">
            <label htmlFor="ask-question" className="block text-[16px] font-medium text-[#1E293B] mb-2">
              Your question
            </label>
            <textarea
              id="ask-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'మీ ప్రశ్న ఇక్కడ టైప్ చేయండి...'
                  : 'e.g. Can I take Paracetamol and Ibuprofen together?'
              }
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-[16px] text-[#1E293B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition resize-none"
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="ask-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[15px] text-[#DC2626]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ask Button */}
          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full rounded-xl bg-[#1E40AF] text-white text-[16px] font-semibold shadow-sm hover:bg-[#1e3a8a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{ minHeight: '52px' }}
            type="button"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Thinking…
              </>
            ) : (
              'Ask'
            )}
          </button>
        </motion.div>

        {/* Answer Card */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="answer-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
            >
              {/* Emergency red-flag banner */}
              {result.red_flag && (
                <div className="mb-4 rounded-xl bg-red-600 text-white px-5 py-4 flex items-start gap-3">
                  <span className="text-2xl leading-none" aria-hidden="true">⚠️</span>
                  <div>
                    <p className="font-bold text-[17px]">
                      {language === 'te' ? 'ఇది అత్యవసరం కావచ్చు' : 'This may be an emergency'}
                    </p>
                    <p className="text-[15px] text-red-50">
                      {language === 'te'
                        ? 'వెంటనే వైద్యుడిని సంప్రదించండి లేదా అత్యవసర సేవలకు కాల్ చేయండి.'
                        : 'Please see a doctor right away or call emergency services.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Badges: which agent answered + verification */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {result.agent && AGENT_LABELS[result.agent] && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-[14px] font-semibold rounded-full px-4 py-1.5">
                    <span aria-hidden="true">{AGENT_LABELS[result.agent].icon}</span>
                    {language === 'te' ? 'సమాధానం' : 'Answered by'}&nbsp;
                    {AGENT_LABELS[result.agent][language] || AGENT_LABELS[result.agent].en}
                  </span>
                )}
                {result.grounded ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-[14px] font-semibold rounded-full px-4 py-1.5">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified&nbsp;&middot;&nbsp;{result.source}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[14px] font-semibold rounded-full px-4 py-1.5">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    General info — confirm with your doctor
                  </span>
                )}
              </div>

              {/* Answer text */}
              <p className="text-[17px] text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>

              {/* Read aloud controls */}
              {speechSupported && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleReadAloud}
                    disabled={speaking}
                    className="flex items-center gap-2 px-5 rounded-xl bg-[#1E40AF] text-white text-[16px] font-semibold hover:bg-[#1e3a8a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ minHeight: '48px' }}
                    type="button"
                  >
                    <span aria-hidden="true">&#128266;</span>
                    Read aloud
                  </button>
                  {speaking && (
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-2 px-5 rounded-xl bg-gray-100 text-[#1E293B] text-[16px] font-semibold hover:bg-gray-200 transition-colors duration-200"
                      style={{ minHeight: '48px' }}
                      type="button"
                    >
                      <span aria-hidden="true">&#9646;&#9646;</span>
                      Stop
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AskPage
