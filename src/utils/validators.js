/**
 * Validateurs pour les formulaires
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un mot de passe (minimum 6 caractères)
 * @param {string} password - Mot de passe à valider
 * @returns {boolean} - True si valide
 */
export function isValidPassword(password) {
  return password && password.length >= 6
}

/**
 * Valide une date (doit être dans le futur)
 * @param {string} date - Date à valider (format YYYY-MM-DD)
 * @returns {boolean} - True si valide
 */
export function isValidFutureDate(date) {
  if (!date) return false
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate >= today
}

/**
 * Valide une quantité de tickets (entre 1 et 10)
 * @param {number} quantity - Quantité à valider
 * @returns {boolean} - True si valide
 */
export function isValidTicketQuantity(quantity) {
  const qty = Number(quantity)
  return qty >= 1 && qty <= 10
}

/**
 * Valide les données de réservation
 * @param {object} data - Données à valider
 * @returns {object} - { valid: boolean, errors: object }
 */
export function validateReservation(data) {
  const errors = {}

  if (!data.spectacleId) {
    errors.spectacleId = 'Spectacle requis'
  }

  if (!isValidFutureDate(data.date)) {
    errors.date = 'La date doit être dans le futur'
  }

  if (!isValidTicketQuantity(data.quantity)) {
    errors.quantity = 'La quantité doit être entre 1 et 10'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Valide les données de connexion
 * @param {object} data - Données à valider
 * @returns {object} - { valid: boolean, errors: object }
 */
export function validateLogin(data) {
  const errors = {}

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email invalide'
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
