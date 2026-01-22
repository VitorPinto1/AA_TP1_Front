import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { spectaclesService } from '../services/api'
import { handleApiError } from '../utils/errorHandler'

function EditSpectacle() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    category: '',
    thumbnail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/programmation')
      return
    }

    loadSpectacle()
  }, [id, isAdmin, navigate])

  const loadSpectacle = async () => {
    try {
      setLoading(true)
      setError(null)
      const spectacle = await spectaclesService.getById(id)
      
      setFormData({
        name: spectacle.name || '',
        description: spectacle.description || '',
        duration: spectacle.duration?.toString() || '',
        category: spectacle.category || '',
        thumbnail: spectacle.thumbnail || '',
      })
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
    setSaving(true)

    // Validation basique
    if (!formData.name || !formData.category || !formData.duration) {
      setError('Veuillez remplir tous les champs obligatoires')
      setSaving(false)
      return
    }

    // Convertir la durée en minutes
    const durationInMinutes = parseInt(formData.duration, 10)
    if (isNaN(durationInMinutes) || durationInMinutes < 1 || durationInMinutes > 600) {
      setError('La durée doit être un nombre entre 1 et 600 minutes')
      setSaving(false)
      return
    }

    try {
      await spectaclesService.update(id, {
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        duration: durationInMinutes,
        thumbnail: formData.thumbnail || null,
      })
      setSuccess('Spectacle modifié avec succès !')
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/programmation')
      }, 2000)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!isAdmin) {
    return (
      <div className="creation-page">
        <div className="alert error">Accès refusé. Cette page est réservée aux administrateurs.</div>
      </div>
    )
  }

  return (
    <div className="creation-page">
      <h2>Modifier le spectacle</h2>

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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Description du spectacle..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duration">
              Durée (en minutes) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
              max="600"
              placeholder="Ex: 130"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              Catégorie <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Theatre">Théâtre</option>
              <option value="Concert">Concert</option>
              <option value="Danse">Danse</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">URL de l'image (optionnel)</label>
          <input
            type="url"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/programmation')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditSpectacle
