import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  TrendingUp, Clock, CheckCircle,
  Download, Star, ArrowUp, ArrowDown
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const reports = [
  { id: 1, title: 'Reporte de Mentorías - Julio 2026', type: 'PDF', date: '15 Jul 2026', size: '2.4 MB', status: 'Generado', description: 'Resumen completo de mentorías realizadas en el mes.' },
  { id: 2, title: 'Progreso de Cursos', type: 'PDF', date: '14 Jul 2026', size: '1.8 MB', status: 'Generado', description: 'Avance detallado de todos tus cursos activos.' },
  { id: 3, title: 'Estadísticas de Aprendizaje', type: 'XLSX', date: '12 Jul 2026', size: '3.1 MB', status: 'Generado', description: 'Datos estadísticos de horas de estudio y rendimiento.' },
  { id: 4, title: 'Historial de Mentorías', type: 'PDF', date: '10 Jul 2026', size: '1.2 MB', status: 'Generado', description: 'Historial completo de sesiones de mentoría realizadas.' },
  { id: 5, title: 'Reporte de Logros y Puntos', type: 'PDF', date: '08 Jul 2026', size: '900 KB', status: 'Generado', description: 'Detalle de logros desbloqueados y puntos acumulados.' },
  { id: 6, title: 'Reporte de Recursos', type: 'XLSX', date: '05 Jul 2026', size: '4.2 MB', status: 'Generado', description: 'Inventario de recursos descargados y favoritos.' },
];

const weeklyStats = {
  hoursStudied: 12.5,
  sessionsCompleted: 4,
  resourcesDownloaded: 7,
  avgRating: 4.8,
  hoursChange: 15,
  sessionsChange: 33,
  resourcesChange: 40,
  ratingChange: 2,
};

export default function ReportesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.nombre || 'Usuario';
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';
  const [period, setPeriod] = useState('semanal');

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reportes 📊</h1>
            <p className="text-gray-500 text-sm">Visualiza y descarga reportes detallados de tu actividad y progreso.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar reportes..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
            </div>
            <Header nombreUsuario={userName} initials={initials} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['semanal', 'mensual', 'trimestral'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                period === p ? 'bg-[#0f2a5c] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Horas de Estudio', value: `${weeklyStats.hoursStudied}h`, change: weeklyStats.hoursChange, icon: Clock, color: 'bg-blue-100 text-blue-600' },
            { label: 'Sesiones Completadas', value: weeklyStats.sessionsCompleted, change: weeklyStats.sessionsChange, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
            { label: 'Recursos Descargados', value: weeklyStats.resourcesDownloaded, change: weeklyStats.resourcesChange, icon: Download, color: 'bg-purple-100 text-purple-600' },
            { label: 'Calificación Promedio', value: weeklyStats.avgRating, change: weeklyStats.ratingChange, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-0.5 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(stat.change)}% vs periodo anterior
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Reportes Generados</h3>
          <button className="flex items-center gap-2 bg-[#0f2a5c] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition">
            <DownloadIcon className="w-4 h-4" />
            Generar reporte
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reporte</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-800">{report.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{report.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        report.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>{report.type}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{report.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{report.size}</td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" /> {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="flex items-center gap-1.5 text-sm text-[#0f2a5c] font-medium hover:underline ml-auto">
                        <DownloadIcon className="w-4 h-4" /> Descargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
