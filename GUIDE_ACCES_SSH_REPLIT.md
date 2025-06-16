# GUIDE D'ACCÈS SSH ET DÉVELOPPEMENT EXTERNE

## 🔐 ACCÈS SSH REPLIT

### Activation SSH sur Replit
Pour donner accès SSH à un développeur externe :

1. **Dans votre Repl** : Cliquez sur l'onglet "Shell"
2. **Installer SSH** : Le SSH est disponible par défaut sur Replit
3. **Obtenir l'URL SSH** : 
   ```bash
   echo "SSH: ssh://user@${REPLIT_DB_URL%%/*}"
   ```

### Commande SSH d'Accès
```bash
# Le développeur externe peut se connecter via :
ssh -p 22 user@your-repl-url.replit.dev
```

## 🌐 ACCÈS COMPLET DÉVELOPPEUR

### 1. Invitation Collaborateur Replit
- Allez sur votre Repl : https://replit.com/@jmblx/rest-express
- Cliquez "Share" → "Invite collaborators"
- Ajoutez l'email du développeur
- Donnez les permissions "Edit"

### 2. Accès Direct au Code
Une fois invité, le développeur aura :
- **Accès complet** au code source
- **Terminal SSH** intégré dans Replit
- **Variables d'environnement** automatiquement configurées
- **Base de données** accessible via DATABASE_URL

### 3. Base de Données PostgreSQL
```bash
# Variables automatiquement disponibles :
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=5432
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

## 🛠️ OUTILS DE DÉVELOPPEMENT EXTERNE

### Connexion Database
Le développeur peut se connecter avec n'importe quel client PostgreSQL :
- **pgAdmin**
- **DBeaver** 
- **DataGrip**
- **VS Code PostgreSQL extension**

### Environnement Local (optionnel)
Si le développeur veut travailler localement :

```bash
# Cloner depuis Replit
git clone https://github.com/replit/your-repo

# Installer dépendances
npm install

# Variables d'environnement à configurer
DATABASE_URL=postgresql://[connexion-replit]
NODE_ENV=development
```

## 📋 INFORMATIONS POUR LE DÉVELOPPEUR

### URLs d'Accès
- **Application Live** : https://rest-express-jmblx.replit.app
- **Replit IDE** : https://replit.com/@jmblx/rest-express
- **API Base** : https://rest-express-jmblx.replit.app/api

### Comptes de Test
```javascript
// Admin
{
  email: "demo@brachavehatzlacha.com",
  password: "demo123"
}

// Client Demo (via endpoint)
POST /api/auth/demo-login
{
  "demoUser": "client1"
}
```

### Structure Principale
```
├── client/src/          # Frontend React + TypeScript
├── server/              # Backend Express + TypeScript  
├── shared/schema.ts     # Base de données Drizzle
└── package.json         # Dépendances npm
```

## 🚀 COMMANDES IMPORTANTES

### Développement
```bash
npm run dev              # Lance le serveur complet
npm run build            # Build de production
```

### Base de Données
```bash
npm run db:push          # Synchronise le schéma
npm run db:studio        # Interface graphique DB
```

### Tests
```bash
npm test                 # Tests unitaires
npm run type-check       # Vérification TypeScript
```

## 🔧 CONFIGURATION AVANCÉE

### Variables Sensibles
Toutes les variables d'environnement sont configurées automatiquement dans Replit :
- Connexion base de données
- Clés de session
- Configuration serveur

### Ports et Networking
- **Port principal** : 5000
- **Frontend** : Servi via Vite
- **API** : Express.js sur /api/*
- **WebSocket** : /ws pour temps réel

## 📞 SUPPORT TECHNIQUE

### Documentation Complète
- `README.md` - Guide d'installation
- `RAPPORT_FINAL_TRADUCTIONS_COMPLETES_287_CLES.md` - Système multilingue
- `ACCES_DEVELOPPEUR_EXTERNE_COMPLET.md` - Ce guide

### Aide Développement
- Code entièrement typé TypeScript
- Composants documentés
- API endpoints détaillés
- Schémas de base de données explicites

---

**ÉTAPES POUR DONNER ACCÈS :**

1. **Inviter sur Replit** - Permissions "Edit"
2. **Partager ce guide** - Informations complètes
3. **Vérifier l'accès** - Test connexion DB et app
4. **Support initial** - Première session de développement assistée