# ACCÈS SSH SERVEUR - PROJET BRACHAVEHATZLACHA

## 🔐 INFORMATIONS DE CONNEXION SSH

### Serveur Replit
```bash
Host: rest-express-jmblx.replit.dev
Port: 22
User: runner
```

### Commande de Connexion
```bash
ssh runner@rest-express-jmblx.replit.dev
```

## 🌐 ACCÈS ALTERNATIVE

### Via Interface Replit
1. Accédez à : https://replit.com/@jmblx/rest-express
2. Ouvrez l'onglet "Shell" pour un terminal direct
3. Accès immédiat sans configuration SSH

### Connexion VS Code Remote
```bash
# Configuration .ssh/config
Host replit-brachavehatzlacha
    HostName rest-express-jmblx.replit.dev
    User runner
    Port 22
```

## 🖥️ DÉTAILS SERVEUR

### Système
- **OS**: Ubuntu Linux (Replit container)
- **Architecture**: x86_64
- **Runtime**: Node.js 20.x
- **Package Manager**: npm

### Ports Actifs
- **5000**: Application principale (Express + Vite)
- **22**: SSH daemon
- **5432**: PostgreSQL (via tunnel)

### Répertoires Importants
```bash
/home/runner/rest-express/     # Projet principal
├── client/                    # Frontend React
├── server/                    # Backend Express
├── shared/                    # Types partagés
└── node_modules/             # Dépendances
```

## 🔧 CONFIGURATION ENVIRONNEMENT

### Variables Disponibles
```bash
DATABASE_URL=postgresql://...   # Connexion DB auto-configurée
REPL_SLUG=rest-express         # Nom du projet
REPL_OWNER=jmblx              # Propriétaire
PORT=5000                     # Port application
NODE_ENV=development          # Mode développement
```

### Services Actifs
```bash
# Vérifier les processus
ps aux | grep node

# Logs en temps réel
tail -f logs/app.log

# Status base de données
npm run db:studio
```

## 🛠️ COMMANDES UTILES SSH

### Navigation Projet
```bash
cd /home/runner/rest-express   # Répertoire projet
ls -la                        # Fichiers du projet
cat package.json              # Configuration npm
```

### Gestion Application
```bash
npm run dev                   # Lancer serveur dev
npm run build                 # Build production
npm install                   # Installer dépendances
```

### Base de Données
```bash
npm run db:push              # Synchroniser schéma
npm run db:studio            # Interface graphique
```

### Logs et Debug
```bash
tail -f ~/.pm2/logs/app-out.log  # Logs application
tail -f ~/.pm2/logs/app-error.log # Logs erreurs
pm2 status                       # Status processus
```

## 🔐 SÉCURITÉ SSH

### Authentification
- **Clé publique**: Configurée automatiquement par Replit
- **Password**: Non requis (clé SSH)
- **Session**: Persistante pendant la durée de connexion

### Permissions
```bash
# Utilisateur runner a accès complet au projet
sudo -l                      # Vérifier permissions sudo
whoami                       # Confirmer utilisateur actuel
```

## 📡 TUNNELING ET FORWARDING

### Port Forwarding Local
```bash
# Depuis votre machine locale
ssh -L 8080:localhost:5000 runner@rest-express-jmblx.replit.dev

# Accès local : http://localhost:8080
```

### Tunnel Base de Données
```bash
# Forward PostgreSQL
ssh -L 5433:localhost:5432 runner@rest-express-jmblx.replit.dev

# Connexion locale : postgresql://localhost:5433/database
```

## 🚀 WORKFLOW DÉVELOPPEMENT

### Connexion et Setup
```bash
# 1. Connexion SSH
ssh runner@rest-express-jmblx.replit.dev

# 2. Navigation projet
cd /home/runner/rest-express

# 3. Vérification état
npm run dev

# 4. Ouverture dans éditeur
code . # Si VS Code remote configuré
```

### Synchronisation Code
```bash
# Pull dernières modifications
git pull origin main

# Installer nouvelles dépendances
npm install

# Redémarrer application
npm run dev
```

## 📋 TROUBLESHOOTING

### Problèmes Connexion
```bash
# Test connectivité
ping rest-express-jmblx.replit.dev

# Vérifier clés SSH
ssh-keygen -l -f ~/.ssh/id_rsa.pub

# Debug connexion
ssh -v runner@rest-express-jmblx.replit.dev
```

### Problèmes Application
```bash
# Vérifier processus
ps aux | grep node

# Nettoyer et redémarrer
npm run clean
npm install
npm run dev
```

### Problèmes Base de Données
```bash
# Test connexion DB
npm run db:push

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql.log
```

---

**IMPORTANT**: L'accès SSH est limité à la durée de vie du container Replit. Pour un accès permanent, utilisez l'interface Replit ou configurez un système de déploiement externe.