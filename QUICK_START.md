# ⚡ FAIL FRENZY - QUICK START GUIDE

**Temps de setup**: 5 minutes  
**Prérequis**: Node.js 18+, Git

---

## 🚀 **DÉMARRAGE IMMÉDIAT (Local)**

```bash
# 1. Clone ou extract le projet
cd failfrenzy-engine

# 2. Installer les dépendances
npm install

# 3. Lancer le jeu en développement
npm run dev

# 4. Ouvrir dans le navigateur
# http://localhost:5173
```

**C'est tout ! Le jeu est maintenant jouable localement.**

---

## 🌐 **DÉPLOIEMENT CLOUDFLARE (Production)**

### **Option A: Déploiement Automatique (Recommandé)**

```bash
# 1. Run le script d'installation
bash setup.sh

# Le script va:
# - Vérifier les dépendances
# - Builder le projet
# - Configurer Cloudflare
# - Déployer automatiquement
```

### **Option B: Déploiement Manuel**

#### **Étape 1: Login Cloudflare**

```bash
# Login avec votre compte Cloudflare
npx wrangler login
```

#### **Étape 2: Créer la Database D1**

```bash
# Créer la base de données
npx wrangler d1 create failfrenzy-production

# IMPORTANT: Copier le database_id affiché
# Exemple: database_id: "abc123-def456-ghi789"
```

#### **Étape 3: Configurer wrangler.jsonc**

Ouvrir `wrangler.jsonc` et remplacer `YOUR_DATABASE_ID` :

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "failfrenzy-production",
      "database_id": "abc123-def456-ghi789"  // ← Votre ID ici
    }
  ]
}
```

#### **Étape 4: Appliquer les Migrations**

```bash
# Créer les tables dans D1
npx wrangler d1 migrations apply failfrenzy-production
```

#### **Étape 5: Créer le KV Namespace**

```bash
# Créer le namespace KV
npx wrangler kv:namespace create failfrenzy_KV

# Copier le namespace_id affiché
# Ajouter dans wrangler.jsonc:
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_ID"
    }
  ]
}
```

#### **Étape 6: Build et Deploy**

```bash
# Build le projet
npm run build

# Créer le projet Cloudflare Pages
npx wrangler pages project create failfrenzy-engine \
  --production-branch main

# Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name failfrenzy-engine
```

#### **Étape 7: Accéder au Jeu**

Cloudflare va afficher l'URL de production :

```
✨ Deployment complete! Take a bow.
🌎 https://failfrenzy-engine.pages.dev
```

---

## 📱 **TESTER LE JEU**

### **Local**
- Home: http://localhost:5173
- Game: http://localhost:5173/game
- API: http://localhost:5173/api/leaderboard

### **Production Cloudflare**
- Home: https://failfrenzy-engine.pages.dev
- Game: https://failfrenzy-engine.pages.dev/game
- API: https://failfrenzy-engine.pages.dev/api/leaderboard

---

## 🎮 **CONTRÔLES DU JEU**

### **Mobile (Touch)**
- **Glisser** - Bouger le joueur

### **Desktop (Souris)**
- **Clic + Drag** - Bouger le joueur

### **Clavier**
- **Flèches / WASD** - Déplacements
- **Espace** - Redémarrer (game over)
- **P** - Pause
- **Échap** - Menu

---

## 🛠️ **COMMANDES UTILES**

```bash
# Développement
npm run dev              # Serveur dev (Vite)
npm run build            # Build production
npm run preview          # Preview build local

# Cloudflare
npx wrangler pages dev dist        # Test local avec Workers
npx wrangler pages deploy dist     # Deploy rapide
npx wrangler d1 execute failfrenzy-production --command "SELECT * FROM leaderboard"  # Query DB

# Database
npm run db:migrate:local           # Migrations local
npm run db:migrate:prod            # Migrations production
npm run db:console:local           # Console D1 local
npm run db:console:prod            # Console D1 production

# Git
git add .
git commit -m "Update game"
git push origin main
```

---

## 📊 **VÉRIFIER LE DÉPLOIEMENT**

### **1. Test de Santé**

```bash
# Test API Leaderboard
curl https://failfrenzy-engine.pages.dev/api/leaderboard

