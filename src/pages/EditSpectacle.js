import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { spectaclesService, performancesService } from '../services/api'
import { handleApiError } from '../utils/errorHandler'

function EditSpectacle() {
  const { id } = useParams()
  const { isAdmin, isOrganizer } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    category: '',
    thumbnail: '',
  })
  const [performances, setPerformances] = useState([])
  const [deletedPerformanceIds, setDeletedPerformanceIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!(isAdmin || isOrganizer)) {
      navigate('/programmation')
      return
    }

    loadSpectacle()
  }, [id, isAdmin, isOrganizer, navigate])

  const toDatetimeLocal = (isoString) => {
    if (!isoString) return ''
    const dt = new Date(isoString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
  }

  const loadSpectacle = async () => {
    try {
      setLoading(true)
      setError(null)
      const spectacle = await spectaclesService.getByIdWithPerformances(id)
      
      setFormData({
        name: spectacle.name || '',
        description: spectacle.description || '',
        duration: spectacle.duration?.toString() || '',
        category: spectacle.category || '',
        thumbnail: spectacle.thumbnail || '',
      })

      const perfs = spectacle.performances || []
      if (perfs.length > 0) {
        setPerformances(perfs.map(p => ({
          id: p.id,
          date: toDatetimeLocal(p.date),
          capacity: p.capacity?.toString() || '',
          unitPrice: p.unitPrice?.toString() || '',
        })))
      } else {
        setPerformances([{ id: null, date: '', capacity: '', unitPrice: '' }])
      }
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

  const handlePerformanceChange = (index, field, value) => {
    const updated = [...performances]
    updated[index] = { ...updated[index], [field]: value }
    setPerformances(updated)
    setError(null)
  }

  const addPerformance = () => {
    setPerformances([...performances, { id: null, date: '', capacity: '', unitPrice: '' }])
  }

  const removePerformance = (index) => {
    const perf = performances[index]
    if (perf.id) {
      setDeletedPerformanceIds(prev => [...prev, perf.id])
    }
    if (performances.length > 1) {
      setPerformances(performances.filter((_, i) => i !== index))
    } else {
      setPerformances([{ id: null, date: '', capacity: '', unitPrice: '' }])
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce spectacle ? Cette action est irréversible.')) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const existingPerfs = performances.filter(p => p.id)
      await Promise.all(existingPerfs.map(p => performancesService.delete(p.id)))
      await spectaclesService.delete(id)
      setSuccess('Spectacle supprimé avec succès !')
      setTimeout(() => {
        navigate('/programmation')
      }, 1500)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setDeleting(false)
    }
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

      // Supprimer les représentations marquées
      await Promise.all(
        deletedPerformanceIds.map(perfId => performancesService.delete(perfId))
      )

      // Mettre à jour / créer les représentations
      const perfPromises = performances
        .filter(p => p.date && p.capacity && p.unitPrice)
        .map(p => {
          const perfDate = new Date(p.date)
          if (perfDate <= new Date()) {
            throw new Error('Les dates de représentation doivent être dans le futur')
          }
          const payload = {
            date: perfDate.toISOString(),
            capacity: parseInt(p.capacity, 10),
            unitPrice: parseFloat(p.unitPrice),
          }
          if (p.id) {
            return performancesService.update(p.id, payload)
          }
          return performancesService.create(id, payload)
        })
      await Promise.all(perfPromises)

      setSuccess('Spectacle et représentations modifiés avec succès !')
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

  if (!(isAdmin || isOrganizer)) {
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

        <div className="form-group" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label style={{ margin: 0 }}>
              <strong>Représentations</strong>
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
            <div key={perf.id || `new-${index}`} style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Représentation #{index + 1}</strong>
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
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date et heure</label>
                  <input
                    type="datetime-local"
                    value={perf.date}
                    onChange={(e) => handlePerformanceChange(index, 'date', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Capacité</label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={perf.capacity}
                    onChange={(e) => handlePerformanceChange(index, 'capacity', e.target.value)}
                    placeholder="Ex: 200"
                  />
                </div>
                <div className="form-group">
                  <label>Prix unitaire (€)</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="0.01"
                    value={perf.unitPrice}
                    onChange={(e) => handlePerformanceChange(index, 'unitPrice', e.target.value)}
                    placeholder="Ex: 45.00"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? 'Suppression...' : 'Supprimer le spectacle'}
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/programmation')}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || deleting}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditSpectacle
