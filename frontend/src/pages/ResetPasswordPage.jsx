import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

const requirements = [
  { label: 'Entre 8 a 16 caracteres', test: (p) => p.length >= 8 && p.length <= 16 },
  { label: 'Al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p) => /[0-9]/.test(p) },
]

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setSession(data.session)
        setLoading(false)
      } else {
        const hash = window.location.hash
        if (hash) {
          const params = new URLSearchParams(hash.substring(1))
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')
          const type = params.get('type')
          if (access_token && type === 'recovery') {
            supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error: err }) => {
              if (err) {
                setError('El enlace ha expirado o no es válido. Solicita un nuevo cambio de contraseña.')
              } else if (data?.session) {
                setSession(data.session)
              } else {
                setError('No se pudo verificar tu identidad. Intenta de nuevo.')
              }
              setLoading(false)
            })
          } else {
            setError('Enlace inválido. Solicita un nuevo cambio de contraseña.')
            setLoading(false)
          }
        } else {
          setError('No se encontró una sesión activa. Solicita un nuevo cambio de contraseña.')
          setLoading(false)
        }
      }
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const valid = requirements.every((r) => r.test(password))
    if (!valid) {
      setError('La contraseña no cumple con todos los requisitos.')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Verificando enlace...</span>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full mx-4 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0f2a5c] mb-2">Enlace inválido o expirado</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#0f2a5c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0f2a5c]/90 transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="max-w-md mx-auto mt-20 bg-white rounded-2xl p-8 shadow-lg w-full"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src="/escudo_ucv.png" alt="UCV" className="w-14 h-14 object-contain" />
          <span className="text-xl font-bold text-[#0f2a5c]">UCV Match</span>
        </div>

        <h1 className="text-2xl font-bold text-[#0f2a5c] text-center mb-6">Cambio de contraseña</h1>

        {success ? (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-green-700 font-medium mb-2">¡Contraseña actualizada exitosamente!</p>
            <p className="text-gray-500 text-sm">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full pl-11 pr-11 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <ul className="space-y-1.5 text-sm">
              {requirements.map((req) => {
                const passed = req.test(password)
                return (
                  <li key={req.label} className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                    {passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {req.label}
                  </li>
                )
              })}
            </ul>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirma tu contraseña"
                className="w-full pl-11 pr-11 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {confirm && password !== confirm && (
              <p className="text-red-500 text-xs -mt-3">Las contraseñas no coinciden.</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0f2a5c] text-white py-4 rounded-lg font-bold hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage
