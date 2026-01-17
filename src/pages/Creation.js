import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { spectaclesService } from '../services/api'
import { handleApiError } from '../utils/errorHandler'

function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!isAdmin) {
    navigate('/')
    return null
  }

  return children
}

function Creation() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    Type: '',
    date: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    // Validation basique
    if (!formData.name || !formData.description || !formData.duration || !formData.Type) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    try {
      await spectaclesService.create(formData)
      setSuccess('Spectacle créé avec succès !')
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        duration: '',
        Type: '',
        date: '',
        image_url: '',
      })
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/programmation')
      }, 2000)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="creation-page">
        <div className="alert error">Accès refusé. Cette page est réservée aux administrateurs.</div>
      </div>
    )
  }

  return (
    <RequireAdmin>
      <div className="creation-page">
        <h2>Créer un nouveau spectacle</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form className="creation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Nom du spectacle <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ex: Le Roi Lion"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Description du spectacle..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">
                Durée <span className="required">*</span>
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="Ex: 2h10"
              />
            </div>

            <div className="form-group">
              <label htmlFor="Type">
                Type <span className="required">*</span>
              </label>
              <select
                id="Type"
                name="Type"
                value={formData.Type}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un type</option>
                <option value="Comédie">Comédie</option>
                <option value="Drame">Drame</option>
                <option value="Comédie musicale">Comédie musicale</option>
                <option value="Drame musical">Drame musical</option>
                <option value="Ballet">Ballet</option>
                <option value="Impro">Impro</option>
                <option value="Conte musical">Conte musical</option>
                <option value="Théâtre">Théâtre</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date (optionnel)</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">URL de l'image (optionnel)</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/programmation')}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer le spectacle'}
            </button>
          </div>
        </form>
      </div>
    </RequireAdmin>
  )
}

export default Creation
