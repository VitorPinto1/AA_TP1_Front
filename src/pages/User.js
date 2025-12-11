import { useState, useEffect } from 'react'
import { usersService } from '../services/api'
import Login from '../components/Login'
import CreateAccount from '../components/CreateAccount'

function User() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('menu') 

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userId = 1 
      const data = await usersService.getById(userId)
      setUser(data)
      if (data) {
        setView('profile')
      } else {
        setView('menu')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setView('menu')
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    // Après connexion réussie, charger le profil
    loadUser()
  }

  const handleAccountCreated = () => {
    // Après création de compte, passer à la vue de connexion
    setView('login')
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  // Vue menu avec les deux boutons
  if (view === 'menu') {
    return (
      <div className="user-page">
        <h2>Mon Compte</h2>
        <div className="auth-menu">
          <button 
            className="btn btn-primary btn-large" 
            onClick={() => setView('login')}
          >
            Se connecter
          </button>
          <button 
            className="btn btn-primary btn-large" 
            onClick={() => setView('createAccount')}
          >
            Créer un compte
          </button>
        </div>
      </div>
    )
  }

  // Vue de connexion
  if (view === 'login') {
    return (
      <div className="user-page">
        <button 
          className="btn-back" 
          onClick={() => setView('menu')}
        >
          ← Retour
        </button>
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToCreateAccount={() => setView('createAccount')}
        />
      </div>
    )
  }

  // Vue de création de compte
  if (view === 'createAccount') {
    return (
      <div className="user-page">
        <button 
          className="btn-back" 
          onClick={() => setView('menu')}
        >
          ← Retour
        </button>
        <CreateAccount 
          onAccountCreated={handleAccountCreated}
          onSwitchToLogin={() => setView('login')}
        />
      </div>
    )
  }

  // Vue du profil utilisateur
  if (user) {
    return (
      <div className="user-page">
        <h2>Mon Compte</h2>
        <div className="user-profile">
          <div className="profile-info">
            <p><strong>Nom:</strong> {user.name}</p>
            <p><strong>Prénom:</strong> {user.surname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rôle:</strong> {user.role}</p>
            <p><strong>Âge:</strong> {user.age}</p>
            <p><strong>Téléphone:</strong> {user.phone}</p>
            <p><strong>Compte confirmé:</strong> {user.confirmed_users ? 'Oui' : 'Non'}</p>
          </div>
        </div>
      </div>
    )
  }

  return <div className="user-page">Veuillez vous connecter</div>
}

export default User

