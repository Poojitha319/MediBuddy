import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ReportPage from './pages/ReportPage';
import Navbar from './components/Navbar';
import About from './pages/AboutPage';
import Feedback from './pages/FeedbackPage';
import HistoryPage from './pages/HistoryPage';
import FaqPage from './pages/FAQPage';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import './index.css'; 
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
