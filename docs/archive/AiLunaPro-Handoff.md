> ⚠️ **OBSOLETE / SUPERSEDED — archived 2026-06-07.** The single authoritative source of truth is `docs/cahier-des-charges-v2.md` (§0bis Master Ledger). This file is reference-only and carries **no agreed scope**.

# AiLunaPro — Handoff (J9 → J13 + Perf/Cache/PostHog)

## TL;DR
- J9, J10, J11, J12 : **CLOSED** ✅
- J13 (PostHog Phase A + privacy scrub + analytics-block notice) : **presque clôturé** (HOLD sur vérifs finales + docs).
- Perf Hardening : **CLOSED** ✅ (watchdog boot + fix cache HTML Cloudflare).
- Problèmes lourdeur/erreurs : souvent **environnement** (AdGuard/Kaspersky/Tracking Prevention) + cache HTML (résolu).

---

## Principes / Guardrails permanents
- ❌ Pas de “compliance certified / passed audit / deploy-ready”.
- ❌ Pas d’avis juridique (disclaimer obligatoire).
- ❌ Pas de LLM en prod, pas de génération dynamique.
- ❌ Pas de stockage PII, pas de session replay, pas d’autocapture.
- ✅ Contenu statique et déterministe.
- ✅ Stripe = source de vérité (billing).
- ✅ PostHog consent-first + DNT respect + no-PII.

---

## J9 — CLOSED (AI Audit Guidance + System Builder + Action Plan)
### Phase A (Guidance + refs + disclaimer)
- `regulatoryRefs` sur Findings + Recommendations (EU AI Act / NIST AI RMF / ISO 42001 / GDPR)
- Disclaimer obligatoire sur AuditResult / ReportDetail / ReportShare
- Commit: `695f690`

### Phase B-lite (User profile pref — tone only)
- `enterprise|entrepreneur|individual`
- Impact: **tone only** (Disclaimer + intro Action Plan), jamais scoring
- Commit: `5778c6c`

### Phase C-skeleton (System Builder)
- Route `#/system-builder`, 6 étapes statiques (no persistence, no inputs)
- Commit: `2d12a0d`

### Phase D (Prioritized Action Plan)
- Dérivé déterministe en 3 bandes Critical/Important/Improvement, cap 8 + “N more”
- Monté sur AuditResult / ReportDetail / ReportShare au-dessus de Roadmap
- Commits: code `5c3461d`, docs `bf600af`

### Hardening parallèle
- `lazyWithRetry` + ErrorBoundary chunk-aware: `cf4ce82`
- App Check lazy + prefetch tighten: `89637a0`

### J9 exit
- Closure: `59bd56b`

---

## J10 — CLOSED (Payment Methods via Stripe Customer Portal)
- Approche A (Customer Portal) : add/update/remove card via Stripe, pas de stockage carte
- UI polish v1/v2 : section “Billing actions”
- Commits: `868ef8a`, `e8cabd2`, `1ed8cdb`, docs `f5a92fc` + `4f909c6`

---

## J11 — CLOSED (Audio Explanations Web Speech API)
- Audio summary (no autoplay, disclaimer first, no network, no PII)
- Surfaces : AuditResult + ReportDetail + ReportShare
- Sélecteur langue (utterance.lang, pas de traduction), sélecteur voix + test voice + tuning + pauses
- Commits principaux: `3f2b84f`, `c32eb47`, `f476090`, `c99740f`, `2045318`, `b58302a`

---

## J12 — CLOSED (Smart locale + currency display + live FX ECB)
- `/api/public/geo` (CF-IPCountry) no-auth, no IP/PII, no-cache headers, `Vary: CF-IPCountry`
- `/api/public/fx` (ECB) cache 6h + fallback
- Détection geo/fx Billing-only (pas au boot), affichage “≈ … approx · billed in USD”
- Commits: `aea77a6`, `52fe97b`, `c3ceda1`, perf `d09b5c3`, live FX `a5640fe`, docs `af7659f`

---

