# Kovo

Plateforme de covoiturage reservee aux etudiants.

**Auteur** : Amir Moussi

## Description

Kovo est une application de covoiturage conçue specifiquement pour les etudiants. Elle permet aux conducteurs de proposer des trajets et aux passagers de reserver des places, le tout avec une messagerie en temps reel et un systeme de verification etudiant.

## Architecture du projet

Le projet est divise en trois parties :

```
kovo/
├── kovo-backend/       # API REST Node.js/Express
├── kovo-database/      # Schema PostgreSQL (Supabase)
└── kovo-frontend/      # Application Next.js
```

### kovo-backend
API REST construite avec Node.js et Express. Gere l'authentification JWT, les operations CRUD, la messagerie temps reel (Socket.io), les emails transactionnels (Brevo) et les notifications push (OneSignal).

**Technologies** : Node.js, Express, Supabase, JWT, Socket.io, Cloudinary, Brevo, OneSignal

[Voir le README du backend](./kovo-backend/README.md)

### kovo-database
Schema de base de donnees PostgreSQL heberge sur Supabase. Contient les tables users, trips, bookings et messages avec les index et triggers necessaires.

**Technologies** : PostgreSQL, Supabase

[Voir le README de la database](./kovo-database/README.md)

### kovo-frontend
Application web Next.js 14 avec App Router. Interface mobile-first utilisant Tailwind CSS et les composants Radix UI. Inclut cartes interactives (Leaflet), gestion d'etat (Zustand) et formulaires valides (React Hook Form + Zod).

**Technologies** : Next.js 14, TypeScript, Tailwind CSS, Radix UI, Zustand, Leaflet

[Voir le README du frontend](./kovo-frontend/README.md)

## Fonctionnalites principales

- **Authentification** : Inscription, connexion, verification email, mot de passe oublie
- **Gestion des trajets** : Creation, recherche, modification, suppression
- **Reservations** : Demande, acceptation/refus, annulation
- **Messagerie temps reel** : Conversations entre conducteurs et passagers
- **Profil utilisateur** : Informations personnelles, vehicule, permis
- **Verification etudiant** : Upload carte etudiante
- **Notifications** : Push notifications (OneSignal)
- **PWA** : Application installable sur mobile

## Prerequis

- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Cloudinary
- Compte Brevo (emails)
- Compte OneSignal (notifications)

## Installation rapide

### 1. Base de donnees

1. Creer un projet sur [Supabase](https://supabase.com)
2. Executer le schema SQL dans `kovo-database/schema.sql`
3. Recuperer les credentials (URL, anon key, service role key)

### 2. Backend

```bash
cd kovo-backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

Le serveur demarre sur http://localhost:3001

### 3. Frontend

```bash
cd kovo-frontend
npm install
cp .env.local.example .env.local
# Configurer NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

L'application demarre sur http://localhost:3000

## Variables d'environnement

### Backend (.env)
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
BREVO_API_KEY=...
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ONESIGNAL_APP_ID=...
ONESIGNAL_API_KEY=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Scripts utiles

```bash
# Backend
cd kovo-backend
npm run dev          # Developpement
npm start            # Production
npm run logs:error   # Voir les erreurs

# Frontend
cd kovo-frontend
npm run dev          # Developpement
npm run build        # Build production
npm start            # Servir le build
```

## API Endpoints

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/verify-email | Verifier email |
| POST | /api/auth/forgot-password | Demander reset |
| POST | /api/auth/reset-password | Reset mot de passe |
| GET | /api/users/me | Profil utilisateur |
| PUT | /api/users/me | Modifier profil |
| GET | /api/trips | Liste des trajets |
| POST | /api/trips | Creer un trajet |
| GET | /api/trips/:id | Detail d'un trajet |
| PUT | /api/trips/:id | Modifier un trajet |
| DELETE | /api/trips/:id | Supprimer un trajet |
| GET | /api/bookings | Mes reservations |
| POST | /api/bookings | Nouvelle reservation |
| PUT | /api/bookings/:id | Modifier statut |
| GET | /api/messages | Conversations |
| POST | /api/messages | Envoyer message |

## Licence

Projet prive - Tous droits reserves

---

Developpe par **Amir Moussi**
