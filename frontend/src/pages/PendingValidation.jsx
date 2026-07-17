import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Clock } from 'lucide-react'

const PendingValidation = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <Clock className="w-16 h-16 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-4">
          Solicitud en revisión
        </h1>
        
        <p className="text-slate-600 mb-6">
          Tu solicitud para ser mentor de nivel senior está siendo revisada por el administrador.
          Te notificaremos cuando tu cuenta sea validada.
        </p>
        
        <p className="text-sm text-slate-500 mb-8">
          Por favor, verifica tu correo electrónico para actualizaciones sobre el estado de tu solicitud.
        </p>
        
        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900 transition-colors font-medium"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default PendingValidation
