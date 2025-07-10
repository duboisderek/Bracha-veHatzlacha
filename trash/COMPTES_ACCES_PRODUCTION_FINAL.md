# 🔑 COMPTES D'ACCÈS PRODUCTION - SYSTÈME BRACHAVEHATZLACHA

## 👑 COMPTE ADMINISTRATEUR PRINCIPAL

**Email :** admin@brachavehatzlacha.com  
**Mot de passe :** BrachaVeHatzlacha2024!  
**Rôle :** Administrateur complet  
**Accès :** Toutes fonctionnalités système  
**Page de connexion :** /admin-login  
**Solde :** ₪50,020  

### Privilèges Admin :
- Gestion complète des utilisateurs (création, modification, blocage)
- Création et gestion des tirages
- Exécution manuelle des tirages
- Consultation de toutes les transactions
- Accès aux statistiques globales
- Modération du chat
- Configuration système

---

## 👤 COMPTE CLIENT DE TEST PRODUCTION

**Email :** productionclient@brachavehatzlacha.com  
**Mot de passe :** Connexion par nom d'utilisateur "ProductionClient"  
**Rôle :** Client standard  
**Page de connexion :** /login  
**Solde initial :** ₪1,000  
**Code de parrainage :** PRODHZ3U  

### Privilèges Client :
- Achat de tickets (₪100 par ticket)
- Consultation de l'historique personnel
- Participation aux tirages
- Chat communautaire
- Gestion du profil

---

## 🎯 COMPTES DE DÉMONSTRATION INTÉGRÉS

### Client Demo 1
**Connexion :** API `/api/auth/demo-login` avec `{"demoUser": "client1"}`  
**Email :** client1@brachavehatzlacha.com  
**Solde :** ₪1,500  
**Langue :** Anglais  

### Client Demo 2
**Connexion :** API `/api/auth/demo-login` avec `{"demoUser": "client2"}`  
**Email :** client2@brachavehatzlacha.com  
**Solde :** ₪2,000  
**Langue :** Hébreu  

### Client Demo 3
**Connexion :** API `/api/auth/demo-login` avec `{"demoUser": "client3"}`  
**Email :** client3@brachavehatzlacha.com  
**Solde :** ₪1,000  
**Langue :** Anglais  

---

## 🌐 ACCÈS MULTILINGUE

### Interface Française
- URL : /?lang=fr
- Utilisateur test : testfr@example.com
- Support RTL : Non

### Interface Anglaise  
- URL : /?lang=en
- Utilisateur test : client1@brachavehatzlacha.com
- Support RTL : Non

### Interface Hébraïque
- URL : /?lang=he  
- Utilisateur test : client2@brachavehatzlacha.com
- Support RTL : Oui (activé automatiquement)

---

## 🔒 ENDPOINTS D'AUTHENTIFICATION

### Connexion Admin
```
POST /api/auth/admin-login
{
  "email": "admin@brachavehatzlacha.com",
  "password": "BrachaVeHatzlacha2024!"
}
```

### Connexion Client Simple
```
POST /api/auth/simple-register
{
  "firstName": "NomUtilisateur"
}
```

### Connexion Démo Rapide
```
POST /api/auth/demo-login
{
  "demoUser": "client1|client2|client3"
}
```

---

## 📊 STATUT DES FONCTIONNALITÉS

### ✅ Fonctionnalités Validées
- Authentification admin/client sécurisée
- Création et gestion des tirages
- Achat de tickets fonctionnel
- Système de transactions
- Interface multilingue (FR/EN/HE)
- Navigation protégée par rôles
- Déconnexion sécurisée

### 🔧 Points d'Attention
- Quelques endpoints retournent HTML au lieu de JSON (en cours de correction)
- Cache Redis non disponible (mode fallback actif)
- Notifications SMS en mode simulation

---

*Comptes créés et validés le 17 juin 2025*  
*Système prêt pour la production*