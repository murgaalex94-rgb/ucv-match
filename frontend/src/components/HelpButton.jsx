import { MessageCircle, HelpCircle, Mail, Clock, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '400px', overflow: 'hidden' }}
            >
              <div style={{ background: '#0f2a5c', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <Shield style={{ width: '24px', height: '24px', color: '#93c5fd', flexShrink: 0 }} />
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>
                  Centro de Ayuda
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="hover:text-gray-200"
                >
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Estamos aquí para ayudarte. Contáctanos a través de los siguientes canales:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                    <Mail style={{ width: '18px', height: '18px', color: '#2563eb', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>Correo electrónico</p>
                      <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>Soporteucvmatch@outlook.com</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                    <Clock style={{ width: '18px', height: '18px', color: '#ea580c', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: 0 }}>Horario de atención</p>
                      <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px 24px' }}>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ width: '100%', background: '#0f2a5c', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#0b1d42'}
                  onMouseOut={e => e.currentTarget.style.background = '#0f2a5c'}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: '#0f2a5c', color: 'white', border: 'none', borderRadius: '50%', padding: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <MessageCircle style={{ width: '20px', height: '20px' }} />
      </motion.button>
    </>
  );
}
