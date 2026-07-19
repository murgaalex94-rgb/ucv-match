import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { supabase } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

const PendingValidation = lazy(() => import('./pages/PendingValidation'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'))
const DashboardSenior = lazy(() => import('./pages/DashboardSenior'))
const DashboardJunior = lazy(() => import('./pages/DashboardJunior'))
const MentoresPage = lazy(() => import('./pages/MentoresPage'))
const MentoriasPage = lazy(() => import('./pages/MentoriasPage'))
const MensajesPage = lazy(() => import('./pages/MensajesPage'))
const ComunidadPage = lazy(() => import('./pages/ComunidadPage'))
const MisCursosPage = lazy(() => import('./pages/MisCursosPage'))
const LogrosPage = lazy(() => import('./pages/LogrosPage'))
const ReportesPage = lazy(() => import('./pages/ReportesPage'))
const ConfiguracionPage = lazy(() => import('./pages/ConfiguracionPage'))
const RecursosPage = lazy(() => import('./pages/RecursosPage'))

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Cargando...</span>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Keep-alive: evita que Supabase se duerma en plan gratuito
  useEffect(() => {
    if (!user) return
    const interval = setInterval(async () => {
      try {
        await supabase.from('profiles').select('id').limit(1)
      } catch (e) {
        console.warn('[Keep-alive] Query failed:', e)
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={
        !user ? <LandingPage /> : <Navigate to="/dashboard" />
      } />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/pending-validation"
        element={
          user?.pendingValidation ? <SuspenseWrapper><PendingValidation /></SuspenseWrapper> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/dashboard-admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SuspenseWrapper><DashboardAdmin /></SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-senior"
        element={
          <ProtectedRoute allowedRoles={['SENIOR', 'DUAL']}>
            <SuspenseWrapper><DashboardSenior /></SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-junior"
        element={
          <ProtectedRoute allowedRoles={['JUNIOR', 'DUAL']}>
            <SuspenseWrapper><DashboardJunior /></SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SuspenseWrapper><Dashboard /></SuspenseWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentores"
        element={<ProtectedRoute><SuspenseWrapper><MentoresPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/mentorias"
        element={<ProtectedRoute><SuspenseWrapper><MentoriasPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/mensajes"
        element={<ProtectedRoute><SuspenseWrapper><MensajesPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/comunidad"
        element={<ProtectedRoute><SuspenseWrapper><ComunidadPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/mis-cursos"
        element={<ProtectedRoute><SuspenseWrapper><MisCursosPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/logros"
        element={<ProtectedRoute><SuspenseWrapper><LogrosPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/reportes"
        element={<ProtectedRoute><SuspenseWrapper><ReportesPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/configuracion"
        element={<ProtectedRoute><SuspenseWrapper><ConfiguracionPage /></SuspenseWrapper></ProtectedRoute>}
      />
      <Route
        path="/recursos"
        element={<ProtectedRoute><SuspenseWrapper><RecursosPage /></SuspenseWrapper></ProtectedRoute>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AnimatePresence>
  )
}

export default App
