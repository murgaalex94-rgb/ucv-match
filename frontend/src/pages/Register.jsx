import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, BookOpen, User, GraduationCap, IdCard } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    codigoEstudiante: '',
    email: '',
    password: '',
    confirmPassword: '',
    carrera: '',
    cicloActual: '',
    promedio: '',
    estiloAprendizaje: 'VISUAL',
    rolSeleccionado: 'JUNIOR'
  })
  const [errors, setErrors] = useState({})
  const [seniorEligible, setSeniorEligible] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const ciclo = parseInt(formData.cicloActual) || 0
    const promedio = parseFloat(formData.promedio) || 0

    if (ciclo >= 6 && promedio >= 3.5) {
      setSeniorEligible(true)
    } else {
      setSeniorEligible(false)
      if (formData.rolSeleccionado === 'SENIOR') {
        setFormData(prev => ({ ...prev, rolSeleccionado: 'JUNIOR' }))
      }
    }
  }, [formData.cicloActual, formData.promedio])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre) newErrors.nombre = 'El nombre es obligatorio'
    if (!formData.codigoEstudiante) newErrors.codigoEstudiante = 'El código de estudiante es obligatorio'
    if (!formData.email) newErrors.email = 'El email es obligatorio'
    if (!/^[^\s@]+@universidad\.edu$/.test(formData.email)) {
      newErrors.email = 'El email debe ser institucional (@universidad.edu)'
    }
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria'
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (!formData.carrera) newErrors.carrera = 'La carrera es obligatoria'
    if (!formData.cicloActual || formData.cicloActual < 1 || formData.cicloActual > 10) {
      newErrors.cicloActual = 'El ciclo debe estar entre 1 y 10'
    }
    if (!formData.promedio || formData.promedio < 0 || formData.promedio > 5) {
      newErrors.promedio = 'El promedio debe estar entre 0 y 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    const dataToSubmit = {
      nombre: formData.nombre,
      codigoEstudiante: formData.codigoEstudiante,
      email: formData.email,
      password: formData.password,
      carrera: formData.carrera,
      cicloActual: parseInt(formData.cicloActual),
      promedio: parseFloat(formData.promedio),
      estiloAprendizaje: formData.estiloAprendizaje,
      postularSenior: formData.rolSeleccionado === 'SENIOR'
    }

    const result = await register(dataToSubmit)

    if (result.success) {
      navigate('/login', { state: { message: result.message } })
    } else {
      setErrors({ general: result.error })
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRoleSelect = (rol) => {
    if (rol === 'SENIOR' && !seniorEligible) return
    setFormData(prev => ({ ...prev, rolSeleccionado: rol }))
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
            UCV Match
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
        <div className="w-full max-w-lg">
          <div className="md:hidden flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-red-800 text-white text-lg font-bold px-5 py-2.5 rounded-lg">
              <GraduationCap className="w-6 h-6" />
              UCV Match
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Crear Cuenta</h2>
          <p className="text-slate-500 mb-6">Regístrate como estudiante</p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.nombre ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Código de Estudiante *
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="codigoEstudiante"
                    value={formData.codigoEstudiante}
                    onChange={handleChange}
                    placeholder="7007778888"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.codigoEstudiante ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.codigoEstudiante && <p className="text-red-500 text-xs mt-1">{errors.codigoEstudiante}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@universidad.edu"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.password ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Carrera
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleChange}
                    placeholder="Ingeniería de Sistemas"
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.carrera ? 'border-red-500' : 'border-slate-300'}`}
                    required
                  />
                </div>
                {errors.carrera && <p className="text-red-500 text-xs mt-1">{errors.carrera}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Ciclo actual (1-10)
                </label>
                <input
                  type="number"
                  name="cicloActual"
                  value={formData.cicloActual}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  placeholder="6"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.cicloActual ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                {errors.cicloActual && <p className="text-red-500 text-xs mt-1">{errors.cicloActual}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Promedio (0-5)
                </label>
                <input
                  type="number"
                  name="promedio"
                  value={formData.promedio}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="3.5"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm ${errors.promedio ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                {errors.promedio && <p className="text-red-500 text-xs mt-1">{errors.promedio}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Estilo de aprendizaje
              </label>
              <select
                name="estiloAprendizaje"
                value={formData.estiloAprendizaje}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-400"
              >
                <option value="" disabled>Selecciona un estilo</option>
                <option value="VISUAL">Visual</option>
                <option value="AUDITIVO">Auditivo</option>
                <option value="KINESTESICO">Kinestésico</option>
                <option value="LECTO_ESCRITURA">Lecto-escritura</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de registro
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('JUNIOR')}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    formData.rolSeleccionado === 'JUNIOR'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Junior
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('SENIOR')}
                  disabled={!seniorEligible}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    !seniorEligible
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : formData.rolSeleccionado === 'SENIOR'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Senior
                </button>
              </div>
              {formData.rolSeleccionado === 'SENIOR' && (
                <p className="text-xs text-amber-600 mt-2">
                  Tu solicitud quedará pendiente de validación por un administrador.
                </p>
              )}
              {!seniorEligible && parseInt(formData.cicloActual || 0) >= 1 && (
                <p className="text-xs text-slate-500 mt-2">
                  Se requiere ciclo ≥ 6 y promedio ≥ 3.5 para postular como Senior.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-medium"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
