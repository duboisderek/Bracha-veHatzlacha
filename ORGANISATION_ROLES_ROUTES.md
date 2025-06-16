# ORGANISATION DES RÔLES ET ROUTES

## 🔐 STRUCTURE DES RÔLES

### 1. ADMINISTRATEUR PRINCIPAL
**Compte :** `admin@brachavehatzlacha.com`
**Privilèges :** Accès complet à toutes les fonctionnalités
**Routes autorisées :** Toutes les routes `/api/admin/*`

### 2. ADMINISTRATEURS SECONDAIRES
**Comptes :** 
- `admin.he@brachavehatzlacha.com` (Interface hébreu)
- `admin.en@brachavehatzlacha.com` (Interface anglais)
**Privilèges :** Gestion utilisateurs et tirages
**Routes autorisées :** Routes admin limitées

### 3. CLIENTS VIP
**Comptes :**
- `vip.he@brachavehatzlacha.com` 
- `vip.en@brachavehatzlacha.com`
**Privilèges :** Accès prioritaire, bonus spéciaux
**Routes autorisées :** Routes client + fonctionnalités VIP

### 4. CLIENTS STANDARD
**Comptes :**
- `standard.he@brachavehatzlacha.com`
- `standard.en@brachavehatzlacha.com`
**Privilèges :** Accès standard aux jeux
**Routes autorisées :** Routes client de base

### 5. NOUVEAUX UTILISATEURS
**Comptes :** Créés via inscription
**Privilèges :** Accès de base + bonus de bienvenue
**Routes autorisées :** Routes client essentielles

## 📍 MAPPING DES ROUTES PAR RÔLE

### ROUTES PUBLIQUES (Non authentifiées)
```
GET  /                    → Page d'accueil
GET  /client-auth        → Inscription/Connexion client
GET  /admin              → Connexion admin
POST /api/auth/login     → Authentification universelle
POST /api/auth/register  → Inscription nouveaux clients
GET  /api/draws/current  → Tirage actuel (lecture seule)
```

### ROUTES CLIENTS AUTHENTIFIÉS
```
GET  /                   → Interface client (Home)
GET  /personal          → Espace personnel
GET  /chat              → Support chat
POST /api/logout        → Déconnexion
GET  /api/auth/user     → Profil utilisateur
POST /api/tickets       → Achat de tickets
GET  /api/tickets/user  → Tickets utilisateur
GET  /api/transactions/user → Historique transactions
POST /api/chat/messages → Messages chat
GET  /api/chat/messages → Lecture chat
```

### ROUTES ADMIN UNIQUEMENT
```
GET  /admin/*           → Interface administration
GET  /api/admin/users   → Gestion utilisateurs
POST /api/admin/deposit → Dépôts utilisateurs
POST /api/admin/block   → Bloquer utilisateurs
POST /api/admin/unblock → Débloquer utilisateurs
GET  /api/draws         → Gestion tirages
POST /api/draws         → Créer tirages
PUT  /api/draws/:id     → Modifier tirages
GET  /api/admin/stats   → Statistiques globales
POST /api/admin/notify  → Notifications SMS
```

### ROUTES MIXTES (Selon privilèges)
```
GET  /api/draws/completed → Historique tirages
GET  /api/draws/:id/stats → Statistiques tirage
GET  /api/draws/:id/winners → Gagnants tirage
```

## 🛡️ MIDDLEWARE DE SÉCURITÉ

### isAuthenticated
**Usage :** Toutes les routes protégées
**Fonction :** Vérifie la session utilisateur active
**Redirection :** 401 si non authentifié

### isAdmin
**Usage :** Routes `/api/admin/*`
**Fonction :** Vérifie privilèges administrateur
**Critères :**
- `user.isAdmin === true`
- `user.id === 'admin_bracha_vehatzlacha'`
**Redirection :** 403 si non autorisé

### isVIP (À implémenter)
**Usage :** Fonctionnalités VIP
**Fonction :** Vérifie statut VIP utilisateur
**Critères :** `user.isVIP === true`

## 🔄 FLUX D'AUTHENTIFICATION

### Connexion Client Standard
```
1. POST /api/auth/login
2. Vérification credentials globalCredentials
3. Récupération profil storage.getUser()
4. Création session req.session.user
5. Redirection vers interface client
```

### Connexion Admin
```
1. POST /api/auth/login 
2. Vérification credentials admin
3. Vérification privilèges isAdmin
4. Création session admin
5. Redirection vers /admin
```

### Inscription Nouveau Client
```
1. POST /api/auth/register
2. Validation données (email, password)
3. Génération ID unique + code parrainage
4. Création utilisateur storage.upsertUser()
5. Ajout credentials globalCredentials
6. Bonus bienvenue (100₪)
7. Session automatique
```

## 📊 MATRICE DES PERMISSIONS

| Fonctionnalité | Public | Client | VIP | Admin |
|----------------|--------|--------|-----|-------|
| Voir tirages | ✓ | ✓ | ✓ | ✓ |
| Acheter tickets | ❌ | ✓ | ✓ | ✓ |
| Chat support | ❌ | ✓ | ✓ | ✓ |
| Historique personnel | ❌ | ✓ | ✓ | ✓ |
| Bonus VIP | ❌ | ❌ | ✓ | ✓ |
| Gérer utilisateurs | ❌ | ❌ | ❌ | ✓ |
| Créer tirages | ❌ | ❌ | ❌ | ✓ |
| Statistiques globales | ❌ | ❌ | ❌ | ✓ |
| Notifications SMS | ❌ | ❌ | ❌ | ✓ |

## 🚀 AMÉLIORATIONS RECOMMANDÉES

### Sécurité Renforcée
```typescript
// Middleware de limitation de tentatives
const rateLimiter = (maxAttempts: number, windowMs: number) => {
  // Limite les tentatives de connexion
}

// Validation stricte des rôles
const hasPermission = (requiredRole: string) => {
  // Vérification granulaire des permissions
}

// Audit des actions
const auditLogger = (action: string, userId: string) => {
  // Journalisation des actions sensibles
}
```

### Gestion des Sessions
```typescript
// Expiration automatique
const sessionTimeout = 30 * 60 * 1000; // 30 minutes

// Renouvellement sécurisé
const refreshSession = (userId: string) => {
  // Renouvellement token sans re-authentification
}
```

### Roles Dynamiques
```typescript
// Système de permissions granulaires
interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete';
  condition?: string;
}

// Attribution flexible des rôles
const assignRole = (userId: string, role: Role) => {
  // Attribution basée sur critères métier
}
```

## 📈 MÉTRIQUES DE SÉCURITÉ

### Indicateurs de Surveillance
- Tentatives de connexion échouées
- Sessions simultanées par utilisateur
- Accès non autorisés aux routes admin
- Utilisation des fonctionnalités par rôle
- Temps de session moyen par type d'utilisateur

### Alertes Automatiques
- Connexions suspectes (géolocalisation, horaires)
- Tentatives de force brute
- Accès privilégiés inhabituels
- Modifications massives de données

## ✅ IMPLÉMENTATION ACTUELLE

**Status :** Système fonctionnel avec structure de base
**Authentification :** ✓ Opérationnelle
**Autorisation :** ✓ Admin/Client différenciés
**Sessions :** ✓ Gestion sécurisée
**Routes protégées :** ✓ Middleware implémenté

**Prochaines étapes :**
1. Affiner les permissions VIP
2. Implémenter audit logging
3. Ajouter limitation tentatives
4. Système de notifications sécurisé