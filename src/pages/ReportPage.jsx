import React from 'react'
import Navbar from '../components/Navbar'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'


function parseGeminiText(text) {
  if (!text) return {}

  const cleanText = t => t.replace(/\*\*/g, '').replace(/\*/g, '').trim()

  const result = {
    about: '',
    formType: '',
    usageInstructions: [],
    sideEffects: [],
    ageGroup: [],
    expiryInfo: [],
    primaryPurpose: [],
    usefulFor: '',
    treats: '',
    storage: '',
    warnings: '',
    prescriptionRequired: '',
    manufacturer: '',
    raw: text,
  }

  const patterns = {
    about: /about the medicine\s*[:\-]?\s*(.*?)(?=\n\s*(usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    formType: /form & packaging type\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    usageInstructions: /usage instructions\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    sideEffects: /possible side effects\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    ageGroup: /recommended age group\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    expiryInfo: /expiry information\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    primaryPurpose: /primary purpose\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|form & packaging type|useful for|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    usefulFor: /useful for\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|treats|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    treats: /treats\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|storage instructions|warnings|prescription required|manufacturer information)|$)/is,
    storage: /storage instructions\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|warnings|prescription required|manufacturer information)|$)/is,
    warnings: /warnings\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|prescription required|manufacturer information)|$)/is,
    prescriptionRequired: /prescription required\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|manufacturer information)|$)/is,
    manufacturer: /manufacturer information\s*[:\-]?\s*(.*?)(?=\n\s*(about the medicine|usage instructions|possible side effects|recommended age group|expiry information|primary purpose|form & packaging type|useful for|treats|storage instructions|warnings|prescription required)|$)/is,
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      const value = cleanText(match[1])
      if (["usageInstructions", "sideEffects", "ageGroup", "expiryInfo", "primaryPurpose"].includes(key)) {
        result[key] = value
          .split(/\n+|\*|\d+\.\s+/)
          .map(line => cleanText(line))
          .filter(Boolean)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      staggerChildren: 0.15
    }
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const ReportPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const geminiResponse = location.state?.analysis

  if (!geminiResponse) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col">
          {/* <Navbar /> */}
          <div className="mx-auto mt-20 w-full max-w-[800px] rounded-2xl bg-white p-10 shadow-xl">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-lg text-red-600 font-semibold text-center"
            >
              No report data found. Please analyze a medicine image first.
            </motion.p>
            <div className="mt-6 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl bg-blue-600 px-6 py-2 text-white font-semibold shadow hover:bg-blue-700"
                onClick={() => navigate('/')}
              >
                Go Back
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  let reportText = ''
  if (typeof geminiResponse === 'string') {
    reportText = geminiResponse
  } else if (
    geminiResponse.candidates &&
    geminiResponse.candidates.length > 0 &&
    geminiResponse.candidates[0].content
  ) {
    if (typeof geminiResponse.candidates[0].content === 'string') {
      reportText = geminiResponse.candidates[0].content
    } else if (Array.isArray(geminiResponse.candidates[0].content.parts)) {
      reportText = geminiResponse.candidates[0].content.parts.map(p => p.text).join('\n')
    }
  }

  const report = parseGeminiText(reportText)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col">
        <Navbar />

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center text-4xl font-bold text-blue-800"
        >
          Medicine Analysis Report
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto mt-10 w-full max-w-[800px] rounded-2xl bg-white p-8 shadow-xl"
        >
          {Object.entries({
            'About the medicine': report.about,
            'Form & Packaging Type': report.formType,
            'Useful for': report.usefulFor,
            'Treats': report.treats,
            'Storage instructions': report.storage,
            'Warnings / Precautions': report.warnings,
            'Prescription required': report.prescriptionRequired,
            'Manufacturer information': report.manufacturer,
          }).map(([title, value], idx) => (
            <motion.div className="mt-6" key={idx} variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="mt-1 text-gray-600">{value || <span className="text-gray-400">Not available</span>}</p>
            </motion.div>
          ))}

          {Object.entries({
            'Usage instructions': report.usageInstructions,
            'Possible side effects': report.sideEffects,
            'Recommended age group': report.ageGroup,
            'Expiry information': report.expiryInfo,
            'Primary purpose': report.primaryPurpose,
          }).map(([title, list], idx) => (
            <motion.div className="mt-6" key={idx} variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <ul className="mt-2 list-inside list-disc text-gray-600">
                {list.length > 0 ? list.map((item, i) => <li key={i}>{item}</li>) : <li className="text-gray-400">Not available</li>}
              </ul>
            </motion.div>
          ))}

          <hr className="my-6 border-t" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-gray-500"
          >
            This analysis is generated by AI. For medical advice, always consult a healthcare professional.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportPage
