import React, { useEffect, useState } from 'react'

const HISTORY_STORAGE_KEY = 'medicine_analysis_history'
const HistoryPage = () => {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    setHistory([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-blue-700">Analysis History</h1>

      {history.length === 0 ? (
        <p className="text-gray-600">You have no previous analyses.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {history.map((item, idx) => (
            <div key={idx} className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap">{item.analysis}</p>
              <p className="mt-2 text-xs text-gray-400">Date: {new Date(item.date).toLocaleString()}</p>
            </div>
          ))}

          <button
            onClick={clearHistory}
            className="mt-6 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