# Devrait retourner: []  (empty array au début)
```

### **2. Test du Jeu**

1. Ouvrir https://failfrenzy-engine.pages.dev/game
2. Sélectionner un mode (Classic recommandé)
3. Jouer quelques secondes
4. Vérifier le leaderboard dans la console

### **3. Test de la Database**

```bash
# Vérifier les tables
npx wrangler d1 execute failfrenzy-production \
  --command "SELECT name FROM sqlite_master WHERE type='table'"

# Devrait afficher: players, leaderboard, achievements, etc.
```

---

## 🔥 **TROUBLESHOOTING**

### **Problème: "wrangler: command not found"**

```bash
# Installer wrangler globalement
npm install -g wrangler

# OU utiliser npx
npx wrangler --version
```

### **Problème: "Database not found"**

```bash
# Recréer la database
npx wrangler d1 create failfrenzy-production
# Copier le nouveau database_id dans wrangler.jsonc
# Réappliquer les migrations
npx wrangler d1 migrations apply failfrenzy-production
```

### **Problème: "Build failed"**

```bash
# Nettoyer et rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **Problème: "Port 5173 already in use"**

```bash
# Tuer le processus
fuser -k 5173/tcp 2>/dev/null || true

# OU changer le port dans vite.config.ts
server: { port: 3000 }
```

---

## 🚀 **DÉPLOIEMENT CONTINU (GitHub Actions)**

Créer `.github/workflows/deploy.yml` :

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
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy dist --project-name=failfrenzy-engine
```

---

## 📈 **MONITORING**

### **Cloudflare Dashboard**

1. Aller sur https://dash.cloudflare.com
2. Sélectionner votre compte
3. Pages → failfrenzy-engine
4. Voir:
   - Analytics (visites, requêtes)
   - Logs (erreurs, requêtes)
   - Settings (custom domain, env vars)

### **D1 Database**

```bash
# Stats database
npx wrangler d1 info failfrenzy-production

# Query custom
npx wrangler d1 execute failfrenzy-production \
  --command "SELECT COUNT(*) as total_scores FROM leaderboard"
```

---

## 🎯 **NEXT STEPS**

### **1. Custom Domain (Optionnel)**

```bash
# Ajouter un domaine personnalisé
npx wrangler pages domain add failfrenzy.com \
  --project-name failfrenzy-engine
```

### **2. Environment Variables**

```bash
# Ajouter des secrets
npx wrangler pages secret put API_KEY \
  --project-name failfrenzy-engine
```

### **3. Analytics**

Ajouter dans `index.html` :

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

---

## 💡 **TIPS**

### **Performance**

- ✅ Build déjà optimisé (<2s load)
- ✅ Edge caching activé automatiquement
- ✅ CDN global (300+ locations)

### **Coûts**

- ✅ **0€/mois** pour 100K utilisateurs (free tier)
- ✅ Scaling automatique infini
- ✅ Pas de serveur à gérer

### **Développement**

- 🔥 Hot Module Replacement (HMR) activé
- 🔥 TypeScript strict mode
- 🔥 Auto-reload sur changements

---

## 📞 **SUPPORT**

- **Documentation**: Voir README.md, TECH_STACK.md, GAME_DESIGN.md
- **Issues**: GitHub Issues
- **Demo Live**: https://3000-i11ms75x9cfbfo1jisle0-02b9cc79.sandbox.novita.ai

---

## ✅ **CHECKLIST DE DÉPLOIEMENT**

- [ ] Node.js 18+ installé
- [ ] Compte Cloudflare créé
- [ ] `npm install` exécuté
- [ ] `npm run build` réussi
- [ ] `npx wrangler login` connecté
- [ ] D1 database créée
- [ ] Migrations appliquées
- [ ] `wrangler.jsonc` configuré
- [ ] Deploy réussi
- [ ] Jeu testé en production
- [ ] Leaderboard fonctionne

---

**🎉 Félicitations ! Ton jeu est maintenant LIVE sur Cloudflare Pages !**

**URL de production**: https://failfrenzy-engine.pages.dev

**Temps total**: 5-15 minutes selon expérience
