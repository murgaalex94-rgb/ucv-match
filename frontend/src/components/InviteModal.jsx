import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

const INVITE_LINK = 'https://ucv-match.vercel.app'

export default function InviteModal({ onClose }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('No se pudo copiar el enlace. Cópialo manualmente: ' + INVITE_LINK)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-bold text-[#0f2a5c]">🎉 Invita a tus amigos a UCV Match</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pt-3">
          <p className="text-sm text-gray-500 mb-4">Comparte el enlace con tus compañeros y haz crecer la comunidad.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={INVITE_LINK}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-[#0f2a5c] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#0f2a5c]/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
