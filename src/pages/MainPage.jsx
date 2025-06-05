import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeMedicineImage } from '../services/geminiApi'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_FILE_SIZE_MB = 10
const HISTORY_STORAGE_KEY = 'medicine_analysis_history'

const pulseAnimation = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(14, 165, 233, 0.5)",
      "0 0 12px 6px rgba(14, 165, 233, 0)",
      "0 0 0 0 rgba(14, 165, 233, 0.5)",
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
}

const shakeAnimation = {
  initial: { x: 0 },
  animate: {
    x: [0, -6, 6, -6, 6, 0],
    transition: { duration: 0.4 },
  },
}

const successCheckmark = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, rotate: [0, 360], transition: { duration: 0.7 } },
  exit: { scale: 0, opacity: 0 },
}

const MainPage = () => {
  const [file, setFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState('')
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setFilePreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const validateFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return false
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File size exceeds 10 MB.')
      return false
    }
    setError('')
    return true
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
      setIsAnalyzed(false)
      setAnalysisResult('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      setIsAnalyzed(false)
      setAnalysisResult('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = () => setDragActive(false)

  const saveToHistory = (analysisText) => {
    const existing = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    const newEntry = { analysis: analysisText, date: new Date().toISOString() }
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([newEntry, ...existing]))
    setToastMsg('Analysis saved to history!')
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file to analyze.')
      return
    }
    setIsUploading(true)
    setError('')
    setAnalysisResult('')
    try {
      const result = await analyzeMedicineImage(file)
      setAnalysisResult(result.analysis)
      setIsAnalyzed(true)
      saveToHistory(result.analysis)
    } catch (err) {
      setError(err.message || 'Failed to analyze image.')
      setIsAnalyzed(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReport = () => {
    if (!file || !isAnalyzed) {
      setError('Please upload and analyze a file first.')
      return
    }
    navigate('/report', { state: { analysis: analysisResult } })
  }

  const resetFile = () => {
    setFile(null)
    setIsAnalyzed(false)
    setAnalysisResult('')
    setError('')
    setFilePreviewUrl(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50 flex justify-center items-center p-6">
      <div className="w-full max-w-[1000px] flex flex-col">
        
        <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-72px)] gap-10">

          {/* Upload Section */}
          <motion.div
            className={`border-2 rounded-2xl p-8 shadow-lg md:m-14 md:w-1/2 w-full bg-white
              ${dragActive ? 'border-cyan-600' : 'border-gray-300'}
              transition-colors duration-300 ease-in-out`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            {...(dragActive ? pulseAnimation : {})}
          >
            <h1 className="text-center text-2xl font-semibold text-cyan-800 mb-3 tracking-wide">Upload Your Medicine Image</h1>
            <p className="text-center text-sm text-cyan-600 italic mb-6 max-w-[320px] mx-auto">
              Please upload an image of the back side of the medicine wrapper for accurate analysis.
            </p>

            <label
              htmlFor="file-upload"
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-300 p-8 hover:border-cyan-500 transition-colors duration-300"
              title="Click or drag file here"
            >
              <div className="mb-3 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-3a4 4 0 00-4-4H9a4 4 0 00-4 4v3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-cyan-700">Choose a file</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>

            {filePreviewUrl && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 rounded-xl border border-cyan-300 p-3 shadow-md"
              >
                <motion.img
                  src={filePreviewUrl}
                  alt="Uploaded preview"
                  className="mx-auto max-h-48 rounded-xl object-contain"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <button
                  onClick={resetFile}
                  className="mt-4 w-full rounded-xl bg-red-500 px-5 py-3 text-white hover:bg-red-600 transition"
                  aria-label="Remove uploaded file"
                >
                  Remove File
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                  variants={shakeAnimation}
                  className="mt-4 text-center text-sm text-red-600 font-semibold select-none"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <motion.button
                onClick={handleAnalyze}
                disabled={isUploading || !file}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 rounded-2xl bg-cyan-700 px-8 py-3 text-white font-semibold shadow-md
                  disabled:cursor-not-allowed disabled:bg-cyan-300`}
                title="Click to analyze the uploaded image"
              >
                {isUploading ? 'Analyzing...' : 'Analyze'}
              </motion.button>

              <motion.button
                onClick={handleReport}
                disabled={!isAnalyzed}
                whileHover={{ scale: isAnalyzed ? 1.05 : 1 }}
                whileTap={{ scale: isAnalyzed ? 0.95 : 1 }}
                className={`flex-1 rounded-2xl border border-cyan-700 px-8 py-3 font-semibold
                  disabled:cursor-not-allowed disabled:border-cyan-300 disabled:text-cyan-300`}
                title="Show detailed analysis report"
              >
                Show Report
              </motion.button>
            </div>

            <AnimatePresence>
              {isAnalyzed && (
                <motion.div
                  key="success"
                  className="mt-6 flex flex-col items-center gap-2 text-green-700 font-semibold select-none"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={successCheckmark}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Analysis complete! You can now view the report.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Instructions Section */}
          <motion.div
            className="md:w-1/2 flex flex-col justify-center gap-8 rounded-2xl border border-cyan-300 bg-white p-8 shadow-lg md:m-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h2 className="text-3xl font-semibold text-cyan-800 mb-4 tracking-wide">How to Use</h2>
            <ol className="list-decimal list-inside space-y-3 text-cyan-700 text-lg leading-relaxed select-none">
              {[
                "Upload a clear image of the back side of the medicine wrapper.",
                "Click Analyze to start the AI-powered medicine analysis.",
                "Once analysis completes, click Show Report to see detailed info.",
                "Use the report to understand medicine usage, warnings, and more.",
                "For any medical concerns, always consult your doctor.",
              ].map((step, i) => (
                <motion.li
                  key={i}
                  whileHover={{ scale: 1.05, color: "#0e7490" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="cursor-default"
                >
                  {step}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 right-6 rounded-xl bg-cyan-700 px-6 py-3 text-white shadow-lg select-none"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Assistant Button */}
        <motion.button
          initial={{ rotate: -10 }}
          animate={{ rotate: [-10, 10, -10], boxShadow: ["0 0 8px 2px rgba(14, 165, 233, 0.6)", "0 0 0 0 rgba(14, 165, 233, 0)"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px 4px rgba(14, 165, 233, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert('Voice Assistant Coming Soon!')}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-white p-2 shadow-lg hover:shadow-xl transition"
          aria-label="Voice Assistant"
        >
          <img
            src="src/assets/chat.png"
            alt="Voice Assistant Icon"
            className="h-14 w-14 rounded-full object-cover"
          />
        </motion.button>
      </div>
    </div>
  )
}

export default MainPage
