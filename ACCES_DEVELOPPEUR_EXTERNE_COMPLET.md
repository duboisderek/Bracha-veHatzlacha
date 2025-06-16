# ACCÈS DÉVELOPPEUR EXTERNE - PROJET BRACHAVEHATZLACHA

## 🌐 ACCÈS REPLIT

### URL Principal du Projet
```
https://rest-express-jmblx.replit.app
```

### Interface de Développement Replit
```
https://replit.com/@jmblx/rest-express
```

## 🗄️ BASE DE DONNÉES POSTGRESQL

### Informations de Connexion
- **Type**: PostgreSQL
- **Host**: Fourni via variable d'environnement DATABASE_URL
- **Port**: Standard PostgreSQL (5432)
- **Accès**: Via DATABASE_URL dans l'environnement Replit

### Variables d'Environnement Disponibles
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
PGHOST=[host]
PGPORT=[port]
PGUSER=[user]
PGPASSWORD=[password]
PGDATABASE=[database]
```

## 🛠️ STACK TECHNIQUE

### Frontend
- **Framework**: React + TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **Build**: Vite

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Session-based

### Multilingue
- **Langues**: Anglais, Hébreu, Français
- **RTL**: Support complet pour l'hébreu
- **Traductions**: 287 clés par langue

## 📁 STRUCTURE DU PROJET

```
/
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/   # Composants UI
│   │   ├── pages/        # Pages principales
│   │   ├── contexts/     # Contexts React
│   │   ├── hooks/        # Hooks personnalisés
│   │   └── lib/          # Utilitaires
├── server/           # Backend Express
│   ├── routes.ts     # Routes API
│   ├── db.ts         # Configuration DB
│   └── index.ts      # Serveur principal
├── shared/           # Types partagés
│   └── schema.ts     # Schémas Drizzle
└── package.json      # Dépendances
```

## 🚀 COMMANDES DE DÉVELOPPEMENT

### Démarrage Local
```bash
npm run dev          # Lance frontend + backend
npm run build        # Build de production
npm run db:push      # Synchronise schéma DB
```

### Base de Données
```bash
npm run db:studio    # Interface Drizzle Studio
npm run db:generate  # Génère migrations
```

## 🔑 COMPTES DE TEST

### Admin
- **Email**: demo@brachavehatzlacha.com
- **Mot de passe**: demo123
- **Accès**: Interface d'administration complète

### Clients Demo
- **Endpoint**: `/api/auth/demo-login`
- **Méthode**: POST avec `{"demoUser": "client1"}`

## 📊 FONCTIONNALITÉS PRINCIPALES

### Interface Client
- ✅ Authentification complète
- ✅ Achat de tickets de loto
- ✅ Historique des participations
- ✅ Chat support en temps réel
- ✅ Interface multilingue

### Interface Admin
- ✅ Gestion des utilisateurs
- ✅ Création et gestion des tirages
- ✅ Statistiques complètes
- ✅ Dépôts manuels
- ✅ Historique des transactions

### Système Multilingue
- ✅ 287 clés de traduction
- ✅ Support RTL pour l'hébreu
- ✅ Commutation instantanée
- ✅ Interface admin traduite

## 🔧 OUTILS DE DÉVELOPPEMENT

### Base de Données
- **Drizzle Studio**: Interface graphique pour la DB
- **Schémas typés**: TypeScript intégral
- **Migrations**: Gestion automatique

### Frontend
- **Hot Reload**: Rechargement instantané
- **TypeScript**: Vérification de types
- **Tailwind**: Classes utilitaires CSS

### Backend
- **API REST**: Endpoints documentés
- **Sessions**: Authentification sécurisée
- **WebSocket**: Communication temps réel

## 📋 ENDPOINTS API PRINCIPAUX

### Authentification
```
POST /api/auth/login          # Connexion
POST /api/auth/demo-login     # Connexion demo
POST /api/auth/register       # Inscription
GET  /api/auth/user           # Profil utilisateur
POST /api/logout              # Déconnexion
```

### Tirages
```
GET  /api/draws/current       # Tirage actuel
POST /api/admin/draws         # Créer tirage (admin)
PUT  /api/admin/draws/:id/results  # Saisir résultats
```

### Tickets
```
POST /api/tickets             # Acheter ticket
GET  /api/tickets/user        # Mes tickets
```

### Administration
```
GET  /api/admin/users         # Liste utilisateurs
POST /api/admin/create-user   # Créer utilisateur
POST /api/admin/deposit       # Dépôt manuel
GET  /api/admin/stats         # Statistiques
```

## 🛡️ SÉCURITÉ

### Variables Sensibles
- Les clés API et mots de passe sont dans l'environnement Replit
- Pas de credentials hardcodés dans le code
- Sessions sécurisées avec cookies HttpOnly

### Accès Admin
- Vérification des rôles sur chaque endpoint
- Interface admin protégée
- Logs d'activité admin

## 📞 SUPPORT DÉVELOPPEUR

### Documentation
- Code entièrement commenté
- README détaillé par composant
- Schemas de données documentés

### Tests
- Endpoints testés manuellement
- Interface validée sur multiple navigateurs
- Support mobile responsive

## 🚀 DÉPLOIEMENT

### Production Ready
- ✅ Build optimisé
- ✅ Variables d'environnement configurées
- ✅ Base de données prête
- ✅ SSL/HTTPS automatique via Replit

### URL de Production
```
https://rest-express-jmblx.replit.app
```

---

**Pour accès développeur externe:**
1. Partager l'URL Replit du projet
2. Donner accès collaborateur sur Replit
3. Le développeur aura accès complet au code et à la base de données
4. Toutes les variables d'environnement sont configurées automatiquement