import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <h2>Bienvenue sur notre plateforme de réservation</h2>
        <p>Découvrez nos spectacles et réservez vos places en ligne</p>
        <Link to="/spectacles" className="btn btn-primary">
          Voir les spectacles
        </Link>
      </section>
    </div>
  )
}

export default Landing

