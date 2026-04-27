import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const ORG_TYPES = [
  { value: 'LAW_FIRM', label: '⚖️ Law Firm' },
  { value: 'BANK', label: '🏦 Bank' },
  { value: 'NBFC', label: '💳 NBFC' },
  { value: 'ENTERPRISE', label: '🏢 Enterprise' },
  { value: 'STARTUP', label: '🚀 Startup' },
]

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
]

const ROLE_COLORS = {
  OWNER: 'bg-gold-400/20 text-gold-400',
  ADMIN: 'bg-blue-500/20 text-blue-300',
  MEMBER: 'bg-green-500/20 text-green-400',
  VIEWER: 'bg-white/10 text-white/50',
}

const PLAN_COLORS = {
  STARTER: 'bg-white/10 text-white/50',
  PROFESSIONAL: 'bg-blue-500/20 text-blue-300',
  ENTERPRISE: 'bg-gold-400/20 text-gold-400',
}

function OrgCard({ org, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card hover:border-white/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-saffron-500/20 flex items-center justify-center text-2xl">
            {ORG_TYPES.find(t => t.value === org.type)?.label.split(' ')[0] || '🏢'}
          </div>
          <div>
            <h3 className="text-white font-semibold">{org.name}</h3>
            <p className="text-white/40 text-sm">
              {ORG_TYPES.find(t => t.value === org.type)?.label.split(' ').slice(1).join(' ')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[org.myRole]}`}>
            {org.myRole}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${PLAN_COLORS[org.plan]}`}>
            {org.plan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-white font-semibold text-lg">{org.members?.length || 0}</p>
          <p className="text-white/40 text-xs">Members</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-white font-semibold text-lg">{org.city || '—'}</p>
          <p className="text-white/40 text-xs">City</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <p className="text-white font-semibold text-lg truncate">{org.state || '—'}</p>
          <p className="text-white/40 text-xs">State</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <p className="text-white/30 text-xs">{org.email}</p>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${org.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-white/40 text-xs">{org.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    </div>
  )
}

function CreateOrgModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    type: 'LAW_FIRM',
    email: '',
    phone: '',
    city: '',
    state: '',
    gstin: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/organizations', form)
      onCreated(res.data.data.organization)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-navy-800 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-navy-800">
          <h2 className="font-heading text-xl text-white">Create Organization</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Organization Name *</label>
              <input
                className="input"
                placeholder="e.g. Mehta & Associates"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Organization Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ORG_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: type.value }))}
                    className={`py-2.5 px-3 rounded-lg text-sm border transition-colors text-left ${
                      form.type === type.value
                        ? 'bg-saffron-500 border-saffron-500 text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Official Email *</label>
              <input
                type="email"
                className="input"
                placeholder="contact@lawfirm.in"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Phone</label>
              <input
                className="input"
                placeholder="+91-9876543210"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-sm mb-2">City</label>
                <input
                  className="input"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">State</label>
                <select
                  className="input"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">GSTIN</label>
              <input
                className="input"
                placeholder="22AAAAA0000A1Z5"
                value={form.gstin}
                onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                maxLength={15}
              />
              <p className="text-white/30 text-xs mt-1">15-character GST Identification Number</p>
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
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchOrganizations() }, [])

  const fetchOrganizations = async () => {
    try {
      const res = await api.get('/organizations/mine')
      setOrganizations(res.data.data.organizations)
    } catch {
      setError('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (org) => {
    setOrganizations(prev => [{ ...org, myRole: 'OWNER', members: [] }, ...prev])
    setShowCreate(false)
    navigate(`/organizations/${org.id}`)
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {showCreate && (
        <CreateOrgModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link>
          <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
        </div>
      </header>

      <main className="px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl text-white mb-2">Organizations</h1>
            <p className="text-white/50">Manage your law firms and enterprise accounts</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New Organization
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* B2B Info Banner */}
        <div className="bg-gold-400/5 border border-gold-400/20 rounded-xl p-5 mb-8 flex items-start gap-4">
          <span className="text-2xl">🏢</span>
          <div>
            <p className="text-gold-400 font-semibold text-sm">NyayAI for Organizations</p>
            <p className="text-white/50 text-sm mt-1">
              Create an organization to collaborate with your team, manage shared documents,
              track consultations, and access the NyayAI API for your applications.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏢</p>
            <p className="text-white/50 mb-2">No organizations yet</p>
            <p className="text-white/30 text-sm mb-6">
              Create your first organization to start collaborating with your team
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary px-8">
              Create Organization
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {organizations.map(org => (
              <OrgCard
                key={org.id}
                org={org}
                onClick={() => navigate(`/organizations/${org.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}