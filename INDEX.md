# 📚 FAIL FRENZY - Documentation Index

**Version**: 2.0.0 Premium Edition  
**Last Updated**: 2026-01-27

---

## 🚀 **DÉMARRAGE RAPIDE**

**Nouveau développeur ?** Commencez ici :

1. **[QUICK_START.md](QUICK_START.md)** - Installation en 5 minutes ⚡
2. **[INSTALL.md](INSTALL.md)** - Guide d'installation détaillé 📦
3. **[README.md](README.md)** - Vue d'ensemble du projet 📖

---

## 📖 **DOCUMENTATION PRINCIPALE**

### **Essentiels**

| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| **[README.md](README.md)** | Vue d'ensemble, features, métriques | 10 min |
| **[QUICK_START.md](QUICK_START.md)** | Installation rapide, déploiement | 5 min |
| **[INSTALL.md](INSTALL.md)** | Guide d'installation complet | 15 min |

### **Architecture & Technique**

| Document | Description | Temps de lecture |
|----------|-------------|------------------|
| **[TECH_STACK.md](TECH_STACK.md)** | Stack technique, architecture | 20 min |
| **[GAME_DESIGN.md](GAME_DESIGN.md)** | Game design document | 20 min |

---

## 🎮 **PAR OBJECTIF**

### **Je veux lancer le jeu localement**
→ **[QUICK_START.md](QUICK_START.md)** section "Installation en 3 commandes"

### **Je veux déployer sur Cloudflare**
→ **[QUICK_START.md](QUICK_START.md)** section "Déploiement Cloudflare"

### **Je veux comprendre l'architecture**
→ **[TECH_STACK.md](TECH_STACK.md)** section "Architecture"

### **Je veux modifier le gameplay**
→ **[GAME_DESIGN.md](GAME_DESIGN.md)** section "Game Modes"

### **Je veux ajouter des features**
→ **[README.md](README.md)** section "Roadmap"

### **Je rencontre un problème**
→ **[QUICK_START.md](QUICK_START.md)** section "Problèmes courants"

---

## 🏗️ **PAR COMPOSANT**

### **Game Engine**
- **GameEngine.ts** : `client/src/engine/GameEngine.ts`
- **NeonRenderer.ts** : `client/src/engine/NeonRenderer.ts`
- **PhysicsSystem.ts** : `client/src/engine/PhysicsSystem.ts`

→ Docs: **[TECH_STACK.md](TECH_STACK.md)** section "Game Engine"

### **Game Logic**
- **FailFrenzyGame.ts** : `client/src/game/FailFrenzyGame.ts`
- **GameComponents.tsx** : `client/src/game/GameComponents.tsx`

→ Docs: **[GAME_DESIGN.md](GAME_DESIGN.md)** section "Gameplay Mechanics"

### **Systems**
- **AchievementSystem.ts** : `client/src/systems/AchievementSystem.ts`
- **AudioSystem.ts** : `client/src/systems/AudioSystem.ts`

→ Docs: **[GAME_DESIGN.md](GAME_DESIGN.md)** section "Progression System"

### **Backend API**
- **Leaderboard** : `functions/api/leaderboard.ts`
- **Player** : `functions/api/player.ts`
- **Achievements** : `functions/api/achievements.ts`

→ Docs: **[README.md](README.md)** section "API Endpoints"

---

## 📂 **STRUCTURE DU PROJET**

```
failfrenzy-engine/
├── 📄 README.md              # Vue d'ensemble
├── 📄 QUICK_START.md         # Guide rapide
├── 📄 INSTALL.md             # Installation détaillée
├── 📄 TECH_STACK.md          # Architecture technique
├── 📄 GAME_DESIGN.md         # Game design
├── 📄 INDEX.md               # Ce fichier
│
├── 📁 client/                # Frontend React
│   ├── src/
│   │   ├── engine/          # Moteur de jeu
│   │   ├── game/            # Logique du jeu
│   │   ├── systems/         # Systèmes (achievements, audio)
│   │   ├── pages/           # Pages UI
│   │   └── App.tsx          # App principale
│   └── public/              # Assets statiques
│
├── 📁 functions/             # API Cloudflare Functions
│   └── api/
│       ├── leaderboard.ts   # API leaderboards
│       ├── player.ts        # API joueurs
│       └── achievements.ts  # API achievements
│
├── 📁 migrations/            # Migrations D1
│   └── 0001_initial_schema.sql
│
├── 📁 public/                # Assets publics
│   ├── images/              # Logos, icons
│   └── static/              # CSS, JS
│
├── 📄 wrangler.jsonc         # Config Cloudflare
├── 📄 vite.config.ts         # Config Vite
├── 📄 package.json           # Dépendances
└── 📄 .env.example           # Variables d'environnement
```

