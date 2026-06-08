> ⚠️ **OBSOLETE / SUPERSEDED — archived 2026-06-07.** The single authoritative source of truth is `docs/cahier-des-charges-v2.md` (§0bis Master Ledger). This file is reference-only and carries **no agreed scope**.

# AiLunaPro Audit — Architecture & Best Practices

> **Status snapshot:** Frontend UI ≈ 100 % complete (mock layer). Firebase foundation **locally prepared but unwired**. Backend, real Firestore reads/writes, payments, emails, tests, and deployment **not started**.
> **Last updated:** 2026-04-29
> **Branch:** `audit`
> **Version:** 3.0 — 5-level maturity model + roadmap A → J + Phase Workflow Contract
> **Authoritative status doc:** `memory/status.md` (this file is the exportable mirror)

---

## Status legend — 5-level maturity scale

The previous binary ✅/❌ was misleading: code can be *written* without being *live*. Statuses below now use 5 levels.

| Level | Symbol | Meaning |
|---|---|---|
| **L0** | ❌ | **Not started** — no work has begun |
| **L1** | 🟡 | **Locally prepared** — files / types / scaffolding exist in the repo, **not wired** to the running app |
| **L2** | 🟦 | **UI complete (mocked)** — feature visible & functional in the running app, but on the mock layer (`localStorage`) |
| **L3** | 🟧 | **Real integration coded** — real backend / Firebase / Stripe code exists, **not yet live** in the app |
| **L4** | ✅ | **Live** — feature works end-to-end against real data, deployable / usable |

**Definition of Done per level:**
- L1 → L2: a React component consumes the feature and a user can see/use it in the browser.
- L2 → L3: replacement code (Firebase/API/Stripe) is written and isolated behind a seam (`lib/*/storage.ts`, `services/*`).
- L3 → L4: the seam flips to the real code, tests pass, the app runs against real data.

---

## Vue d'ensemble du Projet

AiLunaPro Audit est un SaaS de gouvernance IA qui transforme l'audit en outil de pilotage, structuration et décision. Le projet suit une architecture multi-tenant scalable avec une stack moderne optimisée pour performance et maintenabilité.

**Approach actuel :** UI-first. Toute la couche présentation est construite avec un mock layer en `localStorage`. Le backend, la base de données et les services externes seront ajoutés ensuite avec des seams (joints) déjà préparés dans le code (`lib/*/storage.ts`, `context/*Context.tsx`).

---

## 1. Architecture Système

```
┌─────────────────────────────────────────────────────────────┐
│                    END USERS                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│   ✅ FRONTEND (React SPA) — DONE                            │
│   • React 19 + TypeScript strict + Vite 8                  │
│   • Client-side: Auth, Dashboard, Audit Flow, Reports,     │
│     Registry, Team — all UI complete                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│   ❌ BACKEND (Cloudflare Workers + Hono) — NOT STARTED      │
│   • Edge runtime, low latency, serverless                  │
│   • API endpoints, validation, business logic              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│   ❌ GOOGLE CLOUD ECOSYSTEM — NOT STARTED                   │
│   • Firestore: Multi-tenant document database              │
│   • Firebase Auth: Email/password + OAuth                  │
│   • Cloud Functions: Background jobs                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│   ❌ EXTERNAL SERVICES — NOT STARTED                        │
│   • Stripe: Payments & Subscriptions                       │
│   • SendGrid/Resend: Email delivery                        │
│   • PDF Generator: Real PDF export (currently print-only)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Technologique

### Frontend

- ✅ **Framework:** React 19 *(doc spec was 18 — upgraded)*
- ✅ **Language:** TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`)
- ✅ **Build Tool:** Vite 8
- ⚠️ **Styling:** Tailwind imported, but project uses **CSS variables + inline styles** for the dual light/dark theme. Tailwind not actively used.
- ✅ **State Management:** React Context + Custom Hooks
- ❌ **HTTP Client:** Fetch API + Custom wrapper *(no API layer yet)*
- ❌ **Testing:** Vitest + React Testing Library *(no tests written)*

### Backend

- ❌ **Runtime:** Cloudflare Workers
- ❌ **Framework:** Hono
- ❌ **Language:** TypeScript strict
- ❌ **Middleware:** Auth, CORS, error handling, logging
- ❌ **Validation:** Backend validators

### Database & Auth

