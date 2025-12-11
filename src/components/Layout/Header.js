import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Théâtre</h1>
        </Link>
        <nav className="nav">
          <Link to="/spectacles">Spectacles</Link>
          <Link to="/representations">Représentations</Link>
          <Link to="/orders">Mes Commandes</Link>
          <Link to="/user">Mon Compte</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

