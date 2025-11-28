# Kovo Frontend

Application web de covoiturage pour etudiants - Interface utilisateur.

**Auteur** : Amir Moussi

## Description

Frontend Next.js 14 avec App Router pour l'application Kovo. Interface mobile-first pour la recherche de trajets, les reservations et la messagerie entre etudiants.

## Technologies

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Composants UI** : Radix UI (shadcn/ui)
- **State Management** : Zustand
- **Formulaires** : React Hook Form + Zod
- **Cartes** : Leaflet / React-Leaflet
- **HTTP Client** : Axios
- **WebSocket** : Socket.io Client
- **Notifications** : OneSignal
- **PWA** : next-pwa

## Structure du projet

```
kovo-frontend/
├── app/                    # Pages (App Router)
│   ├── (auth)/             # Pages d'authentification
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   ├── (main)/             # Pages principales (authentifiees)
│   │   ├── page.tsx        # Page d'accueil (creation trajet)
│   │   ├── search/         # Recherche de trajets
│   │   ├── trips/          # Details et gestion des trajets
│   │   │   ├── new/        # Nouveau trajet
│   │   │   └── [id]/       # Detail, edition, reservations
│   │   ├── my-trips/       # Mes trajets publies
│   │   ├── bookings/       # Mes reservations
│   │   ├── messages/       # Messagerie
│   │   ├── profile/        # Profil utilisateur
│   │   │   ├── edit/       # Edition du profil
│   │   │   ├── vehicle/    # Gestion du vehicule
│   │   │   ├── license/    # Permis de conduire
│   │   │   └── verification/ # Verification etudiant
│   │   ├── settings/       # Parametres
│   │   └── legal/          # Pages legales
│   │       ├── terms/
│   │       ├── privacy/
│   │       └── mentions/
│   ├── globals.css         # Styles globaux
│   └── layout.tsx          # Layout racine
├── components/
│   ├── forms/              # Composants de formulaires
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   └── verify-email-form.tsx
│   ├── layout/             # Composants de mise en page
│   │   ├── header.tsx
│   │   ├── bottom-nav.tsx
│   │   └── theme-provider.tsx
│   ├── shared/             # Composants partages
│   │   ├── phone-input.tsx
│   │   ├── plate-input.tsx
│   │   ├── cookie-consent.tsx
│   │   ├── delete-dialog.tsx
│   │   └── account-delete-dialog.tsx
│   ├── trip/               # Composants lies aux trajets
│   │   ├── trip-card.tsx
│   │   ├── location-input.tsx
│   │   └── route-map.tsx
│   └── ui/                 # Composants UI de base (shadcn)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ...
├── lib/
│   ├── api.ts              # Client API (Axios)
│   ├── store.ts            # Store Zustand
│   ├── types.ts            # Types TypeScript
│   ├── utils.ts            # Fonctions utilitaires
│   ├── hooks/              # Hooks personnalises
│   └── services/           # Services
└── public/                 # Assets statiques
```

## Fonctionnalites

### Authentification
- Inscription avec verification email
- Connexion / Deconnexion
- Mot de passe oublie
- Reinitialisation de mot de passe

### Trajets
- Creation de trajet avec carte interactive
- Recherche par depart/destination/date
- Detail du trajet avec itineraire
- Edition et suppression
- Gestion des reservations (conducteur)

### Reservations
- Demande de reservation
- Suivi du statut
- Historique des reservations

### Profil
- Edition des informations personnelles
- Upload d'avatar
- Gestion du vehicule
- Verification du permis de conduire
- Verification etudiant (carte etudiante)

### Messagerie
- Conversations en temps reel
- Liste des conversations
- Notifications de nouveaux messages

### Autres
- Theme clair/sombre
- Consentement cookies
- Pages legales (CGU, confidentialite, mentions)

## Installation

```bash
# Cloner le repository
cd kovo-frontend

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Editer .env.local avec vos valeurs
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |
| `NEXT_PUBLIC_SOCKET_URL` | URL du serveur WebSocket |

## Scripts disponibles

```bash
# Developpement
npm run dev

# Build production
npm run build

# Demarrer en production
npm start

# Linter
npm run lint
```

## PWA

L'application est configuree comme Progressive Web App et peut etre installee sur mobile.

## Licence

Projet prive - Tous droits reserves
