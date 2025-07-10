# 🔐 Documentation Complète - Accès et Rôles BrachaVeHatzlacha

## 📋 Comptes de Test Créés

### 🔧 Root Administrator
```
Email: roottest@brahatz.com
Password: RootTest2025!
ID: user_1752149058748_31alk9fyf
Balance: 10,000₪
Language: Hebrew (he)
```

**Accès Complet**:
- ✅ Panel Root Admin
- ✅ Gestion tous utilisateurs
- ✅ Création/suppression admins
- ✅ Paramètres système globaux
- ✅ Logs et monitoring complet
- ✅ Portefeuilles crypto admin
- ✅ Sauvegarde/restauration
- ✅ Configuration email/SMS
- ✅ Analytics avancées

### 👑 Standard Administrator  
```
Email: admintest@brahatz.com
Password: AdminTest2025!
ID: user_1752149058867_ykbxg20bn
Balance: 5,000₪
Language: Hebrew (he)
```

**Accès Limité**:
- ✅ Dashboard admin standard
- ✅ Gestion utilisateurs clients
- ✅ Création tirages
- ✅ Validation paiements crypto
- ✅ Statistiques utilisateurs
- ✅ Support client chat
- ❌ Gestion autres admins
- ❌ Paramètres système

### 💎 VIP Client
```
Email: viptest@brahatz.com
Password: VipTest2025!
ID: user_1752149058995_bmrvnuy4i
Balance: 2,000₪
Language: Hebrew (he)
```

**Accès VIP**:
- ✅ Dashboard VIP enrichi
- ✅ Achat tickets illimité
- ✅ Historique détaillé
- ✅ Support prioritaire
- ✅ Statistiques personnelles
- ✅ Bonus et promotions VIP
- ❌ Accès admin

## 🔄 Workflows Détaillés par Rôle

### Root Administrator Workflow

#### 1. **Connexion Root**
```bash
POST /api/auth/login
{
  "email": "roottest@brahatz.com",
  "password": "RootTest2025!"
}
```

#### 2. **Dashboard Root**
- Accès: `GET /admin/root-dashboard`
- Fonctionnalités:
  - Vue d'ensemble système complet
  - Métriques en temps réel
  - Alertes sécurité
  - Status services

#### 3. **Gestion Utilisateurs Root**
```
Actions disponibles:
- Voir tous utilisateurs (y compris admins)
- Créer/modifier/supprimer utilisateurs
- Changer rôles (promouvoir/rétrograder)
- Bloquer/débloquer comptes
- Réinitialiser mots de passe
- Gérer balances utilisateurs
```

#### 4. **Gestion Système**
```
Configuration:
- Paramètres généraux application
- Configuration email/SMS
- Portefeuilles crypto admin
- Sauvegardes automatiques
- Logs système détaillés
- Monitoring performance
```

#### 5. **Analytics Root**
```
Données accessibles:
- Revenue total et trends
- Comportement utilisateurs
- Performance draws
- Conversion rates
- Métriques système complet
```

### Standard Administrator Workflow

#### 1. **Connexion Admin**
```bash
POST /api/auth/login
{
  "email": "admintest@brahatz.com",
  "password": "AdminTest2025!"
}
```

#### 2. **Dashboard Admin Standard**
- Accès: `GET /admin/dashboard`
- Fonctionnalités:
  - Vue utilisateurs et draws
  - Paiements en attente
  - Statistiques limitées
  - Support client

#### 3. **Gestion Utilisateurs Admin**
```
Actions limitées:
- Voir utilisateurs clients uniquement
- Modifier profils clients
- Gérer balances clients
- Support technique
- Validation transactions
```

#### 4. **Gestion Draws Admin**
```
Tirages:
- Créer nouveaux tirages
- Modifier jackpots
- Voir résultats historiques
- Générer rapports draws
- Notifications gagnants
```

#### 5. **Support Client**
```
Chat Support:
- Répondre aux messages clients
- Résoudre problèmes techniques
- Valider paiements crypto
- Assistance utilisation
```

### VIP Client Workflow

#### 1. **Connexion VIP**
```bash
POST /api/auth/login
{
  "email": "viptest@brahatz.com",
  "password": "VipTest2025!"
}
```

#### 2. **Dashboard VIP**
- Accès: `GET /client/dashboard`
- Fonctionnalités VIP:
  - Interface enrichie
  - Statistiques personnelles
  - Bonus exclusifs
  - Support prioritaire

#### 3. **Achat Tickets VIP**
```
Privilèges:
- Achats illimités
- Accès draws premium
- Notifications prioritaires
- Historique détaillé
- Bonus fidélité
```

#### 4. **Support VIP**
```
Support prioritaire:
- Chat direct admin
- Réponses prioritaires
- Assistance personnalisée
- Conseils stratégiques
```

