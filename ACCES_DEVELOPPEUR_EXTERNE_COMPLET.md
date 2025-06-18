# Accès Développeur Externe - Projet BrachaVeHatzlacha

## Informations Générales du Projet

### Nom du Projet
**BrachaVeHatzlacha** - Plateforme de Loterie Multilingue Privée

### Technologies Utilisées
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Cache**: Redis (optionnel)
- **WebSocket**: Chat temps réel
- **Langues**: Français, Anglais, Hébreu (RTL)

## Accès SSH à l'Environnement Replit

### URL du Projet
```
https://replit.com/@[USERNAME]/[PROJECT_NAME]
```

### Accès SSH Direct
```bash
ssh [USERNAME]@ssh.replit.com
```

### Clonage Git du Projet
```bash
git clone https://github.com/replit/[PROJECT_NAME].git
cd [PROJECT_NAME]
```

## Structure du Projet

### Arborescence Principale
```
/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages principales
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── contexts/       # Contexts React
│   │   └── lib/            # Utilitaires
├── server/                 # Backend Express
│   ├── routes.ts           # Routes API principales
│   ├── storage.ts          # Interface base de données
│   ├── cache.ts            # Gestion cache Redis
│   └── scheduler.ts        # Tâches automatiques
├── shared/                 # Code partagé
│   └── schema.ts           # Schémas base de données
├── package.json            # Dépendances Node.js
└── README.md               # Documentation
```

## Configuration de l'Environnement

### Variables d'Environnement Requises
```bash
# Base de données
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Sessions
SESSION_SECRET=your_session_secret_here

# Redis (optionnel)
REDIS_URL=redis://localhost:6379

# Environnement
NODE_ENV=development
```

### Installation des Dépendances
```bash
# Installation
npm install

# Synchronisation base de données
npm run db:push

# Démarrage développement
npm run dev
```

## Accès aux Comptes du Système

### Comptes Administrateurs

#### Root Admin (Accès Total)
- **Email**: `root@brachavehatzlacha.com`
- **Mot de passe**: `RootBVH2025!`
- **URL**: `/root-admin`
- **Privilèges**: Création comptes, gestion totale

#### Admin Standard
- **Email**: `admin@brachavehatzlacha.com`
- **Mot de passe**: `BrachaVeHatzlacha2024!`
- **URL**: `/admin`
- **Privilèges**: Gestion tirages, utilisateurs

### Comptes Clients de Test

#### Client Réel Créé
- **Email**: `sarah.cohen@test.com`
- **Mot de passe**: `SarahTest123!`
- **Solde**: ₪250.00
- **URL**: `/client-auth`

#### Client Production Validé
- **Email**: `client.sync@brachavehatzlacha.com`
- **Mot de passe**: `ClientSync2025!`
- **Solde**: ₪1000.00
- **URL**: `/client-auth`

## APIs Principales pour Développement

### Authentification
```bash
# Connexion
POST /api/auth/login
{
  "email": "email@example.com",
  "password": "password"
}

# Statut utilisateur
GET /api/auth/user

# Déconnexion
POST /api/auth/logout
```

### Gestion Utilisateurs (Root Admin)
```bash
# Créer client réel
POST /api/admin/create-real-client
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "balance": "100.00",
  "language": "fr"
}

# Créer comptes fictifs
POST /api/admin/create-fictional-accounts
{
  "count": 10,
  "baseWinnings": 1000
}

# Lister utilisateurs
GET /api/admin/all-users?type=real|fictional|all
```

### Tirages et Tickets
```bash
# Tirage actuel
GET /api/draws/current

# Créer ticket
POST /api/tickets
{
  "drawId": 1,
  "numbers": [1, 7, 14, 21, 28, 35],
  "cost": "100.00"
}

# Historique utilisateur
GET /api/tickets/my
```

## Base de Données - Schémas Principaux

### Table Users
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  balance DECIMAL(10,2) DEFAULT 0,
  total_winnings DECIMAL(10,2) DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  is_root_admin BOOLEAN DEFAULT FALSE,
  is_fictional BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  language VARCHAR(5) DEFAULT 'fr',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table Draws
```sql
CREATE TABLE draws (
  id SERIAL PRIMARY KEY,
  draw_number INTEGER UNIQUE,
  draw_date TIMESTAMP,
  jackpot_amount DECIMAL(10,2),
  winning_numbers INTEGER[],
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE
);
```

### Table Tickets
```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  draw_id INTEGER REFERENCES draws(id),
  numbers INTEGER[],
  cost DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Commandes de Développement

### Base de Données
```bash
# Pousser modifications schéma
npm run db:push

# Générer migration
npm run db:generate

# Studio Drizzle (interface graphique)
npm run db:studio
```

### Développement
```bash
# Démarrage serveur dev
npm run dev

# Build production
npm run build

# Tests
npm test

# Lint code
npm run lint
```

## Débogage et Logs

### Fichiers de Logs
- **Logs généraux**: `/logs/app.log`
- **Logs erreurs**: `/logs/error.log`
- **Logs performances**: `/logs/performance.log`
- **Logs sécurité**: `/logs/security.log`

### Debug Mode
```bash
# Activer logs détaillés
NODE_ENV=development DEBUG=* npm run dev
```

## Fonctionnalités Implémentées

### Système Complet
- ✅ Authentification multi-niveaux
- ✅ Sélection numéros loterie (1-37)
- ✅ Achat tickets ₪100 minimum
- ✅ Calcul gagnants automatique
- ✅ Système multilingue FR/EN/HE
- ✅ Chat temps réel WebSocket
- ✅ Panel admin complet
- ✅ Système root admin
- ✅ Génération comptes fictifs
- ✅ Interface responsive

### URLs d'Accès Développement
- **Landing**: `http://localhost:5000/`
- **Admin**: `http://localhost:5000/admin-login`
- **Root Admin**: `http://localhost:5000/root-admin`
- **Client**: `http://localhost:5000/client-auth`
- **API Docs**: `http://localhost:5000/api/`

## Sécurité et Bonnes Pratiques

### Sécurité Implémentée
- Sessions sécurisées avec cookies HTTP-only
- Validation des entrées Zod
- Middleware d'authentification par rôle
- Protection CSRF
- Logs de sécurité complets

### Tests de Sécurité
```bash
# Test connexion root admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "root@brachavehatzlacha.com", "password": "RootBVH2025!"}'

# Test création client
curl -X POST http://localhost:5000/api/admin/create-real-client \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"firstName": "Test", "lastName": "User", "email": "test@test.com", "password": "Test123!"}'
```

## Support et Contact

### Documentation Technique
- Code documenté avec JSDoc
- README détaillé par module
- Schémas base données documentés
- APIs documentées avec exemples

### Aide au Développement
- Interface Drizzle Studio pour DB
- Logs détaillés pour débogage
- Hot reload développement
- TypeScript pour type safety

---

**Projet Status**: Production Ready
**Dernière mise à jour**: 18 juin 2025
**Version**: 1.0 Final
**Développeur Principal**: Système Root Admin Opérationnel