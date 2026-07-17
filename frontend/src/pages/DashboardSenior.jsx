import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Mail, Calendar, LogOut, Plus } from 'lucide-react'

const DashboardSenior = () => {
  const [stats, setStats] = useState({
    activas: 3,
    solicitudes: 2,
    sesionesSemana: 5
  })
  const [solicitudes, setSolicitudes] = useState([
    { id: 1, nombre: 'Juan Pérez', materia: 'Programación II', mensaje: 'Hola, necesito ayuda con...' },
    { id: 2, nombre: 'Ana Rodríguez', materia: 'Estructuras de Datos', mensaje: '¿Podrías explicarme...' }
  ])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAccept = (id) => {
    console.log('Aceptar solicitud:', id)
    setSolicitudes(prev => prev.filter(s => s.id !== id))
  }

  const handleReject = (id) => {
    console.log('Rechazar solicitud:', id)
    setSolicitudes(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold">UCV Match</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de Mentor Senior</p>
        </div>
        <nav className="mt-6">
          <a href="#" className="block px-6 py-3 bg-slate-700 text-white">
            Dashboard
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Mis Ofertas
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Solicitudes
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Mi Árbol
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Mi Perfil
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Bienvenido, {user?.nombre}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear oferta
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Mentorías Activas</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.activas}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Solicitudes Pendientes</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.solicitudes}</p>
                  </div>
                  <Mail className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Sesiones esta semana</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.sesionesSemana}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Solicitudes List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Solicitudes de Mentoría</h2>
              {solicitudes.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No hay solicitudes pendientes</p>
              ) : (
                <div className="space-y-4">
                  {solicitudes.map((solicitud) => (
                    <div key={solicitud.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-800">{solicitud.nombre}</h3>
                          <p className="text-slate-600 text-sm mt-1">{solicitud.materia}</p>
                          <p className="text-slate-500 text-sm mt-2">{solicitud.mensaje}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(solicitud.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleReject(solicitud.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal placeholder */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h2 className="text-xl font-bold text-slate-800 mb-4">Crear Oferta de Mentoría</h2>
                  <p className="text-slate-600 mb-4">Esta funcionalidad estará disponible próximamente.</p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardSenior
