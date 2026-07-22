import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ConfirmEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      console.error('Error resending:', err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-[#e8edf5] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/escudo_ucv.png" alt="Logo UCV" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold text-[#0f2a5c]">UCV Match</span>
        </div>

        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-[#0f2a5c]" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Último paso!</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Te hemos enviado un enlace de confirmación a tu correo institucional.{' '}
          {email && <span className="font-medium text-gray-700">({email})</span>}
          <br /><br />
          Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
        </p>

        {sent ? (
          <p className="text-sm text-green-600 mb-4">Enlace reenviado correctamente. Revisa tu correo.</p>
        ) : (
          <button onClick={handleResend} disabled={resending || !email}
            className="w-full bg-[#0f2a5c] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#0f2a5c]/90 transition flex items-center justify-center gap-2 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Reenviando...' : 'Reenviar enlace'}
          </button>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100">
          <button onClick={() => navigate('/login')}
            className="text-sm text-[#0f2a5c] font-medium hover:underline flex items-center justify-center gap-1 mx-auto">
            ¿Ya confirmaste? Inicia sesión <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
