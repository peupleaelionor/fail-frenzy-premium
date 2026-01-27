#!/usr/bin/env python3
"""
Fail Frenzy - Quick Start Script
Créé par Grouptechflow
"""

import os
import sys
import subprocess
import platform

def print_banner():
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🎮  FAIL FRENZY: THE LOOP                        ║
║                                                           ║
║         Quick Start Development Script                    ║
║         Par Grouptechflow                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)

def check_prerequisites():
    """Vérifier les prérequis d'installation"""
    print("\n🔍 Vérification des prérequis...")
    
    checks = {
        "Unity Hub": check_unity(),
        "Git": check_git(),
        "Node.js": check_nodejs(),
        "Python": check_python()
    }
    
    all_good = all(checks.values())
    
    if all_good:
        print("✅ Tous les prérequis sont installés !\n")
    else:
        print("\n❌ Certains prérequis manquent. Veuillez les installer:\n")
        for tool, installed in checks.items():
            if not installed:
                print(f"   - {tool}")
        print("\n")
    
    return all_good

def check_unity():
    """Vérifier Unity Hub"""
    try:
        if platform.system() == "Windows":
            result = subprocess.run(["where", "Unity"], capture_output=True)
        else:
            result = subprocess.run(["which", "unity"], capture_output=True)
        return result.returncode == 0
    except:
        return False

def check_git():
    """Vérifier Git"""
    try:
        result = subprocess.run(["git", "--version"], capture_output=True)
        return result.returncode == 0
    except:
        return False

def check_nodejs():
    """Vérifier Node.js"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True)
        return result.returncode == 0
    except:
        return False

def check_python():
    """Vérifier Python"""
    return sys.version_info >= (3, 8)

def create_unity_project():
    """Créer le projet Unity"""
    print("📦 Création du projet Unity...")
    
    project_path = "./FailFrenzy"
    
    if os.path.exists(project_path):
        print(f"⚠️  Le projet existe déjà: {project_path}")
        response = input("Voulez-vous le supprimer et recommencer? (y/N): ")
        if response.lower() == 'y':
            import shutil
            shutil.rmtree(project_path)
            print("✅ Projet supprimé")
        else:
            print("ℹ️  Conservation du projet existant")
            return
    
    print("🔨 Création en cours... (cela peut prendre quelques minutes)")
    
    # Commande Unity CLI
    cmd = [
        "unity",
        "-createProject", project_path,
        "-quit",
        "-batchmode"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Projet Unity créé: {project_path}")
    except subprocess.CalledProcessError:
        print("❌ Erreur lors de la création du projet Unity")
        print("💡 Créez le projet manuellement via Unity Hub")

def setup_project_structure():
    """Créer la structure de dossiers"""
    print("\n📁 Configuration de la structure du projet...")
    
    project_path = "./FailFrenzy"
    
    if not os.path.exists(project_path):
        print("❌ Projet Unity non trouvé. Créez-le d'abord!")
        return
    
    assets_path = os.path.join(project_path, "Assets")
    
    folders = [
        "Scripts/Core",
        "Scripts/Managers",
        "Scripts/Controllers",
        "Scripts/Systems",
        "Scripts/UI",
        "Prefabs",
        "Scenes",
        "Resources",
        "Images",
        "Audio/Music",
        "Audio/SFX",
        "Fonts",
        "Materials",
        "Animations"
    ]
    
    for folder in folders:
        folder_path = os.path.join(assets_path, folder)
        os.makedirs(folder_path, exist_ok=True)
    
    print("✅ Structure de dossiers créée")

def copy_scripts():
    """Copier les scripts Unity"""
    print("\n📝 Copie des scripts Unity...")
    
    # Vérifier si UNITY_SCRIPTS_COMPLETE.cs existe
    if not os.path.exists("UNITY_SCRIPTS_COMPLETE.cs"):
        print("❌ UNITY_SCRIPTS_COMPLETE.cs non trouvé")
        return
    
    project_path = "./FailFrenzy/Assets/Scripts/"
    
    if not os.path.exists(project_path):
        print("❌ Dossier Scripts non trouvé")
        return
    
    import shutil
    shutil.copy("UNITY_SCRIPTS_COMPLETE.cs", project_path)
    
    print("✅ Scripts copiés")

def copy_assets():
    """Copier les assets (images, configs)"""
    print("\n🎨 Copie des assets...")
    
    project_path = "./FailFrenzy/Assets/"
    
    if not os.path.exists(project_path):
        print("❌ Projet Unity non trouvé")
        return
    
    import shutil
    
    # Copier images
    if os.path.exists("images"):
        shutil.copytree("images", os.path.join(project_path, "Images"), dirs_exist_ok=True)
        print("✅ Images copiées")
    
    # Copier configs
    config_files = ["CONFIG_COSMETICS.json", "CONFIG_GAME.json"]
    for config in config_files:
        if os.path.exists(config):
            shutil.copy(config, os.path.join(project_path, "Resources"))
    
    print("✅ Assets copiés")

def setup_git_repo():
    """Initialiser repository Git"""
    print("\n🔧 Configuration Git...")
    
    if os.path.exists(".git"):
        print("ℹ️  Repository Git déjà initialisé")
        return
    
    subprocess.run(["git", "init"])
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "Initial commit - Fail Frenzy by Grouptechflow"])
    
    print("✅ Repository Git initialisé")

def print_next_steps():
    """Afficher les prochaines étapes"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         ✅  SETUP TERMINÉ !                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📚 PROCHAINES ÉTAPES:

1. Ouvrir Unity Hub
2. Ajouter le projet: ./FailFrenzy
3. Ouvrir le projet avec Unity 2022 LTS
4. Importer les packages requis:
   - Unity Input System
   - Unity IAP
   - Firebase SDK
   - AdMob SDK
5. Lire PHASE_1_2_3_GUIDE.md
6. Commencer le développement !

📖 DOCUMENTATION:
   - PHASE_1_2_3_GUIDE.md - Guide de développement
   - DEVELOPER_INSTRUCTIONS.md - Instructions complètes
   - GAME_ARCHITECTURE_ADVANCED.md - Architecture
   - README.md - Vue d'ensemble

💡 SUPPORT:
   Email: support@grouptechflow.com
   Discord: Grouptechflow Community

🚀 BON DÉVELOPPEMENT !

    """)

def main():
    """Fonction principale"""
    print_banner()
    
    # Vérifier les prérequis
    if not check_prerequisites():
        print("⚠️  Installez les prérequis manquants avant de continuer.")
        sys.exit(1)
    
    # Menu interactif
    print("Que souhaitez-vous faire?\n")
    print("1. Setup complet (recommandé)")
    print("2. Créer uniquement le projet Unity")
    print("3. Configurer la structure de dossiers")
    print("4. Copier les scripts et assets")
    print("5. Quitter")
    
    choice = input("\nVotre choix (1-5): ")
    
    if choice == "1":
        create_unity_project()
        setup_project_structure()
        copy_scripts()
        copy_assets()
        setup_git_repo()
        print_next_steps()
    elif choice == "2":
        create_unity_project()
    elif choice == "3":
        setup_project_structure()
    elif choice == "4":
        copy_scripts()
        copy_assets()
    elif choice == "5":
        print("\n👋 À bientôt !")
        sys.exit(0)
    else:
        print("\n❌ Choix invalide")
        sys.exit(1)

if __name__ == "__main__":
    main()
