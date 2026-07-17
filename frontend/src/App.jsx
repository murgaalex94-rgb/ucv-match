import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
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
  const { user } = useAuth()

  const getRedirectRoute = () => {
    if (!user) return '/login'
    switch (user.rol) {
      case 'ADMIN':
        return '/dashboard-admin'
      case 'SENIOR':
        return '/dashboard-senior'
      case 'JUNIOR':
        return '/dashboard-junior'
      case 'DUAL':
        return '/dashboard-senior'
      default:
        return '/login'
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/pending-validation" 
        element={
          user?.pendingValidation ? <PendingValidation /> : <Navigate to="/login" />
        } 
      />
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
<Route path="/dashboard" element={<Navigate to="/dashboard-main" replace />} />
<Route path="/dashboard-main" element={<Dashboard />} />
<Route path="/mentores" element={<MentoresPage />} />
<Route path="/mentorias" element={<MentoriasPage />} />
<Route path="/mensajes" element={<MensajesPage />} />
<Route path="/comunidad" element={<ComunidadPage />} />
<Route path="/mis-cursos" element={<MisCursosPage />} />
<Route path="/logros" element={<LogrosPage />} />
<Route path="/reportes" element={<ReportesPage />} />
<Route path="/configuracion" element={<ConfiguracionPage />} />
<Route path="/recursos" element={<RecursosPage />} />
<Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App