- 🟡 **L1 — Database scaffolding:** `src/lib/firestore.ts` (35 lines), `src/types/firestore.ts` (≈ 500 lines), `firestore.rules` (≈ 377 lines) **exist locally but are imported nowhere in the running app**. Currently runs on `localStorage`.
- 🟡 **L1 — Auth scaffolding:** `src/lib/firebase.ts` (33 lines), `src/lib/firebase-auth.ts` (40 lines) **exist locally but are imported nowhere**. `AuthContext` runs the mock layer.
- 🟡 **L1 — Env templates:** `.env.example` and `.env.local` present.
- ❌ **L0 — Session Management:** JWT tokens + refresh tokens not implemented.

### Payments & External

- ❌ **Billing:** Stripe + Firebase Extension
- ❌ **Email:** SendGrid or Resend API
- ⚠️ **PDF Generation:** Print stylesheet only — no PDFKit
- ❌ **Deployment:** Cloudflare edge network

---

## 3. Structure Frontend

### Status table

| Path | Status | Notes |
|---|---|---|
| `components/ui/` | ✅ | Renamed from `shared/`. Has `Button`, `Badge` |
| `components/layout/` | ✅ | `Sidebar`, `Topbar` |
| `components/auth/` | ✅ | `AuthCard`, `FormField`, `RoleSelector` (Phase 8) |
| `components/dashboard/` | ✅ | KPI cards, score trend, etc. |
| `components/audit/` | ✅ | Multi-step questionnaire |
| `components/results/` *(scoring/)* | ✅ | Results display & interpretation |
| `components/reports/` | ✅ | Report list, detail, share view |
| `components/team/` | ✅ | `TeamTable`, `InviteModal`, `MemberMenu` (Phase 8) |
| `components/registry/` | ✅ | Registry CRUD UI (Phase 7) |
| `hooks/useAuth.ts` | ✅ | Implemented as `context/AuthContext.tsx` |
| `hooks/useOrganization.ts` | ⚠️ | Folded into `AuthContext` (org + members + roles) |
| `hooks/useFetch.ts` | ❌ | No API yet |
| `hooks/useLocalStorage.ts` | ⚠️ | Logic dispersed in `lib/*/storage.ts` per domain |
| `services/api.ts` | ❌ | |
| `services/auth.ts` | ❌ | No Firebase yet |
| `services/firestore.ts` | ❌ | |
| `services/stripe.ts` | ❌ | |
| `types/audit.ts` | ✅ | |
| `types/auth.ts` | ✅ | Covers user + organization (Phase 8) |
| `types/registry.ts` | ✅ | |
| `types/report.ts` | ⚠️ | Types dispersed in contexts; no dedicated file |
| `utils/validators.ts` | ❌ | Inline form validation only |
| `utils/formatters.ts` | ❌ | Inline date formatting |
| `utils/calculations.ts` | ✅ | Implemented as `lib/audit/scoring.ts` |
| `utils/error-handler.ts` | ❌ | |
| `pages/` | ✅ | All page-level components |
| `App.tsx` | ✅ | With auth gate, route outlet, providers |

---

## 4. Structure Backend

### Status: ❌ Not started

All entries below are pending:

| Path | Status |
|---|---|
| `routes/auth.ts` | ❌ |
| `routes/organizations.ts` | ❌ |
| `routes/audits.ts` | ❌ |
| `routes/reports.ts` | ❌ |
| `routes/billing.ts` | ❌ |
| `routes/registry.ts` | ❌ |
| `routes/team.ts` | ❌ |
| `middleware/auth.ts` | ❌ |
| `middleware/org-context.ts` | ❌ |
| `middleware/error-handler.ts` | ❌ |
| `middleware/logging.ts` | ❌ |
| `services/firestore.ts` | ❌ |
| `services/scoring.ts` | ❌ |
| `services/reports.ts` | ❌ |
| `services/email.ts` | ❌ |
| `services/stripe.ts` | ❌ |
| `services/auth.ts` | ❌ |
| `validators/*` | ❌ |
| `utils/errors.ts` | ❌ |
| `utils/logger.ts` | ❌ |
| `utils/env.ts` | ❌ |
| `types/index.ts` | ❌ |
| `index.ts` (Hono app init) | ❌ |

---

## 5. Modèle de Données — Firestore

### Status: 🟡 L1 — locally prepared (377-line `firestore.rules` + 500-line `src/types/firestore.ts` exist locally, **unwired**). Live data path still on `localStorage`.

Current localStorage keys (mock layer):

| Key | Mocked content | Replaces (Firestore path) |
|---|---|---|
| `ailunapro-session` | `AuthSession` object | Firebase Auth currentUser + custom claims |
| `ailunapro-orgs` | `Organization[]` | `/organizations/{orgId}` |
| `ailunapro-members` | `OrgMember[]` | `/organizations/{orgId}/members/{userId}` |
| `ailunapro-registry-items` | `RegistryItem[]` | `/organizations/{orgId}/registry/{itemId}` |
| `ailunapro-registry-seeded` | flag | (no equivalent) |
| (audit drafts) | `AuditDraft` | `/organizations/{orgId}/audits/{auditId}` |
| (reports) | `Report[]` | `/organizations/{orgId}/reports/{reportId}` |

