import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth()

  // Mientras se verifica la sesión, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si el usuario tiene validación pendiente
  if (user.pendingValidation) {
    return <Navigate to="/pending-validation" replace />
  }

  // Si se especificaron roles permitidos, verificar el rol
  if (allowedRoles && allowedRoles.length > 0) {
    // Si el usuario es DUAL, permitir acceso a rutas de SENIOR o JUNIOR
    if (user.rol === 'DUAL' && (allowedRoles.includes('SENIOR') || allowedRoles.includes('JUNIOR'))) {
      return children
    }

    if (!allowedRoles.includes(user.rol)) {
      // Redirigir al dashboard correspondiente según el rol
      switch (user.rol) {
        case 'ADMIN':
          return <Navigate to="/dashboard-admin" replace />
        case 'SENIOR':
          return <Navigate to="/dashboard-senior" replace />
        case 'JUNIOR':
          return <Navigate to="/dashboard" replace />
        case 'DUAL':
          return <Navigate to="/dashboard-senior" replace />
        default:
          return <Navigate to="/login" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
