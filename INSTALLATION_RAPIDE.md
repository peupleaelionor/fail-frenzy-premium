# 🚀 INSTALLATION RAPIDE - FAIL FRENZY
## Guide Express pour Tester le Jeu en 10 Minutes

---

## ⚡ OPTION 1: TEST IMMÉDIAT (Sans Unity)

### Tester l'Interface Web Interactive

```bash
# 1. Aller dans le dossier client
cd fail-frenzy-grouptechflow/client

# 2. Installer les dépendances
npm install
# OU
pnpm install

# 3. Lancer le serveur de développement
npm run dev
# OU
pnpm dev

# 4. Ouvrir dans le navigateur
# http://localhost:5173
```

**Vous verrez:**
- ✅ GDD interactif complet
- ✅ Tous les visuels HD
- ✅ Design Glitch Pop Arcade
- ✅ Sections expandables
- ✅ PWA installable

---

## 🎮 OPTION 2: TEST UNITY COMPLET (Recommandé)

### Prérequis Rapides
```bash
# Vérifier Unity
unity --version

# Vérifier Git
git --version

# Vérifier Python
python3 --version
```

### Installation Automatique

```bash
# 1. Extraire le ZIP
unzip fail-frenzy-grouptechflow-v1.0.0.zip
cd fail-frenzy-grouptechflow

# 2. Lancer le script de setup
python3 quick-start.py

# 3. Choisir "1" pour setup complet
# Le script va:
# - Créer le projet Unity
# - Configurer les dossiers
# - Copier tous les scripts
# - Copier tous les assets
# - Initialiser Git
```

### Installation Manuelle (Alternative)

```bash
# 1. Créer projet Unity
mkdir FailFrenzy
cd FailFrenzy

# 2. Copier les scripts
cp ../UNITY_SCRIPTS_COMPLETE.cs Assets/Scripts/

# 3. Copier les images
cp -r ../client/public/images Assets/Images/

# 4. Copier les configs
cp ../CONFIG_*.json Assets/Resources/
```

---

## 🎯 PREMIÈRE COMPILATION

### Dans Unity Editor

1. **Ouvrir Unity Hub**
   - Add → Sélectionner `FailFrenzy`
   - Unity version: 2022.3 LTS

2. **Importer les Packages Essentiels**
   ```
   Window → Package Manager
   - Unity Input System (Install)
   - TextMeshPro (Install)
   ```

3. **Créer la Scène de Test**
   ```csharp
   // File → New Scene
   // Ajouter:
   - Canvas (UI)
   - EventSystem
   - GameManager (GameObject vide)
   ```

4. **Attacher les Scripts**
   ```
   GameManager GameObject:
   - Add Component → GameManager
   - Add Component → InputHandler
   - Add Component → FailStreakManager
   ```

5. **Build & Run**
   ```
   File → Build Settings
   - Platform: Android ou iOS
   - Build And Run
   ```

---

## 🧪 TEST RAPIDE DES FONCTIONNALITÉS

### Test 1: Input System (2 min)

```csharp
// Dans Unity Console, vous devriez voir:
- "InputHandler initialized"
- "Touch detected" quand vous touchez l'écran
- "Swipe direction: left/right/up/down"
```

### Test 2: Obstacle Generation (2 min)

```csharp
// Lancer le jeu:
- Les obstacles doivent apparaître toutes les secondes
- Ils doivent se déplacer vers le joueur
- Collision détectée = "Player died" dans console
```

### Test 3: Fail Streak (2 min)

```csharp
// Laisser le joueur mourir plusieurs fois:
- Streak doit incrémenter: 1, 2, 3...
- À streak 5: Message "Milestone reached!"
- UI doit afficher le streak actuel
```

### Test 4: Difficulty Adaptive (3 min)

```csharp
// Jouer pendant 1 minute:
- Si vous réussissez trop: obstacles plus rapides
- Si vous échouez trop: obstacles plus lents
- Check console: "Difficulty adjusted to: X"
```

---

## 📱 BUILD MOBILE (Test sur Appareil)

### Android Build

```bash
# 1. Configurer dans Unity
File → Build Settings
- Platform: Android
- Switch Platform

# 2. Player Settings
- Company Name: VotreNom
- Product Name: Fail Frenzy
- Package Name: com.grouptechflow.failfrenzy
- Minimum API Level: 26 (Android 8.0)

# 3. Build
- Build And Run
- Connecter votre téléphone Android
- Activer "USB Debugging"
```

### iOS Build

```bash
# 1. Configurer dans Unity
File → Build Settings
- Platform: iOS
- Switch Platform

# 2. Player Settings
- Bundle Identifier: com.grouptechflow.failfrenzy
- Target SDK: iOS 13.0

# 3. Build
- Build
- Ouvrir dans Xcode
- Signer avec votre Apple Developer account
- Run sur device
```

---

## 🎨 TEST DES ASSETS VISUELS

### Vérifier les Images

```bash
# Les images sont dans:
fail-frenzy-grouptechflow/client/public/images/

# Tester:
- hero-glitch.png (Ouvrir → Doit être neon, glitch effect)
- logo-main.png (Logo FAIL FRENZY avec effets)
- logo-icon.png (Icône carrée 1024x1024)
- game-obstacles.png (Formes géométriques neon)
```

