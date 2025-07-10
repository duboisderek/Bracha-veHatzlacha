# 🔒 Configuration SSL/HTTPS pour brahatz.com

## Configuration SSL Automatique Replit

### Domaine de Production
- **Domaine**: https://brahatz.com
- **SSL**: Automatiquement géré par Replit Deployments
- **Certificat**: Let's Encrypt (renouvelé automatiquement)

### Configuration Automatique

Replit Deployments configure automatiquement :

1. **Certificat SSL/TLS** - Let's Encrypt
2. **Redirection HTTP → HTTPS** - Automatique
3. **HSTS Headers** - Configurés par défaut
4. **Renouvellement automatique** - Géré par Replit

### Variables d'Environnement Production

```env
# Production HTTPS
NODE_ENV=production
SSL_REDIRECT=true
SECURE_COOKIES=true
DOMAIN=brahatz.com
```

### Sécurité Cookies Production

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS seulement
    httpOnly: true,    // Pas d'accès JavaScript
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'strict' // Protection CSRF
  }
}));
```

### Configuration Headers Sécurité

```javascript
// Headers de sécurité automatiques
app.use((req, res, next) => {
  // HTTPS uniquement
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Protection XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});
```

## ✅ Statut Configuration

- ✅ **Domaine configuré**: brahatz.com
- ✅ **SSL automatique**: Géré par Replit
- ✅ **HTTPS redirect**: Automatique
- ✅ **Certificat valide**: Let's Encrypt
- ✅ **Renouvellement auto**: Activé

## Déploiement

1. **Configuration automatique** lors du déploiement sur Replit
2. **Domaine personnalisé** configuré dans les paramètres de déploiement
3. **SSL/TLS** activé automatiquement
4. **Production ready** avec tous les headers de sécurité

### Vérification Post-Déploiement

```bash
# Test SSL
curl -I https://brahatz.com

# Vérification headers sécurité
curl -I https://brahatz.com | grep -i "strict-transport-security"

# Test redirection HTTPS
curl -I http://brahatz.com
```

## 📋 Checklist Sécurité Production

- ✅ SSL/TLS automatique configuré
- ✅ Cookies sécurisés (httpOnly, secure, sameSite)
- ✅ Headers de sécurité (HSTS, XSS Protection)
- ✅ Domaine personnalisé brahatz.com
- ✅ Redirection HTTP → HTTPS
- ✅ Certificat Let's Encrypt valide
- ✅ Configuration production prête