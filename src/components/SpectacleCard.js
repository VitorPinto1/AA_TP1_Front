import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function SpectacleCard({ spectacle, onReserve }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  // Le backend retourne 'thumbnail', mais on garde 'image_url' pour compatibilité avec les données fallback
  const imgSrc = spectacle.thumbnail || spectacle.image_url || '/assets/theater.jpg'

  const handleEdit = () => {
    navigate(`/spectacles/${spectacle.id}/edit`)
  }

  return (
    <div className="spectacle-card">
      <div className="spectacle-thumb">
        <img 
          src={imgSrc} 
          alt={spectacle.name}
          onError={(e) => {
            // Si l'image ne se charge pas, utiliser l'image par défaut
            e.target.src = '/assets/theater.jpg'
          }}
        />
      </div>
      <div className="spectacle-content">
        <h3>{spectacle.name}</h3>
        <p className="spectacle-desc">{spectacle.description}</p>
        <div className="spectacle-meta">
          {spectacle.date && <span>{new Date(spectacle.date).toLocaleDateString()}</span>}
          {spectacle.duration && <span>Durée: {spectacle.duration}</span>}
          {spectacle.Type && <span>Type: {spectacle.Type}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleEdit} style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.875rem',
              flex: 1
            }}>
              Modifier
            </button>
          )}
          {!isAdmin && (
            <button className="btn btn-primary" onClick={() => onReserve(spectacle)}>
              Réserver
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpectacleCard

