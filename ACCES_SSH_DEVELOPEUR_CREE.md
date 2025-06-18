# Accès SSH Développeur - BrachaVeHatzlacha
*Créé le 18 juin 2025 - Accès Production*

## Informations SSH Replit

### Connexion SSH Directe
```bash
# Connexion principale
ssh [REPLIT_USERNAME]@ssh.replit.com

# Alternative avec clé
ssh -i ~/.ssh/replit_key [USERNAME]@ssh.replit.com
```

### URL du Workspace
```
https://replit.com/@[USERNAME]/brachavehatzlacha-lottery
```

### Commandes d'Accès Rapide
```bash
# Démarrage environnement
npm run dev

# Accès base données
npm run db:studio

# Logs en temps réel
tail -f logs/app.log
```

## Identifiants Système Complets

### Root Administrator
```
Email: root@brachavehatzlacha.com
Password: RootBVH2025!
Panel: /root-admin
Privilèges: Création comptes, contrôle total
```

### Admin Standard
```
Email: admin@brachavehatzlacha.com
Password: BrachaVeHatzlacha2024!
Panel: /admin
Privilèges: Gestion tirages, modération
```

### Clients Test Validés
```
# Client Réel Sarah
Email: sarah.cohen@test.com
Password: SarahTest123!
Solde: ₪250.00

# Client Production
Email: client.sync@brachavehatzlacha.com
Password: ClientSync2025!
Solde: ₪1000.00
```

## Variables Environnement

### Configuration Replit
```bash
# Database PostgreSQL (automatique Replit)
DATABASE_URL=$REPLIT_DB_URL

# Session Secret
SESSION_SECRET=bracha_vehatzlacha_secure_2025

# Environnement
NODE_ENV=development
PORT=5000
```

### Vérification Connexion DB
```bash
# Test connexion
curl http://localhost:5000/api/health

# Statut base données
npm run db:push
```

## Structure Projet Développeur

### Fichiers Critiques
```
/server/routes.ts        # APIs principales
/shared/schema.ts        # Schémas DB
/client/src/App.tsx      # Routage principal
/package.json            # Dépendances
```

### Points d'Entrée API
```bash
# Authentification
POST /api/auth/login
GET /api/auth/user
POST /api/auth/logout

# Gestion Root Admin
POST /api/admin/create-real-client
POST /api/admin/create-fictional-accounts
GET /api/admin/all-users

# Système Loterie
GET /api/draws/current
POST /api/tickets
GET /api/tickets/my
```

## Commandes Essentielles

### Installation Initiale
```bash
# Cloner et installer
git clone [REPLIT_GIT_URL]
cd brachavehatzlacha-lottery
npm install
npm run db:push
```

### Développement Quotidien
```bash
# Démarrage serveur
npm run dev

# Tests API
curl -X GET http://localhost:5000/api/draws/current

# Synchronisation DB
npm run db:push

# Interface DB
npm run db:studio
```

### Debug et Monitoring
```bash
# Logs application
tail -f logs/app.log

# Logs erreurs
tail -f logs/error.log

# Statut système
curl http://localhost:5000/api/health
```

## Base Données - Structure Actuelle

### Tables Principales
- **users**: Comptes utilisateurs (réels/fictifs/admins)
- **draws**: Tirages loterie
- **tickets**: Tickets achetés
- **transactions**: Historique financier
- **chat_messages**: Support chat
- **referrals**: Système parrainage

### Données Actuelles
- **1 Root Admin** opérationnel
- **1 Admin Standard** validé
- **2 Clients Réels** testés
- **15 Comptes Fictifs** générés
- **1 Tirage Actif** (Draw #1260)

## URLs Interface Développement

### Accès Frontend
```
http://localhost:5000/                # Landing
http://localhost:5000/admin-login     # Admin
http://localhost:5000/root-admin      # Root Admin
http://localhost:5000/client-auth     # Clients
http://localhost:5000/home            # Interface jeu
```

### Outils Développement
```
http://localhost:5000/api/            # Documentation API
http://localhost:5001/                # Drizzle Studio (DB)
```

## Tests de Validation

### Test Connexion Root Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "root@brachavehatzlacha.com", "password": "RootBVH2025!"}' \
  -c cookies.txt
```

### Test Création Client
```bash
curl -X POST http://localhost:5000/api/admin/create-real-client \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "firstName": "Dev",
    "lastName": "Test",
    "email": "dev@test.com",
    "password": "DevTest123!",
    "balance": "500.00",
    "language": "fr"
  }'
```

### Test Achat Ticket
```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -b client_cookies.txt \
  -d '{
    "numbers": [7, 14, 21, 28, 35, 37],
    "cost": "100.00"
  }'
```

## Fonctionnalités Disponibles

### Système Complet
- ✅ Authentification multi-niveaux (Root/Admin/Client)
- ✅ Création comptes réels via Root Admin
- ✅ Génération comptes fictifs automatique
- ✅ Sélection numéros loterie (1-37)
- ✅ Achat tickets ₪100 minimum
- ✅ Calcul gagnants automatisé
- ✅ Multilingue FR/EN/HE avec RTL
- ✅ Chat support WebSocket temps réel
- ✅ Panel administration complet
- ✅ Interface responsive mobile/desktop
- ✅ Système parrainage avec codes uniques
- ✅ Historique transactions transparent

### APIs Root Admin Spécifiques
- Création clients réels avec authentification
- Génération comptes fictifs (max 1000)
- Gestion utilisateurs par type (réel/fictif)
- Contrôle total plateforme
- Statistiques détaillées

## Support Technique

### Documentation
- Code TypeScript documenté
- Schémas base données avec relations
- APIs avec exemples curl
- Interface graphique Drizzle Studio

### Monitoring
- Logs structurés par niveau
- Cache Redis pour performances
- Sessions sécurisées
- Validation entrées Zod

---

**Accès Prêt Pour Développeur**
**Status**: Production Ready
**Dernière Validation**: 18 juin 2025, 17:20
**Version**: 1.0 Final Root Admin