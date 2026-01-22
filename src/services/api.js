const API_BASE_URL = '/api'

// Fonction pour récupérer le token JWT depuis localStorage
function getToken() {
  return localStorage.getItem('token')
}

// Fonction utilitaire pour les appels API avec gestion automatique du token JWT
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = getToken()
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = {
        status: response.status,
        statusText: response.statusText,
      }
      // Essayer de récupérer le message d'erreur du body
      try {
        const errorData = await response.json()
        error.message = errorData.message || error.message
      } catch {
        // Si le body n'est pas du JSON, on garde le message par défaut
      }
      throw error
    }
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Service d'authentification
export const authService = {
  register: (data) => fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (email, password) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  getCurrentUser: () => fetchAPI('/auth/me'),
}

// Service pour les Spectacles
export const spectaclesService = {
  getAll: () => fetchAPI('/spectacles'),
  getById: (id) => fetchAPI(`/spectacles/${id}`),
  getByIdWithPerformances: (id) => fetchAPI(`/spectacles/${id}/performances`),
  search: (params) => {
    const queryParams = new URLSearchParams()
    if (params.name) queryParams.append('name', params.name)
    if (params.category) queryParams.append('category', params.category)
    if (params.minDuration) queryParams.append('minDuration', params.minDuration)
    if (params.maxDuration) queryParams.append('maxDuration', params.maxDuration)
    const queryString = queryParams.toString()
    return fetchAPI(`/spectacles/search${queryString ? `?${queryString}` : ''}`)
  },
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

// Service pour les Performances (représentations)
export const performancesService = {
  getAll: () => fetchAPI('/performances'),
  getById: (id) => fetchAPI(`/performances/${id}`),
  create: (spectacleId, data) => fetchAPI(`/spectacles/${spectacleId}/performances`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/performances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/performances/${id}`, {
    method: 'DELETE',
  }),
}

// Service pour les Commandes (Orders)
export const ordersService = {
  getMyOrders: () => fetchAPI('/orders'),
  getAllOrders: (filters = {}) => {
    const queryParams = new URLSearchParams()
    if (filters.userId) queryParams.append('userId', filters.userId)
    if (filters.performanceId) queryParams.append('performanceId', filters.performanceId)
    if (filters.orderStatus) queryParams.append('orderStatus', filters.orderStatus)
    const queryString = queryParams.toString()
    return fetchAPI(`/orders/all${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id) => fetchAPI(`/orders/${id}`),
  create: (data) => fetchAPI('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

// Service pour les Utilisateurs (Users)
export const usersService = {
  getAll: () => fetchAPI('/users'),
  getById: (id) => fetchAPI(`/users/${id}`),
  update: (id, data) => fetchAPI(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
}
