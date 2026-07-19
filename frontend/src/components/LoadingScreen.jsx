import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-gradient-to-br from-[#0f2a5c] via-[#1a3b7a] to-[#0f2a5c] flex flex-col items-center justify-center"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 mb-2">
        <img
          src="/Logo_UCV.png"
          alt="Logo UCV"
          className="w-14 h-14 object-contain"
        />
      </div>
      <h2 className="text-white text-2xl font-bold tracking-wide mb-4">UCV Match</h2>
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
      </div>
      <p className="text-white/60 text-xs tracking-[0.3em] uppercase mt-4">Cargando...</p>
    </motion.div>
  );
}
