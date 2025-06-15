# URLS D'ACCÈS PRODUCTION - BRACHA VEHATZLACHA

## 🌐 URL PRINCIPALE DE PRODUCTION

**Domaine principal:** https://[your-replit-deployment].replit.app

*Note: L'URL exacte sera générée automatiquement lors du déploiement Replit*

---

## 📱 URLS D'ACCÈS PAR INTERFACE

### Interface Client (Publique)
**URL:** https://[your-replit-deployment].replit.app/
**Description:** Interface principale pour tous les clients
**Langues:** Hébreu (RTL) + Anglais (LTR)
**Accès:** Public avec authentification optionnelle

### Interface Admin (Sécurisée)
**URL:** https://[your-replit-deployment].replit.app/admin
**Description:** Dashboard administrateur complet
**Accès:** Authentification admin obligatoire
**Permissions:** Gestion utilisateurs, tirages, statistiques

### Interface Démo (Test)
**URL:** https://[your-replit-deployment].replit.app/demo
**Description:** Mode démo avec restrictions
**Accès:** Connexion simplifiée demo
**Fonctionnalités:** Lecture seule, aperçu plateforme

---

## 🔗 ENDPOINTS API PRINCIPAUX

### Authentification
```
POST https://[your-replit-deployment].replit.app/api/auth/login
POST https://[your-replit-deployment].replit.app/api/auth/admin-login
POST https://[your-replit-deployment].replit.app/api/auth/demo-login
GET  https://[your-replit-deployment].replit.app/api/auth/user
POST https://[your-replit-deployment].replit.app/api/auth/logout
```

### Tirages
```
GET  https://[your-replit-deployment].replit.app/api/draws/current
GET  https://[your-replit-deployment].replit.app/api/draws/completed
POST https://[your-replit-deployment].replit.app/api/draws (admin)
POST https://[your-replit-deployment].replit.app/api/draws/:id/execute (admin)
```

### Tickets
```
POST https://[your-replit-deployment].replit.app/api/tickets
GET  https://[your-replit-deployment].replit.app/api/tickets/user/:userId
GET  https://[your-replit-deployment].replit.app/api/draws/:id/tickets
```

### Gestion Utilisateurs (Admin)
```
GET  https://[your-replit-deployment].replit.app/api/users
POST https://[your-replit-deployment].replit.app/api/users
PUT  https://[your-replit-deployment].replit.app/api/users/:id/balance
PUT  https://[your-replit-deployment].replit.app/api/users/:id/block
```

### Chat Temps Réel
```
GET  https://[your-replit-deployment].replit.app/api/chat/messages
POST https://[your-replit-deployment].replit.app/api/chat/messages
WS   wss://[your-replit-deployment].replit.app/ws
```

### Statistiques
```
GET  https://[your-replit-deployment].replit.app/api/draws/:id/stats
GET  https://[your-replit-deployment].replit.app/api/draws/:id/winners
```

---

## 🔐 ACCÈS RAPIDES PAR RÔLE

### Administrateurs
**URL directe:** https://[your-replit-deployment].replit.app/admin
**Comptes:**
- admin@brachavehatzlacha.com / BrachaVeHatzlacha2024!
- admin.he@brachavehatzlacha.com / admin123
- admin.en@brachavehatzlacha.com / admin123

### Clients VIP
**URL:** https://[your-replit-deployment].replit.app/
**Comptes:**
- vip.he@brachavehatzlacha.com / vip123
- vip.en@brachavehatzlacha.com / vip123

### Clients Standard
**URL:** https://[your-replit-deployment].replit.app/
**Comptes:**
- standard.he@brachavehatzlacha.com / standard123
- standard.en@brachavehatzlacha.com / standard123

### Nouveaux Clients
**URL:** https://[your-replit-deployment].replit.app/
**Comptes:**
- new.he@brachavehatzlacha.com / new123
- new.en@brachavehatzlacha.com / new123

### Mode Démo
**URL:** https://[your-replit-deployment].replit.app/demo
**Accès simplifié:** Boutons demo client1/client2/client3

---

## 📊 URLS MONITORING ET SANTÉ

### Statut Application
```
GET https://[your-replit-deployment].replit.app/health
GET https://[your-replit-deployment].replit.app/api/system/status
```

### Métriques Performance
```
GET https://[your-replit-deployment].replit.app/api/system/metrics
```

---

## 🌍 URLS MULTILINGUES

### Interface Hébreu (RTL)
**URL:** https://[your-replit-deployment].replit.app/?lang=he
**Direction:** Droite vers gauche
**Utilisateurs:** Comptes .he@brachavehatzlacha.com

### Interface Anglais (LTR)
**URL:** https://[your-replit-deployment].replit.app/?lang=en
**Direction:** Gauche vers droite  
**Utilisateurs:** Comptes .en@brachavehatzlacha.com

---

## 📱 URLS MOBILES OPTIMISÉES

Toutes les URLs sont automatiquement responsive et optimisées pour :
- **Mobile:** Interface tactile adaptée
- **Tablet:** Mise en page intermédiaire
- **Desktop:** Interface complète

---

## 🔧 CONFIGURATION PRODUCTION

### Variables d'Environnement Actives
- DATABASE_URL: PostgreSQL configuré
- SESSION_SECRET: Sessions sécurisées
- NODE_ENV: production
- Cache Redis: Fallback mode actif

### Fonctionnalités Actives
- Service Worker PWA
- Cache intelligent
- Monitoring structuré
- Optimisations performance
- SSL/TLS automatique (Replit)

---

## 🚀 INSTRUCTIONS DÉPLOIEMENT

1. **Cliquer sur "Deploy"** dans l'interface Replit
2. **Attendre build automatique** (2-3 minutes)
3. **Récupérer URL finale** générée par Replit
4. **Remplacer [your-replit-deployment]** par l'URL réelle
5. **Tester tous les accès** avec les comptes fournis

### URL Finale Format
```
https://[nom-projet]-[hash-unique].replit.app
```

### Premier Test Post-Déploiement
```bash
curl https://[url-finale]/api/draws/current
curl -X POST https://[url-finale]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@brachavehatzlacha.com", "password": "demo123"}'
```

---

## ✅ VALIDATION DÉPLOIEMENT

### Checklist Post-Mise en Ligne
- [ ] URL principale accessible
- [ ] Interface admin fonctionnelle
- [ ] Authentification tous comptes
- [ ] Chat temps réel opérationnel
- [ ] Tirages et tickets fonctionnels
- [ ] Multilingue hébreu/anglais
- [ ] Performance optimale
- [ ] SSL/HTTPS actif

La plateforme sera accessible mondialement une fois le déploiement Replit terminé.