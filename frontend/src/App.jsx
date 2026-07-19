import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'
import PendingValidation from './pages/PendingValidation'
import RecursosPage from './pages/RecursosPage'
import MentoriasPage from './pages/MentoriasPage'
import MentoresPage from './pages/MentoresPage'
import MensajesPage from './pages/MensajesPage'
import ComunidadPage from './pages/ComunidadPage'
import MisCursosPage from './pages/MisCursosPage'
import LogrosPage from './pages/LogrosPage'
import ReportesPage from './pages/ReportesPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import Dashboard from './pages/Dashboard'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardSenior from './pages/DashboardSenior'
import DashboardJunior from './pages/DashboardJunior'

function App() {
  const { user, loading } = useAuth()
  const location = useLocation()

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
      {/* Landing page pública */}
      <Route path="/" element={<LandingPage />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/pending-validation"
        element={
          user?.pendingValidation ? <PendingValidation /> : <Navigate to="/login" replace />
        }
      />

      {/* Dashboards protegidos por rol */}
      <Route
        path="/dashboard-admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-senior"
        element={
          <ProtectedRoute allowedRoles={['SENIOR', 'DUAL']}>
            <DashboardSenior />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-junior"
        element={
          <ProtectedRoute allowedRoles={['JUNIOR', 'DUAL']}>
            <DashboardJunior />
          </ProtectedRoute>
        }
      />

      {/* Dashboard general - protegido */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Páginas protegidas - requieren autenticación */}
      <Route
        path="/mentores"
        element={<ProtectedRoute><MentoresPage /></ProtectedRoute>}
      />
      <Route
        path="/mentorias"
        element={<ProtectedRoute><MentoriasPage /></ProtectedRoute>}
      />
      <Route
        path="/mensajes"
        element={<ProtectedRoute><MensajesPage /></ProtectedRoute>}
      />
      <Route
        path="/comunidad"
        element={<ProtectedRoute><ComunidadPage /></ProtectedRoute>}
      />
      <Route
        path="/mis-cursos"
        element={<ProtectedRoute><MisCursosPage /></ProtectedRoute>}
      />
      <Route
        path="/logros"
        element={<ProtectedRoute><LogrosPage /></ProtectedRoute>}
      />
      <Route
        path="/reportes"
        element={<ProtectedRoute><ReportesPage /></ProtectedRoute>}
      />
      <Route
        path="/configuracion"
        element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>}
      />
      <Route
        path="/recursos"
        element={<ProtectedRoute><RecursosPage /></ProtectedRoute>}
      />

      {/* Cualquier ruta no encontrada redirige a la landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AnimatePresence>
  )
}

export default App
