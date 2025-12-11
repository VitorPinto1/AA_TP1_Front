import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Théâtre & émotions en direct</p>
          <h2>Réservez vos prochaines soirées en quelques clics</h2>
          <p className="hero__subtitle">
            Découvrez les spectacles à l’affiche, choisissez votre représentation
            et réservez vos places au meilleur tarif.
          </p>
          <div className="hero__cta">
            <Link to="/spectacles" className="btn btn-primary">
              Voir les spectacles
            </Link>
            <Link to="/representations" className="btn btn-secondary">
              Représentations à venir
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <Link to="/representations" className="feature-card feature-card-link">
          <h3>Programmation claire</h3>
          <p>Filtres par spectacle et représentation pour trouver rapidement.</p>
        </Link>
        <Link to="/spectacles" className="feature-card feature-card-link">
          <h3>Espectacles</h3>
          <p>Consultez les spectacles à l’affiche et réservez vos places.</p>
        </Link>
        <Link to="/orders" className="feature-card feature-card-link">
          <h3>Suivi de vos commandes</h3>
          <p>Retrouvez vos réservations et billets en un clin d’œil.</p>
        </Link>
      </section>
    </div>
  )
}

export default Landing

