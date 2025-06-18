# Accès SSH Serveur Replit - BrachaVeHatzlacha

## Informations de Connexion SSH

### Détails du Serveur
- **Propriétaire**: duboisderek7
- **Projet**: workspace (BrachaVeHatzlacha)
- **Environnement**: Production Ready

### Commande SSH Directe
```bash
ssh duboisderek7@ssh.replit.com
```

### URL du Projet Replit
```
https://replit.com/@duboisderek7/workspace
```

### Accès par Clé SSH (Recommandé)
```bash
# Générer clé SSH (si nécessaire)
ssh-keygen -t rsa -b 4096 -C "developpeur@brachavehatzlacha.com"

# Ajouter la clé publique dans Replit Settings > SSH Keys
cat ~/.ssh/id_rsa.pub

# Connexion avec clé
ssh -i ~/.ssh/id_rsa duboisderek7@ssh.replit.com
```

## Commandes Post-Connexion

### Démarrage Rapide
```bash
# Navigation vers le projet
cd ~/workspace

# Installation dépendances (si nécessaire)
npm install

# Synchronisation base de données
npm run db:push

# Démarrage serveur développement
npm run dev
```

### Vérification Système
```bash
# Statut de l'application
curl http://localhost:5000/api/auth/user

# Vérification base données
npm run db:studio

# Logs en temps réel
tail -f logs/app.log
```

## Accès aux Comptes du Système

### Root Administrator (Accès Total)
```
Email: root@brachavehatzlacha.com
Mot de passe: RootBVH2025!
URL: http://localhost:5000/root-admin
```

### Admin Standard
```
Email: admin@brachavehatzlacha.com
Mot de passe: BrachaVeHatzlacha2024!
URL: http://localhost:5000/admin
```

### Clients de Test
```
# Client Réel Créé
Email: sarah.cohen@test.com
Mot de passe: SarahTest123!
Solde: ₪250.00

# Client Production
Email: client.sync@brachavehatzlacha.com
Mot de passe: ClientSync2025!
Solde: ₪1000.00
```

## Variables d'Environnement

### Configuration Actuelle
```bash
# Base de données PostgreSQL (automatique Replit)
DATABASE_URL=(automatiquement configuré)

# Port d'écoute
PORT=5000

# Environnement
NODE_ENV=development
```

## Structure du Projet

### Dossiers Principaux
```
~/workspace/
├── client/               # Frontend React + TypeScript
├── server/               # Backend Express + TypeScript
├── shared/               # Schémas partagés (Drizzle)
├── logs/                 # Fichiers de logs
├── package.json          # Dépendances npm
└── README.md             # Documentation
```

### Fichiers Critiques pour Développement
```
server/routes.ts          # Toutes les APIs
shared/schema.ts          # Schémas base de données
client/src/App.tsx        # Routage frontend
client/src/pages/         # Pages principales
```

## APIs Disponibles

### Authentification
```bash
POST /api/auth/login      # Connexion
GET /api/auth/user        # Utilisateur connecté
POST /api/auth/logout     # Déconnexion
```

### Root Admin (Gestion Avancée)
```bash
POST /api/admin/create-real-client        # Créer client réel
POST /api/admin/create-fictional-accounts # Créer comptes fictifs
GET /api/admin/all-users                  # Lister utilisateurs
```

### Système Loterie
```bash
GET /api/draws/current    # Tirage actuel
POST /api/tickets         # Acheter ticket
GET /api/tickets/my       # Mes tickets
```

## Tests de Validation

### Test Connexion Root Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "root@brachavehatzlacha.com", "password": "RootBVH2025!"}' \
  -c cookies.txt

# Réponse attendue: {"user": {..., "isRootAdmin": true}}
```

### Test Création Client
```bash
curl -X POST http://localhost:5000/api/admin/create-real-client \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "firstName": "Nouveau",
    "lastName": "Client",
    "email": "nouveau@test.com",
    "password": "Test123!",
    "balance": "200.00",
    "language": "fr"
  }'
```

### Test Interface Web
```bash
# Lancement navigateur (si environnement graphique)
open http://localhost:5000

# Ou via curl pour tester
curl http://localhost:5000/
```

## Base de Données

### Connexion Drizzle Studio
```bash
# Interface graphique base de données
npm run db:studio

# Accès: http://localhost:5001
```

### Tables Actuelles
- **users**: Utilisateurs (réels/fictifs/admins)
- **draws**: Tirages de loterie
- **tickets**: Tickets achetés
- **transactions**: Historique financier
- **chat_messages**: Messages support
- **referrals**: Système parrainage

### Données Pré-chargées
- 1 Root Admin opérationnel
- 1 Admin standard validé
- 2 Clients réels testés
- 15 Comptes fictifs générés
- 1 Tirage actif (Draw #1260)

## Commandes de Développement

### Installation/Mise à Jour
```bash
npm install                # Installer dépendances
npm run db:push           # Synchroniser schéma DB
npm run dev               # Démarrer serveur développement
```

### Debug et Monitoring
```bash
tail -f logs/app.log      # Logs application
tail -f logs/error.log    # Logs erreurs
npm run db:studio         # Interface DB
```

### Tests et Validation
```bash
# Test santé système
curl http://localhost:5000/api/health

# Test tirage actuel
curl http://localhost:5000/api/draws/current

# Test authentification
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "password"}'
```

## Fonctionnalités Implémentées

### Système Complet Opérationnel
- Authentification multi-niveaux (Root/Admin/Client)
- Création de comptes réels via Root Admin
- Génération automatique de comptes fictifs
- Sélection numéros loterie (1-37)
- Achat de tickets (₪100 minimum)
- Calcul automatique des gagnants
- Système multilingue (FR/EN/HE) avec RTL
- Chat support en temps réel (WebSocket)
- Panel d'administration complet
- Interface responsive mobile/desktop
- Système de parrainage avec codes uniques
- Historique des transactions transparent

### URLs d'Accès
```
http://localhost:5000/                # Page d'accueil
http://localhost:5000/admin-login     # Connexion admin
http://localhost:5000/root-admin      # Panel root admin
http://localhost:5000/client-auth     # Connexion clients
http://localhost:5000/home            # Interface de jeu
```

## Support Technique

### Documentation
- Code TypeScript entièrement documenté
- Schémas de base de données avec relations
- APIs documentées avec exemples
- Interface graphique Drizzle Studio

### Logs et Monitoring
- Logs structurés par niveau de gravité
- Cache Redis pour optimisation des performances
- Sessions sécurisées avec cookies HTTP-only
- Validation des entrées avec Zod

---

**Accès SSH Configuré**
**Propriétaire**: duboisderek7@replit.com
**Projet**: workspace (BrachaVeHatzlacha)
**Status**: Production Ready
**Version**: 1.0 Final avec Root Admin