import React from 'react'
import { motion } from 'framer-motion'

const AboutPage = () => {
  const features = [
    {
      title: 'AI-Powered',
      description:
        'Advanced image recognition analyzes medicine packaging and extracts structured information instantly.',
    },
    {
      title: 'Multilingual',
      description:
        'Support for multiple languages coming soon, making medicine information accessible regardless of language barriers.',
    },
    {
      title: 'Accessible',
      description:
        'Designed for all ages with a clean, intuitive interface that anyone can use with ease.',
    },
  ]

  return (
    <section className="min-h-screen bg-[#F8FAFC] px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-[#1E293B] mb-6">
            About MeddiBuddy
          </h1>

          <p className="text-[16px] text-[#64748B] leading-relaxed mb-12 max-w-3xl">
            MeddiBuddy helps people understand their medicine through AI-powered
            image analysis. Upload a photo of any medicine package and get
            instant, structured information about usage, side effects, dosage,
            and warnings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (idx + 1) }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
                {feature.title}
              </h3>
              <p className="text-[16px] text-[#64748B] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="border-t border-gray-200 pt-8"
        >
          <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
            Built by Poojitha
          </h2>
          <p className="text-[16px] text-[#64748B]">
            Passionate about making healthcare information more accessible
            through technology.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutPage
