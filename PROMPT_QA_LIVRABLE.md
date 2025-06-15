# PROMPT QA - PLATEFORME BRACHA VEHATZLACHA

Vous êtes chargé de tester une plateforme de loterie privée multilingue avant sa mise en production. Cette application web complète offre des tirages automatisés, un système de chat temps réel, et un programme de parrainage avec système de rangs.

## OBJECTIF DU TEST

Valider le bon fonctionnement de tous les rôles utilisateurs, interfaces multilingues (hébreu RTL/anglais LTR), et workflows critiques avant déploiement en mode réel.

## ENVIRONNEMENT DE TEST

- **URL:** http://localhost:5000
- **Architecture:** React + Express + PostgreSQL
- **Base de données:** 18 utilisateurs de test pré-configurés
- **Langues:** Hébreu (RTL) et Anglais (LTR)

## COMPTES DE TEST FOURNIS

### ADMINISTRATEURS (3 comptes)
```
Email: admin@brachavehatzlacha.com
Password: BrachaVeHatzlacha2024!
Rôle: Admin principal (50,000₪)

Email: admin.he@brachavehatzlacha.com  
Password: admin123
Rôle: Admin hébreu (100,000₪)

Email: admin.en@brachavehatzlacha.com
Password: admin123  
Rôle: Admin anglais (75,000₪)
```

### CLIENTS VIP (2 comptes)
```
Email: vip.he@brachavehatzlacha.com
Password: vip123
Profil: Client VIP hébreu (10,000₪, 2,500₪ gains, 3 parrainages)

Email: vip.en@brachavehatzlacha.com
Password: vip123
Profil: Client VIP anglais (8,500₪, 1,800₪ gains, 2 parrainages)
```

### CLIENTS STANDARD (2 comptes)
```
Email: standard.he@brachavehatzlacha.com
Password: standard123
Profil: Client standard hébreu (1,500₪, 500₪ gains)

Email: standard.en@brachavehatzlacha.com  
Password: standard123
Profil: Client standard anglais (1,200₪, 300₪ gains)
```

### NOUVEAUX CLIENTS (2 comptes)
```
Email: new.he@brachavehatzlacha.com
Password: new123
Profil: Nouveau utilisateur hébreu (500₪)

Email: new.en@brachavehatzlacha.com
Password: new123
Profil: Nouveau utilisateur anglais (300₪)
```

### COMPTES LEGACY (4 comptes)
```
Email: demo@brachavehatzlacha.com
Password: demo123
Profil: Compte démo principal

Email: test@complete.com
Password: test123
Profil: Client test complet (5,000₪)

Email: testuser@test.com  
Password: test123
Profil: Utilisateur test (2,450₪)

Email: client8hxb9u@brachavehatzlacha.com
Password: client123
Profil: Client hébreu existant (1,000₪)
```

### COMPTE RESTRICTION (1 compte)
```
Email: blocked@brachavehatzlacha.com
Password: blocked123
Profil: Utilisateur bloqué (doit retourner erreur)
```

## MÉTHODE DE CONNEXION

