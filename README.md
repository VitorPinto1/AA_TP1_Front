# Application de Réservation de Théâtre

Application React pour la réservation de places de théâtre.

## Structure du Projet

```
src/
├── components/
│   └── Layout/
│       ├── Layout.js
│       ├── Header.js
│       └── Footer.js
├── pages/
│   ├── Landing.js
│   ├── Spectacles.js
│   ├── Representations.js
│   ├── Orders.js
│   └── User.js
├── services/
│   └── api.js
├── styles/
│   └── index.css
├── setupProxy.js
├── App.js
└── index.js
```

## Installation

```bash
npm install
```

## Développement

### Démarrage rapide (frontend + services)

```bash
./start-dev.sh
```

Le script démarre automatiquement :
- Frontend React (port `3000`)
- Backend Billetterie Spectacles (port `7035`)
- Service de paiement (port `7049`)
- MailHog (SMTP `1025`, Web UI `8025`)

### Démarrage du frontend seul

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`.

## Build

```bash
npm run build
```

## Run

```bash
npm start
```

## Tests Selenium

Les tests end-to-end Selenium se trouvent dans le dossier `selenium/`.

### Installation des dépendances de tests

```bash
cd selenium
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
```

### Lancement des tests

1. Démarrer l'environnement test (frontend + backend + payment) :

```bash
./test.sh
```

2. Dans un autre terminal, exécuter les tests :

```bash
cd selenium
python -m pytest -v -s
```

Par défaut, les tests ciblent `http://localhost:3000`.

### Scénarios couverts (14 tests)

Les tests sont organisés en deux blocs selon le rôle de l'utilisateur.

#### Bloc USER (8 tests)

| Test | Type | Description |
|------|------|-------------|
| `test_create_account` | Positif | Création d'un compte utilisateur avec un email unique et un mot de passe valide. Vérifie le retour à la page de connexion. |
| `test_login_wrong_password` | Négatif | Tentative de connexion avec un mauvais mot de passe. Vérifie l'affichage d'un message d'erreur. |
| `test_create_account_weak_password` | Négatif | Création de compte avec le mot de passe `abc` (trop court, sans majuscule, sans chiffre, sans caractère spécial). Vérifie le message « ne respecte pas les critères ». |
| `test_reservation_flow` | Positif | Connexion en tant que client, navigation vers `/programmation`, sélection d'un spectacle, choix d'une représentation et d'une quantité, puis vérification de la redirection vers la page de paiement. |
| `test_access_creation_forbidden` | Négatif | Un utilisateur client tente d'accéder à `/creation`. Vérifie qu'il est redirigé et ne voit pas le formulaire de création de spectacle. |
| `test_access_dashboard_forbidden` | Négatif | Un utilisateur client tente d'accéder à `/dashboard`. Vérifie qu'il est redirigé vers l'accueil. |
| `test_logout` | Positif | Connexion puis clic sur « Se déconnecter ». Vérifie la redirection vers l'accueil et le retour au menu non-connecté sur `/user`. |

#### Bloc ADMIN (6 tests)

| Test | Type | Description |
|------|------|-------------|
| `test_login_wrong_password` | Négatif | Tentative de connexion admin avec un mauvais mot de passe. Vérifie l'affichage d'un message d'erreur. |
| `test_create_account_weak_password` | Négatif | Création de compte avec le mot de passe `MotDePasse` (sans chiffre ni caractère spécial). Vérifie le message « ne respecte pas les critères ». |
| `test_create_spectacle_for_edit` | Positif | Connexion admin, navigation vers `/creation`, création d'un spectacle nommé « EDIT » avec représentation. Vérifie le message de succès. |
| `test_create_spectacle_for_delete` | Positif | Connexion admin, navigation vers `/creation`, création d'un spectacle nommé « DELETE » avec représentation. Vérifie le message de succès. |
| `test_edit_spectacle` | Positif | Connexion admin, navigation vers `/programmation`, recherche du spectacle « EDIT », modification de sa description via la page d'édition. Vérifie le message de succès. |
| `test_admin_cannot_reserve` | Négatif | Connexion admin, navigation vers `/programmation`. Vérifie que le bouton « Réserver » n'apparaît pas et que le bouton « Modifier » est visible. |
| `test_delete_spectacle` | Positif | Connexion admin, navigation vers `/programmation`, ouverture de la page d'édition d'un spectacle, suppression avec confirmation. Vérifie le message de succès. |

## Architecture

### Entités

- **Spectacles** : Les spectacles disponibles
- **Representations** : Les représentations d'un spectacle
- **Tickets** : Les tickets pour une représentation
- **Orders** : Les commandes des utilisateurs
- **Users** : Les utilisateurs du système

### Services API

Les services API sont configurés dans `src/services/api.js` et pointent vers `/api` (proxifié vers `https://localhost:7035` via `setupProxy.js`).

### Ports par défaut

- Frontend: `http://localhost:3000`
- Backend: `https://localhost:7035`
- Payment: `https://localhost:7049`
- MailHog: `http://localhost:8025` (SMTP `1025`)

### Pages

- **Landing** : Page d'accueil
- **Spectacles** : Liste des spectacles
- **Representations** : Liste des représentations
- **Orders** : Liste des commandes de l'utilisateur
- **User** : Profil utilisateur
