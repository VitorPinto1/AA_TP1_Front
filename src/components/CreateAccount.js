import { useState } from 'react'

function CreateAccount({ onAccountCreated, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    special: false
  })
  const [loading, setLoading] = useState(false)

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
    setPasswordValidation(validations)
    return validations.length && validations.uppercase && validations.special
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validation en temps réel pour le mot de passe
    if (name === 'password') {
      validatePassword(value)
    }

    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Veuillez entrer un email valide'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Le mot de passe ne respecte pas les critères requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // TODO: Appel API pour la création de compte
      // const response = await usersService.create({
      //   name: formData.nom,
      //   surname: formData.prenom,
      //   email: formData.email,
      //   password: formData.password
      // })
      
      console.log('Création de compte:', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      })
      
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (onAccountCreated) {
        onAccountCreated()
      }
    } catch (err) {
      setErrors({ submit: 'Erreur lors de la création du compte. Veuillez réessayer.' })
      console.error('Erreur de création de compte:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            placeholder="Votre nom"
          />
          {errors.nom && <span className="field-error">{errors.nom}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
            placeholder="Votre prénom"
          />
          {errors.prenom && <span className="field-error">{errors.prenom}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="votre.email@exemple.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Votre mot de passe"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
          
          {formData.password && (
            <div className="password-requirements">
              <p className="requirements-title">Le mot de passe doit contenir :</p>
              <ul className="requirements-list">
                <li className={passwordValidation.length ? 'valid' : 'invalid'}>
                  Au moins 12 caractères
                </li>
                <li className={passwordValidation.uppercase ? 'valid' : 'invalid'}>
                  Au moins 1 majuscule
                </li>
                <li className={passwordValidation.special ? 'valid' : 'invalid'}>
                  Au moins 1 caractère spécial
                </li>
              </ul>
            </div>
          )}
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="auth-switch">
        <p>Vous avez déjà un compte ?</p>
        <button type="button" className="btn-link" onClick={onSwitchToLogin}>
          Se connecter
        </button>
      </div>
    </div>
  )
}

export default CreateAccount
