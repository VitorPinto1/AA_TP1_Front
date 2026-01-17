import { createContext, useContext, useState, useEffect } from 'react'
import { usersService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté (localStorage)
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const data = await usersService.login(email, password)
      setUser(data)
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      setError(err.message || 'Erreur de connexion')
      throw err
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
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
