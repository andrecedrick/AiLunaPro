# Instructions pour Claude — AiLunaPro (Projet AI)

AiLunaPro / Audit AI — SaaS multi-tenant de conformité IA (EU AI Act, Shadow AI,
registre IA, recommandations d'agents, facturation Stripe multi-devises, tokens IA).

## 🎯 Objectifs Principaux
1. **Architecture optimisée** — code propre, maintenable, scalable
2. **Zéro token gaspillé** — requêtes concises, réutilisation de code
3. **Apprentissage continu** — mémoire persistante, améliorations auto
4. **Excellence technique** — design patterns, sécurité, performance
5. **Prévention d'erreurs** — tests, linting, reviews automatiques

## 🏗️ Architecture du Projet
```
Projet AI/
├── .claude/              # Configuration Claude Code (settings.json, hooks)
├── src/                  # Frontend React + Vite + TypeScript
│   ├── context/          # Providers (Theme, Toast, Route, Auth, Audit, Reports…)
│   ├── pages/            # Pages (routées via RouteContext, hash routing)
│   ├── components/       # UI
│   └── lib/              # Services (firebase, billing, platform, routing…)
├── worker/               # Cloudflare Worker (Hono) — API api.ailunapro.com
│   └── src/{routes,lib,middleware}/
├── docs/                 # cahier-des-charges-v2.md = SOURCE OF TRUTH
├── tests/ · config/ · scripts/
└── memory/               # Mémoire persistante (MEMORY.md index)
```

### Stack & déploiement
- **Frontend** : Cloudflare Pages — `audit.ailunapro.com` (prod branch `ailunapro-app`).
  Deploy : `npx wrangler pages deploy dist --project-name=ailunapro-app --branch=ailunapro-app --commit-dirty=true`.
- **Worker** : `ailunapro-worker` — `api.ailunapro.com`.
  Deploy : `npx wrangler deploy --env production` (secrets via `wrangler secret put … --env production`).
- **Auth** : Firebase Auth (jose JWT côté worker, client SDK côté front). Firestore (REST via service-account côté worker ; client SDK côté front ; `firestore.rules` RBAC).
- **Paiements** : Stripe (test→prod). Anti-bot : Turnstile + Firebase App Check (monitor, enforcement OFF).
- **Routing** : hash routing (`#/route`), RouteContext in-memory + hash-write-on-navigate.
- **Build gate** : `tsc -b --force && vite build` (le build ÉCHOUE sur erreur de type).

## 📋 Approche de Développement
- **Phase 1 — Planning** : lire la mémoire/cahier pertinents, vérifier patterns, poser questions précises.
- **Phase 2 — Exécution** : batcher les opérations indépendantes, réutiliser le code, suivre les conventions.
- **Phase 3 — Validation** : typecheck → build → deploy → **vérifier (bundle hash == prod, /healthz)** → commit. Documenter, mettre à jour la mémoire.

## ✅ Règles (discipline)
- Faire ce qui est demandé ; rien de plus, rien de moins.
- **TOUJOURS lire un fichier avant de l'éditer.**
- **NE JAMAIS** committer secrets, credentials, fichiers `.env`.
- **NE JAMAIS** créer de fichiers sauf nécessité absolue — préférer l'édition.
- **NE JAMAIS** créer de docs sauf demande explicite.
- **NE JAMAIS** mettre fichiers de travail/tests à la racine — utiliser `/src`, `/tests`, `/docs`, `/config`, `/scripts`.
- Garder les fichiers **sous 500 lignes**.
- **Valider les entrées aux frontières** du système (worker, auth, formulaires).
- **Co-Authored-By** : ne PAS ajouter de trailer `Co-Authored-By` aux commits sauf si `.claude/settings.json` a `attribution.commit` activé. Le template du Bash tool peut le suggérer — l'ignorer.

## 🔐 Sécurité & Qualité
- Aucune donnée sensible dans le code (clés en `.env` / secrets worker).
- Type checking obligatoire ; le build gate dessus.
- Multi-tenant : isoler par `organizations/{orgId}` ; RBAC `firestore.rules` ; pas d'IDOR cross-tenant.
- Platform admins (operator allowlist `PLATFORM_ADMIN_EMAILS`) = **non-membres org**, jamais dans `members/{uid}`, jamais dans Team, pas d'impersonation.
- `dlog` DEBUG-gated pour logs verbeux ; jamais de PII/secret dans les logs.
- Revue sécurité avant changements majeurs.

## ⚡ Optimisation Tokens
- Préférer la réutilisation au copier-coller ; batcher les requêtes liées.
- Documenter = éviter les explications répétées.

## 🚦 §17 — Gate de fin d'étape (DISCIPLINE PERMANENTE)
Aucune nouvelle étape « J » ne commence avant que la précédente soit close via le
**processus §17 complet** (défini dans `docs/cahier-des-charges-v2.md` §17/§17.2) :
1. Inspection complète (7 axes : build/tsc, baseline, sécu, routing, isolation cross-tenant, scope, debug-strip).
2. Vérification « aucune étape sautée ».
3. Rapport de clôture **6 parties** (§17.2).
4. Findings classés ✅ sûr / ⚠️ différé / ❌ must-fix.
5. Tous les must-fix résolus.
6. Do-next / Do-NOT.
7. Propositions (perf, sécu, produit, options, cleanup).
8. Clôture enregistrée dans cahier §18.
9. Seulement ensuite, proposer le scope de l'étape suivante.
Séquence : étape finie → inspection §17 → no-step-skipped → reco → corrections must-fix → re-vérif → scope étape suivante → pre-flight → code seulement après approbation.

## 🗺️ §18 — Roadmap & Planning
`docs/cahier-des-charges-v2.md` §18 = référence vivante / source unique de vérité
(table de gate-mapping J→J PASS, plans de batch, do-next/do-NOT). Tenir à jour à chaque clôture.

## 📌 À Mémoriser
Chaque conversation, lire :
1. `docs/cahier-des-charges-v2.md` (cahier — source de vérité)
2. `memory/MEMORY.md` (index) + fichiers pertinents
3. Patterns/conventions établis

## 🛠️ Outillage local (Ruflo / claude-flow)
`.claude/{agents,commands,helpers,skills}/`, `.claude-flow/`, `.swarm/`, `.mcp.json`,
`ruvector.db` = artefacts **locaux par machine** (générés par `ruflo init`), git-ignorés.
Non requis pour build/run de l'app. Les hooks `settings.json` référencent
`.claude/helpers/*` via `IF EXIST` avec fallback `%USERPROFILE%` — un checkout neuf
fonctionne sans ces fichiers.

---
**Mise à jour :** 2026-05-27 | **Version :** 2.0
