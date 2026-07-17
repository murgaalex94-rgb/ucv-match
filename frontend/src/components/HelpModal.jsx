import { Mail, Phone, Calendar, MessageCircle, X } from 'lucide-react'

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#1e293b] rounded-2xl p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título */}
        <h2 className="text-white font-bold text-lg mb-2 text-center">
          ¿Problema con tu usuario y contraseña?
        </h2>
        
        {/* Subtítulo */}
        <p className="text-gray-300 text-sm mb-6 text-center">
          Comunícate con nuestra área de Soporte para que podamos ayudarte
        </p>

        {/* Secciones de contacto - Lista limpia sin cajas negras */}
        <div className="space-y-4 mb-6">
          {/* Correo electrónico */}
          <div className="flex items-start gap-3">
            <div className="bg-[#0f2a5c] p-2 rounded-lg flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Correo electrónico</p>
              <p className="text-gray-300 text-sm">soporte@ucvmatch.edu.pe</p>
            </div>
          </div>

          {/* Teléfono fijo */}
          <div className="flex items-start gap-3">
            <div className="bg-[#0f2a5c] p-2 rounded-lg flex-shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Teléfono fijo</p>
              <p className="text-gray-300 text-sm">044-123456</p>
            </div>
          </div>

          {/* Horario */}
          <div className="flex items-start gap-3">
            <div className="bg-[#0f2a5c] p-2 rounded-lg flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">Horario</p>
              <p className="text-gray-300 text-sm font-bold">Lunes a Viernes</p>
              <p className="text-gray-500 text-xs">8:00 a.m - 6:00 p.m</p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-start gap-3">
            <div className="bg-[#0f2a5c] p-2 rounded-lg flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">WhatsApp</p>
              <p className="text-gray-300 text-sm">+51 912 345 678</p>
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="w-12 h-12 bg-[#0f2a5c] rounded-full flex items-center justify-center mx-auto transition-colors hover:bg-[#0f2a5c]/90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}

export default HelpModal