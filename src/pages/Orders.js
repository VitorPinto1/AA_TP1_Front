import { useOrders } from '../hooks/useOrders'

function Orders() {
  const { orders, loading, error } = useOrders()

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="orders-page">
      <h2>Mes Commandes</h2>
      {error && <div className="alert error">{error}</div>}
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

