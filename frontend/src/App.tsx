import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './AppLayout'
import LandingPage from './views/LandingPage'

function Spinner() {
  return (
    <div className="h-screen bg-[#080b12] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )
}

export default function App() {
  const { user, restoring } = useAuth()

  if (restoring) return <Spinner />

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/login"  element={user ? <Navigate to="/app" replace /> : <LandingPage initialMode="login"  />} />
      <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <LandingPage initialMode="signup" />} />
      <Route path="/app/*"  element={user ? <AppLayout /> : <Navigate to="/" replace />} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  )
}
