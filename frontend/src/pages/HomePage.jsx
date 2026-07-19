import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap, ArrowRight, Users, BookOpen, Award } from 'lucide-react'

const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // If user is logged in, App.jsx will render Dashboard at /
  // so no redirect needed here

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="bg-[#003366] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-white" />
            <span className="font-bold text-xl text-white">UCV Match</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-medium text-white border border-white rounded-lg hover:bg-white/10 transition-colors">
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/register')}
              className="px-5 py-2 text-sm font-medium text-[#003366] bg-white rounded-lg hover:bg-white/90 transition-colors">
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#003366] mb-4">
            Conecta. Aprende. Haz Match.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            UCV Match es la plataforma que conecta estudiantes de todas las carreras con mentores académicos para compartir conocimiento y potenciar su desarrollo universitario.
          </p>
          <button onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#b6171e] text-white font-semibold rounded-lg hover:bg-[#b6171e]/90 transition-colors text-lg">
            Comenzar ahora <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: Users, title: 'Mentoría entre estudiantes', desc: 'Estudiantes avanzados guían a quienes inician su camino en cualquier carrera universitaria.' },
            { icon: BookOpen, title: 'Recursos académicos', desc: 'Accede a materiales, guías y sesiones organizadas por materia.' },
            { icon: Award, title: 'Reconocimiento', desc: 'Gana logros y construye tu historial de mentoría.' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-4">
                <item.icon className="w-7 h-7 text-[#003366]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        &copy; 2026 UCV Match. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default HomePage
