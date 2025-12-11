import { useState, useEffect } from 'react'
import { representationsService } from '../services/api'

function Representations() {
  const [representations, setRepresentations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRepresentations()
  }, [])

  const loadRepresentations = async () => {
    try {
      const data = await representationsService.getAll()
      setRepresentations(data)
    } catch (error) {
      console.error('Erreur lors du chargement des représentations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="representations-page">
      <h2>Représentations</h2>
      <div className="representations-list">
        {representations.map((representation) => (
          <div key={representation.id} className="representation-card">
            <h3>Représentation #{representation.id}</h3>
            <div className="representation-info">
              <p>Date: {new Date(representation.date).toLocaleDateString()}</p>
              <p>Capacité: {representation.capacity}</p>
              <p>Prix: {representation.price}€</p>
              <p>Statut: {representation.status}</p>
            </div>
            <button className="btn btn-primary">Réserver</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Representations

