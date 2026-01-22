import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { spectaclesService, performancesService } from '../services/api'
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
    category: '',
    thumbnail: '',
  })
  const [performances, setPerformances] = useState([
    { date: '', capacity: '', unitPrice: '' }
  ])
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

  const handlePerformanceChange = (index, field, value) => {
    const updated = [...performances]
    updated[index] = { ...updated[index], [field]: value }
    setPerformances(updated)
    setError(null)
  }

  const addPerformance = () => {
    setPerformances([...performances, { date: '', capacity: '', unitPrice: '' }])
  }

  const removePerformance = (index) => {
    if (performances.length > 1) {
      setPerformances(performances.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    // Validation basique
    if (!formData.name || !formData.category || !formData.duration) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    // Convertir la durée en minutes (si c'est un nombre)
    const durationInMinutes = parseInt(formData.duration, 10)
    if (isNaN(durationInMinutes) || durationInMinutes < 1 || durationInMinutes > 600) {
      setError('La durée doit être un nombre entre 1 et 600 minutes')
      setLoading(false)
      return
    }

    try {
      // 1. Créer le spectacle
      const createdSpectacle = await spectaclesService.create({
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        duration: durationInMinutes,
        thumbnail: formData.thumbnail || null,
      })

      // 2. Créer les représentations si elles sont définies
      if (performances.length > 0 && performances[0].date) {
        const performancePromises = performances
          .filter(perf => perf.date && perf.capacity && perf.unitPrice)
          .map(perf => {
            const performanceDate = new Date(perf.date)
            // S'assurer que la date est dans le futur
            if (performanceDate <= new Date()) {
              throw new Error('Les dates de représentation doivent être dans le futur')
            }
            return performancesService.create(createdSpectacle.id, {
              date: performanceDate.toISOString(),
              capacity: parseInt(perf.capacity, 10),
              unitPrice: parseFloat(perf.unitPrice),
            })
          })

        await Promise.all(performancePromises)
      }

      setSuccess('Spectacle et représentations créés avec succès !')
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        duration: '',
        category: '',
        thumbnail: '',
      })
      setPerformances([{ date: '', capacity: '', unitPrice: '' }])
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

          <div className="form-group" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ margin: 0 }}>
                <strong>Représentations</strong> (au moins une requise)
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addPerformance}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                + Ajouter une représentation
              </button>
            </div>

            {performances.map((perf, index) => (
              <div key={index} style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong>Représentation #{index + 1}</strong>
                  {performances.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerformance(index)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#dc3545', 
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date et heure <span className="required">*</span></label>
                    <input
                      type="datetime-local"
                      value={perf.date}
                      onChange={(e) => handlePerformanceChange(index, 'date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacité <span className="required">*</span></label>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      value={perf.capacity}
                      onChange={(e) => handlePerformanceChange(index, 'capacity', e.target.value)}
                      required
                      placeholder="Ex: 200"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prix unitaire (€) <span className="required">*</span></label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="0.01"
                      value={perf.unitPrice}
                      onChange={(e) => handlePerformanceChange(index, 'unitPrice', e.target.value)}
                      required
                      placeholder="Ex: 45.00"
                    />
                  </div>
                </div>
              </div>
            ))}
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
