import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header({ notificacionesNoLeidas = 0, nombreUsuario = '', initials = 'U', avatarUrl = null }) {
  const navigate = useNavigate();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifPanel(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="relative" ref={userRef}>
        <div
          onClick={() => setShowUserMenu(prev => !prev)}
          className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-200 rounded-full p-1 sm:pl-1 sm:pr-3 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0f2a5c] rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <span className="hidden sm:inline-block text-sm font-medium text-gray-700 max-w-[140px] truncate">{nombreUsuario || 'Usuario'}</span>
          <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block transition-transform" />
        </div>
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => { setShowUserMenu(false); navigate('/configuracion'); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configuración
            </button>
            <button
              onClick={() => { setShowUserMenu(false); handleLogout(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifPanel(prev => !prev)}
          className="relative p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {notificacionesNoLeidas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow">
              {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
            </span>
          )}
        </button>
        {showNotifPanel && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-4 z-50">
            <p className="text-sm text-gray-500 text-center">No tienes notificaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
