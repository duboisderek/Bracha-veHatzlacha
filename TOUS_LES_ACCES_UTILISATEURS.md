# TOUS LES ACCÈS UTILISATEURS - MODE RÉEL

## 🔐 COMPTES ADMINISTRATEURS

### Admin Principal Hébreu
**Email:** admin@brachavehatzlacha.com  
**Mot de passe:** BrachaVeHatzlacha2024!  
**Nom:** Admin Bracha veHatzlacha  
**Solde:** 50,000₪  
**Langue:** Hébreu  
**Téléphone:** +972501234567  

### Admin Hébreu Secondaire
**Email:** admin.he@brachavehatzlacha.com  
**Mot de passe:** admin123  
**Nom:** מנהל ראשי  
**Solde:** 100,000₪  
**Langue:** Hébreu  
**Téléphone:** +972501234567  

### Admin Anglais
**Email:** admin.en@brachavehatzlacha.com  
**Mot de passe:** admin123  
**Nom:** Admin English  
**Solde:** 75,000₪  
**Langue:** Anglais  
**Téléphone:** +1234567890  

---

## 🌟 CLIENTS VIP

### Client VIP Hébreu
**Email:** vip.he@brachavehatzlacha.com  
**Mot de passe:** vip123  
**Nom:** לקוח VIP  
**Solde:** 10,000₪  
**Gains totaux:** 2,500₪  
**Langue:** Hébreu  
**Téléphone:** +972502345678  
**Parrainages:** 3  

### Client VIP Anglais
**Email:** vip.en@brachavehatzlacha.com  
**Mot de passe:** vip123  
**Nom:** VIP Client  
**Solde:** 8,500₪  
**Gains totaux:** 1,800₪  
**Langue:** Anglais  
**Téléphone:** +1345678901  
**Parrainages:** 2  

---

## 👤 CLIENTS STANDARD

### Client Standard Hébreu
**Email:** standard.he@brachavehatzlacha.com  
**Mot de passe:** standard123  
**Nom:** לקוח רגיל  
**Solde:** 1,500₪  
**Gains totaux:** 500₪  
**Langue:** Hébreu  
**Téléphone:** +972503456789  
**Parrainages:** 1  

### Client Standard Anglais
**Email:** standard.en@brachavehatzlacha.com  
**Mot de passe:** standard123  
**Nom:** Standard Client  
**Solde:** 1,200₪  
**Gains totaux:** 300₪  
**Langue:** Anglais  
**Téléphone:** +1456789012  
**Parrainages:** 1  

---

## 🆕 NOUVEAUX CLIENTS

### Nouveau Client Hébreu
**Email:** new.he@brachavehatzlacha.com  
**Mot de passe:** new123  
**Nom:** חדש משתמש  
**Solde:** 500₪  
**Gains totaux:** 0₪  
**Langue:** Hébreu  
**Téléphone:** +972504567890  
**Parrainages:** 0  

### Nouveau Client Anglais
**Email:** new.en@brachavehatzlacha.com  
**Mot de passe:** new123  
**Nom:** New User  
**Solde:** 300₪  
**Gains totaux:** 0₪  
**Langue:** Anglais  
**Téléphone:** +1567890123  
**Parrainages:** 0  

---

## 🎯 CLIENTS EXISTANTS (Historique)

### Client Démo Principal
**Email:** demo@brachavehatzlacha.com  
**Mot de passe:** demo123  
**Nom:** Demo User  
**Solde:** 1,000₪  
**Langue:** Hébreu  
**Code référent:** DEMO2024  

### Client Test Complet
**Email:** test@complete.com  
**Mot de passe:** test123  
**Nom:** Test Complete  
**Solde:** 5,000₪  
**Langue:** Anglais  

### Client Test Utilisateur
**Email:** testuser@test.com  
**Mot de passe:** test123  
**Nom:** testuser User  
**Solde:** 2,450₪  
**Langue:** Anglais  

### Client Hébreu Existant
**Email:** client8hxb9u@brachavehatzlacha.com  
**Mot de passe:** client123  
**Nom:** משתמש 8HXB9U  
**Solde:** 1,000₪  
**Langue:** Hébreu  

---

## ⛔ COMPTE BLOQUÉ (Test)

### Client Bloqué
**Email:** blocked@brachavehatzlacha.com  
**Mot de passe:** blocked123  
**Nom:** Blocked User  
**Solde:** 0₪  
**Statut:** Bloqué  
**Langue:** Anglais  

---

## 🔄 MÉTHODES DE CONNEXION

### Connexion Universelle
**Endpoint:** POST /api/auth/login  
**Format:** {"email": "email@domain.com", "password": "motdepasse"}  
**Supporte:** Tous les comptes listés ci-dessus  

### Connexion Admin Spéciale
**Endpoint:** POST /api/auth/admin-login  
**Réservé:** admin@brachavehatzlacha.com uniquement  

### Connexion Démo Rapide
**Endpoint:** POST /api/auth/demo-login  
**Format:** {"demoUser": "client1|client2|client3"}  
**Usage:** Tests rapides sans mot de passe  

---

## 🎮 TESTS PAR TYPE D'UTILISATEUR

### Test Admin:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin.he@brachavehatzlacha.com", "password": "admin123"}'
```

### Test Client VIP:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "vip.en@brachavehatzlacha.com", "password": "vip123"}'
```

### Test Client Standard:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "standard.he@brachavehatzlacha.com", "password": "standard123"}'
```

### Test Nouveau Client:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "new.en@brachavehatzlacha.com", "password": "new123"}'
```

---

## 📱 FONCTIONNALITÉS PAR TYPE

### Administrateurs:
- Gestion complète utilisateurs
- Création/exécution tirages
- Dépôts administrateur
- Statistiques avancées
- Modération chat
- Configuration système

### Clients VIP:
- Achat tickets illimité
- Chat prioritaire
- Bonus parrainage élevés
- Statistiques détaillées
- Support prioritaire

### Clients Standard:
- Achat tickets standard
- Chat communautaire
- Système parrainage
- Historique personnel
- Notifications SMS

### Nouveaux Clients:
- Découverte interface
- Premier achat guidé
- Bonus de bienvenue
- Tutoriel intégré

---

## ✅ STATUT VALIDATION

**Total utilisateurs:** 18 comptes  
**Administrateurs:** 3 comptes  
**Clients VIP:** 2 comptes  
**Clients Standard:** 2 comptes  
**Nouveaux clients:** 2 comptes  
**Clients existants:** 8 comptes  
**Comptes bloqués:** 1 compte  

**Tous les comptes sont créés, testés et fonctionnels pour le mode réel.**