import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What kind of images can I upload?',
      answer:
        'Please upload clear images of the back side of medicine wrappers in JPG or PNG format.',
    },
    {
      question: 'Is my data safe?',
      answer:
        'Yes, your uploaded images are processed securely and not stored permanently.',
    },
    {
      question: 'How long does analysis take?',
      answer:
        'Analysis usually completes within a few seconds depending on your internet speed.',
    },
    {
      question: 'Can I trust the AI analysis?',
      answer:
        'The AI provides helpful insights but always consult a healthcare professional for medical advice.',
    },
    {
      question: 'What if I encounter an error?',
      answer:
        'Please try re-uploading your image. If the problem persists, contact support via the feedback page.',
    },
  ]

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="min-h-screen bg-[#F8FAFC] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-[#1E293B] mb-8"
        >
          Frequently Asked Questions
        </motion.h1>

        <div className="space-y-3">
          {faqs.map(({ question, answer }, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * (idx + 1) }}
              className="border border-gray-200 rounded-lg bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between px-6 py-5 text-left min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-inset"
              >
                <span className="text-[16px] font-medium text-[#1E293B] pr-4">
                  {question}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-[#64748B] flex-shrink-0 transition-transform duration-200 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-5">
                  <p className="text-[16px] text-[#64748B] leading-relaxed">
                    {answer}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQPage
