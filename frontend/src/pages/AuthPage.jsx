import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { School, User, Mail, Lock, CreditCard, BookOpen, Calendar, BarChart3, BrainCircuit, ChevronDown, Eye, EyeOff, HelpCircle } from 'lucide-react'

const API_REGISTER = 'http://localhost:3000/api/register'

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setIsLogin(location.pathname !== '/register')
  }, [location.pathname])

  const switchToLogin = () => { setIsLogin(true); navigate('/login') }
  const switchToRegister = () => { setIsLogin(false); navigate('/register') }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <div className="hidden md:flex md:w-[55%] relative bg-[#003366] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-blue-900/80 bg-blend-overlay"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c7f1?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-16">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#b6171e] px-3 py-1.5 rounded">
              <div className="flex items-center gap-1.5">
                <School className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm tracking-wide">UCV Match</span>
              </div>
            </div>
          </div>
          <div>
            <div className="border-l-4 border-white pl-6 py-2">
              <p className="text-white/70 text-xs uppercase tracking-[0.2em] mb-2 font-medium">BIENVENIDO A</p>
              <h1 className="text-white font-extrabold text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "'Inter', 'Roboto', system-ui, sans-serif" }}>UCV MATCH</h1>
              <p className="text-white/60 text-sm mt-3 font-light tracking-wide">Plataforma de Mentoría Académica</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#b6171e] text-white rounded-lg px-4 py-2">
              <School className="w-5 h-5" />
              <span className="font-bold text-lg">UCV Match</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="hidden md:inline-flex items-center gap-2 bg-[#b6171e] text-white rounded-lg px-4 py-2 mb-6">
              <School className="w-5 h-5" />
              <span className="font-bold text-lg">UCV Match</span>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button
                onClick={switchToLogin}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={switchToRegister}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Registrarse
              </button>
            </div>

            <h2 className="text-2xl font-bold text-[#003366] mb-1">
              {isLogin ? 'Iniciar sesión' : 'Registro'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin
                ? 'Bienvenido de nuevo. Ingrese sus credenciales para continuar.'
                : 'Cree una cuenta para unirse al programa de mentoría.'}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>

      <div className="hidden md:flex fixed bottom-6 right-6 items-center gap-2 z-50">
        <span className="text-xs text-slate-500">¿Necesitas ayuda?</span>
        <button className="bg-[#b6171e] text-white rounded-full p-2 hover:bg-[#b6171e]/90 transition-colors shadow-md">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!email.trim()) { setError('El email es obligatorio'); return }
    if (!/^[^\s@]+@universidad\.edu$/.test(email)) { setError('Debe ser un email institucional (@universidad.edu)'); return }
    if (!password) { setError('La contraseña es obligatoria'); return }

    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      const role = result.user?.rol || 'JUNIOR'
      const routes = {
        ADMIN: '/dashboard-admin',
        SENIOR: result.user?.pendingValidation ? '/pending-validation' : '/dashboard-senior',
        JUNIOR: '/dashboard-junior',
        DUAL: '/dashboard-senior'
      }
      navigate(routes[role] || '/dashboard-junior')
    } else {
      setError(result.error || 'Credenciales incorrectas')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type="text" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Usuario o Email*"
          className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none"
          required />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña*"
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none"
          required />
        <button type="button" onClick={() => setShowPwd(!showPwd)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex justify-end">
        <a href="#" className="text-xs text-[#b6171e] hover:underline font-medium">¿Olvidaste tu contraseña?</a>
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-[#003366] text-white py-2.5 rounded-lg hover:bg-[#003366]/90 transition-colors disabled:opacity-50 font-medium text-sm">
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-slate-400">o</span></div>
      </div>
      <button type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Iniciar sesión con Google
      </button>
      <p className="text-center text-sm text-slate-500 mt-6">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={() => navigate('/register')} className="text-[#003366] font-medium hover:underline">Regístrate</button>
      </p>
    </form>
  )
}

function RegisterForm() {
  const [form, setForm] = useState({
    nombre: '', codigoEstudiante: '', email: '', password: '',
    carrera: '', cicloActual: '', promedio: '', estiloAprendizaje: '', rol: ''
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio'
    if (!form.codigoEstudiante.trim()) errs.codigoEstudiante = 'El código de estudiante es obligatorio'
    if (!form.email.trim()) errs.email = 'El email es obligatorio'
    else if (!/^[^\s@]+@universidad\.edu$/.test(form.email)) errs.email = 'Debe ser un email institucional (@universidad.edu)'
    if (!form.password) errs.password = 'La contraseña es obligatoria'
    else if (form.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres'
    if (!form.rol) errs.rol = 'Selecciona un rol'
    if (!form.carrera.trim()) errs.carrera = 'La carrera es obligatoria'
    if (!form.cicloActual || form.cicloActual < 1 || form.cicloActual > 10) errs.cicloActual = 'Debe estar entre 1 y 10'
    if (!form.promedio || form.promedio < 0 || form.promedio > 5) errs.promedio = 'Debe estar entre 0 y 5'
    if (!form.estiloAprendizaje) errs.estiloAprendizaje = 'Selecciona un estilo'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccess(false)

    if (!validate()) return

    setLoading(true)

    const payload = {
      nombre: form.nombre,
      codigoEstudiante: form.codigoEstudiante,
      email: form.email,
      password: form.password,
      carrera: form.carrera,
      cicloActual: parseInt(form.cicloActual),
      promedio: parseFloat(form.promedio),
      estiloAprendizaje: form.estiloAprendizaje.toUpperCase().replace(/[/ ]/g, '_'),
      postularSenior: form.rol === 'mentor'
    }

    try {
      const res = await fetch(API_REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/'), 1200)
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.message || 'El email o código de estudiante ya existe')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(data.message || 'Error al registrar. Intente de nuevo.')
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.')
    }

    setLoading(false)
  }

  const set = (name) => (e) => {
    const val = e.target.value
    setForm(prev => ({ ...prev, [name]: val }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (errorMessage) setErrorMessage('')
  }

  const InputGroup = ({ name, icon: Icon, placeholder, type = 'text', errors, children }) => (
    <div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        {children || (
          <input type={type} name={name} value={form[name]} onChange={set(name)}
            placeholder={placeholder}
            className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none ${errors ? 'border-red-500' : 'border-slate-300'}`}
            required />
        )}
      </div>
      {errors && <p className="text-red-500 text-xs mt-1">{errors}</p>}
    </div>
  )

  const SelectGroup = ({ name, icon: Icon, placeholder, options, errors }) => (
    <div>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
        <select name={name} value={form[name]} onChange={set(name)}
          className={`w-full pl-10 pr-8 py-2.5 border rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none ${errors ? 'border-red-500' : 'border-slate-300'}`}>
          <option value="" disabled>{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
      </div>
      {errors && <p className="text-red-500 text-xs mt-1">{errors}</p>}
    </div>
  )

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ¡Registro exitoso! Redirigiendo...
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <InputGroup name="nombre" icon={User} placeholder="Nombre completo*" errors={fieldErrors.nombre} />
      <InputGroup name="codigoEstudiante" icon={CreditCard} placeholder="Código de Estudiante*" errors={fieldErrors.codigoEstudiante} />
      <InputGroup name="email" icon={Mail} type="email" placeholder="Correo electrónico institucional*" errors={fieldErrors.email} />
      <InputGroup name="password" icon={Lock} type="password" placeholder="Contraseña*" errors={fieldErrors.password} />

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Tipo de usuario *</p>
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button type="button" onClick={() => { setForm(prev => ({ ...prev, rol: 'estudiante' })); if (fieldErrors.rol) setFieldErrors(prev => ({ ...prev, rol: '' })); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${form.rol === 'estudiante' ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <School className="inline w-4 h-4 mr-1.5 -mt-0.5" />Estudiante
          </button>
          <button type="button" onClick={() => { setForm(prev => ({ ...prev, rol: 'mentor' })); if (fieldErrors.rol) setFieldErrors(prev => ({ ...prev, rol: '' })); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${form.rol === 'mentor' ? 'bg-white text-[#003366] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            <School className="inline w-4 h-4 mr-1.5 -mt-0.5" />Mentor
          </button>
        </div>
        {fieldErrors.rol && <p className="text-red-500 text-xs mt-1">{fieldErrors.rol}</p>}
      </div>

      <InputGroup name="carrera" icon={BookOpen} placeholder="Carrera*" errors={fieldErrors.carrera} />

      <div className="grid grid-cols-2 gap-4">
        <InputGroup name="cicloActual" icon={Calendar} type="number" placeholder="Ciclo*" errors={fieldErrors.cicloActual} />
        <InputGroup name="promedio" icon={BarChart3} type="number" step="0.01" placeholder="Promedio*" errors={fieldErrors.promedio} />
      </div>

      <SelectGroup name="estiloAprendizaje" icon={BrainCircuit} placeholder="Estilo de aprendizaje*" errors={fieldErrors.estiloAprendizaje}
        options={[
          { value: 'VISUAL', label: 'Visual' },
          { value: 'AUDITIVO', label: 'Auditivo' },
          { value: 'KINESTESICO', label: 'Kinestésico' },
          { value: 'LECTO_ESCRITURA', label: 'Lectura/Escritura' }
        ]} />

      <button type="submit" disabled={loading || success}
        className="w-full bg-[#003366] text-white py-2.5 rounded-lg hover:bg-[#003366]/90 transition-colors disabled:opacity-50 font-medium text-sm mt-2">
        {loading ? 'Registrando...' : 'Registrarse en UCV Match'}
      </button>

      <p className="text-center text-sm text-slate-500 mt-4">
        ¿Ya tienes una cuenta?{' '}
        <button type="button" onClick={() => navigate('/login')} className="text-[#003366] font-medium hover:underline">
          Inicia Sesión
        </button>
      </p>
    </form>
  )
}

export default AuthPage
