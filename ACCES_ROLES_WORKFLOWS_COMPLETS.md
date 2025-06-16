# ACCÈS, RÔLES ET WORKFLOWS COMPLETS - BRACHAVEHATZLACHA

## 📋 ARCHITECTURE DES RÔLES

### 1. RÔLES DÉFINIS DANS LE SYSTÈME

#### ADMIN (Administrateur)
- **Identifiant**: `admin`
- **Niveau d'accès**: Maximum
- **Base de données**: `users.is_admin = true`

#### VIP_CLIENT (Client VIP)
- **Identifiant**: `vip_client`
- **Niveau d'accès**: Élevé
- **Base de données**: User avec statut spécial

#### STANDARD_CLIENT (Client Standard)
- **Identifiant**: `standard_client`
- **Niveau d'accès**: Normal
- **Base de données**: User standard

#### NEW_CLIENT (Nouveau Client)
- **Identifiant**: `new_client`
- **Niveau d'accès**: Limité
- **Base de données**: User récemment créé

---

## 🔐 SYSTÈME D'AUTHENTIFICATION

### Middleware de Sécurité (server/routes.ts)

```typescript
enum UserRole {
  ADMIN = 'admin',
  VIP_CLIENT = 'vip_client', 
  STANDARD_CLIENT = 'standard_client',
  NEW_CLIENT = 'new_client'
}

enum Permission {
  READ = 'read',
  WRITE = 'write', 
  DELETE = 'delete',
  ADMIN = 'admin'
}

// Middleware d'authentification
const isAuthenticated = (req: any, res: Response, next: any) => {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware admin
const isAdmin = async (req: any, res: Response, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

// Middleware VIP
const isVIP = async (req: any, res: Response, next: any) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  const userRole = getUserRole(user);
  if (userRole === UserRole.VIP_CLIENT || user?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "VIP access required" });
  }
};

// Vérification de rôle
const hasRole = (requiredRole: UserRole) => {
  return (req: any, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user;
    const userRole = getUserRole(user);
    if (userRole === requiredRole || user?.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: `Role ${requiredRole} required` });
    }
  };
};
```

---

## 🏗️ ORGANISATION DES ROUTES (server/route-organizer.ts)

### Routes Publiques
```typescript
export const publicRoutes: RouteGroup = {
  prefix: '/api',
  middleware: [],
  routes: [
    { method: 'GET', path: '/draws/current', handler: 'getCurrentDraw', description: 'Tirage actuel', permissions: [] },
    { method: 'POST', path: '/login', handler: 'login', description: 'Connexion utilisateur', permissions: [] },
    { method: 'POST', path: '/register', handler: 'register', description: 'Inscription utilisateur', permissions: [] }
  ]
};
```

### Routes Client
```typescript
export const clientRoutes: RouteGroup = {
  prefix: '/api',
  middleware: ['isAuthenticated'],
  routes: [
    { method: 'GET', path: '/auth/user', handler: 'getUser', description: 'Profil utilisateur', permissions: ['read'] },
    { method: 'POST', path: '/tickets', handler: 'createTicket', description: 'Achat ticket', permissions: ['write'] },
    { method: 'GET', path: '/tickets/user', handler: 'getUserTickets', description: 'Mes tickets', permissions: ['read'] },
    { method: 'GET', path: '/transactions/user', handler: 'getUserTransactions', description: 'Mes transactions', permissions: ['read'] },
    { method: 'POST', path: '/chat/messages', handler: 'createChatMessage', description: 'Envoyer message', permissions: ['write'] },
    { method: 'GET', path: '/chat/messages', handler: 'getChatMessages', description: 'Historique chat', permissions: ['read'] }
  ]
};
```

### Routes VIP
```typescript
export const vipRoutes: RouteGroup = {
  prefix: '/api/vip',
  middleware: ['isAuthenticated', 'isVIP'],
  routes: [
    { method: 'GET', path: '/stats/advanced', handler: 'getAdvancedStats', description: 'Statistiques avancées', permissions: ['read'] },
    { method: 'POST', path: '/tickets/priority', handler: 'createPriorityTicket', description: 'Ticket prioritaire', permissions: ['write'] },
    { method: 'GET', path: '/draws/preview', handler: 'getDrawPreview', description: 'Aperçu tirages', permissions: ['read'] }
  ]
};
```

### Routes Admin
```typescript
export const adminRoutes: RouteGroup = {
  prefix: '/api/admin',
  middleware: ['isAuthenticated', 'isAdmin'],
  routes: [
    { method: 'POST', path: '/create-user', handler: 'createUser', description: 'Créer utilisateur', permissions: ['admin'] },
    { method: 'POST', path: '/create-simple-user', handler: 'createSimpleUser', description: 'Créer utilisateur simple', permissions: ['admin'] },
    { method: 'GET', path: '/users', handler: 'getAllUsers', description: 'Liste utilisateurs', permissions: ['admin'] },
    { method: 'POST', path: '/deposit', handler: 'createDeposit', description: 'Dépôt manuel', permissions: ['admin'] },
    { method: 'POST', path: '/draws', handler: 'createDraw', description: 'Créer tirage', permissions: ['admin'] },
    { method: 'PUT', path: '/draws/:id/results', handler: 'updateDrawResults', description: 'Saisir résultats', permissions: ['admin'] },
    { method: 'GET', path: '/stats/complete', handler: 'getCompleteStats', description: 'Statistiques complètes', permissions: ['admin'] },
    { method: 'PUT', path: '/users/:id/block', handler: 'blockUser', description: 'Bloquer utilisateur', permissions: ['admin'] },
    { method: 'PUT', path: '/users/:id/unblock', handler: 'unblockUser', description: 'Débloquer utilisateur', permissions: ['admin'] }
  ]
};
```

---

## 🎯 ACCÈS ET COMPTES GÉNÉRÉS

### Comptes Administrateur