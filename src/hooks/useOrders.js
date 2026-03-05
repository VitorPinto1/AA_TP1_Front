import { useState, useEffect } from 'react'
import { ordersService } from '../services/api'
import { handleApiError } from '../utils/errorHandler'

/**
 * Hook personnalisé pour gérer les commandes
 */
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ordersService.getMyOrders()
      const baseOrders = Array.isArray(data) ? data : []

      // Charger les détails complets (tickets + spectacle) pour chaque commande
      const detailedOrders = await Promise.all(
        baseOrders.map(async (order) => {
          try {
            const fullOrder = await ordersService.getById(order.id)
            return fullOrder || order
          } catch {
            return order
          }
        })
      )

      setOrders(detailedOrders)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData) => {
    try {
      setError(null)
      const newOrder = await ordersService.create(orderData)

      // Récupérer la commande avec ses tickets pour affichage cohérent
      let detailedOrder = newOrder
      try {
        detailedOrder = await ordersService.getById(newOrder.id)
      } catch {
        // en cas d'erreur, on garde la commande de base
      }

      setOrders((prev) => [detailedOrder, ...prev])
      return detailedOrder
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    createOrder,
    refetch: loadOrders,
  }
}
