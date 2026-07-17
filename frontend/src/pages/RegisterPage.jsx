import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, CreditCard, Mail, Lock, Eye, EyeOff, ArrowRight, HelpCircle, BookOpen, Calendar, BarChart3, Lightbulb, ChevronDown, X } from 'lucide-react'
import HelpModal from '../components/HelpModal'

const RegisterPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    codigoEstudiante: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '',
    carrera: '',
    ciclo: '',
    promedio: '',
    estiloAprendizaje: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!form.codigoEstudiante.trim()) { setError('El código de estudiante es obligatorio'); return }
    if (!form.email.trim()) { setError('El correo es obligatorio'); return }
    if (!form.password) { setError('La contraseña es obligatoria'); return }
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (!form.rol) { setError('Selecciona un rol'); return }
    if (!form.carrera) { setError('Selecciona una carrera'); return }
    if (!form.ciclo) { setError('Selecciona un ciclo'); return }
    if (!form.promedio) { setError('El promedio es obligatorio'); return }
    if (!form.estiloAprendizaje) { setError('Selecciona un estilo de aprendizaje'); return }

    setLoading(true)
    console.log('Registro:', form)
    setTimeout(() => {
      setLoading(false)
      navigate('/login')
    }, 1500)
  }

  const carreras = [
    'Administración',
    'Administración en Turismo y Hotelería',
    'Arquitectura',
    'Arte y Diseño Gráfico Empresarial',
    'Ciencias de la Comunicación',
    'Ciencias del Deporte',
    'Contabilidad',
    'Derecho',
    'Economía',
    'Educación Inicial',
    'Educación Primaria',
    'Enfermería',
    'Estomatología',
    'Ingeniería Agroindustrial',
    'Ingeniería Ambiental',
    'Ingeniería Civil',
    'Ingeniería de Ciencia de Datos',
    'Ingeniería de Minas',
    'Ingeniería de Sistemas',
    'Ingeniería Empresarial',
    'Ingeniería en Ciberseguridad',
    'Ingeniería Industrial',
    'Ingeniería Mecánica Eléctrica',
    'Marketing y Dirección de Empresas',
    'Medicina',
    'Negocios Internacionales',
    'Nutrición',
    'Psicología',
    'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica',
    'Traducción e Interpretación'
  ]

  return (
    <div className="flex w-full min-h-screen bg-white overflow-y-auto font-sans">

      {/* COLUMNA IZQUIERDA - IMAGEN ÚNICA */}
      <div className="hidden md:flex md:w-1/2 h-full relative bg-[#0f2a5c]">
        <img 
          src="/hero_panel_ucv.png" 
          alt="Panel UCV Match" 
          className="w-full h-full object-cover object-center" 
        />
      </div>

      {/* COLUMNA DERECHA - FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-8 relative">
        <div className="w-full max-w-md">

          {/* Logo Central */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/escudo_ucv.png" className="w-14 h-14 object-contain" />
            <span className="text-[#0f2a5c] text-2xl font-bold tracking-wide">UCV Match</span>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-[#0f2a5c] mb-1 text-center">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">Únete a la comunidad académica UCV.</p>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {/* Nombre */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
            </div>

            {/* Código de Estudiante */}
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="codigoEstudiante"
                value={form.codigoEstudiante}
                onChange={handleChange}
                placeholder="Código de Estudiante"
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Correo electrónico institucional"
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
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

            {/* Confirmar Contraseña */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Selector de Rol */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Tipo de cuenta *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rol: 'estudiante' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    form.rol === 'estudiante'
                      ? 'bg-[#0f2a5c] text-white shadow-md'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rol: 'mentor' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    form.rol === 'mentor'
                      ? 'bg-[#0f2a5c] text-white shadow-md'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  Mentor
                </button>
              </div>
            </div>

            {/* Carrera - Select estilizado */}
            <div className="relative w-full border border-gray-200 rounded-xl">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                name="carrera"
                value={form.carrera}
                onChange={handleChange}
                className="appearance-none bg-transparent pl-10 pr-10 py-3 w-full outline-none text-sm cursor-pointer"
                required
              >
                <option value="" disabled selected>Selecciona tu carrera</option>
                {carreras.map((carrera) => (
                  <option key={carrera} value={carrera}>{carrera}</option>
                ))}
              </select>
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* FILA DE CICLO Y PROMEDIO (CORREGIDA) */}
<div className="flex flex-col md:flex-row gap-4 w-full items-center">
  
  {/* CICLO */}
  <div className="relative flex-1 w-full">
    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
    <select 
      name="ciclo"
      value={form.ciclo}
      onChange={handleChange}
      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] cursor-pointer h-[44px]"
      required
    >
      <option value="" disabled>Selecciona tu ciclo</option>
      {[...Array(12)].map((_, i) => (
        <option key={i + 1} value={i + 1}>{i + 1}° Ciclo</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>

  {/* PROMEDIO */}
  <div className="relative flex-1 w-full">
    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input 
      type="number" 
      name="promedio"
      value={form.promedio}
      onChange={handleChange}
      step="0.1"
      placeholder="Promedio" 
      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white font-medium focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] placeholder:text-gray-400 h-[44px]" 
      required
    />
  </div>
  
</div>

            {/* Estilo de aprendizaje - Select estilizado */}
            <div className="relative w-full border border-gray-200 rounded-xl">
              <Lightbulb className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                name="estiloAprendizaje"
                value={form.estiloAprendizaje}
                onChange={handleChange}
                className="appearance-none bg-transparent pl-10 pr-10 py-3 w-full outline-none text-sm cursor-pointer"
                required
              >
                <option value="" disabled selected>Selecciona tu estilo</option>
                <option value="visual">Visual</option>
                <option value="auditivo">Auditivo</option>
                <option value="kinestesico">Kinestésico</option>
                <option value="lectoescritura">Lecto/Escritura</option>
              </select>
              <Lightbulb className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2a5c] text-white py-3 rounded-xl font-bold hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-10">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-[#0f2a5c] font-semibold hover:underline"
            >
              Inicia Sesión
            </button>
          </p>
        </div>

        {/* Floating Help Button */}
        <div className="absolute bottom-6 right-6">
          <button
            onClick={() => setShowHelp(true)}
            className="bg-[#0f2a5c] text-white rounded-full p-3 shadow-lg hover:bg-[#0f2a5c]/90 transition-colors flex items-center gap-2"
          >
            <span className="bg-white text-[#0f2a5c] text-xs font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
              ¿Necesitas ayuda?
            </span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Help Modal */}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </div>
  )
}

export default RegisterPage