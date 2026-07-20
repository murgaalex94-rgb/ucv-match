import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff, ArrowRight, X, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import HelpButton from '../components/HelpButton'
import { supabase } from '../lib/supabase'
import { Turnstile } from '@marsidev/react-turnstile'


const LoginPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [resetCaptchaToken, setResetCaptchaToken] = useState(null)
  const [geoChecked, setGeoChecked] = useState(false)
  const [geoAllowed, setGeoAllowed] = useState(true)
  
  // Rate limiting: failed attempts tracking
  const [failedAttempts, setFailedAttempts] = useState(() => parseInt(localStorage.getItem('login_failed_attempts') || '0', 10))
  const [lockoutUntil, setLockoutUntil] = useState(() => parseInt(localStorage.getItem('login_lockout_until') || '0', 10))
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (location.state?.message) {
      if (location.state.message.includes('confirmar tu correo')) {
        setConfirmationMessage(location.state.message)
      } else {
        setToast(location.state.message)
      }
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Geo-blocking check: only allow Peru IPs
  useEffect(() => {
    const checkGeo = async () => {
      try {
        const res = await fetch('https://ip-api.com/json/?fields=countryCode')
        const data = await res.json()
        if (data.countryCode !== 'PE') {
          setGeoAllowed(false)
        }
      } catch (e) {
        console.warn('Geo check failed:', e)
        setGeoAllowed(false)
      } finally {
        setGeoChecked(true)
      }
    }
    checkGeo()
  }, [])

  // Countdown for lockout
  useEffect(() => {
    if (lockoutUntil > Date.now()) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setCountdown(remaining)
      const timer = setInterval(() => {
        const rem = Math.ceil((lockoutUntil - Date.now()) / 1000)
        if (rem <= 0) {
          setCountdown(0)
          clearInterval(timer)
        } else {
          setCountdown(rem)
        }
      }, 1000)
      return () => clearInterval(timer)
    } else {
      setCountdown(0)
    }
  }, [lockoutUntil])

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError('Por favor, ingresa tu correo electrónico.')
      return
    }
    if (!resetCaptchaToken) {
      setResetError('Por favor, completa el CAPTCHA.')
      return
    }

    setResetError('')
    setIsSending(true)

    try {
      const recoverRes = await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, captchaToken: resetCaptchaToken }),
      })
      const recoverData = await recoverRes.json()

      if (!recoverRes.ok) {
        setResetError(recoverData?.message || 'Error al enviar el correo de recuperación')
      } else {
        setToast('✅ ¡Correo enviado! Revisa tu bandeja de entrada.')
        setTimeout(() => setShowResetModal(false), 1500)
      }
    } catch (err) {
      setResetError(err?.message || 'Error inesperado al enviar el correo')
    } finally {
      setIsSending(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico primero.')
      return
    }
    if (!captchaToken) {
      setError('Por favor, completa el CAPTCHA.')
      return
    }
    setIsSending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: { captchaToken }
      })
      if (error) throw error
      setConfirmationMessage('')
      setToast('✅ Correo reenviado. Revisa tu bandeja de entrada.')
    } catch (err) {
      setError('Error al reenviar: ' + err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    })
    if (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    // Check lockout
    if (lockoutUntil > Date.now()) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
      setError(`Demasiados intentos fallidos. Intenta de nuevo en ${remaining}s.`)
      return
    }

    if (!email || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.')
      return
    }

    if (!captchaToken) {
      setError('Por favor, completa el CAPTCHA.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      // Email hash verification: check if email exists and hash matches
      const { data: hashData, error: hashError } = await supabase
        .rpc('verify_email_hash', { p_email: email })
      
      if (hashError) {
        console.warn('Email hash verification failed:', hashError)
      } else if (hashData && hashData.length > 0 && !hashData[0].email_hash_match) {
        // Email exists but hash doesn't match - possible tampering
        console.error('Email hash mismatch for:', email)
        setError('Credenciales inválidas')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          captchaToken
        }
      })

      if (error) {
        console.error('Login error:', error.message)
        // Increment failed attempts
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        localStorage.setItem('login_failed_attempts', newAttempts.toString())
        
        if (newAttempts >= 5) {
          const until = Date.now() + 30 * 1000 // 30 seconds
          setLockoutUntil(until)
          localStorage.setItem('login_lockout_until', until.toString())
          setError(`Demasiados intentos fallidos. Bloqueado por 30 segundos.`)
        } else {
          setError(error.message || 'Error al iniciar sesión')
        }
        return
      }

      // Success: reset failed attempts
      setFailedAttempts(0)
      localStorage.removeItem('login_failed_attempts')
      localStorage.removeItem('login_lockout_until')
      
      navigate('/dashboard')
    } catch (err) {
      console.error('Unexpected error:', err.message)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="flex w-full h-screen bg-white overflow-hidden font-sans">
      {/* ========== LEFT PANEL (Desktop only) ========== */}
      <div className="hidden md:flex flex-1 min-h-screen relative overflow-hidden">
        <img
          src="/hero_panel_ucv.png"
          alt="Hero UCV Match"
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      {/* ========== RIGHT PANEL (Form) ========== */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-6 md:p-8 relative">
        <div className="w-full max-w-md">

{/* Logo Central */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <img src="/escudo_ucv.png" alt="Logo UCV" className="w-14 h-14 object-contain bg-transparent" />
            <span className="text-2xl font-bold text-[#0f2a5c] tracking-wide">UCV Match</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f2a5c] mb-1 text-center tracking-tight">¡Bienvenido de nuevo!</h1>
          <p className="text-gray-500 text-sm mb-8 text-center">Ingresa tus credenciales para acceder a la comunidad académica UCV.</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {countdown > 0 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm text-center animate-pulse">
                <svg className="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6a1 1 0 00-2 0v4z" clipRule="evenodd" />
                </svg>
                Cuenta bloqueada temporalmente. Intenta de nuevo en {countdown}s.
              </div>
            )}

            {error && !countdown && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            {confirmationMessage && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                <p>{confirmationMessage}</p>
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isSending}
                  className="mt-3 w-full bg-[#0f2a5c] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50"
                >
                  {isSending ? 'Enviando...' : 'Reenviar correo de confirmación'}
                </button>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full pl-11 pr-12 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
                required
              />
              {/* Geo indicator */}
              {!geoChecked && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verificando...
                </div>
              )}
              {!geoAllowed && geoChecked && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600 text-xs flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Acceso solo desde Perú
                </div>
              )}
              {geoAllowed && geoChecked && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a1 1 0 00-1.664-.828l-3 4a1 1 0 000 1.642l1.5 2a1 1 0 001.414 0l3-4z" clipRule="evenodd" /></svg>
                  IP verificada (Perú)
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
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

            {/* Remember me + Forgot password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 accent-[#0f2a5c] focus:ring-[#0f2a5c] cursor-pointer"
                />
                Recordarme
              </label>
              <button type="button" onClick={() => { setShowResetModal(true); setResetEmail(email); setResetError(''); setResetCaptchaToken(null) }} className="text-sm text-[#0f2a5c] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer">¿Olvidaste tu contraseña?</button>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center mb-4">
              <Turnstile
                siteKey="0x4AAAAAAD5N1f3IsK41YBT4"
                options={{ theme: 'light' }}
                onSuccess={(token) => setCaptchaToken(token)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f2a5c] text-white py-4 rounded-lg font-bold relative hover:bg-[#0f2a5c]/90 transition-colors disabled:opacity-50"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
                {!isLoading && <ArrowRight className="w-5 h-5" />}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400">o continúa con</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center">
            <button type="button" onClick={handleGoogleLogin} className="px-10 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>

          {/* Register */}
          <p className="text-center text-sm text-slate-500 mt-10">
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#0f2a5c] font-semibold hover:underline"
            >
              Regístrate
            </button>
          </p>
        </div>

      </div>
    </motion.div>
      {showResetModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowResetModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '100%', maxWidth: '400px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: '#0f2a5c', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>Recuperar contraseña</h2>
              <button type="button" onClick={() => setShowResetModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resetError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>{resetError}</div>}
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
              <input
                type="text"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="Ingresa tu correo electrónico"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0f2a5c]/30 focus:border-[#0f2a5c] outline-none transition-all"
              />
              <div className="flex justify-center">
                <Turnstile
                  siteKey="0x4AAAAAAD5N1f3IsK41YBT4"
                  options={{ theme: 'light' }}
                  onSuccess={(token) => setResetCaptchaToken(token)}
                />
              </div>
              <button
                type="button"
                disabled={isSending}
                onClick={handleResetPassword}
                style={{ width: '100%', background: '#0f2a5c', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: isSending ? 0.5 : 1 }}
              >
                {isSending ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{ width: '100%', background: 'none', color: '#6b7280', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: 'fixed', top: '16px', right: '16px', background: '#16a34a', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', zIndex: 9999, fontSize: '14px', fontWeight: 500 }}>
          {toast}
        </div>
      )}
      <HelpButton />
    </>
  )
}

export default LoginPage