import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Check,
  TrendingUp,
  BookOpen, Users, Calendar, MessageSquare, School,
  LayoutDashboard, Settings, ClipboardList, Star, LogOut
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { StreamChat } from 'stream-chat';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [userRol, setUserRol] = useState('');
  const [mentoriasActivas, setMentoriasActivas] = useState(0);
  const [mentoriasCompletadas, setMentoriasCompletadas] = useState(0);
  const [mentoresDisponibles, setMentoresDisponibles] = useState(0);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);
  const [proximasMentorias, setProximasMentorias] = useState([]);
  const [mentoresRecomendados, setMentoresRecomendados] = useState([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [estudiantesEsteMes, setEstudiantesEsteMes] = useState(0);
  const [calificacionPromedio, setCalificacionPromedio] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMentorName, setSuccessMentorName] = useState('');
  const [showSolicitudesModal, setShowSolicitudesModal] = useState(false);
  const [solicitudesList, setSolicitudesList] = useState([]);

  const handleQuickSolicitarMentor = async (mentor) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || !mentor) return;

      const { data: profile } = await supabase.from('profiles').select('nombre_completo').eq('id', authUser.id).maybeSingle();
      const studentName = profile?.nombre_completo || authUser.user_metadata?.nombre_completo || authUser.email?.split('@')[0] || 'Estudiante';
      const materia = mentor.carrera || 'General';

      await supabase.from('mentorias').insert({
        estudiante_id: authUser.id,
        mentor_id: mentor.id,
        estado: 'Pendiente',
        materia,
        descripcion: 'Hola, he solicitado tu mentoría.'
      });

      const chatClient = new StreamChat(API_KEY);
      const sess = await supabase.auth.getSession();
      const accessToken = sess.data.session?.access_token;
      if (!accessToken) { navigate('/mentores'); return; }

      const response = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ userId: authUser.id })
      });
      if (!response.ok) { navigate('/mentores'); return; }
      const tokenData = await response.json();
      await chatClient.connectUser(
        { id: authUser.id, name: studentName },
        tokenData.token
      );

      const channelId = [authUser.id, mentor.id].sort().map(id => id.replace(/-/g, '').slice(0, 16)).join('-');
      const channel = chatClient.channel('messaging', channelId, {
        members: [authUser.id, mentor.id]
      });
      await channel.create();
      await channel.sendMessage({
        text: `Hola ${mentor.nombre_completo || 'Mentor'}, soy ${studentName}. ¿Podrías ayudarme con ${materia}?`
      });
      await chatClient.disconnectUser();
      navigate(`/mensajes?channel=${channelId}`);
    } catch (err) {
      console.error('Error:', err);
      navigate('/mentores');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dias[d.getDay()]} ${d.getDate()} - ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const location = useLocation();

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let perfil = null;
        for (let i = 0; i < 5; i++) {
          const { data, error } = await supabase.from('profiles').select('nombre_completo, rol').eq('id', user.id).maybeSingle();
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
          setUserRol(perfil.rol || '');
        } else if (user.user_metadata?.nombre_completo) {
          setNombreUsuario(user.user_metadata.nombre_completo);
          setUserRol(user.user_metadata?.rol || '');
        }

        const rol = perfil?.rol || user.user_metadata?.rol || '';

        if (rol === 'Mentor' || rol === 'SENIOR' || rol === 'DUAL') {
          setSolicitudesPendientes(0);
          setSolicitudesList([]);

          const { count: pendientes, error: pendError } = await supabase.from('mentorias').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id).eq('estado', 'Pendiente');
          console.log('[Dashboard] solicitudes pendientes count:', pendientes, 'error:', pendError);
          if (!pendError) {
            setSolicitudesPendientes(pendientes ?? 0);
            if (pendientes > 0) {
              const { data: solicitudes } = await supabase.from('mentorias').select('*, estudiante:profiles!estudiante_id(nombre_completo, avatar_url, carrera)').eq('mentor_id', user.id).eq('estado', 'Pendiente');
              setSolicitudesList(solicitudes || []);
            }
          }

          const { count: activas } = await supabase.from('mentorias').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id).eq('estado', 'Activa');
          setMentoriasActivas(activas || 0);

          const { count: completadas } = await supabase.from('mentorias').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id).eq('estado', 'Completada');
          setMentoriasCompletadas(completadas || 0);

          const { data: mentoriasData } = await supabase.from('mentorias').select('*, estudiante:profiles!estudiante_id(nombre_completo, avatar_url)').eq('mentor_id', user.id).eq('estado', 'Activa').limit(5);
          if (mentoriasData) setProximasMentorias(mentoriasData);

          // Estudiantes ayudados este mes
          const inicioMes = new Date();
          inicioMes.setDate(1);
          inicioMes.setHours(0, 0, 0, 0);
          const { count: estudiantes } = await supabase
            .from('mentorias')
            .select('id', { count: 'exact', head: true })
            .eq('mentor_id', user.id)
            .in('estado', ['Activa', 'Completada'])
            .gte('fecha_solicitud', inicioMes.toISOString());
          setEstudiantesEsteMes(estudiantes || 0);

          // Calificación promedio
          const { data: califs } = await supabase
            .from('calificaciones')
            .select('calificacion')
            .eq('mentor_id', user.id);
          if (califs && califs.length > 0) {
            const suma = califs.reduce((a, c) => a + c.calificacion, 0);
            setCalificacionPromedio((suma / califs.length).toFixed(1));
          }
        } else {
          console.log('User is not mentor. Role:', rol);
          setSolicitudesPendientes(0);
          setSolicitudesList([]);
          const { count: activas } = await supabase.from('mentorias').select('*', { count: 'exact', head: true }).eq('estudiante_id', user.id).eq('estado', 'Activa');
          setMentoriasActivas(activas || 0);

          const { count: completadas } = await supabase.from('mentorias').select('*', { count: 'exact', head: true }).eq('estudiante_id', user.id).eq('estado', 'Completada');
          setMentoriasCompletadas(completadas || 0);

          const { count: mentores } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'Mentor').eq('disponible', true);
          setMentoresDisponibles(mentores || 0);

          const { data: mentoriasData } = await supabase.from('mentorias').select('*, mentor:profiles!mentor_id(nombre_completo, avatar_url)').eq('estudiante_id', user.id).neq('mentor_id', user.id).in('estado', ['Pendiente', 'Activa']).limit(2);
          if (mentoriasData) setProximasMentorias(mentoriasData);

          const { data: mentoresData } = await supabase.from('profiles').select('*').eq('rol', 'Mentor').neq('id', user.id).limit(3);
          if (mentoresData) setMentoresRecomendados(mentoresData);
        }

        try {
          const { count: noLeidas } = await supabase
            .from('notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', user.id)
            .eq('leido', false);
          setNotificacionesNoLeidas(noLeidas || 0);
        } catch {
          setNotificacionesNoLeidas(0);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    setSolicitudesPendientes(0);
    setSolicitudesList([]);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    setSolicitudesPendientes(0);
    setSolicitudesList([]);
    if (location.pathname === '/dashboard') {
      fetchData();
    }
  }, [location.pathname, fetchData]);

  useEffect(() => {
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData]);

  const initials = nombreUsuario?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AM';
  const userName = nombreUsuario?.split(' ')[0] || 'Usuario';
  const now = new Date();
  const saludo = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';
  const esMentor = userRol === 'Mentor' || userRol === 'SENIOR' || userRol === 'DUAL';

  const quickAccessItems = esMentor
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard', color: 'text-blue-600' },
        { icon: ClipboardList, label: 'Ver Solicitudes Pendientes', badge: solicitudesPendientes > 0 ? solicitudesPendientes : null, action: () => { setShowSolicitudesModal(true); fetchData(); }, color: 'text-orange-500' },
        { icon: Calendar, label: 'Mis Mentorías', route: '/mentorias', color: 'text-green-600' },
        { icon: MessageSquare, label: 'Mensajes', route: '/mensajes', color: 'text-purple-600' },
        { icon: Settings, label: 'Configuración', route: '/configuracion', color: 'text-gray-600' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard', color: 'text-blue-600' },
        { icon: Users, label: 'Solicitar mentor', route: '/mentores', color: 'text-green-600' },
        { icon: Calendar, label: 'Historial de mentorías', route: '/mentorias', color: 'text-orange-500' },
        { icon: MessageSquare, label: 'Mensajes', route: '/mensajes', color: 'text-purple-600' },
        { icon: Settings, label: 'Configuración', route: '/configuracion', color: 'text-gray-600' },
      ];

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{saludo}, {userName} {esMentor ? '💡' : '🎯'}</h1>
            <p className="text-sm text-gray-500 mt-1">{esMentor ? 'Tus conocimientos pueden cambiar vidas. Revisa las solicitudes y comparte tu experiencia.' : 'Tu próximo mentor está a un clic. Explora, aprende y crece con la comunidad UCV.'}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={esMentor ? 'Buscar estudiantes, temas...' : 'Buscar mentores, temas...'} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
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
              {esMentor ? (
                <>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-1/3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">Solicitudes Pendientes</p>
                        <p className="text-2xl font-bold text-gray-800">{solicitudesPendientes}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Ver {solicitudesPendientes} solicitudes
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-50">
                        <ClipboardList className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-1/3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">Mentorías Activas</p>
                        <p className="text-2xl font-bold text-gray-800">{mentoriasActivas}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> En progreso
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-50">
                        <BookOpen className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-1/3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-xs font-medium mb-1">Mentorías Completadas</p>
                        <p className="text-2xl font-bold text-gray-800">{mentoriasCompletadas}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Completadas
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  {[
                    { title: 'Mentorías Activas', value: mentoriasActivas.toString(), change: 'Consultado en tiempo real', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Mentores activos', value: mentoresDisponibles.toString(), change: 'Disponibles ahora', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                    { title: 'Mentorías Completadas', value: mentoriasCompletadas.toString(), change: 'Historial', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                </>
              )}
            </div>

            {esMentor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-[#0f2a5c]" />
                    <span className="text-sm font-semibold text-gray-800">Estudiantes ayudados este mes</span>
                  </div>
                  {estudiantesEsteMes > 0 ? (
                    <>
                      <p className="text-3xl font-bold text-[#0f2a5c]">{estudiantesEsteMes}</p>
                      <p className="text-xs text-gray-400 mt-1">Has ayudado a {estudiantesEsteMes} estudiantes este mes</p>
                    </>
                  ) : (
                    <p className="text-base text-gray-400 mt-0.5">Aún no has ayudado a nadie</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-800">Calificación promedio</span>
                  </div>
                  {calificacionPromedio !== '0.0' ? (
                    <>
                      <p className="text-3xl font-bold text-[#0f2a5c]">{calificacionPromedio} <span className="text-lg text-yellow-500">⭐</span></p>
                      <p className="text-xs text-gray-400 mt-1">Basado en tus mentorías completadas</p>
                    </>
                  ) : (
                    <p className="text-base text-gray-400 mt-0.5">Sin calificaciones aún</p>
                  )}
                </div>
              </div>
            )}

            {/* PRÓXIMAS SESIONES - Mentor */}
            {esMentor && proximasMentorias.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Consultas activas</h3>
                  <button onClick={() => navigate('/mentorias')} className="text-xs text-[#0f2a5c] font-semibold hover:underline min-h-[44px]">Ver todas</button>
                </div>
                <div className="space-y-3">
                  {proximasMentorias.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-[#0f2a5c]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{m.estudiante?.nombre_completo || 'Estudiante'}</p>
                        <p className="text-xs text-gray-400">{formatDate(m.fecha_solicitud)}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Activa</span>
                      <button onClick={() => navigate('/mensajes')}
                        className="text-xs bg-[#0f2a5c] text-white px-2 py-1.5 min-h-[44px] rounded-lg font-medium hover:bg-[#0f2a5c]/90 transition-colors whitespace-nowrap flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Ir al chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <h3 className="font-medium text-gray-800 mb-4 text-base">Accesos rápidos</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {quickAccessItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.action ? item.action() : navigate(item.route)}
                    className="relative flex flex-col items-center justify-center min-h-[44px] p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 hover:shadow-md">
                    <div className={`mb-2 ${item.color}`}><item.icon className="w-6 h-6" /></div>
                    <span className="text-xs text-gray-600 text-center font-medium leading-tight">{item.label}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-8">
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800 text-base">{esMentor ? 'Mis Mentorías Activas' : 'Mis consultas activas'}</h3>
                  <button onClick={() => navigate('/mentorias')} className="text-xs text-[#0f2a5c] font-semibold hover:underline min-h-[44px]">Ver todas</button>
                </div>
                {proximasMentorias.length === 0 ? (
                  esMentor ? (
  <div>
    <p className="text-gray-400 text-sm">Aún no tienes sesiones activas. ¡Revisa tus solicitudes pendientes arriba para empezar!</p>
    <button onClick={() => navigate('/mentorias')} className="mt-3 text-sm text-blue-600 hover:underline min-h-[44px]">Ir a solicitudes pendientes →</button>
  </div>
) : (
  <p className="text-gray-400 text-sm">No tienes mentorías pendientes.</p>
)
                ) : (
                  <div className="space-y-3">
                    {proximasMentorias.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-[#0f2a5c]" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{esMentor ? (m.estudiante?.nombre_completo || 'Estudiante') : (m.mentor?.nombre_completo || 'Mentor')}</p>
                          {!esMentor && m.fecha_solicitud && (
                            <p className="text-xs text-gray-400">{formatDateShort(m.fecha_solicitud)}</p>
                          )}
                          <p className="text-xs text-gray-400">{m.materia || 'Mentoría'}</p>
                        </div>
                        <button onClick={() => navigate('/mensajes')}
                          className="text-xs bg-[#0f2a5c] text-white px-2 py-1.5 min-h-[44px] rounded-lg font-medium hover:bg-[#0f2a5c]/90 transition-colors whitespace-nowrap flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> Chatear
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!esMentor && (
              <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Mentores recomendados</h3>
                  <button onClick={() => navigate('/mentores')} className="text-xs text-[#0f2a5c] font-semibold hover:underline min-h-[44px]">Ver todos</button>
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
                        <button onClick={() => handleQuickSolicitarMentor(m)} className="ml-auto text-xs bg-[#0f2a5c] text-white px-3 py-1.5 min-h-[44px] rounded-lg font-medium hover:bg-[#0f2a5c]/90 transition-colors">Solicitar mentoría</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )}
            </div>

          </motion.div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSuccessModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">¡Solicitud enviada!</h3>
            <p className="text-sm text-gray-500 mt-2">Espera a que {successMentorName} confirme tu solicitud.</p>
            <button onClick={() => setShowSuccessModal(false)} className="mt-5 w-full bg-[#0f2a5c] text-white py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-[#0f2a5c]/90 transition-colors">
              Entendido
            </button>
          </div>
        </div>
      )}

      {showSolicitudesModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSolicitudesModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-[95%] max-w-md mx-auto max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Solicitudes Pendientes</h3>
              <button onClick={() => setShowSolicitudesModal(false)} className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {solicitudesList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes pendientes.</p>
            ) : (
              <div className="space-y-3">
                {solicitudesList.map((solicitud, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {solicitud.estudiante?.nombre_completo?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'E'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{solicitud.estudiante?.nombre_completo || 'Estudiante'}</p>
                      <p className="text-xs text-gray-400">{solicitud.materia || 'Mentoría'} · {solicitud.estudiante?.carrera || 'Sin carrera'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const id = solicitud.id;
                          try {
                            const { error } = await supabase.from('mentorias').update({ estado: 'Activa' }).eq('id', id);
                            if (error) throw error;
                            setSolicitudesList([]);
                            setSolicitudesPendientes(0);
                            setShowSolicitudesModal(false);
                          } catch (err) {
                            console.error('Error accepting request:', err);
                            alert('Error al aceptar: ' + err.message);
                          }
                        }}
                        className="px-3 py-1.5 min-h-[44px] bg-green-600 text-white text-xs rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const id = solicitud.id;
                          try {
                            const { error } = await supabase.from('mentorias').update({ estado: 'Cancelada' }).eq('id', id);
                            if (error) throw error;
                            setSolicitudesList([]);
                            setSolicitudesPendientes(0);
                            setShowSolicitudesModal(false);
                          } catch (err) {
                            console.error('Error rejecting request:', err);
                            alert('Error al rechazar: ' + err.message);
                          }
                        }}
                        className="px-3 py-1.5 min-h-[44px] bg-red-600 text-white text-xs rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Rechazar
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const id = solicitud.id;
                          try {
                            const { error } = await supabase.from('mentorias').delete().eq('id', id);
                            if (error) throw error;
                            setSolicitudesList([]);
                            setSolicitudesPendientes(0);
                            setShowSolicitudesModal(false);
                          } catch (err) {
                            console.error('Error deleting request:', err);
                            alert('Error al eliminar: ' + err.message);
                          }
                        }}
                        className="px-3 py-1.5 min-h-[44px] bg-gray-600 text-white text-xs rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
