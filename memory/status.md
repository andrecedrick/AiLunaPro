---
name: État du Projet (autoritatif)
description: Source de vérité pour le statut, la roadmap A→J, la table de dépendances, les DoR/DoD, la stratégie de feature-flags, et le Phase Workflow Contract anti-skip
type: project
---

# État du Projet — AiLunaPro

> Ce fichier est la **source autoritative** du statut projet et de la roadmap.
> Toute mise à jour de phase ou de plan doit être consignée ici en premier.
>
> **Branche de travail :** `audit` — un seul thread de développement, pas de push sans demande explicite.
> **Dernière révision :** 2026-04-29 (v4 — corrections techniques : E2 ajouté, D1–D4 explicités, dependency table, DoR/DoD par phase, feature-flag strategy, Backend Skeleton repositionné avant Billing)

---

## 1. État réel actuel du projet (Current true project state)

- ✅ **Le prototype UI/produit frontend est très avancé** — 7 phases UI livrées, branche `audit`, type-check propre, theme light/dark, persistance `localStorage`.
- 🟡 **Une fondation Firebase est préparée localement** — `src/lib/firebase.ts`, `src/lib/firebase-auth.ts`, `src/lib/firestore.ts` existent mais ne sont **importés nulle part** dans l'app qui tourne.
- 🟡 **Les types Firestore sont préparés localement** — `src/types/firestore.ts` (≈ 500 lignes) couvre les collections cibles, mais aucun composant ne les consomme.
- 🟡 **Les règles de sécurité Firestore sont préparées localement** — `firestore.rules` (≈ 377 lignes) existe à la racine, jamais déployées.
- 🟦 **Les couches Auth / Organisation / Team / Registry / Audit / Reports sont en mode UI mocké** — elles fonctionnent contre `localStorage`, pas contre Firestore.
- ❌ **L'intégration réelle Firebase Auth n'est pas en service** dans l'application.
- ❌ **Les lectures/écritures réelles Firestore ne sont pas en service** dans l'application.
- ❌ **Aucune route backend** (Cloudflare Workers + Hono) n'existe.
- ❌ **Stripe** : aucune intégration réelle.
- ❌ **Emails** (SendGrid/Resend) : aucune intégration.
- ❌ **Tests** (Vitest, RTL, E2E) : aucun.
- ❌ **Déploiement** : aucun environnement live.
- 🚫 **Le projet n'est pas prêt pour la production.**

---

## 2. Légende de maturité (5 niveaux)

Le statut binaire ✅/❌ est trompeur quand il y a du code écrit qui n'est pas encore vivant. On utilise désormais 5 niveaux :

| Niveau | Symbole | Sens |
|---|---|---|
| **L0** | ❌ | **Pas commencé** — aucun travail engagé |
| **L1** | 🟡 | **Préparé localement** — fichiers / types / scaffolding existent dans le repo, **pas wired** dans l'app qui tourne |
| **L2** | 🟦 | **UI complète (mockée)** — la feature est visible et fonctionnelle dans l'app, mais sur la couche mock (`localStorage`) |
| **L3** | 🟧 | **Intégration réelle codée** — le code backend / Firebase / Stripe est écrit, **pas encore vivant** dans l'app |
| **L4** | ✅ | **Live** — la feature fonctionne de bout-en-bout sur les vraies données, déployable / utilisable |

### Definition of Done par niveau

- **L1 → L2** : un composant React consomme la feature ; un user peut la voir et l'utiliser dans le navigateur.
- **L2 → L3** : du code de remplacement réel (Firebase / API / Stripe) est écrit, isolé derrière un *seam* (`lib/*/storage.ts`, `services/*`).
- **L3 → L4** : le seam bascule sur le vrai code via feature-flag (cf. §6), les tests passent, l'app fonctionne contre les vraies données.

---

## 3. Statut item-par-item (réalité actuelle)

