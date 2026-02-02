import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logotheatre.png'

function Header() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img className="logo-image" src={logo} alt="L’Usine à Émotions" />
          <span className="sr-only">L’Usine à Émotions</span>
        </Link>
        <nav className="nav">
          <Link to="/programmation">Programmation</Link>
          {isAdmin && <Link to="/dashboard">Dashboard</Link>}
          {isAdmin && <Link to="/creation">Création</Link>}
          {isAuthenticated && !isAdmin && <Link to="/orders">Mes Commandes</Link>}
          <Link to="/user">Mon Compte</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header

