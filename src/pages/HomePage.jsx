import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800 flex flex-col items-center justify-center px-6">
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold text-blue-800 text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Welcome to MeddiBuddy 🩺
      </motion.h1>

      <motion.p
        className="mt-6 text-lg md:text-xl text-center max-w-3xl text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        Your smart healthcare companion. Upload medicine images, get AI-powered analysis, understand your medication, and make safer health choices — all in one place.
      </motion.p>

      <motion.div
        className="mt-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <Link to="/main">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300">
            Get Started
          </button>
        </Link>
      </motion.div>

      <motion.div
        className="mt-16 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        ⚕️ Empowered by AI — Built with ❤️ by Poojitha319
      </motion.div>
    </div>
  )
}

export default HomePage
