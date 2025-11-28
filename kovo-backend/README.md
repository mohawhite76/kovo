# Kovo Backend

API REST pour l'application de covoiturage Kovo, destinee aux etudiants.

**Auteur** : Amir Moussi

## Description

Backend Node.js/Express qui gere l'authentification, les trajets, les reservations et la messagerie en temps reel pour la plateforme Kovo.

## Technologies

- **Runtime** : Node.js (ES Modules)
- **Framework** : Express.js
- **Base de donnees** : Supabase (PostgreSQL)
- **Authentification** : JWT (JSON Web Tokens)
- **Temps reel** : Socket.io
- **Stockage fichiers** : Cloudinary
- **Emails** : Brevo (SendinBlue)
- **Notifications push** : OneSignal
- **Securite** : Helmet, CORS, Rate Limiting
- **Logging** : Winston

## Structure du projet

```
kovo-backend/
├── src/
│   ├── app.js              # Point d'entree de l'application
│   ├── config/             # Configuration (logger, socket, etc.)
│   ├── constants/          # Constantes de l'application
│   ├── controllers/        # Logique metier des routes
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── messageController.js
│   │   ├── tripController.js
│   │   └── userController.js
│   ├── middlewares/        # Middlewares Express
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── rateLimiter.js
│   ├── routes/             # Definition des routes API
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── messages.js
│   │   ├── trips.js
│   │   └── users.js
│   ├── services/           # Services metier
│   │   ├── authService.js
│   │   ├── databaseService.js
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   ├── pushNotificationService.js
│   │   └── verificationService.js
│   └── utils/              # Fonctions utilitaires
└── logs/                   # Fichiers de logs
```

## API Endpoints

### Authentification (`/api/auth`)
- Inscription, connexion, deconnexion
- Verification email
- Mot de passe oublie / reinitialisation

### Utilisateurs (`/api/users`)
- Gestion du profil
- Upload de documents (permis, carte etudiante)
- Gestion du vehicule

### Trajets (`/api/trips`)
- Creation, modification, suppression de trajets
- Recherche de trajets
- Gestion des places disponibles

### Reservations (`/api/bookings`)
- Demande de reservation
- Acceptation/refus par le conducteur
- Annulation

### Messages (`/api/messages`)
- Messagerie entre utilisateurs
- Temps reel via Socket.io

## Installation

```bash
# Cloner le repository
cd kovo-backend

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `PORT` | Port du serveur (defaut: 3001) |
| `NODE_ENV` | Environnement (development/production) |
| `SUPABASE_URL` | URL de votre projet Supabase |
| `SUPABASE_ANON_KEY` | Cle anonyme Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service Supabase |
| `JWT_SECRET` | Secret pour signer les tokens JWT |
| `JWT_EXPIRES_IN` | Duree de validite des tokens |
| `BREVO_API_KEY` | Cle API Brevo pour les emails |
| `FRONTEND_URL` | URL du frontend (CORS) |
| `CLOUDINARY_*` | Credentials Cloudinary |
| `ONESIGNAL_*` | Credentials OneSignal |

## Scripts disponibles

```bash
# Developpement avec hot-reload
npm run dev

# Production
npm start
npm run start:prod

# Logs
npm run logs:error    # Voir les erreurs
npm run logs:all      # Voir tous les logs
npm run clean:logs    # Nettoyer les logs
```

## Healthcheck

```
GET /health
```

Retourne le statut de l'API.

## Licence

Projet prive - Tous droits reserves
