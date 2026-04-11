import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMED: 'bg-green-500/20 text-green-400',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  COMPLETED: 'bg-white/10 text-white/50',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const TYPE_ICONS = {
  VIDEO: '🎥',
  AUDIO: '📞',
  CHAT: '💬',
  IN_PERSON: '🤝',
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ConsultationsPage() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchConsultations() }, [])

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/consultations')
      setConsultations(res.data.data.consultations)
    } catch {
      setError('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this consultation?')) return
    try {
      await api.patch(`/consultations/${id}/status`, { status: 'CANCELLED' })
      setSuccess('Consultation cancelled')
      fetchConsultations()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleConfirm = async (id) => {
    try {
      await api.patch(`/consultations/${id}/status`, { status: 'CONFIRMED' })
      setSuccess('Consultation confirmed')
      fetchConsultations()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm')
    }
  }

  const handleComplete = async (id) => {
    try {
      await api.patch(`/consultations/${id}/status`, { status: 'COMPLETED' })
      setSuccess('Consultation marked as completed')
      fetchConsultations()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/lawyers" className="text-white/50 hover:text-white text-sm transition-colors">Lawyers</Link>
          <Link to="/documents" className="text-white/50 hover:text-white text-sm transition-colors">Documents</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <main className="px-8 py-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-white mb-2">Consultations</h1>
          <p className="text-white/50">
            {user?.role === 'LAWYER' ? 'Manage your client consultations' : 'Your legal consultation bookings'}
          </p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {user?.role === 'CLIENT' && (
          <div className="bg-saffron-500/10 border border-saffron-500/20 rounded-xl p-4 mb-8 flex items-center justify-between">
            <p className="text-white/70 text-sm">Want to book a new consultation?</p>
            <Link to="/lawyers" className="btn-primary text-sm px-4 py-2">
              Find a Lawyer
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-white/50 mb-2">No consultations yet</p>
            {user?.role === 'CLIENT' && (
              <Link to="/lawyers" className="btn-primary text-sm mt-4 inline-block px-6 py-2">
                Book Your First Consultation
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_ICONS[c.type]}</span>
                    <div>
                      <h3 className="text-white font-semibold">
                        {user?.role === 'LAWYER'
                          ? (c.client.profile?.fullName || c.client.email)
                          : c.lawyer.fullName}
                      </h3>
                      <p className="text-white/40 text-sm">
                        {user?.role === 'LAWYER' ? c.client.email : `${c.lawyer.city}, ${c.lawyer.state}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Scheduled</p>
                    <p className="text-white">{formatDate(c.scheduledAt)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Type</p>
                    <p className="text-white">{c.type}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Amount</p>
                    <p className="text-gold-400 font-semibold">₹{parseFloat(c.amount).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-white/40 text-sm mb-4 bg-white/5 rounded-lg px-3 py-2">
                    {c.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  {user?.role === 'CLIENT' && c.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(c.id)}
                      className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  {user?.role === 'LAWYER' && c.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleConfirm(c.id)}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(c.id)}
                        className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {user?.role === 'LAWYER' && c.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleComplete(c.id)}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Mark Complete
                    </button>
                  )}
                  {c.status === 'COMPLETED' && !c.clientRating && user?.role === 'CLIENT' && (
                    <Link
                      to={`/consultations/${c.id}/review`}
                      className="text-sm border border-gold-400/30 text-gold-400 hover:bg-gold-400/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      Leave Review
                    </Link>
                  )}
                  {c.clientRating && (
                    <div className="flex items-center gap-1 text-gold-400 text-sm">
                      {'★'.repeat(c.clientRating)}{'☆'.repeat(5 - c.clientRating)}
                      <span className="text-white/40 ml-1">Your rating</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}