## 🎛️ Menus par Rôle

### Root Administrator Menus
```
Navigation principale:
├── 🏠 Dashboard Root
├── 👥 Gestion Utilisateurs
│   ├── Tous utilisateurs
│   ├── Admins
│   ├── Clients VIP
│   └── Clients Standard
├── 🎲 Gestion Tirages
│   ├── Tirages actifs
│   ├── Historique
│   ├── Paramètres
│   └── Analytics
├── 💰 Finances
│   ├── Transactions
│   ├── Portefeuilles
│   ├── Paiements
│   └── Rapports
├── ⚙️ Système
│   ├── Configuration
│   ├── Logs
│   ├── Monitoring
│   └── Sauvegardes
└── 📊 Analytics
    ├── Utilisateurs
    ├── Revenue
    ├── Performance
    └── Conversions
```

### Standard Administrator Menus
```
Navigation limitée:
├── 🏠 Dashboard Admin
├── 👥 Utilisateurs Clients
│   ├── Liste clients
│   ├── Profils
│   └── Support
├── 🎲 Tirages
│   ├── Création
│   ├── Gestion
│   └── Résultats
├── 💰 Paiements
│   ├── Validation
│   ├── Historique
│   └── Support
└── 📊 Statistiques
    ├── Utilisateurs
    ├── Tirages
    └── Activité
```

### VIP Client Menus
```
Interface VIP:
├── 🏠 Dashboard VIP
├── 🎲 Loterie
│   ├── Achat tickets
│   ├── Mes tickets
│   ├── Résultats
│   └── Historique
├── 💰 Mon Compte
│   ├── Balance
│   ├── Transactions
│   ├── Bonus VIP
│   └── Parrainage
├── 📱 Support VIP
│   ├── Chat prioritaire
│   ├── FAQ VIP
│   └── Contact
└── ⚙️ Paramètres
    ├── Profil
    ├── Notifications
    └── Langue
```

## 🔐 Règles Métier par Action

### Achat de Tickets
```
Règles générales:
- Minimum 100₪ par ticket
- 6 numéros obligatoires (1-37)
- Balance suffisante requise
- Draw actif nécessaire

Règles VIP:
- Pas de limite d'achat
- Bonus fidélité automatique
- Notifications prioritaires
- Historique illimité

Règles Admin:
- Peuvent acheter pour test
- Accès tous draws
- Pas de restrictions
```

### Gestion Balance
```
Root Admin:
- Modification libre toutes balances
- Ajout/retrait sans limite
- Historique complet
- Audit trail automatique

Standard Admin:
- Modification balances clients
- Limites de sécurité
- Justification requise
- Log des modifications

Clients:
- Consultation uniquement
- Dépôts par crypto
- Retraits limités
- Validation admin requise
```

### Support Client
```
Niveaux de support:
1. VIP: Réponse immédiate
2. Standard: <24h
3. New: <48h

Actions support:
- Chat en temps réel
- Résolution problèmes
- Assistance technique
- Formation utilisation
```

## 📱 Accès Mobile par Rôle

### Navigation Mobile Adaptée
```
Root/Admin Mobile:
├── Dashboard compact
├── Actions rapides
├── Notifications push
└── Accès urgence

Client Mobile:
├── Achat tickets tactile
├── Balance visible
├── Chat support
└── Notifications gains
```

### Touch Interactions
```
Optimisations:
- Boutons 44px minimum
- Swipe gestures
- Touch feedback
- Navigation thumb-friendly
- Accès rapide fonctions
```

## 🌍 Support Multilingue

### Langues Supportées
```
Hébreu (he): RTL complet
- Interface native RTL
- Clavier hébreu
- Formatage monétaire ₪
- Dates hébraïques

Français (fr): Standard
- Interface française
- Formatage européen
- Support AZERTY
- Monnaie Euro €

Anglais (en): International
- Interface anglaise
- Formatage US/UK
- Support QWERTY
- Monnaie Dollar $
```

### Changement Langue
```
Actions:
- Changement instantané
- Sauvegarde préférence
- Emails dans langue choisie
- SMS dans langue locale
```

## 🚀 Déploiement Production

### Pré-requis Validés ✅
- Base données PostgreSQL optimisée
- SMTP Hostinger configuré
- WhatsApp Support intégré
- SSL/HTTPS brahatz.com prêt
- Monitoring en place

### Post-Déploiement
```
Actions à effectuer:
1. Vérifier connexions comptes test
2. Tester fonctionnalités critiques
3. Valider emails/SMS production
4. Configurer monitoring alertes
5. Former équipe support
```

---

**Date**: 10 Juillet 2025 - 12h10 UTC  
**Status**: ✅ Documentation Complète  
**Validation**: ✅ Tous rôles testés et fonctionnels