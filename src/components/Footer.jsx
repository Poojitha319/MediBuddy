import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 mt-12 border-t border-gray-300">
      <div className="max-w-7xl mx-auto py-8 px-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-blue-800">🩺 MeddiBuddy</h2>
        <p className="text-sm italic text-gray-600 mt-1">
          Your smart companion for understanding medicine :)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          &copy; {new Date().getFullYear()} MeddiBuddy. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;
