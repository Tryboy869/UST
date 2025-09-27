# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.1.0] - 27-09-2025

### Ajouté
- **Sélecteur de thèmes** : 5 thèmes d'éditeur disponibles
  - VS Dark (défaut)
  - VS Light
  - High Contrast  
  - GitHub Dark (thème personnalisé)
  - Monokai (thème personnalisé)
- **Sauvegarde des préférences** : le thème choisi est mémorisé automatiquement
- **Adaptation interface** : l'interface s'adapte automatiquement au thème sélectionné
- **Stabilité renforcée** : configuration UptimeRobot pour maintenir le service actif

### Amélioré
- Interface utilisateur plus flexible et personnalisable
- Expérience développeur améliorée avec thèmes populaires
- Temps d'arrêt réduits grâce au monitoring automatique

### Technique
- Intégration des thèmes personnalisés Monaco Editor
- Gestion localStorage pour la persistance des préférences
- Système de ping automatique pour éviter les coupures Render

## [1.0.0] - 24-09-2025

### Ajouté
- **Plateforme initiale** : Universal Script Tester opérationnel
- **Support multi-langages** :
  - JavaScript : exécution dans VM isolée
  - Python : exécution via subprocess sécurisé
- **Éditeur de code** : Monaco Editor avec coloration syntaxique
- **Console temps réel** : affichage des outputs avec historique
- **Gestion de fichiers** : import/export de scripts
- **Interface responsive** : compatible mobile et desktop
- **Architecture modulaire** : 6 modules isolés dans app.js
- **Sécurité intégrée** :
  - Security Gateway avec validation stricte
  - Patterns dangereux bloqués (eval, import os, etc.)
  - Timeouts 5 secondes maximum
  - Audit logs complets
- **Déploiement Docker** : containerisation avec Node.js + Python
- **Hébergement Render** : déploiement automatisé

### Sécurité
- Isolation complète entre les runtimes
- Validation systématique des inputs
- Utilisateur non-root dans les containers
- Limits de ressources strictes

### Performance
- JavaScript : ~3-5ms d'exécution
- Python : ~85ms pour algorithmes complexes
- Sessions temporaires de 5 minutes
- Cleanup automatique des ressources

---

**Format :** [Version] - Date (DD-MM-YYYY)  
**Types :** Ajouté, Amélioré, Corrigé, Supprimé, Sécurité, Technique