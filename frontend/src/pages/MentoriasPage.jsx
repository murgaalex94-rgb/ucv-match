import React, { useState, useEffect } from 'react';
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
import Sidebar from '../components/Sidebar';

const defaultUpcoming = [
  {
    id: 2, day: 'Viernes', date: '18', month: 'Jul', time: '5:00 PM',
    mentor: 'María Fernández', subject: 'Álgebra Lineal', avatar: 'MF',
    mode: 'Virtual', platform: 'Zoom', status: 'pending'
  },
  {
    id: 3, day: 'Lunes', date: '21', month: 'Jul', time: '8:00 PM',
    mentor: 'José Ramírez', subject: 'Programación Java', avatar: 'JR',
    mode: 'Presencial', platform: 'Aula 305', status: 'pending'
  },
  {
    id: 4, day: 'Miércoles', date: '23', month: 'Jul', time: '10:00 AM',
    mentor: 'Ana Torres', subject: 'Python Data Science', avatar: 'AT',
    mode: 'Virtual', platform: 'Google Meet', status: 'pending'
  }
];

const defaultHistory = [
  { id: 5, date: '12 Jul', mentor: 'Carlos Gómez', subject: 'Cálculo Integral', avatar: 'CG', mode: 'Virtual', platform: 'Zoom', status: 'completed', rating: 5.0 },
  { id: 6, date: '05 Jul', mentor: 'José Ramírez', subject: 'Bases de Datos', avatar: 'JR', mode: 'Presencial', platform: 'Aula 201', status: 'completed', rating: 4.8 },
  { id: 7, date: '28 Jun', mentor: 'María Fernández', subject: 'Álgebra Lineal', avatar: 'MF', mode: 'Virtual', platform: 'Google Meet', status: 'completed', rating: 5.0 }
];

function MentoriasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({ mentor: '', materia: '', fecha: '', hora: '' });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mentorship_requests') || '[]');
    setPendingRequests(stored);
    const up = JSON.parse(localStorage.getItem('upcoming_sessions'));
    if (up) { setUpcomingSessions(up); } else { setUpcomingSessions(defaultUpcoming); }
    const hist = JSON.parse(localStorage.getItem('mentorship_history'));
    if (hist) { setHistorySessions(hist); } else { setHistorySessions(defaultHistory); }
  }, []);

  const persistUpcoming = (list) => {
    localStorage.setItem('upcoming_sessions', JSON.stringify(list));
    setUpcomingSessions(list);
  };

  const persistHistory = (list) => {
    localStorage.setItem('mentorship_history', JSON.stringify(list));
    setHistorySessions(list);
  };

  const handleCancelRequest = (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta solicitud?')) return;
    const updated = pendingRequests.filter(r => r.id !== id);
    setPendingRequests(updated);
    localStorage.setItem('mentorship_requests', JSON.stringify(updated));
  };

  const openModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({ mentor: session.mentor, materia: session.subject, fecha: session.date, hora: session.time });
    } else {
      setEditingSession(null);
      setFormData({ mentor: '', materia: '', fecha: '', hora: '' });
    }
    setIsModalOpen(true);
  };

  const handleCrearMentoria = () => {
    if (!formData.mentor || !formData.materia || !formData.fecha || !formData.hora) return;
    if (editingSession) {
      const list = upcomingSessions.map(s =>
        s.id === editingSession.id
          ? { ...s, mentor: formData.mentor, subject: formData.materia, date: formData.fecha, time: formData.hora }
          : s
      );
      persistUpcoming(list);
    } else {
      const list = [...upcomingSessions, {
        id: Date.now(),
        mentor: formData.mentor,
        subject: formData.materia,
        date: formData.fecha,
        time: formData.hora,
        day: new Date(formData.fecha).toLocaleDateString('es-ES', { weekday: 'long' }),
        month: new Date(formData.fecha).toLocaleDateString('es-ES', { month: 'short' }),
        avatar: formData.mentor.split(' ').map(n => n[0]).join(''),
        mode: 'Virtual',
        platform: 'Por confirmar',
        status: 'pending'
      }];
      persistUpcoming(list);
    }
    setFormData({ mentor: '', materia: '', fecha: '', hora: '' });
    setEditingSession(null);
    setIsModalOpen(false);
  };

  const handleCancelUpcoming = (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta mentoría?')) return;
    const list = upcomingSessions.filter(s => s.id !== id);
    persistUpcoming(list);
  };

  const handleCompleteSession = (session) => {
    const completed = { ...session, status: 'completed', rating: 5.0 };
    persistUpcoming(upcomingSessions.filter(s => s.id !== session.id));
    persistHistory([...historySessions, completed]);
  };

  const todaySessions = [
    {
      id: 1, time: '3:00 PM', label: 'Hoy',
      mentor: 'Carlos Gómez', subject: 'Matemática II', avatar: 'CG',
      mode: 'Virtual', status: 'active', room: 'Zoom: ucv-match-12345'
    }
  ];

  const reminders = [
    { icon: Calendar, text: 'Mentoría de Matemática II en 30 minutos', color: 'bg-blue-100 text-blue-700' },
    { icon: Bell, text: 'Nueva mentoría disponible: Física Cuántica', color: 'bg-orange-100 text-orange-700' }
  ];

  const currentMonth = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
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

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis Mentorías ⭐</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona tus sesiones activas y agenda nuevas mentorías.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            Agendar Mentoría
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por mentor o curso"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todos">Estado</option>
              <option value="Activas">Activas</option>
              <option value="Pendientes">Pendientes</option>
              <option value="Completadas">Completadas</option>
              <option value="Canceladas">Canceladas</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todos">Curso</option>
              <option value="Matemática II">Matemática II</option>
              <option value="Álgebra Lineal">Álgebra Lineal</option>
              <option value="Programación Java">Programación Java</option>
              <option value="Python Data Science">Python Data Science</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todas">Fecha</option>
              <option value="Hoy">Hoy</option>
              <option value="Esta semana">Esta semana</option>
              <option value="Este mes">Este mes</option>
            </select>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0f2a5c] transition-colors bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT CONTENT */}
          <main className="lg:col-span-3 space-y-8 min-w-0">
            
            {/* SESIONES DE HOY */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Sesiones de hoy</h3>
              <div className="space-y-4">
                {todaySessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center bg-[#0f2a5c] text-white rounded-xl p-3 min-w-[70px]">
                          <span className="text-xl font-bold">{session.time}</span>
                          <span className="text-xs text-blue-100">{session.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {session.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{session.mentor}</p>
                            <p className="text-gray-500 text-xs">{session.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.mode === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {session.mode === 'Virtual' ? (
                              <>
                                <Video className="w-3 h-3 inline-block mr-1" /> Virtual
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 inline-block mr-1" /> Presencial
                              </>
                            )}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Activa</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/mensajes')}
                          className="bg-green-600 text-white px-5 py-2 rounded-xl font-medium text-sm hover:bg-green-700 transition">
                          Entrar
                        </button>
                        <button className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SOLICITUDES PENDIENTES */}
            {pendingRequests.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Solicitudes pendientes</h3>
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center bg-orange-50 rounded-xl p-3 min-w-[60px]">
                            <Send className="w-5 h-5 text-orange-600" />
                            <span className="text-[10px] text-orange-600 font-medium mt-1">Pendiente</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {req.mentorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{req.mentorName}</p>
                              <p className="text-gray-500 text-xs">{req.subject} • Solicitado el {req.date}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition"
                          >
                            Cancelar solicitud
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* PRÓXIMAS MENTORÍAS */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas mentorías</h3>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center bg-gray-100 rounded-xl p-3 min-w-[60px]">
                          <span className="text-xl font-bold text-gray-800">{session.date}</span>
                          <span className="text-xs text-gray-500 capitalize">{session.day}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                            {session.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{session.mentor}</p>
                            <p className="text-gray-500 text-xs">{session.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.mode === 'Virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {session.mode === 'Virtual' ? (
                              <>
                                <Video className="w-3 h-3 inline-block mr-1" /> {session.platform}
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 inline-block mr-1" /> {session.platform}
                              </>
                            )}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pendiente</span>
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
                ))}
              </div>
            </section>

            {/* HISTORIAL DE MENTORÍAS */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Historial de mentorías</h3>
                <button className="text-xs text-[#0f2a5c] font-medium">Ver todas</button>
              </div>
              <div className="space-y-4">
                {historySessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                        {session.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{session.subject}</p>
                        <p className="text-gray-500 text-xs">{session.date} • {session.mentor} • {session.mode}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Completada</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <StarIcon className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{session.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* RIGHT SIDEBAR WIDGETS */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            {/* CALENDAR WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800 capitalize">{currentMonth}</h4>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-1 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-medium text-gray-800 mb-4">Próxima mentoría</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">MF</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Álgebra Lineal</p>
                    <p className="text-gray-500 text-xs">María Fernández • Viernes 18 Jul, 5:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Video className="w-4 h-4" /> Zoom
                </div>
                <button onClick={() => navigate('/mensajes')}
                  className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition">
                  Entrar a la sesión
                </button>
              </div>
            </div>

            {/* REMINDERS WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-medium text-gray-800 mb-4">Recordatorios</h4>
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
            </div>
          </aside>
        </div>
      </div>

      {/* AGENDAR / REPROGRAMAR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setIsModalOpen(false); setEditingSession(null); }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingSession ? 'Reprogramar Mentoría' : 'Agendar Mentoría'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del mentor</label>
                <input
                  type="text"
                  value={formData.mentor}
                  onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                  placeholder="Ej: Carlos Gómez"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Hora</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                />
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
    </div>
  );
}


export default MentoriasPage;
