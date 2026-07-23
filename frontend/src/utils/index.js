// Funciones de formato de fecha
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
};

export const formatDateFull = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export const formatChatTimestamp = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return d.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Ayer';
  } else if (now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000) {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[d.getDay()];
  } else {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
};

// Función para obtener iniciales de un nombre
export const getInitials = (name) => {
  if (!name) return 'M';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
