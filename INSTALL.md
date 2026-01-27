# 📦 FAIL FRENZY - Installation Guide

**Dernière mise à jour**: 2026-01-27  
**Version**: 2.0.0 Premium Edition

---

## 🎯 **MÉTHODES D'INSTALLATION**

Choisissez la méthode qui vous convient :

1. **Quick Start** (Recommandé) - 5 minutes
2. **Installation manuelle** - 10 minutes
3. **Docker** (Futur) - 3 minutes
4. **One-click deploy** (Futur) - 1 minute

---

## ⚡ **MÉTHODE 1: QUICK START** (Recommandé)

### **Prérequis**

- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ npm 9+ (inclus avec Node.js)
- ✅ Git (optionnel)

### **Installation**

**Linux/Mac** :
```bash
# Extraire le ZIP
tar -xzf failfrenzy-premium-engine-v2.0-final.tar.gz
cd failfrenzy-engine

# Lancer le script automatique
./quick-start.sh
```

**Windows** :
```cmd
# Extraire le ZIP
# Double-cliquer sur failfrenzy-premium-engine-v2.0-final.tar.gz

# Lancer le script automatique
quick-start.bat
```

**✅ C'est tout !** Le jeu va :
- Installer les dépendances
- Builder le projet
- Lancer le serveur
- Ouvrir votre navigateur

---

## 🔧 **MÉTHODE 2: INSTALLATION MANUELLE**

### **Étape 1: Vérifier Node.js**

```bash
# Vérifier la version
node -v  # Doit être v18.x ou supérieur
npm -v   # Doit être v9.x ou supérieur

# Si non installé, télécharger depuis:
# https://nodejs.org/
```

### **Étape 2: Extraire le projet**

```bash
# Extraire l'archive
tar -xzf failfrenzy-premium-engine-v2.0-final.tar.gz

# Ou utiliser votre outil préféré (WinRAR, 7zip, etc.)

# Aller dans le dossier
cd failfrenzy-engine
```

### **Étape 3: Installer les dépendances**

```bash
# Installer avec npm
npm install

# Ou avec yarn
yarn install

# Ou avec pnpm (plus rapide)
pnpm install
```

**⏱️ Temps estimé** : 2-3 minutes

### **Étape 4: Configuration (optionnel)**

```bash
# Copier l'exemple d'environnement
cp .env.example .dev.vars

# Éditer les variables si nécessaire
nano .dev.vars  # ou votre éditeur préféré
```

### **Étape 5: Builder le projet**

```bash
# Build de production
npm run build

# Vérifier que dist/ a été créé
ls -la dist/
```

**Résultat attendu** :
```
dist/
├── index.html
├── assets/
│   ├── index-xxxxx.css
│   └── index-xxxxx.js
└── _worker.js
```

### **Étape 6: Lancer le serveur**

**Option A: Mode développement** (avec hot reload)
```bash
npm run dev
```

**Option B: Mode production** (preview du build)
```bash
npm run preview
```

### **Étape 7: Accéder au jeu**

Ouvrir votre navigateur :
- **Dev** : http://localhost:5173
- **Preview** : http://localhost:4173
- **Game** : http://localhost:5173/game

---

## ☁️ **MÉTHODE 3: DÉPLOIEMENT CLOUDFLARE**

### **Prérequis**

1. Compte Cloudflare (gratuit) : https://dash.cloudflare.com/sign-up
2. Installation locale fonctionnelle (méthode 1 ou 2)

### **Configuration Cloudflare**

#### **1. Installer Wrangler (si pas déjà installé)**

```bash
npm install -g wrangler

# Ou utiliser npx (recommandé)
npx wrangler --version
```

#### **2. Se connecter à Cloudflare**

```bash
# Login interactif
npx wrangler login

# Vérifier l'authentification
npx wrangler whoami
```

#### **3. Créer la base de données D1**

```bash
# Créer la database
npx wrangler d1 create failfrenzy-production

# Output:
# [[d1_databases]]
# binding = "DB"
# database_name = "failfrenzy-production"
# database_id = "xxxx-xxxx-xxxx-xxxx"  ← COPIER CET ID
```

#### **4. Mettre à jour wrangler.jsonc**

