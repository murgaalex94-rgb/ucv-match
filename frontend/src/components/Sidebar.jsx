import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, MessageSquare, Settings
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard-main' },
  { icon: Users, label: 'Mentores', route: '/mentores' },
  { icon: Calendar, label: 'Mentorías', route: '/mentorias' },
  { icon: MessageSquare, label: 'Mensajes', badge: 1, route: '/mensajes' },
  { icon: Settings, label: 'Configuración', route: '/configuracion' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto z-40 p-6">
      <div className="flex items-center gap-2 mb-8">
        <img src="/escudo_ucv.png" alt="Logo UCV" className="w-8 h-8 object-contain" />
        <span className="text-xl font-bold text-[#0f2a5c]">UCV Match</span>
      </div>
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.route;
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-colors ${
                isActive ? 'bg-[#0f2a5c] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>
      <div className="mt-auto relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a3a7a] to-[#0f2a5c] p-4 text-white shadow-lg">
        <div className="relative z-10">
          <h4 className="font-bold text-sm mb-1">Conecta. Aprende. Crece.</h4>
          <p className="text-[10px] text-blue-200 mb-3">Con UCV Match</p>
          <button className="w-full bg-white text-[#0f2a5c] text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition">
            Invitar Amigos
          </button>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-40">
          <img src="/hero_panel_ucv.png" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>
    </div>
  );
}
