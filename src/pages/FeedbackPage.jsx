import React, { useState } from 'react'
import { motion } from 'framer-motion'

const FeedbackPage = () => {
  const [formData, setFormData] = useState({ name: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', message: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section className="min-h-screen bg-[#F8FAFC] px-6 py-16">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-gray-200 rounded-lg p-8"
        >
          <h1 className="text-2xl font-bold text-[#1E293B] mb-2">
            Share Your Feedback
          </h1>
          <p className="text-[16px] text-[#64748B] mb-8">
            Help us improve MeddiBuddy
          </p>

          {submitted && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-[16px] text-green-700 font-medium">
                Thank you for your feedback! We appreciate your input.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-[16px] font-medium text-[#1E293B] mb-2"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full h-[48px] px-4 text-[16px] text-[#1E293B] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-[16px] font-medium text-[#1E293B] mb-2"
              >
                Your Feedback
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-[16px] text-[#1E293B] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200 resize-vertical"
                placeholder="Tell us what you think..."
              />
            </div>

            <button
              type="submit"
              className="w-full h-[48px] bg-[#1E40AF] text-white text-[16px] font-semibold rounded-lg hover:bg-[#1E3A8A] transition-colors duration-200"
            >
              Submit Feedback
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

export default FeedbackPage
