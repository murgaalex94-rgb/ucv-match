import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, ArrowRight, HelpCircle, MessageCircle, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import HelpModal from '../components/HelpModal'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const { demoLogin } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Validación simple de campos vacíos
    if (!email || !password) {
      alert('Por favor, ingresa tu usuario y contraseña.')
      return
    }

    // Simulación de carga (para que el usuario sienta que está iniciando sesión)
    setIsLoading(true)
    
    // Simulación de petición al servidor (1 segundo de espera)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Demo login - setea usuario mock en el contexto
    demoLogin(email, password)
    
    setIsLoading(false)
    
    // Redirigir al Dashboard
    navigate('/dashboard-main')
  }

  return (
    <div className="flex w-full h-screen bg-white overflow-hidden font-sans">

      {/* ========== LEFT PANEL (Desktop only) ========== */}
      <div className="hidden md:flex flex-1 h-full relative">
        <img
          src="/hero_panel_ucv.png"
          alt="Hero UCV Match"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* ========== RIGHT PANEL (Form) ========== */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-8 relative">
        <div className="w-full max-w-md">

{/* Logo Central */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src="/escudo_ucv.png" alt="Logo UCV" className="w-14 h-14 object-contain bg-transparent" />
            <span className="text-2xl font-bold text-[#0f2a5c] tracking-wide">UCV Match</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#0f2a5c] mb-1 text-center tracking-tight">¡Bienvenido de nuevo!</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">Ingresa tus credenciales para acceder a la comunidad académica UCV.</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Email */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Usuario"
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 accent-[#0f2a5c] focus:ring-[#0f2a5c] cursor-pointer"
                />
                Recordarme
              </label>
              <a href="#" className="text-sm text-[#0f2a5c] hover:underline font-medium">¿Olvidaste tu contraseña?</a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f2a5c] text-white py-3 rounded-lg font-bold relative hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50"
            >
              <span className="text-center w-full">{isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">o continúa con</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center">
            <button className="px-10 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          {/* Register */}
          <p className="text-center text-sm text-slate-500 mt-10">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#0f2a5c] font-semibold hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>

{/* Floating Help Button - outside form, bottom right of page */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3">
          <span className="bg-white text-[#0f2a5c] text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
            ¿Necesitas ayuda?
          </span>
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="bg-[#0f2a5c] text-white rounded-full p-3 shadow-lg hover:bg-[#0f2a5c]/90 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </div>
  )
}

export default LoginPage