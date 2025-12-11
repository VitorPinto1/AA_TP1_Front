import { useState, useEffect } from 'react'
import { usersService } from '../services/api'

function User() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      // Pour l'instant, on simule un utilisateur
      // À remplacer par un appel API réel
      const userId = 1 // À récupérer depuis l'auth
      const data = await usersService.getById(userId)
      setUser(data)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!user) {
    return <div className="user-page">Veuillez vous connecter</div>
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
          <p><strong>Âge:</strong> {user.age}</p>
          <p><strong>Téléphone:</strong> {user.phone}</p>
          <p><strong>Compte confirmé:</strong> {user.confirmed_users ? 'Oui' : 'Non'}</p>
        </div>
      </div>
    </div>
  )
}

export default User

