import { useState, useEffect } from 'react'
import { spectaclesService, ordersService } from '../services/api'
import SpectacleCard from '../components/SpectacleCard'
import ReservationModal from '../components/ReservationModal'

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
    description: 'Mystère et passion dans les coulisses de l’opéra.',
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
    description: 'Une soirée d’improvisation participative et pleine de rires.',
    duration: '1h30',
    Type: 'Impro',
    date: '2024-06-08',
    image_url: '/assets/theater.jpg',
  },
  {
    id: 'f6',
    name: 'Peau d’Âne',
    description: 'Le conte revisité avec musique et poésie.',
    duration: '1h50',
    Type: 'Conte musical',
    date: '2024-07-02',
    image_url: '/assets/theater.jpg',
  },
]

function Spectacles() {
  const [spectacles, setSpectacles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    loadSpectacles()
  }, [])

  const loadSpectacles = async () => {
    try {
      const data = await spectaclesService.getAll()
      if (Array.isArray(data) && data.length > 0) {
        setSpectacles(data)
      } else {
        setSpectacles(fallbackSpectacles)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des spectacles:', error)
      setSpectacles(fallbackSpectacles)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = async ({ spectacleId, quantity, date, notes }) => {
    setStatus(null)
    // Minimal payload; adapt to your API contract if different
    const payload = {
      spectacle_id: spectacleId,
      quantity,
      date,
      notes,
    }
    await ordersService.create(payload)
    setStatus('Réservation enregistrée !')
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="spectacles-page">
      <h2>Programmation</h2>
      {error && <div className="alert error">{error}</div>}
      {status && (
        <div className={`alert ${status.includes('Erreur') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
      <div className="spectacles-grid">
        {spectacles.map((spectacle) => (
          <SpectacleCard key={spectacle.id} spectacle={spectacle} onReserve={setSelected} />
        ))}
      </div>
      {selected && (
        <ReservationModal
          spectacle={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleReserve}
        />
      )}
    </div>
  )
}

export default Spectacles