**Collections to create:**

| Collection | Status |
|---|---|
| `organizations` | ❌ |
| `users` | ❌ |
| `subscriptions` | ❌ |
| `billing_events` | ❌ |
| `email_logs` | ❌ |
| `organizations/{id}/members` (subcoll.) | ❌ |
| `organizations/{id}/audits` (subcoll.) | ❌ |
| `organizations/{id}/answers` (subcoll.) | ❌ |
| `organizations/{id}/reports` (subcoll.) | ❌ |
| `organizations/{id}/registry` (subcoll.) | ❌ |
| `organizations/{id}/activity_logs` (subcoll.) | ❌ |

---

## 6. Règles de Sécurité & Accès

### Status

| Item | Status | Notes |
|---|---|---|
| Frontend role-based UI gating | ✅ | `currentMember.role === 'owner' \| 'admin'` controls invite + edit actions |
| 4 roles supported (owner / admin / member / billing) | ✅ | Phase 8 |
| Backend organization isolation | ❌ | No backend |
| JWT verification middleware | ❌ | No backend |
| Firestore security rules | ❌ | No Firestore |
| Frontend form validation | ⚠️ | Inline only — no shared validators |
| Backend input validation | ❌ | No backend |

---

## 7. Meilleures Pratiques

### Frontend

| Practice | Status | Notes |
|---|---|---|
| TypeScript strict, no `any` | ✅ | |
| Small, reusable components | ✅ | Button, Badge, FormField, RoleSelector, AuthCard, etc. |
| Custom hooks for complex logic | ✅ | `useAuth`, `useRoute`, `useAudit`, `useReports`, `useRegistry` |
| Error boundaries | ❌ | None — needed before backend integration |
| Loading states & skeletons | ❌ | Minimal inline "Loading…" only |
| Optimistic updates | ❌ | |

### Backend

❌ Not started — all entries pending.

### Database

❌ Not started — all entries pending.

### Testing

| Practice | Status |
|---|---|
| Unit tests (utils, validators, calculations) | ❌ |
| Integration tests (API + Firestore mocks) | ❌ |
| E2E tests (critical user flows) | ❌ |
| Type tests | ❌ |

---

## 8. Roadmap d'Implémentation

> **⚠ Note:** the original 11-phase roadmap was backend-first. The actual project followed a **UI-first** approach — equivalence is mapped below.

### Mapping: doc roadmap → actual project phases

| Doc Phase | Project Phase | Status | Commit |
|---|---|---|---|
| **1.** Firebase + Firestore Foundation | — | ❌ Not started | — |
| **2.** Backend Skeleton (Cloudflare Workers + Hono) | — | ❌ Not started | — |
| **3.** Frontend Setup & Auth | Project Phase 8 (UI only) | ⚠️ UI ✅ / Firebase ❌ | not committed |
| **4.** Dashboard Principal | Project Phase 2 | ✅ Done | committed |
| **5.** Audit Flow | Project Phase 3 | ✅ Done | committed |
| **6.** Scoring Engine | Project Phase 4 | ✅ Done | committed |
| **7.** Post-Audit Assistance | Project Phase 5 | ✅ Done | committed |
| **8.** Reports & Export | Project Phase 6 | ⚠️ Templates + print ✅ / PDF ❌ / email ❌ | committed |
| **9.** AI Registry Module | Project Phase 7 | ✅ Done | committed |
| **10.** Multi-Tenant & Team | Project Phase 8 | ⚠️ Team UI ✅ / activity logs ❌ / audit trail ❌ | not committed |
| **11.** Billing & Deployment | — | ❌ Not started | — |

### Detailed status per doc phase

#### Phase 1 — Firebase + Firestore Foundation ❌
- ❌ Setup Firebase project, authentication
- ❌ Design & implement Firestore schema
- ❌ Security rules (basic + testing)
- ❌ User & org models

#### Phase 2 — Backend Skeleton ❌
- ❌ Setup Cloudflare Workers + Hono
- ❌ Auth middleware & JWT
- ❌ Organization context middleware
- ❌ Error handling standardization

#### Phase 3 — Frontend Setup & Auth ⚠️
- ✅ React + TypeScript + Vite setup *(React 19 + Vite 8)*
- ✅ Login/register flows *(UI only — mock auth)*
- ✅ Context providers (auth, org)
- ✅ Protected routes *(frontend auth gate only)*
- ❌ Firebase Auth wiring

