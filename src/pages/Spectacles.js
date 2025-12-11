import { useState, useEffect } from 'react'
import { spectaclesService } from '../services/api'

function Spectacles() {
  const [spectacles, setSpectacles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpectacles()
  }, [])

  const loadSpectacles = async () => {
    try {
      const data = await spectaclesService.getAll()
      setSpectacles(data)
    } catch (error) {
      console.error('Erreur lors du chargement des spectacles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="spectacles-page">
      <h2>Nos Spectacles</h2>
      <div className="spectacles-grid">
        {spectacles.map((spectacle) => (
          <div key={spectacle.id} className="spectacle-card">
            <h3>{spectacle.name}</h3>
            <p>{spectacle.description}</p>
            <div className="spectacle-info">
              <span>Durée: {spectacle.duration}</span>
              <span>Type: {spectacle.Type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Spectacles

