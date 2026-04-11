import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const SPECIALIZATIONS = [
  'All', 'Criminal', 'Civil', 'Family', 'Corporate', 'Tax', 'Property',
  'Labour', 'Consumer', 'Cyber', 'Constitutional', 'Banking',
]

const INDIAN_STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Chandigarh',
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-gold-400' : 'text-white/20'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-white/50 text-xs ml-1">{rating ? parseFloat(rating).toFixed(1) : 'New'}</span>
    </div>
  )
}

function LawyerCard({ lawyer }) {
  return (
    <div className="card hover:border-white/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-saffron-500/20 flex items-center justify-center text-saffron-500 font-heading text-lg">
            {lawyer.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{lawyer.fullName}</h3>
            <p className="text-white/40 text-xs">{lawyer.enrollmentState} Bar Council</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gold-400 font-semibold">₹{parseFloat(lawyer.consultationFee).toLocaleString('en-IN')}</p>
          <p className="text-white/40 text-xs">per session</p>
        </div>
      </div>

      {/* Rating & Experience */}
      <div className="flex items-center gap-4 mb-4">
        <StarRating rating={lawyer.rating} />
        <span className="text-white/30 text-xs">•</span>
        <span className="text-white/50 text-xs">{lawyer.experienceYears} yrs exp</span>
        <span className="text-white/30 text-xs">•</span>
        <span className="text-white/50 text-xs">{lawyer.city}, {lawyer.state}</span>
      </div>

      {/* Bio */}
      {lawyer.bio && (
        <p className="text-white/50 text-sm mb-4 line-clamp-2">{lawyer.bio}</p>
      )}

      {/* Specializations */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {lawyer.specializations.slice(0, 3).map(spec => (
          <span key={spec} className="bg-saffron-500/10 text-saffron-500 text-xs px-2 py-1 rounded-md">
            {spec}
          </span>
        ))}
        {lawyer.specializations.length > 3 && (
          <span className="bg-white/5 text-white/40 text-xs px-2 py-1 rounded-md">
            +{lawyer.specializations.length - 3} more
          </span>
        )}
      </div>

      {/* Languages */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {lawyer.languages.map(lang => (
          <span key={lang} className="bg-white/5 text-white/50 text-xs px-2 py-1 rounded-md">
            {lang}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${lawyer.isAvailable ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className={`text-xs ${lawyer.isAvailable ? 'text-green-400' : 'text-white/40'}`}>
            {lawyer.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <button className="btn-primary text-sm px-4 py-2">
          Book Consultation
        </button>
      </div>
    </div>
  )
}

export default function LawyersPage() {
  const { logout } = useAuth()
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})

  const [filters, setFilters] = useState({
    specialization: '',
    state: '',
    city: '',
    page: 1,
  })

  useEffect(() => {
    fetchLawyers()
  }, [filters])

  const fetchLawyers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.specialization && filters.specialization !== 'All') params.specialization = filters.specialization
      if (filters.state && filters.state !== 'All States') params.state = filters.state
      if (filters.city) params.city = filters.city
      params.page = filters.page
      params.limit = 9

      const res = await api.get('/lawyers', { params })
      setLawyers(res.data.data.lawyers)
      setPagination(res.data.data.pagination)
    } catch (err) {
      setError('Failed to load lawyers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <main className="px-8 py-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-white mb-2">Find a Lawyer</h1>
          <p className="text-white/50">Connect with verified advocates across India</p>
        </div>

        {/* Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">Specialization</label>
              <select
                className="input text-sm"
                value={filters.specialization}
                onChange={e => setFilters(f => ({ ...f, specialization: e.target.value, page: 1 }))}
              >
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s === 'All' ? '' : s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">State</label>
              <select
                className="input text-sm"
                value={filters.state}
                onChange={e => setFilters(f => ({ ...f, state: e.target.value, page: 1 }))}
              >
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s === 'All States' ? '' : s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-2 uppercase tracking-wider">City</label>
              <input
                className="input text-sm"
                placeholder="Search by city..."
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value, page: 1 }))}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded mb-2 w-1/2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⚖️</p>
            <p className="text-white/50">No lawyers found matching your filters</p>
            <button
              onClick={() => setFilters({ specialization: '', state: '', city: '', page: 1 })}
              className="btn-secondary text-sm mt-4 px-6 py-2"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-4">{pagination.total} lawyers found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lawyers.map(lawyer => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-white/50 text-sm flex items-center px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={filters.page === pagination.totalPages}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}