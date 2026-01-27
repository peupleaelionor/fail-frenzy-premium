# 🚀 FAIL FRENZY - GUIDE DE DÉPLOIEMENT COMPLET

**Version**: 2.0.0  
**Dernière mise à jour**: 2026-01-27

---

## 📋 **TABLE DES MATIÈRES**

1. [Aperçu Rapide](#aperçu-rapide)
2. [Prérequis](#prérequis)
3. [Installation Locale](#installation-locale)
4. [Déploiement Cloudflare](#déploiement-cloudflare)
5. [Configuration GitHub](#configuration-github)
6. [Tests & Validation](#tests--validation)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 **APERÇU RAPIDE**

**3 options de déploiement** :

| Option | Temps | Difficulté | Recommandé pour |
|--------|-------|------------|-----------------|
| **Local Dev** | 2 min | ⭐ Facile | Développement, tests |
| **Cloudflare Manual** | 10 min | ⭐⭐ Moyen | Production simple |
| **Cloudflare + GitHub CI/CD** | 20 min | ⭐⭐⭐ Avancé | Production automatisée |

---

## ✅ **PRÉREQUIS**

### **Obligatoire**
- ✅ **Node.js 18+** - [Télécharger](https://nodejs.org/)
- ✅ **npm 9+** - Inclus avec Node.js
- ✅ **Git** - [Télécharger](https://git-scm.com/)

### **Pour Cloudflare (Optionnel)**
- ✅ **Compte Cloudflare** - [Gratuit](https://dash.cloudflare.com/sign-up)
- ✅ **Wrangler CLI** - Installé automatiquement

### **Vérification**

```bash
node --version   # v18.0.0 ou supérieur
npm --version    # v9.0.0 ou supérieur
git --version    # n'importe quelle version
```

---

## 💻 **INSTALLATION LOCALE**

### **Option A: Script Automatique (Recommandé)**

#### **Windows**
```cmd
quick-start.bat
```

#### **Mac/Linux**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

### **Option B: Installation Manuelle**

```bash
# 1. Extraire le ZIP
unzip failfrenzy-premium-engine-v2.0-final.zip
cd failfrenzy-engine

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir dans le navigateur
# → http://localhost:5173
```

**C'est tout ! Le jeu est maintenant jouable localement.**

---

## ☁️ **DÉPLOIEMENT CLOUDFLARE**

### **Pourquoi Cloudflare ?**

| Avantage | Bénéfice |
|----------|----------|
| **Global Edge Network** | <50ms latency worldwide |
| **Auto-scaling** | Supporte 1M+ utilisateurs |
| **Free Tier** | 0€/mois jusqu'à 100K users |
| **Zero Cold Start** | Toujours instantané |
| **D1 + KV + R2** | Database + Cache + Storage inclus |

### **Étape 1: Compte Cloudflare**

1. Créer un compte sur https://dash.cloudflare.com/sign-up
2. Vérifier l'email
3. Connecté ✓

### **Étape 2: Installation Wrangler**

```bash
# Installer Wrangler globalement
npm install -g wrangler

# Vérifier l'installation
wrangler --version
```

### **Étape 3: Login Cloudflare**

```bash
# Login interactif (ouvre le navigateur)
npx wrangler login

# OU login avec API token
npx wrangler login --api-token YOUR_API_TOKEN
```

### **Étape 4: Créer D1 Database**

```bash
# Créer la database
npx wrangler d1 create failfrenzy-production

# Output:
# ✅ Successfully created DB 'failfrenzy-production' (abc123-def456-ghi789)
# 📋 database_id = "abc123-def456-ghi789"
```

**⚠️ IMPORTANT**: Copier le `database_id` affiché !

### **Étape 5: Configurer wrangler.jsonc**

Ouvrir `wrangler.jsonc` et remplacer:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "failfrenzy-production",
      "database_id": "COLLER_VOTRE_DATABASE_ID_ICI"  // ← ICI
    }
  ]
}
```

### **Étape 6: Appliquer Migrations**

```bash
# Créer les tables dans D1
npx wrangler d1 migrations apply failfrenzy-production

# Output:
# ✅ Applying 0001_initial_schema.sql
# ✅ Successfully applied 1 migration
```

### **Étape 7: Créer KV Namespace (Optionnel)**

```bash
# Créer le namespace
npx wrangler kv:namespace create failfrenzy_KV

# Output:
# ✅ Created KV namespace failfrenzy_KV
# 📋 id = "xyz789"
```

Si vous utilisez KV, ajouter dans `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "xyz789"  // ← Votre KV ID
    }
  ]
}
```

### **Étape 8: Build**

```bash
# Build production
npm run build

# Output:
# ✓ 1626 modules transformed
# ✓ built in 5.13s
# dist/index.html (2.15 kB)
# dist/assets/*.js (332 kB)
```

### **Étape 9: Créer Pages Project**

```bash
# Créer le projet Cloudflare Pages
npx wrangler pages project create failfrenzy-engine \
  --production-branch main

# Output:
# ✅ Successfully created the 'failfrenzy-engine' project.
```

### **Étape 10: Deploy**

```bash
# Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name failfrenzy-engine

# Output:
# ✨ Uploading...
# ✨ Deployment complete!
# 🌎 https://failfrenzy-engine.pages.dev
# 🌎 https://abc123.failfrenzy-engine.pages.dev
```

**🎉 Félicitations ! Votre jeu est maintenant LIVE !**

### **Étape 11: Vérification**

```bash
# Test de santé
curl https://failfrenzy-engine.pages.dev/api/leaderboard

# Devrait retourner: []
```

Ouvrir dans le navigateur:
- **Home**: https://failfrenzy-engine.pages.dev
- **Game**: https://failfrenzy-engine.pages.dev/game

---

## 🐙 **CONFIGURATION GITHUB (CI/CD)**

### **Étape 1: Créer Repository GitHub**

```bash
# Initialiser git (si pas déjà fait)
git init

# Ajouter remote
git remote add origin https://github.com/VOTRE_USERNAME/failfrenzy-engine.git

# Push initial
git add .
git commit -m "Initial commit: Fail Frenzy Premium Engine v2.0.0"
git push -u origin main
```

### **Étape 2: Créer Cloudflare API Token**

1. Aller sur https://dash.cloudflare.com/profile/api-tokens
2. Cliquer "Create Token"
3. Template: "Edit Cloudflare Workers"
4. Permissions:
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
   - Zone → Workers Scripts → Edit
5. Copier le token généré

### **Étape 3: Ajouter GitHub Secret**

1. Aller sur GitHub: `Settings` → `Secrets and variables` → `Actions`
2. Cliquer `New repository secret`
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: `[coller votre token]`
5. Sauvegarder

### **Étape 4: Créer GitHub Actions Workflow**

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=failfrenzy-engine
```

### **Étape 5: Ajouter Account ID Secret**

1. Trouver Account ID: https://dash.cloudflare.com (dans l'URL)
2. GitHub → Settings → Secrets → `CLOUDFLARE_ACCOUNT_ID`

### **Étape 6: Push & Auto-Deploy**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions CI/CD"
git push origin main

# GitHub Actions va automatiquement:
# 1. Installer les dépendances
# 2. Builder le projet
# 3. Déployer sur Cloudflare
```

---

## ✅ **TESTS & VALIDATION**

### **1. Test Local**

```bash
npm run dev
```

Vérifier:
- ✅ Home page s'affiche
- ✅ Game page fonctionne
- ✅ Contrôles répondent
- ✅ Audio joue
- ✅ Score s'incrémente

### **2. Test Production Build**

```bash
npm run build
npm run preview
```

Vérifier:
- ✅ Build réussit sans erreurs
- ✅ Bundle size acceptable (<500KB)
- ✅ Assets chargent correctement

### **3. Test API Cloudflare**

```bash
# Test leaderboard
curl https://failfrenzy-engine.pages.dev/api/leaderboard

# Test player
curl https://failfrenzy-engine.pages.dev/api/player?name=TestPlayer

# Test achievements
curl https://failfrenzy-engine.pages.dev/api/achievements?name=TestPlayer
```

### **4. Test Database**

```bash
# Vérifier les tables
npx wrangler d1 execute failfrenzy-production \
  --command "SELECT name FROM sqlite_master WHERE type='table'"

# Compter les scores
npx wrangler d1 execute failfrenzy-production \
  --command "SELECT COUNT(*) FROM leaderboard"
```

### **5. Performance Test**

Ouvrir Chrome DevTools:
- **Lighthouse**: Score >90
- **Network**: Load time <2s
- **Performance**: 60 FPS constant

---

## 🔧 **TROUBLESHOOTING**

### **Problème: npm install échoue**

```bash
# Solution 1: Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Utiliser yarn
npm install -g yarn
yarn install
```

### **Problème: Build échoue**

```bash
# Vérifier Node version
node --version  # Doit être 18+

# Réinstaller
rm -rf node_modules dist
npm install
npm run build
```

### **Problème: Wrangler login échoue**

```bash
# Solution 1: Clear credentials
rm -rf ~/.wrangler
npx wrangler login

# Solution 2: Utiliser API token
npx wrangler login --api-token YOUR_TOKEN
```

### **Problème: D1 migrations échouent**

```bash
# Vérifier la database existe
npx wrangler d1 list

# Recréer si nécessaire
npx wrangler d1 create failfrenzy-production
# Mettre à jour wrangler.jsonc
npx wrangler d1 migrations apply failfrenzy-production
```

### **Problème: Deploy échoue**

```bash
# Vérifier la configuration
cat wrangler.jsonc

# Vérifier les permissions
npx wrangler whoami

# Rebuild et redeploy
npm run build
npx wrangler pages deploy dist --project-name failfrenzy-engine
```

### **Problème: 404 sur /game**

**Cause**: Routes SPA pas configurées

**Solution**: Cloudflare Pages gère automatiquement les SPA. Si problème persiste:

```bash
# Vérifier dist/_routes.json existe
cat dist/_routes.json

# Devrait contenir:
# {
#   "version": 1,
#   "include": ["/*"],
#   "exclude": ["/api/*"]
# }
```

---

## 📊 **MONITORING**

### **Cloudflare Dashboard**

1. https://dash.cloudflare.com
2. Pages → failfrenzy-engine
3. Onglets disponibles:
   - **Analytics**: Requêtes, bandwidth, erreurs
   - **Deployments**: Historique des déploiements
   - **Settings**: Configuration, env vars
   - **Logs**: Real-time logs

### **D1 Console**

```bash
# Stats générales
npx wrangler d1 info failfrenzy-production

# Query interactive
npx wrangler d1 execute failfrenzy-production \
  --command "SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10"
```

---

## 🎯 **CHECKLIST FINALE**

### **Avant Déploiement**
- [ ] Node.js 18+ installé
- [ ] Dependencies installées (`npm install`)
- [ ] Build réussi (`npm run build`)
- [ ] Tests locaux passés
- [ ] Compte Cloudflare créé
- [ ] Wrangler CLI installé

### **Configuration Cloudflare**
- [ ] Wrangler login réussi
- [ ] D1 database créée
- [ ] `database_id` copié dans `wrangler.jsonc`
- [ ] Migrations appliquées
- [ ] KV namespace créé (si utilisé)
- [ ] Pages project créé

### **Déploiement**
- [ ] Deploy réussi
- [ ] URL de production accessible
- [ ] Home page charge
- [ ] Game page fonctionne
- [ ] API répond correctement
- [ ] Database accessible

### **Post-Déploiement**
- [ ] Lighthouse score >90
- [ ] Load time <2s
- [ ] Game jouable
- [ ] Leaderboard fonctionne
- [ ] Analytics configurées (optionnel)

---

## 💡 **BEST PRACTICES**

### **Development**
- ✅ Utiliser `npm run dev` pour le développement
- ✅ Tester localement avant deploy
- ✅ Commiter souvent avec messages clairs
- ✅ Utiliser branches pour features

### **Production**
- ✅ Toujours build avant deploy
- ✅ Tester en preview avant production
- ✅ Monitorer les erreurs
- ✅ Backup régulier de la database

### **Database**
- ✅ Migrations versionnées
- ✅ Backup avant migrations production
- ✅ Test migrations en local d'abord
- ✅ Indexer les colonnes fréquemment queryées

---

## 📞 **SUPPORT**

**Documentation**:
- README.md - Vue d'ensemble
- TECH_STACK.md - Architecture technique
- GAME_DESIGN.md - Design du jeu
- QUICK_START.md - Démarrage rapide

**Resources**:
- Cloudflare Docs: https://developers.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler
- D1 Docs: https://developers.cloudflare.com/d1

**Demo Live**:
- https://3000-i11ms75x9cfbfo1jisle0-02b9cc79.sandbox.novita.ai

---

**🎉 Votre jeu Fail Frenzy est maintenant déployé et accessible mondialement !**
