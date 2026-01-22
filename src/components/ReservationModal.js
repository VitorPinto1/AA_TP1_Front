import { useEffect, useMemo, useState } from 'react'
import { spectaclesService } from '../services/api'
import { validateReservation } from '../utils/validators'

function ReservationModal({ spectacle, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(null)
  const [performances, setPerformances] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPerformances, setLoadingPerformances] = useState(true)
  const [error, setError] = useState(null)

  // Charger les performances du spectacle
  useEffect(() => {
    const loadPerformances = async () => {
      if (!spectacle?.id) return
      
      setLoadingPerformances(true)
      setError(null)
      try {
        const spectacleData = await spectaclesService.getByIdWithPerformances(spectacle.id)
        if (spectacleData?.performances && spectacleData.performances.length > 0) {
          // Filtrer uniquement les performances à venir et disponibles
          const availablePerformances = spectacleData.performances.filter(
            p => p.status === 'Scheduled' && p.availableTickets > 0
          )
          setPerformances(availablePerformances)
          // Sélectionner la première performance par défaut
          if (availablePerformances.length > 0) {
            setSelectedPerformanceId(availablePerformances[0].id)
          }
        } else {
          setError('Aucune représentation disponible pour ce spectacle')
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des représentations')
      } finally {
        setLoadingPerformances(false)
      }
    }

    loadPerformances()
  }, [spectacle])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!selectedPerformanceId) {
      setError('Veuillez sélectionner une représentation')
      return
    }

    if (Number(quantity) <= 0) {
      setError('La quantité doit être supérieure à 0')
      return
    }

    setLoading(true)
    try {
      await onConfirm({
        performanceId: selectedPerformanceId,
        quantity: Number(quantity),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setQuantity(1)
    setSelectedPerformanceId(null)
    setError(null)
  }, [spectacle])

  if (!spectacle) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Réserver {spectacle.name}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          {loadingPerformances ? (
            <div className="loading">Chargement des représentations...</div>
          ) : performances.length === 0 ? (
            <div className="form-error">Aucune représentation disponible</div>
          ) : (
            <>
              <label>
                Représentation
                <select
                  value={selectedPerformanceId || ''}
                  onChange={(e) => setSelectedPerformanceId(Number(e.target.value))}
                  required
                >
                  <option value="">Sélectionnez une représentation</option>
                  {performances.map((perf) => (
                    <option key={perf.id} value={perf.id}>
                      {new Date(perf.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {perf.unitPrice}€ ({perf.availableTickets} places disponibles)
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantité de tickets
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </label>
            </>
          )}
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || loadingPerformances || performances.length === 0}
            >
              {loading ? 'Validation...' : 'Confirmer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationModal

