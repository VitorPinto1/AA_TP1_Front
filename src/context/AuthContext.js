import { createContext, useContext, useState, useEffect } from 'react'
import { authService, usersService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      // La réponse contient { token: "...", user: {...} }
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      return response
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
      throw err
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authService.register(userData)
      // La réponse contient { token: "...", user: {...} }
      setUser(response.user)
      setToken(response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      return response
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription')
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const updateUser = async (userId) => {
    try {
      const data = await usersService.getById(userId)
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err)
      throw err
    }
  }

  const refreshCurrentUser = async () => {
    try {
      const data = await authService.getCurrentUser()
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err)
      // Si le token est invalide, déconnecter l'utilisateur
      if (err.response?.status === 401) {
        logout()
      }
      throw err
    }
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshCurrentUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'Admin',
    isOrganizer: user?.role === 'Organizer',
    isClient: user?.role === 'Client',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
