import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Clock, User, ChevronDown, 
  X, Send, Heart, RefreshCw, Hand
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { StreamChat } from 'stream-chat';
import { createOrGetStreamChannel } from '../lib/chatUtils';

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
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [openDropdown, setOpenDropdown] = useState('');
  const [facultad, setFacultad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [mentores, setMentores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [favoritos, setFavoritos] = useState(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState(new Set());
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('U');
  const [userRol, setUserRol] = useState('');
  const [authUserId, setAuthUserId] = useState(null);
  const [userCarrera, setUserCarrera] = useState('');
  const [mentorActiveCounts, setMentorActiveCounts] = useState({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [calificacion, setCalificacion] = useState('');
  const [sortBy, setSortBy] = useState('populares');
  const [promedios, setPromedios] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await ensureProfileExists();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const name = authUser.user_metadata?.nombre_completo || authUser.email?.split('@')[0] || '';
        const rol = authUser.user_metadata?.rol || '';
        setUserName(name);
        setUserInitials(name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U');
        setUserRol(rol);
        setAuthUserId(authUser.id);

        // Obtener carrera del usuario logueado
        const { data: perfil } = await supabase
          .from('profiles')
          .select('carrera')
          .eq('id', authUser.id)
          .maybeSingle();
        if (perfil?.carrera) setUserCarrera(perfil.carrera);
      }
      await fetchMentores();
    };
    init();

    const subscription = supabase
      .channel('profiles-mentores')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: 'rol=eq.Mentor' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            if (payload.new.id !== authUserId) setMentores(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMentores(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          } else if (payload.eventType === 'DELETE') {
            setMentores(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (authUserId && mentores.length > 0) {
      fetchFavoritos();
      fetchMentorCapacidad();
      fetchPromedios();
    }
  }, [authUserId, mentores.length]);

  useEffect(() => {
    const handleClick = () => setOpenDropdown('')
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const fetchFavoritos = async () => {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('mentor_id')
        .eq('usuario_id', authUserId);
      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) return;
        console.error('Error fetching favorites:', error);
        return;
      }
      setFavoritos(new Set(data.map(f => f.mentor_id)));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchMentorCapacidad = async () => {
    try {
      const mentorIds = mentores.map(m => m.id);
      if (mentorIds.length === 0) return;
      const { data, error } = await supabase
        .from('mentorias')
        .select('mentor_id, estado')
        .in('mentor_id', mentorIds)
        .eq('estado', 'Activa');
      if (error) {
        console.error('Error fetching mentor capacity:', error);
        return;
      }
      const counts = {};
      (data || []).forEach(item => {
        counts[item.mentor_id] = (counts[item.mentor_id] || 0) + 1;
      });
      setMentorActiveCounts(counts);
    } catch (err) {
      console.error('Error fetching mentor capacity:', err);
    }
  };

  const fetchPromedios = async () => {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('mentor_id, promedio, total');
      if (error) {
        // Tabla no existe o RLS - no es crítico, usar promedios por defecto
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('Tabla calificaciones no existe, usando valores por defecto');
        } else {
          console.error('Error fetching promedios:', error);
        }
        return;
      }
      const map = {};
      (data || []).forEach(item => {
        map[item.mentor_id] = { promedio: item.promedio, total: item.total };
      });
      setPromedios(map);
    } catch (err) {
      console.error('Error fetching promedios:', err);
    }
  };

  const toggleFavorite = async (mentorId, e) => {
    e.stopPropagation();
    if (!authUserId) return;

    setFavoriteLoading(prev => new Set(prev).add(mentorId));

    try {
      if (favoritos.has(mentorId)) {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', authUserId)
          .eq('mentor_id', mentorId);
        if (error) {
          if (error.message?.includes('relation') && error.message?.includes('does not exist')) return;
          console.error('Error removing favorite:', error);
          return;
        }
        setFavoritos(prev => {
          const next = new Set(prev);
          next.delete(mentorId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('favoritos')
          .insert({ usuario_id: authUserId, mentor_id: mentorId });
        if (error) {
          if (error.message?.includes('relation') && error.message?.includes('does not exist')) return;
          console.error('Error adding favorite:', error);
          return;
        }
        setFavoritos(prev => new Set(prev).add(mentorId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavoriteLoading(prev => {
        const next = new Set(prev);
        next.delete(mentorId);
        return next;
      });
    }
  };

  useEffect(() => {
    const handleClick = () => setOpenDropdown('')
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const ensureProfileExists = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: byId } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();
      if (byId) return byId;

      if (authUser.email) {
        const { data: byEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle();
        if (byEmail) return byEmail;
      }

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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('rol', 'Mentor')
        .neq('id', authUser.id);

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
      const prom = promedios[mentor.id] ? parseFloat(promedios[mentor.id].promedio) : (mentor.promedio ? mentor.promedio / 20 * 5 : 0);
      const matchRating = !calificacion || prom >= parseFloat(calificacion);
      const matchFav = !showFavoritesOnly || favoritos.has(mentor.id);
      return matchSearch && matchCarrera && matchRating && matchFav;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => {
        const pa = promedios[a.id] ? parseFloat(promedios[a.id].promedio) : (a.promedio ? a.promedio / 20 * 5 : 0);
        const pb = promedios[b.id] ? parseFloat(promedios[b.id].promedio) : (b.promedio ? b.promedio / 20 * 5 : 0);
        return pb - pa;
      });
    }

    return result;
  }, [searchTerm, carrera, calificacion, sortBy, mentores, promedios, showFavoritesOnly, favoritos]);

  const visibleMentors = filteredMentors.slice(0, visibleCount);

  const handleClearFilters = () => {
    setSearchTerm(''); setFacultad(''); setCarrera(''); setCalificacion(''); setSortBy('populares'); setFiltersApplied(false); setShowFavoritesOnly(false);
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

      // Verificar si ya existe una solicitud Pendiente o Activa con este mentor
      const { data: existing } = await supabase
        .from('mentorias')
        .select('id, estado')
        .eq('estudiante_id', profileId)
        .eq('mentor_id', mentor.id)
        .in('estado', ['Pendiente', 'Activa'])
        .maybeSingle();

      if (existing) {
        setErrorMsg('Ya tienes una solicitud ' + (existing.estado === 'Activa' ? 'activa' : 'pendiente') + ' con este mentor.');
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

      navigate('/mentorias');
    } catch (err) {
      console.error('Error requesting mentor:', err);
      setErrorMsg('Error: ' + (err.message || err.details || err.hint || 'Error al procesar la solicitud'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmContact = async (otherUser) => {
    setSaving(true);
    setErrorMsg('');
    try {
      if (!otherUser?.id) throw new Error('Usuario destino inválido');
      const channelId = await createOrGetStreamChannel(otherUser.id);
      navigate(`/mensajes?channel=${channelId}`);
    } catch (err) {
      console.error('Error contacting user:', err);
      setErrorMsg('Error al contactar: ' + (err.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const getRating = (mentor) => {
    if (promedios[mentor.id]) return promedios[mentor.id].promedio;
    return mentor.promedio ? (mentor.promedio / 20 * 5).toFixed(1) : '0.0';
  };

  const getResenas = (mentor) => {
    if (promedios[mentor.id]) return promedios[mentor.id].total;
    return 0;
  };

  const getRatingFull = (mentor) => {
    if (promedios[mentor.id]) return `(${getResenas(mentor)} reseñas)`;
    return mentor.promedio ? `(${(mentor.promedio / 20 * 5).toFixed(1)}/5)` : '(0 reseñas)';
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mentores</h1>
            <p className="text-gray-500 text-sm mt-2">{userRol === 'Mentor' ? 'Conecta con otros mentores, comparte conocimientos y sigue creciendo.' : 'Encuentra mentores expertos dispuestos a ayudarte a crecer.'}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar mentores..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]"
              />
            </div>
            <Header nombreUsuario={userName} initials={userInitials} />
          </div>
        </div>

        <div className="py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative w-full md:w-auto" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'facultad' ? '' : 'facultad')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 min-h-[44px] text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition w-full md:w-auto">
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
              <div className="relative w-full md:w-auto" onClick={e => e.stopPropagation()}>
                <button onClick={() => {
                  if (!facultad) return;
                  setOpenDropdown(openDropdown === 'carrera' ? '' : 'carrera')
                }}
                  className={`bg-white border border-gray-200 rounded-full px-4 py-2 min-h-[44px] text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition w-full md:w-auto ${!facultad ? 'opacity-50 pointer-events-none' : ''}`}>
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
              <div className="relative w-full md:w-auto" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'rating' ? '' : 'rating')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 min-h-[44px] text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition w-full md:w-auto">
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
              <div className="relative w-full md:w-auto" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenDropdown(openDropdown === 'sort' ? '' : 'sort')}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 min-h-[44px] text-sm flex items-center gap-2 cursor-pointer hover:border-gray-300 transition w-full md:w-auto">
                  {sortBy === 'populares' ? 'Más populares' : 'Mejor calificación'} <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'sort' && (
                  <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
                    <button onClick={() => { setSortBy('populares'); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'populares' ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Más populares</button>
                    <button onClick={() => { setSortBy('rating'); setOpenDropdown('') }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'rating' ? 'text-[#0f2a5c] font-medium' : 'text-gray-700'}`}>Mejor calificación</button>
                  </div>
                )}
              </div>
              <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 min-h-[44px] transition rounded-full ${
                  showFavoritesOnly
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'text-gray-500 hover:text-[#0f2a5c]'
                }`}>
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'text-red-500 fill-red-500' : ''}`} /> Mis Favoritos
              </button>
              <button onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0f2a5c] font-medium px-3 py-2.5 min-h-[44px] transition">
                <RefreshCw className="w-4 h-4" /> Limpiar
              </button>
            </div>
          </div>

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
                  const rating = getRating(mentor);
                  const isFav = favoritos.has(mentor.id);
                  const isFavLoading = favoriteLoading.has(mentor.id);
                  const activas = mentorActiveCounts[mentor.id] || 0;
                  const capacidadLlena = activas >= 5 && userRol !== 'Mentor';
                  const mismaCarrera = userCarrera && mentor.carrera && userCarrera === mentor.carrera;
                  const cursos = mentor.cursos || [];
                  
                  return (
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
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
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${capacidadLlena ? 'bg-red-100 text-red-700' : mentor.disponible === false ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>{capacidadLlena ? 'Lleno' : mentor.disponible === false ? 'No disponible' : 'Disponible'}</span>
                          <button onClick={(e) => toggleFavorite(mentor.id, e)} disabled={isFavLoading} className="transition-transform hover:scale-110">
                            <Heart className={`w-4 h-4 ${isFavLoading ? 'opacity-50' : ''} ${isFav ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                          </button>
                        </div>
                      </div>

                      {cursos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {cursos.slice(0, 4).map((curso) => (
                            <span key={curso} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {curso}
                            </span>
                          ))}
                          {cursos.length > 4 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                              +{cursos.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-gray-600 text-sm mb-3">
                        {mentor.ciclo ? `Ciclo ${mentor.ciclo}` : ''}
                      </p>

                      {mismaCarrera && (
                        <p className="text-xs text-[#0f2a5c] font-medium mb-2">
                          Compañero en {userCarrera}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Responde pronto</span>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => handleViewProfile(mentor)}
                          className="flex-1 border border-[#0f2a5c] text-[#0f2a5c] py-2 px-3 min-h-[44px] rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition">
                          Ver perfil
                        </button>
{userRol === 'Mentor' ? (
  <button onClick={() => handleContact(mentor)}
    className="flex-1 bg-[#0f2a5c] text-white py-2 px-3 min-h-[44px] rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={saving}>
    <Send className="w-4 h-4" /> {saving ? 'Conectando...' : 'Conectar'}
  </button>
) : capacidadLlena ? (
  <button disabled
    className="flex-1 bg-gray-300 text-white py-2 px-3 min-h-[44px] rounded-xl text-sm font-medium cursor-not-allowed flex items-center justify-center gap-1.5">
    Capacidad llena
  </button>
) : (
  <button onClick={() => handleSolicitarMentor(mentor)}
    className="flex-1 bg-[#0f2a5c] text-white py-2 px-3 min-h-[44px] rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={saving}>
    <Hand className="w-4 h-4" /> {saving ? 'Solicitando...' : 'Solicitar mentoría'}
  </button>
)}
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-2">¡Aprende con los mejores!</p>
                    </motion.div>
                  );
                })}
              </div>

              {filteredMentors.length > visibleCount && (
                <div className="flex justify-center mt-8">
                  <button onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    className="bg-white border border-[#0f2a5c] text-[#0f2a5c] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition flex items-center gap-2">
                    Cargar más mentores ({filteredMentors.length - visibleCount} restantes)
                  </button>
                </div>
              )}
            </main>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setProfileModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-md mx-auto" onClick={e => e.stopPropagation()}>
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
              <div className="flex items-center gap-2">
                <button onClick={(e) => toggleFavorite(profileModal.id, e)} className="transition-transform hover:scale-110">
                  <Heart className={`w-5 h-5 ${favoritos.has(profileModal.id) ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                </button>
                <button onClick={() => setProfileModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {profileModal.ciclo ? `Ciclo ${profileModal.ciclo}` : 'Mentor disponible para ayudarte en tus estudios.'}
            </p>
            {profileModal.carrera && userCarrera === profileModal.carrera && (
              <p className="text-xs text-[#0f2a5c] font-medium mb-2">
                Compañero en {userCarrera}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profileModal.carrera && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{profileModal.carrera}</span>
              )}
              {profileModal.ciclo && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Ciclo {profileModal.ciclo}</span>
              )}
              {profileModal.cursos && profileModal.cursos.length > 0 && (
                profileModal.cursos.slice(0, 6).map((curso) => (
                  <span key={curso} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{curso}</span>
                ))
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Responde pronto</span>
            </div>
{userRol === 'Mentor' ? (
  <button onClick={() => { setProfileModal(null); handleContact(profileModal); }}
    className="w-full bg-[#0f2a5c] text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={saving}>
    <Send className="w-4 h-4" /> {saving ? 'Conectando...' : 'Conectar'}
  </button>
) : (mentorActiveCounts[profileModal.id] || 0) >= 5 ? (
  <button disabled
    className="w-full bg-gray-300 text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2">
    Capacidad llena
  </button>
) : (
  <button onClick={() => { setProfileModal(null); handleSolicitarMentor(profileModal); }}
    className="w-full bg-[#0f2a5c] text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    disabled={saving}>
    <Hand className="w-4 h-4" /> {saving ? 'Solicitando...' : 'Solicitar mentoría'}
  </button>
)}
            <p className="text-xs text-gray-400 text-center mt-2">¡Aprende con los mejores!</p>
          </div>
        </div>
      )}
    </div>
  );
}
