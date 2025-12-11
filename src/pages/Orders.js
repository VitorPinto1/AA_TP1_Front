import { useState, useEffect } from 'react'
import { ordersService } from '../services/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="orders-page">
      <h2>Mes Commandes</h2>
      <div className="orders-list">
        {orders.length === 0 ? (
          <p>Aucune commande pour le moment.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <h3>Commande #{order.id}</h3>
              <div className="order-info">
                <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                <p>Statut: {order.status}</p>
                <p>Prix payé: {order.paid_price}€</p>
                <p>Nombre de tickets: {order.tickets?.length || 0}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders

