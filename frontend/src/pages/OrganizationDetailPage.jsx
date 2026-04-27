import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

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

const ORG_TYPES = {
  LAW_FIRM: '⚖️ Law Firm',
  BANK: '🏦 Bank',
  NBFC: '💳 NBFC',
  ENTERPRISE: '🏢 Enterprise',
  STARTUP: '🚀 Startup',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/30"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function OrganizationDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [org, setOrg] = useState(null)
  const [myRole, setMyRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showApiKey, setShowApiKey] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '', email: '', phone: '', city: '', state: '', gstin: '',
  })

  useEffect(() => { fetchOrg() }, [id])

  const fetchOrg = async () => {
    try {
      const res = await api.get(`/organizations/${id}`)
      setOrg(res.data.data.organization)
      setMyRole(res.data.data.myRole)
      const o = res.data.data.organization
      setEditForm({
        name: o.name || '',
        email: o.email || '',
        phone: o.phone || '',
        city: o.city || '',
        state: o.state || '',
        gstin: o.gstin || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess('')
    try {
      const res = await api.put(`/organizations/${id}`, editForm)
      setOrg(prev => ({ ...prev, ...res.data.data.organization }))
      setEditMode(false)
      setSaveSuccess('Organization updated successfully!')
      setTimeout(() => setSaveSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update organization')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await api.post(`/organizations/${id}/regenerate-key`)
      setOrg(prev => ({ ...prev, apiKey: res.data.data.apiKey }))
      setShowApiKey(true)
      setConfirmRegenerate(false)
      setSaveSuccess('API key regenerated. Copy it now — it will be hidden again when you leave.')
      setTimeout(() => setSaveSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate API key')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white/50">Loading organization...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/organizations" className="btn-secondary text-sm px-4 py-2">
            Back to Organizations
          </Link>
        </div>
      </div>
    )
  }

  const isAdminOrOwner = ['OWNER', 'ADMIN'].includes(myRole)

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link to="/dashboard" className="font-heading text-2xl text-gold-400">NyayAI</Link>
        <div className="flex items-center gap-4">
          <Link to="/organizations" className="text-white/50 hover:text-white text-sm transition-colors">
            ← Organizations
          </Link>
          <Link to="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="px-8 py-10 max-w-5xl mx-auto">
        {/* Org Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-saffron-500/20 flex items-center justify-center text-3xl">
              {ORG_TYPES[org.type]?.split(' ')[0]}
            </div>
            <div>
              <h1 className="font-heading text-3xl text-white">{org.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/50 text-sm">{ORG_TYPES[org.type]}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[myRole]}`}>
                  {myRole}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[org.plan]}`}>
                  {org.plan}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${org.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-white/40 text-xs">{org.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          {isAdminOrOwner && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              Edit Details
            </button>
          )}
        </div>

        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
            {saveSuccess}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
          {['overview', 'members', 'api'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-saffron-500 text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab === 'api' ? 'API Access' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {editMode ? (
              <div className="card">
                <h2 className="font-heading text-lg text-white mb-6">Edit Organization</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Organization Name</label>
                    <input
                      className="input"
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Official Email</label>
                    <input
                      type="email"
                      className="input"
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Phone</label>
                    <input
                      className="input"
                      value={editForm.phone}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 text-sm mb-2">City</label>
                      <input
                        className="input"
                        value={editForm.city}
                        onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-2">State</label>
                      <input
                        className="input"
                        value={editForm.state}
                        onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">GSTIN</label>
                    <input
                      className="input"
                      value={editForm.gstin}
                      onChange={e => setEditForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="flex-1 border border-white/20 text-white/60 py-3 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: org.email },
                  { label: 'Phone', value: org.phone || '—' },
                  { label: 'City', value: org.city || '—' },
                  { label: 'State', value: org.state || '—' },
                  { label: 'GSTIN', value: org.gstin || '—' },
                  { label: 'Plan', value: org.plan },
                  { label: 'Members', value: org.members?.length || 0 },
                  { label: 'Created', value: new Date(org.createdAt).toLocaleDateString('en-IN') },
                ].map(item => (
                  <div key={item.label} className="card">
                    <p className="text-white/40 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/50 text-sm">{org.members?.length} member{org.members?.length !== 1 ? 's' : ''}</p>
              {isAdminOrOwner && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/40 text-sm">
                  Member invitations — coming in next task
                </div>
              )}
            </div>

            {org.members?.map(member => {
              const name = member.user?.profile?.fullName
                || member.user?.lawyerProfile?.fullName
                || member.user?.email
              return (
                <div key={member.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-saffron-500/20 flex items-center justify-center text-saffron-500 font-heading">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{name}</p>
                      <p className="text-white/40 text-xs">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                      {member.role}
                    </span>
                    <span className="text-white/30 text-xs">
                      Joined {new Date(member.joinedAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* API ACCESS TAB */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            {isAdminOrOwner ? (
              <>
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">API Key</h3>
                      <p className="text-white/40 text-sm mt-0.5">
                        Use this key to access NyayAI API programmatically
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-sm border border-white/20 text-white/60 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {showApiKey ? 'Hide' : 'Show'} Key
                      </button>
                      {!confirmRegenerate ? (
                        <button
                          onClick={() => setConfirmRegenerate(true)}
                          className="text-sm border border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Regenerate
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400/70">Invalidates current key.</span>
                          <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="text-sm bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {regenerating ? 'Regenerating...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmRegenerate(false)}
                            className="text-sm text-white/40 hover:text-white px-2 py-1.5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4 font-mono text-sm flex items-center justify-between gap-4">
                    <span className="text-green-400 truncate">
                      {showApiKey ? org.apiKey : '•'.repeat(48)}
                    </span>
                    {showApiKey && org.apiKey && (
                      <CopyButton text={org.apiKey} />
                    )}
                  </div>

                  <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-400/80 text-xs">
                      🔒 Keep this key secret. Never expose it in frontend code or public repositories.
                      Treat it like a password.
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-white font-semibold mb-4">API Usage</h3>
                  <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-white/70 space-y-2">
                    <p className="text-white/40"># Example API call</p>
                    <p><span className="text-saffron-500">curl</span> -X POST https://api.nyayai.in/v1/legal/ask \</p>
                    <p className="pl-4">-H <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span> \</p>
                    <p className="pl-4">-H <span className="text-green-400">"Content-Type: application/json"</span> \</p>
                    <p className="pl-4">-d <span className="text-green-400">{'\'{"question": "What is Section 302 IPC?"}\''}</span></p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-white font-semibold mb-4">Plan Limits</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'API Requests / month', starter: '1,000', pro: '10,000', enterprise: 'Unlimited' },
                      { label: 'Document Analysis', starter: '50', pro: '500', enterprise: 'Unlimited' },
                      { label: 'Legal Research queries', starter: '200', pro: '2,000', enterprise: 'Unlimited' },
                      { label: 'Team members', starter: '3', pro: '15', enterprise: 'Unlimited' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-white/60 text-sm">{item.label}</span>
                        <span className={`text-sm font-medium ${
                          org.plan === 'ENTERPRISE' ? 'text-gold-400'
                          : org.plan === 'PROFESSIONAL' ? 'text-blue-300'
                          : 'text-white/50'
                        }`}>
                          {org.plan === 'ENTERPRISE' ? item.enterprise
                          : org.plan === 'PROFESSIONAL' ? item.pro
                          : item.starter}
                        </span>
                      </div>
                    ))}
                  </div>
                  {org.plan === 'STARTER' && (
                    <div className="mt-4 bg-saffron-500/10 border border-saffron-500/20 rounded-lg p-3 flex items-center justify-between">
                      <p className="text-saffron-500 text-sm">Upgrade for higher limits</p>
                      <button className="text-xs bg-saffron-500 text-white px-3 py-1.5 rounded-lg">
                        Upgrade Plan
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔒</p>
                <p className="text-white/50">Only owners and admins can view API credentials</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
