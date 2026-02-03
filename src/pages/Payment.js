import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from '../context/AuthContext'
import { ordersService, spectaclesService, performancesService } from '../services/api'

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null

function PaymentContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reservationData, setReservationData] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [spectacle, setSpectacle] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [cardName, setCardName] = useState('JEAN DUPONT')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation du formulaire
    if (!cardName.trim()) {
      setError('Nom sur la carte requis')
      return
    }
    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError('Champ de carte indisponible')
      return
    }

    setLoading(true)
    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardName.trim(),
          email: user?.email || undefined,
        },
      })

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Erreur lors de la création du moyen de paiement')
        return
      }

      // Créer la commande (le paiement est simulé côté backend avec MockPaymentService)
      const payload = {
        items: [
          {
            performanceId: reservationData.performanceId,
            quantity: reservationData.quantity,
          },
        ],
        paymentMethodId: paymentMethod?.id,
      }
      
      const order = await ordersService.create(payload)
      
      // Rediriger vers la page des commandes avec message de succès + email
      const emailMsg = user?.email
        ? ` Un email de confirmation vous a été envoyé à ${user.email}.`
        : ''
      navigate('/orders', { 
        state: { 
          message: `Paiement effectué avec succès !${emailMsg}`,
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
              <div className="stripe-card-element">
                <CardElement
                  options={{
                    hidePostalCode: true,
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#111827',
                        '::placeholder': { color: '#9CA3AF' },
                      },
                      invalid: {
                        color: '#EF4444',
                      },
                    },
                  }}
                />
              </div>
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

            <div className="payment-info">
              <p className="info-text">
                <small>
                  💳 Le paiement est traité par Stripe. Un email de confirmation vous sera envoyé après validation.
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

function Payment() {
  if (!stripePromise) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="alert error">
            Stripe n'est pas configuré. Ajoutez `REACT_APP_STRIPE_PUBLISHABLE_KEY` dans votre environnement.
          </div>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentContent />
    </Elements>
  )
}

export default Payment
