import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ordersService, spectaclesService, performancesService } from '../services/api'

function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reservationData, setReservationData] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [spectacle, setSpectacle] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)

  // Données du formulaire de paiement (préremplies avec des données factices)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardName, setCardName] = useState('JEAN DUPONT')
  const [cardExpiry, setCardExpiry] = useState('12/25')
  const [cardCvv, setCardCvv] = useState('123')

  useEffect(() => {
    // Récupérer les données de réservation depuis location.state
    const data = location.state
    if (!data || !data.performanceId || !data.quantity) {
      // Si pas de données, rediriger vers la page des spectacles
      navigate('/programmation')
      return
    }

    setReservationData(data)
    loadPerformanceDetails(data.performanceId, data.quantity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate])

  const loadPerformanceDetails = async (performanceId, quantity) => {
    try {
      // Récupérer la performance par son ID
      const perf = await performancesService.getById(performanceId)
      if (!perf) {
        setError('Performance introuvable')
        return
      }

      setPerformance(perf)
      
      // Récupérer le spectacle associé
      if (perf.spectacleId) {
        const spec = await spectaclesService.getById(perf.spectacleId)
        if (spec) {
          setSpectacle(spec)
        }
      }
      
      // Calculer le prix total
      if (quantity) {
        setTotalPrice(perf.unitPrice * quantity)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err)
      setError('Erreur lors du chargement des détails')
    }
  }

  const formatCardNumber = (value) => {
    // Enlever tous les espaces
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Ajouter un espace tous les 4 chiffres
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value)
    setCardExpiry(formatted)
  }

  const handleCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 3)
    setCardCvv(v)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation du formulaire
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Numéro de carte invalide')
      return
    }
    if (!cardName.trim()) {
      setError('Nom sur la carte requis')
      return
    }
    if (cardExpiry.length < 5) {
      setError('Date d\'expiration invalide')
      return
    }
    if (cardCvv.length < 3) {
      setError('CVV invalide')
      return
    }

    setLoading(true)
    try {
      // Créer la commande (le paiement est simulé côté backend avec MockPaymentService)
      const payload = {
        items: [
          {
            performanceId: reservationData.performanceId,
            quantity: reservationData.quantity,
          },
        ],
      }
      
      const order = await ordersService.create(payload)
      
      // Rediriger vers la page des commandes avec un message de succès
      navigate('/orders', { 
        state: { 
          message: 'Paiement effectué avec succès !',
          orderId: order.id 
        } 
      })
    } catch (err) {
      setError(err.message || 'Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  if (!reservationData || !performance || !spectacle) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-summary">
          <h2>Récapitulatif de votre commande</h2>
          <div className="summary-card">
            <h3>{spectacle.name}</h3>
            <p className="performance-date">
              {new Date(performance.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="summary-details">
              <p>Quantité: {reservationData.quantity} ticket(s)</p>
              <p>Prix unitaire: {performance.unitPrice.toFixed(2)}€</p>
              <p className="total-price">
                <strong>Total: {(performance.unitPrice * reservationData.quantity).toFixed(2)}€</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="payment-form-container">
          <h2>Informations de paiement</h2>
          {error && <div className="alert error">{error}</div>}
          
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cardNumber">Numéro de carte</label>
              <input
                type="text"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardName">Nom sur la carte</label>
              <input
                type="text"
                id="cardName"
                placeholder="JEAN DUPONT"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cardExpiry">Date d'expiration</label>
                <input
                  type="text"
                  id="cardExpiry"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  maxLength="5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardCvv">CVV</label>
                <input
                  type="text"
                  id="cardCvv"
                  placeholder="123"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div className="payment-info">
              <p className="info-text">
                <small>
                  💳 Mode simulation : Ce paiement est simulé. Aucune transaction réelle ne sera effectuée.
                </small>
              </p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/programmation')}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Traitement...' : `Payer ${totalPrice.toFixed(2)}€`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Payment
