## Mémoire Persistante - Projet AiLunaPro

> **Source autoritative du statut et de la roadmap : [`status.md`](status.md)**
> Toute consultation de l'état du projet ou de la prochaine étape doit commencer par ce fichier.

### À jour (lecture prioritaire)
- **[État du Projet & Roadmap A→J](status.md)** — modèle de maturité L0–L4, roadmap autoritative, **Phase Workflow Contract anti-skip**
- [Préférences Dev](preferences.md) — comment l'utilisateur aime travailler

### Fondations (référence)
- [Architecture Projet](architecture.md) — principes architecturaux
- [Patterns Validés](patterns.md) — ce qui fonctionne, à réutiliser
- [Leçons Apprises](lessons.md) — erreurs évitées, optimisations
- [Documentation Notion](notion_documentation.md) — référence externe

### Historique (superseded)
- [Phases Corrigées (v2 — superseded)](phases_corrected.md) — ancienne roadmap 12 phases, gardée pour traçabilité. **La nouvelle séquence autoritative est A→J dans `status.md`.**

### Documents exportables
- [`docs/AiLunaPro-Architecture-And-Status.md`](../docs/AiLunaPro-Architecture-And-Status.md) — version exportable Notion, miroir de `status.md`

---

## État courant (2026-07-20)

**EN PRODUCTION.** Branche `main` — remote `github.com/andrecedrick/AiLunaPro`, HEAD `cf5f230`.
- Frontend Pages `audit.ailunapro.com` (deploy `56910706`, commit `cf5f230`) · Worker `api.ailunapro.com` (version `366460c2`).
- Firebase Auth+Firestore réels · Stripe réel (test) · Emails Sequenzy réels.
- **Programme Quote-to-Cash — ✅ PROD-VERIFIED (2026-07-20)** : devis V2, factures+PDF, Stripe, accès public reçus, page reçu client, branding, Admin Center, platform visibility. Preuve : Pages deploy `56910706` ⇐ `cf5f230` ; Worker `366460c2`. (cahier §0bis.2)
- Roadmap A→J d'avril = **livrée/archivée**. Détail item-par-item : voir `status.md` §1.

## Règles globales (extrait du Phase Workflow Contract — TOUJOURS actif)

1. **Une phase = un objectif.** Pas de bundle.
2. **Une phase approuvée = un commit** sur `main`. Pas de push sans demande.
3. **Quatre portes** avant la phase suivante : reviewed → validated → summarized → committed.
4. **Pre-flight obligatoire** : fichiers à créer/modifier, fichiers non touchés, pourquoi cette phase maintenant.
5. **Post-flight obligatoire** : fichiers changés, complété, restant, recommandation de commit.

Voir `status.md` §8/§9 pour la version complète.

---

**Dernière maj :** 2026-07-20 — v4 (reconciliation post-recovery : état prod July, Quote-to-Cash, migration GitHub)
