import React, { useState } from 'react';
import {
  Bell, Search,
  ChevronDown, User, Video, Code,
  TrendingUp, Clock, CheckCircle, Star,
  RotateCcw,
  Plus, ChevronLeft, ChevronRight, Download, Copy, MoreHorizontal,
  FileVideo, FileText, Globe, Heart,
  Folder, Calendar, Cloud
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const resources = [
  {
    id: 1,
    title: 'Guía completa de Java Spring Boot',
    description: 'Guía completa desde cero hasta producción con Spring Boot 3.x, microservicios y despliegue en la nube.',
    author: 'Carlos Gómez',
    avatar: 'CG',
    type: 'PDF',
    category: 'Programación',
    downloads: 128,
    date: '14 Jul 2026',
    tags: ['Java', 'Spring Boot', 'Backend']
  },
  {
    id: 2,
    title: 'Cálculo Integral - Apuntes completos',
    description: 'Apuntes detallados de cálculo integral con ejercicios resueltos paso a paso para universitarios.',
    author: 'María Fernández',
    avatar: 'MF',
    type: 'PDF',
    category: 'Matemáticas',
    downloads: 95,
    date: '12 Jul 2026',
    tags: ['Cálculo', 'Universitario', 'Ejercicios']
  },
  {
    id: 3,
    title: 'Programación Java - Curso completo',
    description: 'Curso completo de Java desde cero hasta nivel avanzado con proyectos reales y mejores prácticas.',
    author: 'José Ramírez',
    avatar: 'JR',
    type: 'MP4',
    category: 'Programación',
    downloads: 87,
    date: '10 Jul 2026',
    tags: ['Java', 'POO', 'Backend']
  },
  {
    id: 4,
    title: 'Álgebra Lineal - Apuntes y ejercicios',
    description: 'Apuntes completos de álgebra lineal con matrices, vectores, espacios vectoriales y ejercicios resueltos.',
    author: 'María Fernández',
    avatar: 'MF',
    type: 'PDF',
    category: 'Matemáticas',
    downloads: 95,
    date: '08 Jul 2026',
    tags: ['Álgebra', 'Matrices', 'Vectores']
  },
  {
    id: 5,
    title: 'Python para Data Science - Curso completo',
    description: 'Curso completo de Python para análisis de datos: Pandas, NumPy, Matplotlib, Scikit-learn y proyectos reales.',
    author: 'Ana Torres',
    avatar: 'AT',
    type: 'MP4',
    category: 'Ciencias de Datos',
    downloads: 112,
    date: '05 Jul 2026',
    tags: ['Python', 'Data Science', 'Machine Learning']
  },
  {
    id: 6,
    title: 'Bases de Datos SQL - Guía práctica',
    description: 'Guía práctica de SQL desde consultas básicas hasta optimización avanzada y procedimientos almacenados.',
    author: 'José Ramírez',
    avatar: 'JR',
    type: 'PDF',
    category: 'Bases de Datos',
    downloads: 87,
    date: '05 Jul 2026',
    tags: ['SQL', 'MySQL', 'PostgreSQL', 'Optimización']
  },
  {
    id: 7,
    title: 'Diseño de Algoritmos - Complejidad y optimización',
    description: 'Guía completa de algoritmos: ordenamiento, búsqueda, grafos, programación dinámica y complejidad.',
    author: 'Roberto Silva',
    avatar: 'RS',
    type: 'PDF',
    category: 'Algoritmos',
    downloads: 76,
    date: '03 Jul 2026',
    tags: ['Algoritmos', 'Complejidad', 'Estructuras de datos']
  },
  {
    id: 8,
    title: 'Fundamentos de Redes - TCP/IP y Protocolos',
    description: 'Guía completa de redes: modelo OSI, TCP/IP, routing, switching, seguridad y troubleshooting.',
    author: 'Laura Mendoza',
    avatar: 'LM',
    type: 'PDF',
    category: 'Redes',
    downloads: 45,
    date: '01 Jul 2026',
    tags: ['Redes', 'TCP/IP', 'Seguridad', 'Protocolos']
  },
  {
    id: 9,
    title: 'JavaScript Moderno - ES6+ y frameworks',
    description: 'Guía completa de JavaScript moderno: ES6+, async/await, modules, bundlers y mejores prácticas.',
    author: 'Roberto Silva',
    avatar: 'RS',
    type: 'MP4',
    category: 'Programación',
    downloads: 93,
    date: '28 Jun 2026',
    tags: ['JavaScript', 'ES6+', 'Frontend', 'Node.js']
  }
];

const categories = [
  { name: 'Programación', count: 42, color: 'bg-blue-100 text-blue-700' },
  { name: 'Matemáticas', count: 38, color: 'bg-green-100 text-green-700' },
  { name: 'Bases de Datos', count: 18, color: 'bg-orange-100 text-orange-700' },
  { name: 'Algoritmos', count: 14, color: 'bg-purple-100 text-purple-700' },
  { name: 'Redes', count: 9, color: 'bg-pink-100 text-pink-700' },
  { name: 'Otros', count: 7, color: 'bg-gray-100 text-gray-700' }
];

const recentResources = [
  { title: 'Guía completa de Java Spring Boot', date: '14 Jul 2026', time: '10:30' },
  { title: 'Cálculo Integral - Apuntes completos', date: '12 Jul 2026', time: '09:15' },
  { title: 'Programación Java - Curso completo', date: '10 Jul 2026', time: '14:20' }
];

export default function RecursosPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [courseFilter, setCourseFilter] = useState('Todos');
  const [formatFilter, setFormatFilter] = useState('Todos');
  const [activeTab, setActiveTab] = useState('todos');

  const tabs = [
    { id: 'todos', label: 'Todos los recursos' },
    { id: 'recientes', label: 'Recientes' },
    { id: 'descargados', label: 'Más descargados' },
    { id: 'favoritos', label: 'Favoritos' },
    { id: 'mios', label: 'Mis recursos' }
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return { icon: FileText, color: 'bg-red-100 text-red-600', label: 'PDF' };
      case 'MP4': return { icon: FileVideo, color: 'bg-blue-100 text-blue-600', label: 'MP4' };
      case 'DOC': return { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'DOC' };
      case 'TXT': return { icon: FileText, color: 'bg-gray-100 text-gray-600', label: 'TXT' };
      case 'PPT': return { icon: FileText, color: 'bg-orange-100 text-orange-600', label: 'PPT' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-600', label: 'FILE' };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      
      <Sidebar />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        
        {/* TOPBAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Recursos 📖</h1>
            <p className="text-gray-500 text-sm mt-1">Explora materiales de estudio, guías, apuntes y más recursos para tu aprendizaje.</p>
          </div>
          <button className="bg-[#0f2a5c] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-[#0f2a5c]/90 transition">
            <Plus className="w-4 h-4" />
            Subir Recurso
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, color: 'bg-purple-100 text-purple-600', title: 'Total de Recursos', value: '128', change: '↑ 18% este mes' },
                { icon: Download, color: 'bg-green-100 text-green-600', title: 'Descargados', value: '342', change: '↑ 22% este mes' },
                { icon: Star, color: 'bg-yellow-100 text-yellow-600', title: 'Mis Favoritos', value: '15', change: '↑ 12% este mes' },
                { icon: Cloud, color: 'bg-blue-100 text-blue-600', title: 'Mis Subidos', value: '8', change: '↑ 5% este mes' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{stat.title}</p>
                      <p className="text-green-600 text-xs mt-1">{stat.change}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recursos por título, tema o curso..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todos">Tipo</option>
              <option value="PDF">PDF</option>
              <option value="MP4">MP4</option>
              <option value="DOC">DOC</option>
              <option value="TXT">TXT</option>
              <option value="PPT">PPT</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todos">Curso</option>
              <option value="Programación">Programación</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Ciencias de Datos">Ciencias de Datos</option>
              <option value="Bases de Datos">Bases de Datos</option>
            </select>
            <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
              <option value="Todos">Formato</option>
              <option value="PDF">PDF</option>
              <option value="MP4">Video</option>
              <option value="DOC">Documento</option>
              <option value="TXT">Texto</option>
              <option value="PPT">Presentación</option>
            </select>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#0f2a5c] transition-colors bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['Todos los recursos', 'Recientes', 'Más descargados', 'Favoritos', 'Mis recursos'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {}}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                idx === 0
                  ? 'text-[#0f2a5c] border-b-2 border-[#0f2a5c]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="lg:col-span-3 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource) => {
                const fileInfo = getFileIcon(resource.type);
                return (
                  <article key={resource.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center">
                      <div className="flex items-start gap-4 w-full xl:w-48 flex-shrink-0">
                        <div className={`p-4 rounded-xl ${fileInfo.color}`}>
                          <fileInfo.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{fileInfo.label}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                              {resource.avatar}
                            </div>
                            <span className="text-xs text-gray-500">{resource.author}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">{resource.title}</h4>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-2">{resource.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${resource.category === 'Programación' ? 'bg-blue-100 text-blue-700' : resource.category === 'Matemáticas' ? 'bg-green-100 text-green-700' : resource.category === 'Bases de Datos' ? 'bg-orange-100 text-orange-700' : resource.category === 'Algoritmos' ? 'bg-purple-100 text-purple-700' : resource.category === 'Redes' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'}`}>
                            {resource.category}
                          </span>
                          {resource.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs text-gray-600 bg-gray-100">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{resource.date}</span>
                          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloads}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full xl:w-auto flex-shrink-0">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><Copy className="w-4 h-4" /></button>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <button className="bg-[#0f2a5c] text-white px-8 py-3 rounded-xl font-medium text-base flex items-center justify-center gap-2 mx-auto hover:bg-[#0f2a5c]/90 transition">
                Cargar más recursos
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </main>

          <aside className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 h-fit">
              <h4 className="font-medium text-gray-800 mb-4 capitalize">Julio 2026</h4>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => <div key={d} className="text-xs font-medium">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>

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
                <div className="flex items-center gap-2 text-gray-500 text-xs"><Video className="w-4 h-4" /> Zoom</div>
                <button className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition">Entrar a la sesión</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-medium text-gray-800 mb-4">Recordatorios</h4>
              <div className="space-y-3">
                {[
                  { icon: Calendar, text: 'Mentoría de Matemática II en 30 minutos', color: 'bg-blue-100 text-blue-700' },
                  { icon: Bell, text: 'Nueva mentoría disponible: Física Cuántica', color: 'bg-orange-100 text-orange-700' }
                ].map((reminder, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className={`p-2 rounded-lg ${reminder.color}`}><reminder.icon className="w-4 h-4" /></div>
                    <p className="text-sm text-gray-700">{reminder.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function renderCalendarDays() {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const today = new Date().getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />);
  }
  for (let d = 1; d <= 31; d++) {
    const isToday = d === today;
    days.push(
      <button
        key={d}
        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
          isToday ? 'bg-[#0f2a5c] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        {d}
      </button>
    );
  }
  return days;
}

