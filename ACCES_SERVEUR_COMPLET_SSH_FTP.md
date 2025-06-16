# ACCÈS SERVEUR COMPLET - TOUTES MÉTHODES

## 🔐 ACCÈS SSH

**Type d'accès :** SSH
**Adresse du serveur :** `rest-express-jmblx.replit.dev`
**Nom d'utilisateur :** `runner`
**Mot de passe :** Aucun (authentification par clé)
**Port :** `22`

### Commande de connexion :
```bash
ssh runner@rest-express-jmblx.replit.dev
```

## 🌐 ACCÈS WEB DIRECT (Alternative recommandée)

**URL Replit IDE :** https://replit.com/@jmblx/rest-express
**Méthode :** Interface web avec terminal intégré
**Avantage :** Accès immédiat sans configuration SSH

## 📁 ACCÈS FTP/SFTP

**Type :** SFTP (SSH File Transfer Protocol)
**Serveur :** `rest-express-jmblx.replit.dev`
**Port :** `22`
**Utilisateur :** `runner`
**Protocole :** SFTP sur SSH

### Clients FTP recommandés :
- **FileZilla :** Protocol SFTP, Host: rest-express-jmblx.replit.dev, Port: 22
- **WinSCP :** Protocol SFTP, même configuration
- **Cyberduck :** SFTP connection

## 🔑 CONFIGURATION CLÉ SSH MANUELLE

Si vous devez configurer l'authentification SSH manuellement :

### Étape 1 : Générer une clé SSH
```bash
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```

### Étape 2 : Clé publique à ajouter sur le serveur
La clé publique (fichier .pub) doit être ajoutée dans :
```
/home/runner/.ssh/authorized_keys
```

### Étape 3 : Configuration client SSH
Fichier `~/.ssh/config` :
```
Host replit-lottery
    HostName rest-express-jmblx.replit.dev
    User runner
    Port 22
    IdentityFile ~/.ssh/votre_cle_privee
```

## 🛠️ ACCÈS VS CODE REMOTE

**Extension :** Remote - SSH
**Configuration :**
1. Installer l'extension "Remote - SSH" dans VS Code
2. Ajouter la configuration SSH ci-dessus
3. Se connecter via Command Palette : "Remote-SSH: Connect to Host"

## 📡 ACCÈS BASE DE DONNÉES

**Type :** PostgreSQL
**Host :** `ep-muddy-pond-a56dqzjy.us-east-2.aws.neon.tech`
**Port :** `5432`
**Database :** `neondb`
**Username :** `neondb_owner`
**Password :** `npg_RMgpEuoSA80L`
**SSL :** Requis

### Clients DB recommandés :
- **pgAdmin :** Interface graphique complète
- **DBeaver :** Multi-plateforme, gratuit
- **DataGrip :** IDE JetBrains (payant)

## 🔧 TUNNEL SSH POUR DÉVELOPPEMENT LOCAL

### Port Forwarding Application
```bash
ssh -L 8080:localhost:5000 runner@rest-express-jmblx.replit.dev
# Accès local : http://localhost:8080
```

### Port Forwarding Base de Données
```bash
ssh -L 5433:ep-muddy-pond-a56dqzjy.us-east-2.aws.neon.tech:5432 runner@rest-express-jmblx.replit.dev
# Connexion locale : postgresql://neondb_owner:npg_RMgpEuoSA80L@localhost:5433/neondb
```

## 🚀 ACCÈS RAPIDE POUR DÉVELOPPEUR

### Option 1 : Collaboration Replit (Plus simple)
1. Inviter le développeur sur https://replit.com/@jmblx/rest-express
2. Donner permissions "Edit"
3. Accès immédiat au code et terminal

### Option 2 : Clone Git Local
```bash
# Si repository Git configuré
git clone https://github.com/votre-repo/rest-express.git
cd rest-express
```

### Option 3 : Téléchargement Direct
Depuis l'interface Replit : Download as ZIP

## 📋 INFORMATIONS COMPLÉMENTAIRES

### Répertoire Projet
```
/home/runner/rest-express/
```

### Logs Application
```
~/.pm2/logs/app-out.log
~/.pm2/logs/app-error.log
```

### Processus Actifs
```bash
ps aux | grep node
pm2 status
```

### Variables Environnement
Toutes configurées automatiquement dans l'environnement Replit

## ⚠️ LIMITATIONS REPLIT

- **Container temporaire :** Le serveur peut redémarrer
- **Timeout inactivité :** Arrêt automatique après inactivité
- **Stockage persistant :** Seuls les fichiers du projet sont persistants

## 🎯 RECOMMANDATION

Pour un développeur externe, l'accès le plus simple et efficace est :
1. **Invitation collaborateur Replit** (accès complet immédiat)
2. **SSH direct** si préférence terminal
3. **SFTP** pour transfert de fichiers uniquement