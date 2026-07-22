import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.5 + i * 0.15, duration: 0.6, ease: 'easeOut' }
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-[#f5f7fa] font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-[#0a1f3d] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/escudo_ucv.png" 
              alt="Logo UCV" 
              className="w-8 h-8 md:w-10 md:h-10 object-contain" 
            />
            <span className="text-xl md:text-2xl font-bold text-white tracking-wide">
              UCV Match
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full md:w-auto"
            >
              <button
                onClick={() => navigate('/login')}
                className="w-full md:w-auto px-5 py-3 border border-white text-white rounded-lg text-sm font-medium hover:bg-white/10 transition min-h-[44px] py-3 md:py-2"
              >
                Iniciar Sesión
              </button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full md:w-auto"
            >
              <button
                onClick={() => navigate('/register')}
                className="w-full md:w-auto px-5 py-3 bg-white text-[#0a1f3d] rounded-lg text-sm font-medium hover:bg-gray-100 transition min-h-[44px] py-3 md:py-2"
              >
                Registrarse
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1">
        <section className="bg-[#0a1f3d] text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Conecta. Aprende. Haz Match.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base md:text-lg text-blue-200 mb-8 max-w-2xl mx-auto"
            >
              La plataforma que conecta estudiantes de la UCV para compartir
              conocimientos, encontrar mentores y potenciar tu aprendizaje.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full md:w-auto"
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                onClick={() => navigate('/register')}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition shadow-lg min-h-[44px]"
              >
                Comenzar ahora →
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* CARDS SECTION */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 -mt-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Users, color: 'blue', title: 'Mentoría entre estudiantes', desc: 'Conéctate con compañeros de semestres avanzados que te guiarán en tu camino académico.' },
              { icon: BookOpen, color: 'green', title: 'Recursos académicos', desc: 'Accede a apuntes, guías y materiales compartidos por la comunidad universitaria.' },
              { icon: Award, color: 'yellow', title: 'Reconocimiento', desc: 'Gana puntos y badges por tu participación activa en la comunidad de aprendizaje.' }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-md p-5 md:p-6 text-center"
              >
                <div className={`w-14 h-14 bg-${card.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <card.icon className={`w-7 h-7 text-${card.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-base md:text-lg">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a1f3d] text-center py-6">
        <p className="text-xs md:text-sm text-blue-200">
          &copy; {new Date().getFullYear()} UCV Match. Todos los derechos reservados.
        </p>
      </footer>
      </motion.div>
  );
}
