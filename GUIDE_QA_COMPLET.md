# GUIDE QA - PLATEFORME BRACHA VEHATZLACHA

## 📋 INFORMATIONS GÉNÉRALES

**Plateforme:** Loterie privée multilingue (Hébreu/Anglais)  
**URL de test:** http://localhost:5000  
**Architecture:** React frontend + Express backend + PostgreSQL  
**Fonctionnalités:** Tirages automatisés, chat temps réel, système parrainage, rangs utilisateurs  

---

## 🔐 COMPTES DE TEST PAR RÔLE

### 🏆 ADMINISTRATEURS (Accès complet)

#### Admin Principal Hébreu
- **Email:** admin@brachavehatzlacha.com
- **Mot de passe:** BrachaVeHatzlacha2024!
- **Solde:** 50,000₪
- **Interface:** Hébreu RTL
- **Accès:** Gestion complète plateforme

#### Admin Secondaire Hébreu  
- **Email:** admin.he@brachavehatzlacha.com
- **Mot de passe:** admin123
- **Solde:** 100,000₪
- **Interface:** Hébreu RTL

#### Admin Anglais
- **Email:** admin.en@brachavehatzlacha.com
- **Mot de passe:** admin123
- **Solde:** 75,000₪
- **Interface:** Anglais LTR

### 🌟 CLIENTS VIP (Accès premium)

#### VIP Hébreu
- **Email:** vip.he@brachavehatzlacha.com
- **Mot de passe:** vip123
- **Solde:** 10,000₪
- **Gains:** 2,500₪
- **Parrainages:** 3

#### VIP Anglais
- **Email:** vip.en@brachavehatzlacha.com
- **Mot de passe:** vip123
- **Solde:** 8,500₪
- **Gains:** 1,800₪
- **Parrainages:** 2

### 👤 CLIENTS STANDARD (Accès complet)

#### Standard Hébreu
- **Email:** standard.he@brachavehatzlacha.com
- **Mot de passe:** standard123
- **Solde:** 1,500₪
- **Gains:** 500₪

#### Standard Anglais
- **Email:** standard.en@brachavehatzlacha.com
- **Mot de passe:** standard123
- **Solde:** 1,200₪
- **Gains:** 300₪

### 🆕 NOUVEAUX CLIENTS (Première utilisation)

#### Nouveau Hébreu
- **Email:** new.he@brachavehatzlacha.com
- **Mot de passe:** new123
- **Solde:** 500₪
- **Statut:** Nouveau compte

#### Nouveau Anglais
- **Email:** new.en@brachavehatzlacha.com
- **Mot de passe:** new123
- **Solde:** 300₪
- **Statut:** Nouveau compte

### 🎯 COMPTES LEGACY (Tests historiques)

#### Démo Principal
- **Email:** demo@brachavehatzlacha.com
- **Mot de passe:** demo123
- **Interface:** Mode démo

#### Client Test Complet
- **Email:** test@complete.com
- **Mot de passe:** test123
- **Solde:** 5,000₪

#### Utilisateur Test
- **Email:** testuser@test.com
- **Mot de passe:** test123
- **Solde:** 2,450₪

#### Client Hébreu Existant
- **Email:** client8hxb9u@brachavehatzlacha.com
- **Mot de passe:** client123
- **Solde:** 1,000₪

### ⛔ COMPTE BLOQUÉ (Test restrictions)

#### Utilisateur Bloqué
- **Email:** blocked@brachavehatzlacha.com
- **Mot de passe:** blocked123
- **Statut:** Compte désactivé

---

## 🔑 MÉTHODES DE CONNEXION

### Connexion Standard (Recommandée)
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "email@domain.com",
  "password": "motdepasse"
}
```

### Connexion Admin Legacy
```bash
POST http://localhost:5000/api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@brachavehatzlacha.com",
  "password": "BrachaVeHatzlacha2024!"
}
```

### Connexion Démo Rapide
```bash
POST http://localhost:5000/api/auth/demo-login
Content-Type: application/json

