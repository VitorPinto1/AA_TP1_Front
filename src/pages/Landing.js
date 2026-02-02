import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Landing() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">BIENVENUE À L’USINE À ÉMOTIONS</p>
          <h2>Réservez vos prochaines soirées en quelques clics</h2>
          <p className="hero__subtitle">
            Découvrez les spectacles à l’affiche, choisissez votre représentation
            et réservez vos places au meilleur tarif.
          </p>
          <div className="hero__cta">
            <Link to="/programmation" className="btn btn-primary">
              Voir la programmation
            </Link>
            {isAuthenticated && !isAdmin && (
              <Link to="/orders" className="btn btn-secondary">Mes commandes</Link>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <Link to="/programmation" className="feature-card feature-card-link">
          <h3>Programmation</h3>
          <p>Consultez les spectacles à l’affiche et réservez vos places.</p>
        </Link>
        {!isAdmin && (
          <Link to="/orders" className="feature-card feature-card-link">
            <h3>Suivi de vos commandes</h3>
          <p>Retrouvez vos réservations et billets en un clin d’œil.</p>
          </Link>
        )}
      </section>
    </div>
  )
}

export default Landing