| Domaine | Niveau | Détail |
|---|---|---|
| **Frontend setup** (Vite 8 + React 19 + TS strict) | ✅ L4 | Build clean, type-check clean |
| **Theme system** (light/dark, CSS vars) | ✅ L4 | |
| **Dashboard UI** | 🟦 L2 | Mock data |
| **Audit flow UI** | 🟦 L2 | Mock + localStorage |
| **Scoring engine** (`computeAuditResult`) | 🟦 L2 | Fonction pure, pas d'I/O — promotion vers L4 dès que la source de données passe au réel |
| **Post-audit assistance UI** | 🟦 L2 | |
| **Reports & export UI** | 🟦 L2 | Templates + print stylesheet ; PDF réel et email = L0 |
| **AI Registry UI** | 🟦 L2 | CRUD complet sur localStorage |
| **Auth / Org / Team UI** | 🟦 L2 | Phase 8 — non commitée à ce jour |
| **Firebase config client** (`src/lib/firebase.ts`) | 🟡 L1 | Aucun import nulle part |
| **Firebase Auth client** (`src/lib/firebase-auth.ts`) | 🟡 L1 | Aucun import nulle part |
| **Firestore client** (`src/lib/firestore.ts`) | 🟡 L1 | Aucun import nulle part |
| **Firestore types** (`src/types/firestore.ts`) | 🟡 L1 | ≈ 500 lignes, aucun import |
| **Firestore security rules** (`firestore.rules`) | 🟡 L1 | ≈ 377 lignes, jamais déployées |
| **Variables d'environnement** (`.env.example`, `.env.local`) | 🟡 L1 | Templates en place |
| **Backend Cloudflare Workers + Hono** | ❌ L0 | |
| **Stripe** | ❌ L0 | |
| **SendGrid / Resend** | ❌ L0 | |
| **Real PDF generator** | ❌ L0 | Print stylesheet ne compte pas |
| **Tests** (Vitest, RTL, E2E) | ❌ L0 | |
| **Settings UI** | ❌ L0 | |
| **Billing UI** | ❌ L0 | |
| **Activity logs / audit trail** | ❌ L0 | |
| **Error boundaries** | ❌ L0 | |
| **Loading skeletons** | ❌ L0 | |
| **Toast system** | ❌ L0 | `alert()` / `confirm()` partout |
| **Validators / formatters partagés** | ❌ L0 | Validation inline dispersée |
| **Feature-flag layer** | ❌ L0 | |
| **CI/CD** | ❌ L0 | |
| **Monitoring** | ❌ L0 | |
| **Déploiement** | ❌ L0 | |

---

## 4. Roadmap autoritative — séquence A → J (avec DoR / DoD)

Cette séquence est **stricte**. Chaque étape doit valider sa **Definition of Done** et être commitée avant d'autoriser la suivante. Les dépendances explicites sont en §5.

