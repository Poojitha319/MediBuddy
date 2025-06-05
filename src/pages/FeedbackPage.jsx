import React, { useState } from 'react';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({ name: '', message: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks, ${formData.name}! Your feedback has been submitted.`);
    setFormData({ name: '', message: '' });
  };

  return (
    <section id="feedback" className="min-h-screen px-6 py-20 bg-white text-gray-800">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Feedback</h2>
        <p className="mb-6 text-lg">We’d love to hear your thoughts or suggestions!</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Feedback"
            rows="5"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackPage;
// This code defines a Feedback section for the MeddiBuddy application, allowing users to submit their feedback through a simple form.