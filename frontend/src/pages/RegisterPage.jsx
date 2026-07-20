import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, CreditCard, Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, Calendar, BarChart3, Lightbulb, ChevronDown, Search, X } from 'lucide-react'
import HelpButton from '../components/HelpButton'
import { supabase } from '../lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'

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

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    try {
      const verifyRes = await fetch('/api/cf-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyData.success) {
        throw new Error(verifyData.message || 'Error de verificación')
      }

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailConfirm: true,
          captchaToken,
          data: {
            nombre_completo: (form.nombres + ' ' + form.apellidos).trim(),
            codigo_estudiante: form.codigoEstudiante,
            rol: form.rol.charAt(0).toUpperCase() + form.rol.slice(1),
            carrera: form.carrera,
            ciclo: parseInt(form.ciclo),
            promedio: parseFloat(form.promedio),
            cursos: cursosSeleccionados
          }
        }
      })

      if (error) throw error

      await supabase.auth.signOut()
      navigate('/login', { state: { message: 'Revisa tu correo electrónico para confirmar tu cuenta.' } })
    } catch (error) {
      console.error('Error en registro:', error.message)
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error) || 'Error al registrar usuario'
      setError(errorMessage)
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

  // Datos extraídos de las mallas curriculares oficiales UCV Chimbote (PDFs)
  const mallasCurriculares = {
    "Administración de Empresas": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Administración", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Costos y Presupuestos", "Cátedra Vallejo", "Economía", "Inglés II"],
      3: ["Creatividad e Innovación", "Gestión del Talento Humano", "Diseño Organizacional", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Matemática para las Finanzas", "Derecho Empresarial y Comercial", "Inteligencia de Mercados", "Inglés IV"],
      5: ["Estadística Aplicada a los Negocios", "Constitución y Derechos Humanos", "Marketing", "Contabilidad Financiera", "Inglés V"],
      6: ["Administración Financiera", "Marketing Estratégico", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Gerencia y Prospectiva Estratégica", "Finanzas para los Negocios", "Marketing Internacional", "Filosofía y Ética", "Inglés VII"],
      8: ["Desarrollo de Competencias Gerenciales", "Simuladores de Negocio", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Administración y Negocios Internacionales": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de Administración y Negocios Internacionales", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Comercio Internacional", "Cátedra Vallejo", "Economía", "Inglés II"],
      3: ["Creatividad e Innovación", "Legislación y Operatividad Aduanera", "Merceología, Nomenclatura y Clasificación Arancelaria", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Marketing", "Derecho de los Negocios Internacionales", "Matemática para las Finanzas", "Inglés IV"],
      5: ["Business Analytics", "Contabilidad y Finanzas", "International Market Research", "Constitución y Derechos Humanos", "Inglés V"],
      6: ["Costos y Cotizaciones Internacionales", "Gestión Financiera Internacional", "Inteligencia Artificial y Aprendizaje Automático", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Gestión de la Cadena de Suministro Internacional", "International Marketing", "International Sales Management", "Filosofía y Ética", "Inglés VII"],
      8: ["Gestión del Talento Humano", "International Business Plan", "Experiencia Curricular", "Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Arquitectura": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos en Arquitectura", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Historia y Teoría de la Arquitectura", "Cátedra Vallejo", "Expresión Gráfica", "Inglés II"],
      3: ["Creatividad e Innovación", "Dibujo Arquitectónico", "Topografía", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "El Hombre y su Contexto", "Modelamiento BIM en Edificaciones", "Orientación Estructural", "Inglés IV"],
      5: ["Arquitectura y Habilitación Urbana", "Accesibilidad y Diseño Universal", "Construcción I", "Constitución y Derechos Humanos", "Inglés V"],
      6: ["Arquitectura y Equipamiento Metropolitano", "Tecnología Ambiental I", "Acondicionamiento Territorial", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Ciudad y Patrimonio Histórico", "Construcción II", "Planificación Urbana, Desarrollo Territorial y Rural", "Filosofía y Ética", "Inglés VII"],
      8: ["Arquitectura e Intervención Urbana", "Tecnología Ambiental II", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Arte & Diseño Gráfico Empresarial": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos del Arte & Diseño", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Tecnologías Emergentes y sus Aplicaciones", "Taller de Formas y Expresión", "Inglés II"],
      3: ["Inclusión y Accesibilidad", "Creatividad e Innovación", "Maquetación de Medios", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Teoría del Color", "Diseño Creativo", "Expresiones Artísticas y sus Contextos", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Estudio Tipográfico", "Creación Gráfica Digital", "Semiótica Visual", "Inglés V"],
      6: ["Gestión de Identidad Corporativa", "Diseño Web", "Fotografía Socioeditorial", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Animación Digital", "Emprendimiento y Gestión en Diseño", "Campaña Gráfica Publicitaria", "Inglés VII"],
      8: ["Diseño Multicanal", "Gestión de Proyectos", "Modelado Tridimensional", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Ciencias de la Comunicación": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Comunicación", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Tecnologías Emergentes y sus Aplicaciones", "Cátedra Vallejo", "Comunicación, Sociedad y Cultura", "Inglés II"],
      3: ["Inclusión y Accesibilidad", "Creatividad e Innovación", "Comunicación Corporativa", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Semiótica", "Sociología de la Comunicación", "Lenguaje Audiovisual y Cinematográfico", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Periodismo Multimedial", "Diseño y Producción Publicitaria", "Fotografía", "Inglés V"],
      6: ["Taller de Guion Audiovisual", "Planeación Estratégica de la Comunicación Organizacional", "Comunicación para el Cambio Social", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Diseño y Desarrollo de Proyectos de Comunicación para el Cambio Social", "Responsabilidad Social Corporativa", "Taller de Edición y Montaje", "Inglés VII"],
      8: ["Comunicación Digital y Gestión de Redes Sociales", "Producción Audiovisual Digital", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Ciencias del Deporte": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Ciencia del Rendimiento Humano", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Tecnologías Emergentes y sus Aplicaciones", "Cátedra Vallejo", "Administración Deportiva", "Inglés II"],
      3: ["Morfología Funcional Deportiva", "Creatividad e Innovación", "Teoría y Metodología del Entrenamiento", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Actividad Física Adaptada", "Deportes de Conjunto I", "Entrenamiento Deportivo", "Inglés IV"],
      5: ["Bioquímica del Deporte y la Actividad Física", "Constitución y Derechos Humanos", "Evaluación del Entrenamiento y Tecnología Aplicada", "Biomecánica y Cineantropometría", "Inglés V"],
      6: ["Fisiología del Esfuerzo Físico", "Preparación Física", "Deportes de Conjunto II", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Medicina Deportiva", "Nutrición Aplicada al Deporte", "Pesas Olímpicas", "Inglés VII"],
      8: ["Tenis de Mesa", "Psicología Deportiva", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Contabilidad": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de Contabilidad", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Economía", "Contabilidad Empresarial", "Inglés II"],
      3: ["Creatividad e Innovación", "Administración", "Comercio Internacional", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Tributación", "Contabilidad Gubernamental", "Matemática para las Finanzas", "Inglés IV"],
      5: ["Normas Contables", "Tributación Aplicada", "Constitución y Derechos Humanos", "Costos y Presupuestos", "Inglés V"],
      6: ["Control Interno", "Planeamiento Tributario", "Costos Industriales", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Auditoría Financiera", "Finanzas", "Análisis e Interpretación de Estados Financieros", "Filosofía y Ética", "Inglés VII"],
      8: ["Auditoría Integral", "Tendencias en Contabilidad", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Derecho": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos del Derecho y Sistema Jurídico", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Teoría General del Derecho", "Cátedra Vallejo", "Tecnologías Emergentes y sus Aplicaciones", "Inglés II"],
      3: ["Derecho Internacional Público", "Derecho Procesal Constitucional", "Derecho de Familia y Sucesiones", "Derecho Laboral", "Inglés IX"],
      4: ["Creatividad e Innovación", "Derecho Constitucional y Ciencia Política", "Inclusión y Accesibilidad", "Estadística y Análisis de Datos", "Inglés III"],
      5: ["Metodología de la Investigación Científica", "Derecho de Personas", "Derecho Administrativo", "Mecanismos Alternativos de Resolución de Conflictos", "Inglés IV"],
      6: ["Derecho Internacional Privado", "Argumentación Jurídica y Destrezas Legales", "Derecho Procesal Laboral", "Práctica Preliminar", "Inglés X"],
      7: ["Derecho Penal I", "Constitución y Derechos Humanos", "Acto Jurídico", "Derecho del Proceso Administrativo y Contencioso", "Inglés V"],
      8: ["Derecho Penal II", "Derechos Reales", "Derecho Tributario", "Experiencia Curricular Electiva", "Inglés VI"],
      9: ["Filosofía y Ética", "Derecho Procesal Penal", "Derecho de los Contratos y Obligaciones", "Derecho Corporativo I", "Inglés VII"],
      10: ["Derecho Procesal Civil", "Derecho Corporativo II", "Experiencia Curricular", "Electiva", "Gestión de Proyectos", "Inglés VIII"],
    },
    "Educación Inicial": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Educación Inicial", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Tecnologías Emergentes y sus Aplicaciones", "Teorías de la Educación", "Inglés II"],
      3: ["Inclusión y Accesibilidad", "Creatividad e Innovación", "Desarrollo de la Conciencia Fonológica", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Desarrollo Psicológico y del Aprendizaje", "Neurodidáctica", "Enfoques Didácticos para la Enseñanza", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Planificación Curricular", "Educación Inclusiva e Interculturalidad", "Transformación Digital", "Inglés V"],
      6: ["Educación y Atención Temprana", "Psicomotricidad para el Desarrollo del Niño", "Laboratorio del Pensamiento Científico en la Infancia", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Personal Social y Expresión Corporal", "Filosofía y Ética", "Didáctica de la Comunicación", "Gestión e Innovación en Instituciones Educativas", "Inglés VII"],
      8: ["Acompañamiento Pedagógico en Cunas", "Gestión de Proyectos", "Evaluación Educativa, Planes de Monitoreo y Asesoría en el Aula", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Educación en Idiomas - Inglés": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Educación del Idioma Inglés", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Tecnologías Emergentes y sus Aplicaciones", "Cátedra Vallejo", "Fonética y Fonología del Idioma Inglés", "Inglés II"],
      3: ["Creatividad e Innovación", "Inclusión y Accesibilidad", "Gramática del Idioma Inglés", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Pedagogía de la Diversidad y Neurodivergencia", "Pedagogy for Teaching English Language", "Written Comprehension in English - Reading", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Oral Comprehension in English - Listening", "Gestión Curricular y Pedagógica para la Enseñanza del Inglés en Inicial y Primaria", "Producción de Materiales y Recursos para la Enseñanza del Inglés", "Inglés V"],
      6: ["Gestión Curricular y Pedagógica para la Enseñanza del Inglés en Secundaria", "Projects in the Classroom", "Written Production in English - Writing", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Didáctica de la Evaluación para el Aprendizaje del Inglés I", "Gestión Curricular y Pedagógica para la Enseñanza del Inglés en Adultos", "Gestión de Centros Formativos en Idiomas Extranjeros", "Filosofía y Ética", "Inglés VII"],
      8: ["Didáctica de la Evaluación para el Aprendizaje del Inglés II", "Oral Production in English - Speaking", "Gestión de Proyectos", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Enfermería": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Enfermería", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Biología Celular y Molecular", "Salud Pública", "Inglés II"],
      3: ["Creatividad e Innovación", "Nutrición", "Morfofisiología", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Microbiología y Parasitología", "Epidemiología", "Cuidado de Enfermería Básica", "Inglés IV"],
      5: ["Cuidado de Enfermería en Salud Mental y Psiquiatría", "Farmacología", "Cuidado de Enfermería en Salud del Adulto I", "Constitución y Derechos Humanos", "Inglés V"],
      6: ["Cuidado de Enfermería en Salud del Adulto II", "Cuidados Paliativos y Alternativos", "Cuidado de Enfermería en Salud de la Mujer y Recién Nacido", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Cuidado de Enfermería en Salud del Niño y Adolescente I", "Cuidado de Enfermería en Salud Familiar y Comunitaria", "Gestión en Servicios de Salud", "Filosofía y Ética", "Inglés VII"],
      8: ["Cuidado de Enfermería en Salud del Niño y Adolescente II", "Enfermería en Emergencias y Desastres", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Internado I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Internado II", "Inglés X"],
    },
    "Ingeniería Ambiental": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos en Ingeniería Ambiental", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Química Orgánica e Inorgánica", "Cátedra Vallejo", "Expresión Gráfica", "Inglés II"],
      3: ["Creatividad e Innovación", "Biología y Ecología", "Matemática para la Ingeniería", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Física General", "Cálculo Integral y Ecuaciones Diferenciales", "Química Analítica y Ambiental", "Inglés IV"],
      5: ["Gestión y Tratamiento de Suelos", "Constitución y Derechos Humanos", "Gestión de Riesgos Ambientales y Desastres", "Accesibilidad y Diseño Universal", "Inglés V"],
      6: ["Gestión y Tratamiento de la Contaminación Atmosférica", "Gestión y Tratamiento de Aguas", "Sistema de Gestión Integrado y Política Ambiental", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Evaluación de Impacto Ambiental", "Gestión y Tratamiento de los Residuos Sólidos", "Monitoreo Ambiental y Resolución de Conflicto", "Inglés VII"],
      8: ["Biotecnología y Remediación Ambiental", "Cartografía y Aplicaciones Geoespacial", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Ingeniería Civil": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos en Ingeniería Civil", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Tecnología del Concreto y Materiales", "Cátedra Vallejo", "Expresión Gráfica", "Inglés II"],
      3: ["Creatividad e Innovación", "Topografía y Geodesia", "Matemática para la Ingeniería", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Cálculo Integral y Ecuaciones Diferenciales", "Física General", "Mecánica de Suelos", "Inglés IV"],
      5: ["Accesibilidad y Diseño Universal", "Mecánica Estructural", "Caminos y Pavimentos", "Constitución y Derechos Humanos", "Inglés V"],
      6: ["Mecánica de Fluidos e Hidráulica", "Análisis Estructural", "Ingeniería de Transportes y Diseño Vial", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Ingeniería Sanitaria", "Ingeniería de la Construcción", "Diseño de Concreto Armado", "Filosofía y Ética", "Inglés VII"],
      8: ["Ingeniería de Obras Hidráulicas", "BIM Aplicado a Obras Civiles", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Ingeniería Industrial": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos en Ingeniería Industrial", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Química General", "Cátedra Vallejo", "Expresión Gráfica", "Inglés II"],
      3: ["Creatividad e Innovación", "Economía y Finanzas", "Matemática para la Ingeniería", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Cálculo Integral y Ecuaciones Diferenciales", "Física General", "Contabilidad Gerencial y Costos", "Inglés IV"],
      5: ["Accesibilidad y Diseño Universal", "Estudio del Trabajo", "Investigación de Operaciones", "Constitución y Derechos Humanos", "Inglés V"],
      6: ["Simulación e Inteligencia de Datos", "Tecnología y Sistemas de Producción", "Ergonomía, Seguridad y Salud Ocupacional", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Dirección Táctica de Operaciones", "Logística Integrada y Cadena de Suministro", "Filosofía y Ética", "Inglés VII"],
      8: ["Dirección Estratégica de Operaciones", "Sistemas Integrados de Gestión", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Prácticas Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Prácticas Preprofesional II", "Inglés X"],
    },
    "Ingeniería de Sistemas": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos en Ingeniería de Sistemas", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Algoritmos y Programación", "Cátedra Vallejo", "Expresión Gráfica", "Inglés II"],
      3: ["Creatividad e Innovación", "Fundamentos de Modelado y Animación", "Matemática para la Ingeniería", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Cálculo Integral y Ecuaciones Diferenciales", "Física General", "Programación Orientada a Objetos", "Inglés IV"],
      5: ["Accesibilidad y Diseño Universal", "Constitución y Derechos Humanos", "Gestión de Datos e Información", "Redes Inalámbricas y Telefonía IP", "Inglés V"],
      6: ["Ingeniería de Software", "Administración de Servidores Multiplataforma", "Inteligencia de Negocios", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Machine Learning", "Ciberseguridad", "Tecnología Web y Cloud Computing", "Inglés VII"],
      8: ["Patrones de Diseño de Realidad Virtual", "Programación de Aplicaciones Móviles", "Experiencia Curricular Electiva", "Gestión de Proyectos", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Práctica Preprofesional I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Práctica Preprofesional II", "Inglés X"],
    },
    "Psicología": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Psicología", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Salud Pública", "Bases Biológicas del Comportamiento", "Inglés II"],
      3: ["Creatividad e Innovación", "Psicología de las Organizaciones", "Psicología del Desarrollo", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Epidemiología", "Psicología Educativa", "Técnicas de la Entrevista y la Observación Psicológica", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Técnicas Proyectivas", "Neuropsicología", "Psicología Clínica", "Inglés V"],
      6: ["Programas de Promoción, Prevención e Intervención en Psicología", "Pruebas Psicométricas para Niños", "Psicopatología", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Pruebas Psicométricas para Adultos", "Diagnóstico e Informe Psicológico", "Filosofía y Ética", "Psicología Experimental", "Inglés VII"],
      8: ["Gestión de Proyectos", "Prácticas Departamentales I", "Psicoterapia Individual", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Psicoterapia de Grupo y de Familia", "Psicometría", "Evaluación y Selección de Personas", "Prácticas Departamentales II", "Inglés IX"],
      10: ["Trabajo de Investigación I", "Internado I", "Inglés X"],
    },
    "Tecnología Médica en Laboratorio Clínico y Anatomía Patológica": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de Laboratorio Clínico", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Salud Pública", "Química Inorgánica y Orgánica", "Inglés II"],
      3: ["Creatividad e Innovación", "Biología Celular", "Morfofisiología", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Bioquímica y Biología Molecular", "Histología y Embriología", "Epidemiología", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Hematología y Hemostasia", "Bioquímica Clínica", "Citogenética Humana", "Inglés V"],
      6: ["Inmunología", "Bacteriología y Virología", "Experiencia Curricular Electiva", "Laboratorio Clínico", "Inglés VI"],
      7: ["Filosofía y Ética", "Micología y Parasitología", "Técnicas en Anatomía Patológica", "Farmacología y Toxicología", "Inglés VII"],
      8: ["Hematología Clínica y Medicina Transfusional", "Citopatología", "Gestión de Proyectos", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Internado I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Internado II", "Inglés X"],
    },
    "Tecnología Médica en Terapia Física y Rehabilitación": {
      1: ["Pensamiento Lógico", "Habilidades Comunicativas", "Objetivos de Desarrollo Sostenible", "Fundamentos de la Terapia Física y Rehabilitación", "Inglés I"],
      2: ["Cambio Climático y Gestión de Riesgos", "Cátedra Vallejo", "Salud Pública", "Biología Celular y Molecular", "Inglés II"],
      3: ["Creatividad e Innovación", "Química y Principios de Bioquímica", "Biofísica", "Estadística y Análisis de Datos", "Inglés III"],
      4: ["Metodología de la Investigación Científica", "Epidemiología", "Morfofisiología", "Biomecánica", "Inglés IV"],
      5: ["Constitución y Derechos Humanos", "Fisiopatología", "Desarrollo Psicomotor", "Fisioterapia Musculoesquelética I", "Inglés V"],
      6: ["Fisioterapia en Salud Mental y Discapacidad", "Semiología Fisioterapéutica", "Fisioterapia Musculoesquelética lI", "Experiencia Curricular Electiva", "Inglés VI"],
      7: ["Filosofía y Ética", "Fisioterapia en Pediatría", "Fisioterapia Cardiorespiratoria", "Fisioterapia en Neurología y Adulto Mayor", "Inglés VII"],
      8: ["Fisiología del Ejercicio y Fisioterapia en Deportes", "Gestión de los Servicios de Terapia Física y Rehabilitación", "Gestión de Proyectos", "Experiencia Curricular Electiva", "Inglés VIII"],
      9: ["Trabajo de Investigación I", "Internado I", "Inglés IX"],
      10: ["Trabajo de Investigación II", "Internado II", "Inglés X"],
    },
  }

  const cycleCourses = mallasCurriculares[form.carrera]?.[form.ciclo] || []
  const availableCourses = cycleCourses.filter(
    (c) => !cursosSeleccionados.includes(c) && c.toLowerCase().includes(cursoSearch.toLowerCase())
  )

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex w-full min-h-screen bg-white overflow-y-auto font-sans">

      {/* COLUMNA IZQUIERDA - IMAGEN ÚNICA */}
      <div className="hidden md:flex md:w-1/2 min-h-screen relative bg-[#0f2a5c] overflow-hidden">
        <img 
          src="/hero_panel_ucv.png" 
          alt="Panel UCV Match" 
          className="w-full h-full object-cover object-bottom" 
        />
      </div>

      {/* COLUMNA DERECHA - FORMULARIO */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white pt-20 pb-8 px-8 relative min-h-screen overflow-y-auto">
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

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  placeholder="Nombres"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
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
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
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
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
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
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
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
              {fieldErrors.rol && <p className="text-red-500 text-xs mt-1">{fieldErrors.rol}</p>}
            </div>

            {/* Carrera - Dropdown personalizado */}
            <div className="relative w-full" ref={carreraRef}>
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <button
                type="button"
                onClick={() => setCarreraOpen(!carreraOpen)}
                className="w-full flex items-center justify-between pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/30 transition-all"
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
      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] cursor-pointer h-[44px]"
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
      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white font-medium focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c] placeholder:text-gray-400 h-[44px]" 
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
                  placeholder={cycleCourses.length ? "Busca y selecciona tus cursos..." : "Selecciona carrera y ciclo primero"}
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
                siteKey="0x4AAAAAAD5N1f3IsK41YBT4"
                options={{ theme: 'light' }}
                onSuccess={(token) => { setCaptchaToken(token); setCaptchaVerified(true) }}
              />
            </div>
            {fieldErrors.captcha && <p className="text-red-500 text-xs mt-1 text-center">{fieldErrors.captcha}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!captchaVerified || loading || !form.password || form.password.length < 6 || form.password !== form.confirmPassword}
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

      </div>
    </motion.div>
      <HelpButton />
    </>
  )
}

export default RegisterPage