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

## État courant (2026-07-23)

**EN PRODUCTION.** Branche `main` — remote `github.com/andrecedrick/AiLunaPro`, HEAD `125791e` (⚠️ 7 commits **non poussés**, `origin/main` @ `4d7b0cd`).
- Frontend Pages `audit.ailunapro.com` (deploy `d0e72640`, commit `125791e`) · Worker `api.ailunapro.com` (version `2434afbb`).
- Firebase Auth+Firestore réels · Stripe réel (test) · Emails Sequenzy réels · R2 · Turnstile · PostHog (A).
- **Photographie autoritative = cahier §25** (état prod + déploiements + registre de durcissement + roadmap propre + risques actifs).
- Quote-to-Cash ✅ prod-verified + **durcissement livré** : fail-closed auth, retryable Stripe credits, billing alerts, rollups mensuels, token observability, production alerts + notify, EN async split, Rocket Loader OFF, billing scope→Firestore. **CI écrit mais NON actif** (non poussé + secrets absents).
- **Gouvernance ouverte (non arbitrée)** : Luna-LLM vs guardrail no-LLM · tarification 4 actions dans-plan vs §23 (cahier §25.4).
- Roadmap A→J d'avril = **livrée/archivée**. Détail : `status.md` §1 + cahier §25.

## Règles globales (extrait du Phase Workflow Contract — TOUJOURS actif)

1. **Une phase = un objectif.** Pas de bundle.
2. **Une phase approuvée = un commit** sur `main`. Pas de push sans demande.
3. **Quatre portes** avant la phase suivante : reviewed → validated → summarized → committed.
4. **Pre-flight obligatoire** : fichiers à créer/modifier, fichiers non touchés, pourquoi cette phase maintenant.
5. **Post-flight obligatoire** : fichiers changés, complété, restant, recommandation de commit.

Voir `status.md` §8/§9 pour la version complète.

---

**Dernière maj :** 2026-07-20 — v4 (reconciliation post-recovery : état prod July, Quote-to-Cash, migration GitHub)
