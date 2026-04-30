# Phases Corrigées — Cahier de Charge v2 *(SUPERSEDED)*

> ⚠️ **Ce document est superseded** depuis 2026-04-29.
> La roadmap autoritative est désormais la **séquence A→J** documentée dans [`status.md`](status.md) §4.
>
> Ce fichier est conservé pour traçabilité et pour comprendre l'historique des décisions de découpage.
> **Ne pas l'utiliser comme source de vérité** — toute prochaine phase doit suivre `status.md`.
>
> Mapping ancien ↔ nouveau : voir `status.md` §5.

---

**Source originale :** Mise à jour cahier de charge.md (2026-04-27)
**Rationale d'origine :** Optimisé pour Claude Code — séquençage plus étroit, moins d'ambiguïté
**Status :** SUPERSEDED par `status.md` v3 (2026-04-29)

---

## Phase 0 — Stabilisation Environnement Local

**Objectif:** Assurer que Claude Code travaille uniquement sur le repo local, branche audit.

**Livrables:**
- Repo local fonctionnel
- Branche `audit` active
- `npm install` + `npm run dev` OK
- Pas de dépendance à session cloud ancienne

**Pourquoi:** Historique de blocage push lié au proxy Claude Code.

---

## Phase 1A — Config Firebase

**Objectif:** Fichiers TypeScript pour initialiser Firebase, Firestore, Auth proprement.

**Livrables:**
- `src/lib/firebase.ts` - init Firebase
- `src/lib/firestore.ts` - client Firestore
- `src/lib/firebase-auth.ts` - Auth client
- `.env.example` - template variables
- Possible: `src/types/firebase.ts`

**Règles:**
- Aucun secret hardcodé
- Structure modulaire
- Aucune UI métier
- Aucune route backend

---

## Phase 1B — Modèle Firestore

**Objectif:** Traduire modèle SaaS en structure Firestore claire.

**Collections Principales:**
```
organizations
users
subscriptions
billing_events
email_logs
```

**Sous-collections:**
```
organizations/{orgId}/members
organizations/{orgId}/audits
organizations/{orgId}/audits/{auditId}/answers
organizations/{orgId}/reports
organizations/{orgId}/registry
organizations/{orgId}/exports
organizations/{orgId}/activity_logs
```

**Livrables:**
- Types TypeScript pour chaque document
- Champs requis, enums de statuts
- Timestamps standardisés

---

## Phase 1C — Stripe Extension Mapping

**Objectif:** Identifier comment "Run Payments with Stripe" extension s'insère dans le modèle.

**À clarifier:**
- Quelles collections Stripe extension remplit
- Mapping: `organization` ↔ `subscription`
- Mapping: `billing_events` ↔ Stripe webhooks
- Quels champs lire côté frontend plus tard
- Conventions de nommage à respecter

**Livrables:**
- Document de mapping
- Conventions de sécurité

---

## Phase 1D — Firestore Security Rules Logic

**Objectif:** Préparer logique d'accès avant d'écrire métier partout.

**Logique attendue:**
- Un user lit que son orga
- Owner/Admin/Member/Billing = permissions distinctes
- Collections backend-only (non-editables client)
- Stripe/billing = non-editable côté client

**Livrables:**
- Logique de règles (pas déployées)
- Liste des protections à appliquer phase suivante

---

## Phase 2 — Design Claude Import + Application

**Objectif:** Importer et appliquer réellement le design handoff Claude.

**Sections obligatoires:**
- Sidebar
- Topbar
- Hero summary
- KPI cards
- Score trend
- Recent audits
- Priority actions
- Assistance / next step

**Composants stables:**
- Card, Button, Badge
- StatCard, SidebarItem
- ScoreCard, RiskBadge, MaturityBadge
- PriorityActionCard, AutomationOpportunityCard
- BusinessImpactCard

**Règles:**
- Pas de dashboard admin générique
- Pas de simple tableau/summary
- Application fidèle du design

---

## Phase 3 — Mock Data Réalistes

**Objectif:** Dashboard parle réellement du produit SaaS d'audit IA.

**Dashboard doit refléter:**
- Score global
- Risque
- Maturité
- Findings
- Recent audits
- Priority actions
- Automation opportunities
- Business impact
- Next step

---

## Phase 4 — Flow d'Audit Multi-Étapes

**Objectif:** Créer le cœur fonctionnel du produit.

**Sections d'audit:**
- Profil
- Outils IA
- Données
- Gouvernance
- Sécurité
- Transparence/Conformité
- Supervision humaine
- Formation/Maturité

**Livrables:**
- Page "New Audit"
- Multi-step shell + navigation
- Progress bar
- Question renderer
- Result linking

---

## Phase 5 — Moteur de Scoring

**Objectif:** Transformer réponses audit en résultats exploitables.

**Livrables:**
- Score global
- Sous-scores
- Findings
- Recommandations
- Roadmap 30/60/90j

---

## Phase 6 — Assistance Post-Audit

**Objectif:** Dashboard comme outil d'action et conversion.

**Inclure:**
- Quoi corriger
- Quoi automatiser
- Pourquoi c'est important
- Impact apporté
- Prochaine étape

---

## Phase 7 — Rapports et Exports

**Objectif:** Créer sorties partageables.

**Livrables:**
- Report page + detail
- Email UI
- PDF export (architecture + UI)
- Print view
- Export history

---

## Phase 8 — Registre IA

**Objectif:** Module de registre des systèmes IA.

**Champs:**
- Outil
- Département
- Finalité
- Données
- Statut
- Risque
- Supervision humaine
- Mitigations

---

## Phase 9 — Auth / Organisation / Équipe UI

**Pourquoi si tard?**
D'abord avoir:
- Base de données propre
- Design stabilisé
- Dashboard crédible
- Logique métier principale

**Livrables:**
- Signup
- Login
- Org creation
- Team roles

---

## Phase 10 — Billing UI

**Pourquoi si tard?**
Extension Stripe existe, mais risque de construire trop tôt avant:
- UI métier stabilisée
- Modèle Firestore aligné

**Livrables:**
- Billing page
- Current plan
- Plan comparison
- Invoices list
- Manage subscription
- Upgrade CTA

---

## Phase 11 — Backend API Cloudflare Workers + Hono

**Pourquoi aussi tard?**
- Besoins sont clairs seulement après métier stable
- Mieux d'avoir API à la fin avec specs précises

**Livrables:**
- Routes Hono
- Middleware auth
- Org context
- Validation
- Logs
- Hooks pour scoring/reports/billing

---

## Phase 12 — Déploiement + Monitoring

**Objectif:** Passer en pré-production.

**Livrables:**
- Build prod
- Env staging/prod
- Logs + monitoring
- Tests minimum
- Review sécurité

---

## Corrections Majeures vs v1

| Aspect | v1 (Claude) | v2 (Cahier) |
|--------|-----------|-----------|
| Backend (Workers) | Phase 2 | Phase 11 |
| Firebase | 1 phase | 4 sous-phases (1A-D) |
| Design Import | Pas de phase | Phase 2 |
| Auth/Billing UI | Phase 3-4 | Phase 9-10 |
| Granularité | 11 phases | 12 phases |

---

**Notes:**
- v2 est plus séquencée pour Claude Code
- Réduit le périmètre par phase
- Protège contre les dérives
- Commence par la data
- Design devient source de vérité après Firebase