#### Phase 4 — Dashboard Principal ✅
- ✅ Main dashboard layout
- ✅ Score display widgets
- ✅ Risk level indicators
- ✅ Recent audits list

#### Phase 5 — Audit Flow ✅
- ✅ Multi-step questionnaire UI
- ✅ Question types (multi-choice, rating, text)
- ✅ Progress tracking
- ✅ Save & resume functionality *(via localStorage)*

#### Phase 6 — Scoring Engine ✅
- ✅ Answer validation logic
- ✅ Score calculation algorithm
- ✅ Sub-scores & weights
- ✅ Risk assessment logic
- ✅ Maturity level determination

#### Phase 7 — Post-Audit Assistance ✅
- ✅ Results interpretation
- ✅ Findings display
- ✅ Recommendations engine
- ✅ Action plan generation
- ✅ Next steps guidance

#### Phase 8 — Reports & Export ⚠️
- ✅ Report generation templates
- ⚠️ PDF export *(print stylesheet only — no real PDF)*
- ❌ Email delivery
- ✅ Print functionality
- ✅ Shared reports (Pro tier)

#### Phase 9 — AI Registry Module ✅
- ✅ Registry item CRUD
- ✅ Risk classification
- ✅ Department tracking
- ✅ Tool approval workflow
- ✅ Registry dashboard

#### Phase 10 — Multi-Tenant & Team ⚠️
- ✅ Team member management *(UI)*
- ✅ Invitations & roles *(UI — pending state mocked)*
- ⚠️ Shared resources *(UI scaffolded; no backend isolation)*
- ❌ Activity logging
- ❌ Audit trail

#### Phase 11 — Billing & Deployment ❌
- ❌ Stripe integration
- ❌ Subscription management
- ❌ Billing portal
- ❌ Webhook handling
- ❌ Production deployment
- ❌ Monitoring setup

---

## 9. Métriques de Qualité

### Code Quality

| Item | Status |
|---|---|
| TypeScript strict mode enabled | ✅ |
| No `any` types without justification | ✅ |
| Linting via ESLint | ⚠️ Default Vite ESLint only |
| Code formatting via Prettier | ❌ |

### Testing Coverage

| Item | Status |
|---|---|
| Unit tests: 70%+ coverage | ❌ |
| Integration tests: critical flows | ❌ |
| E2E tests: happy path + key failure scenarios | ❌ |

### Performance

| Item | Status |
|---|---|
| Frontend: Lighthouse score 90+ | ❌ Never measured |
| Backend: Response time < 200ms (p95) | ❌ No backend |
| Firestore: Indexed queries < 50ms | ❌ No Firestore |

### Security

| Item | Status |
|---|---|
| No secrets in code | ✅ |
| CORS properly configured | ❌ No backend |
| Input validation on all endpoints | ❌ No backend |
| Rate limiting enabled | ❌ No backend |

---

## 10. Checklist Pré-Développement

| Item | Status |
|---|---|
| Firebase project created & configured | ❌ |
| Firestore database created | ❌ |
| Firebase auth enabled | ❌ |
| Environment variables documented | ❌ |
| Cloudflare account & workers namespace ready | ❌ |
| Stripe test account setup | ❌ |
| SendGrid API key obtained | ❌ |
| TypeScript configuration validated | ✅ |
| Git repository initialized | ✅ |
| CI/CD pipeline configured | ❌ |
| Team access & permissions set | ❌ |
| Development, staging, production environments ready | ❌ |
| Logging & monitoring tools configured | ❌ |
| Security audit completed | ❌ |

---

## 11. Current true project state

> Cette section est la **vérité brute** sur l'état du projet à la date de révision.

- ✅ **Le prototype UI/produit frontend est très avancé** — 7 phases UI livrées sur la branche `audit`, type-check propre, theme light/dark, persistance `localStorage`.
- 🟡 **Une fondation Firebase est préparée localement** — `src/lib/firebase.ts`, `src/lib/firebase-auth.ts`, `src/lib/firestore.ts` existent mais ne sont **importés nulle part** dans l'app qui tourne.
- 🟡 **Les types Firestore sont préparés localement** — `src/types/firestore.ts` (≈ 500 lignes), aucun consommateur.
- 🟡 **Les règles Firestore sont préparées localement** — `firestore.rules` (≈ 377 lignes), jamais déployées.
- 🟦 **Auth / Org / Team / Registry / Audit / Reports sont en mode UI mocké** — fonctionnent contre `localStorage`.
- ❌ **Firebase Auth réel : pas en service.**
- ❌ **Firestore reads/writes réels : pas en service.**
- ❌ **Backend (Cloudflare Workers + Hono) : aucune route.**
- ❌ **Stripe / emails / tests / déploiement : 0 %.**
- 🚫 **La production-readiness n'est pas atteinte.**

### Dette technique critique (avant intégration backend)

- Aucun error boundary — une erreur Firebase plantera toute l'app
- Aucun loading skeleton — l'UX réseau sera laide
- `alert()` et `confirm()` partout — pas de toasts
- Aucun test sur le scoring engine — régression silencieuse possible à la migration

### Seams déjà préparés pour la bascule

Ces fichiers sont conçus pour être remplacés sans toucher aux composants :

- `src/lib/auth/storage.ts` → bascule vers Firebase SDK (étape E)
- `src/lib/registry/storage.ts` → Firestore (étape F)
- `src/lib/reports/storage.ts` → Firestore (étape F)
- `src/context/AuthContext.tsx` → garder l'API publique `useAuth()`, ne changer que les implémentations de `login`/`signup`/`logout`

---

## 12. Roadmap autoritative — séquence A → J (v4)

Cette séquence remplace l'ancienne roadmap 11 phases. **Chaque étape doit valider sa Definition of Done et être commitée avant la suivante** (voir §13 dependency table et §15 Phase Workflow Contract).

### Table récapitulative

| Étape | Objectif | Bloqué par |
|---|---|---|
| **A** | Commit de la phase approuvée (Phase 8 — Auth/Org/Team UI) | — |
| **B** | Contrats de données et alignement de types | A |
| **C** | Tests critiques (Vitest + RTL) | B |
| **D** | Frontend hardening (D1–D4) | C |
| **D1** | Error boundaries | C |
| **D2** | Loading / skeleton states | D1 |
| **D3** | Toasts + retrait `alert`/`confirm` | D2 |
| **D4** | Validators et formatters partagés | D3 |
| **E** | Firebase Auth + Firestore réel (Account/Org/Team) | D |
| **E2** | Firestore rules live + access test matrix *(NEW v4)* | E |
| **F** | Firestore réel (Audits/Reports/Registry) | E2 |
| **F.1** | Migration Registry | E2 |
| **F.2** | Migration Audits | F.1 |
| **F.3** | Migration Reports | F.2 |
| **G** | Backend skeleton — Cloudflare Workers + Hono *(MOVED before Billing en v4)* | F |
| **H** | Settings UI | G |
| **I** | Billing UI + Stripe réel | H |
| **J** | Déploiement, monitoring, production hardening | I |

### Détail par étape (avec DoR / DoD)

> Conventions : **DoR** = Definition of Ready. **DoD** = Definition of Done. Source autoritative complète : `memory/status.md` §4.

#### A — Commit de la phase approuvée
- **DoR :** Phase 8 terminée, type-check propre, pre-flight rempli.
- **Tâches :** `git add` 14 fichiers + 3 modifications, commit `feat: add auth, organization, and team ui with role-based access (mock layer)`. Pas de push.
- **DoD :** `git status` propre, commit visible, post-flight rempli.

#### B — Contrats de données et alignement de types
- **DoR :** A commitée, `tsc --noEmit` propre.
- **Tâches :** créer `src/types/api.ts`, aligner `AuthSession` / `RegistryItem` / `AuditDraft` / `Report` avec `src/types/firestore.ts`, documenter le mapping localStorage ↔ Firestore.
- **DoD :** `tsc --noEmit` propre, aucun composant React modifié, mapping documenté.

#### C — Tests critiques
- **DoR :** B commitée, types stables.
- **Tâches :** setup Vitest + RTL + jsdom, tests unitaires (`computeAuditResult`, `filterRegistry`, validations), tests d'intégration légers (login → dashboard, audit → result), script `npm test`.
- **DoD :** `npm test` passe à 100 %, scoring engine couvert ≥ 90 %, suite headless.

#### D — Frontend hardening (D1 → D4)
- **DoR globale :** C commitée, tests verts.

##### D1 — Error boundaries
- **Tâches :** `ErrorBoundary` racine + par page, UI fallback avec bouton "Recharger".
- **DoD D1 :** une erreur lancée volontairement n'écrase plus l'app, logs visibles en console.

##### D2 — Loading / skeleton states
- **Tâches :** composant `Skeleton`, remplacer `Loading…` inline par skeletons typés, exposer `isLoading` par contexte.
- **DoD D2 :** aucun string `"Loading…"` dans `src/`, chaque page de données a un skeleton.

