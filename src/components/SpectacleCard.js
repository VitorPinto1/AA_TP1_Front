function SpectacleCard({ spectacle, onReserve }) {
  const imgSrc = spectacle.image_url || '/assets/theater.jpg'

  return (
    <div className="spectacle-card">
      <div className="spectacle-thumb">
        <img src={imgSrc} alt={spectacle.name} />
      </div>
      <div className="spectacle-content">
        <h3>{spectacle.name}</h3>
        <p className="spectacle-desc">{spectacle.description}</p>
        <div className="spectacle-meta">
          {spectacle.date && <span>{new Date(spectacle.date).toLocaleDateString()}</span>}
          {spectacle.duration && <span>Durée: {spectacle.duration}</span>}
          {spectacle.Type && <span>Type: {spectacle.Type}</span>}
        </div>
        <button className="btn btn-primary" onClick={() => onReserve(spectacle)}>
          Réserver
        </button>
      </div>
    </div>
  )
}

export default SpectacleCard

