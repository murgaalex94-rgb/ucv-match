import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User, Lock, Eye, EyeOff, Mail, Settings,
  CheckCircle,
  Camera, LogOut, AlertTriangle, Trash2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import MaterialDatePicker from '../components/MaterialDatePicker';

export default function ConfiguracionPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    fecha_nacimiento: '',
    genero: '',
    biografia: ''
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [message, setMessage] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showGlobalLogoutModal, setShowGlobalLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState({ open: false, qrCode: '', factorId: '', challengeId: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate('/login');
          return;
        }

        setUser(authUser);

        const { data: profileRow } = await supabase
          .from('profiles')
          .select('nombre_completo, email, avatar_url, genero, biografia, fecha_nacimiento')
          .eq('id', authUser.id)
          .maybeSingle();

        let displayName = profileRow?.nombre_completo || '';
        let displayEmail = profileRow?.email || authUser.email || '';
        let avatarUrl = profileRow?.avatar_url || '';
        let displayGenero = profileRow?.genero || '';
        let displayBiografia = profileRow?.biografia || '';
        let displayFechaNac = profileRow?.fecha_nacimiento || '';

        if (!displayName && authUser.user_metadata) {
          displayName = authUser.user_metadata.full_name || authUser.user_metadata.name || '';
        }

        const { data: mfaFactors } = await supabase.auth.mfa.listFactors()
        if (mfaFactors?.all?.some(f => f.status === 'verified')) {
          setIs2FAEnabled(true)
        }

        setProfileData({
          nombre_completo: displayName,
          email: displayEmail,
          avatar_url: avatarUrl,
        });

        const nameParts = (displayName || '').split(' ');
        const mid = Math.ceil(nameParts.length / 2);
        setFormData({
          nombres: nameParts.slice(0, mid).join(' ') || '',
          apellidos: nameParts.slice(mid).join(' ') || '',
          email: displayEmail,
          fecha_nacimiento: displayFechaNac,
          genero: displayGenero,
          biografia: displayBiografia
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);


  const handleSaveProfile = async () => {
    try {
      const nombreCompleto = `${formData.nombres} ${formData.apellidos}`.trim();
      const { error } = await supabase
        .from('profiles')
        .update({
          nombre_completo: nombreCompleto,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          biografia: formData.biografia
        })
        .eq('id', user.id);

      if (error) {
        setMessage('Error al guardar: ' + error.message);
      } else {
        setProfileData(prev => ({ ...prev, nombre_completo: nombreCompleto }));
        setMessage('✅ Datos actualizados correctamente');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error al guardar cambios');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) {
        setMessage('Error al cambiar contraseña: ' + error.message);
      } else {
        setMessage('Contraseña cambiada exitosamente');
        setPasswordData({ current: '', new: '', confirm: '' });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Error al cambiar contraseña');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleGlobalLogout = async () => {
    try {
      // Sign out from all devices
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error global logout:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Soft delete instead of hard delete
      const { error } = await supabase.rpc('soft_delete_account', { user_id: user.id });
      if (error) throw error;
      
      // Sign out after soft delete
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage('Error al eliminar cuenta: ' + (error.message || ''));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Solo se permiten imágenes');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage('La imagen no debe superar los 2 MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
      setMessage('Foto de perfil actualizada');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error.message?.includes('Bucket not found')) {
        setMessage('El bucket "avatars" no existe. Créalo en Supabase Dashboard → Storage → New Bucket (nombre: avatars, público).');
      } else if (error.message?.includes('row-level security') || error.message?.includes('violates')) {
        setMessage('Error de permisos en Storage. Configure las políticas de acceso en Supabase Dashboard → Storage.');
      } else {
        setMessage('Error al subir la foto: ' + (error.message || ''));
      }
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !profileData?.avatar_url) return;

    try {
      const urlParts = profileData.avatar_url.split('/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        await supabase.storage.from('avatars').remove([filePath]);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileData(prev => ({ ...prev, avatar_url: null }));
      setMessage('Foto eliminada correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      setMessage('Error al eliminar la foto: ' + (error.message || ''));
    }
  };

  const nombreCompleto = profileData?.nombre_completo || '';
  const email = profileData?.email || '';
  const initials = nombreCompleto
    ? nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : email
      ? email[0].toUpperCase()
      : 'U';

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Settings className="w-6 h-6 text-[#0f2a5c]" />Configuración</h1>
              <p className="text-gray-500 text-sm mt-1">Administra tu cuenta y preferencias.</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Header nombreUsuario={nombreCompleto} initials={initials} avatarUrl={profileData?.avatar_url} />
            </div>
          </div>

          <main className="flex-1 min-w-0 space-y-6">
            {message && (
              <div className={`p-4 rounded-xl text-sm ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0f2a5c]" />
                Información Personal
              </h3>
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#0f2a5c] text-white text-2xl font-bold hover:opacity-80 transition-opacity disabled:opacity-50"
                  >
                    {profileData?.avatar_url ? (
                      <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Cambiar foto"
                  >
                    <Camera className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {profileData?.avatar_url && (
                    <button
                      onClick={handleDeletePhoto}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full shadow-md border border-red-300 flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{nombreCompleto || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">Usuario</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombres</label>
                  <input 
                    type="text" 
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos</label>
                  <input 
                    type="text" 
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c]" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled 
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
                <div>
                  <MaterialDatePicker
                    value={formData.fecha_nacimiento}
                    onChange={(val) => setFormData({ ...formData, fecha_nacimiento: val })}
                    label="Fecha de nacimiento"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biografía</label>
                  <textarea
                    value={formData.biografia}
                    onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] resize-none"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    className="bg-[#0f2a5c] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition flex items-center gap-2"
                  >
                    Guardar Cambios
                  </button>
                </div>
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
                    { key: 'new', label: 'Nueva contraseña', placeholder: 'Ingresa nueva contraseña' },
                    { key: 'confirm', label: 'Confirmar nueva contraseña', placeholder: 'Confirma nueva contraseña' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword[field.key] ? 'text' : 'password'}
                          value={passwordData[field.key]}
                          onChange={(e) => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
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
                    <button 
                      onClick={handleChangePassword}
                      className="border border-[#0f2a5c] text-[#0f2a5c] px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/5 transition"
                    >
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

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#0f2a5c]" />
                Autenticación en Dos Pasos (2FA)
              </h3>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-4">Añade una capa extra de seguridad a tu cuenta usando una aplicación de autenticación como Google Authenticator o Authy.</p>
                  <button
                    onClick={async () => {
                      if (is2FAEnabled) return
                      setTwoFAMessage('')
                      setIsEnrolling(true)
                      try {
                        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
                        if (error) throw error
                        setTwoFAModal({
                          open: true,
                          qrCode: data.totp.qr_code,
                          factorId: data.id,
                          challengeId: '',
                        })
                        setVerificationCode('')
                      } catch (err) {
                        setTwoFAMessage('Error al iniciar 2FA: ' + (err.message || ''))
                      } finally {
                        setIsEnrolling(false)
                      }
                    }}
                    disabled={is2FAEnabled || isEnrolling}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                      is2FAEnabled
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-[#0f2a5c] text-white hover:bg-[#0f2a5c]/90'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    {is2FAEnabled ? '2FA Activado' : isEnrolling ? 'Preparando...' : 'Activar Autenticación en Dos Pasos'}
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-600" />
                Cerrar Sesión
              </h3>
              <p className="text-sm text-gray-600 mb-4">Al cerrar sesión, tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión (solo este dispositivo)
                </button>
                <button 
                  onClick={() => setShowGlobalLogoutModal(true)}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión en TODOS los dispositivos
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Eliminar Cuenta</h3>
                  <p className="text-sm text-gray-600 mb-4">Al eliminar tu cuenta, todos tus datos serán eliminados permanentemente. Esta acción no se puede deshacer.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="border border-red-500 text-red-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition">
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </section>

            {/* 2FA modal */}
            {twoFAModal.open && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => { if (!isVerifying) setTwoFAModal({ ...twoFAModal, open: false }) }}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Configurar 2FA</h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)</p>
                  <div className="flex justify-center mb-4">
                    <img src={twoFAModal.qrCode} alt="Código QR de 2FA" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2 text-center">Luego ingresa el código de 6 dígitos generado por la aplicación:</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]/20 focus:border-[#0f2a5c] mb-4"
                  />
                  {twoFAMessage && (
                    <p className={`text-sm text-center mb-3 ${twoFAMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{twoFAMessage}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTwoFAModal({ ...twoFAModal, open: false })}
                      disabled={isVerifying}
                      className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        if (verificationCode.length !== 6) return
                        setTwoFAMessage('')
                        setIsVerifying(true)
                        try {
                          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: twoFAModal.factorId })
                          if (challengeError) throw challengeError
                          const { error: verifyError } = await supabase.auth.mfa.verify({
                            factorId: twoFAModal.factorId,
                            challengeId: challengeData.id,
                            code: verificationCode,
                          })
                          if (verifyError) throw verifyError
                          setIs2FAEnabled(true)
                          setTwoFAMessage('✅ 2FA activado correctamente')
                          setTimeout(() => {
                            setTwoFAModal({ open: false, qrCode: '', factorId: '', challengeId: '' })
                            setVerificationCode('')
                          }, 2000)
                        } catch (err) {
                          setTwoFAMessage('Error: ' + (err.message || 'Código inválido'))
                        } finally {
                          setIsVerifying(false)
                        }
                      }}
                      disabled={verificationCode.length !== 6 || isVerifying}
                      className="flex-1 bg-[#0f2a5c] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#0f2a5c]/90 transition disabled:opacity-50"
                    >
                      {isVerifying ? 'Verificando...' : 'Verificar y Activar'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Global Logout confirmation modal */}
            {showGlobalLogoutModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowGlobalLogoutModal(false)}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Cerrar sesión en TODOS los dispositivos</h3>
                  <p className="text-sm text-gray-600 mb-6 text-center">Esto cerrará tu sesión en todos los dispositivos donde hayas iniciado sesión. Tendrás que volver a iniciar sesión en cada uno.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowGlobalLogoutModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                    <button onClick={handleGlobalLogout} className="flex-1 bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-700 transition">
                      Sí, cerrar en todos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout confirmation modal */}
            {showLogoutModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowLogoutModal(false)}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">¿Seguro que quieres cerrar sesión?</h3>
                  <p className="text-sm text-gray-600 mb-6">Tendrás que volver a iniciar sesión para acceder a tu cuenta.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLogoutModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                    <button onClick={handleLogout} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition">
                      Sí, cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete account confirmation modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={() => setShowDeleteModal(false)}>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Eliminar cuenta</h3>
                  <p className="text-sm text-gray-600 mb-6 text-center">Esta acción eliminará permanentemente tu cuenta y todos tus datos. ¿Estás seguro?</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                      Cancelar
                    </button>
                    <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
