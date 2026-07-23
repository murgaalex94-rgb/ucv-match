import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth()
  const [sessionValid, setSessionValid] = useState(null)
  const [validatingSession, setValidatingSession] = useState(true)

  useEffect(() => {
    const validateSession = async () => {
      if (!user) {
        setSessionValid(false)
        setValidatingSession(false)
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) {
          setSessionValid(false)
        } else {
          setSessionValid(true)
        }
      } catch (error) {
        console.error('Error validando sesión:', error)
        setSessionValid(false)
      } finally {
        setValidatingSession(false)
      }
    }

    validateSession()
  }, [user])

  if (loading || validatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  if (!user || sessionValid === false) {
    return <Navigate to="/login" state={{ message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' }} replace />
  }

  if (!user.email_confirmed_at) {
    return <Navigate to="/login" state={{ message: 'Debes confirmar tu correo electrónico antes de acceder. Revisa tu bandeja de entrada.' }} replace />
  }

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
