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
import { formatDate, formatTime, getInitials } from '../utils';

const cursosPorCarrera = {
  'Administración de Empresas': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos de la Administración',
    'Costos y Presupuestos', 'Cátedra Vallejo', 'Economía', 'Creatividad e Innovación',
    'Gestión del Talento Humano', 'Diseño Organizacional', 'Estadística y Análisis de Datos',
    'Metodología de la Investigación Científica', 'Matemática para las Finanzas',
    'Derecho Empresarial y Comercial', 'Inteligencia de Mercados', 'Marketing',
    'Contabilidad Financiera', 'Administración Financiera', 'Marketing Estratégico',
    'Gerencia y Prospectiva Estratégica', 'Finanzas para los Negocios', 'Marketing Internacional',
    'Filosofía y Ética', 'Desarrollo de Competencias Gerenciales', 'Simuladores de Negocio',
    'Gestión de Proyectos', 'Trabajo de Investigación', 'Práctica Preprofesional',
  ],
  'Ingeniería de Sistemas': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Matemática Básica',
    'Introducción a la Ingeniería de Sistemas', 'Inglés I', 'Cálculo I',
    'Álgebra Lineal', 'Química General', 'Metodología de la Investigación Científica',
    'Cálculo II', 'Física I', 'Programación I', 'Estadística General',
    'Cálculo III', 'Física II', 'Programación II', 'Base de Datos I',
    'Ecuaciones Diferenciales', 'Arquitectura de Computadoras', 'Análisis de Algoritmos',
    'Base de Datos II', 'Redes y Comunicaciones', 'Ingeniería de Software I',
    'Sistemas Operativos', 'Ingeniería de Software II', 'Inteligencia de Negocios',
    'Seguridad Informática', 'Desarrollo Web', 'Gestión de Proyectos TI',
    'Inteligencia Artificial', 'Trabajo de Investigación', 'Práctica Preprofesional',
  ],
  'Ingeniería Civil': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Matemática Básica',
    'Introducción a la Ingeniería Civil', 'Inglés I', 'Cálculo I',
    'Álgebra Lineal', 'Química General', 'Dibujo Técnico',
    'Cálculo II', 'Física I', 'Geometría Descriptiva', 'Programación Básica',
    'Cálculo III', 'Física II', 'Mecánica Racional', 'Estática',
    'Ecuaciones Diferenciales', 'Mecánica de Materiales I', 'Topografía',
    'Mecánica de Materiales II', 'Análisis Estructural I', 'Hidráulica',
    'Análisis Estructural II', 'Concreto Armado I', 'Mecánica de Suelos',
    'Concreto Armado II', 'Instalaciones Sanitarias', 'Instalaciones Eléctricas',
    'Ingeniería de Costos', 'Trabajo de Investigación', 'Práctica Preprofesional',
  ],
  'Psicología': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos de Psicología',
    'Neurociencias', 'Psicología del Desarrollo I', 'Inglés I',
    'Estadística General', 'Psicología del Desarrollo II', 'Psicología del Aprendizaje',
    'Teorías de la Personalidad', 'Psicología Social', 'Psicología Educativa',
    'Psicopatología', 'Evaluación Psicológica I', 'Psicología Clínica',
    'Evaluación Psicológica II', 'Psicología Organizacional', 'Psicología de la Salud',
    'Terapia Cognitivo Conductual', 'Psicología Jurídica', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Derecho': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Introducción al Derecho',
    'Derecho Romano', 'Historia del Derecho', 'Inglés I',
    'Derecho Constitucional', 'Derecho Civil I', 'Teoría del Estado',
    'Derecho Penal I', 'Derecho Civil II', 'Derecho Procesal I',
    'Derecho Penal II', 'Derecho Laboral', 'Derecho Procesal II',
    'Derecho Comercial', 'Derecho Tributario', 'Derecho Internacional',
    'Derecho Administrativo', 'Derecho Empresarial', 'Argumentación Jurídica',
    'Trabajo de Investigación', 'Práctica Preprofesional',
  ],
  'Contabilidad': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos de Contabilidad',
    'Matemática Financiera', 'Inglés I', 'Contabilidad General',
    'Costos y Presupuestos', 'Economía General', 'Contabilidad Intermedia',
    'Contabilidad de Costos', 'Derecho Tributario', 'Contabilidad Superior',
    'Auditoría Financiera', 'Contabilidad Gubernamental', 'Finanzas Corporativas',
    'Auditoría Tributaria', 'Contabilidad Gerencial', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Enfermería': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Anatomía Humana',
    'Biología Celular', 'Inglés I', 'Fisiología Humana',
    'Bioquímica', 'Microbiología', 'Psicología General',
    'Farmacología', 'Enfermería Básica', 'Nutrición',
    'Enfermería en Salud Pública', 'Enfermería Materno Infantil',
    'Enfermería en Cuidados Críticos', 'Enfermería Quirúrgica',
    'Gestión en Enfermería', 'Trabajo de Investigación', 'Práctica Preprofesional',
  ],
  'Arquitectura': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Taller de Diseño I',
    'Geometría Descriptiva', 'Inglés I', 'Taller de Diseño II',
    'Historia de la Arquitectura', 'Dibujo Arquitectónico', 'Taller de Diseño III',
    'Estructuras I', 'Construcción I', 'Topografía',
    'Estructuras II', 'Construcción II', 'Instalaciones I',
    'Diseño Urbano', 'Estructuras III', 'Instalaciones II',
    'Taller de Tesis', 'Gestión de Proyectos', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Administración y Negocios Internacionales': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Objetivos de Desarrollo Sostenible',
    'Fundamentos de Administración y Negocios Internacionales', 'Inglés I', 'Cambio Climático y Gestión de Riesgos',
    'Comercio Internacional', 'Cátedra Vallejo', 'Economía',
    'Inglés II', 'Business Analytics', 'Contabilidad y Finanzas',
    'International Market Research', 'Constitución y Derechos Humanos', 'Inglés III',
    'Costos y Cotizaciones Internacionales', 'Creatividad e Innovación', 'Legislación y Operatividad Aduanera',
    'Merceología y Clasificación Arancelaria', 'Estadística y Análisis de Datos', 'Inglés IV',
    'Metodología de la Investigación Científica', 'Marketing', 'Gestión Financiera Internacional',
    'Derecho de los Negocios Internacionales', 'Matemática para las Finanzas', 'Inglés V',
    'Gestión de la Cadena de Suministro Internacional', 'International Marketing', 'Trabajo de Investigación I',
    'International Sales Management', 'Filosofía y Ética', 'Inglés VI',
    'Inteligencia Artificial y Aprendizaje Automático', 'Experiencia Curricular Electiva', 'Práctica Preprofesional I',
    'Gestión del Talento Humano', 'International Business Plan', 'Inglés VII',
    'Experiencia Curricular Electiva', 'Toma de Decisiones Estratégicas', 'Planificación Estratégica y Financiera',
    'Gestión de Proyectos', 'Inglés VIII', 'Gestión de Marcas en la Era Digital',
    'Finanzas y Valoración de Empresas', 'Gestión de la Innovación y la Tecnología', 'Trabajo de Investigación II',
    'Innovación para la Gestión de Personas', 'Inglés IX', 'Práctica Preprofesional II',
    'Inglés X',
  ],
  'Ingeniería Ambiental': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Matemática Básica',
    'Introducción a la Ingeniería Ambiental', 'Inglés I', 'Química General',
    'Biología General', 'Cálculo I', 'Física General',
    'Ecología General', 'Cálculo II', 'Química Ambiental',
    'Microbiología Ambiental', 'Geología', 'Estadística Ambiental',
    'Hidrología', 'Cálculo III', 'Física Ambiental',
    'Contaminación Atmosférica', 'Gestión de Residuos Sólidos', 'Tratamiento de Aguas',
    'Evaluación de Impacto Ambiental', 'Sistemas de Información Geográfica', 'Auditoría Ambiental',
    'Gestión de Riesgos Ambientales', 'Energías Renovables', 'Derecho Ambiental',
    'Gestión de Calidad Ambiental', 'Remediación de Suelos', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Ingeniería Industrial': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Matemática Básica',
    'Introducción a la Ingeniería Industrial', 'Inglés I', 'Física General',
    'Química General', 'Cálculo I', 'Dibujo Técnico',
    'Cálculo II', 'Estadística General', 'Programación Básica',
    'Cálculo III', 'Investigación de Operaciones I', 'Mecánica Industrial',
    'Termodinámica', 'Electrotecnia', 'Investigación de Operaciones II',
    'Gestión de la Producción', 'Diseño de Productos', 'Ergonomía',
    'Gestión de Calidad', 'Logística y Distribución', 'Simulación de Sistemas',
    'Gestión de Mantenimiento', 'Seguridad Industrial', 'Gestión de Proyectos Industriales',
    'Ingeniería Económica', 'Planificación Estratégica', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Arte & Diseño Gráfico Empresarial': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos del Arte',
    'Teoría del Color', 'Inglés I', 'Dibujo Básico',
    'Historia del Arte', 'Diseño Gráfico I', 'Fotografía Digital',
    'Composición Visual', 'Diseño Gráfico II', 'Tipografía',
    'Ilustración Digital', 'Diseño Editorial', 'Branding Corporativo',
    'Diseño Web I', 'Marketing Digital', 'Diseño de Empaques',
    'Diseño Publicitario', 'Animación 2D', 'Diseño Web II',
    'Identidad Visual', 'Dirección de Arte', 'Gestión de Proyectos de Diseño',
    'Diseño de Interfaces', 'Portafolio Profesional', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Ciencias de la Comunicación': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Introducción a la Comunicación',
    'Teoría de la Comunicación I', 'Inglés I', 'Historia de la Comunicación',
    'Semiótica', 'Redacción Periodística I', 'Fotografía Periodística',
    'Teoría de la Comunicación II', 'Redacción Periodística II', 'Radio I',
    'Televisión I', 'Periodismo Digital', 'Ética de la Comunicación',
    'Radio II', 'Televisión II', 'Comunicación Organizacional',
    'Publicidad I', 'Relaciones Públicas', 'Comunicación Audiovisual',
    'Investigación Periodística', 'Marketing Estratégico', 'Gestión de Medios',
    'Producción Multimedia', 'Comunicación Política', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Ciencias del Deporte': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Anatomía Humana',
    'Fisiología del Ejercicio', 'Inglés I', 'Biología General',
    'Bioquímica del Deporte', 'Psicología del Deporte', 'Nutrición Deportiva',
    'Kinesiología', 'Teoría y Metodología del Entrenamiento I', 'Biomecánica',
    'Fisiología del Deporte II', 'Teoría y Metodología del Entrenamiento II', 'Medicina Deportiva',
    'Gestión de Organizaciones Deportivas', 'Entrenamiento Deportivo I', 'Didáctica de la Educación Física',
    'Entrenamiento Deportivo II', 'Planificación Deportiva', 'Recreación y Tiempo Libre',
    'Evaluación Funcional', 'Rehabilitación Deportiva', 'Gestión de Eventos Deportivos',
    'Psicomotricidad', 'Actividad Física y Salud', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Educación Inicial': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos de la Educación',
    'Psicología del Desarrollo I', 'Inglés I', 'Pedagogía General',
    'Didáctica General', 'Sociología de la Educación', 'Filosofía de la Educación',
    'Psicología del Desarrollo II', 'Didáctica de la Educación Inicial I', 'Currículo de Educación Inicial',
    'Evaluación Educativa', 'Didáctica de la Educación Inicial II', 'Literatura Infantil',
    'Expresión Artística', 'Expresión Corporal', 'Juego y Aprendizaje',
    'Atención a la Diversidad', 'Gestión del Aula', 'Educación Inclusiva',
    'Familia y Comunidad', 'Tecnología Educativa', 'Investigación Educativa',
    'Práctica Profesional I', 'Práctica Profesional II', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Educación en Idiomas - Inglés': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Fundamentos de la Educación',
    'Inglés I', 'Pedagogía General', 'Lingüística General',
    'Fonética y Fonología del Inglés', 'Inglés II', 'Didáctica General',
    'Gramática del Inglés I', 'Inglés III', 'Sociología de la Educación',
    'Gramática del Inglés II', 'Inglés IV', 'Didáctica del Inglés I',
    'Literatura en Inglés I', 'Inglés V', 'Evaluación Educativa',
    'Literatura en Inglés II', 'Inglés VI', 'Didáctica del Inglés II',
    'Traducción I', 'Inglés VII', 'Gestión del Aula',
    'Traducción II', 'Inglés VIII', 'Investigación Educativa',
    'Cultura y Civilización Angloparlante', 'Inglés IX', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Anatomía Humana',
    'Biología Celular', 'Inglés I', 'Fisiología Humana',
    'Bioquímica', 'Microbiología General', 'Química Clínica I',
    'Hematología I', 'Parasitología', 'Inmunología',
    'Química Clínica II', 'Hematología II', 'Bacteriología Clínica',
    'Virología', 'Micología Clínica', 'Banco de Sangre',
    'Anatomía Patológica I', 'Citología', 'Genética Molecular',
    'Anatomía Patológica II', 'Toxicología Clínica', 'Gestión de Laboratorio',
    'Hemoterapia', 'Molecular Diagnostics', 'Investigación en Laboratorio',
    'Bioseguridad', 'Ética en Laboratorio Clínico', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
  'Tecnología Médica en Terapia Física y Rehabilitación': [
    'Pensamiento Lógico', 'Habilidades Comunicativas', 'Anatomía Humana',
    'Biología Celular', 'Inglés I', 'Fisiología Humana',
    'Bioquímica', 'Física Médica', 'Psicología General',
    'Kinesiología I', 'Fisiología del Ejercicio', 'Neuroanatomía',
    'Kinesiología II', 'Patología Médica I', 'Electroterapia',
    'Mecanoterapia', 'Patología Médica II', 'Hidroterapia',
    'Terapia Manual', 'Rehabilitación Neurológica', 'Rehabilitación Musculoesquelética',
    'Rehabilitación Cardiopulmonar', 'Kinesioterapia', 'Gestión en Terapia Física',
    'Rehabilitación Geriátrica', 'Rehabilitación Pediátrica', 'Investigación en Terapia Física',
    'Bioética en Rehabilitación', 'Prevención y Promoción de la Salud', 'Trabajo de Investigación',
    'Práctica Preprofesional',
  ],
};
import { useAuth } from '../hooks/useAuth.jsx';
import { StreamChat } from 'stream-chat';
import { getChannelId, createOrGetStreamChannel } from '../lib/chatUtils';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY;

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
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [sesionesHoy, setSesionesHoy] = useState([]);
  const [proximasMentorias, setProximasMentorias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [detalleModal, setDetalleModal] = useState(null);
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
          stream_chat_channel_id,
          estudiante:estudiante_id(nombre_completo, avatar_url, carrera),
          mentor:mentor_id(nombre_completo, avatar_url, carrera)
        `)
        .eq(esMentor ? 'mentor_id' : 'estudiante_id', user.id);

      if (esMentor) {
        query = query.neq('estudiante_id', user.id);
      }

      const { data: mentorias, error } = await query.order('fecha_solicitud', { ascending: false });

      if (error) {
        // Si falla por columna stream_chat_channel_id no existente, reintentar sin ella
        if (error.code === '42703' || error.message?.includes('stream_chat_channel_id')) {
          return loadMentoriasSinChannelId();
        }
        throw error;
      }

      processMentorias(mentorias || []);
      fetchPendingCount();
    } catch (error) {
      console.error('Error loading mentorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMentoriasSinChannelId = async () => {
    try {
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

      processMentorias(mentorias || []);
      fetchPendingCount();
    } catch (error) {
      console.error('Error loading mentorias (fallback):', error);
    } finally {
      setLoading(false);
    }
  };

  const processMentorias = (mentorias) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    const hoyArr = [];
    const proximasArr = [];
    const historialArr = [];

    for (const m of mentorias) {
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
  };

  const cargarMentores = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre_completo, carrera')
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
      let channelId = null;
      if (session.estudiante_id) {
        channelId = await createOrGetStreamChannel(session.estudiante_id);
      }

      const updateData = { estado: 'Activa' };
      if (channelId) {
        updateData.stream_chat_channel_id = channelId;
      }

      const { error } = await supabase
        .from('mentorias')
        .update(updateData)
        .eq('id', session.id);
      if (error) throw error;

      await supabase.from('notificaciones').insert({
        usuario_id: session.estudiante_id,
        tipo: 'mentoria_aceptada',
        mensaje: 'Tu solicitud de mentoría ha sido aceptada. ¡Ya puedes chatear con tu mentor!'
      });

      await loadMentorias();
      setToastMsg({ text: 'Solicitud aceptada', type: 'success' });
      
      // Navegar al chat con el channelId para que se seleccione automáticamente
      if (channelId) {
        navigate(`/mensajes?channel=${channelId}`);
      } else {
        navigate('/mensajes');
      }
    } catch (error) {
      console.error('Error accepting mentorship:', error);
      setPendingCount(prev => prev + 1);
      setToastMsg({ text: 'Error al aceptar mentoría: ' + (error.message || ''), type: 'error' });
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
    // Solo permitir chatear si la mentoría está Activa
    if (session.estado !== 'Activa') {
      setToastMsg({ text: 'La mentoría debe ser aceptada antes de chatear', type: 'error' });
      return;
    }
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

      let channelId = session.stream_chat_channel_id || session.streamChatChannelId;

      // Validar y asegurar la existencia del canal en Stream Chat (recreándolo automáticamente si fue eliminado o no existe)
      try {
        const otherPersonName = esMentor 
          ? (session.estudiante?.nombre_completo || 'Estudiante')
          : (session.mentor?.nombre_completo || 'Mentor');
          
        const ensuredChannelId = await createOrGetStreamChannel(otherUserId, otherPersonName);
        if (ensuredChannelId) {
          channelId = ensuredChannelId;
          if (!session.stream_chat_channel_id) {
            await supabase
              .from('mentorias')
              .update({ stream_chat_channel_id: channelId })
              .eq('id', session.id);
          }
        }
      } catch (e) {
        console.warn('Advertencia al asegurar existencia de canal Stream Chat:', e);
        if (!channelId) {
          channelId = getChannelId(authUser.id, otherUserId);
        }
      }

      // Redirigir a mensajes seleccionando el canal seguro
      navigate(`/mensajes?channel=${channelId}`);
    } catch (err) {
      console.error('Error opening chat:', err);
      navigate('/mensajes');
    }
  };

  const handleOpenDetalle = (session) => {
    setDetalleModal(session);
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
                onClick={() => document.getElementById('solicitudes-lista')?.scrollIntoView({ behavior: 'smooth' })}
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
          <main id="solicitudes-lista" className="lg:col-span-3 space-y-8 min-w-0">

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
                      <div className="flex flex-col gap-4">
                        {/* Top row: Time badge + Avatar + Name + Badges */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex flex-col items-center bg-[#0f2a5c] text-white rounded-xl p-2.5 sm:p-3 min-w-[60px] sm:min-w-[70px] shrink-0">
                            <span className="text-lg sm:text-xl font-bold">{formatTime(session.fecha_solicitud)}</span>
                            <span className="text-[10px] sm:text-xs text-blue-100">Hoy</span>
                          </div>
                          {esMentor ? session.estudiante?.avatar_url ? (
                            <img 
                              src={session.estudiante.avatar_url} 
                              alt={session.estudiante.nombre_completo}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                              {getInitials(session.estudiante?.nombre_completo)}
                            </div>
                          ) : session.mentor?.avatar_url ? (
                            <img 
                              src={session.mentor.avatar_url} 
                              alt={session.mentor.nombre_completo}
                              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                              {getInitials(session.mentor?.nombre_completo)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{esMentor ? (session.estudiante?.nombre_completo || 'Estudiante') : (session.mentor?.nombre_completo || 'Mentor')}</p>
                            <p className="text-gray-500 text-xs truncate">{esMentor ? (session.estudiante?.carrera || 'Carrera no especificada') : (session.mentor?.carrera || 'Carrera no especificada')}</p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Online</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(session.estado)}`}>
                                {getEstadoLabel(session.estado)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button 
                            onClick={() => handleOpenChat(session)}
                            disabled={session.estado !== 'Activa'}
                            className={`bg-[#0f2a5c] text-white px-5 py-2 min-h-[44px] rounded-xl font-medium text-sm hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-1.5 ${session.estado !== 'Activa' ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Send className="w-4 h-4" /> Chatear
                          </button>
                          <button onClick={() => handleOpenDetalle(session)}
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
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="flex flex-col items-center bg-gray-100 rounded-xl p-3 min-w-[60px] shrink-0">
                              <span className="text-xl font-bold text-gray-800">{sessionDate.getDate()}</span>
                              <span className="text-xs text-gray-500 capitalize">{sessionDate.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-3">
                            {esMentor ? session.estudiante?.avatar_url ? (
                              <img 
                                src={session.estudiante.avatar_url} 
                                alt={session.estudiante.nombre_completo}
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                                {getInitials(session.estudiante?.nombre_completo)}
                              </div>
                            ) : session.mentor?.avatar_url ? (
                              <img 
                                src={session.mentor.avatar_url} 
                                alt={session.mentor.nombre_completo}
                                className="w-10 h-10 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                                {getInitials(session.mentor?.nombre_completo)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 text-sm truncate">{esMentor ? (session.estudiante?.nombre_completo || 'Estudiante') : (session.mentor?.nombre_completo || 'Mentor')}</p>
                              <p className="text-gray-500 text-xs truncate">{esMentor ? (session.estudiante?.carrera || 'Carrera no especificada') : (session.mentor?.carrera || 'Carrera no especificada')}</p>
                            </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
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
                          <div className="flex flex-col sm:flex-row gap-2">
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
                          {esMentor ? session.estudiante?.avatar_url ? (
                            <img 
                              src={session.estudiante.avatar_url} 
                              alt={session.estudiante.nombre_completo}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {getInitials(session.estudiante?.nombre_completo)}
                            </div>
                          ) : session.mentor?.avatar_url ? (
                            <img 
                              src={session.mentor.avatar_url} 
                              alt={session.mentor.nombre_completo}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                              {getInitials(session.mentor?.nombre_completo)}
                            </div>
                          )}
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
                  onChange={(e) => {
                    const mentorId = e.target.value;
                    setMentorSeleccionado(mentorId);
                    const mentor = mentoresDisponibles.find(m => m.id === mentorId);
                    const cursos = cursosPorCarrera[mentor?.carrera] || [];
                    setCursosDisponibles(cursos);
                    setFormData({ ...formData, mentor_id: mentorId, materia: '' });
                  }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] bg-white cursor-pointer"
                >
                  <option value="">Selecciona un mentor</option>
                  {mentoresDisponibles.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.nombre_completo} {mentor.carrera ? `(${mentor.carrera})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Curso</label>
                <select
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] bg-white cursor-pointer"
                  disabled={!mentorSeleccionado}
                >
                  <option value="">Selecciona un curso</option>
                  {cursosDisponibles.map((curso) => (
                    <option key={curso} value={curso}>{curso}</option>
                  ))}
                </select>
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

      {/* Modal Ver Detalles */}
      {detalleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setDetalleModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto z-50" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalles de la Solicitud</h2>
              <button onClick={() => setDetalleModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Badge de estado */}
              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(detalleModal.estado)}`}>
                  {getEstadoLabel(detalleModal.estado)}
                </span>
              </div>

              {/* Información de la persona (Estudiante para Mentor, Mentor para Estudiante) */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                {esMentor ? (
                  // Mentor ve info del estudiante
                  <>
                    {detalleModal.estudiante?.avatar_url ? (
                      <img src={detalleModal.estudiante.avatar_url} alt={detalleModal.estudiante.nombre_completo} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(detalleModal.estudiante?.nombre_completo || 'E')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{detalleModal.estudiante?.nombre_completo || 'Estudiante'}</p>
                      <p className="text-sm text-gray-500">{detalleModal.estudiante?.carrera || 'Carrera no especificada'}</p>
                    </div>
                  </>
                ) : (
                  // Estudiante ve info del mentor
                  <>
                    {detalleModal.mentor?.avatar_url ? (
                      <img src={detalleModal.mentor.avatar_url} alt={detalleModal.mentor.nombre_completo} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(detalleModal.mentor?.nombre_completo || 'M')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{detalleModal.mentor?.nombre_completo || 'Mentor'}</p>
                      <p className="text-sm text-gray-500">{detalleModal.mentor?.carrera || 'Carrera no especificada'}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="border-t pt-3 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Curso</p>
                  <p className="font-medium text-gray-800">{detalleModal.materia || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Tema / Duda</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{detalleModal.descripcion || 'Sin descripción'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha de solicitud</p>
                  <p className="text-gray-700">{detalleModal.fecha_solicitud ? new Date(detalleModal.fecha_solicitud).toLocaleString('es-ES') : 'No especificada'}</p>
                </div>
              </div>
              
              {/* Botones según rol y estado */}
              <div className="pt-2 border-t">
                {esMentor ? (
                  // Mentor: botones de Aceptar/Rechazar
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setDetalleModal(null);
                        handleAcceptSession(detalleModal);
                      }}
                      disabled={acceptLoading === detalleModal.id}
                      className="flex-1 bg-green-100 text-green-700 py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-green-200 transition disabled:opacity-50"
                    >
                      {acceptLoading === detalleModal.id ? '...' : 'Aceptar'}
                    </button>
                    <button
                      onClick={() => {
                        setDetalleModal(null);
                        setRejectModal(detalleModal);
                      }}
                      className="flex-1 bg-red-100 text-red-700 py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-red-200 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                ) : (
                  // Estudiante: botón según estado
                  detalleModal.estado === 'Pendiente' ? (
                    <button
                      onClick={() => {
                        setDetalleModal(null);
                        handleCancelRequest(detalleModal.id);
                      }}
                      className="w-full border-2 border-red-500 text-red-600 py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-red-50 transition"
                    >
                      Cancelar solicitud
                    </button>
                  ) : detalleModal.estado === 'Activa' ? (
                    <button
                      onClick={() => {
                        setDetalleModal(null);
                        handleOpenChat(detalleModal);
                      }}
                      className="w-full bg-[#0f2a5c] text-white py-2.5 min-h-[44px] rounded-xl font-medium hover:bg-[#0f2a5c]/90 transition"
                    >
                      Ir al Chat
                    </button>
                  ) : null
                )}
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
