import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'

function Orders() {
  const location = useLocation()
  const navigate = useNavigate()
  const { orders, loading, error, refetch } = useOrders()
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    // Vérifier si on vient de la page de paiement avec un message de succès
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Recharger les commandes
      refetch()
      // Nettoyer le state pour éviter d'afficher le message à chaque navigation
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate, refetch])

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="orders-page">
      <h2>Mes Commandes</h2>
      {successMessage && (
        <div className="alert success" style={{ marginBottom: '1rem' }}>
          {successMessage}
        </div>
      )}
      {error && <div className="alert error">{error}</div>}
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>Aucune commande pour le moment.</p>
        ) : (
          orders.map((order) => {
            // Extraire le nom du spectacle depuis les tickets
            const spectacleName = order.tickets?.[0]?.performance?.spectacle?.name || 'Spectacle inconnu'
            
            return (
              <div key={order.id} className="order-card">
                <h3>Commande #{order.id}</h3>
                <div className="order-info">
                  <p><strong>Spectacle:</strong> {spectacleName}</p>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p>Statut: {order.status}</p>
                  <p>Prix payé: {order.totalPrice?.toFixed(2) || '0.00'}€</p>
                  <p>Nombre de tickets: {order.tickets?.length || 0}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Orders

