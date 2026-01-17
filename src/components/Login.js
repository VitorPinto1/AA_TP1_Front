import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { validateLogin } from '../utils/validators'
import { handleApiError } from '../utils/errorHandler'

function Login({ onLoginSuccess, onSwitchToCreateAccount }) {
  const { login } = useAuth()
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

    // Validation
    const validation = validateLogin(formData)
    if (!validation.valid) {
      setError(Object.values(validation.errors)[0])
      setLoading(false)
      return
    }

    try {
      await login(formData.email, formData.password)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
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
