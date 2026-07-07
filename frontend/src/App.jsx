import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import FeaturesPage from './pages/FeaturesPage'
import PricingPage from './pages/PricingPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LawyersPage from './pages/LawyersPage'
import DocumentsPage from './pages/DocumentsPage'
import ConsultationsPage from './pages/ConsultationsPage'
import LegalResearchPage from './pages/LegalResearchPage'
import ChatPage from './pages/ChatPage'
import OrganizationsPage from './pages/OrganizationsPage'
import OrganizationDetailPage from './pages/OrganizationDetailPage'
import { Link, useLocation } from 'react-router-dom'

function PublicNav() {
  const location = useLocation()
  const { user } = useAuth()
  const path = location.pathname

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <div className="brand-mark"><span style={{ fontStyle: 'italic' }}>N</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="brand-word">NyayAI</span>
              <span className="brand-sub">Legal Intelligence</span>
            </div>
          </Link>
          <div className="nav-links">
            <Link to="/features" className={`nav-link ${path === '/features' ? 'active' : ''}`}>Features</Link>
            <Link to="/pricing" className={`nav-link ${path === '/pricing' ? 'active' : ''}`}>Pricing</Link>
            <Link to="/about" className={`nav-link ${path === '/about' ? 'active' : ''}`}>About</Link>
            <div className="nav-cta">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Sign in</Link>
                  <Link to="/register" className="btn btn-primary">
                    Request access <span style={{ fontSize: 14 }}>→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

function PublicFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              <div className="brand-mark"><span style={{ fontStyle: 'italic' }}>N</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="brand-word">NyayAI</span>
                <span className="brand-sub">Legal Intelligence</span>
              </div>
            </Link>
            <p className="footer-brand-p">
              India's legal operating system. Built on retrieval-grounded reasoning over statutes, case law, and practitioner workflows.
            </p>
            <div className="footer-langs" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
              <span>न्याय</span>
              <span style={{ fontFamily: 'var(--tamil)' }}>நீதி</span>
              <span style={{ fontFamily: 'var(--bengali)' }}>ন্যায়</span>
              <span style={{ fontFamily: 'var(--urdu)' }}>انصاف</span>
            </div>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <a href="#">Changelog</a>
            <a href="#">API Docs</a>
          </div>
          <div className="footer-col">
            <h4>Practice</h4>
            <a href="#">Research</a>
            <a href="#">Drafting</a>
            <a href="#">Compliance</a>
            <a href="#">Case Strategy</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <a href="#">Research Notes</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy</a>
            <a href="#">Data Handling</a>
            <a href="#">Responsible AI</a>
          </div>
        </div>
        <div className="footer-word">NyayAI</div>
        <div className="footer-bottom">
          <span>© 2026 NyayAI Technologies Pvt. Ltd. · Incorporated in Bengaluru</span>
          <span>v 0.9.2 · Private beta</span>
        </div>
      </div>
    </footer>
  )
}

function PublicLayout({ children }) {
  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      <PublicNav />
      <main style={{ flex: 1 }}>{children}</main>
      <PublicFooter />
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.18em' }}>LOADING...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><ProfilePage /></PrivateRoute>
          } />
          <Route path="/lawyers" element={
            <PrivateRoute><LawyersPage /></PrivateRoute>
          } />
          <Route path="/documents" element={
            <PrivateRoute><DocumentsPage /></PrivateRoute>
          } />
          <Route path="/consultations" element={
            <PrivateRoute><ConsultationsPage /></PrivateRoute>
          } />
          <Route path="/legal-research" element={
            <PrivateRoute><LegalResearchPage /></PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute><ChatPage /></PrivateRoute>
          } />
          <Route path="/organizations" element={
            <PrivateRoute><OrganizationsPage /></PrivateRoute>
          } />
          <Route path="/organizations/:id" element={
            <PrivateRoute><OrganizationDetailPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}