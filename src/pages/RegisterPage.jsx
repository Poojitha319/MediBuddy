import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { register, login, getMe } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { handleLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      const tokenData = await login(email, password)
      localStorage.setItem('meddibuddy_token', tokenData.access_token)
      const userData = await getMe()
      handleLogin(tokenData.access_token, userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const passwordLengthValid = password.length >= 8
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#1E293B]">Create Your Account</h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Join MeddiBuddy for free</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-[14px] font-medium text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[16px] text-[#1E293B] placeholder-[#94A3B8]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[16px] text-[#1E293B] placeholder-[#94A3B8]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[16px] text-[#1E293B] placeholder-[#94A3B8]"
              placeholder="At least 8 characters"
            />
            {password.length > 0 && (
              <p className={`mt-1.5 text-[13px] font-medium ${passwordLengthValid ? 'text-green-600' : 'text-[#64748B]'}`}>
                {passwordLengthValid ? 'Password length is valid' : 'Minimum 8 characters required'}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-[#1E293B] mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-[16px] text-[#1E293B] placeholder-[#94A3B8]"
              placeholder="Repeat your password"
            />
            {passwordsMatch && (
              <p className="mt-1.5 text-[13px] font-medium text-green-600">Passwords match</p>
            )}
            {passwordsMismatch && (
              <p className="mt-1.5 text-[13px] font-medium text-red-600">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:bg-[#93C5FD] disabled:cursor-not-allowed text-[16px] min-h-[48px]"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-[#64748B] text-[16px]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1E40AF] font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default RegisterPage
