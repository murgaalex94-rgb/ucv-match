import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.pendingValidation) {
    return <Navigate to="/pending-validation" />
  }

  if (!allowedRoles.includes(user.rol)) {
    // Redirigir al dashboard correspondiente según el rol
    switch (user.rol) {
      case 'ADMIN':
        return <Navigate to="/dashboard-admin" />
      case 'SENIOR':
        return <Navigate to="/dashboard-senior" />
      case 'JUNIOR':
        return <Navigate to="/dashboard-junior" />
      case 'DUAL':
        return <Navigate to="/dashboard-senior" />
      default:
        return <Navigate to="/login" />
    }
  }

  // Si el usuario es DUAL, permitir acceso a rutas de SENIOR o JUNIOR
  if (user.rol === 'DUAL' && (allowedRoles.includes('SENIOR') || allowedRoles.includes('JUNIOR'))) {
    return children
  }

  return children
}

export default ProtectedRoute
