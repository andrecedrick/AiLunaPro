# AiLunaPro — Status Dashboard *(source de vérité, réutilisable)*

> Export standalone de §0bis (`cahier-des-charges-v2.4-FINAL.md`). MAJ 31 mai 2026.
> Prod live : fe `index-CdRkHlbM.js` (deploy `05208d72`).
> Légende : **Shipped** (livré+prod) · **Partial** (partiel/lite) · **Planned** (spec, non implémenté).

---

## 1. Parcours 9 étapes (orchestré Luna) + mapping modules
```
[Public / sans compte]                          [Authentifié — parcours complet 9 étapes]
        │                                                     │
 ┌──────▼───────┐                                             │
 │ AUDIT EXPRESS│  V1-lite + K1A + K2A + X1-lite  ── CTA ──►  │ créer compte (save + PDF)
 │  (§3bis,Plan)│                                             │
 └──────────────┘                                             │
                                                              ▼
 1 Bienvenue & objectif ........................ U1 · K1A
 2 Profil + Analyse de site ..................... U1 · K1A · V1
 3 Mes documents (RAG) .......................... K5
 4 Diagnostic + IA en place ..................... K4 · X1
 5 Quick Wins (Impact×Effort) ................... W1
 6 Mon ROI ...................................... K2A
 7 Ma reco (AiLunaPro | agents gérés) ........... K3+
 8 Ma décision (Luna lève objections) ........... K6   ◄── orchestrateur transversal (étapes 1→9)
 9 Mon offre + SOP .............................. L3 · L4 · Y1
 → Après : déploiement géré + cockpit + suivi ... L3 · S1
        │
        └── Artefact : PDF Report (P1, §3ter) exportable à tout point de valeur (Plan)
```
Transversaux : **U1** (mode assisté zéro-expertise), **K6 Luna Copilot** (orchestre 1→9), **P1 PDF** (artefact).

---

## 2. Modules / features — statut
| Module / Section | Goal | Statut | Evidence (commit / prod) | Next action + AC |
|---|---|---|---|---|
| **Billing/Stripe** (J1–J2) | checkout/abo/portal/top-ups multi-devise | **Shipped** | J1–J2 closed ; prod | Stripe price IDs prod opérateur ; AC : live keys set |
| **K1A Diagnostic** | automatable tasks + Shadow AI + indicative EU AI Act level | **Shipped + deterministic (Phase 0)** | `DiagnosticPage` (public); `scoreDiagnostic` stamped + traced | — |
| **K2A ROI** | €/month + hours/week + payback | **Shipped + deterministic (Phase 0)** | `RoiCalculatorPage` (public); `scoreRoi` stamped + traced | — |
| **K3+/K3A Reco fork** | AiLunaPro vs agents gérés, transparent | **Shipped** | J9 (reco populée) | seuils rule-based ; AC : score couverture reproductible |
| **Prioritized Action Plan** | plan post-audit priorisé | **Shipped** | J9-D `5c3461d` | persistance done/dismissed (différé) |
| **Payment Methods** | gérer cartes via Customer Portal | **Shipped** | J10 `868ef8a`/`e8cabd2` | — |
| **Audio Explanations** | TTS client-side, disclaimer-first | **Shipped** | J11 `3f2b84f`/`c99740f`/`2045318` | cloud TTS (différé) |
| **Smart Locale + Currency** | geo + FX ECB, display-only | **Shipped** | J12 `aea77a6`/`a5640fe`/`af7659f` | UI translation (différé §9.24) |
| **Analytics (PostHog A)** | page_view + chunk, consent-first, no-PII | **Shipped** | J13 `eafb399`→`ed1a3ba` ; prod `CdRkHlbM` | Phase B feature-usage (Planned) ; AC : §17 dédié |
| **NFR cache SPA** | HTML revalidate / assets immutable / API bypass | **Shipped** | `9bcb741` + CF Cache Rules | AC : curl `/`=no-cache, assets immutable ✅ |
| **NFR chunk-resilience** | lazyWithRetry + ErrorBoundary retry | **Shipped** | `9bcb741`/J13 `73ec62d` | — |
| **NFR Firestore resilience** | autoDetectLongPolling + watchdog + fail-soft | **Shipped** | `925c690`/`7f4d985`/`13a0776` | AC : load sous AV/proxy, `channel?`=200 ✅ |
| **U1 Mode assisté zéro-expertise** | wizard 1-action/écran, "Luna le fait" | **Planned** | — | impl wizard ; AC : non-tech finit 9 étapes seul |
| **V1 Analyse de site** | crawl léger → profil + stack/IA détectés | **Planned** | — | impl V1-lite (Audit Express) ; AC : URL→fiche+outils éditables |
| **K5 Document Intelligence (RAG)** | upload→R2+Vectorize→fiche+quality score | **Planned** | — | AC : 3 docs→fiche+≥5 tâches+≥1 risque sourcés |
| **X1 Audit IA en place / OPEX** | inventaire → économie OPEX chiffrée | **Planned** | — | impl X1-lite (demo) ; AC : 3 outils→avant/après+€/mois |
| **W1 Matrice Quick Win** | Impact×Effort scoré, top 3 | **Planned** | — | scoring rule-based ; AC : matrice+top3 langage simple |
| **K6 Luna Copilot** | orchestrateur SSE tool-use 9 étapes | **Planned** | — | AC : session complète sans formulaire mort, sauvegarde/reprise, no-PII |
| **L3 Devis géré** | setup+mensuel calibré €, SLA | **Planned** | — | AC : devis complet specs/SLA/facturation |
| **L4 Contrat** | génération + e-signature | **Planned** | — | AC : devis accepté→contrat signable archivé |
| **Y1 SOP** | procédures + runbook agent | **Planned** | — | AC : process→SOP rôles+déclencheurs+fallback |
| **R1 Partenaire/White-label** | crédits + branding partenaire | **Planned** | — | AC : audit brandé+ledger crédits isolé multi-tenant |
| **S1 Suivi + Expert IA** | monitoring + rapport mensuel | **Planned** | — | AC : rapport mensuel + dialogue Expert |
| **T1 Récup revenus** | dunning email (Sequenzy) + SMS | **Planned** | — | AC : impayé→email J0+SMS J+1+J+3 traçable |
| **Q1 Intelligence Refresh** | veille modèles/prix, human-in-loop | **Planned** | — | AC : diffs→file revue admin, jamais auto-mutation |
| **Audit Express (§3bis)** | public <5min demo, no account | **Partial (Phase 3: tap-path live)** | surface `public/audit-express/index.html` + tap-flow; compute-only `POST /api/public/audit-express/preview` (no PII, no persistence); K1A-lite + K2A-lite via Phase 0 engines, traced; 9 tests | V1-lite URL crawl, X1-lite OPEX, PDF export, Turnstile, account save — later phases |
| **P1 PDF Report (§3ter)** | artefact B2B exportable versionné | **Planned** | — | AC : audit→PDF reproductible brandable sourcé |
| **Determinism (§0.4/§3quater)** | rule-based scoring + version stamp + traceability | **Shipped (Phase 0)** | `worker/src/lib/determinism.ts`; K1A `scoreDiagnostic` + K2A `scoreRoi`; 18 replay tests | Migrate remaining scored paths (`src/lib/scoring/*` K4/K3+) in a later phase |
| **SEO/GEO surfaces (§7ter)** | public indexable pages + robots + app noindex | **Partial (Phase 2)** | `/audit-express` indexable (canonical/OG/Twitter); app shell `noindex` (meta + `X-Robots-Tag`); `robots.txt` | Remaining public pages, sitemap.xml, schema.org, llms.txt — later |

