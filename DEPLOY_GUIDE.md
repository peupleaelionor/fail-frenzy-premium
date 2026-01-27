# 🚀 DÉPLOIEMENT CLOUDFLARE - Guide Complet

## 🎯 Objectif
Déployer Fail Frenzy Engine sur Cloudflare Pages avec D1/KV/R2 en production.

---

## ⚡ QUICK DEPLOY (5 Minutes)

### Étape 1: Setup Cloudflare API
```bash
# Appeler l'outil setup (depuis le sandbox AI)
setup_cloudflare_api_key

# Ou manuel: Obtenir API token depuis Cloudflare Dashboard
# Dashboard → My Profile → API Tokens → Create Token
```

### Étape 2: Build le Projet
```bash
cd /home/user/webapp/failfrenzy-engine
npm run build
```

### Étape 3: Créer Projet Cloudflare Pages
```bash
# Créer projet (une seule fois)
wrangler pages project create failfrenzy-engine \
  --production-branch main

# Déployer
wrangler pages deploy dist --project-name failfrenzy-engine
```

---

## 🗄️ CONFIGURATION D1 DATABASE

### Créer Database Production
```bash
# Créer database
wrangler d1 create failfrenzy-production

# Output: database_id (copier dans wrangler.jsonc)
```

### Mettre à jour wrangler.jsonc
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "failfrenzy-production",
      "database_id": "PASTE_ID_HERE"  // ← Coller l'ID ici
    }
  ]
}
```

### Appliquer Migrations
```bash
# Migration production
wrangler d1 migrations apply failfrenzy-production

# Vérifier tables créées
wrangler d1 execute failfrenzy-production \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🔑 CONFIGURATION KV STORAGE

### Créer KV Namespace
```bash
# Production KV
wrangler kv:namespace create failfrenzy_kv

# Output: id (copier dans wrangler.jsonc)
```

### Mettre à jour wrangler.jsonc
```jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "PASTE_KV_ID_HERE"
    }
  ]
}
```

### Test KV
```bash
# Écrire test key
wrangler kv:key put --namespace-id=YOUR_ID "test" "value"

# Lire
wrangler kv:key get --namespace-id=YOUR_ID "test"
```

---

## 📦 CONFIGURATION R2 STORAGE

### Créer R2 Bucket
```bash
# Créer bucket pour assets
wrangler r2 bucket create failfrenzy-assets
```

### Mettre à jour wrangler.jsonc
```jsonc
{
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "failfrenzy-assets"
    }
  ]
}
```

### Upload Assets
```bash
# Upload images vers R2
wrangler r2 object put failfrenzy-assets/logo.png \
  --file=client/public/images/logo-main.png
```

---

## 🔐 SECRETS & ENVIRONMENT

### Définir Secrets
```bash
# API keys (si nécessaire pour intégrations tierces)
wrangler pages secret put ANALYTICS_KEY --project-name failfrenzy-engine
wrangler pages secret put PAYMENT_KEY --project-name failfrenzy-engine
```

### Variables d'Environnement
Dans `wrangler.jsonc`:
```jsonc
{
  "vars": {
    "ENVIRONMENT": "production",
    "GAME_VERSION": "1.0.0",
    "API_BASE_URL": "https://failfrenzy-engine.pages.dev"
  }
}
```

---

## 🌐 DOMAINE CUSTOM (Optionnel)

### Ajouter Custom Domain
```bash
# Via Cloudflare Dashboard
# Pages → failfrenzy-engine → Custom domains → Add domain

# Ou via wrangler
wrangler pages domain add failgame.com --project-name failfrenzy-engine
```

### DNS Configuration
1. Aller sur Cloudflare Dashboard → DNS
2. Ajouter CNAME record:
   - **Name**: `@` (ou `www`)
   - **Target**: `failfrenzy-engine.pages.dev`
   - **Proxy**: ✅ Activé (orange cloud)

---

## 📊 MONITORING POST-DÉPLOIEMENT

### Vérifier Déploiement
```bash
# Test URL production
curl https://failfrenzy-engine.pages.dev

# Test API endpoints
curl https://failfrenzy-engine.pages.dev/api/leaderboard?mode=classic

# Test D1 via wrangler
wrangler d1 execute failfrenzy-production \
  --command="SELECT COUNT(*) FROM users"
```

### Cloudflare Analytics
1. Dashboard → Pages → failfrenzy-engine → Analytics
2. Surveiller:
   - Requests/second
   - Error rate
   - Latency (p50, p95, p99)
   - Geographic distribution

### Logs en Temps Réel
```bash
# Tail logs production
wrangler pages deployment tail --project-name failfrenzy-engine
```

---

## 🔄 CI/CD GitHub Actions

### Créer `.github/workflows/deploy.yml`
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: failfrenzy-engine
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Ajouter Secrets GitHub
1. Repository → Settings → Secrets and variables → Actions
2. Ajouter:
   - `CLOUDFLARE_API_TOKEN` (depuis Cloudflare)
   - `CLOUDFLARE_ACCOUNT_ID` (Dashboard → Overview)

---

## 🐛 TROUBLESHOOTING

### Build Errors
```bash
# Clear cache et rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### D1 Connection Issues
```bash
# Vérifier database existe
wrangler d1 list

# Vérifier binding correct dans wrangler.jsonc
cat wrangler.jsonc | grep -A 5 d1_databases
```

### Function Errors
```bash
# Logs détaillés
wrangler pages deployment tail --project-name failfrenzy-engine --format=pretty

# Test local avec wrangler
npm run dev:wrangler
curl http://localhost:3000/api/leaderboard
```

### Permissions Denied
```bash
# Re-authenticate
wrangler login

# Vérifier permissions API token
# Must have: Workers Scripts:Edit, Pages:Edit, D1:Edit
```

---

## 📈 SCALING & PERFORMANCE

### Auto-Scaling
✅ **Automatique** - Cloudflare gère scaling sans configuration

### Rate Limiting
Ajouter dans Functions:
```typescript
// functions/api/_middleware.ts
export async function onRequest(context) {
  const ip = context.request.headers.get('CF-Connecting-IP');
  
  // Check rate limit (via KV)
  const key = `ratelimit:${ip}`;
  const count = await context.env.KV.get(key);
  
  if (count && parseInt(count) > 100) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  await context.env.KV.put(key, (parseInt(count || '0') + 1).toString(), {
    expirationTtl: 60  // 1 minute
  });
  
  return await context.next();
}
```

### Caching Strategy
```typescript
// Cache API responses
return new Response(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, max-age=60, s-maxage=300',
    'Content-Type': 'application/json'
  }
});
```

---

## ✅ CHECKLIST DÉPLOIEMENT

### Pré-Déploiement
- [ ] Build local réussi (`npm run build`)
- [ ] D1 database créée et configurée
- [ ] KV namespace créé (si utilisé)
- [ ] R2 bucket créé (si utilisé)
- [ ] Secrets définis (API keys)
- [ ] `wrangler.jsonc` complet et valide

### Déploiement
- [ ] `wrangler pages deploy` réussi
- [ ] URL production accessible
- [ ] API endpoints fonctionnels
- [ ] D1 queries marchent
- [ ] Assets chargent correctement

### Post-Déploiement
- [ ] Analytics configurées
- [ ] Monitoring actif
- [ ] Logs accessibles
- [ ] Custom domain configuré (optionnel)
- [ ] CI/CD GitHub setup (optionnel)

---

## 🎯 RÉSULTAT ATTENDU

**Production URL**: `https://failfrenzy-engine.pages.dev`

**Performance**:
- Load time: <2s (4G)
- API latency: <50ms
- Global availability: 300+ locations
- Uptime: 99.99%

**Coûts**:
- Free tier Cloudflare Pages: 500 builds/month
- D1: 5M rows read/day free
- KV: 100K reads/day free
- R2: 10GB storage free

---

**Version**: 1.0.0  
**Date**: 27 janvier 2026  
**Status**: ✅ Production-ready
