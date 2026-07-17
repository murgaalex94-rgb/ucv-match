import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Send, Calendar, LogOut, Search } from 'lucide-react'

const DashboardJunior = () => {
  const [stats, setStats] = useState({
    activas: 1,
    enviadas: 1,
    proximas: 2
  })
  const [solicitudes, setSolicitudes] = useState([
    { id: 1, materia: 'Programación II', mentor: 'María García', estado: 'ACEPTADA' },
    { id: 2, materia: 'Matemáticas Discretas', mentor: 'Carlos López', estado: 'PENDIENTE' }
  ])
  const [loading, setLoading] = useState(true)

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

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800'
      case 'ACEPTADA':
        return 'bg-green-100 text-green-800'
      case 'RECHAZADA':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold">UCV Match</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de Estudiante</p>
        </div>
        <nav className="mt-6">
          <a href="#" className="block px-6 py-3 bg-slate-700 text-white">
            Dashboard
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Buscar Mentorías
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Mis Solicitudes
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Mi Progreso
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Buscar nueva mentoría
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
                    <p className="text-slate-600 text-sm">Solicitudes Enviadas</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.enviadas}</p>
                  </div>
                  <Send className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Próximas Sesiones</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.proximas}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Solicitudes Enviadas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Mis Solicitudes de Mentoría</h2>
              {solicitudes.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No has enviado solicitudes aún</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Materia</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Mentor</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes.map((solicitud) => (
                        <tr key={solicitud.id} className="border-b border-slate-100">
                          <td className="py-3 px-4 text-slate-800">{solicitud.materia}</td>
                          <td className="py-3 px-4 text-slate-600">{solicitud.mentor}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(solicitud.estado)}`}>
                              {solicitud.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardJunior
