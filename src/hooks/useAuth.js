import { useAuth as useAuthContext } from '../context/AuthContext'

/**
 * Hook personnalisé pour l'authentification
 * Wrapper autour du AuthContext pour une utilisation simplifiée
 */
export function useAuth() {
  return useAuthContext()
}
