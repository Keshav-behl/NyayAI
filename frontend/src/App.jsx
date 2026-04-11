import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import LawyersPage from './pages/LawyersPage'
import DocumentsPage from './pages/DocumentsPage'
import ConsultationsPage from './pages/ConsultationsPage'
import LegalResearchPage from './pages/LegalResearchPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}