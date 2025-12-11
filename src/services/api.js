const API_BASE_URL = '/api'

// Fonction utilitaire pour les appels API
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Service pour les Spectacles
export const spectaclesService = {
  getAll: () => fetchAPI('/spectacles'),
  getById: (id) => fetchAPI(`/spectacles/${id}`),
  create: (data) => fetchAPI('/spectacles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/spectacles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/spectacles/${id}`, {
    method: 'DELETE',
  }),
}

// Service pour les Représentations
export const representationsService = {
  getAll: () => fetchAPI('/representations'),
  getById: (id) => fetchAPI(`/representations/${id}`),
  getBySpectacleId: (spectacleId) => fetchAPI(`/representations?spectacle_id=${spectacleId}`),
  create: (data) => fetchAPI('/representations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/representations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/representations/${id}`, {
    method: 'DELETE',
  }),
}

// Service pour les Tickets
export const ticketsService = {
  getAll: () => fetchAPI('/tickets'),
  getById: (id) => fetchAPI(`/tickets/${id}`),
  getByOrderId: (orderId) => fetchAPI(`/tickets?order_id=${orderId}`),
  getByRepresentationId: (representationId) => fetchAPI(`/tickets?representation_id=${representationId}`),
  create: (data) => fetchAPI('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/tickets/${id}`, {
    method: 'DELETE',
  }),
}

// Service pour les Commandes (Orders)
export const ordersService = {
  getAll: () => fetchAPI('/orders'),
  getById: (id) => fetchAPI(`/orders/${id}`),
  getByUserId: (userId) => fetchAPI(`/orders?user_id=${userId}`),
  create: (data) => fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/orders/${id}`, {
    method: 'DELETE',
  }),
}

// Service pour les Utilisateurs (Users)
export const usersService = {
  getAll: () => fetchAPI('/users'),
  getById: (id) => fetchAPI(`/users/${id}`),
  create: (data) => fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
  login: (email, password) => fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
}

