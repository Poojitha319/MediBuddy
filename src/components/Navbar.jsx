import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen((open) => !open);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu on Escape key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between p-4 px-6 md:px-14">
        <Link
          to="/"
          className="border-2 bg-white px-4 py-1 text-xl font-bold text-gray-800 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          aria-label="Go to Home"
        >
          🩺 MeddiBuddy
        </Link>

        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:space-x-6 md:items-center">
          <Link
            to="/about"
            className={`cursor-pointer py-2 px-4 font-bold ${
              location.pathname === '/about' ? 'text-blue-600' : 'text-black'
            } hover:text-gray-900`}
          >
            About
          </Link>
          <Link
            to="/feedback"
            className={`cursor-pointer py-2 px-4 font-bold ${
              location.pathname === '/feedback' ? 'text-blue-600' : 'text-black'
            } hover:text-gray-900`}
          >
            Feedback
          </Link>
          <Link
            to="/history"
            className={`cursor-pointer py-2 px-4 font-bold ${
              location.pathname === '/history' ? 'text-blue-600' : 'text-black'
            } hover:text-gray-900`}
          >
            History
          </Link>
          <Link
            to="/faq"
            className={`cursor-pointer py-2 px-4 font-bold ${
              location.pathname === '/faq' ? 'text-blue-600' : 'text-black'
            } hover:text-gray-900`}
          >
            FAQ
          </Link>

        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col md:hidden"
            >
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className={`cursor-pointer py-4 px-6 font-bold border-b border-gray-200 ${
                  location.pathname === '/about' ? 'text-blue-600' : 'text-black'
                } hover:text-gray-900`}
              >
                About
              </Link>
              <Link
                to="/feedback"
                onClick={() => setIsOpen(false)}
                className={`cursor-pointer py-4 px-6 font-bold ${
                  location.pathname === '/feedback' ? 'text-blue-600' : 'text-black'
                } hover:text-gray-900`}
              >
                Feedback
              </Link>
              <Link
                to="/history"
                className={`cursor-pointer py-2 px-4 font-bold ${
                  location.pathname === '/history' ? 'text-blue-600' : 'text-black'
                } hover:text-gray-900`}
              >
                History
              </Link>
              <Link
                to="/faq"
                className={`cursor-pointer py-2 px-4 font-bold ${
                  location.pathname === '/faq' ? 'text-blue-600' : 'text-black'
                } hover:text-gray-900`}
              >
                FAQ
              </Link>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