##### D3 — Toasts + retrait `alert`/`confirm`
- **Tâches :** `Toast` + `ToastProvider` + `useToast()`, composant `ConfirmDialog`, migration de tous les `alert(...)` et `confirm(...)`.
- **DoD D3 :** grep `alert(` / `confirm(` dans `src/` ne trouve rien, UX cohérente avec le design system.

##### D4 — Validators et formatters partagés
- **Tâches :** `src/utils/validators.ts` (`validateEmail`, `validatePassword`, `validateOrgName`, …), `src/utils/formatters.ts` (`formatDate`, `formatScore`, …), migrer Login / Signup / Invite / Registry.
- **DoD D4 :** plus de regex de validation dispersée, plus de formatage de date inline, tests unitaires sur les validators ≥ 90 %.

- **DoD globale D :** D1+D2+D3+D4 validés, `npm test` vert, app gère gracieusement une erreur réseau simulée.

#### E — Firebase Auth + Firestore réel (Account/Org/Team)
- **DoR :** D commitée, `.env.local` configuré, feature-flag strategy en place (cf. §14).
- **Tâches :** wirer `firebase.ts` à `AuthContext`, `resolveLayer('auth')`, remplacer `login`/`signup`/`logout` quand flag = `'firebase'`, migrer `organizations` + `members` vers Firestore, émulateur configuré.
- **DoD :** app tourne en `VITE_AUTH_LAYER=firebase` (signup/login/logout/switch org), aussi en mode `mock` sans régression, tests verts dans les deux modes, aucune fuite entre orgs (test 2 comptes / 2 orgs).

#### E2 — Firestore rules live + access test matrix *(NEW)*
- **DoR :** E commitée, auth Firebase live, `firestore.rules` revues.
- **Tâches :** déployer `firestore.rules` (dev/staging), construire la matrice d'accès (owner/admin/member/billing × son-org/autre-org), implémenter via Firebase Rules Test Suite, sauvegarder dans `docs/firestore-access-matrix.md`.

  Matrice attendue :

  | Acteur | Cible | Opération |
  |---|---|---|
  | owner | son org | read + write |
  | admin | son org | read + write (sauf billing) |
  | member | son org | read |
  | billing | son org | billing fields only |
  | owner | autre org | denied |
  | anonyme | n'importe quoi | denied |

- **DoD :** chaque cellule de la matrice testée, 100 % vert contre l'émulateur, règles déployées en dev, doc de la matrice en place.

#### F — Firestore réel (Audits/Reports/Registry)
- **DoR :** E2 commitée, règles actives et validées, matrice d'accès verte.
- **Sous-phases :** un commit par domaine.
  - **F.1 — Registry :** wirer `lib/registry/storage.ts` aux appels Firestore, `resolveLayer('registry')`. DoD : CRUD complet vert en mode Firebase, mock fonctionnel.
  - **F.2 — Audits :** migrer `AuditContext` (drafts + answers), `resolveLayer('audit')`. DoD : flux complet vert.
  - **F.3 — Reports :** migrer `ReportsContext`, `resolveLayer('reports')`. DoD : liste/détail/share verts.
- **DoD globale F :** F.1+F.2+F.3 verts, app tourne en `VITE_DATA_LAYER=firebase` global, aucune régression vs mode mock, journal de migration dans `docs/firebase-migration-log.md`.

#### G — Backend Cloudflare Workers + Hono (skeleton) *(MOVED en v4)*
- **DoR :** F commitée — Firestore réel sur tous les domaines métier. Compte Cloudflare configuré, Wrangler installé.
- **Tâches :** setup `wrangler.toml`, init Hono `src/server/index.ts`, middleware essentiels (CORS, auth JWT via Firebase Admin, org-context, error-handler, structured logging), routes squelette (`/api/audits/:id/submit`, `/api/reports/:id/export`, `/api/team/invite`, `/api/stripe/webhook` placeholder).
- **DoD :** frontend hit le backend en local (`wrangler dev`), middleware auth refuse les requêtes sans token Firebase, logs structurés visibles, doc `docs/backend-routes.md` à jour.

#### H — Settings UI
- **DoR :** G commitée, opérations sensibles (changement password, suppression org) ont une route backend.
- **Tâches :** profil utilisateur, paramètres org, préférences (thème, langue, notifications), routes `settings/profile`, `settings/org`, `settings/preferences`, réutilisation `RoleSelector` / `FormField` / `ConfirmDialog`.
- **DoD :** 3 pages accessibles depuis sidebar, modifications persistent dans Firestore, suppression d'org demande confirmation forte, tests d'intégration verts.

