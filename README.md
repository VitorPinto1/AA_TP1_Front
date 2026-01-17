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

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Build

```bash
npm run build
```

## Run

```bash
npm start
```
## Architecture

### Entités

- **Spectacles** : Les spectacles disponibles
- **Representations** : Les représentations d'un spectacle
- **Tickets** : Les tickets pour une représentation
- **Orders** : Les commandes des utilisateurs
- **Users** : Les utilisateurs du système

### Services API

Les services API sont configurés dans `src/services/api.js` et pointent vers `/api` (proxifié vers `http://localhost:8000` via Vite).

### Pages

- **Landing** : Page d'accueil
- **Spectacles** : Liste des spectacles
- **Representations** : Liste des représentations
- **Orders** : Liste des commandes de l'utilisateur
- **User** : Profil utilisateur

