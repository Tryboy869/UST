# Universal Script Tester (UST)

Une plateforme web simple pour tester rapidement des scripts JavaScript et Python dans des environnements isolés.

## Démo

🔗 **URL en ligne :** https://ust-7isa.onrender.com/

## Fonctionnalités

- Éditeur de code avec coloration syntaxique (Monaco Editor)
- Support JavaScript (VM isolée) et Python (subprocess)
- 5 thèmes d'éditeur : VS Dark, VS Light, High Contrast, GitHub Dark, Monokai
- Console temps réel avec historique
- Import/Export de fichiers
- Interface responsive

## Limitations

- Scripts légers uniquement (timeout 5 secondes, 10KB max)
- Modules Python restreints (pas d'imports système)
- Sessions temporaires (5 minutes d'inactivité)
- Hébergement gratuit (performances variables)

## Installation locale

```bash
# Cloner le repo
git clone https://github.com/Tryboy869/UST.git
cd UST

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

**Prérequis :** Node.js 18+ et Python 3.x installés sur le système.

## Architecture modulaire

Le fichier `app.js` contient 6 modules autonomes :

### Module 1 : Interface (Frontend)
- **Localisation :** Ligne 10-520 (HTML intégré)
- **Responsabilité :** Interface utilisateur, Monaco Editor, gestion des thèmes
- **Technologies :** HTML, CSS (Tailwind), JavaScript frontend

### Module 2 : Security Gateway
- **Localisation :** Ligne 525-580  
- **Responsabilité :** Validation du code, détection patterns dangereux, audit logs
- **Fonction principale :** `SecurityGateway.validateCode()`

### Module 3 : JavaScript Runtime
- **Localisation :** Ligne 585-650
- **Responsabilité :** Exécution JavaScript dans VM isolée
- **Fonction principale :** `JavaScriptRuntime.execute()`

### Module 4 : Python Runtime  
- **Localisation :** Ligne 655-720
- **Responsabilité :** Exécution Python via subprocess isolé
- **Fonction principale :** `PythonRuntime.execute()`

### Module 5 : Session Database
- **Localisation :** Ligne 725-770
- **Responsabilité :** Gestion sessions temporaires, historique, cleanup automatique
- **Classe principale :** `SessionDatabase`

### Module 6 : Orchestrator
- **Localisation :** Ligne 775-820
- **Responsabilité :** Coordination inter-modules, workflow d'exécution
- **Fonction principale :** `Orchestrator.executeCode()`

## Contribution

### Zones de contribution identifiées

**Nouveaux runtimes (Module 4 pattern)**
- Ajouter support Go, Rust, ou autres langages
- Suivre le pattern `Runtime.execute()` existant

**Améliorations sécurité (Module 2)**
- Étendre les patterns de validation
- Améliorer la détection de code malveillant

**Interface utilisateur (Module 1)**
- Nouveaux thèmes Monaco Editor
- Fonctionnalités d'accessibilité
- Optimisations mobile

**Performance (Module 6)**
- Optimiser l'orchestration
- Mise en cache intelligente
- Métriques de performance

### Guide de contribution

1. **Fork** le repository
2. **Identifier le module** concerné par votre modification
3. **Maintenir l'isolation** : éviter les dépendances croisées entre modules
4. **Tester** localement avant soumission
5. **Pull Request** avec description claire du module modifié

### Standards de code

- **Module autonome** : chaque module doit pouvoir être remplacé indépendamment
- **Communication via Orchestrator** : éviter les appels directs inter-modules  
- **Validation systématique** : tout input passe par Security Gateway
- **Gestion d'erreurs** : try/catch avec logs d'audit appropriés

## Déploiement

Le projet utilise Docker pour le déploiement :

```bash
# Build de l'image
docker build -t ust .

# Lancement local  
docker run -p 3000:3000 ust
```

Compatible avec Render, Railway, Fly.io ou tout hébergeur supportant Docker.

## Sécurité

- Validation stricte des inputs (regex patterns)
- Isolation des runtimes (VM pour JS, subprocess pour Python)
- Timeouts automatiques et limits de ressources
- Audit logging complet
- Utilisateur non-root dans les containers

## Licence

MIT License - Voir fichier [LICENSE](LICENSE) pour détails.

## Auteur

Développé par [Anzize Daouda](https://github.com/Tryboy869) - Projet d'apprentissage personnel.

## Changelog

**v1.1** (27/09/2025)
- Ajout de 5 thèmes d'éditeur
- Sauvegarde des préférences utilisateur
- Stabilité améliorée avec UptimeRobot

**v1.0** (24/09/2025)  
- Version initiale avec support JS/Python
- Architecture modulaire
- Interface responsive