/**
 * Gestion centralisée des erreurs API
 */

/**
 * Traite les erreurs API et retourne un message utilisateur-friendly
 * @param {Error} error - L'erreur à traiter
 * @returns {string} - Message d'erreur formaté
 */
export function handleApiError(error) {
  if (!error) return 'Une erreur inconnue est survenue'

  // Erreur réseau
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.'
  }

  // Erreur HTTP avec status
  if (error.response) {
    const status = error.response.status
    switch (status) {
      case 400:
        return 'Données invalides. Vérifiez les informations saisies.'
      case 401:
        return 'Non autorisé. Veuillez vous connecter.'
      case 403:
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
      case 404:
        return 'Ressource introuvable.'
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.'
      default:
        return `Erreur ${status}: ${error.response.statusText || 'Erreur serveur'}`
    }
  }

  // Erreur avec message personnalisé
  if (error.message) {
    return error.message
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

/**
 * Log l'erreur en console (en développement)
 * @param {Error} error - L'erreur à logger
 * @param {string} context - Contexte de l'erreur
 */
export function logError(error, context = '') {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  }
  // En production, on pourrait envoyer à un service de logging (Sentry, etc.)
}
