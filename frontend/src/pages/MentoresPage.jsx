import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Star, Clock, User, ChevronDown, 
  X, Send, Heart, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { StreamChat } from 'stream-chat';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';


const facultades = [
  'Facultad de Ciencias Empresariales',
  'Facultad de Ingeniería y Arquitectura',
  'Facultad de Derecho',
  'Facultad de Humanidades',
  'Facultad de Ciencias de la Salud'
];

const carrerasPorFacultad = {
  'Facultad de Ciencias Empresariales': [
    'Administración y Negocios Internacionales',
    'Contabilidad y Finanzas',
    'Marketing',
    'Economía'
  ],
  'Facultad de Ingeniería y Arquitectura': [
    'Ingeniería de Sistemas',
    'Ingeniería Civil',
    'Arquitectura',
    'Ingeniería Industrial'
  ],
  'Facultad de Derecho': [
    'Derecho',
    'Derecho y Ciencias Políticas'
  ],
  'Facultad de Humanidades': [
    'Educación en Idiomas - Inglés',
    'Psicología',
    'Comunicación'
  ],
  'Facultad de Ciencias de la Salud': [
    'Medicina',
    'Enfermería',
    'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica',
    'Nutrición'
  ]
};

const skillsOptions = [
  'Java', 'Python', 'JavaScript', 'React', 'Spring Boot',
  'Node.js', 'SQL', 'AWS', 'Docker',
  'Kubernetes', 'Machine Learning', 'Data Science', 'Estadística',
  'Álgebra', 'Cálculo', 'Física', 'Química', 'Inglés'
];

const ITEMS_PER_PAGE = 6;

