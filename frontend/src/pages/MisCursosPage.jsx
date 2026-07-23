import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Play, Clock, CheckCircle, Star,
  TrendingUp, Download, Video
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth.jsx';

const courses = [
  {
    id: 1, title: 'Programación Java Avanzada', mentor: 'José Ramírez', avatar: 'JR',
    progress: 75, modules: 12, completedModules: 9, hours: '24h',
    nextClass: 'Mañana, 8:00 PM', status: 'active', color: 'bg-orange-500',
    category: 'Programación', rating: 4.9
  },
  {
    id: 2, title: 'Matemática II - Cálculo Integral', mentor: 'Carlos Gómez', avatar: 'CG',
    progress: 45, modules: 10, completedModules: 4, hours: '18h',
    nextClass: 'Hoy, 3:00 PM', status: 'active', color: 'bg-blue-500',
    category: 'Matemáticas', rating: 5.0
  },
  {
    id: 3, title: 'Álgebra Lineal', mentor: 'María Fernández', avatar: 'MF',
    progress: 100, modules: 8, completedModules: 8, hours: '20h',
    nextClass: 'Completado', status: 'completed', color: 'bg-green-500',
    category: 'Matemáticas', rating: 4.8
  },
  {
    id: 4, title: 'Python para Data Science', mentor: 'Ana Torres', avatar: 'AT',
    progress: 20, modules: 15, completedModules: 3, hours: '30h',
    nextClass: 'Viernes, 5:00 PM', status: 'active', color: 'bg-purple-500',
    category: 'Ciencias de Datos', rating: 4.7
  },
  {
    id: 5, title: 'JavaScript Moderno', mentor: 'Roberto Silva', avatar: 'RS',
    progress: 0, modules: 10, completedModules: 0, hours: '15h',
    nextClass: 'Por iniciar', status: 'pending', color: 'bg-yellow-500',
    category: 'Programación', rating: 4.6
  },
];

export default function MisCursosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.nombre || 'Usuario';
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const [filter, setFilter] = useState('todos');

  const filteredCourses = filter === 'todos' ? courses : courses.filter(c => c.status === filter);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mis Cursos 📚</h1>
            <p className="text-gray-500 text-sm">Da seguimiento a tus cursos activos y completa tu plan de aprendizaje.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar cursos..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
            </div>
            <Header nombreUsuario={userName} initials={initials} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Cursos Activos', value: '3', icon: Play, color: 'bg-blue-100 text-blue-600' },
            { label: 'Completados', value: '1', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
            { label: 'Horas de Estudio', value: '62h', icon: Clock, color: 'bg-purple-100 text-purple-600' },
            { label: 'Progreso General', value: '48%', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'active', label: 'Activos' },
            { id: 'completed', label: 'Completados' },
            { id: 'pending', label: 'Por iniciar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.id ? 'bg-[#0f2a5c] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 ${course.color}`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{course.avatar}</div>
                    <div>
                      <span className="text-xs text-gray-400">{course.mentor}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    course.status === 'active' ? 'bg-green-100 text-green-700' :
                    course.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {course.status === 'active' ? 'Activo' : course.status === 'completed' ? 'Completado' : 'Por iniciar'}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-800 text-sm mb-3">{course.title}</h3>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${course.color}`} style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{course.completedModules}/{course.modules} módulos</span>
                  <span>{course.hours} total</span>
                </div>

                {course.status === 'active' && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-blue-700 font-medium">Próxima clase:</p>
                    <p className="text-xs text-blue-600">{course.nextClass}</p>
                  </div>
                )}

                <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                  course.status === 'active'
                    ? 'bg-[#0f2a5c] text-white hover:bg-[#0f2a5c]/90'
                    : course.status === 'completed'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-[#0f2a5c] text-white hover:bg-[#0f2a5c]/90'
                }`}>
                  {course.status === 'active' ? 'Continuar curso' : course.status === 'completed' ? 'Ver resumen' : 'Iniciar curso'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
