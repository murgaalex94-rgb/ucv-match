import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search,
  TrendingUp,
  BookOpen, Users, Calendar, MessageSquare, School,
  LayoutDashboard, Settings
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [mentoriasActivas, setMentoriasActivas] = useState(0);
  const [mentoresDisponibles, setMentoresDisponibles] = useState(0);
  const [proximasMentorias, setProximasMentorias] = useState([]);
  const [mentoresRecomendados, setMentoresRecomendados] = useState([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          let perfil = null;
          for (let i = 0; i < 5; i++) {
            const { data, error } = await supabase.from('profiles').select('nombre_completo').eq('id', user.id).single();
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching profile:', error.message);
              break;
            }
            if (data) {
              perfil = data;
              break;
            }
            await new Promise(r => setTimeout(r, 600));
          }
          setLoadingProfile(false);

          if (perfil) {
            setNombreUsuario(perfil.nombre_completo);
          } else if (user.user_metadata?.nombre_completo) {
            setNombreUsuario(user.user_metadata.nombre_completo);
          }

          const { count: activas } = await supabase.from('mentorias').select('*', { count: 'exact', head: true }).eq('estudiante_id', user.id).eq('estado', 'Activa');
          setMentoriasActivas(activas || 0);

          const { count: mentores } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'Mentor');
          setMentoresDisponibles(mentores || 0);

          const { data: mentoriasData } = await supabase.from('mentorias').select('*, mentor:profiles!mentor_id(nombre_completo)').eq('estudiante_id', user.id).in('estado', ['Pendiente', 'Activa']).limit(2);
          if (mentoriasData) setProximasMentorias(mentoriasData);

          const { data: mentoresData } = await supabase.from('profiles').select('*').eq('rol', 'Mentor').limit(3);
          if (mentoresData) setMentoresRecomendados(mentoresData);

          const { count: noLeidas } = await supabase
            .from('notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', user.id)
            .eq('leido', false);
          setNotificacionesNoLeidas(noLeidas || 0);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
      setLoading(false);
    };
    getData();
  }, []);

  const initials = nombreUsuario?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AM';
  const userName = nombreUsuario?.split(' ')[0] || 'Usuario';
  const now = new Date();
  const saludo = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">{saludo}, {userName}<span className="text-3xl">👋</span></h1>
            <p className="text-gray-500 text-sm mt-2">Descubre mentores, potencia tu aprendizaje y haz match con la comunidad UCV.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar mentores, temas..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
            </div>
            <Header notificacionesNoLeidas={notificacionesNoLeidas} nombreUsuario={nombreUsuario} initials={initials} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#0f2a5c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {[
                { title: 'Mentorías Activas', value: mentoriasActivas.toString(), change: 'Consultado en tiempo real', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'Mentores Disponibles', value: mentoresDisponibles.toString(), change: 'En la plataforma', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: idx * 0.2 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-1/3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-xs font-medium mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                      {card.change && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {card.change}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${card.bg}`}>
                      <card.icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h3 className="font-medium text-gray-800 mb-4">Accesos rápidos</h3>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="grid grid-cols-2 md:grid-cols-5 gap-3"
              >
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard', color: 'text-blue-600' },
                  { icon: Users, label: 'Mentores', route: '/mentores', color: 'text-green-600' },
                  { icon: Calendar, label: 'Mentorías', route: '/mentorias', color: 'text-orange-500' },
                  { icon: MessageSquare, label: 'Mensajes', badge: 1, route: '/mensajes', color: 'text-purple-600' },
                  { icon: Settings, label: 'Configuración', route: '/configuracion', color: 'text-gray-600' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(item.route)}
                    className="relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                    <div className={`mb-2 ${item.color}`}><item.icon className="w-6 h-6" /></div>
                    <span className="text-xs text-gray-600 text-center font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Próximas mentorías</h3>
                  <button onClick={() => navigate('/mentorias')} className="text-xs text-[#0f2a5c] font-semibold hover:underline">Ver todas</button>
                </div>
                {proximasMentorias.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tienes mentorías pendientes.</p>
                ) : (
                  <div className="space-y-3">
                    {proximasMentorias.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-[#0f2a5c]" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.mentor?.nombre_completo || 'Mentor'}</p>
                          <p className="text-xs text-gray-400">{m.materia || 'Mentoría'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Mentores recomendados</h3>
                  <button onClick={() => navigate('/mentores')} className="text-xs text-[#0f2a5c] font-semibold hover:underline">Ver todos</button>
                </div>
                {mentoresRecomendados.length === 0 ? (
                  <p className="text-gray-400 text-sm">No hay mentores disponibles.</p>
                ) : (
                  <div className="space-y-3">
                    {mentoresRecomendados.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {m.nombre_completo?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{m.nombre_completo || 'Mentor'}</p>
                          <p className="text-xs text-gray-400">{m.carrera || 'Sin carrera'} {m.promedio ? `· Prom. ${m.promedio}` : ''}</p>
                        </div>
                        <button onClick={() => navigate('/mentores')} className="ml-auto text-xs bg-[#0f2a5c] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#0f2a5c]/90 transition-colors">Ver</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}