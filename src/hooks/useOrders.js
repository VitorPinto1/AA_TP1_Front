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
      const data = await ordersService.getAll()
      setOrders(data)
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData) => {
    try {
      setError(null)
      const newOrder = await ordersService.create(orderData)
      setOrders((prev) => [newOrder, ...prev])
      return newOrder
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
