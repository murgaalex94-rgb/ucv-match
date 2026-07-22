import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Bell, Search,  
  ChevronDown, User,  
  TrendingUp, Clock, CheckCircle,
  Filter, RotateCcw,  
  Plus, X as XIcon, 
  Star as StarIcon,
  ChevronLeft, ChevronRight, Send, ClipboardList
} from 'lucide-react';
import { TimePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MaterialDatePicker from '../components/MaterialDatePicker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StreamChat } from 'stream-chat';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY || '3mgv7c3pnrhu';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function MentoriasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({ mentor_id: '', materia: '', tema: '' });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [mentoresDisponibles, setMentoresDisponibles] = useState([]);
  const [mentorSeleccionado, setMentorSeleccionado] = useState('');
  const [sesionesHoy, setSesionesHoy] = useState([]);
  const [proximasMentorias, setProximasMentorias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [slotLlenoMsg, setSlotLlenoMsg] = useState('');

  const esMentor = user?.rol === 'Mentor' || user?.user_metadata?.rol === 'Mentor';

  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = async () => {
    if (!esMentor || !user?.id) return;
    const { count } = await supabase
      .from('mentorias')
      .select('*', { count: 'exact', head: true })
      .eq('mentor_id', user.id)
      .eq('estado', 'Pendiente');
    setPendingCount(count || 0);
  };

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  useEffect(() => {
    loadMentorias();
    fetchPendingCount();
  }, [user]);

  useEffect(() => {
    if (!fechaSeleccionada || !mentorSeleccionado) {
      setOccupiedSlots([]);
      return;
    }
    const fetchOccupied = async () => {
      const dateStr = fechaSeleccionada.toISOString().split('T')[0];
      const { data } = await supabase
        .from('mentorias')
        .select('fecha_solicitud')
        .eq('mentor_id', mentorSeleccionado)
        .gte('fecha_solicitud', `${dateStr}T00:00:00`)
        .lte('fecha_solicitud', `${dateStr}T23:59:59`)
        .in('estado', ['Pendiente', 'Activa']);
      if (data) {
        setOccupiedSlots(data.map(m => {
          const d = new Date(m.fecha_solicitud);
          return d.getHours() * 60 + d.getMinutes();
        }));
      }
    };
    fetchOccupied();
  }, [fechaSeleccionada, mentorSeleccionado]);

  useEffect(() => {
    if (!fechaSeleccionada || !horaSeleccionada || !mentorSeleccionado) {
      setSlotLlenoMsg('');
      return;
    }
    const slotMin = horaSeleccionada.getHours() * 60 + horaSeleccionada.getMinutes();
    const isOccupied = occupiedSlots.some(occ => Math.abs(occ - slotMin) < 60);
    setSlotLlenoMsg(isOccupied ? 'El mentor ya tiene una mentoría en este horario. Elige otra hora.' : '');
  }, [fechaSeleccionada, horaSeleccionada, mentorSeleccionado, occupiedSlots]);

  const loadMentorias = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('mentorias')
        .select(`
          *,
          estudiante:estudiante_id(nombre_completo, avatar_url, carrera),
          mentor:mentor_id(nombre_completo, avatar_url, carrera)
        `)
        .eq(esMentor ? 'mentor_id' : 'estudiante_id', user.id);

      if (esMentor) {
        query = query.neq('estudiante_id', user.id);
      }

      const { data: mentorias, error } = await query.order('fecha_solicitud', { ascending: false });

      if (error) throw error;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hoyStr = hoy.toISOString().split('T')[0];

      const hoyArr = [];
      const proximasArr = [];
      const historialArr = [];

      for (const m of mentorias || []) {
        if (!m.fecha_solicitud) {
          if (m.estado === 'Pendiente') {
            proximasArr.push(m);
          } else {
            historialArr.push(m);
          }
          continue;
        }
        const fechaM = new Date(m.fecha_solicitud);
        const fechaMStr = fechaM.toISOString().split('T')[0];

        if (fechaMStr === hoyStr && m.estado === 'Activa') {
          hoyArr.push(m);
        } else if (m.estado !== 'Completada' && m.estado !== 'Cancelada') {
          proximasArr.push(m);
        } else if (m.estado === 'Completada') {
          historialArr.push(m);
        }
      }

      setSesionesHoy(hoyArr);
      setProximasMentorias(proximasArr);
      setHistorial(historialArr);
      fetchPendingCount();
    } catch (error) {
      console.error('Error loading mentorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMentores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre_completo')
        .eq('rol', 'Mentor');

      if (error) throw error;
      setMentoresDisponibles(data || []);
    } catch (error) {
      console.error('Error loading mentors:', error);
      setMentoresDisponibles([]);
    }
  };

  const openModal = async (session = null) => {
    await cargarMentores();

    if (session) {
      setEditingSession(session);
      setFormData({
        mentor_id: session.mentor_id || '',
        materia: session.materia || '',
        tema: session.descripcion || ''
      });
      setMentorSeleccionado(session.mentor_id || '');
    } else {
      setEditingSession(null);
      setFormData({ mentor_id: '', materia: '', tema: '' });
      setMentorSeleccionado('');
    }
    setIsModalOpen(true);
  };

  const handleCrearMentoria = async () => {
    if (!formData.materia || !formData.tema || !mentorSeleccionado) {
      setToastMsg({ text: 'Completa todos los campos', type: 'error' });
      return;
    }

    if (!user || !user.id) {
      setToastMsg({ text: 'Debes iniciar sesión', type: 'error' });
      return;
    }

    const targetMentorId = mentorSeleccionado;
    if (!targetMentorId) {
      setToastMsg({ text: 'Debes seleccionar un mentor', type: 'error' });
      return;
    }

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            nombre_completo: user.nombre || user.email?.split('@')[0] || 'Usuario',
            email: user.email || '',
            rol: user.rol || 'JUNIOR'
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          setToastMsg({ text: 'Error al crear tu perfil. Contacta al administrador.', type: 'error' });
          return;
        }
      }

      const profileId = user.id;

      const { data: existing } = await supabase
        .from('mentorias')
        .select('id, estado')
        .eq('estudiante_id', profileId)
        .eq('mentor_id', targetMentorId)
        .in('estado', ['Pendiente', 'Activa'])
        .maybeSingle();

      if (existing) {
        setToastMsg({ text: 'Ya tienes una mentoría pendiente o activa con este mentor.', type: 'error' });
        return;
      }

      const { error } = await supabase
        .from('mentorias')
        .insert({
          estudiante_id: profileId,
          mentor_id: targetMentorId,
          materia: formData.materia,
          descripcion: formData.tema,
          estado: 'Pendiente',
          fecha_solicitud: new Date().toISOString()
        });

      if (error) throw error;

      await loadMentorias();
      setFormData({ mentor_id: '', materia: '', tema: '' });
      setMentorSeleccionado('');
      setEditingSession(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error detallado de Supabase:', error);
      setToastMsg({ text: 'Error: ' + (error.message || error.details || error.hint || 'Error desconocido'), type: 'error' });
    }
  };

  const handleAcceptSession = async (session) => {
    setAcceptLoading(session.id);
    setPendingCount(prev => Math.max(0, prev - 1));
    try {
      // Crear canal de Stream Chat entre mentor y estudiante
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const chatClient = new StreamChat(API_KEY);
        const sess = await supabase.auth.getSession();
        const accessToken = sess.data.session?.access_token;
        if (accessToken) {
          const response = await fetch('https://baelhtrbulusonjbdtor.supabase.co/functions/v1/generate-stream-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({ userId: authUser.id })
          });
          if (response.ok) {
            const tokenData = await response.json();
            await chatClient.connectUser(
              { id: authUser.id, name: authUser.user_metadata?.nombre_completo || authUser.email || '' },
              tokenData.token
            );
            // Usar mismo formato de channelId que el backend: mentoria_<uuid1>_<uuid2> (ordenado)
            const id1 = authUser.id;
            const id2 = session.estudiante_id;
            const sorted = [id1, id2].sort();
            const channelId = `mentoria_${sorted[0]}_${sorted[1]}`;
            const channel = chatClient.channel('messaging', channelId, {
              members: [authUser.id, session.estudiante_id]
            });
            await channel.create();
            
            // Guardar channelId en la mentoría via backend (el backend ya lo hace en SolicitudService.aceptar)
            // Pero por si acaso, también lo guardamos aquí
            await supabase
              .from('mentorias')
              .update({ stream_chat_channel_id: channelId })
              .eq('id', session.id);
            
            await chatClient.disconnectUser();
          }
        }
      }

      const { error } = await supabase
        .from('mentorias')
        .update({ estado: 'Activa' })
        .eq('id', session.id);
      if (error) throw error;

      await supabase.from('notificaciones').insert({
        usuario_id: session.estudiante_id,
        tipo: 'mentoria_aceptada',
        mensaje: 'Tu solicitud de mentoría ha sido aceptada. ¡Ya puedes chatear con tu mentor!'
      });

      await loadMentorias();
      setToastMsg({ text: 'Solicitud aceptada', type: 'success' });
    } catch (error) {
      console.error('Error accepting mentorship:', error);
      setPendingCount(prev => prev + 1);
      setToastMsg({ text: 'Error al aceptar mentoría', type: 'error' });
    } finally {
      setAcceptLoading(null);
    }
  };

  const rejectReasons = [
    { label: 'Horario no disponible', value: 'Horario no disponible' },
    { label: 'Ya no tengo disponibilidad', value: 'Ya no tengo disponibilidad' },
    { label: 'El perfil no coincide', value: 'El perfil no coincide' },
    { label: 'Otro motivo', value: 'Otro' },
  ];

  const handleRejectSession = (session) => {
    setRejectModal(session);
  };

  const confirmReject = async (sessionId, estudianteId, motivo) => {
    setRejectModal(null);
    setProximasMentorias(prev => prev.filter(m => m.id !== sessionId));
    setPendingCount(prev => Math.max(0, prev - 1));
    try {
      const { error } = await supabase
        .from('mentorias')
        .update({ estado: 'Cancelada', motivo_rechazo: motivo })
        .eq('id', sessionId);
      if (error) throw error;

      if (estudianteId) {
        await supabase.from('notificaciones').insert({
          usuario_id: estudianteId,
          tipo: 'mentoria_rechazada',
          mensaje: `Tu solicitud de mentoría ha sido rechazada: ${motivo}`
        });
      }

      setToastMsg({ text: 'Solicitud rechazada', type: 'success' });
    } catch (error) {
      console.error('Error rejecting mentorship:', error);
      setToastMsg({ text: 'Error al rechazar mentoría', type: 'error' });
      await loadMentorias();
      await fetchPendingCount();
    }
  };

  const handleCancelRequest = (id) => {
    setConfirmModal({
      title: 'Cancelar solicitud',
      message: '¿Estás seguro de que quieres cancelar tu solicitud? Esta acción no se puede deshacer.',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setProximasMentorias(prev => prev.filter(m => m.id !== id));
        setPendingCount(prev => Math.max(0, prev - 1));
        try {
          const { error } = await supabase
            .from('mentorias')
            .update({ estado: 'Cancelada' })
            .eq('id', id);
          if (error) throw error;
          setToastMsg({ text: 'Solicitud cancelada', type: 'success' });
        } catch (error) {
          console.error('Error canceling mentorship:', error);
          setToastMsg({ text: 'Error al cancelar mentoría', type: 'error' });
          await loadMentorias();
          await fetchPendingCount();
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleCancelUpcoming = (id) => {
    setConfirmModal({
      title: 'Cancelar mentoría',
      message: '¿Seguro que quieres cancelar esta mentoría?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setProximasMentorias(prev => prev.filter(m => m.id !== id));
        setPendingCount(prev => Math.max(0, prev - 1));
        try {
          const { error } = await supabase
            .from('mentorias')
            .update({ estado: 'Cancelada' })
            .eq('id', id);
          if (error) throw error;
          setToastMsg({ text: 'Mentoría cancelada', type: 'success' });
        } catch (error) {
          console.error('Error canceling mentorship:', error);
          setToastMsg({ text: 'Error al cancelar mentoría', type: 'error' });
          await loadMentorias();
          await fetchPendingCount();
        }
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  const handleCompleteSession = async (session) => {
    try {
      const { error } = await supabase
        .from('mentorias')
        .update({ estado: 'Completada' })
        .eq('id', session.id);

      if (error) throw error;
      await loadMentorias();
      setToastMsg({ text: 'Mentoría completada', type: 'success' });
    } catch (error) {
      console.error('Error completing mentorship:', error);
      setToastMsg({ text: 'Error al completar mentoría', type: 'error' });
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenChat = async (session) => {
    try {
      const otherUserId = esMentor ? session.estudiante_id : session.mentor_id;
      if (!otherUserId) {
        navigate('/mensajes');
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/mensajes');
        return;
      }

      const chatClient = new StreamChat(API_KEY);
      const sess = await supabase.auth.getSession();
      const accessToken = sess.data.session?.access_token;
      if (!accessToken) {
        navigate('/mensajes');
        return;
      }

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
      await chatClient.connectUser(
        { id: authUser.id, name: authUser.user_metadata?.nombre_completo || authUser.email || '' },
        tokenData.token
      );

      // Usar el channelId que ya creó el backend y guardó en la BD
      let channelId = session.streamChatChannelId;
      
      // Si no existe en BD (compatibilidad), generarlo con el mismo formato que el backend
      if (!channelId) {
        const id1 = authUser.id;
        const id2 = otherUserId;
        const sorted = [id1, id2].sort();
        channelId = `mentoria_${sorted[0]}_${sorted[1]}`;
      }

      const channel = chatClient.channel('messaging', channelId, {
        members: [authUser.id, otherUserId]
      });
      await channel.watch(); // watch en lugar de create para no duplicar
      
      await chatClient.disconnectUser();
      
      // Navegar CON el channelId en la URL para auto-seleccionarlo
      navigate(`/mensajes?channel=${channelId}`);
    } catch (err) {
      console.error('Error opening chat:', err);
      navigate('/mensajes');
    }
  };

  const getEstadoLabel = (estado) => {
    if (estado === 'Activa') return 'Confirmada';
    return estado || 'Pendiente';
  };

  const getEstadoColor = (estado) => {
    if (estado === 'Activa' || estado === 'Completada') return 'bg-green-100 text-green-700';
    if (estado === 'Cancelada') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  const canEnterSession = (session) => {
    if (session.estado !== 'Activa' || !session.fecha_solicitud) return false;
    const now = new Date();
    const sessionTime = new Date(session.fecha_solicitud);
    const diffMs = sessionTime.getTime() - now.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes >= 0 && diffMinutes <= 15;
  };

  const reminders = useMemo(() => {
    const items = [];

    const now = new Date();
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const activeSoon = [...sesionesHoy, ...proximasMentorias].find(s => {
      if (s.estado !== 'Activa' || !s.fecha_solicitud) return false;
      const fechaS = new Date(s.fecha_solicitud);
      return fechaS >= now && fechaS <= inTwoHours;
    });

    if (activeSoon) {
      items.push({
        icon: Calendar,
        text: 'Tu mentoría comienza pronto.',
        color: 'bg-blue-100 text-blue-700'
      });
    }

    const pendingExist = [...sesionesHoy, ...proximasMentorias, ...historial].some(s => s.estado === 'Pendiente');

    if (pendingExist) {
      items.push({
        icon: Bell,
        text: esMentor ? 'Tienes una nueva solicitud de mentoría.' : 'Esperando confirmación del mentor.',
        color: 'bg-orange-100 text-orange-700'
      });
    }

    return items;
  }, [sesionesHoy, proximasMentorias, historial, esMentor]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
        <style>{`.rs-picker-popup { z-index: 9999 !important; } .rs-picker-toggle-indicator { display: none !important; }`}</style>
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#0f2a5c] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Cargando mentorías...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentMonth = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date().getDate();

  const renderCalendarDays = () => {
    const days = [];
    const mentoriasDates = new Set();
    [...sesionesHoy, ...proximasMentorias, ...historial].forEach(m => {
      if (m.fecha_solicitud) {
        mentoriasDates.add(new Date(m.fecha_solicitud).toISOString().split('T')[0]);
      }
    });
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today && month === new Date().getMonth() && year === new Date().getFullYear();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasMentoria = mentoriasDates.has(dateStr);
      days.push(
        <button key={d}
          className={`relative min-h-[44px] min-w-[44px] rounded-full text-xs font-medium transition-colors ${isToday ? 'bg-[#0f2a5c] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
          {d}
          {hasMentoria && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />}
        </button>
      );
    }
    return days;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <style>{`.rs-picker-popup { z-index: 9999 !important; } .rs-picker-toggle-indicator { display: none !important; }`}</style>
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f2a5c]">{esMentor ? '📬 Solicitudes de Mentoría' : '🎯 Mis Solicitudes'}</h1>
            <p className="text-sm text-gray-500 mt-1">{esMentor ? 'Revisa las solicitudes de los estudiantes y gestiona tu disponibilidad.' : 'Revisa el estado de tus solicitudes y agenda nuevas mentorías.'}</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            {esMentor ? (
              <button
                onClick={() => openModal()}
                className="relative bg-[#0f2a5c] text-white px-6 py-2.5 min-h-[44px] rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#0f2a5c]/90 transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Gestionar Solicitudes
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => openModal()}
                className="bg-[#0f2a5c] text-white px-6 py-2.5 min-h-[44px] rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#0f2a5c]/90 transition"
              >
                <Plus className="w-4 h-4" />
                Solicitar Ayuda
              </button>
            )}
            <Header nombreUsuario={user?.nombre || ''} initials={user?.nombre ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'} avatarUrl={user?.avatar_url} />
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT CONTENT */}
          <main className="lg:col-span-3 space-y-8 min-w-0">

            {/* SESIONES DE HOY */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sesiones de hoy</h3>
              {sesionesHoy.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">No hay sesiones programadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sesionesHoy.map((session) => (
                    <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center bg-[#0f2a5c] text-white rounded-xl p-3 min-w-[70px]">
                            <span className="text-xl font-bold">{formatTime(session.fecha_solicitud)}</span>
                            <span className="text-xs text-blue-100">Hoy</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {getInitials(esMentor ? session.estudiante?.nombre_completo : session.mentor?.nombre_completo)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{esMentor ? (session.estudiante?.nombre_completo || 'Estudiante') : (session.mentor?.nombre_completo || 'Mentor')}</p>
                              <p className="text-gray-500 text-xs">{esMentor ? (session.estudiante?.carrera || 'Carrera no especificada') : (session.mentor?.carrera || 'Carrera no especificada')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Online</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(session.estado)}`}>
                              {getEstadoLabel(session.estado)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenChat(session)}
                            className="bg-[#0f2a5c] text-white px-5 py-2 min-h-[44px] rounded-xl font-medium text-sm hover:bg-[#0f2a5c]/90 transition flex items-center gap-1.5">
                            <Send className="w-4 h-4" /> Chatear
                          </button>
                          <button onClick={() => openModal(session)}
                            className="border border-gray-200 text-gray-700 px-5 py-2 min-h-[44px] rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* PRÓXIMAS MENTORÍAS */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas mentorías</h3>
              {proximasMentorias.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">No hay sesiones programadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proximasMentorias.map((session) => {
                    const sessionDate = new Date(session.fecha_solicitud);
                    const isPendiente = session.estado === 'Pendiente';
                    return (
                      <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center bg-gray-100 rounded-xl p-3 min-w-[60px]">
                              <span className="text-xl font-bold text-gray-800">{sessionDate.getDate()}</span>
                              <span className="text-xs text-gray-500 capitalize">{sessionDate.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {getInitials(esMentor ? session.estudiante?.nombre_completo : session.mentor?.nombre_completo)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{esMentor ? (session.estudiante?.nombre_completo || 'Estudiante') : (session.mentor?.nombre_completo || 'Mentor')}</p>
                              <p className="text-gray-500 text-xs">{esMentor ? (session.estudiante?.carrera || 'Carrera no especificada') : (session.mentor?.carrera || 'Carrera no especificada')}</p>
                            </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Online</span>
                              <div className="flex flex-col items-start gap-0.5">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(session.estado)}`}>
                                  {getEstadoLabel(session.estado)}
                                </span>
                                {isPendiente && !esMentor && (
                                  <span className="text-[10px] text-gray-400">Esperando confirmación del mentor</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {esMentor && isPendiente ? (
                              <>
                                <button onClick={() => handleAcceptSession(session)}
                                  disabled={acceptLoading === session.id}
                                  className="bg-green-100 text-green-700 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-green-200 transition disabled:opacity-50">
                                  {acceptLoading === session.id ? '...' : 'Aceptar'}
                                </button>
                                <button onClick={() => handleRejectSession(session)}
                                  className="bg-red-100 text-red-700 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium hover:bg-red-200 transition">
                                  Rechazar
                                </button>
                              </>
                            ) : isPendiente ? (
                              <button onClick={() => handleCancelRequest(session.id)}
                                className="border border-red-200 text-red-700 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium hover:bg-red-50 transition flex items-center gap-1">
                                <XIcon className="w-4 h-4" />
                                Cancelar solicitud
                              </button>
                            ) : !esMentor && (
                              <>
                                <button onClick={() => openModal(session)}
                                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition flex items-center gap-1">
                                  <RotateCcw className="w-4 h-4" />
                                  Reprogramar
                                </button>
                                <button onClick={() => handleCancelUpcoming(session.id)}
                                  className="border border-red-200 text-red-700 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium hover:bg-red-50 transition flex items-center gap-1">
                                  <XIcon className="w-4 h-4" />
                                  Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* HISTORIAL DE MENTORÍAS */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Historial de mentorías</h3>
              </div>
              {historial.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm">No hay sesiones finalizadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((session) => {
                    const sessionDate = new Date(session.fecha_solicitud);
                    return (
                      <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {getInitials(esMentor ? session.estudiante?.nombre_completo : session.mentor?.nombre_completo)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{session.materia || 'Materia'}</p>
                            <p className="text-gray-500 text-xs">{formatDate(session.fecha_solicitud)} • {esMentor ? (session.estudiante?.nombre_completo || 'Estudiante') : (session.mentor?.nombre_completo || 'Mentor')} • {esMentor ? (session.estudiante?.carrera || 'Carrera') : (session.mentor?.carrera || 'Carrera')} • {session.modalidad || 'Virtual'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(session.estado)}`}>
                            {getEstadoLabel(session.estado)}
                          </span>
                          {session.estado === 'Completada' && (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <StarIcon className="w-4 h-4 fill-current" />
                              <span className="text-sm font-medium">{session.calificacion || 5.0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </main>

          {/* RIGHT SIDEBAR WIDGETS */}
          <aside className="hidden md:block lg:col-span-1 flex flex-col gap-6">
            {/* CALENDAR WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-semibold text-gray-800">{currentMonth}</h4>
                <div className="flex gap-1">
                  <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }} className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }} className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => <div key={d} className="text-xs font-medium">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>

            {/* PRÓXIMA MENTORÍA WIDGET */}
            {proximasMentorias.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Próxima mentoría</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                      {getInitials(esMentor ? proximasMentorias[0].estudiante?.nombre_completo : proximasMentorias[0].mentor?.nombre_completo)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{esMentor ? (proximasMentorias[0].estudiante?.carrera || 'Carrera no especificada') : (proximasMentorias[0].mentor?.carrera || 'Carrera no especificada')}</p>
                      <p className="text-gray-500 text-xs">{esMentor ? (proximasMentorias[0].estudiante?.nombre_completo || 'Estudiante') : (proximasMentorias[0].mentor?.nombre_completo || 'Mentor')} • {formatDate(proximasMentorias[0].fecha_solicitud)}, {formatTime(proximasMentorias[0].fecha_solicitud)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Online</span>
                  </div>
                  <button onClick={() => handleOpenChat(proximasMentorias[0])}
                    disabled={proximasMentorias[0].estado === 'Pendiente'}
                    className={`w-full py-2.5 min-h-[44px] rounded-xl font-medium text-sm transition flex items-center justify-center gap-1.5 ${proximasMentorias[0].estado === 'Pendiente' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0f2a5c] text-white hover:bg-[#0f2a5c]/90'}`}>
                    <Send className="w-4 h-4" /> Chatear
                  </button>
                </div>
              </div>
            )}

            {/* REMINDERS WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Recordatorios</h4>
              {reminders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay recordatorios pendientes.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={`p-2 rounded-lg ${reminder.color}`}>
                        <reminder.icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-gray-700">{reminder.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* SOLICITAR AYUDA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => { setIsModalOpen(false); setEditingSession(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-md mx-auto z-40 relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Solicitar Ayuda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Seleccionar mentor</label>
                <select
                  value={mentorSeleccionado}
                  onChange={(e) => setMentorSeleccionado(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] bg-white cursor-pointer"
                >
                  <option value="">Selecciona un mentor</option>
                  {mentoresDisponibles.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Materia</label>
                <input
                  type="text"
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                  placeholder="Ej: Cálculo 1"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tema o duda</label>
                <textarea
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  placeholder="Describe tu duda o tema específico..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsModalOpen(false); setEditingSession(null); }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 min-h-[44px] rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={handleCrearMentoria}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition">
                  Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 z-50" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rechazar solicitud</h3>
            <p className="text-sm text-gray-600 mb-4">Selecciona un motivo para rechazar esta solicitud:</p>
            <div className="space-y-2">
              {rejectReasons.map((reason) => (
                <button key={reason.value}
                  onClick={() => confirmReject(rejectModal.id, rejectModal.estudiante_id, reason.value)}
                  className="w-full text-left px-4 py-3 min-h-[44px] rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-red-200 hover:bg-red-50 transition flex items-center gap-2">
                  <XIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                  {reason.label}
                </button>
              ))}
            </div>
            <button onClick={() => setRejectModal(null)}
              className="w-full mt-4 border border-gray-200 text-gray-700 py-2.5 min-h-[44px] rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Volver
            </button>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => { setConfirmModal(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 z-50" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button onClick={confirmModal.onCancel || (() => setConfirmModal(null))}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 min-h-[44px] rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white transition ${
                  confirmModal.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}>
                {confirmModal.variant === 'danger' ? 'Eliminar' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toastMsg.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}

export default MentoriasPage;
