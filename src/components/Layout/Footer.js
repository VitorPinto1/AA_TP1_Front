import logo from '../../assets/logotheatre.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img className="footer-logo" src={logo} alt="L’Usine à Émotions" />
        </div>
        <p>&copy; 2024 Billetterie Spectacles. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

export default Footer

