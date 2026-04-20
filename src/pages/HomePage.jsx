import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-[#1E40AF] via-[#3B82F6] to-[#F8FAFC] py-24 px-6 flex flex-col items-center text-center">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          Understand Your Medicine in Seconds
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-blue-100 max-w-2xl leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Upload a photo of any medicine package and get instant AI-powered
          analysis — usage, side effects, warnings, and more.
        </motion.p>

        <motion.div
          className="mt-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/dashboard">
            <button className="min-h-[48px] bg-[#059669] hover:bg-[#047857] text-white text-lg font-semibold px-8 py-3 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#059669]">
              Get Started Free
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Trust Bar */}
      <section className="w-full py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <svg
              className="w-8 h-8 text-[#1E40AF]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5m-4.75-11.396c.251.023.501.05.75.082M12 3c2.5 0 5 .5 7 1.5M5 4.5C7 3.5 9.5 3 12 3m-7 1.5v4a2.25 2.25 0 0 0 .659 1.591L9 13.5m10-9v4a2.25 2.25 0 0 1-.659 1.591L15 13.5"
              />
            </svg>
            <span className="text-[16px] font-medium text-[#1E293B]">
              AI-Powered Analysis
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <svg
              className="w-8 h-8 text-[#1E40AF]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
            <span className="text-[16px] font-medium text-[#1E293B]">
              Secure & Private
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <svg
              className="w-8 h-8 text-[#1E40AF]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span className="text-[16px] font-medium text-[#1E293B]">
              Free to Use
            </span>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-[#1E293B] mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeIn}
              transition={{ duration: 0.5 }}
            >
              <div className="w-14 h-14 mx-auto mb-5 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[#3B82F6]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                  />
                </svg>
              </div>
              <span className="inline-block text-sm font-semibold text-[#3B82F6] mb-2">
                Step 1
              </span>
              <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                Upload Image
              </h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Take a photo or upload an image of your medicine package or
                label.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-14 h-14 mx-auto mb-5 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[#3B82F6]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <span className="inline-block text-sm font-semibold text-[#3B82F6] mb-2">
                Step 2
              </span>
              <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                AI Analyzes
              </h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Our AI instantly identifies the medicine and extracts key
                information.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-14 h-14 mx-auto mb-5 bg-[#EFF6FF] rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[#3B82F6]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <span className="inline-block text-sm font-semibold text-[#3B82F6] mb-2">
                Step 3
              </span>
              <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                Get Report
              </h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                Receive a clear report with usage instructions, side effects,
                and warnings.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="w-full py-20 px-6 bg-[#1E40AF]">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to try?
          </h2>
          <p className="text-lg text-blue-200 mb-8">
            Create your free account and start understanding your medicine
            today.
          </p>
          <Link to="/register">
            <button className="min-h-[48px] bg-white hover:bg-gray-50 text-[#1E40AF] text-lg font-semibold px-8 py-3 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
              Create Free Account
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default HomePage
