# ACCÈS PRODUCTION - COMPTES DE TEST FONCTIONNELS

## 🔐 COMPTES PAR RÔLE - TESTÉS ET FONCTIONNELS

### 👑 ADMINISTRATEUR PRINCIPAL
**Email:** admin@brachavehatzlacha.com  
**Mot de passe:** BrachaVeHatzlacha2024!  
**Nom:** Admin Bracha veHatzlacha  
**Solde:** 50,000₪  
**Langue:** Hébreu  
**URL Connexion:** POST /api/auth/admin-login  

**Accès Admin:**
- Dashboard administrateur complet
- Gestion utilisateurs (création, blocage, déblocage)
- Gestion soldes (dépôts administrateur)
- Création et exécution tirages
- Statistiques détaillées
- Gestion chat (messages admin)
- Système SMS/notifications
- Logs et monitoring

**Menu Admin:**
- 👥 Gestion Utilisateurs
- 🎲 Gestion Tirages  
- 💰 Transactions
- 📊 Statistiques
- 💬 Chat Admin
- ⚙️ Paramètres

---

### 👑 ADMINISTRATEUR ANGLAIS
**Email:** admin@lotopro.com  
**Mot de passe:** admin123  
**Nom:** Admin User  
**Solde:** 2,450₪  
**Langue:** Anglais  

**Accès identique admin principal en anglais**

---

### 🎯 CLIENT DÉMO (Accès limité)
**Email:** demo@brachavehatzlacha.com  
**Mot de passe:** demo123  
**Nom:** Demo User  
**Solde:** 1,000₪  
**Langue:** Hébreu  

**Restrictions Démo:**
- Pas d'achat tickets réels
- Consultation uniquement
- Chat en lecture seule
- Historique limité

**Menu Démo:**
- 🎲 Tirage Actuel (consultation)
- 🎫 Mes Tickets (historique)
- 💰 Solde (consultation)
- 📊 Statistiques
- 💬 Chat (lecture)

---

### 👤 CLIENT STANDARD HÉBREU
**Email:** client8hxb9u@brachavehatzlacha.com  
**Mot de passe:** client123  
**Nom:** משתמש 8HXB9U  
**Solde:** 1,000₪  
**Langue:** Hébreu  

**Accès Client Complet:**
- Achat tickets tirages
- Chat temps réel
- Historique transactions
- Système parrainage
- Rangs utilisateurs
- Notifications SMS

**Menu Client:**
- 🎲 Tirage Actuel
- 🎫 Acheter Tickets
- 💰 Mon Solde
- 📈 Mon Historique  
- 👥 Parrainage
- 🏆 Mon Rang
- 💬 Chat Communauté

---

### 👤 CLIENT STANDARD ANGLAIS
**Email:** test@complete.com  
**Mot de passe:** test123  
**Nom:** Test Complete  
**Solde:** 5,000₪  
**Langue:** Anglais  

**Accès Client Complet en anglais**

---

### 👤 CLIENT TEST TRANSACTIONS
**Email:** testuser@test.com  
**Mot de passe:** test123  
**Nom:** testuser User  
**Solde:** 2,450₪  
**Langue:** Anglais  

**Client avec historique transactions riche pour tests**

## 🔄 FLUX DE TEST PAR RÔLE

### Test Admin:
1. Connexion admin → Dashboard admin
2. Créer utilisateur → Formulaire création
3. Gérer soldes → Dépôt administrateur  
4. Créer tirage → Nouveau tirage
5. Exécuter tirage → Génération gagnants
6. Consulter stats → Rapports détaillés

### Test Client:
1. Connexion client → Interface utilisateur
2. Consulter tirage → Tirage actuel
3. Acheter ticket → Sélection numéros
4. Consulter historique → Mes tickets
5. Chat communauté → Messages temps réel
6. Parrainage → Code référent

### Test Démo:
1. Connexion démo → Interface limitée
2. Consultation → Lecture seule
3. Restrictions → Blocages appropriés

## 📱 INTERFACES PAR RÔLE

### Interface Admin:
- **URL:** `/admin`
- **Authentification:** Obligatoire
- **Langue:** Auto-détection
- **Theme:** Mode sombre/clair

### Interface Client:
- **URL:** `/`
- **Authentification:** Optionnelle (mode démo)
- **Langue:** Sélection utilisateur
- **RTL:** Automatique pour hébreu

### Interface Démo:
- **URL:** `/demo`
- **Authentification:** Simplifiée
- **Restrictions:** Lecture seule
- **Fonctionnalités:** Limitées

## 🎮 TESTS RECOMMANDÉS

### Test Workflow Complet:
1. **Admin:** Créer tirage → Définir jackpot
2. **Client:** Acheter tickets → Sélectionner numéros
3. **Admin:** Exécuter tirage → Générer gagnants
4. **Client:** Consulter résultats → Voir gains
5. **Démo:** Observer restrictions → Lecture seule

### Test Multilingue:
1. **Hébreu:** Interface RTL complète
2. **Anglais:** Interface LTR standard
3. **Changement:** Langue dynamique
4. **Formatage:** Dates/nombres localisés

### Test Temps Réel:
1. **Chat:** Messages instantanés
2. **Tirages:** Mises à jour automatiques
3. **Notifications:** WebSocket actif
4. **Synchronisation:** Multi-utilisateurs

## ✅ VALIDATION ACCÈS

Tous les comptes sont **testés et fonctionnels** avec:
- Authentification validée
- Permissions appropriées
- Données cohérentes
- Interfaces responsives
- Fonctionnalités complètes

**Prêt pour utilisation en mode réel.**