## Perf Hardening — CLOSED (chunks + cache HTML)
### Symptôme
- “Couldn’t load the page” récurrent à cause de `index.html` cache 4h → chunks hashés mismatch après déploiements.

### Fix Cloudflare
- Browser Cache TTL: **Respect Existing Headers**
- Cache Rules audit.ailunapro.com:
  - HTML `/` + `/index.html` : bypass / revalidate (Cache-Control no-cache, must-revalidate)
  - `/assets/*` : cache long immutable
  - `/api/*` : bypass
- Vérif via PowerShell/DevTools:
  - HTML: `Cache-Control: no-cache, must-revalidate` ; `cf-cache-status: EXPIRED` acceptable
  - Assets: immutable
- Code watchdog boot: `925c690`
- Cache policy fix: `9bcb741`
- Closure docs §18: `615289b`

---

## J13 — PostHog Phase A (consent-first, no-PII) — IN PROGRESS / close pending
### Batch 1
- ConsentBanner + localStorage consent + DNT auto-decline
- SDK posthog-js lazy-chunk (load only post-consent)
- Commit: `eafb399`

### Batch 2
- Events:
  - `page_view` on route change (id-stripped route name only)
  - chunk events from `lazyWithRetry`: `chunk_load_failed`, `chunk_retry_recovered`, `chunk_retry_failed`
- Commit: `73ec62d`

### Privacy fix (critical)
- Problème : PostHog ajoutait `$current_url` par défaut (hash + id + query)
- Fix : `sanitize_properties` → URL props **origin-only**, referrer blank
- Commit: `3e07847`
- Scrub PASS confirmé (PostHog `Current URL` origin-only)

### Analytics blocked notice
- Problème : `/e/` PostHog bloqué par environnement (`ERR_BLOCKED_BY_CLIENT`) même sans adblock “classique”
- Fix : probe + notice “Analytics blocked… allow us.i.posthog.com” (dismissible)
- Commit: `ed1a3ba` (déployé hash `index-CdRkHlbM.js`)

### État actuel
- Tracking path OK côté code
- Si env bloque `/e/`, notice apparaît (acceptable)
- Reste à faire : §17 mini-gate J13 + Batch 3 docs (flip §9.25 -> Shipped + §18 J13 row)

---

## Perf P2-a — Firestore long-polling autodetect (compat AV/proxy)
- Diagnostic : hangs/“heavy” souvent liés à WebChannel streaming Firestore bloqué/ralenti par AV/proxy/extensions
- Fix : `getFirestore` → `initializeFirestore({ experimentalAutoDetectLongPolling:true })`
- Commit: `7f4d985` ; prod hash `index-BmiqP4Kw.js`
- À vérifier : profil extensions (AdGuard/Kaspersky) charge mieux ; incognito no regression

---

## Environnement / Observations
- Extensions vues: AdGuard AdBlocker + Kaspersky (peuvent causer `ERR_BLOCKED_BY_CLIENT` sur googleapis / posthog).
- Cache Reserve Cloudflare: **pas prioritaire** pour la perf perçue (plutôt egress/eviction). 

---

## Checklist mesure perf propre
- Incognito/InPrivate
- DevTools Network:
  - Preserve log OFF
  - Disable cache OFF (perf réelle)
- Hard reload une fois
- Noter: Finish / Requests / Transferred
- DevTools Performance: Record + reload → relever LCP + TBT

---

## Commits clés (chronologie courte)
J9: `695f690`, `5778c6c`, `2d12a0d`, `5c3461d`, `bf600af`, `59bd56b`
J10: `868ef8a`, `e8cabd2`, `1ed8cdb`, `f5a92fc`, `4f909c6`
J11: `3f2b84f`, `c32eb47`, `f476090`, `c99740f`, `2045318`, `b58302a`
J12: `aea77a6`, `52fe97b`, `c3ceda1`, `d09b5c3`, `a5640fe`, `af7659f`
Perf: `925c690`, `9bcb741`, `615289b`
J13: `eafb399`, `73ec62d`, `3e07847`, `ed1a3ba`
Firestore P2-a: `7f4d985`

---