import React from 'react'

const FAQPage = () => {
  const faqs = [
    {
      question: "What kind of images can I upload?",
      answer: "Please upload clear images of the back side of medicine wrappers in JPG or PNG format."
    },
    {
      question: "Is my data safe?",
      answer: "Yes, your uploaded images are processed securely and not stored permanently."
    },
    {
      question: "How long does analysis take?",
      answer: "Analysis usually completes within a few seconds depending on your internet speed."
    },
    {
      question: "Can I trust the AI analysis?",
      answer: "The AI provides helpful insights but always consult a healthcare professional for medical advice."
    },
    {
      question: "What if I encounter an error?",
      answer: "Please try re-uploading your image. If the problem persists, contact support via the feedback page."
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-blue-700">Frequently Asked Questions</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map(({ question, answer }, idx) => (
          <div key={idx} className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
            <h2 className="font-semibold text-lg text-gray-800">{question}</h2>
            <p className="mt-2 text-gray-600">{answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQPage
