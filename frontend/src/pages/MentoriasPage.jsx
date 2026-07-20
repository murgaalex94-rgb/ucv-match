import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Bell, Search,  
  ChevronDown, User, Video,  
  TrendingUp, Clock, CheckCircle, Star, 
  Filter, RotateCcw,  
  Plus, X as XIcon, 
  MapPin, Star as StarIcon,
  ChevronLeft, ChevronRight, Send
} from 'lucide-react';
import { TimePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MaterialDatePicker from '../components/MaterialDatePicker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function MentoriasPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({ mentor_id: '', materia: '', fecha: '', hora: '' });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [mentoresDisponibles, setMentoresDisponibles] = useState([]);
  const [mentorSeleccionado, setMentorSeleccionado] = useState('');
  const [sesionesHoy, setSesionesHoy] = useState([]);
  const [proximasMentorias, setProximasMentorias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  useEffect(() => {
    loadMentorias();
  }, [user]);

  const loadMentorias = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: mentorias, error } = await supabase
        .from('mentorias')
        .select(`
          *,
          estudiante:estudiante_id(nombre_completo, avatar_url),
          mentor:mentor_id(nombre_completo, avatar_url)
        `)
        .or(`estudiante_id.eq.${user.id},mentor_id.eq.${user.id}`)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hoyStr = hoy.toISOString().split('T')[0];

      const hoyArr = [];
      const proximasArr = [];
      const historialArr = [];

      (mentorias || []).forEach(m => {
        if (!m.fecha_solicitud) {
          if (m.estado === 'Pendiente') {
            proximasArr.push(m);
          } else {
            historialArr.push(m);
          }
          return;
        }
        const fechaM = new Date(m.fecha_solicitud);
        const fechaMStr = fechaM.toISOString().split('T')[0];

        if (fechaMStr === hoyStr && m.estado !== 'Completada' && m.estado !== 'Cancelada') {
          hoyArr.push(m);
        } else if (fechaM > hoy && m.estado !== 'Completada' && m.estado !== 'Cancelada') {
          proximasArr.push(m);
        } else {
          historialArr.push(m);
        }
      });

      setSesionesHoy(hoyArr);
      setProximasMentorias(proximasArr);
      setHistorial(historialArr);
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
        fecha: session.fecha_solicitud ? new Date(session.fecha_solicitud).toISOString().split('T')[0] : '',
        hora: session.fecha_solicitud ? new Date(session.fecha_solicitud).toTimeString().slice(0, 5) : ''
      });
      setMentorSeleccionado(session.mentor_id || '');
      setFechaSeleccionada(session.fecha_solicitud ? new Date(session.fecha_solicitud) : null);
      setHoraSeleccionada(session.fecha_solicitud ? new Date(session.fecha_solicitud) : (() => { const d = new Date(); d.setHours(8, 0, 0, 0); return d; })());
    } else {
      setEditingSession(null);
      setFormData({ mentor_id: '', materia: '', fecha: '', hora: '' });
      setMentorSeleccionado('');
      setFechaSeleccionada(null);
      const def = new Date();
      def.setHours(8, 0, 0, 0);
      setHoraSeleccionada(def);
    }
    setIsModalOpen(true);
  };

  const handleCrearMentoria = async () => {
    if (!formData.materia || !fechaSeleccionada || !horaSeleccionada) {
      setToastMsg({ text: 'Completa todos los campos', type: 'error' });
      return;
    }

    if (isNaN(fechaSeleccionada.getTime()) || isNaN(horaSeleccionada.getTime())) {
      setToastMsg({ text: 'La fecha o la hora no son válidas', type: 'error' });
      return;
    }

    if (!user || !user.id) {
      setToastMsg({ text: 'Debes iniciar sesión', type: 'error' });
      return;
    }

    if (!mentorSeleccionado) {
      setToastMsg({ text: 'Debes seleccionar un mentor', type: 'error' });
      return;
    }

    const fechaHora = new Date(fechaSeleccionada);
    fechaHora.setHours(horaSeleccionada.getHours(), horaSeleccionada.getMinutes());

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

      if (editingSession) {
        const { error } = await supabase
          .from('mentorias')
          .update({
            materia: formData.materia,
            fecha_solicitud: fechaHora.toISOString()
          })
          .eq('id', editingSession.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mentorias')
          .insert({
            estudiante_id: profileId,
            mentor_id: mentorSeleccionado,
            materia: formData.materia,
            estado: 'Pendiente',
            fecha_solicitud: fechaHora.toISOString()
          });

        if (error) throw error;
      }

      await loadMentorias();
      setFormData({ mentor: '', materia: '', fecha: '', hora: '' });
      setMentorSeleccionado('');
      setFechaSeleccionada(null);
      setHoraSeleccionada(null);
      setEditingSession(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error detallado de Supabase:', error);
      setToastMsg({ text: 'Error: ' + (error.message || error.details || error.hint || 'Error desconocido'), type: 'error' });
    }
  };

  const handleCancelRequest = (id) => {
    setConfirmModal({
      title: 'Cancelar solicitud',
      message: '¿Seguro que quieres cancelar esta solicitud?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const { error } = await supabase
            .from('mentorias')
            .update({ estado: 'Cancelada' })
            .eq('id', id);
          if (error) throw error;
          await loadMentorias();
          setToastMsg({ text: 'Solicitud cancelada', type: 'success' });
        } catch (error) {
          console.error('Error canceling mentorship:', error);
          setToastMsg({ text: 'Error al cancelar mentoría', type: 'error' });
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
        try {
          const { error } = await supabase
            .from('mentorias')
            .update({ estado: 'Cancelada' })
            .eq('id', id);
          if (error) throw error;
          await loadMentorias();
          setToastMsg({ text: 'Mentoría cancelada', type: 'success' });
        } catch (error) {
          console.error('Error canceling mentorship:', error);
          setToastMsg({ text: 'Error al cancelar mentoría', type: 'error' });
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

  const reminders = useMemo(() => {
    const items = [];

    if (sesionesHoy.length > 0) {
      const s = sesionesHoy[0];
      items.push({
        icon: Calendar,
        text: `Mentoría de ${s.materia || 'hoy'} - ${formatTime(s.fecha_solicitud)}`,
        color: 'bg-blue-100 text-blue-700'
      });
    }

    const pendingAll = [...sesionesHoy, ...proximasMentorias].filter(s => s.estado === 'Pendiente');
    if (pendingAll.length > 0) {
      const s = pendingAll[0];
      items.push({
        icon: Bell,
        text: `Solicitud pendiente: ${s.materia || 'Mentoría'} con ${s.mentor?.nombre_completo || 'mentor'}`,
        color: 'bg-orange-100 text-orange-700'
      });
    }

    return items;
  }, [sesionesHoy, proximasMentorias]);

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
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === today && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
      days.push(
        <button key={d}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${isToday ? 'bg-[#0f2a5c] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
          {d}
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
            <h1 className="text-2xl font-bold text-gray-800">Mis Mentorías ⭐</h1>
            <p className="text-gray-500 text-sm mt-2">Gestiona tus sesiones activas y agenda nuevas mentorías.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => openModal()}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              Agendar Mentoría
            </button>
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
                              {getInitials(session.mentor?.nombre_completo)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{session.mentor?.nombre_completo || 'Mentor'}</p>
                              <p className="text-gray-500 text-xs">{session.materia || 'Materia'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(session.modalidad || 'Virtual') === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {(session.modalidad || 'Virtual') === 'Virtual' ? (
                                <>
                                  <Video className="w-3 h-3 inline-block mr-1" /> Virtual
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-3 h-3 inline-block mr-1" /> Presencial
                                </>
                              )}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.estado === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {session.estado || 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate('/mensajes')}
                            className="bg-green-600 text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-green-700 transition">
                            Entrar
                          </button>
                          <button onClick={() => openModal(session)}
                            className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
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
                                {getInitials(session.mentor?.nombre_completo)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{session.mentor?.nombre_completo || 'Mentor'}</p>
                                <p className="text-gray-500 text-xs">{session.materia || 'Materia'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${(session.modalidad || 'Virtual') === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {(session.modalidad || 'Virtual') === 'Virtual' ? (
                                  <>
                                    <Video className="w-3 h-3 inline-block mr-1" /> {session.plataforma || 'Zoom'}
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="w-3 h-3 inline-block mr-1" /> {session.plataforma || 'Aula'}
                                  </>
                                )}
                              </span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{session.estado || 'Pendiente'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openModal(session)}
                              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1">
                              <RotateCcw className="w-4 h-4" />
                              Reprogramar
                            </button>
                            <button onClick={() => handleCancelUpcoming(session.id)}
                              className="border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition flex items-center gap-1">
                              <XIcon className="w-4 h-4" />
                              Cancelar
                            </button>
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
                  <p className="text-gray-500 text-sm">No hay sesiones programadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((session) => {
                    const sessionDate = new Date(session.fecha_solicitud);
                    return (
                      <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {getInitials(session.mentor?.nombre_completo)}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{session.materia || 'Materia'}</p>
                            <p className="text-gray-500 text-xs">{formatDate(session.fecha_solicitud)} • {session.mentor?.nombre_completo || 'Mentor'} • {session.modalidad || 'Virtual'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {session.estado || 'Cancelada'}
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
                <h4 className="font-medium text-gray-800">{currentMonth}</h4>
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
                <h4 className="font-medium text-gray-800 mb-4">Próxima mentoría</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                      {getInitials(proximasMentorias[0].mentor?.nombre_completo)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{proximasMentorias[0].materia}</p>
                      <p className="text-gray-500 text-xs">{proximasMentorias[0].mentor?.nombre_completo} • {formatDate(proximasMentorias[0].fecha_solicitud)}, {formatTime(proximasMentorias[0].fecha_solicitud)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Video className="w-4 h-4" /> {proximasMentorias[0].plataforma || 'Zoom'}
                  </div>
                  <button onClick={() => navigate('/mensajes')}
                    className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition">
                    Entrar a la sesión
                  </button>
                </div>
              </div>
            )}

            {/* REMINDERS WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-medium text-gray-800 mb-4">Recordatorios</h4>
              {reminders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay recordatorios pendientes.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={`p-2 rounded-lg ${reminder.color}`}>
                        <reminder.icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-700">{reminder.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* AGENDAR / REPROGRAMAR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => { setIsModalOpen(false); setEditingSession(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto z-40 relative" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingSession ? 'Reprogramar Mentoría' : 'Agendar Mentoría'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Seleccionar mentor</label>
                <select
                  value={mentorSeleccionado}
                  onChange={(e) => setMentorSeleccionado(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white"
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
                  placeholder="Ej: Álgebra Lineal"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
              </div>
              <div className="w-full mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <MaterialDatePicker
                  value={fechaSeleccionada}
                  onChange={(dateStr) => {
                    const date = dateStr ? new Date(dateStr + 'T12:00:00') : null;
                    setFechaSeleccionada(date);
                  }}
                  placeholder="Selecciona una fecha"
                />
              </div>
              <div className="w-full mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <div className="relative w-full">
                  <TimePicker
                    value={horaSeleccionada}
                    onChange={(value) => setHoraSeleccionada(value)}
                    placeholder="Selecciona una hora"
                    className="w-full bg-white pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0f2a5c] focus:ring-1 focus:ring-[#0f2a5c]"
                    format="hh:mm aa"
                    showMeridiem
                    cleanable={false}
                    block
                    size="lg"
                  />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setIsModalOpen(false); setEditingSession(null); }}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button onClick={handleCrearMentoria}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition">
                  {editingSession ? 'Guardar cambios' : 'Crear Mentoría'}
                </button>
              </div>
            </div>
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
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition ${
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
