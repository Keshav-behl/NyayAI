import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="font-heading text-2xl text-gold-400">NyayAI</span>
        <div className="flex gap-4">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center py-24">
        <div className="inline-block bg-saffron-500/10 border border-saffron-500/30 text-saffron-500 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          AI-Powered Legal Platform for India
        </div>
        <h1 className="font-heading text-5xl md:text-7xl text-white max-w-4xl leading-tight mb-6">
          Justice, powered by <span className="text-gold-400">intelligence</span>
        </h1>
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          From document analysis to lawyer matching — NyayAI makes Indian law accessible,
          understandable, and actionable for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-4">
            Start for Free
          </Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-4">
            I have an account
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {['Document Analysis', 'Lawyer Marketplace', 'Legal Research', 'B2B API', 'IPC & CrPC', 'Hindi Support'].map(f => (
            <span key={f} className="bg-white/5 border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-white/30 text-sm border-t border-white/10">
        © 2024 NyayAI — Built for Bharat 🇮🇳
      </footer>
    </div>
  )
}