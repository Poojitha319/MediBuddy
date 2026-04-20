import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const onLogout = () => {
    handleLogout()
    navigate('/')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative cursor-pointer py-2 px-3 text-[16px] transition-colors duration-200 ${
        location.pathname === to
          ? 'text-[#1E40AF] font-semibold'
          : 'text-[#64748B] hover:text-[#1E40AF]'
      }`}
    >
      {label}
      {location.pathname === to && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E40AF] rounded-full" />
      )}
    </Link>
  )

  const mobileNavLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`cursor-pointer py-4 px-6 text-[16px] border-b border-gray-100 transition-colors duration-200 ${
        location.pathname === to
          ? 'text-[#1E40AF] font-semibold'
          : 'text-[#64748B] hover:text-[#1E40AF]'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 md:px-14">
        <Link
          to="/"
          className="text-xl font-bold text-[#1E40AF]"
          aria-label="Go to Home"
        >
          MeddiBuddy
        </Link>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
            className="p-2 text-[#1E293B]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex md:items-center md:gap-1">
          {user && navLink('/dashboard', 'Dashboard')}
          {navLink('/about', 'About')}
          {user && navLink('/history', 'History')}
          {navLink('/faq', 'FAQ')}
          {navLink('/feedback', 'Feedback')}

          {user ? (
            <div className="flex items-center gap-3 ml-6">
              <div className="w-9 h-9 rounded-full bg-[#1E40AF] flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <span className="text-[16px] text-[#1E293B] font-medium">{user.name}</span>
              <button
                onClick={onLogout}
                className="ml-2 text-[16px] text-[#64748B] hover:text-[#1E40AF] transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-6 px-4 py-2 border border-[#1E40AF] text-[#1E40AF] font-medium rounded-lg text-[16px] hover:bg-[#1E40AF] hover:text-white transition-colors duration-200"
            >
              Log In
            </Link>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 flex flex-col md:hidden overflow-hidden"
            >
              {user && mobileNavLink('/dashboard', 'Dashboard')}
              {mobileNavLink('/about', 'About')}
              {user && mobileNavLink('/history', 'History')}
              {mobileNavLink('/faq', 'FAQ')}
              {mobileNavLink('/feedback', 'Feedback')}
              {user ? (
                <div className="flex items-center gap-3 py-4 px-6 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-[#1E40AF] flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <span className="text-[16px] text-[#1E293B] font-medium">{user.name}</span>
                  <button
                    onClick={() => { setIsOpen(false); onLogout() }}
                    className="ml-auto text-[16px] text-[#64748B] hover:text-[#1E40AF] transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="mx-6 my-4 px-4 py-3 border border-[#1E40AF] text-[#1E40AF] font-medium rounded-lg text-center text-[16px] hover:bg-[#1E40AF] hover:text-white transition-colors duration-200"
                >
                  Log In
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