#### I — Billing UI + Stripe réel
- **DoR :** H commitée, compte Stripe (test) configuré, webhook endpoint backend prêt.
- **Tâches :** aperçu plan actuel, sélecteur de plan, Stripe Elements, historique factures, page utilisation/quota, webhook `/api/stripe/webhook` complet → Firestore.
- **DoD :** souscription en mode test Stripe fonctionnelle, webhook met à jour le plan dans Firestore, rôles `billing` / `owner` correctement gatés, aucune fuite de clés en frontend.

#### J — Déploiement, monitoring, production hardening
- **DoR :** I commitée, tous les flags `VITE_*_LAYER=firebase` en prod, audit de sécurité passé.
- **Tâches :** build prod (Vite) sur Cloudflare Pages/Vercel, Workers en prod, Firestore prod, webhooks Stripe live, logs + Sentry, monitoring uptime/perf/erreurs, CI/CD GitHub Actions, audit Lighthouse 90+, plan staging/prod/dev.
- **DoD :** URL publique HTTPS, parcours user complet (signup → audit → paiement → PDF) fonctionnel, Sentry capture erreurs frontend, CI bloque les PR cassées, runbook documenté.

> **Source autoritative complète :** `memory/status.md` §4

---

## 13. Dependency table — graphe DAG strict

Aucune phase ne peut démarrer si un prérequis n'est pas vert.

| Phase | Dépend de | Pourquoi |
|---|---|---|
| **A** | — | Première étape — nettoyage de l'arbre git |
| **B** | A | Baseline git stable pour ajouter les contrats sans mélanger avec Phase 8 |
| **C** | B | Tests s'écrivent contre des types stables |
| **D** | C | Tests servent de filet pendant les refactors |
| **D1** | C | Boundary affecte la racine — fait en premier |
| **D2** | D1 | Skeletons remplacent des états qui peuvent lever des erreurs (D1 doit être en place) |
| **D3** | D2 | Toasts remplacent `alert`/`confirm` ; bénéficient des boundaries |
| **D4** | D3 | Validators consommés par les composants déjà migrés |
| **E** | D | Hardening rend les erreurs Firebase survivables |
| **E2** | E | Règles testables uniquement avec une vraie collection |
| **F** | E2 | Rules protectives doivent être actives avant migration des domaines métier |
| **F.1** | E2 | Registry est isolé, bon candidat pilote |
| **F.2** | F.1 | Audits dépendent du registre |
| **F.3** | F.2 | Reports consomment les audits |
| **G** | F | Backend opère sur Firestore — collections doivent être vivantes |
| **H** | G | Settings expose des opérations qui passent par le backend |
| **I** | H | Billing s'appuie sur la page profil + webhooks backend |
| **J** | I | Déploiement = tout doit être stable et testé |

**Règle de blocage :** si la DoD d'une phase n'est pas validée, la phase suivante reste bloquée. Pas de dérogation.

---

## 14. Stratégie de feature-flags pour la migration

Bascule **context-par-context** entre la couche mock (`localStorage`) et la couche réelle (Firebase).

### Variables d'environnement

| Variable | Valeurs | Rôle |
|---|---|---|
| `VITE_DATA_LAYER` | `'mock'` \| `'firebase'` | Default global |
| `VITE_AUTH_LAYER` | `'mock'` \| `'firebase'` | Override Auth/Org/Team |
| `VITE_REGISTRY_LAYER` | `'mock'` \| `'firebase'` | Override Registry |
| `VITE_AUDIT_LAYER` | `'mock'` \| `'firebase'` | Override Audits |
| `VITE_REPORTS_LAYER` | `'mock'` \| `'firebase'` | Override Reports |

**Default :** `'mock'` partout. Variable absente = `'mock'`.

### Resolver

À implémenter dans `src/lib/featureFlags.ts` (début de phase E) :

```ts
export type DataLayer = 'mock' | 'firebase';
export type Domain = 'auth' | 'registry' | 'audit' | 'reports';

export function resolveLayer(domain: Domain): DataLayer {
  const specific = import.meta.env[`VITE_${domain.toUpperCase()}_LAYER`];
  if (specific === 'firebase' || specific === 'mock') return specific;
  const global = import.meta.env.VITE_DATA_LAYER;
  if (global === 'firebase' || global === 'mock') return global;
  return 'mock'; // safe default
}
```

### Plan de bascule context-par-context

| Étape roadmap | Domaine basculé | Avant | Après |
|---|---|---|---|
| E   | Auth / Org / Team | mock | firebase |
| F.1 | Registry | mock | firebase |
| F.2 | Audits | mock | firebase |
| F.3 | Reports | mock | firebase |