export default function MentoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritos, setFavoritos] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [calificacion, setCalificacion] = useState('');
  const [sortBy, setSortBy] = useState('populares');
  const [openDropdown, setOpenDropdown] = useState('');
  const [facultad, setFacultad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [mentores, setMentores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('U');

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await ensureProfileExists();
      await fetchMentores();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const name = authUser.user_metadata?.nombre_completo || authUser.email?.split('@')[0] || '';
        setUserName(name);
        setUserInitials(name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U');
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handleClick = () => setOpenDropdown('')
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const ensureProfileExists = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      // 1. Buscar por ID de auth
      const { data: byId } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();
      if (byId) return byId;

      // 2. Buscar por email (perfiles creados manualmente con IDs fijos)
      if (authUser.email) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', authUser.email)
          .single();
        if (byEmail) return byEmail;
      }

      // 3. Crear nuevo perfil con el ID real de auth
      const meta = authUser.user_metadata || {};
      const { data: newProfile, error } = await supabase.from('profiles').insert({
        id: authUser.id,
        nombre_completo: meta.nombre_completo || authUser.email?.split('@')[0] || 'Usuario',
        codigo_estudiante: meta.codigo_estudiante || `EST-${Date.now()}`,
        email: authUser.email,
        rol: meta.rol || 'Estudiante',
        carrera: meta.carrera || 'Sin asignar',
        ciclo: parseInt(meta.ciclo) || 1,
        promedio: parseFloat(meta.promedio) || 0.00,
        estilo_aprendizaje: meta.estilo_aprendizaje || 'Visual',
      }).select().single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      return newProfile;
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
      return null;
    }
  };

  const fetchMentores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('rol', 'Mentor');

      if (error) {
        console.error('Error fetching mentors:', error);
        setErrorMsg('Error al cargar mentores');
      } else {
        setMentores(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorMsg('Error al cargar mentores');
    } finally {
      setLoading(false);
    }
  };

  const ratingOptions = [
    { value: '', label: 'Cualquiera' },
    { value: '5.0', label: '5.0' },
    { value: '4.0', label: '4.0 o más' },
    { value: '3.0', label: '3.0 o más' }
  ];

  const filteredMentors = useMemo(() => {
    let result = mentores.filter((mentor) => {
      const matchSearch = !searchTerm || 
        mentor.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        mentor.carrera?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCarrera = !carrera || mentor.carrera === carrera;
      const matchRating = !calificacion || mentor.promedio >= parseFloat(calificacion);
      return matchSearch && matchCarrera && matchRating;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.promedio - a.promedio);
    }

    return result;
  }, [searchTerm, carrera, calificacion, sortBy, mentores]);

  const visibleMentors = filteredMentors.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMentors.length;

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm(''); setFacultad(''); setCarrera(''); setCalificacion(''); setSortBy('populares'); setFiltersApplied(false);
    setCurrentPage(1);
  };

  const toggleFavorito = (id) => {
    setFavoritos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleViewProfile = (mentor) => {
    setProfileModal(mentor);
  };

  const handleSolicitarMentor = async (mentor) => {
    setSaving(true);
    setErrorMsg('');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setErrorMsg('Debes iniciar sesión para solicitar una mentoría');
        setSaving(false);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const profile = await ensureProfileExists();
      const profileId = profile?.id || authUser.id;
      if (!profileId) {
        setErrorMsg('Error: No se pudo crear tu perfil');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('mentorias')
        .insert({
          estudiante_id: profileId,
          mentor_id: mentor.id,
          estado: 'Pendiente',
          materia: mentor.carrera || 'General',
          descripcion: 'Hola, he solicitado tu mentoría. Espero que podamos trabajar juntos.'
        });

      if (error) {
        console.error('Error detallado de Supabase:', error);
        setErrorMsg('Error: ' + (error.message || error.details || error.hint || 'Error desconocido'));
        return;
      }

      // --- Crear canal de Stream Chat ---
      const chatClient = new StreamChat(API_KEY);
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) throw new Error('No hay sesión activa');

      const response = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userId: authUser.id })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }
      const tokenData = await response.json();
      const token = tokenData.token;
      await chatClient.connectUser(
        { id: authUser.id, name: profile?.nombre_completo || authUser.email },
        token
      );

      // Verificar si el mentor existe en Stream Chat; si no, crearlo con token de servidor
      let mentorExists = false;
      try {
        const userQuery = await chatClient.queryUsers({ id: { $eq: mentor.id } });
        if (userQuery.users.length > 0) mentorExists = true;
      } catch (e) { /* Ignorar error */ }

      if (!mentorExists) {
        // Conectar y desconectar como el mentor para que Stream Chat lo cree automáticamente
        const session2 = await supabase.auth.getSession();
        const accessToken2 = session2.data.session?.access_token;
        if (!accessToken2) throw new Error('No hay sesión activa');

        const mentorResp = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken2}`
          },
          body: JSON.stringify({ userId: mentor.id })
        });
        if (!mentorResp.ok) {
          const errorText = await mentorResp.text();
          throw new Error(`Error HTTP ${mentorResp.status}: ${errorText}`);
        }
        const mentorTokenData = await mentorResp.json();
        const mentorToken = mentorTokenData.token;
        const tempClient = new StreamChat(API_KEY);
        await tempClient.connectUser(
          { id: mentor.id, name: mentor.nombre_completo },
          mentorToken
        );
        await tempClient.disconnectUser();
      }

      // 1. Verificar si el canal ya existe entre el estudiante y el mentor
      const sortedIds = [authUser.id, mentor.id].sort();
      const channelId = `mentoria-${sortedIds[0]}-${sortedIds[1]}`;

      const existingChannels = await chatClient.queryChannels({
        type: 'messaging',
        members: { $in: [authUser.id, mentor.id] }
      });

      let channel;
      const exactMatch = existingChannels.find(
        ch => ch.id === channelId || (ch.state?.members && ch.state.members[authUser.id] && ch.state.members[mentor.id])
      );
      if (exactMatch) {
        channel = exactMatch;
      } else {
        channel = chatClient.channel('messaging', channelId, {
          members: [authUser.id, mentor.id]
        });
        await channel.watch();
      }

      await channel.sendMessage({
        text: "¡Hola! He solicitado tu mentoría. Espero que podamos trabajar juntos."
      });

      navigate('/mentorias');
    } catch (err) {
      console.error('Error requesting mentor:', err);
      setErrorMsg('Error: ' + (err.message || err.details || err.hint || 'Error al procesar la solicitud'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mentores</h1>
            <p className="text-gray-500 text-sm mt-2">Encuentra mentores expertos dispuestos a ayudarte a crecer.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar mentores..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]"
              />
            </div>
            <Header nombreUsuario={userName} initials={userInitials} />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="py-6">

          {/* HORIZONTAL FILTER BAR */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'facultad' ? '' : 'facultad')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition whitespace-nowrap">
                  {facultad || 'Facultad: Todas'} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'facultad' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'facultad' && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[220px] max-h-60 overflow-y-auto">
                    <button onClick={() => { setFacultad(''); setCarrera(''); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!facultad ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Todas</button>
                    {facultades.map((opt) => (
                      <button key={opt} onClick={() => { setFacultad(opt); setCarrera(''); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${facultad === opt ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => {
                  if (!facultad) return;
                  setOpenDropdown(openDropdown === 'carrera' ? '' : 'carrera')
                }}
                  className={`bg-white border border-gray-200 rounded-full px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition whitespace-nowrap ${!facultad ? 'opacity-50 pointer-events-none' : ''}`}>
                  {carrera || 'Carrera: Todas'} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'carrera' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'carrera' && facultad && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[220px] max-h-60 overflow-y-auto">
                    <button onClick={() => { setCarrera(''); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!carrera ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Todas</button>
                    {(carrerasPorFacultad[facultad] || []).map((opt) => (
                      <button key={opt} onClick={() => { setCarrera(opt); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${carrera === opt ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'rating' ? '' : 'rating')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition whitespace-nowrap">
                  {calificacion ? (ratingOptions.find(o => o.value === calificacion)?.label || calificacion) : 'Calificación'} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'rating' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'rating' && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
                    {ratingOptions.map((opt) => (
                      <button key={opt.value} onClick={() => { setCalificacion(opt.value); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${calificacion === opt.value ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'sort' ? '' : 'sort')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition whitespace-nowrap">
                  {sortBy === 'populares' ? 'Más populares' : 'Mejor calificación'} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'sort' && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
                    <button onClick={() => { setSortBy('populares'); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'populares' ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Más populares</button>
                    <button onClick={() => { setSortBy('rating'); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'rating' ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Mejor calificación</button>
                  </div>
                )}
              </div>
              <button onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0f2a5c] font-medium px-3 py-2.5 transition">
                <RefreshCw className="w-4 h-4" /> Limpiar
              </button>
            </div>
          </div>

          {/* MAIN CONTENT - MENTORS GRID */}
          <main>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

              {loading ? (
                <div className="text-center py-16">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Cargando mentores...</p>
                </div>
              ) : visibleMentors.length === 0 && filtersApplied ? (
                <div className="text-center py-16">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No se encontraron mentores</p>
                  <p className="text-gray-400 text-sm mt-1">Intenta con otros filtros.</p>
                </div>
              ) : visibleMentors.length === 0 ? (
                <div className="text-center py-16">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No hay mentores disponibles</p>
                  <p className="text-gray-400 text-sm mt-1">Vuelve más tarde.</p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMentors.map((mentor) => {
                  const initials = mentor.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
                  const rating = mentor.promedio ? (mentor.promedio / 20 * 5).toFixed(1) : '0.0';
                  const esFavorito = favoritos.has(mentor.id);
                  
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative w-14 h-14 flex-shrink-0">
                          {mentor.avatar_url ? (
                            <img 
                              src={mentor.avatar_url} 
                              alt={mentor.nombre_completo}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {initials}
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{mentor.nombre_completo}</h4>
                          <p className="text-gray-500 text-[11px] truncate mt-0.5">{mentor.carrera || 'Sin especialidad'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Disponible</span>
                          <button onClick={() => toggleFavorito(mentor.id)} className={`p-1 rounded-lg transition ${esFavorito ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                            <Heart className={`w-4 h-4 ${esFavorito ? 'fill-red-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-800">{rating}</span>
                        <span className="text-gray-500 text-xs">({mentor.promedio || 0}/20)</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-1">
                        {mentor.cursos && mentor.cursos.length > 0
                          ? `Cursos: ${mentor.cursos[0]}${mentor.cursos.length > 1 ? ` + ${mentor.cursos.length - 1} más` : ''}`
                          : 'Sin cursos asignados'}
                      </p>
                      <p className="text-gray-600 text-sm mb-3">
                        {mentor.ciclo ? `Ciclo ${mentor.ciclo}` : ''}
                      </p>

                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Responde pronto</span>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleViewProfile(mentor)}
                          className="flex-1 border border-[#0f2a5c] text-[#0f2a5c] py-2 px-3 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition">
                          Ver perfil
                        </button>
                        <button onClick={() => handleSolicitarMentor(mentor)}
                          disabled={saving}
                          className="flex-1 bg-[#0f2a5c] text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                          {saving ? 'Cargando...' : 'Solicitar mentor'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {Math.ceil(filteredMentors.length / ITEMS_PER_PAGE) > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button onClick={() => setVisibleCount(ITEMS_PER_PAGE)}
                    disabled={visibleCount === ITEMS_PER_PAGE}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.ceil(filteredMentors.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setVisibleCount(page * ITEMS_PER_PAGE)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-medium transition ${
                        visibleCount >= page * ITEMS_PER_PAGE
                          ? 'bg-[#0f2a5c] text-white border-[#0f2a5c]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setVisibleCount(filteredMentors.length)}
                    disabled={visibleCount >= filteredMentors.length}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </main>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setProfileModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {profileModal.avatar_url ? (
                  <img 
                    src={profileModal.avatar_url} 
                    alt={profileModal.nombre_completo}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {profileModal.nombre_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-800">{profileModal.nombre_completo}</h3>
                  <p className="text-sm text-gray-500">{profileModal.carrera || 'Sin especialidad'}</p>
                </div>
              </div>
              <button onClick={() => setProfileModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{profileModal.promedio ? (profileModal.promedio / 20 * 5).toFixed(1) : '0.0'}</span>
              <span className="text-xs text-gray-500">({profileModal.promedio || 0}/20)</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {profileModal.estilo_aprendizaje && `Estilo de aprendizaje: ${profileModal.estilo_aprendizaje}`}
              {profileModal.ciclo && profileModal.estilo_aprendizaje && ' • '}
              {profileModal.ciclo && `Ciclo ${profileModal.ciclo}`}
              {!profileModal.estilo_aprendizaje && !profileModal.ciclo && 'Mentor disponible para ayudarte en tus estudios.'}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profileModal.carrera && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{profileModal.carrera}</span>
              )}
              {profileModal.estilo_aprendizaje && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{profileModal.estilo_aprendizaje}</span>
              )}
              {profileModal.ciclo && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Ciclo {profileModal.ciclo}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Responde pronto</span>
            </div>
            <button onClick={() => { setProfileModal(null); handleSolicitarMentor(profileModal); }}
              disabled={saving}
              className="w-full bg-[#0f2a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {saving ? 'Cargando...' : 'Solicitar mentoría'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
