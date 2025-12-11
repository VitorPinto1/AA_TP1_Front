import { useState } from 'react'

function Login({ onLoginSuccess, onSwitchToCreateAccount }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation basique
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer un email valide')
      setLoading(false)
      return
    }

    try {
      // TODO: Appel API pour la connexion
      // const response = await usersService.login(formData.email, formData.password)
      // Pour l'instant, on simule juste le succès
      console.log('Tentative de connexion:', formData)
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      setError('Erreur lors de la connexion. Vérifiez vos identifiants.')
      console.error('Erreur de connexion:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <h2>Se connecter</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre.email@exemple.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Votre mot de passe"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="auth-switch">
        <p>Vous n'avez pas de compte ?</p>
        <button type="button" className="btn-link" onClick={onSwitchToCreateAccount}>
          Créer un compte
        </button>
      </div>
    </div>
  )
}

export default Login
