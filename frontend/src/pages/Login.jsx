import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, GraduationCap, BookOpen } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const emailRegex = /^[^\s@]+@universidad\.edu$/
    if (!emailRegex.test(email)) {
      setError('El correo debe ser institucional (@universidad.edu)')
      setLoading(false)
      return
    }

    const result = await login(email, password)

    if (result.success) {
      const userRole = result.user?.rol || 'JUNIOR'
      switch (userRole) {
        case 'ADMIN':
          navigate('/dashboard-admin')
          break
        case 'SENIOR':
          if (result.user?.pendingValidation) {
            navigate('/pending-validation')
          } else {
            navigate('/dashboard-senior')
          }
          break
        case 'JUNIOR':
          navigate('/dashboard-junior')
          break
        case 'DUAL':
          navigate('/dashboard-senior')
          break
        default:
          navigate('/dashboard-junior')
      }
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-[45%] bg-blue-900 relative overflow-hidden items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Campus Universitario"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/60 to-blue-900/90" />
        <div className="relative z-10 text-center px-8">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white text-2xl font-bold px-8 py-4 rounded-xl mb-6">
            <GraduationCap className="w-8 h-8" />
            MentorLink UCV
          </div>
          <h2 className="text-white text-3xl font-bold mb-3">Plataforma de Mentoría</h2>
          <p className="text-blue-200 text-lg max-w-md mx-auto">
            Conecta estudiantes juniors con seniors para compartir conocimiento y crecer juntos.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <div className="text-center">
              <p className="text-white text-2xl font-bold">100+</p>
              <p className="text-blue-300 text-sm">Mentorías</p>
            </div>
            <div className="w-px bg-blue-700" />
            <div className="text-center">
              <p className="text-white text-2xl font-bold">50+</p>
              <p className="text-blue-300 text-sm">Mentores</p>
            </div>
            <div className="w-px bg-blue-700" />
            <div className="text-center">
              <p className="text-white text-2xl font-bold">200+</p>
              <p className="text-blue-300 text-sm">Estudiantes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-8">
        <div className="w-full max-w-md">
          <div className="md:hidden flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-800 text-white text-lg font-bold px-5 py-2.5 rounded-lg">
              <GraduationCap className="w-6 h-6" />
              MentorLink UCV
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Iniciar Sesión</h2>
          <p className="text-slate-500 mb-8">Accede a tu cuenta de mentoría</p>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="ejemplo@universidad.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline font-medium"
              >
                Regístrate
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