Éditer `wrangler.jsonc` :

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "failfrenzy-engine",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "failfrenzy-production",
      "database_id": "COLLER_L_ID_ICI"  // ← Remplacer
    }
  ]
}
```

#### **5. Appliquer les migrations**

```bash
# Test local d'abord
npx wrangler d1 migrations apply failfrenzy-production --local

# Puis en production
npx wrangler d1 migrations apply failfrenzy-production
```

#### **6. Déployer !**

```bash
# Build + Deploy automatique
npm run deploy

# Ou manuellement
npm run build
npx wrangler pages deploy dist --project-name failfrenzy-engine
```

**Résultat** :
```
✨ Success! Uploaded 42 files (2.35 sec)

✨ Deployment complete! Take a peek over at
   https://xxx.failfrenzy-engine.pages.dev
```

#### **7. Configurer KV (optionnel)**

```bash
# Créer KV namespace
npx wrangler kv:namespace create failfrenzy_KV

# Output: id = "xxxx"

# Créer preview namespace
npx wrangler kv:namespace create failfrenzy_KV --preview

# Output: preview_id = "yyyy"

# Ajouter dans wrangler.jsonc
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "xxxx",
      "preview_id": "yyyy"
    }
  ]
}
```

#### **8. Configurer R2 (optionnel)**

```bash
# Créer bucket R2
npx wrangler r2 bucket create failfrenzy-bucket

# Ajouter dans wrangler.jsonc
{
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "failfrenzy-bucket"
    }
  ]
}
```

---

## 🔐 **GESTION DES SECRETS**

### **Pour le développement local**

Créer `.dev.vars` :
```bash
# .dev.vars (ignoré par git)
DATABASE_ID=your-database-id
API_SECRET=your-secret-key
```

### **Pour la production**

```bash
# Définir un secret
npx wrangler secret put API_SECRET

# Lister les secrets
npx wrangler secret list

# Supprimer un secret
npx wrangler secret delete API_SECRET
```

---

## 🐛 **DÉPANNAGE**

### **Problème: "node: command not found"**

**Solution** : Installer Node.js depuis https://nodejs.org/

### **Problème: "npm install" échoue**

**Solutions** :
```bash
# Nettoyer le cache npm
npm cache clean --force

# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Utiliser --legacy-peer-deps
npm install --legacy-peer-deps
```

### **Problème: "Port 5173 already in use"**

**Solutions** :
```bash
# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Ou changer le port dans vite.config.ts
```

### **Problème: "Wrangler login" ne fonctionne pas**

**Solutions** :
```bash
# Créer un API token manuellement
# 1. Aller sur https://dash.cloudflare.com/profile/api-tokens
# 2. Create Token → Edit Cloudflare Workers
# 3. Copier le token

# Configurer avec le token
export CLOUDFLARE_API_TOKEN=your-token
npx wrangler whoami
```

### **Problème: Build échoue avec erreur TypeScript**

**Solutions** :
```bash
# Vérifier la version de TypeScript
npm list typescript

# Réinstaller TypeScript
npm install -D typescript@latest

# Ignorer les erreurs TypeScript (temporaire)
npm run build -- --force
```

---

## 📋 **CHECKLIST POST-INSTALLATION**

- [ ] Node.js 18+ installé
- [ ] npm install réussi
- [ ] npm run build réussi
- [ ] npm run dev fonctionne
- [ ] Jeu accessible sur localhost:5173
- [ ] Page /game charge correctement
- [ ] Wrangler login réussi (pour deploy)
- [ ] D1 database créée (pour deploy)
- [ ] Migrations appliquées (pour deploy)

---

## 🎓 **PROCHAINES ÉTAPES**

Après installation réussie :

1. **Lire QUICK_START.md** - Guide de démarrage rapide
2. **Lire README.md** - Documentation complète
3. **Tester le jeu** - Tous les modes
4. **Personnaliser** - Couleurs, textes, assets
5. **Déployer** - Sur Cloudflare Pages

---

## 📞 **BESOIN D'AIDE ?**

- **Documentation** : README.md, TECH_STACK.md, GAME_DESIGN.md
- **Cloudflare Docs** : https://developers.cloudflare.com/
- **Node.js Docs** : https://nodejs.org/docs/
- **Vite Docs** : https://vitejs.dev/

---

**Bonne installation ! 🚀**
