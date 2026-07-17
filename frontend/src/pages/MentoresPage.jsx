import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Star, Clock, User, ChevronDown, 
  Award, TrendingUp, Users, X, Send
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const mentors = [
  {
    id: 1, name: 'Carlos Gómez', specialty: 'Java, Spring Boot, Microservicios',
    status: 'available', rating: 5.0, reviews: 128,
    description: 'Ingeniero de software con 10 años de experiencia en desarrollo backend. Especialista en arquitecturas cloud y microservicios.',
    responseTime: '2h', skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
    area: 'Programación'
  },
  {
    id: 2, name: 'María Fernández', specialty: 'Matemáticas, Álgebra, Cálculo',
    status: 'available', rating: 4.8, reviews: 95,
    description: 'Profesora universitaria con 15 años de experiencia. Especialista en preparación para exámenes de ingreso y cursos universitarios.',
    responseTime: '1h', skills: ['Álgebra', 'Cálculo', 'Estadística', 'Geometría'],
    area: 'Matemáticas'
  },
  {
    id: 3, name: 'José Ramírez', specialty: 'Java, Spring Boot, Angular',
    status: 'soon', rating: 4.9, reviews: 87,
    description: 'Full Stack Developer con 8 años de experiencia. Mentor certificado en Java y frameworks modernos de frontend.',
    responseTime: '3h', skills: ['Java', 'Spring Boot', 'Angular', 'TypeScript', 'PostgreSQL'],
    area: 'Programación'
  },
  {
    id: 4, name: 'Ana Torres', specialty: 'Python, Data Science, Machine Learning',
    status: 'available', rating: 4.7, reviews: 112,
    description: 'Data Scientist con experiencia en proyectos de ML en producción. Experta en Python, Pandas, Scikit-learn y TensorFlow.',
    responseTime: '4h', skills: ['Python', 'Pandas', 'TensorFlow', 'Scikit-learn', 'SQL'],
    area: 'Ciencias de Datos'
  },
  {
    id: 5, name: 'Roberto Silva', specialty: 'JavaScript, React, Node.js',
    status: 'available', rating: 4.6, reviews: 93,
    description: 'Full Stack Developer especializado en ecosistema JavaScript. Experiencia en startups y proyectos enterprise.',
    responseTime: '2h', skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'GraphQL'],
    area: 'Programación'
  },
  {
    id: 6, name: 'Laura Mendoza', specialty: 'Estadística, R, SPSS, Análisis de datos',
    status: 'soon', rating: 4.5, reviews: 67,
    description: 'Estadística con experiencia en investigación académica y análisis de datos para tesis y publicaciones científicas.',
    responseTime: '5h', skills: ['R', 'SPSS', 'Estadística', 'Investigación', 'Academia'],
    area: 'Ciencias de Datos'
  },
  {
    id: 7, name: 'Pedro Castillo', specialty: 'Física, Mecánica Clásica, Termodinámica',
    status: 'available', rating: 4.4, reviews: 54,
    description: 'Físico con experiencia en docencia universitaria. Apasionado por la enseñanza de ciencias exactas.',
    responseTime: '3h', skills: ['Física', 'Mecánica', 'Termodinámica', 'Óptica'],
    area: 'Ciencias'
  },
  {
    id: 8, name: 'Sofía Vega', specialty: 'Diseño UX/UI, Figma, Adobe XD',
    status: 'available', rating: 4.9, reviews: 73,
    description: 'Diseñadora senior con experiencia en productos digitales. Especialista en design systems y prototipado.',
    responseTime: '1h', skills: ['Figma', 'Adobe XD', 'UX Research', 'Prototyping'],
    area: 'Diseño'
  },
  {
    id: 9, name: 'Diego Ramos', specialty: 'Inglés Avanzado, TOEFL, IELTS',
    status: 'soon', rating: 4.7, reviews: 89,
    description: 'Profesor de inglés certificado con 12 años de experiencia. Especialista en preparación de exámenes internacionales.',
    responseTime: '2h', skills: ['Inglés', 'TOEFL', 'IELTS', 'Business English'],
    area: 'Idiomas'
  },
  {
    id: 10, name: 'Valeria Ruiz', specialty: 'Administración, Marketing Digital',
    status: 'available', rating: 4.3, reviews: 61,
    description: 'MBA con especialización en marketing digital. Experta en estrategias de contenido y redes sociales.',
    responseTime: '4h', skills: ['Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    area: 'Negocios'
  },
  {
    id: 11, name: 'Fernando Guzmán', specialty: 'Arquitectura, AutoCAD, Revit',
    status: 'available', rating: 4.6, reviews: 48,
    description: 'Arquitecto con experiencia en diseño arquitectónico y modelado BIM. Mentor de estudiantes de arquitectura.',
    responseTime: '5h', skills: ['AutoCAD', 'Revit', 'SketchUp', 'Arquitectura'],
    area: 'Ingeniería'
  },
  {
    id: 12, name: 'Carmen Flores', specialty: 'Química Orgánica, Bioquímica',
    status: 'soon', rating: 4.8, reviews: 76,
    description: 'Química farmacéutica con experiencia en investigación. Apasionada por la divulgación científica.',
    responseTime: '3h', skills: ['Química', 'Bioquímica', 'Laboratorio', 'Farmacología'],
    area: 'Ciencias'
  },
];

