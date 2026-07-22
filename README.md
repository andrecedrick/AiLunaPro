# AiLunaPro — Audit AI

SaaS multi-tenant de conformité IA : audit EU AI Act, détection Shadow AI, registre IA,
recommandation d'agents, et un funnel **Quote-to-Cash** complet (devis → facture → paiement → reçu).

- **Application** : https://audit.ailunapro.com
- **API** : https://api.ailunapro.com
- **Source de vérité produit** : [`docs/cahier-des-charges-v2.md`](docs/cahier-des-charges-v2.md)
- **État projet / roadmap** : [`memory/status.md`](memory/status.md)

---

## Stack

| Couche | Technologie |
|---|---|
| Frontend | Vite 8 · React 19 · TypeScript 6 (strict) · Tailwind 4 · hash routing (`#/route`) |
| Backend | Cloudflare Worker · Hono · `nodejs_compat` |
| Auth | Firebase Auth (client SDK front · vérification JWT `jose` côté worker) |
| Données | Firestore (client SDK front · REST via service-account côté worker) · `firestore.rules` RBAC |
| Paiements | Stripe (checkout, subscriptions, customer portal, webhooks, token packs) |
| Emails | Sequenzy (transactionnels : devis, facture client, confirmation de paiement) |
| Stockage | Cloudflare R2 (`ailunapro-audit-pdfs`) |
| Anti-bot | Cloudflare Turnstile · Firebase App Check (monitor, enforcement OFF) |
| Analytics | PostHog (consent-gated) |

## Architecture

```
Projet AI/
├── src/                  # Frontend React
│   ├── context/          # Providers (Auth, Theme, Toast, Route, Audit, Reports, Billing, Locale…)
│   ├── pages/            # Pages routées via RouteContext
│   ├── components/       # UI
│   └── lib/              # Services (firebase, billing, quote, tokens, i18n, routing…)
├── worker/               # Cloudflare Worker (Hono) — api.ailunapro.com
│   └── src/{routes,lib,middleware}/
├── docs/                 # cahier-des-charges-v2.md = SOURCE OF TRUTH
├── memory/               # Mémoire projet persistante (MEMORY.md = index)
├── tests/ · scripts/ · config/
└── firestore.rules       # RBAC multi-tenant
```

**Isolation multi-tenant** : toute donnée métier vit sous `organizations/{orgId}/…`.
RBAC appliqué à la fois par `firestore.rules` et par les middlewares worker
(`requireRole`, `requireOwner`). Pas d'IDOR cross-tenant.

---

## Fonctionnalités

### Audit & conformité
- **Audit complet** — questionnaire, moteur de scoring déterministe, résultats expliqués.
- **Audit Express** — parcours court, extraction de site, PDF déterministe, partage public HMAC (révocable).
- **Diagnostic Express** et **Calculateur ROI** — surfaces publiques de génération de leads.
- **Registre IA** — inventaire CRUD des systèmes d'IA, niveaux de risque/approbation/supervision.
- **Reports** — scoring serveur, PDF « white-paper » consulting, partage public HMAC.
- **Recommandation d'agents** + plan d'action priorisé.

### Quote-to-Cash *(prod-verified 2026-07-20)*
1. **Devis** — layout value-first, **prix publié fixe** par offre, bridge Recommandation→Devis.
2. **Split de paiement** — SMB via **Stripe Checkout** ; high-ticket (≥ $15k) via **virement bancaire**.
3. **Facture** — garantie à l'acceptation du devis, avec route de récupération admin.
4. **PDF** — facture / reçu téléchargeable, généré de façon déterministe (logo embarqué, pas de réseau au runtime).
5. **Accès public** — le client accède à sa facture **sans compte**, via **lien signé** (no-login).
6. **Page reçu client** — servie sur ce lien signé ; aucun mur de login.
7. **Emails** — devis, facture client, confirmation de paiement (Sequenzy), avec remontée d'erreur provider PII-scrubbée.

### Billing
Abonnements Stripe (Starter / Professional / Enterprise), customer portal, méthodes de paiement,
historique de facturation, **tokens / crédits IA** avec packs et limites de plan.
Application des limites : `ENABLE_PLAN_LIMITS=true`, `ORGS="*"` (global).
Facturation de l'overflow : **scoped à une org de test** (`ENABLE_RECOMMENDATION_CHARGE_ORGS`) — **pas de facturation globale**.

### Admin Center
Réservé aux admins d'organisation : gestion des devis et factures, override de prix,
renvoi d'emails, recouvrement des factures manquantes, feed d'activité.

### Platform Center
Réservé aux **platform superadmins** (allowlist `PLATFORM_ADMIN_EMAILS` / `ADMIN_EMAILS`) :
visibilité **cross-org** réelle, diagnostics de configuration, opérations plateforme.
Les platform admins sont **non-membres** des organisations — jamais dans `members/{uid}`,
jamais dans Team, **pas d'impersonation**.

---

## Développement

```bash
npm install
npm run dev            # frontend (Vite)
npm run worker:dev     # worker (wrangler dev)

npm run typecheck      # tsc -b --force
npm run build          # tsc -b --force && vite build  (le build ÉCHOUE sur erreur de type)
npm test               # vitest
npm run test:rules     # tests des règles Firestore (émulateur)
npm run i18n:check     # complétude des dictionnaires i18n
```

### Internationalisation
Dictionnaires statiques (aucune dépendance, déterministe, fallback anglais) —
**8 langues** : EN · FR · ES · IT · DE · PT · RU · ZH.
Restent en anglais par décision produit : noms d'agents, citations réglementaires, disclaimer légal.

---

## Déploiement

> Le déploiement est **manuel et opéré** — il n'y a pas de CI/CD git-connecté.

**Frontend → Cloudflare Pages** (projet `ailunapro-app`) :
```bash
npm run build
npx wrangler pages deploy dist --project-name=ailunapro-app --branch=ailunapro-app --commit-dirty=true
```

**Worker → Cloudflare Workers** (`ailunapro-worker`) :
```bash
cd worker
npx wrangler deploy --env production
```

**Après déploiement, vérifier** : hash de bundle == prod, `/healthz`, et `version.json`.
Les onglets ouverts s'auto-réparent (détection de bundle périmé → un reload convergent).

### Secrets
Gérés côté serveur uniquement, via `wrangler secret put <NAME> --env production`.
**Jamais** dans le dépôt, jamais préfixés `VITE_`.

Principaux : `FIREBASE_SERVICE_ACCOUNT_JSON` · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` ·
`STRIPE_PRICE_*` · `STRIPE_TOKEN_PRICE_*` · `SEQUENZY_API_KEY` · `AUDIT_SHARE_SECRET` ·
`PLATFORM_ADMIN_EMAILS` · `ADMIN_EMAILS` · `TURNSTILE_SECRET_KEY`.

`.env.local` / `.env.production` sont git-ignorés. `.env.example` ne contient que des placeholders.

---

## Gouvernance

- `docs/cahier-des-charges-v2.md` est le **document unique et autoritatif**. Toute nouvelle
  exigence s'y écrit immédiatement. Une tâche ✅ DONE est **définitivement close**.
- `memory/status.md` porte l'état courant et le **Phase Workflow Contract anti-skip**
  (une phase = un objectif ; quatre portes : reviewed → validated → summarized → committed).
- Les fichiers restent **sous 500 lignes**. Validation des entrées **aux frontières**
  (worker, auth, formulaires). Aucun PII ni secret dans les logs (`dlog` DEBUG-gated).

---

**Licence :** propriétaire — tous droits réservés.
