---
name: Patterns Validés
description: Code patterns, conventions, et solutions qui fonctionnent bien
type: feedback
---

## 🎯 Patterns à Suivre

### Code Organization
```
feature/
├── index.ts          - Exports publiques
├── types.ts          - Types/interfaces
├── service.ts        - Logique métier
├── controller.ts     - Gestion requêtes
└── __tests__/        - Tests
```

### Naming Conventions
- `camelCase` pour variables/fonctions
- `PascalCase` pour classes/components
- `SNAKE_CASE` pour constantes
- Noms descriptifs > courts

### Erreurs à Éviter
1. ❌ Code copié au lieu de réutilisé
2. ❌ Pas de types/linting
3. ❌ Logique sans tests
4. ❌ Décisions sans documentation
5. ❌ Secrets en dur dans le code

### Bonnes Pratiques Confirmées
- ✅ Batch requêtes indépendantes
- ✅ Documentation = économie de tokens
- ✅ Types stricts = moins de bugs
- ✅ Tests dès le départ = gain de temps

---
**Patterns ajoutés:** 0 | **Dernière maj:** 2026-04-27
