# Kovo Database

Schema de base de donnees PostgreSQL pour l'application de covoiturage Kovo.

**Auteur** : Amir Moussi

## Description

Ce dossier contient le schema SQL complet pour la base de donnees Kovo, hebergee sur Supabase (PostgreSQL).

## Structure de la base de donnees

### Tables principales

#### `users` - Utilisateurs (etudiants)
Stocke toutes les informations des utilisateurs de la plateforme.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | VARCHAR(255) | Email (unique) |
| `password` | VARCHAR(255) | Mot de passe hashe |
| `first_name` | VARCHAR(100) | Prenom |
| `last_name` | VARCHAR(100) | Nom |
| `university` | VARCHAR(200) | Universite |
| `student_id` | VARCHAR(100) | Numero etudiant |
| `phone` | VARCHAR(20) | Telephone |
| `bio` | TEXT | Biographie |
| `avatar` | TEXT | URL de l'avatar |
| `verified` | BOOLEAN | Email verifie |
| `drivers_license_*` | - | Informations permis |
| `vehicle_*` | - | Informations vehicule |
| `student_card_photo` | TEXT | Photo carte etudiante |
| `created_at` / `updated_at` | TIMESTAMPTZ | Horodatage |

#### `trips` - Trajets
Stocke les trajets proposes par les conducteurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `driver_id` | UUID | Reference vers users |
| `departure` | VARCHAR(200) | Ville de depart |
| `destination` | VARCHAR(200) | Ville d'arrivee |
| `departure_lat/lng` | DECIMAL | Coordonnees depart |
| `destination_lat/lng` | DECIMAL | Coordonnees arrivee |
| `date_time` | TIMESTAMPTZ | Date et heure du trajet |
| `seats_available` | INTEGER | Places disponibles |
| `total_seats` | INTEGER | Nombre total de places |
| `price` | DECIMAL | Prix par passager |
| `description` | TEXT | Description optionnelle |
| `meeting_point` | VARCHAR(200) | Point de rencontre |
| `distance` | DECIMAL | Distance en km |
| `duration` | INTEGER | Duree en minutes |
| `instant_booking` | BOOLEAN | Reservation instantanee |
| `status` | VARCHAR(20) | active/completed/cancelled |

#### `bookings` - Reservations
Gere les demandes de reservation des passagers.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `trip_id` | UUID | Reference vers trips |
| `passenger_id` | UUID | Reference vers users |
| `seats` | INTEGER | Nombre de places reservees |
| `status` | VARCHAR(20) | pending/confirmed/rejected/cancelled |

**Contrainte** : Un passager ne peut reserver qu'une seule fois le meme trajet.

#### `messages` - Messagerie
Stocke les messages entre utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `sender_id` | UUID | Expediteur |
| `recipient_id` | UUID | Destinataire |
| `content` | TEXT | Contenu du message |
| `trip_id` | UUID | Trajet associe (optionnel) |
| `read` | BOOLEAN | Message lu |

## Index

Les index suivants sont crees pour optimiser les performances :

**Trajets** :
- `idx_trips_driver` - Recherche par conducteur
- `idx_trips_date` - Recherche par date
- `idx_trips_status` - Filtrage par statut
- `idx_trips_departure/destination` - Recherche par ville

**Reservations** :
- `idx_bookings_trip` - Reservations d'un trajet
- `idx_bookings_passenger` - Reservations d'un passager
- `idx_bookings_status` - Filtrage par statut

**Messages** :
- `idx_messages_sender/recipient` - Messages d'un utilisateur
- `idx_messages_created` - Tri chronologique
- `idx_messages_read` - Messages non lus

## Triggers automatiques

### `update_updated_at_column()`
Met a jour automatiquement la colonne `updated_at` lors de toute modification.

### `update_trip_seats()`
Gere automatiquement les places disponibles :
- **Confirmation** : Diminue `seats_available` du nombre de places reservees
- **Annulation** : Augmente `seats_available` pour liberer les places

## Installation

```sql
-- Executer le schema sur Supabase ou PostgreSQL
\i schema.sql
```

Ou copier le contenu de `schema.sql` dans l'editeur SQL de Supabase.

## Licence

Projet prive - Tous droits reserves