---

## 🔍 **RECHERCHE RAPIDE**

### **Concepts clés**

- **ECS Architecture** → [TECH_STACK.md](TECH_STACK.md#game-engine)
- **Neon Rendering** → [TECH_STACK.md](TECH_STACK.md#game-engine)
- **4 Game Modes** → [GAME_DESIGN.md](GAME_DESIGN.md#game-modes)
- **12 Achievements** → [GAME_DESIGN.md](GAME_DESIGN.md#progression-system)
- **Procedural Audio** → [GAME_DESIGN.md](GAME_DESIGN.md#audio-design)
- **D1 + KV + R2** → [TECH_STACK.md](TECH_STACK.md#backend-stack)
- **Performance** → [README.md](README.md#performance-metrics)
- **Scalability** → [TECH_STACK.md](TECH_STACK.md#scalability)

### **Commandes courantes**

```bash
# Développement
npm run dev              # Lancer dev server
npm run build            # Builder
npm run preview          # Preview build

# Déploiement
npx wrangler login       # Se connecter
npm run deploy           # Déployer

# Database
npx wrangler d1 create failfrenzy-production  # Créer DB
npx wrangler d1 migrations apply failfrenzy-production  # Migrations
```

→ Toutes les commandes: **[QUICK_START.md](QUICK_START.md#commandes-utiles)**

---

## 📊 **MÉTRIQUES & PERFORMANCES**

| Métrique | Valeur | Doc |
|----------|--------|-----|
| Load Time | <2s | [README.md](README.md#performance-metrics) |
| API Latency | ~50ms | [TECH_STACK.md](TECH_STACK.md#performance-optimization) |
| Bundle Size | 332KB | [README.md](README.md#performance-metrics) |
| FPS | 60 | [GAME_DESIGN.md](GAME_DESIGN.md#gameplay-mechanics) |
| Lighthouse | 95+ | [README.md](README.md#performance-metrics) |

---

## 🎯 **ROADMAP**

### **Phase 1: Core** ✅ COMPLETE
- [x] Game engine + physics
- [x] 4 game modes
- [x] Visual effects
- [x] Audio system
- [x] Achievement system
- [x] Backend API

### **Phase 2: Enhancements** 🔄 IN PROGRESS
- [ ] Cosmetic customization UI
- [ ] Daily challenges
- [ ] Social features

### **Phase 3: Scale** 📋 PLANNED
- [ ] Analytics dashboard
- [ ] Native mobile apps
- [ ] Tournament system

→ Roadmap complet: **[README.md](README.md#roadmap)**

---

## 💡 **CONTRIBUTION**

### **Comment contribuer ?**

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/ma-feature`
3. **Commit** : `git commit -m 'feat: Ma nouvelle feature'`
4. **Push** : `git push origin feature/ma-feature`
5. **Pull Request**

### **Standards de code**

- **TypeScript** : Strict mode
- **React** : Functional components + hooks
- **CSS** : Tailwind utility classes
- **Commits** : Conventional commits (feat, fix, docs, etc.)

---

## 📞 **SUPPORT**

### **Documentation**
- [README.md](README.md) - Vue d'ensemble
- [TECH_STACK.md](TECH_STACK.md) - Architecture
- [GAME_DESIGN.md](GAME_DESIGN.md) - Game design

### **Liens externes**
- **Cloudflare**: https://developers.cloudflare.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

### **Contact**
- **Issues**: GitHub Issues
- **Email**: support@failfrenzy.com (fictif)
- **Discord**: discord.gg/failfrenzy (fictif)

---

## ✅ **CHECKLIST DE DÉMARRAGE**

Pour un nouveau développeur :

- [ ] Lire [README.md](README.md)
- [ ] Lire [QUICK_START.md](QUICK_START.md)
- [ ] Installer le projet
- [ ] Lancer `npm run dev`
- [ ] Tester le jeu sur `/game`
- [ ] Explorer le code dans `client/src/`
- [ ] Lire [TECH_STACK.md](TECH_STACK.md)
- [ ] Lire [GAME_DESIGN.md](GAME_DESIGN.md)
- [ ] Faire un premier commit

---

## 🏆 **STATUT DU PROJET**

```
✅ Version: 2.0.0 Premium Edition
✅ Status: PRODUCTION READY
✅ License: Commercial
✅ Platform: Cloudflare Workers
✅ Performance: <2s load, 60 FPS
✅ Scalability: Infinite (Edge)
✅ Documentation: Complete
```

---

**Bonne lecture ! 📚**
