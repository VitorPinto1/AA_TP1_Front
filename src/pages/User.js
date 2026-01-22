import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Login from '../components/Login'
import CreateAccount from '../components/CreateAccount'

function User() {
  const navigate = useNavigate()
  const { user, loading, updateUser, logout } = useAuth()
  const [view, setView] = useState('menu')

  useEffect(() => {
    if (user) {
      setView('profile')
    } else {
      setView('menu')
    }
  }, [user])

  const handleLoginSuccess = async () => {
    // L'utilisateur est déjà mis à jour via AuthContext
    if (user) {
      setView('profile')
    }
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
    const handleLogout = () => {
      logout()
      setView('menu')
      navigate('/')
    }

    return (
      <div className="user-page">
        <h2>Mon Compte</h2>
        <div className="user-profile">
          <div className="profile-info">
            <p><strong>Nom:</strong> {user.name}</p>
            <p><strong>Prénom:</strong> {user.surname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rôle:</strong> {user.role}</p>
            {user.age && <p><strong>Âge:</strong> {user.age}</p>}
            {user.phone && <p><strong>Téléphone:</strong> {user.phone}</p>}
            {user.confirmed_users !== undefined && (
              <p><strong>Compte confirmé:</strong> {user.confirmed_users ? 'Oui' : 'Non'}</p>
            )}
          </div>
          <div className="profile-actions" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <div className="user-page">Veuillez vous connecter</div>
}

export default User

