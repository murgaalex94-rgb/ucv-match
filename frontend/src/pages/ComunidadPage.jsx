import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Heart, MessageCircle, Share2,
  Globe, Star
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth.jsx';

const posts = [
  {
    id: 1, author: 'Carlos Gómez', avatar: 'CG', role: 'Mentor Senior', time: 'hace 2h',
    content: '¡Acabo de publicar una nueva guía de Java Spring Boot! La encontrarán en la sección de Recursos. Incluye ejemplos prácticos de microservicios con Docker. 🚀',
    likes: 24, comments: 8, shares: 5, tags: ['#Java', '#SpringBoot', '#Microservicios']
  },
  {
    id: 2, author: 'María Fernández', avatar: 'MF', role: 'Mentor Senior', time: 'hace 5h',
    content: 'Recordatorio: Este sábado tendremos el taller de Álgebra Lineal a las 10am. Inscribanse en el link de la descripción. Cupos limitados.',
    likes: 18, comments: 12, shares: 3, tags: ['#Álgebra', '#Taller', '#Matemáticas']
  },
  {
    id: 3, author: 'Ana Torres', avatar: 'AT', role: 'Mentor Senior', time: 'hace 1d',
    content: 'Comparto este dataset de Kaggle para practicar Machine Learning. Ideal para quienes están empezando en Data Science. ¿Alguien más participa en competencias? 🤖',
    likes: 32, comments: 15, shares: 10, tags: ['#DataScience', '#ML', '#Kaggle']
  },
  {
    id: 4, author: 'Roberto Silva', avatar: 'RS', role: 'Mentor Senior', time: 'hace 2d',
    content: 'Felicitaciones a nuestros mentores del mes! 🌟 Sigan inspirando a más estudiantes a alcanzar sus metas académicas.',
    likes: 45, comments: 9, shares: 12, tags: ['#Reconocimiento', '#Mentores']
  },
];

const events = [
  { id: 1, title: 'Taller de Álgebra Lineal', date: 'Sáb 19 Jul', time: '10:00 AM', attendees: 45, type: 'Taller' },
  { id: 2, title: 'Webinar: Introducción a IA', date: 'Lun 21 Jul', time: '6:00 PM', attendees: 89, type: 'Webinar' },
  { id: 3, title: 'Hackathon UCV Match', date: 'Vie 25 Jul', time: '9:00 AM', attendees: 120, type: 'Evento' },
];

const topMentors = [
  { name: 'Carlos Gómez', specialty: 'Java, Spring Boot', rating: 5.0, mentees: 28 },
  { name: 'María Fernández', specialty: 'Álgebra, Cálculo', rating: 4.9, mentees: 22 },
  { name: 'Ana Torres', specialty: 'Data Science, Python', rating: 4.8, mentees: 19 },
];

export default function ComunidadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.nombre || 'Usuario';
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Comunidad 🌟</h1>
            <p className="text-gray-500 text-sm">Comparte conocimientos, participa en eventos y conecta con otros miembros.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar en la comunidad..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
            </div>
            <Header nombreUsuario={userName} initials={initials} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-sm font-bold">AM</div>
                <input type="text" placeholder="Comparte algo con la comunidad..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" />
              </div>
              <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><Image className="w-4 h-4" /> Foto</button>
                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><Globe className="w-4 h-4" /> Publicar</button>
              </div>
            </div>

            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{post.author}</p>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">{post.role}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{post.time}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-[#0f2a5c] font-medium">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" /> {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" /> {post.comments}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" /> {post.shares}
                  </button>
                </div>
              </article>
            ))}
          </main>

          <aside className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24 h-fit">
              <h4 className="font-medium text-gray-800 mb-4">Próximos Eventos</h4>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center bg-[#0f2a5c] text-white rounded-xl p-2 min-w-[50px]">
                      <span className="text-xs font-bold">{event.date.split(' ')[1]}</span>
                      <span className="text-[10px]">{event.date.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
                      <p className="text-[11px] text-gray-500">{event.time} • {event.attendees} asistentes</p>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">{event.type}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-[#0f2a5c] font-medium text-center">Ver todos los eventos</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h4 className="font-medium text-gray-800 mb-4">Top Mentores</h4>
              <div className="space-y-4">
                {topMentors.map((mentor, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{mentor.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{mentor.specialty}</p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-500 fill-current" />{mentor.rating}</span>
                        <span>{mentor.mentees} mentees</span>
                      </div>
                    </div>
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


