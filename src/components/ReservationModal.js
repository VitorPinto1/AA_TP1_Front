import { useEffect, useMemo, useState } from 'react'
import { validateReservation } from '../utils/validators'

function ReservationModal({ spectacle, onClose, onConfirm }) {
  const initialDate = useMemo(() => {
    if (!spectacle?.date) return ''
    // Ensure format YYYY-MM-DD for input[type=date]
    return spectacle.date.slice(0, 10)
  }, [spectacle])

  const [quantity, setQuantity] = useState(1)
  const [date, setDate] = useState(initialDate)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    const validation = validateReservation({
      spectacleId: spectacle.id,
      quantity: Number(quantity),
      date,
    })

    if (!validation.valid) {
      setError(Object.values(validation.errors)[0])
      return
    }

    setLoading(true)
    try {
      await onConfirm({
        spectacleId: spectacle.id,
        quantity: Number(quantity),
        date,
        notes,
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
    setDate(initialDate)
    setNotes('')
    setError(null)
  }, [spectacle, initialDate])

  if (!spectacle) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Réserver {spectacle.name}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
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
          <label>
            Notes (optionnel)
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Précisions, placement, etc."
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Validation...' : 'Confirmer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReservationModal

