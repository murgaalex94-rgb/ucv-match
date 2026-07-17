import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search,
  ChevronDown, User, Lock, Eye, EyeOff, Mail, Phone,
  Calendar as CalendarIcon, CheckCircle, AlertTriangle,
  Camera, HelpCircle, MessageSquare,
  Smartphone, LogOut, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [toggle, setToggle] = useState({
    emailNotify: true, pushNotify: true, darkMode: false,
    mentorshipReminders: true, weeklySummary: false,
  });

  const submenuItems = [
    { label: 'Mi Cuenta', active: true },
    { label: 'Notificaciones' },
    { label: 'Privacidad' },
    { label: 'Seguridad' },
    { label: 'Preferencias' },
    { label: 'Idioma y Región' },
    { label: 'Métodos de Pago' },
    { label: 'Dispositivos' },
    { label: 'Ayuda y Soporte' },
  ];

  const Toggle = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f2a5c]"></div>
    </label>
  );

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Configuración ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">Administra tu cuenta, preferencias y privacidad.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar en configuración..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
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

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-56 flex-shrink-0">
            <nav className="space-y-0.5 bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sticky top-24">
              {submenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { if (!item.active) navigate('/proximamente'); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-[#0f2a5c] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <hr className="my-2 border-gray-100" />
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </nav>
          </aside>

          <main className="flex-1 min-w-0 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0f2a5c]" />
                Información Personal
              </h3>
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold">AM</div>
                  <button className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition">
                    <Camera className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Alex Murga</p>
                  <p className="text-sm text-gray-500">Estudiante - Ingeniería de Sistemas</p>
                  <p className="text-xs text-gray-400">Miembro desde Junio 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombres</label>
                  <input type="text" defaultValue="Alex" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
                  <input type="text" defaultValue="Murga" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" defaultValue="alex.murga@universidad.edu" disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" defaultValue="+51 987 654 321" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de nacimiento</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" defaultValue="2002-05-15" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] cursor-pointer bg-white">
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biografía</label>
                  <textarea rows={3} defaultValue="Estudiante de Ingeniería de Sistemas apasionado por la tecnología y la enseñanza." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] resize-none" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="bg-[#0f2a5c] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center gap-2">
                  Guardar Cambios
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0f2a5c]" />
                Cambiar Contraseña
              </h3>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  {[
                    { key: 'current', label: 'Contraseña actual', placeholder: '••••••••' },
                    { key: 'new', label: 'Nueva contraseña', placeholder: 'Ingresa nueva contraseña' },
                    { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Confirma nueva contraseña' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword[field.key] ? 'text' : 'password'}
                          placeholder={field.placeholder}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]"
                        />
                        <button
                          onClick={() => setShowPassword({ ...showPassword, [field.key]: !showPassword[field.key] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button className="border border-[#0f2a5c] text-[#0f2a5c] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>
                <div className="lg:w-72 bg-gray-50 rounded-xl p-5 lg:self-start">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Recomendaciones</h4>
                  <ul className="space-y-2">
                    {[
                      'Mínimo 8 caracteres',
                      'Incluir mayúsculas',
                      'Incluir minúsculas',
                      'Incluir números y símbolos',
                    ].map((req) => (
                      <li key={req} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="border border-red-200 bg-red-50/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Eliminar Cuenta
              </h3>
              <p className="text-sm text-red-600 mb-4">Si eliminas tu cuenta, perderás todo tu contenido y no podrás recuperarlo.</p>
              <button className="border border-red-300 text-red-700 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                Eliminar mi cuenta
              </button>
            </section>
          </main>

          <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sticky top-24">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0f2a5c]" />
                Resumen de Cuenta
              </h4>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Rol', value: 'Estudiante' },
                  { label: 'Miembro desde', value: '20 de Marzo, 2024' },
                  { label: 'Plan actual', value: 'Gratuito' },
                  { label: 'Cursos inscritos', value: '5' },
                  { label: 'Mentorías realizadas', value: '12' },
                  { label: 'Recursos guardados', value: '15' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#0f2a5c]" />
                Preferencias Rápidas
              </h4>
              <div className="space-y-4">
                {[
                  { key: 'emailNotify', label: 'Notificaciones por correo' },
                  { key: 'pushNotify', label: 'Notificaciones push' },
                  { key: 'darkMode', label: 'Tema de la aplicación' },
                  { key: 'mentorshipReminders', label: 'Recordatorios de mentorías' },
                  { key: 'weeklySummary', label: 'Resumen semanal' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <Toggle
                      checked={toggle[item.key]}
                      onChange={() => setToggle({ ...toggle, [item.key]: !toggle[item.key] })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0f2a5c]" />
                Centro de Ayuda
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Preguntas frecuentes', icon: HelpCircle },
                  { label: 'Contactar soporte', icon: Mail },
                  { label: 'Enviar sugerencia', icon: MessageSquare },
                ].map((link) => (
                  <button
                    key={link.label}
                    onClick={() => navigate('/proximamente')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <link.icon className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-left">{link.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