const knowledgeAreas = [
  'Programación', 'Matemáticas', 'Ciencias', 'Ingeniería', 
  'Ciencias de Datos', 'Diseño', 'Idiomas', 'Negocios'
];

const skillsOptions = [
  'Java', 'Python', 'JavaScript', 'React', 'Spring Boot',
  'Node.js', 'SQL', 'AWS', 'Docker',
  'Kubernetes', 'Machine Learning', 'Data Science', 'Estadística',
  'Álgebra', 'Cálculo', 'Física', 'Química', 'Inglés'
];

const ITEMS_PER_PAGE = 6;

export default function MentoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [area, setArea] = useState('');
  const [habilidad, setHabilidad] = useState('');
  const [studyLevel, setStudyLevel] = useState('');
  const [availability, setAvailability] = useState('');
  const [calificacion, setCalificacion] = useState('');
  const [sortBy, setSortBy] = useState('populares');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [profileModal, setProfileModal] = useState(null);

  const navigate = useNavigate();

  const ratingOptions = [
    { value: '', label: 'Cualquiera' },
    { value: '5.0', label: '5.0' },
    { value: '4.0', label: '4.0 o más' },
    { value: '3.0', label: '3.0 o más' }
  ];

  const studyLevelOptions = [
    'Universitario', 'Posgrado', 'Secundaria', 'Técnico', 'Autodidacta'
  ];

  const availabilityOptions = [
    'Mañana', 'Tarde', 'Noche', 'Fines de semana', 'Flexible'
  ];

  const filteredMentors = useMemo(() => {
    let result = mentors.filter((mentor) => {
      const matchSearch = !searchTerm || mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) || mentor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchArea = !area || mentor.area === area;
      const matchHabilidad = !habilidad || mentor.skills.some(s => s.toLowerCase() === habilidad.toLowerCase());
      const matchRating = !calificacion || mentor.rating >= parseFloat(calificacion);
      return matchSearch && matchArea && matchHabilidad && matchRating;
    });

    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [searchTerm, area, habilidad, calificacion, sortBy]);

  const totalPages = Math.ceil(filteredMentors.length / ITEMS_PER_PAGE);
  const paginatedMentors = filteredMentors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm(''); setArea(''); setHabilidad(''); setStudyLevel('');
    setAvailability(''); setCalificacion(''); setFiltersApplied(false);
    setCurrentPage(1);
  };

  const handleViewProfile = (mentor) => {
    setProfileModal(mentor);
  };

  const handleRequestMentor = (mentor) => {
    const existing = JSON.parse(localStorage.getItem('mentorship_requests') || '[]');
    const newRequest = {
      id: Date.now(),
      mentorName: mentor.name,
      mentorId: mentor.id,
      subject: mentor.specialty.split(',')[0],
      status: 'Pendiente',
      date: new Date().toLocaleDateString('es-ES'),
      message: 'Hola, he solicitado tu mentoría. Espero que podamos trabajar juntos.'
    };
    localStorage.setItem('mentorship_requests', JSON.stringify([...existing, newRequest]));
    navigate('/mentorias');
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Cabecera de la página */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Mentores</h1>
              <p className="text-gray-500 text-sm">Encuentra mentores expertos dispuestos a ayudarte a crecer.</p>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, color: 'bg-green-100 text-green-600', title: `${filteredMentors.length} Mentores encontrados`, subtitle: 'Según filtros' },
                { icon: TrendingUp, color: 'bg-orange-100 text-orange-600', title: '23 Nuevos mentores', subtitle: 'Este mes' },
                { icon: Award, color: 'bg-blue-100 text-blue-600', title: '1,250+ Mentorías realizadas', subtitle: 'Comunidad UCV Match' },
                { icon: Star, color: 'bg-emerald-100 text-emerald-600', title: '95% Satisfacción', subtitle: 'Calificación promedio' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-800">{stat.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{stat.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT FILTERS PANEL */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-24 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Filtros</h3>
                  <button onClick={handleClearFilters} className="text-xs text-[#0f2a5c] font-medium">Limpiar</button>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nombre, habilidad o tema..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Área de conocimiento</label>
                  <select value={area} onChange={(e) => setArea(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer">
                    <option value="">Todos</option>
                    {knowledgeAreas.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Habilidades</label>
                  <select value={habilidad} onChange={(e) => setHabilidad(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer">
                    <option value="">Todos</option>
                    {skillsOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nivel de estudio</label>
                  <select value={studyLevel} onChange={(e) => setStudyLevel(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer">
                    <option value="">Todos</option>
                    {studyLevelOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilidad</label>
                  <select value={availability} onChange={(e) => setAvailability(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer">
                    <option value="">Todos</option>
                    {availabilityOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Calificación mínima</label>
                  <div className="space-y-2">
                    {ratingOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="calificacion" value={opt.value}
                          checked={calificacion === opt.value}
                          onChange={(e) => setCalificacion(e.target.value)}
                          className="w-4 h-4 text-[#0f2a5c] border-gray-300 focus:ring-[#0f2a5c]" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={handleApplyFilters}
                  className="w-full bg-[#0f2a5c] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#0f2a5c]/90 transition">
                  Aplicar filtros
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT - MENTORS GRID */}
            <main className="flex-1 min-w-0">
              <div className="flex justify-end mb-5">
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer">
                    <option value="populares">Más populares</option>
                    <option value="rating">Mejor calificación</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {paginatedMentors.length === 0 && filtersApplied && (
                <div className="text-center py-16">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No se encontraron mentores</p>
                  <p className="text-gray-400 text-sm mt-1">Intenta con otros filtros.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedMentors.map((mentor) => (
                  <article key={mentor.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${mentor.status === 'available' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{mentor.name}</h4>
                        <p className="text-gray-500 text-[11px] truncate mt-0.5">{mentor.specialty}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${mentor.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {mentor.status === 'available' ? 'Disponible' : 'Pronto disponible'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-800">{mentor.rating}</span>
                      <span className="text-gray-500 text-xs">({mentor.reviews} reseñas)</span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{mentor.description}</p>

                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Responde en {mentor.responseTime}</span>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleViewProfile(mentor)}
                        className="flex-1 border border-[#0f2a5c] text-[#0f2a5c] py-2 px-3 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition">
                        Ver perfil
                      </button>
                      <button onClick={() => handleRequestMentor(mentor)}
                        className="flex-1 bg-[#0f2a5c] text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition">
                        Solicitar mentor
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-8">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === i + 1 ? 'bg-[#0f2a5c] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {profileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setProfileModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {profileModal.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{profileModal.name}</h3>
                  <p className="text-sm text-gray-500">{profileModal.specialty}</p>
                </div>
              </div>
              <button onClick={() => setProfileModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{profileModal.rating}</span>
              <span className="text-xs text-gray-500">({profileModal.reviews} reseñas)</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{profileModal.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profileModal.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Responde en {profileModal.responseTime}</span>
            </div>
            <button onClick={() => { setProfileModal(null); handleRequestMentor(profileModal); }}
              className="w-full bg-[#0f2a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Solicitar mentoría
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
