import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, MessageSquare, Settings, LogOut, Menu, X
} from 'lucide-react';
import InviteModal from './InviteModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth.jsx';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
  { icon: Users, label: 'Mentores', route: '/mentores' },
  { icon: Calendar, label: 'Mentorías', route: '/mentorias' },
  { icon: MessageSquare, label: 'Mensajes', route: '/mensajes', badgeKey: 'mensajes' },
  { icon: Settings, label: 'Configuración', route: '/configuracion' },
];

export default function Sidebar({ hideMobileMenu = false }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    const cargarNoLeidos = async () => {
      try {
        const { count } = await supabase
          .from('notificaciones')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .eq('leido', false);
        setMensajesNoLeidos(count || 0);
      } catch {
        setMensajesNoLeidos(0);
      }
    };
    cargarNoLeidos();
  }, [user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const sidebarContent = (
    <>
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
              onClick={() => { navigate(item.route); setMobileOpen(false); }}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-colors ${
                isActive ? 'bg-[#0f2a5c] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label === 'Mentores' && user?.rol === 'Mentor' ? 'Comunidad' : item.label}</span>
              {(item.badgeKey === 'mensajes' ? mensajesNoLeidos > 0 : item.badge) && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {item.badgeKey === 'mensajes' ? mensajesNoLeidos : item.badge}
                </span>
              )}
            </div>
          );
        })}
      </nav>
      <button onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-3 mb-2 rounded-xl cursor-pointer transition-colors text-gray-600 hover:bg-red-50 hover:text-red-600 w-full text-left">
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">Cerrar Sesión</span>
      </button>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a3a7a] to-[#0f2a5c] p-4 text-white shadow-lg">
        <div className="relative z-10">
          <h4 className="font-bold text-sm mb-1">Conecta. Aprende. Crece.</h4>
          <p className="text-[10px] text-blue-200 mb-3">Con UCV Match</p>
          <button onClick={() => setIsInviteOpen(true)} className="w-full bg-white text-[#0f2a5c] text-xs font-bold py-2 rounded-lg hover:bg-gray-100 transition">
            Invitar Amigos
          </button>
          {isInviteOpen && <InviteModal onClose={() => setIsInviteOpen(false)} />}
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-40">
          <img src="/hero_panel_ucv.png" className="w-full h-full object-cover rounded-full" />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Hamburger button - mobile only - moved to top right */}
      {!hideMobileMenu && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 right-4 z-50 bg-white shadow-lg rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl p-6 overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center bg-gray-100 rounded-xl"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto z-40 p-6">
        {sidebarContent}
      </div>
    </>
  );
}
