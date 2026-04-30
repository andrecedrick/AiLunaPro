---
name: Décisions d'Architecture
description: Choix architecturaux clés du projet et leur rationale
type: project
---

## Principes Fondamentaux

### 1. Zéro Token Gaspillé
- **Principe:** Chaque requête doit être optimale
- **Pratique:** Batch opérations, réuse de code, documentation au lieu de clarification

### 2. Apprentissage Auto
- **Principe:** Le projet s'améliore chaque itération
- **Pratique:** Mémoire persistante, documentation des patterns, analyse des erreurs

### 3. Architecture Scalable
- **Principe:** Prêt pour la croissance dès le début
- **Pratique:** Separation of concerns, modulaire, testable

### 4. Excellence Technique
- **Principe:** Qualité > rapidité
- **Pratique:** Types/linting, tests, security reviews, architecture reviews

## Stack Technologique
À définir basé sur les besoins. Candidats:
- **Backend:** Node.js / Python / Go
- **Frontend:** React / Vue / Svelte
- **DB:** PostgreSQL / MongoDB
- **Outils:** Docker, GitHub Actions, Testing frameworks

## Structure des Dossiers
```
src/           - Code produit
  features/    - Features par domaine
  shared/      - Code partagé
  config/      - Configuration
tests/         - Tests (miroir src/)
docs/          - Documentation
config/        - Config deployement
.claude/       - Config Claude Code
memory/        - Mémoire persistante
```

---
**Créé:** 2026-04-27 | **Dernière révision:** —