### Intégrer dans Unity

```
1. Drag & drop images dans Assets/Images/
2. Configurer Texture Type:
   - UI: Sprite (2D and UI)
   - Background: Default
3. Apply
```

---

## 🐛 TROUBLESHOOTING RAPIDE

### Problème: "Unity not found"
```bash
# Solution:
# Installer Unity Hub: https://unity.com/download
# Installer Unity 2022.3 LTS via Hub
```

### Problème: "Scripts compilation errors"
```bash
# Solution:
# Vérifier que tous les scripts sont dans Assets/Scripts/
# Ouvrir UNITY_SCRIPTS_COMPLETE.cs
# Copier chaque classe dans un fichier séparé
```

### Problème: "Missing namespace"
```bash
# Solution:
# Installer packages:
Window → Package Manager
- Unity Input System
- TextMeshPro
```

### Problème: "Touch not detected"
```bash
# Solution:
Edit → Project Settings → Input System Package
- Active Input Handling: Input System Package (New)
- Restart Unity
```

---

## 📊 CHECKLIST DE TEST

### Tests Essentiels (15 min)

- [ ] **Launch Test**
  - [ ] Jeu lance sans erreur
  - [ ] Écran de chargement s'affiche
  - [ ] FPS > 50

- [ ] **Input Test**
  - [ ] Swipe left détecté
  - [ ] Swipe right détecté
  - [ ] Tap détecté
  - [ ] Hold détecté

- [ ] **Gameplay Test**
  - [ ] Obstacles apparaissent
  - [ ] Obstacles se déplacent
  - [ ] Collision fonctionne
  - [ ] Joueur peut esquiver

- [ ] **Fail Streak Test**
  - [ ] Streak incrémente
  - [ ] Milestone à 5 fails
  - [ ] UI met à jour
  - [ ] Récompense débloquée

- [ ] **Performance Test**
  - [ ] FPS reste > 55
  - [ ] Pas de lag
  - [ ] Mémoire < 200MB
  - [ ] Pas de crash après 5 min

- [ ] **UI Test**
  - [ ] Score s'affiche
  - [ ] Streak s'affiche
  - [ ] Boutons répondent
  - [ ] Animations fluides

---

## 🎯 TESTS AVANCÉS (Optionnel)

### Test 1: Difficulté Adaptative

```bash
1. Jouer pendant 2 minutes
2. Noter la vitesse initiale des obstacles
3. Échouer 10 fois rapidement
4. Vérifier: obstacles doivent ralentir
5. Réussir 10 fois
6. Vérifier: obstacles doivent accélérer
```

### Test 2: Modes de Jeu

```bash
1. Tester mode Classic (normal)
2. Tester mode Chaos (random)
3. Tester mode Time Attack (30s)
4. Vérifier que chaque mode est différent
```

### Test 3: Système de Cosmétiques

```bash
1. Atteindre fail streak 100
2. Vérifier déblocage cosmétique
3. Équiper le cosmétique
4. Vérifier effet visuel appliqué
```

---

## 📈 MÉTRIQUES À SURVEILLER

### Pendant les Tests

```
FPS:              Cible > 55, Idéal 60
Mémoire:          < 150MB
Taille Build:     < 50MB
Temps Chargement: < 3 secondes
Crash Rate:       0%
```

### Outils de Monitoring

```csharp
// Dans Unity:
Window → Analysis → Profiler

// Monitorer:
- CPU Usage
- Memory Usage
- Rendering
- Audio
```

---

## 🚀 PROCHAINES ÉTAPES

### Après Tests Réussis

1. ✅ Lire `PHASE_1_2_3_GUIDE.md` pour développement complet
2. ✅ Implémenter les features manquantes
3. ✅ Ajouter vos propres cosmétiques
4. ✅ Configurer Firebase Analytics
5. ✅ Intégrer Google AdMob
6. ✅ Tester sur 5+ appareils différents
7. ✅ Préparer soumission aux stores

---

## 💡 CONSEILS PRO

### Pour Tests Efficaces

1. **Testez sur vrais appareils** (pas juste simulateur)
2. **Testez différentes résolutions d'écran**
3. **Testez avec batterie faible**
4. **Testez avec connexion lente**
5. **Testez en conditions réelles (métro, bus)**

### Debug Mode

```csharp
// Activer les logs détaillés:
Debug.Log("Message");

// Dans Build Settings:
Development Build: ✓
Script Debugging: ✓
```

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez des problèmes pendant les tests:

1. **Vérifier TROUBLESHOOTING.md** (si disponible)
2. **Vérifier la console Unity** (erreurs rouges)
3. **Contacter support@grouptechflow.com**
4. **Discord: Grouptechflow Community**

---

## ✅ VALIDATION FINALE

Avant de passer au développement complet:

- [ ] Tous les tests essentiels passés
- [ ] Aucune erreur dans la console
- [ ] Build mobile fonctionne
- [ ] Performance satisfaisante
- [ ] Assets visuels corrects
- [ ] Prêt pour Phase 1 développement !

---

**🎮 Bon testing ! Si tous les tests passent, vous êtes prêt à développer ! 🚀**

**Créé par Grouptechflow avec 💙**
