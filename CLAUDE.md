# Instructions pour Claude - Projet AI

## 🎯 Objectifs Principaux
1. **Architecture optimisée** - Code propre, maintenable, scalable
2. **Zéro token gaspillé** - Requêtes concises, réutilisation de code
3. **Apprentissage continu** - Mémoire persistante, améliorations auto
4. **Excellence technique** - Design patterns, sécurité, performance
5. **Prévention d'erreurs** - Tests, linting, reviews automatiques

## 🏗️ Architecture du Projet
```
Projet AI/
├── .claude/              # Configuration Claude Code
│   ├── settings.json     # Permissions, hooks, env vars
│   └── scheduled-tasks/  # Tâches automatisées
├── src/                  # Code source principal
├── tests/                # Tests unitaires & intégration
├── docs/                 # Documentation
├── config/               # Fichiers de configuration
└── memory/               # Mémoire persistante Claude
    ├── MEMORY.md         # Index des mémoires
    ├── architecture.md   # Décisions d'architecture
    ├── lessons.md        # Leçons apprises
    └── patterns.md       # Patterns validés
```

## 📋 Approche de Développement

### Phase 1: Planning (Minimiser contexte)
- Lire la mémoire pertinente
- Vérifier les patterns établis
- Poser questions précises

### Phase 2: Exécution (Optimisé)
- Batch les opérations indépendantes
- Réutiliser le code existant
- Suivre les conventions établies

### Phase 3: Validation
- Vérifier avant de commiter
- Documenter les décisions
- Mettre à jour la mémoire

## 🧠 Apprentissage Auto
- **Chaque erreur** → Leçon documentée en mémoire
- **Chaque pattern validé** → Ajouté aux bonnes pratiques
- **Chaque décision d'architecture** → Documentée avec rationale
- **Feedback utilisateur** → Intégré aux préférences

## 🔐 Sécurité & Qualité
- No sensitive data in code (API keys in .env)
- Type checking obligatoire
- Security review automatique avant merge
- Architecture review pour les changements majeurs

## ⚡ Optimisation Tokens
- Préférer la réutilisation au copier-coller
- Batch les requêtes associées
- Documenter = éviter les explications répétées
- Tests automatiques = moins de debugging manual

## 📌 À Mémoriser
Chaque conversation, je lirai:
1. MEMORY.md (index)
2. Fichiers pertinents pour la tâche
3. Patterns.md (conventions à suivre)

---
**Mise à jour:** 2026-04-27 | **Version:** 1.0
