import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', role: 'CLIENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-heading text-3xl text-gold-400 mb-8">
          NyayAI
        </Link>
        <div className="card">
          <h2 className="font-heading text-2xl text-white mb-2">Create your account</h2>
          <p className="text-white/50 text-sm mb-8">Start your legal journey with AI</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">I am a...</label>
              <div className="flex gap-3">
                {[['CLIENT', 'Client'], ['LAWYER', 'Lawyer']].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: val }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.role === val
                        ? 'bg-saffron-500 border-saffron-500 text-white'
                        : 'border-white/20 text-white/60 hover:border-white/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min 8 chars, uppercase, number"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <p className="text-white/30 text-xs mt-1.5">Min 8 characters, one uppercase, one number</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-white/40 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}