import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Users, UserCheck, BookOpen, LogOut } from 'lucide-react'
import { getAdminStats, getPendingSeniors, approveSenior, rejectSenior } from '../lib/supabaseServices'

const DashboardAdmin = () => {
  const [stats, setStats] = useState({ totalUsuarios: 0, seniorsPendientes: 0, mentoriasActivas: 0 })
  const [pendingSeniors, setPendingSeniors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [statsData, seniorsData] = await Promise.all([
      getAdminStats(),
      getPendingSeniors()
    ])
    setStats(statsData)
    setPendingSeniors(seniorsData)
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    await approveSenior(id)
    await loadData()
    setActionLoading(null)
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    await rejectSenior(id, 'Solicitud rechazada por el administrador')
    await loadData()
    setActionLoading(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold">UCV Match</h1>
          <p className="text-slate-400 text-sm mt-1">Panel de Administración</p>
        </div>
        <nav className="mt-6">
          <a href="#" className="block px-6 py-3 bg-slate-700 text-white">
            Dashboard
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Usuarios
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Materias
          </a>
          <a href="#" className="block px-6 py-3 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Reportes
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
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
                    <p className="text-slate-600 text-sm">Total Usuarios</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.totalUsuarios}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Seniors Pendientes</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.seniorsPendientes}</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">Mentorías Activas</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{stats.mentoriasActivas}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Pending Seniors Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Seniors Pendientes de Validación</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Carrera</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Ciclo</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Promedio</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSeniors.map((senior) => (
                      <tr key={senior.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-800">{senior.usuario?.nombre_completo || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-600">{senior.usuario?.carrera || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-600">{senior.usuario?.ciclo || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-600">{senior.usuario?.promedio || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(senior.id)}
                              disabled={actionLoading === senior.id}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm disabled:opacity-50"
                            >
                              {actionLoading === senior.id ? '...' : 'Aprobar'}
                            </button>
                            <button
                              onClick={() => handleReject(senior.id)}
                              disabled={actionLoading === senior.id}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                            >
                              {actionLoading === senior.id ? '...' : 'Rechazar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardAdmin
