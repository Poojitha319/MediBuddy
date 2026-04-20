import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeMedicine } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import chatIcon from '../assets/chat.png'

const MAX_FILE_SIZE_MB = 10

const progressSteps = [
  'Uploading image...',
  'Analyzing medicine...',
  'Generating report...',
]

const MainPage = () => {
  const [file, setFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [progressIndex, setProgressIndex] = useState(0)
  const progressInterval = useRef(null)
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

  useEffect(() => {
    if (isUploading) {
      setProgressIndex(0)
      progressInterval.current = setInterval(() => {
        setProgressIndex((prev) => {
          if (prev < progressSteps.length - 1) return prev + 1
          return prev
        })
      }, 3000)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
        progressInterval.current = null
      }
      setProgressIndex(0)
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isUploading])

  useEffect(() => {
    if (isAnalyzed && analysisId) {
      const timeout = setTimeout(() => {
        navigate(`/report/${analysisId}`)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [isAnalyzed, analysisId, navigate])

  const validateFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG).')
      return false
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File size exceeds 10 MB. Please choose a smaller image.')
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
      setAnalysisId(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      setIsAnalyzed(false)
      setAnalysisId(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = () => setDragActive(false)

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file to analyze.')
      return
    }
    setIsUploading(true)
    setError('')
    try {
      const result = await analyzeMedicine(file)
      setAnalysisId(result.id)
      setIsAnalyzed(true)
      setToastMsg('Analysis complete! Redirecting to report...')
      setTimeout(() => setToastMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsAnalyzed(false)
    } finally {
      setIsUploading(false)
    }
  }

  const resetFile = () => {
    setFile(null)
    setIsAnalyzed(false)
    setAnalysisId(null)
    setError('')
    setFilePreviewUrl(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

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
            Medicine Analysis
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">
            Upload a clear image of your medicine package for AI-powered analysis
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
        >
          {/* Upload Zone */}
          {!file ? (
            <label
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-[#1E40AF] bg-blue-50'
                  : 'border-gray-300 hover:border-[#3B82F6] hover:bg-gray-50'
                }`}
            >
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-14 w-14 text-[#3B82F6]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                  />
                </svg>
              </div>
              <p className="text-[16px] font-semibold text-[#1E293B]">
                Drag and drop your image here
              </p>
              <p className="mt-1 text-[14px] text-[#64748B]">
                or click to browse
              </p>
              <p className="mt-3 text-[12px] text-[#64748B]">
                Supports JPG, PNG up to 10MB
              </p>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          ) : (
            <motion.div
              key="file-preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Image Preview */}
              <div className="bg-gray-50 p-4 flex items-center justify-center">
                <img
                  src={filePreviewUrl}
                  alt="Medicine preview"
                  className="max-h-56 rounded-lg object-contain"
                />
              </div>
              {/* File Info */}
              <div className="p-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#1E293B] truncate">
                    {file.name}
                  </p>
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={resetFile}
                  disabled={isUploading}
                  className="ml-4 px-4 py-2 text-[14px] font-medium text-[#DC2626] bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Remove uploaded file"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          )}

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error-banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-5 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-[#DC2626] flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="flex-1 text-[14px] text-[#DC2626]">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="flex-shrink-0 text-[#DC2626] hover:text-red-800 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analyze Button */}
          <div className="mt-6">
            {!isUploading ? (
              <motion.button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzed}
                whileHover={{ scale: file && !isAnalyzed ? 1.01 : 1 }}
                whileTap={{ scale: file && !isAnalyzed ? 0.99 : 1 }}
                className="w-full h-[48px] rounded-xl bg-[#1E40AF] text-white text-[16px] font-semibold shadow-sm hover:bg-[#1e3a8a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Medicine
              </motion.button>
            ) : (
              <div className="w-full h-[48px] rounded-xl bg-[#1E40AF] flex items-center justify-center relative overflow-hidden">
                {/* Progress bar background */}
                <motion.div
                  className="absolute inset-0 bg-[#3B82F6] origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: (progressIndex + 1) / progressSteps.length }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
                {/* Progress text */}
                <div className="relative z-10 flex items-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-white text-[14px] font-medium">
                    {progressSteps[progressIndex]}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-[#059669] px-6 py-3 text-white shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-[14px] font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainPage
