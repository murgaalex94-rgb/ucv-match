import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Shield, Smartphone, HardDrive, Info, ChevronLeft, ChevronRight, Home, Star, CheckCircle } from 'lucide-react';

const APP_VERSION = '1.0.0';
const APP_SIZE = '145 MB';
const APK_URL = 'https://github.com/murgaalex94-rgb/ucv-match/releases/download/v1.0.0/UCV-Match.apk';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
};

export default function DescargarPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    window.open(APK_URL, '_blank');
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  const scrollCarousel = (direction) => {
    if (scrollRef.current) {
      const amount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const specs = [
    { icon: Info, label: 'Versión', value: APP_VERSION, color: 'blue' },
    { icon: HardDrive, label: 'Tamaño', value: APP_SIZE, color: 'green' },
    { icon: Smartphone, label: 'Requiere', value: 'Android 5.0+', color: 'purple' },
  ];

  const screenshots = [
    { src: '/screenshots/screen1.png', alt: 'Pantalla de inicio de UCV Match' },
    { src: '/screenshots/screen2.png', alt: 'Panel de mentorías' },
    { src: '/screenshots/screen3.png', alt: 'Chat de mensajes' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="min-h-screen bg-[#f5f7fa] font-sans flex flex-col"
    >
      {/* HEADER */}
      <header className="bg-[#0a1f3d] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 border border-white text-white rounded-lg text-sm font-medium hover:bg-white/10 transition min-h-[44px]"
            >
              <Home className="w-4 h-4" />
              Inicio
            </button>
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        {/* BANNER DE DESCARGA */}
        <section className="bg-gradient-to-b from-[#0a1f3d] via-[#0d2a52] to-[#0a1f3d]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left"
            >
              {/* App Icon */}
              <motion.div
                custom={0}
                variants={fadeUp}
                className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-[28px] shadow-2xl flex items-center justify-center flex-shrink-0 border-4 border-white/20"
              >
                <img
                  src="/escudo_ucv.png"
                  alt="UCV Match App Icon"
                  className="w-20 h-20 md:w-28 md:h-28 object-contain"
                />
              </motion.div>

              {/* App Info */}
              <div className="flex-1">
                <motion.h1
                  custom={1}
                  variants={fadeUp}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                >
                  UCV Match
                </motion.h1>
                <motion.div custom={2} variants={fadeUp} className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-blue-200 text-sm">5.0 • Universidad César Vallejo</span>
                </motion.div>
                <motion.p custom={3} variants={fadeUp} className="text-blue-200 text-sm md:text-base mb-6">
                  Plataforma de mentoría universitaria • v{APP_VERSION} • {APP_SIZE}
                </motion.p>

                {/* Download Button */}
                <motion.div custom={4} variants={fadeUp}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(233, 69, 96, 0.4)' }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onClick={handleDownload}
                    disabled={downloadStarted}
                    className={`w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-lg font-bold transition shadow-lg min-h-[56px] ${
                      downloadStarted
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {downloadStarted ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        ¡Descarga iniciada!
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Descargar APK ({APP_SIZE})
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ESPECIFICACIONES */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {specs.map((spec, i) => (
              <motion.div
                key={spec.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-white rounded-2xl shadow-md p-5 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 bg-${spec.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <spec.icon className={`w-6 h-6 text-${spec.color}-600`} />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">{spec.label}</p>
                <p className="text-lg font-bold text-gray-800">{spec.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ADVERTENCIA DE SEGURIDAD */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 mt-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-bold text-amber-800 mb-2 flex items-center gap-2">
                  ⚠️ Advertencia de Google Play Protect
                </h3>
                <p className="text-sm md:text-base text-amber-900 leading-relaxed">
                  Al descargar e instalar este APK (que no está en la Play Store oficial), Google Play Protect
                  te mostrará un aviso diciendo que la app <strong>"podría ser dañina"</strong> o que{' '}
                  <strong>"no la reconoce"</strong>.
                </p>
                <p className="text-sm md:text-base text-amber-900 leading-relaxed mt-3">
                  Esto es completamente <strong>NORMAL</strong> para aplicaciones independientes.{' '}
                  <strong>UCV Match es 100% segura y no contiene virus.</strong> Para instalarla, solo haz clic en{' '}
                  <span className="bg-amber-200 px-1.5 py-0.5 rounded font-semibold text-amber-900">"Más detalles"</span>{' '}
                  y luego en{' '}
                  <span className="bg-amber-200 px-1.5 py-0.5 rounded font-semibold text-amber-900">"Instalar de todas formas"</span>.
                </p>
                <p className="text-sm text-amber-700 mt-3">
                  Si no ves esa opción, ve a <strong>Ajustes → Seguridad</strong> y desactiva temporalmente Play Protect.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CAPTURAS DE PANTALLA */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 mt-10 mb-4">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xl md:text-2xl font-bold text-gray-800 mb-5"
          >
            📸 Capturas de pantalla
          </motion.h2>

          <div className="relative group">
            {/* Scroll Buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 transition opacity-0 group-hover:opacity-100"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:bg-white hover:text-gray-900 transition opacity-0 group-hover:opacity-100"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {screenshots.map((shot, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex-shrink-0 w-[260px] md:w-[300px] snap-start"
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      className="w-full h-[460px] md:h-[530px] object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-[460px] md:h-[530px] bg-gradient-to-br from-[#0a1f3d] to-[#1a3a6d] flex flex-col items-center justify-center text-white p-6">
                            <span class="text-5xl mb-4">📱</span>
                            <span class="text-sm text-blue-200 text-center">${shot.alt}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DESCRIPCIÓN */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 mt-6 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              Sobre UCV Match
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
              UCV Match conecta a estudiantes de la UCV para compartir conocimientos.
              Encuentra mentores y potencia tu aprendizaje.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Mentoría', 'Comunidad', 'Recursos', 'Chat', 'Logros'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* INSTRUCCIONES DE INSTALACIÓN */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 mb-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="bg-white rounded-2xl shadow-md p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5">
              📲 Cómo instalar
            </h2>
            <div className="space-y-4">
              {[
                { step: '1', text: 'Descarga el archivo APK usando el botón de arriba' },
                { step: '2', text: 'Abre el archivo descargado desde tus notificaciones o carpeta de descargas' },
                { step: '3', text: 'Si te aparece un aviso de seguridad, toca "Más detalles" → "Instalar de todas formas"' },
                { step: '4', text: '¡Abre UCV Match y comienza a aprender! 🎓' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#0a1f3d] text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-gray-600 text-sm md:text-base pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a1f3d] text-center py-6">
        <p className="text-xs md:text-sm text-blue-200">
          &copy; {new Date().getFullYear()} UCV Match. Todos los derechos reservados.
        </p>
      </footer>

      {/* Hidden scrollbar style */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
