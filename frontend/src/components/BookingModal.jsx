import { useState } from 'react'
import api from '../services/api'

const CONSULTATION_TYPES = [
  { value: 'VIDEO', label: '🎥 Video Call' },
  { value: 'AUDIO', label: '📞 Audio Call' },
  { value: 'CHAT', label: '💬 Chat' },
  { value: 'IN_PERSON', label: '🤝 In Person' },
]

export default function BookingModal({ lawyer, onClose, onSuccess }) {
  const [form, setForm] = useState({
    type: 'VIDEO',
    scheduledAt: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get tomorrow's date as minimum
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().slice(0, 16)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/consultations', {
        lawyerId: lawyer.id,
        type: form.type,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        notes: form.notes,
      })
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-navy-800 border border-white/10 rounded-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-xl text-white">Book Consultation</h2>
            <p className="text-white/50 text-sm mt-0.5">with {lawyer.fullName}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* Lawyer Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-saffron-500/20 flex items-center justify-center text-saffron-500 font-heading">
              {lawyer.fullName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{lawyer.fullName}</p>
              <p className="text-white/40 text-xs">{lawyer.city}, {lawyer.state}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gold-400 font-semibold">₹{parseFloat(lawyer.consultationFee).toLocaleString('en-IN')}</p>
            <p className="text-white/30 text-xs">per session</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Consultation Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CONSULTATION_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`py-2.5 px-3 rounded-lg text-sm border transition-colors text-left ${
                    form.type === t.value
                      ? 'bg-saffron-500 border-saffron-500 text-white'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Preferred Date & Time</label>
            <input
              type="datetime-local"
              className="input"
              min={minDate}
              value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Notes (optional)</label>
            <textarea
              className="input min-h-20 resize-none"
              placeholder="Briefly describe your legal issue..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              maxLength={500}
            />
            <p className="text-white/30 text-xs mt-1">{form.notes.length}/500</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/20 text-white/60 hover:border-white/40 py-3 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}