Le mock reste fonctionnel comme fallback dev pendant au moins 2 phases après chaque bascule. Dépréciation progressive ensuite.

### Fallback runtime (résilience)

Pattern recommandé dans chaque `lib/*/storage.ts` ou contexte :

```ts
let layer = resolveLayer('auth');
if (layer === 'firebase') {
  try {
    await initFirebase();
  } catch (err) {
    console.warn('[featureFlags] Firebase init failed, falling back to mock:', err);
    layer = 'mock';
  }
}
```

### Scénarios de rollback

| Scénario | Action |
|---|---|
| Firebase down en dev | Bascule auto vers mock + bannière |
| Régression détectée après bascule | Modifier `.env.local` pour repasser en mock, redémarrer |
| Bug de migration non bloquant en staging | Garder firebase, hotfix dans la phase courante |
| Bug de migration bloquant en staging | Rollback de la phase + retour à mock |

> **Source autoritative complète :** `memory/status.md` §6

---

## 15. Phase Workflow Contract (règles anti-skip)

Cinq règles **contraignantes** pour empêcher de sauter des étapes ou d'introduire des erreurs silencieuses.

### Règle 1 — Une phase = un objectif
Une phase a un seul objectif nommé. Pas de bundle. Les sous-phases (D1–D4, F.1–F.3) suivent la même règle à leur niveau.

### Règle 2 — Une phase approuvée = un commit
- Un commit unique sur la branche `audit` à la fin de chaque phase.
- Pour les phases avec sous-étapes (D, F), un commit par sous-étape autorisé et recommandé.
- Message explicite (`feat: …`, `chore: …`, `docs: …`, `test: …`).
- Pas de push tant que l'utilisateur ne le demande pas.

### Règle 3 — Quatre portes avant la phase suivante
Pas de phase N+1 tant que la phase N n'est pas :
1. **Reviewed** — modifications relues, `tsc --noEmit` propre, tests verts si applicable.
2. **Validated** — l'utilisateur a explicitement approuvé.
3. **Summarized** — récap fichiers / résultats / restant (post-flight).
4. **Committed** — un seul commit (ou un par sous-étape) sur `audit`.

De plus, la phase N+1 ne peut démarrer que si **toutes ses dépendances dans la table §13 sont vertes**.

### Règle 4 — Pre-flight obligatoire (avant code)
- Lister les fichiers à **créer**.
- Lister les fichiers à **modifier**.
- Lister les fichiers explicitement **non touchés**.
- Énoncer **pourquoi cette phase vient maintenant** (préconditions, dépendances).
- Vérifier la **DoR** de la phase (§12).

### Règle 5 — Post-flight obligatoire (après code)
- **Fichiers changés** : liste exhaustive avec chemins.
- **Ce qui a été terminé** : items de la DoD, vérifiables.
- **Ce qui reste dans le scope initial** : oui/non avec justification.
- **Recommandation de commit** : oui / non / conditionnel.
- Vérifier la **DoD** de la phase (§12).

### Définition de "phase approuvée"
Une phase est approuvée uniquement si l'utilisateur écrit explicitement "OK approuvé", "validé", "approve commit", "go commit", ou équivalent.
- L'absence de réponse n'est pas une approbation.
- Une approbation partielle déclenche un *iteration loop*, pas une promotion à la phase suivante.

> **Source autoritative complète :** `memory/status.md` §8–9

---

## 16. Prochaine action recommandée

**Étape A — Commit Phase 8 (Auth + Org + Team UI)**

- Branche : `audit`
- 14 fichiers à `git add` + 3 modifications
- Message recommandé : `feat: add auth, organization, and team ui with role-based access (mock layer)`
- Pas de push.

Aucune nouvelle ligne de code à écrire pour cette étape.

---

## Historique des versions

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-04-27 | Document initial — Ready for development |
| 2.0 | 2026-04-29 | Status revision — frontend UI complete, backend pending |
| 3.0 | 2026-04-29 | Modèle de maturité L0–L4 + roadmap A→J + Phase Workflow Contract anti-skip. Mirror de `memory/status.md` v3 |
| 4.0 | 2026-04-29 | Corrections techniques : E2 ajouté, D1–D4 explicités, dependency table, DoR/DoD par phase, feature-flag strategy, Backend Skeleton repositionné avant Billing. Mirror de `memory/status.md` v4 |

---

**Document créé:** 2026-04-27
**Dernière mise à jour:** 2026-04-29 (v4)
**Branche:** `audit`
**Source autoritative :** `memory/status.md`
**Status global :** UI ≈ L2 — Firebase L1 — Backend / Stripe / Tests / Deploy L0
