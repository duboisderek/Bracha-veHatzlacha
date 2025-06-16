# CONFIGURATION SANDBOX - PROJET BRACHAVEHATZLACHA

## 🗄️ CONNEXION BASE DE DONNÉES

### URL Complète
```
DATABASE_URL=postgresql://neondb_owner:npg_RMgpEuoSA80L@ep-muddy-pond-a56dqzjy.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Variables Décomposées
```bash
PGHOST=ep-muddy-pond-a56dqzjy.us-east-2.aws.neon.tech
PGPORT=5432
PGDATABASE=neondb
PGUSER=neondb_owner
PGPASSWORD=npg_RMgpEuoSA80L
PGSSLMODE=require
```

## 🚀 SETUP SANDBOX

### 1. Variables d'Environnement
Créez un fichier `.env` dans votre sandbox :
```bash
DATABASE_URL=postgresql://neondb_owner:npg_RMgpEuoSA80L@ep-muddy-pond-a56dqzjy.us-east-2.aws.neon.tech/neondb?sslmode=require
NODE_ENV=development
PORT=5000
```

### 2. Installation Dépendances
```bash
npm install
```

### 3. Configuration Base de Données
```bash
# Synchroniser le schéma
npm run db:push

# Optionnel : Interface graphique
npm run db:studio
```

### 4. Lancement Application
```bash
# Mode développement
npm run dev

# Ou séparément
npm run server  # Backend seul
npm run client  # Frontend seul
```

## 📊 STRUCTURE DONNÉES EXISTANTES

### Tables Principales
- `users` - Utilisateurs avec authentification
- `draws` - Tirages de loterie
- `tickets` - Tickets achetés
- `winning_numbers` - Numéros gagnants
- `transactions` - Historique financier

### Données de Test
La base contient déjà :
- Compte admin : demo@brachavehatzlacha.com / demo123
- Tirages d'exemple
- Utilisateurs de démonstration
- Transactions de test

## 🔧 CONFIGURATION DÉVELOPPEMENT

### Scripts Package.json
```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "vite build",
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio",
  "type-check": "tsc --noEmit"
}
```

### Structure Serveur
- **Port** : 5000
- **API Base** : /api
- **Frontend** : Servi via Vite en développement
- **WebSocket** : /ws pour chat temps réel

## 🎯 FONCTIONNALITÉS ACTIVES

### Authentification
- Session-based avec cookies
- Rôles : Admin, VIP, Standard, New Client
- Endpoints demo pour tests

### Interface Multilingue
- 287 clés de traduction
- Langues : Anglais, Hébreu, Français
- Support RTL complet

### API Endpoints Principaux
```
POST /api/auth/login
POST /api/auth/demo-login
GET  /api/draws/current
POST /api/tickets
GET  /api/admin/users
POST /api/admin/draws
```

## 🧪 TESTS RAPIDES

### Vérification Connexion DB
```bash
# Test connexion
node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => console.log('DB OK'))"
```

### Test API
```bash
# Test endpoint public
curl http://localhost:5000/api/draws/current

# Test authentification
curl -X POST http://localhost:5000/api/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"demoUser": "client1"}'
```

### Interface Web
- Frontend : http://localhost:5000
- Admin : http://localhost:5000/admin
- API : http://localhost:5000/api

## 🔐 SÉCURITÉ

### SSL/TLS
La base de données Neon requiert SSL (inclus dans l'URL)

### Variables Sensibles
Ne jamais commiter le fichier `.env` - ajoutez-le au `.gitignore`

### Sessions
Configurées avec cookies HttpOnly et sécurisés

---

Avec ces informations, vous devriez pouvoir lancer l'application complète dans votre sandbox et accéder à toutes les fonctionnalités de la plateforme de loterie BrachaVeHatzlacha.