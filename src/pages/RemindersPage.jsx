import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getReminders, createReminder, deleteReminder } from '../services/api'

const RemindersPage = () => {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [medicineName, setMedicineName] = useState('')
  const [dose, setDose] = useState('')
  const [times, setTimes] = useState([])
  const [timeInput, setTimeInput] = useState('08:00')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const fetchReminders = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getReminders()
      setReminders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load reminders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  const handleAddTime = () => {
    if (!timeInput) return
    if (times.includes(timeInput)) return
    setTimes((prev) => [...prev, timeInput].sort())
  }

  const handleRemoveTime = (t) => {
    setTimes((prev) => prev.filter((x) => x !== t))
  }

  const handleSave = async () => {
    setFormError('')
    if (!medicineName.trim()) {
      setFormError('Please enter a medicine name.')
      return
    }
    if (!dose.trim()) {
      setFormError('Please enter a dose (e.g. 1 tablet).')
      return
    }
    if (times.length === 0) {
      setFormError('Please add at least one reminder time.')
      return
    }
    setSaving(true)
    try {
      await createReminder({
        medicine_name: medicineName.trim(),
        dose: dose.trim(),
        times,
        language: 'en',
      })
      setMedicineName('')
      setDose('')
      setTimes([])
      setTimeInput('08:00')
      await fetchReminders()
    } catch (err) {
      setFormError(err.message || 'Failed to save reminder.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id)
      setReminders((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete reminder.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">
            Medicine Reminders
          </h1>
          <p className="mt-2 text-[16px] text-[#64748B]">
            Set daily reminders so you never miss a dose
          </p>
        </motion.div>

        {/* Add Reminder Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-[#1E293B] mb-5">Add a reminder</h2>

          {/* Medicine Name */}
          <div className="mb-4">
            <label className="block text-[16px] font-medium text-[#1E293B] mb-1" htmlFor="med-name">
              Medicine name <span className="text-red-500">*</span>
            </label>
            <input
              id="med-name"
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. Metformin"
              className="w-full rounded-xl border border-gray-300 px-4 text-[16px] text-[#1E293B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Dose */}
          <div className="mb-4">
            <label className="block text-[16px] font-medium text-[#1E293B] mb-1" htmlFor="dose">
              Dose <span className="text-red-500">*</span>
            </label>
            <input
              id="dose"
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 1 tablet"
              className="w-full rounded-xl border border-gray-300 px-4 text-[16px] text-[#1E293B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Times */}
          <div className="mb-5">
            <label className="block text-[16px] font-medium text-[#1E293B] mb-1">
              Reminder times <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 px-4 text-[16px] text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition"
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={handleAddTime}
                className="px-5 rounded-xl bg-gray-100 text-[#1E40AF] text-[16px] font-semibold hover:bg-gray-200 transition-colors duration-150"
                style={{ minHeight: '48px' }}
                type="button"
              >
                Add time
              </button>
            </div>

            {/* Time pills */}
            {times.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {times.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1E40AF] text-[15px] font-medium rounded-full px-3 py-1"
                  >
                    {t}
                    <button
                      onClick={() => handleRemoveTime(t)}
                      className="ml-1 text-[#1E40AF] hover:text-red-500 transition-colors"
                      aria-label={`Remove time ${t}`}
                      type="button"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                key="form-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[15px] text-[#DC2626]"
              >
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-[#1E40AF] text-white text-[16px] font-semibold shadow-sm hover:bg-[#1e3a8a] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '52px' }}
            type="button"
          >
            {saving ? 'Saving…' : 'Save reminder'}
          </button>
        </motion.div>

        {/* List of reminders */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Your reminders</h2>

          {/* Global error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="list-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[15px] text-[#DC2626]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-[#1E40AF]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : reminders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <p className="text-[18px] font-medium text-[#64748B]">No reminders yet</p>
              <p className="text-[16px] text-gray-400 mt-1">Add your first reminder above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence>
                {reminders.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[20px] font-bold text-[#1E293B] truncate">{r.medicine_name}</p>
                      <p className="text-[16px] text-[#64748B] mt-0.5">{r.dose}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(r.times || []).map((t) => (
                          <span
                            key={t}
                            className="inline-block bg-blue-50 text-[#1E40AF] text-[15px] font-semibold rounded-full px-3 py-1"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="flex-shrink-0 px-5 rounded-xl bg-red-50 text-[#DC2626] text-[16px] font-semibold hover:bg-red-100 transition-colors duration-150"
                      style={{ minHeight: '48px' }}
                      type="button"
                      aria-label={`Delete reminder for ${r.medicine_name}`}
                    >
                      Delete
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default RemindersPage