**Endpoint universel:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "email_du_compte",
  "password": "mot_de_passe"
}
```

## WORKFLOWS À TESTER

### WORKFLOW ADMIN (Durée: 20 minutes)

**Objectif:** Valider gestion complète plateforme

**Étapes:**
1. Connexion avec admin.he@brachavehatzlacha.com
2. Accéder au menu "Gestion Utilisateurs"
3. Créer un nouveau client de test
4. Effectuer un dépôt administrateur de 1,000₪
5. Aller au menu "Gestion Tirages"  
6. Créer un nouveau tirage avec jackpot 25,000₪
7. Exécuter le tirage manuellement
8. Consulter les statistiques et résultats
9. Vérifier le menu "Chat Administration"

**Résultats attendus:**
- Interface hébreu RTL complète
- Toutes les actions admin fonctionnelles
- Données cohérentes après modifications
- Permissions respectées

### WORKFLOW CLIENT STANDARD (Durée: 15 minutes)

**Objectif:** Valider expérience utilisateur complète

**Étapes:**
1. Connexion avec standard.en@brachavehatzlacha.com
2. Consulter le "Tirage Actuel" et jackpot
3. Acheter un ticket (sélectionner 6 numéros entre 1-37)
4. Vérifier mise à jour du solde
5. Consulter "Mes Tickets" et historique
6. Accéder au "Chat Communauté"
7. Envoyer un message public
8. Consulter "Mon Rang" et progression
9. Vérifier section "Parrainage" et code personnel

**Résultats attendus:**
- Interface anglais LTR fonctionnelle
- Achat ticket réussi avec déduction solde
- Chat temps réel opérationnel
- Système parrainage actif

### WORKFLOW CLIENT VIP (Durée: 10 minutes)

**Objectif:** Valider fonctionnalités premium

**Étapes:**
1. Connexion avec vip.en@brachavehatzlacha.com
2. Vérifier solde élevé et historique gains
3. Acheter plusieurs tickets simultanément
4. Consulter avantages VIP dans "Mon Rang"
5. Vérifier bonus parrainage élevés
6. Tester accès prioritaire au chat

**Résultats attendus:**
- Fonctionnalités premium actives
- Bonus et avantages VIP visibles
- Achats multiples autorisés

### WORKFLOW NOUVEAU CLIENT (Durée: 10 minutes)

**Objectif:** Valider expérience première utilisation

**Étapes:**
1. Connexion avec new.he@brachavehatzlacha.com
2. Explorer interface guidée
3. Consulter tutoriel intégré
4. Effectuer premier achat ticket
5. Découvrir fonctionnalités chat
6. Consulter système parrainage

**Résultats attendus:**
- Interface hébreu RTL pour nouveau utilisateur
- Expérience guidée fonctionnelle
- Premier achat réussi

### TEST MULTILINGUE (Durée: 10 minutes)

**Objectif:** Valider support complet hébreu/anglais

**Étapes:**
1. Connexion compte hébreu → Vérifier interface RTL
2. Navigation menu → Direction droite-gauche
3. Connexion compte anglais → Vérifier interface LTR  
4. Navigation menu → Direction gauche-droite
5. Changement langue dynamique → Test bascule
6. Formatage nombres et dates → Localisation appropriée

**Résultats attendus:**
- RTL parfait pour hébreu
- LTR standard pour anglais
- Traductions complètes
- Formatage localisé

### TEST RESTRICTIONS (Durée: 5 minutes)

**Objectif:** Valider sécurité et restrictions

**Étapes:**
1. Tentative connexion blocked@brachavehatzlacha.com
2. Vérifier message "Compte bloqué"
3. Test accès direct URLs admin sans permission
4. Vérification sessions et timeouts

**Résultats attendus:**
- Compte bloqué rejeté proprement
- Accès non autorisés bloqués
- Sessions sécurisées

## CRITÈRES DE VALIDATION

### CRITIQUE (Échec si non respecté)
- Authentification: 100% des comptes fonctionnels
- Soldes: Cohérence après transactions
- Permissions: Admin vs Client respectées
- Multilingue: RTL hébreu + LTR anglais parfaits

### IMPORTANT (À signaler si défaillant)
- Performance: Chargement < 3 secondes
- Chat: Messages temps réel < 1 seconde
- Navigation: Intuitive par rôle
- Responsive: Mobile et desktop

### MONITORING (À documenter)
- Erreurs console navigateur
- Latence API endpoints
- Cohérence données après actions
- Messages d'erreur utilisateur

## LIVRABLES ATTENDUS

### RAPPORT DE TEST
1. **Résumé exécutif**: Statut global (PASS/FAIL)
2. **Tests par workflow**: Détail chaque scénario
3. **Bugs identifiés**: Gravité et impact
4. **Performance observée**: Temps de réponse
5. **Recommandations**: Avant mise en production

### MATRICE DE VALIDATION
```
Workflow Admin:           [PASS/FAIL]
Workflow Client Standard: [PASS/FAIL]  
Workflow Client VIP:      [PASS/FAIL]
Workflow Nouveau Client:  [PASS/FAIL]
Test Multilingue:         [PASS/FAIL]
Test Restrictions:        [PASS/FAIL]

Score global: X/6 workflows validés
```

### BUGS CRITIQUES
- Bloc déploiement si trouvés
- Impact fonctionnel majeur
- Sécurité compromise

### BUGS MINEURS
- N'empêchent pas déploiement
- Améliorations UX
- Optimisations performance

## CONTEXTE TECHNIQUE

**Fonctionnalités clés:**
- Tirages automatisés avec jackpots
- Chat communautaire temps réel WebSocket
- Système parrainage avec codes référents
- Rangs utilisateurs (Bronze/Silver/Gold/Diamond)
- Transactions sécurisées avec historique
- Interface admin complète

**Performance attendue:**
- Cache Redis activé (fallback si indisponible)
- Service Worker PWA pour offline
- Code splitting pour optimisation chargement
- Monitoring logs structuré

Ce test valide une plateforme enterprise-grade prête pour production avec 18 utilisateurs réels et toutes fonctionnalités opérationnelles.