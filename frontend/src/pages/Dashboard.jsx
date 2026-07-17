import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Search, Menu, 
  ArrowRight, ChevronDown, User, Video, Code, 
  TrendingUp, Clock, CheckCircle, Star,
  BookOpen, Users, Calendar, MessageSquare, School
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      
      <Sidebar />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        
        {/* TOPBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">¡Buenos días, Alex! 👋</h1>
            <p className="text-gray-500 text-sm">Bienvenido nuevamente a UCV Match. Continúa aprendiendo y creciendo.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar mentores, temas..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]"
              />
            </div>
            <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer">
              <div className="w-8 h-8 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">AM</div>
              <span className="text-sm font-medium text-gray-700">Alex Murga</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Mentorías Activas', value: '12', change: '20%', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Mentores Disponibles', value: '185', change: '15%', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
            { title: 'Próxima Mentoría', value: 'Hoy, 3:00 PM', subtitle: 'Matemática II', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  {card.subtitle && <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>}
                  {card.change && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {card.change} este mes
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-medium text-gray-800 mb-4">Accesos rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { icon: Search, label: 'Buscar Mentor', color: 'text-blue-600' },
              { icon: Calendar, label: 'Agendar Mentoría', color: 'text-orange-500' },
              { icon: MessageSquare, label: 'Mis Chats', color: 'text-purple-600', badge: 1 },
              { icon: BookOpen, label: 'Recursos', color: 'text-green-600' },
              { icon: School, label: 'Mis Cursos', color: 'text-indigo-600' },
              { icon: Users, label: 'Comunidad', color: 'text-pink-600' },
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <div className={`mb-2 ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-600 text-center font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* PRÓXIMAS MENTORÍAS Y MENTORES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Mentorías */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Próximas mentorías</h3>
              <button className="text-xs text-[#0f2a5c] font-medium">Ver todas</button>
            </div>
            <div className="space-y-4">
              {[
                { time: 'Hoy, 3:00 PM', title: 'Matemática II', mentor: 'Con Carlos Gómez', icon: Code, color: 'bg-purple-50 text-purple-600' },
                { time: 'Mañana, 8:00 PM', title: 'Programación Java', mentor: 'Con José Ramírez', icon: Code, color: 'bg-green-50 text-green-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time} • {item.mentor}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Mentores Recomendados */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Mentores recomendados</h3>
              <button className="text-xs text-[#0f2a5c] font-medium">Ver todos</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Carlos Gómez', specialty: 'Java, Spring Boot', rating: '5.0' },
                { name: 'María Fernández', specialty: 'Matemáticas, Álgebra', rating: '4.8' },
              ].map((mentor, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-xl flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center text-xs font-bold text-gray-500">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <p className="text-sm font-medium text-gray-800">{mentor.name}</p>
                  <p className="text-[10px] text-gray-500 mb-2">{mentor.specialty}</p>
                  <button className="w-full bg-gray-100 text-gray-600 text-xs py-1.5 rounded-lg hover:bg-gray-200">
                    Ver Perfil
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}