{
  "demoUser": "client1"
}
```
Options: client1, client2, client3

---

## 📱 MENUS ET WORKFLOWS PAR RÔLE

### 🏆 INTERFACE ADMIN

#### Menu Principal
- **👥 Gestion Utilisateurs**
  - Liste tous les utilisateurs
  - Créer nouveaux comptes
  - Modifier soldes (dépôts)
  - Bloquer/débloquer comptes

- **🎲 Gestion Tirages**
  - Créer nouveaux tirages
  - Configurer jackpots
  - Exécuter tirages manuellement
  - Consulter résultats

- **💰 Transactions**
  - Historique complet
  - Dépôts administrateur
  - Validation paiements

- **📊 Statistiques**
  - Dashboard global
  - Métriques utilisateurs
  - Rapports financiers

- **💬 Chat Administration**
  - Modération messages
  - Messages système
  - Gestion communauté

#### Workflow Admin Typique
1. **Connexion** → Dashboard admin
2. **Créer tirage** → Définir jackpot (ex: 50,000₪)
3. **Gérer utilisateurs** → Ajouter solde client
4. **Surveillance** → Consulter achats tickets
5. **Exécution** → Lancer tirage
6. **Résultats** → Valider gagnants

### 👤 INTERFACE CLIENT

#### Menu Principal
- **🎲 Tirage Actuel**
  - Consultation jackpot en cours
  - Achat tickets (6 numéros 1-37)
  - Historique participations

- **🎫 Mes Tickets**
  - Tickets actifs
  - Historique achats
  - Résultats gains

- **💰 Mon Solde**
  - Balance actuelle
  - Historique transactions
  - Gains et dépenses

- **👥 Parrainage**
  - Mon code référent
  - Mes filleuls
  - Bonus gagnés

- **🏆 Mon Rang**
  - Niveau actuel (Bronze/Silver/Gold/Diamond)
  - Progression
  - Avantages débloqués

- **💬 Chat Communauté**
  - Messages temps réel
  - Discussions publiques

#### Workflow Client Typique
1. **Connexion** → Interface personnalisée
2. **Consulter tirage** → Jackpot 50,000₪
3. **Acheter ticket** → Sélectionner 6 numéros
4. **Chat** → Participer discussions
5. **Attendre tirage** → Notifications automatiques
6. **Consulter résultats** → Gains éventuels

### 🎯 INTERFACE DÉMO

#### Fonctionnalités (Lecture seule)
- **Consultation tirages** → Pas d'achat
- **Aperçu chat** → Lecture uniquement
- **Statistiques publiques** → Données anonymisées
- **Découverte interface** → Mode guidé

---

## 🧪 SCÉNARIOS DE TEST QA

### Test 1: Authentification Complète (15 min)
1. **Tester chaque compte** → 14 comptes différents
2. **Vérifier permissions** → Admin vs Client
3. **Test compte bloqué** → Message d'erreur approprié
4. **Test multilingue** → Hébreu RTL + Anglais LTR

### Test 2: Workflow Admin (20 min)
1. **Connexion admin** → admin.he@brachavehatzlacha.com
2. **Créer utilisateur** → Nouveau client test
3. **Dépôt admin** → Ajouter 1,000₪ au client
4. **Créer tirage** → Jackpot 25,000₪
5. **Exécuter tirage** → Générer gagnants
6. **Vérifier statistiques** → Rapports cohérents

### Test 3: Workflow Client Standard (15 min)
1. **Connexion client** → standard.en@brachavehatzlacha.com
2. **Consulter solde** → 1,200₪ disponible
3. **Acheter ticket** → Choisir 6 numéros
4. **Envoyer message chat** → Test temps réel
5. **Consulter historique** → Transactions visibles
6. **Vérifier parrainage** → Code personnel

### Test 4: Workflow VIP (10 min)
1. **Connexion VIP** → vip.en@brachavehatzlacha.com
2. **Vérifier avantages** → Solde élevé, bonus
3. **Test achats multiples** → Plusieurs tickets
4. **Consultation rang** → Niveau supérieur
5. **Historique gains** → 1,800₪ total

### Test 5: Multilingue et RTL (10 min)
1. **Interface hébreu** → Navigation droite-gauche
2. **Interface anglais** → Navigation gauche-droite
3. **Changement langue** → Dynamique
4. **Formatage nombres** → Devise locale
5. **Direction texte** → RTL/LTR approprié

### Test 6: Chat Temps Réel (10 min)
1. **Deux comptes simultanés** → Messages croisés
2. **Messages admin** → Distinction visuelle
3. **Historique chat** → Persistance messages
4. **Modération** → Outils admin

### Test 7: Système Parrainage (10 min)
1. **Code référent unique** → Chaque utilisateur
2. **Nouveau client avec parrain** → Bonus automatique
3. **Compteur filleuls** → Mise à jour temps réel
4. **Bonus parrainage** → Calcul correct

### Test 8: Système de Rangs (10 min)
1. **Calcul automatique** → Basé sur participations
2. **Avantages par rang** → Bronze → Diamond
3. **Progression visuelle** → Interface adaptée
4. **Historique rangs** → Conservation données

---

## 🔧 ENDPOINTS API CRITIQUES

### Authentification
- `POST /api/auth/login` → Connexion universelle
- `POST /api/auth/logout` → Déconnexion
- `GET /api/auth/user` → Statut utilisateur

### Tirages
- `GET /api/draws/current` → Tirage actuel
- `GET /api/draws/completed` → Historique
- `POST /api/draws` → Création (admin)
- `POST /api/draws/:id/execute` → Exécution (admin)

### Tickets
- `POST /api/tickets` → Achat ticket
- `GET /api/tickets/user/:userId` → Tickets utilisateur

### Chat
- `GET /api/chat/messages` → Messages
- `POST /api/chat/messages` → Nouveau message
- `WebSocket /ws` → Temps réel

### Administration
- `GET /api/users` → Liste utilisateurs (admin)
- `POST /api/users` → Créer utilisateur (admin)
- `PUT /api/users/:id/balance` → Dépôt admin

---

## ✅ CRITÈRES DE VALIDATION

### Performance
- **Temps chargement** < 3 secondes
- **Latence API** < 500ms
- **Chat temps réel** < 1 seconde

### Fonctionnel
- **Authentification** → 100% des comptes
- **Multilingue** → Hébreu RTL + Anglais LTR
- **Tirages** → Création, exécution, résultats
- **Transactions** → Cohérence soldes
- **Chat** → Synchronisation temps réel

### Sécurité
- **Sessions** → Persistance appropriée
- **Permissions** → Admin vs Client
- **Validation** → Données d'entrée
- **Blocage** → Comptes désactivés

### Interface
- **Responsive** → Mobile et desktop
- **RTL** → Interface hébreu complète
- **Navigation** → Intuitive par rôle
- **Erreurs** → Messages explicites

---

## 🐛 POINTS D'ATTENTION QA

### Critique
- **Soldes négatifs** → Impossibles
- **Tirages simultanés** → Un seul actif
- **Numéros tickets** → Validation 1-37
- **Permissions admin** → Sécurité renforcée

### Important
- **Cache Redis** → Fallback si indisponible
- **WebSocket** → Reconnexion automatique
- **Traductions** → Cohérence multilingue
- **Formatage dates** → Locale appropriée

### Monitoring
- **Logs** → Disponibles dans /logs/
- **Erreurs** → Tracées automatiquement
- **Performance** → Métriques temps réel

---

## 📞 CONTACT TECHNIQUE

**Endpoints de santé:**
- `GET /health` → Statut application
- `GET /api/system/status` → Métriques système

**Base de données:** PostgreSQL avec 18 utilisateurs test
**Cache:** Redis (optionnel, fallback actif)
**Logs:** Fichiers /logs/ avec rotation automatique

Ce guide fournit tous les éléments nécessaires pour une validation QA complète de la plateforme Bracha veHatzlacha avant passage en production.