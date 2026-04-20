import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-10 px-6 flex flex-col items-center text-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E40AF]">MeddiBuddy</h2>
          <p className="text-[16px] text-[#64748B] mt-1">
            AI-powered medicine analysis
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/about"
            className="text-[16px] text-[#64748B] hover:text-[#1E40AF] transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/faq"
            className="text-[16px] text-[#64748B] hover:text-[#1E40AF] transition-colors duration-200"
          >
            FAQ
          </Link>
          <Link
            to="/feedback"
            className="text-[16px] text-[#64748B] hover:text-[#1E40AF] transition-colors duration-200"
          >
            Feedback
          </Link>
        </div>

        <p className="text-sm text-[#64748B]">
          &copy; {new Date().getFullYear()} MeddiBuddy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
