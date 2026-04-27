import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

const ROLE_COLORS = {
  CLIENT: 'bg-blue-500/20 text-blue-300',
  LAWYER: 'bg-green-500/20 text-green-300',
  ORG_ADMIN: 'bg-purple-500/20 text-purple-300',
  SUPER_ADMIN: 'bg-saffron-500/20 text-saffron-500',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

const cards = [
  { title: 'Profile', desc: 'Complete your personal details', icon: '👤', link: '/profile', ready: true },
  { title: 'Documents', desc: 'Upload and analyse legal documents', icon: '📄', link: '/documents', ready: true },
  { title: 'Lawyers', desc: 'Find and book verified advocates', icon: '⚖️', link: '/lawyers', ready: true },
  { title: 'Consultations', desc: 'Manage your legal consultations', icon: '📅', link: '/consultations', ready: true },
  { title: 'AI Research', desc: 'Query IPC, CrPC, and Indian case law', icon: '🤖', link: '/legal-research', ready: true },
  { title: 'Organizations', desc: 'Manage your firm and team', icon: '🏢', link: '/organizations', ready: true },
]

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="font-heading text-2xl text-gold-400">NyayAI</span>
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-white/60 hover:text-white text-sm transition-colors">
            Profile
          </Link>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${ROLE_COLORS[user?.role] || ''}`}>
            {user?.role}
          </span>
          <span className="text-white/60 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="px-8 py-12 max-w-5xl mx-auto">
        <h1 className="font-heading text-3xl text-white mb-2">Welcome to NyayAI 🎉</h1>
        <p className="text-white/50 mb-10">Your backend is connected and auth is working.</p>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-10 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <div>
            <p className="text-green-400 font-semibold text-sm">Backend Connected</p>
            <p className="text-green-400/60 text-xs mt-0.5">PostgreSQL + Express + Prisma running locally</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(c => (
            c.ready ? (
              <Link key={c.title} to={c.link} className="card flex items-start gap-4 hover:border-saffron-500/50 transition-colors cursor-pointer">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{c.title}</h3>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Ready</span>
                  </div>
                  <p className="text-white/40 text-sm">{c.desc}</p>
                </div>
              </Link>
            ) : (
              <div key={c.title} className="card flex items-start gap-4 opacity-50">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{c.title}</h3>
                    <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{c.week}</span>
                  </div>
                  <p className="text-white/40 text-sm">{c.desc}</p>
                </div>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  )
}