---

## 3. Roadmap J1.x → statut + dépendances
| Étape | Contenu | Statut | Dépendances |
|---|---|---|---|
| **J1.3A/J1.3B** | billing admin, multi-currency, promo, payment settings, portal diag | **Shipped** (base) | Stripe price IDs prod (opérateur) |
| **J9** | AI Audit Guidance + Action Plan + System Builder skeleton | **Shipped** | — |
| **J10** | Payment Methods (Customer Portal) | **Shipped** | portal config |
| **J11** | Audio Explanations | **Shipped** | — |
| **J12** | Smart Locale + Currency Display | **Shipped** | geo/FX endpoints |
| **J13** | Analytics PostHog Phase A | **Shipped** | PostHog keys (set) |
| **PERF** (hors J) | cache SPA + chunk + Firestore long-poll + watchdog | **Shipped** | CF Cache Rules (opérateur) ✅ |
| **J1.4** | K3+ fork *(+ proposé v2.4 : surfaces SEO/GEO + Audit Express demo + PDF renderer)* | **Planned** | déterminisme, V1-lite, X1-lite, P1 |
| **J1.5** | K5 (RAG) + V1 + X1 + U1 | **Planned** | Vectorize/R2 ; déterminisme/scoring |
| **J1.6** | K6 Luna Copilot + W1 | **Planned** | V1/X1/K5 prêts ; Anthropic API ; déterminisme |
| **J1.7** | L3 + L4 + Y1 + Stripe setup/maintenance | **Planned** | K6 ; e-sign ; Stripe products |
| **J1.8** | R1 white-label + crédits | **Planned** | L3/L4 ; anti-abus crédits (Next) |
| **J1.9** | S1 + T1 (Sequenzy + SMS) | **Planned** | Sequenzy API ; Twilio ; webhooks |
| **J1.10** | Q1 auto-update (human-in-loop) | **Planned** | cron ; catalogues |
| **J2** | Production / secrets / monitoring / i18n | **Partial** (prod live ; i18n Next) | i18n (trad humaines) |

> Ordre §7 **inchangé** ; pull-forward demo/SEO/PDF = **proposition v2.4 non encore gatée** (attend approbation scope).

---

*Source canonique : `docs/cahier-des-charges-v2.4-FINAL.md` §0bis. Ce fichier = export de réutilisation.*