Conventions :
- **DoR** = Definition of Ready (préconditions vérifiables avant de démarrer)
- **DoD** = Definition of Done (sortie vérifiable avant d'autoriser la phase suivante)

---

### A — Commit de la phase approuvée en cours

**Objectif :** Stabiliser le travail validé avant tout nouveau code.

**DoR :**
- Phase 8 (Auth + Org + Team UI) terminée et type-check propre.
- L'utilisateur a validé le contenu de Phase 8.
- Pre-flight rempli : message de commit recommandé, liste des fichiers à staged.

**Tâches :**
- `git add` des 14 nouveaux fichiers + 3 modifications.
- Commit unique : `feat: add auth, organization, and team ui with role-based access (mock layer)`.
- **Pas de push.**

**DoD :**
- `git status` propre sur la branche `audit`.
- Commit visible dans `git log` avec le bon message.
- Post-flight rempli : récap des fichiers commités.

---

### B — Contrats de données et alignement de types

**Objectif :** Figer les *shapes* de données pour que la migration Firebase ne casse rien.

**DoR :**
- Phase A commitée (`git status` clean).
- Type-check global propre (`tsc --noEmit`).

**Tâches :**
- Créer `src/types/api.ts` avec les types request/response anticipés (auth, audits, reports, registry, team, billing).
- Aligner `AuthSession`, `RegistryItem`, `AuditDraft`, `Report` avec les types `src/types/firestore.ts` (Timestamps, Firebase UID, etc.).
- Documenter dans le code les correspondances `localStorage key → Firestore path`.
- Pas de logique métier, juste de la déclaration de types.

**DoD :**
- `tsc --noEmit` propre.
- Aucun composant React modifié (dégroupage strict).
- Tableau de correspondance localStorage ↔ Firestore documenté dans `src/types/api.ts` ou `src/types/firestore.ts`.
- Post-flight : fichiers créés/modifiés listés.

---

### C — Tests critiques

**Objectif :** Filet de sécurité avant toute migration backend.

**DoR :**
- Phase B commitée.
- Types stables (sinon les assertions de test casseront à la moindre évolution).

**Tâches :**
- Setup Vitest + React Testing Library + jsdom.
- Tests unitaires :
  - `computeAuditResult()` (le moteur de scoring — invariant absolu)
  - `filterRegistry()`
  - Validations de formulaires (login, signup, invite, registry)
- Tests d'intégration légers :
  - flux login → dashboard
  - flux audit → result
- Configurer un script `npm test` dans `package.json`.

**DoD :**
- `npm test` exécute la suite et passe à 100 %.
- Couverture documentée (au moins le scoring engine à ≥ 90 %).
- CI-ready (la suite peut tourner en headless).
- Post-flight : liste des cas couverts et non couverts.

---

### D — Frontend hardening

**Objectif :** Rendre l'UI résiliente avant qu'elle ne reçoive de vraies données réseau.

**DoR :**
- Phase C commitée et tests verts (sert de filet pour les refactors qui suivent).

**Sous-phases (D1 → D4) — ordre conseillé mais elles peuvent être commitées séparément ou groupées en un seul commit phase D, au choix de l'utilisateur :**

#### D1 — Error boundaries

**Tâches :**
- Composant `ErrorBoundary` racine (catche tout ce qui remonte).
- Boundary par page (sinon une erreur dans une page plante toute la nav).
- UI de fallback avec bouton "Recharger".

**DoD D1 :**
- Une erreur lancée volontairement dans une page n'écrase plus toute l'app.
- Logs d'erreur visibles en console (préparer le hook pour Sentry plus tard).

#### D2 — Loading / skeleton states

**Tâches :**
- Composant `Skeleton` réutilisable (rectangle + animation pulse).
- Remplacer les `Loading…` inline dans Dashboard, Reports, Registry, Team par des skeletons typés.
- État `isLoading` exposé par chaque context.

**DoD D2 :**
- Aucun string "Loading…" dans `src/`.
- Chaque page de données a un skeleton adapté.
- L'utilisateur voit un placeholder pendant que la donnée arrive.

#### D3 — Toasts + retrait de alert/confirm

**Tâches :**
- Composant `Toast` (success / error / info / warning) + `ToastProvider`.
- Hook `useToast()`.
- Remplacer **tous** les `alert(...)` et `confirm(...)` dans `src/` par des toasts ou des modaux personnalisés.
- Migration `confirm()` → composant `ConfirmDialog` réutilisable.

**DoD D3 :**
- Grep `alert(` / `confirm(` dans `src/` ne trouve plus rien.
- UX cohérente avec le design system existant.
- Toasts auto-dismiss configurable.

#### D4 — Shared validators et formatters

**Tâches :**
- Créer `src/utils/validators.ts` : `validateEmail`, `validatePassword`, `validateOrgName`, `validateRequired`, etc.
- Créer `src/utils/formatters.ts` : `formatDate`, `formatScore`, `formatRiskLevel`, `formatCurrency`.
- Migrer les pages d'auth (Login, Signup, Invite) et de Registry pour utiliser ces helpers.

**DoD D4 :**
- Aucune logique de validation regex dispersée dans les composants.
- Aucun formatage de date inline.
- Tests unitaires sur les validators (couverture ≥ 90 %).

**DoD global de la phase D :**
- D1, D2, D3, D4 tous validés.
- `npm test` toujours vert.
- L'app gère gracieusement une erreur réseau simulée (test manuel).

---

### E — Firebase Auth + Firestore réel pour Account / Organization / Team

**Objectif :** Première vraie intégration backend, sur le périmètre Phase 8.

**DoR :**
- Phase D commitée.
- Variables `.env.local` configurées avec les credentials Firebase (template existe déjà).
- Feature-flag strategy en place (cf. §6) — permet de coexister mock + Firebase.

**Tâches :**
- Wirer `src/lib/firebase.ts` à `src/context/AuthContext.tsx`.
- Implémenter le resolver `resolveLayer('auth')` : retourne `'mock'` ou `'firebase'`.
- Remplacer les implémentations de `login` / `signup` / `logout` par des appels Firebase Auth quand le flag est `'firebase'`.
- Migrer la collection `organizations` et la sous-collection `members` vers Firestore.
- Préparer l'émulateur Firebase pour tests locaux.

**DoD :**
- L'app tourne en `VITE_AUTH_LAYER=firebase` avec auth réelle (signup, login, logout, switch org).
- L'app tourne aussi en `VITE_AUTH_LAYER=mock` sans régression (fallback).
- Tests d'intégration verts dans les deux modes.
- Aucune fuite de données entre orgs (test manuel : 2 comptes, 2 orgs).
- Post-flight : justification explicite si certaines fonctionnalités restent mock.

---

### E2 — Firestore rules live + access test matrix

**Objectif :** Activer et valider les règles de sécurité Firestore avant de migrer les domaines métier.

**DoR :**
- Phase E commitée et auth Firebase live.
- `firestore.rules` (377 lignes) revues à la lumière des collections déjà migrées (organizations, members).

**Tâches :**
- Déployer `firestore.rules` sur le projet Firebase (dev/staging d'abord).
- Construire une **access test matrix** :

| Acteur | Cible | Opération attendue |
|---|---|---|
| owner   | son org      | read + write |
| admin   | son org      | read + write (sauf billing) |
| member  | son org      | read |
| billing | son org      | billing fields only |
| owner   | autre org    | denied |
| anonyme | n'importe quoi | denied |

- Implémenter ces tests via Firebase Rules Test Suite (ou équivalent émulé).
- Documenter chaque assertion de la matrice avec son test correspondant.

**DoD :**
- Toutes les cellules de la matrice ont un test correspondant (✅ pour autorisé, ✅ pour deny).
- 100 % des tests de la matrice passent contre l'émulateur.
- Les règles sont déployées sur l'environnement dev.
- Documentation : la matrice est sauvegardée dans `docs/firestore-access-matrix.md` (à créer en phase E2).

---

### F — Firestore réel pour Audits / Reports / Registry

**Objectif :** Migrer les domaines métier un par un, dans l'ordre de dépendance.

**DoR :**
- Phase E2 commitée — règles Firestore actives et validées.
- Tests E2E de la matrice d'accès passent.

**Sous-phases (recommandé : un commit par domaine) :**

#### F.1 — Migration Registry

**Tâches :**
- Wirer `src/lib/registry/storage.ts` aux appels Firestore (`organizations/{orgId}/registry/{itemId}`).
- Implémenter `resolveLayer('registry')`.
- Tester le flag à `'firebase'`.

**DoD F.1 :** CRUD complet du registre fonctionne en mode Firebase, tests d'intégration verts, mock toujours fonctionnel.

#### F.2 — Migration Audits

**Tâches :**
- Migrer `AuditContext` (drafts + answers).
- Implémenter `resolveLayer('audit')`.

**DoD F.2 :** Création d'audit, sauvegarde de brouillon, soumission, scoring fonctionnent en Firebase.

#### F.3 — Migration Reports

**Tâches :**
- Migrer `ReportsContext`.
- Implémenter `resolveLayer('reports')`.

**DoD F.3 :** Liste, détail, vue partagée fonctionnent en Firebase.

**DoD global de la phase F :**
- F.1, F.2, F.3 tous verts.
- L'app peut tourner avec `VITE_DATA_LAYER=firebase` global (tous les domaines basculés).
- Aucune régression vs mode mock.
- Documentation : journal de migration dans `docs/firebase-migration-log.md`.

---

### G — Backend Cloudflare Workers + Hono (skeleton)

**Objectif :** Mettre en place la couche serveur pour ce qui ne peut pas se faire côté client.

**DoR :**
- Phase F commitée — Firestore réel sur tous les domaines métier.
- Compte Cloudflare configuré, Wrangler installé.

**Tâches :**
- Setup `wrangler.toml` + `package.json` workspace si besoin.
- Init Hono app : `src/server/index.ts` (ou repo séparé selon l'architecture choisie).
- Middleware essentiels : CORS, auth JWT (Firebase Admin SDK), org-context, error-handler, structured logging.
- Routes minimales (squelette) :
  - `POST /api/audits/:id/submit` (déclenche scoring serveur si nécessaire)
  - `POST /api/reports/:id/export` (génération PDF réelle)
  - `POST /api/team/invite` (envoi d'email)
  - `POST /api/stripe/webhook` (placeholder pour H)
- Aucune route métier complexe — juste le squelette + 1–2 routes représentatives.

**DoD :**
- L'app frontend peut hit le backend en local (`wrangler dev`) et obtenir une réponse 200 sur au moins une route.
- Middleware auth refuse les requêtes sans token Firebase valide (test).
- Logs structurés visibles dans la console Wrangler.
- Documentation : `docs/backend-routes.md` répertorie les routes existantes et celles à venir.

---

### H — Settings UI

**Objectif :** Compléter la couche compte / organisation côté frontend, en s'appuyant sur Firebase + backend déjà en place.

**DoR :**
- Phase G commitée — backend skeleton vivant et auth-protected.
- Toutes les opérations sensibles (changement de mot de passe, suppression d'org) ont une route backend disponible.

**Tâches :**
- Page profil utilisateur (nom, email, avatar, mot de passe — via Firebase Auth pour le password reset).
- Page paramètres organisation (nom, plan affiché, suppression — via backend).
- Page préférences (thème, langue, notifications email).
- Routes ajoutées : `settings/profile`, `settings/org`, `settings/preferences`.
- Réutilisation maximum de `RoleSelector`, `FormField`, etc.

**DoD :**
- Les 3 pages sont accessibles depuis la sidebar.
- Modification du nom de profil persiste dans Firestore.
- Suppression d'org demande une confirmation forte (modal `ConfirmDialog` D3).
- Tests d'intégration verts.

---

### I — Billing UI + Stripe réel

**Objectif :** Donner du sens au rôle `billing` et activer la monétisation.

**DoR :**
- Phase H commitée — Settings UI vivante (Billing s'appuie sur la page profil pour les coordonnées de facturation).
- Compte Stripe (test) configuré, clés présentes dans `.env.local`.
- Webhook endpoint backend (G) prêt à recevoir.

**Tâches :**
- Page d'aperçu du plan actuel (lit `subscriptions` Firestore).
- Sélecteur de plan / page upgrade.
- Stripe Elements pour la méthode de paiement.
- Historique des factures (lit `billing_events`).
- Page d'utilisation / quota (audits/mois, sièges utilisés).
- Webhook handler `/api/stripe/webhook` complet → met à jour Firestore.

**DoD :**
- Un user peut souscrire à un plan en mode test Stripe.
- Le webhook met à jour le plan dans Firestore.
- Le rôle `billing` accède à la page Billing en lecture, l'`owner` en lecture+écriture.
- Aucune fuite de clés en frontend.

---

### J — Déploiement, monitoring, production hardening

**Objectif :** Passer de "ça marche en local" à "ça tourne en prod".

**DoR :**
- Phase I commitée — Billing complet en mode test.
- Tous les flags `VITE_*_LAYER` à `'firebase'` en prod.
- Audit de sécurité passé.

**Tâches :**
- Build production frontend (Vite build) déployé sur Cloudflare Pages ou Vercel.
- Workers en prod (`wrangler deploy`).
- Firestore en prod (vs émulateur).
- Webhooks Stripe en mode live.
- Logs structurés + agrégation (Cloudflare logs, Sentry frontend).
- Monitoring (uptime, performance, erreurs).
- CI/CD GitHub Actions : type-check + tests + deploy sur push `main`.
- Audit Lighthouse 90+.
- Plan staging / prod / dev clairement séparés.

**DoD :**
- Une URL publique sert l'app en HTTPS.
- Un user peut s'inscrire, créer un audit, le payer, recevoir un PDF.
- Sentry capture les erreurs frontend.
- CI bloque tout push qui casse les tests.
- Documentation runbook : comment déployer, comment rollback, comment investiguer une alerte.

---

## 5. Dependency table — graphe DAG strict

Chaque phase déclare ses prérequis. **Aucune phase ne peut démarrer si un prérequis n'est pas vert.**

| Phase | Dépend de | Pourquoi |
|---|---|---|
| **A** | — | Première étape — nettoyage de l'arbre git |
| **B** | A | Besoin d'un baseline git stable pour ajouter les contrats sans mélanger avec la Phase 8 |
| **C** | B | Tests s'écrivent contre des types stables ; sinon les assertions cassent à la moindre évolution |
| **D** | C | Tests servent de filet pendant les refactors de hardening |
| **D1** | C (entry to D) | Boundary affecte la racine de l'arbre React — fait en premier |
| **D2** | D1 | Skeletons remplacent les états de chargement, qui peuvent eux-mêmes lever des erreurs (D1 doit être en place) |
| **D3** | D2 | Toasts remplacent `alert/confirm` ; bénéficient des boundaries D1 |
| **D4** | D3 | Validators/formatters consommés par les composants déjà migrés au design final |
| **E** | D | Hardening rend les erreurs Firebase survivables (sinon crash app à chaque hiccup réseau) |
| **E2** | E | Règles testables uniquement avec une vraie collection ; donc Auth + Org + Team d'abord |
| **F** | E2 | Rules protectives doivent être actives et validées avant de migrer les domaines métier |
| **F.1** | E2 | Premier domaine métier — Registry est isolé, bon candidat pilote |
| **F.2** | F.1 | Audits dépendent du registre (croisements possibles) |
| **F.3** | F.2 | Reports consomment les audits |
| **G** | F | Backend opère sur Firestore — il faut que les collections soient vivantes |
| **H** | G | Settings expose des opérations sensibles qui doivent passer par le backend (changement password, suppression org) |
| **I** | H | Billing s'appuie sur la page profil (coordonnées de facturation) et sur les webhooks backend (G) |
| **J** | I | Déploiement = tout doit être stable et testé |

### Règle de blocage explicite
**Si la DoD d'une phase n'est pas validée, la phase suivante reste bloquée.** Aucune dérogation. La seule exception possible est un commit de rollback, qui ramène l'arbre à un état stable et redémarre la phase courante.

---

## 6. Stratégie de feature-flags pour la migration

Pour permettre une bascule **context-par-context** entre la couche mock (`localStorage`) et la couche réelle (Firebase), on introduit un système de drapeaux d'environnement.

### Variables d'environnement

| Variable | Valeurs | Rôle |
|---|---|---|
| `VITE_DATA_LAYER` | `'mock'` \| `'firebase'` | Default global pour tous les domaines |
| `VITE_AUTH_LAYER` | `'mock'` \| `'firebase'` | Override pour Auth/Org/Team |
| `VITE_REGISTRY_LAYER` | `'mock'` \| `'firebase'` | Override pour Registry |
| `VITE_AUDIT_LAYER` | `'mock'` \| `'firebase'` | Override pour Audits |
| `VITE_REPORTS_LAYER` | `'mock'` \| `'firebase'` | Override pour Reports |

**Default :** `'mock'` partout. Une variable absente = `'mock'`.

### Resolver function

À implémenter dans `src/lib/featureFlags.ts` (sera créé en début de phase E) :

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

### Bascule context-par-context

Plan de bascule progressive — chaque domaine est migré séparément et peut être rollback indépendamment :

| Étape roadmap | Domaine basculé | Avant | Après |
|---|---|---|---|
| E   | Auth / Org / Team | mock | firebase |
| F.1 | Registry          | mock | firebase |
| F.2 | Audits            | mock | firebase |
| F.3 | Reports           | mock | firebase |

À chaque bascule, le mock reste fonctionnel comme fallback dev pendant au moins 2 phases (donc Auth bascule en E, on garde le mock fonctionnel jusqu'à G inclus). Ensuite, dépréciation progressive.

### Fallback runtime (résilience)

Dans chaque `lib/*/storage.ts` ou contexte, le pattern recommandé :

```ts
let layer = resolveLayer('auth');
if (layer === 'firebase') {
  try {
    await initFirebase();
  } catch (err) {
    console.warn('[featureFlags] Firebase init failed, falling back to mock:', err);
    layer = 'mock';
    // Optional: show a dev banner
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

### DoD de la stratégie de flags

- `src/lib/featureFlags.ts` existe et est testé.
- Chaque domaine migré expose son flag.
- Documentation claire dans `.env.example` listant tous les flags.
- Une fois une phase F migrée, on peut tester l'app dans les deux modes en changeant uniquement `.env.local`.

---

## 7. Mapping ancienne roadmap → nouvelle séquence A→J

L'ancienne roadmap (`memory/phases_corrected.md`) est **superseded** par cette séquence A→J. Mapping pour référence :

| Ancien (12 phases) | Nouveau (A→J) |
|---|---|
| Phase 0 — Stabilisation | déjà fait ✅ |
| Phase 1A — Config Firebase | 🟡 L1 (préparé) → activé en E |
| Phase 1B — Modèle Firestore | 🟡 L1 (préparé) → activé en E + F |
| Phase 1C — Stripe mapping | reporté en I |
| Phase 1D — Security rules logic | 🟡 L1 (préparé) → activé en E2 |
| Phase 2 — Design import | déjà fait ✅ |
| Phase 3 — Mock data | déjà fait ✅ |
| Phase 4 — Audit flow | déjà fait ✅ |
| Phase 5 — Scoring | déjà fait ✅ |
| Phase 6 — Assistance | déjà fait ✅ |
| Phase 7 — Reports | déjà fait ✅ (UI seulement) |
| Phase 8 — Registre IA | déjà fait ✅ |
| Phase 9 — Auth/Org/Team UI | déjà fait ✅ (non commitée → étape A) |
| Phase 10 — Billing UI | reporté en I |
| Phase 11 — Backend Workers | reporté en G (avant Settings et Billing — corrigé v4) |
| Phase 12 — Déploiement | reporté en J |

**Nouveautés et corrections de la séquence A→J (v4) :**
- **Étape B** (contrats de types) — n'existait pas dans l'ancienne roadmap.
- **Étape C** (tests critiques) — n'existait pas.
- **Étape D** (frontend hardening) avec sous-phases **D1–D4** explicites — n'existait pas.
- **Étape E2** (Firestore rules live + access test matrix) — **ajoutée en v4**, séparée de E.
- **Étape G** (Backend Skeleton) — **repositionnée avant H/Settings et I/Billing en v4**.
- **Étape H** (Settings UI) — n'existait pas explicitement.
- Découpage **F.1 / F.2 / F.3** — un domaine métier à la fois.
- **Stratégie de feature-flags** (§6) — nouveau dispositif transverse.

---

## 8. Phase Workflow Contract (règles anti-skip)

Cinq règles **contraignantes** pour empêcher de sauter des étapes ou d'introduire des erreurs silencieuses.

### Règle 1 — Une phase = un objectif
Une phase a un seul objectif nommé. Pas de bundle (pas de "je fais Settings + Billing en même temps"). Les sous-phases (D1–D4, F.1–F.3) suivent la même règle à leur niveau.

### Règle 2 — Une phase approuvée = un commit
- Chaque phase termine sur un commit unique sur la branche `audit`.
- Pour les phases avec sous-étapes (D, F), un commit par sous-étape est autorisé et recommandé.
- Message de commit explicite (`feat: …`, `chore: …`, `docs: …`, `test: …`).
- Pas de push tant que l'utilisateur ne le demande pas.

### Règle 3 — Quatre portes avant la phase suivante
Pas de phase N+1 tant que la phase N n'est pas :

1. **Reviewed** — toutes les modifications relues, `tsc --noEmit` propre, tests verts si applicable, pas de warning silencieux.
2. **Validated** — l'utilisateur a explicitement approuvé ("OK, je valide").
3. **Summarized** — récapitulatif des fichiers, des résultats, et de ce qui reste (post-flight).
4. **Committed** — un seul commit (ou un par sous-étape) sur `audit`.

De plus, la phase N+1 ne peut démarrer que si **toutes ses dépendances** dans la table §5 sont vertes.

### Règle 4 — Pre-flight obligatoire (avant tout code)
Avant d'écrire la moindre ligne de code dans une phase :

- Lister les fichiers à **créer**.
- Lister les fichiers à **modifier**.
- Lister les fichiers explicitement **non touchés**.
- Énoncer **pourquoi cette phase vient maintenant** (préconditions, dépendances).
- Vérifier la **DoR** de la phase (§4).

### Règle 5 — Post-flight obligatoire (après code)
À la fin de chaque phase :

- **Fichiers changés** : liste exhaustive avec chemins.
- **Ce qui a été terminé** : items de la DoD, vérifiables.
- **Ce qui reste dans le scope initial** : oui/non, avec justification si rabaissé.
- **Recommandation de commit** : oui / non / conditionnel (`après revue`, `après test`, etc.).
- Vérifier la **DoD** de la phase (§4).

---

## 9. Définition de "phase approuvée"

Une phase est **approuvée** uniquement si l'utilisateur a écrit :
- "OK approuvé", "validé", "approve commit", "go commit", ou équivalent explicite.
- L'absence de réponse n'est pas une approbation.
- Une approbation partielle ("c'est presque bon, mais …") déclenche un *iteration loop*, pas une promotion à la phase suivante.

---

## 10. Prochaine action recommandée

**Étape A — Commit Phase 8 (Auth + Org + Team UI)**

- Branche : `audit`
- 14 fichiers à `git add` + 3 modifications
- Message recommandé : `feat: add auth, organization, and team ui with role-based access (mock layer)`
- Pas de push.

Aucune nouvelle ligne de code à écrire pour cette étape.

---

**Document maintenu :** chaque phase mise à jour ici en premier, puis dans `docs/AiLunaPro-Architecture-And-Status.md` pour export Notion.
**Dernière révision :** 2026-04-29 — v4 (corrections techniques : E2, D1–D4, dependency table, DoR/DoD, feature-flag strategy, Backend Skeleton repositionné)
