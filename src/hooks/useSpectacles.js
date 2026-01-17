import { useState, useEffect } from 'react'
import { spectaclesService } from '../services/api'
import { handleApiError } from '../utils/errorHandler'

const fallbackSpectacles = [
  {
    id: 'f1',
    name: 'Le Roi Lion',
    description: 'Un voyage musical au cœur de la savane.',
    duration: '2h10',
    Type: 'Comédie musicale',
    date: '2024-02-10',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f2',
    name: 'Phantom',
    description: 'Mystère et passion dans les coulisses de l'opéra.',
    duration: '2h00',
    Type: 'Drame musical',
    date: '2024-03-05',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f3',
    name: 'Le Dindon',
    description: 'Feydeau et ses portes qui claquent, version moderne.',
    duration: '1h45',
    Type: 'Comédie',
    date: '2024-04-12',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f4',
    name: 'Lac des Cygnes',
    description: 'Le ballet classique intemporel revisité.',
    duration: '2h05',
    Type: 'Ballet',
    date: '2024-05-20',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f5',
    name: 'Impro Show',
    description: 'Une soirée d'improvisation participative et pleine de rires.',
    duration: '1h30',
    Type: 'Impro',
    date: '2024-06-08',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f6',
    name: 'Peau d'Âne',
    description: 'Le conte revisité avec musique et poésie.',
    duration: '1h50',
    Type: 'Conte musical',
    date: '2024-07-02',
    image_url: '/assets/theater.jpg',
  },
]

/**
 * Hook personnalisé pour gérer les spectacles
 */
export function useSpectacles() {
  const [spectacles, setSpectacles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSpectacles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await spectaclesService.getAll()
      if (Array.isArray(data) && data.length > 0) {
        setSpectacles(data)
      } else {
        setSpectacles(fallbackSpectacles)
      }
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      setSpectacles(fallbackSpectacles)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpectacles()
  }, [])

  return {
    spectacles,
    loading,
    error,
    refetch: loadSpectacles,
  }
}
