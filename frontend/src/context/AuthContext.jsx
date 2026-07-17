import { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ml_token')
    if (token) {
      setToken(token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, userId, nombre, email: userEmail, rol, pendingValidation } = response.data
      
      localStorage.setItem('ml_token', token)
      setToken(token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser({
        id: userId,
        nombre,
        email: userEmail,
        rol,
        pendingValidation
      })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      }
    }
  }

  // Demo login sin backend
  const demoLogin = (email, password) => {
    const mockUser = {
      id: 1,
      nombre: 'Alex Murga',
      email: email,
      rol: 'JUNIOR',
      pendingValidation: false
    }
    const mockToken = 'demo-token-' + Date.now()
    
    localStorage.setItem('ml_token', mockToken)
    setToken(mockToken)
    setUser(mockUser)
    
    return { success: true }
  }

  const register = async (data) => {
    try {
      const response = await axios.post('/api/auth/register', data)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('ml_token')
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      const { usuario, estudiante } = response.data
      
      setUser({
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        pendingValidation: estudiante?.esSenior && !estudiante?.seniorValidado
      })
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, register, logout, loading }}>
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
