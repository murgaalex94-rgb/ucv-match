import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, CreditCard, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Calendar, BarChart3, Lightbulb, ChevronDown, Search, X, CheckCircle, XCircle } from 'lucide-react'
import HelpButton from '../components/HelpButton'
import { supabase } from '../lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'
import { mallasCurriculares, getCursosPorCarrera } from '../constants/mallasCurriculares'

const RegisterPage = () => {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    codigoEstudiante: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: '',
    carrera: '',
    ciclo: '',
    promedio: '',
  })
  const [cursosSeleccionados, setCursosSeleccionados] = useState([])
  const [cursoSearch, setCursoSearch] = useState('')
  const [cursoOpen, setCursoOpen] = useState(false)
  const cursoRef = useRef(null)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [promedioError, setPromedioError] = useState('')
  const [carreraOpen, setCarreraOpen] = useState(false)
  const carreraRef = useRef(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaExpired, setCaptchaExpired] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (carreraRef.current && !carreraRef.current.contains(e.target)) {
        setCarreraOpen(false)
      }
      if (cursoRef.current && !cursoRef.current.contains(e.target)) {
        setCursoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCarreraSelect = (carrera) => {
    setForm(prev => ({ ...prev, carrera }))
    setCursosSeleccionados([])
    setCursoSearch('')
    setCarreraOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePromedioChange = (e) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, promedio: value }))
    if (parseFloat(value) > 20) {
      setPromedioError('El promedio máximo es 20')
    } else {
      setPromedioError('')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setDeleteMessage('')
    const errors = {}

    if (!form.nombres.trim()) errors.nombres = 'El nombre es obligatorio'
    if (!form.apellidos.trim()) errors.apellidos = 'Los apellidos son obligatorios'
    if (!form.codigoEstudiante.trim()) errors.codigoEstudiante = 'El código de estudiante es obligatorio'
    if (!form.email.trim()) errors.email = 'El correo es obligatorio'
    if (form.email.trim() && !form.email.trim().endsWith('@ucvvirtual.edu.pe')) errors.email = 'Debes usar tu correo institucional de la UCV.'
    if (!form.password) errors.password = 'La contraseña es obligatoria'
    if (form.password && form.password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres'
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.rol) errors.rol = 'Selecciona un rol'
    if (!form.carrera) errors.carrera = 'Selecciona una carrera'
    if (!form.ciclo) errors.ciclo = 'Selecciona un ciclo'
    if (!form.promedio) errors.promedio = 'El promedio es obligatorio'
    if (cursosSeleccionados.length === 0) errors.curso = 'Selecciona al menos un curso'
    if (!captchaToken) errors.captcha = 'Por favor, completa el CAPTCHA'
    if (captchaExpired) errors.captcha = 'El CAPTCHA ha expirado. Por favor, haz clic en la casilla de verificación nuevamente.'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const signupRes = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          captchaToken,
          userData: {
            nombre_completo: (form.nombres + ' ' + form.apellidos).trim(),
            codigo_estudiante: form.codigoEstudiante,
            rol: form.rol.charAt(0).toUpperCase() + form.rol.slice(1),
            carrera: form.carrera,
            ciclo: parseInt(form.ciclo),
            promedio: parseFloat(form.promedio),
            cursos: cursosSeleccionados,
          },
        }),
      })
      let signupData
      try {
        signupData = await signupRes.json()
      } catch (jsonErr) {
        const text = await signupRes.text()
        throw new Error('Respuesta no JSON: ' + text.substring(0, 200) + ' | status: ' + signupRes.status)
      }

      if (!signupRes.ok) {
        throw new Error(signupData?.message || 'Error al registrar')
      }

      navigate('/confirm-email', { state: { email: form.email } })
    } catch (error) {
      console.error('Error en registro:', error.message)
      const msg = (error?.message || '').toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate key') || msg.includes('unique constraint')) {
        try {
          setError('Verificando cuenta existente...')
          const delRes = await fetch('/api/delete-unconfirmed-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, codigoEstudiante: form.codigoEstudiante }),
          })
          const delData = await delRes.json()
          if (delRes.ok) {
            setError('')
            setCaptchaToken(null)
            setCaptchaVerified(false)
            setCaptchaKey(k => k + 1)
            setDeleteMessage('Cuenta antigua eliminada. Presiona "Crear Cuenta" para registrarte de nuevo.')
          } else if (delRes.status === 404) {
            setError('')
            setCaptchaToken(null)
            setCaptchaVerified(false)
            setCaptchaKey(k => k + 1)
            setDeleteMessage('Tu cuenta ya existe y está confirmada. Ve a Iniciar Sesión o usa "Olvidé mi contraseña".')
          } else {
            setError(delData?.message || 'No se pudo eliminar la cuenta pendiente.')
          }
        } catch (_) {
          setError('Error al verificar la cuenta pendiente. Intenta de nuevo o contacta a soporte.')
        }
      } else {
        const errorMessage = error?.message || error?.error_description || JSON.stringify(error) || 'Error al registrar usuario'
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const facultades = [
    {
      label: 'Facultad de Ciencias Empresariales',
      carreras: ['Administración de Empresas', 'Administración y Negocios Internacionales', 'Contabilidad']
    },
    {
      label: 'Facultad de Ingeniería y Arquitectura',
      carreras: ['Arquitectura', 'Ingeniería Ambiental', 'Ingeniería Civil', 'Ingeniería de Sistemas', 'Ingeniería Industrial']
    },
    {
      label: 'Facultad de Derecho y Ciencias Políticas',
      carreras: ['Derecho']
    },
    {
      label: 'Facultad de Humanidades',
      carreras: ['Arte & Diseño Gráfico Empresarial', 'Ciencias de la Comunicación', 'Ciencias del Deporte', 'Educación Inicial', 'Educación en Idiomas - Inglés']
    },
    {
      label: 'Facultad de Ciencias de la Salud',
      carreras: ['Enfermería', 'Psicología', 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica', 'Tecnología Médica en Terapia Física y Rehabilitación']
    }
  ]

  const carreraMalla = mallasCurriculares[form.carrera]
  const cycleCourses = carreraMalla
    ? Object.values(carreraMalla).flat()
    : []
  const availableCourses = cycleCourses.filter(
    (c) => !cursosSeleccionados.includes(c) && c.toLowerCase().includes(cursoSearch.toLowerCase())
  )
  const emailValid = form.email.length > 0 && form.email.endsWith('@ucvvirtual.edu.pe')

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex w-full min-h-screen bg-white overflow-y-auto font-sans">

      {/* COLUMNA IZQUIERDA - IMAGEN ÚNICA */}
      <div className="hidden md:flex md:w-1/2 h-screen relative bg-[#0f2a5c] overflow-hidden">
        <img 
          src="/hero_panel_ucv.png" 
          alt="Panel UCV Match" 
          className="w-full h-full object-cover object-center" 
        />
      </div>

      {/* COLUMNA DERECHA - FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white pt-16 pb-8 px-4 md:px-8 relative min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo Central */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/escudo_ucv.png" className="w-14 h-14 object-contain" />
            <span className="text-[#0f2a5c] text-2xl font-bold tracking-wide">UCV Match</span>
          </div>

          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f2a5c] mb-1 text-center">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">Únete a la comunidad académica UCV.</p>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}
            {deleteMessage && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">{deleteMessage}</div>
            )}

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Nombres"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                  required
                />
                {fieldErrors.nombres && <p className="text-red-500 text-xs mt-1">{fieldErrors.nombres}</p>}
              </div>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  placeholder="Apellidos"
                  className="w-full pl-11 pr-4 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                  required
                />
                {fieldErrors.apellidos && <p className="text-red-500 text-xs mt-1">{fieldErrors.apellidos}</p>}
              </div>
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
                className="w-full pl-11 pr-12 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              {fieldErrors.codigoEstudiante && <p className="text-red-500 text-xs mt-1">{fieldErrors.codigoEstudiante}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo Institucional"
                className={`w-full pl-11 pr-12 py-4 border rounded-xl text-sm focus:ring-2 outline-none transition-all ${
                  form.email && !emailValid
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : emailValid
                      ? 'border-green-300 focus:ring-green-200 focus:border-green-500'
                      : 'border-gray-200 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c]'
                }`}
                required
              />
              {form.email.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {emailValid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-xs font-medium">Correo institucional válido</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500 text-xs">Debes usar tu correo institucional de la UCV (@ucvvirtual.edu.pe)</span>
                    </>
                  )}
                </div>
              )}
              {fieldErrors.email && !form.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
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
                className="w-full pl-11 pr-11 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>
            {form.password && (
              <div className="mt-2 space-y-1.5 text-xs">
                {[
                  { label: 'Al menos 8 caracteres', test: form.password.length >= 8 },
                  { label: '1 letra mayúscula', test: /[A-Z]/.test(form.password) },
                  { label: '1 letra minúscula', test: /[a-z]/.test(form.password) },
                  { label: '1 número', test: /[0-9]/.test(form.password) },
                  { label: '1 carácter especial', test: /[^A-Za-z0-9]/.test(form.password) },
                ].map((req) => (
                  <div key={req.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${req.test ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={req.test ? 'text-green-700' : 'text-red-600'}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirmar Contraseña */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className="w-full pl-11 pr-11 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
            {form.confirmPassword && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${form.password === form.confirmPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className={form.password === form.confirmPassword ? 'text-green-700' : 'text-red-500'}>
                  Las contraseñas{form.password === form.confirmPassword ? '' : ' no'} coinciden
                </span>
              </div>
            )}

            {/* Selector de Rol */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Tipo de cuenta *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, rol: 'estudiante' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    form.rol === 'mentor'
                      ? 'bg-[#0f2a5c] text-white shadow-md'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Lightbulb className="w-4 h-4" />
                  Mentor
                </button>
              </div>
              {fieldErrors.rol && <p className="text-red-500 text-xs mt-1">{fieldErrors.rol}</p>}
            </div>

            {/* Carrera - Dropdown personalizado */}
            <div className="relative w-full" ref={carreraRef}>
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <button
                type="button"
                onClick={() => setCarreraOpen(!carreraOpen)}
                className="w-full flex items-center justify-between pl-10 pr-10 py-4 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/30 transition-all min-h-[44px]"
              >
                <span className={form.carrera ? 'text-gray-700' : 'text-gray-400'}>
                  {form.carrera || 'Selecciona tu carrera'}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${carreraOpen ? 'rotate-180' : ''}`} />
              </button>
              {carreraOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-xl max-h-60 overflow-y-auto border border-gray-100">
                  {facultades.map((facultad) => (
                    <div key={facultad.label}>
                      <div className="font-bold text-sm text-gray-500 px-4 py-2 bg-gray-50 sticky top-0">{facultad.label}</div>
                      {facultad.carreras.map((carrera) => (
                        <div
                          key={carrera}
                          onClick={() => handleCarreraSelect(carrera)}
                          className={`px-4 py-2 cursor-pointer text-sm transition-colors hover:bg-[#0f2a5c] hover:text-white ${
                            form.carrera === carrera ? 'bg-[#0f2a5c]/10 text-[#0f2a5c] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {carrera}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {fieldErrors.carrera && <p className="text-red-500 text-xs mt-1">{fieldErrors.carrera}</p>}
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
      className="w-full pl-10 pr-8 py-4 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] cursor-pointer min-h-[44px]"
      required
    >
      <option value="" disabled>Selecciona tu ciclo</option>
      {[...Array(10)].map((_, i) => (
        <option key={i + 1} value={i + 1}>{i + 1}° Ciclo</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    {fieldErrors.ciclo && <p className="text-red-500 text-xs mt-1">{fieldErrors.ciclo}</p>}
  </div>

  {/* PROMEDIO */}
  <div className="relative flex-1 w-full">
    <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input 
      type="number" 
      name="promedio"
      value={form.promedio}
      onChange={handlePromedioChange}
      step="0.1"
      min="0"
      max="20"
      placeholder="Promedio" 
      className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white font-medium focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] placeholder:text-gray-400 min-h-[44px]" 
      required
    />
    {promedioError && (
      <p className="text-red-500 text-xs mt-1">{promedioError}</p>
    )}
  </div>
  
</div>

            {/* Cursos - Selección múltiple con Tags */}
            <div className="relative w-full" ref={cursoRef}>
              <label className="block text-xs font-medium text-slate-600 mb-2">Cursos *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {cursosSeleccionados.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 bg-[#0f2a5c] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                    {c}
                    <button type="button" onClick={() => setCursosSeleccionados((prev) => prev.filter((x) => x !== c))} className="hover:text-red-300 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  value={cursoSearch}
                  onChange={(e) => { setCursoSearch(e.target.value); setCursoOpen(true) }}
                  onFocus={() => setCursoOpen(true)}
                  placeholder={cycleCourses.length ? (form.rol === 'mentor' ? "¿Qué cursos dominas para enseñar?" : "¿En qué curso necesitas ayuda?") : "Selecciona una carrera primero"}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                  disabled={!cycleCourses.length}
                />
                {cursoOpen && availableCourses.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-xl max-h-48 overflow-y-auto border border-gray-100">
                    {availableCourses.map((c) => (
                      <div
                        key={c}
                        onClick={() => { setCursosSeleccionados((prev) => [...prev, c]); setCursoSearch(''); setCursoOpen(false) }}
                        className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-[#0f2a5c] hover:text-white transition-colors"
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
                {cursoOpen && cursoSearch && availableCourses.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-xl border border-gray-100 px-4 py-3 text-sm text-gray-400">
                    Sin resultados
                  </div>
                )}
              </div>
              {fieldErrors.curso && <p className="text-red-500 text-xs mt-1">{fieldErrors.curso}</p>}
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center mb-4">
              <Turnstile
                key={captchaKey}
                siteKey="0x4AAAAAAD5N1f3IsK41YBT4"
                options={{ theme: 'light' }}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  setCaptchaVerified(true);
                  setCaptchaExpired(false);
                  setTimeout(() => setCaptchaExpired(true), 120000);
                }}
              />
            </div>
            {fieldErrors.captcha && <p className="text-red-500 text-xs mt-1 text-center">{fieldErrors.captcha}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!captchaVerified || captchaExpired || loading || !form.password || form.password.length < 8 || form.password !== form.confirmPassword || !emailValid}
              className="w-full bg-[#0f2a5c] text-white py-3 rounded-xl font-bold hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Creando cuenta...' : deleteMessage ? 'Registrar de nuevo' : 'Crear Cuenta'}
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

      </div>
    </motion.div>
      <HelpButton />
    </>
  )
}

export default RegisterPage
