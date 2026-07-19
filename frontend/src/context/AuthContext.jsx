import { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga el perfil del usuario desde la tabla profiles
  const loadProfile = async (sessionUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single()

      if (profileError) {
        console.warn('Error fetching profile (table may not exist or RLS issue):', profileError.message)
        // Usar datos de la sesión como fallback
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          nombre: sessionUser.user_metadata?.nombre_completo || '',
          rol: sessionUser.user_metadata?.rol || 'JUNIOR',
          carrera: sessionUser.user_metadata?.carrera || '',
          ciclo: sessionUser.user_metadata?.ciclo || null,
          promedio: sessionUser.user_metadata?.promedio || null,
          estilo_aprendizaje: sessionUser.user_metadata?.estilo_aprendizaje || '',
          avatar_url: sessionUser.user_metadata?.avatar_url || null
        })
        return
      }

      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        nombre: profile?.nombre_completo,
        rol: profile?.rol,
        carrera: profile?.carrera,
        ciclo: profile?.ciclo,
        promedio: profile?.promedio,
        estilo_aprendizaje: profile?.estilo_aprendizaje,
        avatar_url: profile?.avatar_url
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      // Si falla el perfil, igual guardar datos básicos de la sesión
      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        nombre: sessionUser.user_metadata?.nombre_completo || '',
        rol: sessionUser.user_metadata?.rol || 'JUNIOR',
      })
    }
  }

  useEffect(() => {
    let profileLoaded = false

    // 1. Revisar sesión existente al cargar
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadProfile(session.user)
          profileLoaded = true
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          // Evitar cargar el perfil dos veces si initAuth ya lo hizo
          if (!profileLoaded) {
            await loadProfile(session.user)
          }
          profileLoaded = true
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          profileLoaded = false
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await loadProfile(session.user)
        }
      }
    )

    // Cleanup: desuscribirse al desmontar
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // onAuthStateChange se encargará de actualizar el user
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      }
    }
  }

  const register = async (data) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nombre_completo: data.nombre,
            codigo_estudiante: data.codigoEstudiante,
            rol: data.rol,
            carrera: data.carrera,
            ciclo: parseInt(data.ciclo),
            promedio: parseFloat(data.promedio),
            estilo_aprendizaje: data.estiloAprendizaje
          }
        }
      })

      if (error) throw error

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al registrar'
      }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    // onAuthStateChange se encargará de setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
