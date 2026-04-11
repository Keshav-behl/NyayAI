import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'bn', label: 'Bengali' },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
]

const SPECIALIZATIONS = [
  'Criminal', 'Civil', 'Family', 'Corporate', 'Tax', 'Property',
  'Labour', 'Consumer', 'Cyber', 'Constitutional', 'Immigration', 'Banking',
]

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [clientForm, setClientForm] = useState({
    fullName: '', phone: '', city: '', state: '', preferredLanguage: 'en',
  })

  const [lawyerForm, setLawyerForm] = useState({
    fullName: '', bio: '', consultationFee: '', experienceYears: '',
    specializations: [], languages: [], city: '', state: '', isAvailable: true,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile')
      const { user: u } = res.data.data
      if (u.profile) {
        setClientForm({
          fullName: u.profile.fullName || '',
          phone: u.profile.phone || '',
          city: u.profile.city || '',
          state: u.profile.state || '',
          preferredLanguage: u.profile.preferredLanguage || 'en',
        })
      }
      if (u.lawyerProfile) {
        setLawyerForm({
          fullName: u.lawyerProfile.fullName || '',
          bio: u.lawyerProfile.bio || '',
          consultationFee: u.lawyerProfile.consultationFee || '',
          experienceYears: u.lawyerProfile.experienceYears || '',
          specializations: u.lawyerProfile.specializations || [],
          languages: u.lawyerProfile.languages || [],
          city: u.lawyerProfile.city || '',
          state: u.lawyerProfile.state || '',
          isAvailable: u.lawyerProfile.isAvailable ?? true,
        })
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleClientSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/users/profile', clientForm)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLawyerSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/users/lawyer-profile', {
        ...lawyerForm,
        consultationFee: parseFloat(lawyerForm.consultationFee),
        experienceYears: parseInt(lawyerForm.experienceYears),
      })
      setSuccess('Lawyer profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update lawyer profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleSpecialization = (spec) => {
    setLawyerForm(f => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter(s => s !== spec)
        : [...f.specializations, spec],
    }))
  }

  const toggleLanguage = (lang) => {
    setLawyerForm(f => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter(l => l !== lang)
        : [...f.languages, lang],
    }))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white/50">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
          <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="font-heading text-3xl text-white mb-2">Your Profile</h1>
        <p className="text-white/50 mb-10">Keep your details up to date</p>

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

        {/* Account Info */}
        <div className="card mb-6">
          <h2 className="font-heading text-lg text-white mb-4">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-sm">Email</p>
              <p className="text-white">{user?.email}</p>
            </div>
            <span className="text-xs bg-saffron-500/20 text-saffron-500 px-3 py-1 rounded-full font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Client Profile Form */}
        {user?.role !== 'LAWYER' && (
          <div className="card mb-6">
            <h2 className="font-heading text-lg text-white mb-6">Personal Details</h2>
            <form onSubmit={handleClientSave} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Full Name</label>
                <input
                  className="input"
                  placeholder="Rahul Sharma"
                  value={clientForm.fullName}
                  onChange={e => setClientForm(f => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Phone</label>
                <input
                  className="input"
                  placeholder="+91-9876543210"
                  value={clientForm.phone}
                  onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">City</label>
                  <input
                    className="input"
                    placeholder="Mumbai"
                    value={clientForm.city}
                    onChange={e => setClientForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">State</label>
                  <select
                    className="input"
                    value={clientForm.state}
                    onChange={e => setClientForm(f => ({ ...f, state: e.target.value }))}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Preferred Language</label>
                <select
                  className="input"
                  value={clientForm.preferredLanguage}
                  onChange={e => setClientForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Lawyer Profile Form */}
        {user?.role === 'LAWYER' && (
          <div className="card mb-6">
            <h2 className="font-heading text-lg text-white mb-6">Lawyer Profile</h2>
            <form onSubmit={handleLawyerSave} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Full Name</label>
                <input
                  className="input"
                  placeholder="Adv. Priya Mehta"
                  value={lawyerForm.fullName}
                  onChange={e => setLawyerForm(f => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Bio</label>
                <textarea
                  className="input min-h-24 resize-none"
                  placeholder="Brief description of your practice and experience..."
                  value={lawyerForm.bio}
                  onChange={e => setLawyerForm(f => ({ ...f, bio: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="1500"
                    value={lawyerForm.consultationFee}
                    onChange={e => setLawyerForm(f => ({ ...f, consultationFee: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Years of Experience</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="10"
                    value={lawyerForm.experienceYears}
                    onChange={e => setLawyerForm(f => ({ ...f, experienceYears: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">City</label>
                  <input
                    className="input"
                    placeholder="Mumbai"
                    value={lawyerForm.city}
                    onChange={e => setLawyerForm(f => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">State</label>
                  <select
                    className="input"
                    value={lawyerForm.state}
                    onChange={e => setLawyerForm(f => ({ ...f, state: e.target.value }))}
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-3">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map(spec => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpecialization(spec)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        lawyerForm.specializations.includes(spec)
                          ? 'bg-saffron-500 border-saffron-500 text-white'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-3">Languages</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => toggleLanguage(lang.label)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        lawyerForm.languages.includes(lang.label)
                          ? 'bg-gold-400 border-gold-400 text-navy-900'
                          : 'border-white/20 text-white/60 hover:border-white/40'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLawyerForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    lawyerForm.isAvailable ? 'bg-green-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full mx-auto transition-transform ${
                    lawyerForm.isAvailable ? 'translate-x-3' : '-translate-x-3'
                  }`} />
                </button>
                <span className="text-white/70 text-sm">
                  {lawyerForm.isAvailable ? 'Available for consultations' : 'Not available'}
                </span>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Lawyer Profile'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}