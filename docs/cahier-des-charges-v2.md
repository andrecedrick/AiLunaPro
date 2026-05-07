# AUDIT AI / AiLunaPro — Cahier des charges v2

> **Document de référence consolidé** — fusion v1 (`# AUDIT AI  AILUNAPRO — Cahier des.md`),
> mise à jour Downloads + ajout pillars **Affiliation AiLunaPro** + **Tokens / Crédits IA**.
>
> Dernière mise à jour : 2026-05-06
>
> Ce document est la **source de vérité unique** pour le projet. Importer dans Notion via
> *Add a page → Import → Markdown*.

---

## Résumé final — la vision en une ligne

> **Audit AI / AiLunaPro = SaaS hybride combinant audit IA, conformité EU AI Act, détection
> Shadow AI, registre IA, recommandation d'agents IA, AiLunaPro All-in-One prioritaire,
> programme d'affiliation, installation, maintenance, AI Assurance, tokens / crédits IA,
> billing Stripe multi-currency, invoices, et portail client.**

---

## Sommaire

1. [Vision produit](#1-vision-produit)
2. [Les 3 piliers](#2-les-3-piliers)
3. [Pourquoi les entreprises passent à l'IA](#3-pourquoi-les-entreprises-passent-à-lia)
4. [Position commerciale : AiLunaPro priority](#4-position-commerciale)
5. [Modèle économique étendu](#5-modèle-économique-étendu)
6. [Catalogue Stripe complet](#6-catalogue-stripe)
7. [Tokens / crédits IA](#7-tokens-crédits-ia)
8. [Programme d'affiliation AiLunaPro](#8-programme-affiliation)
9. [Modules fonctionnels](#9-modules-fonctionnels)
10. [Architecture technique](#10-architecture-technique)
11. [État d'avancement](#11-état-davancement)
12. [Roadmap par phases](#12-roadmap)
13. [Sécurité & conformité technique](#13-sécurité)
14. [User stories](#14-user-stories)
15. [KPIs & critères de succès](#15-kpis)
16. [Glossaire](#16-glossaire)

---

## 1. Vision produit

### Ancienne vision
SaaS d'audit IA + conformité réglementaire + registre + scoring.

### Nouvelle vision (v2)
Plateforme **hybride 6-en-1** :

1. Outil d'audit IA structuré ;
2. Outil de conformité **EU AI Act** ;
3. Outil de **conseil automatisé** ;
4. **Moteur de recommandation** d'agents IA ;
5. Plateforme de **vente + maintenance + assurance** d'agents IA ;
6. Système d'**abonnement et facturation Stripe** multi-currency, multi-produits, avec
   **tokens IA** et **affiliation**.

### Différenciateur stratégique
Transformer une **contrainte légale coûteuse** (EU AI Act, deadline 2 août 2026) en
**avantage concurrentiel défendable** + **levier de monétisation** via AiLunaPro et
le programme d'affiliation.

---

## 2. Les 3 piliers

### Pilier A — Audit & Compliance Core

Cœur réglementaire :

- Cadrage audit (objectifs, parties prenantes, CSE) ;
- Inventaire IA officiel + Shadow AI ;
- Registre des systèmes IA (officiel obligatoire) ;
- Classification **EU AI Act** : Inacceptable / Haut Risque / Limité / Minimal ;
- **FRIA** (Fundamental Rights Impact Assessment, Article 27) ;
- **Article 4** / littératie IA + 7 règles d'or + attestations ;
- Gouvernance + éthique + sécurité ;
- Outils support : DLP / CASB / AI-SPM ;
- Rapports **COMEX** (radar maturité, matrice risques) ;
- Roadmap 90 jours ;
- Monitoring **dérive** (data drift, concept drift, F1 ≥ 0.95, drift < 2%) ;
- **Audit trail** automatisé ;
- Grille éthique **43 critères** (DNS).

### Pilier B — AI Transformation & Agent Offers

Recommandation et vente :

- Diagnostic business + AI maturity score ;
- Identification des tâches automatisables ;
- **Moteur de recommandation** (segmentation CA / taille / secteur / maturité) ;
- **AiLunaPro All-in-One recommandé en priorité** quand match ;
- Alternatives externes seulement si gap ;
- Calcul **ROI** automatique ;
- Installation agent IA (one-shot) ;
- Maintenance mensuelle ;
- **AI Assurance** ;
- **Tokens / crédits IA** ;
- Génération **proposition commerciale PDF**.

### Pilier C — Growth & Distribution (NOUVEAU v2)

Acquisition + monétisation passive :

- Programme d'**affiliation AiLunaPro existant** : intégrer codes de parrainage existants ;
- Tracking commissions (Stripe → cohorte attribution) ;
- Lead magnets viraux : Diagnostic Express public, ROI Calculator public ;
- Pricing Table publique (sans login) avec UTM tracking ;
- Tokens IA monétisés (consommables, recharges, top-ups).

---

## 3. Pourquoi les entreprises passent à l'IA

| Motivation | Bénéfice mesurable |
|---|---|
| Gagner du temps | Tâche 8h → 5min (automatisation) |
| Réduire coûts | Économie main-d'œuvre répétitive |
| Améliorer qualité | Réduction taux erreur 30% |
| Réduire erreurs | Détection anomalies, doublons, calculs |
| Productivité | Plus de dossiers / mêmes ressources |
| Relation client | Réponse 24/7, satisfaction, NPS > 60 |
| Exploitation données | Prédiction, anomalies, tendances |
| Décisions | Meilleur pilotage commercial |
| Rentabilité | ROI médian +159,8% sur 24 mois |

### Tâches automatisables (catalogue)

- Saisie de données ;
- Traitement de factures ;
- Relances clients ;
- Réponses e-mails automatiques ;
- Prise de rendez-vous ;
- Tri de CV ;
- Génération de rapports ;
- Résumé d'appels / réunions ;
- Classement de documents ;
- Support client simple ;
- Analyse de données ;
- Génération de devis ;
- Contrôle documentaire ;
- Suivi commercial ;
- Conformité documentaire.

**Objectif** : libérer les humains pour stratégie, vente, créativité, analyse, décision.

---

## 4. Position commerciale

### Règle produit
**AiLunaPro first, but not blindly.**

### Algorithme de recommandation

```
function recommend(profile):
  matches = aiLunaProAgents.filter(agent => agent.fits(profile))
  if matches.length > 0:
    return [
      { rank: 1, source: 'AiLunaPro', items: matches, badge: 'Recommended All-in-One' }
    ]
  else:
    return [
      { rank: 1, source: 'External', items: marketAlternatives.filter(...) },
      { note: 'AiLunaPro ne couvre pas encore ce besoin' }
    ]
```

### Output requis

- Pourquoi AiLunaPro est recommandé ;
- Problème résolu ;
- Gains attendus + ROI estimé ;
- Intégrations nécessaires ;
- Offre correspondante ;
- Quand une alternative externe est préférable.

### Affichage UI
Badge violet "**Recommended All-in-One**" sur les cartes AiLunaPro.
Section séparée "Alternatives marché" en dessous, plus discrète.

---

## 5. Modèle économique étendu

| # | Offre | Type Stripe | Récurrence |
|---|---|---|---|
| 1 | **Audit IA** (Express / Complet / Registre) | One-shot | × |
| 2 | **Abonnement SaaS** (Free / Starter / Pro / Enterprise) | Subscription | mensuel / annuel |
| 3 | **Installation agent IA** (Simple / Connecté CRM / Métier perso) | One-shot | × |
| 4 | **Maintenance** (Basic / Pro / Enterprise) | Subscription | mensuel |
| 5 | **AI Assurance** (Essential / Advanced / Enterprise) | Subscription add-on | mensuel |
| 6 | **Monitoring annuel** | Subscription | annuel |
| 7 | **Tokens IA** (recharge crédits) | One-shot top-up | × |
| 8 | **Pack Tokens** (subscription with monthly allocation) | Subscription metered | mensuel |

**Total Stripe products** : 8 catégories × 3 niveaux ≈ **24 produits**, tous multi-currency
(USD, EUR, GBP, CAD, AUD).

### Bundles commerciaux

- **Starter Pack** : Abonnement Starter + Installation Simple + Maintenance Basic
- **Growth Pack** : Pro + Install Connecté + Maintenance Pro + 5000 tokens/mois
- **Enterprise Pack** : Enterprise + Install Métier + Maintenance Enterprise + AI Assurance Advanced + 50000 tokens/mois
- **Compliance Pack** : Audit Complet + Registre + Article 4 Training + Monitoring annuel

---

## 6. Catalogue Stripe

### Naming convention produits

```
ailunapro_<category>_<tier>
ailunapro_audit_express
ailunapro_audit_complete
ailunapro_audit_registry
ailunapro_saas_free
ailunapro_saas_starter
ailunapro_saas_professional
ailunapro_saas_enterprise
ailunapro_install_simple
ailunapro_install_crm
ailunapro_install_custom
ailunapro_maintenance_basic
ailunapro_maintenance_pro
ailunapro_maintenance_enterprise
ailunapro_assurance_essential
ailunapro_assurance_advanced
ailunapro_assurance_enterprise
ailunapro_monitoring_annual
ailunapro_tokens_topup_5k
ailunapro_tokens_topup_25k
ailunapro_tokens_topup_100k
ailunapro_tokens_subscription_basic   (5k/mois)
ailunapro_tokens_subscription_pro     (25k/mois)
ailunapro_tokens_subscription_max     (100k/mois)
```

Chaque produit a un `prod_USl...` ID Stripe + 1-N prices (per currency × interval).

Mapping côté code : étendre `worker/src/lib/billing-admin-shared.ts` avec `PRODUCT_CATALOG`
typé. Frontend lit dynamiquement via `GET /api/billing/admin/products`.

---

## 7. Tokens / crédits IA

### Concept
Unité de consommation IA. 1 token ≈ 1 unit d'API call agent IA. Modèles consommateurs :

- Génération texte ;
- Analyse document ;
- Résumé ;
- Recommandation ;
- Audit automatique.

### Modes d'achat

**Top-up one-shot** :
| Pack | Prix USD | Tokens | Prix/token |
|---|---|---|---|
| Starter | $9.99 | 5 000 | $0.002 |
| Pro | $39.99 | 25 000 | $0.0016 |
| Max | $129.99 | 100 000 | $0.0013 |

**Subscription mensuel** (allocation auto + roll-over 1 mois) :
| Plan | Prix USD/mo | Tokens/mo |
|---|---|---|
| Basic | $9 | 5 000 |
| Pro | $35 | 25 000 |
| Max | $99 | 100 000 |

**Inclus dans plans SaaS** :
| Plan SaaS | Tokens/mo inclus |
|---|---|
| Free | 100 |
| Starter | 1 000 |
| Professional | 10 000 |
| Enterprise | 100 000 |

### Architecture technique

**Firestore** : `organizations/{orgId}/tokens/current`
```ts
{
  balance:           number,   // tokens disponibles
  monthlyAllocation: number,   // tokens du plan SaaS + subscription tokens
  consumed:          number,   // total mois en cours
  rollover:          number,   // tokens reportés du mois précédent (max 1 mois)
  lastReset:         ISOString, // début du cycle
  updatedAt:         ISOString,
}
```

**Sub-collection consommation** : `organizations/{orgId}/tokens/current/usage/{eventId}`
```ts
{
  eventId:    string,    // unique
  module:     'audit' | 'recommendation' | 'roi' | 'agent_call' | ...,
  tokens:     number,
  metadata:   object,    // ex: agentId, requestId
  at:         ISOString,
}
```

**Worker routes** :
- `GET /api/tokens/balance?orgId=...` → balance + allocation + consumed
- `POST /api/tokens/consume` (interne, idempotent) → décrémente balance, log usage
- `POST /api/tokens/topup` → Stripe Checkout one-shot, webhook ajoute tokens
- `GET /api/tokens/usage?orgId=...&from=...&to=...` → historique pour graphique

**Throttle** : si `balance ≤ 0` → 402 Payment Required + suggestion top-up dans UI.

**Stripe metered billing** (option avancée) : facturer overflow au-dessus de l'allocation
au tarif `$0.001/token`. Utiliser `stripe.billing.meterEvents.create()`.

---

## 8. Programme affiliation

### Référence existante
AiLunaPro a déjà un programme d'affiliation actif. Audit AI doit **intégrer** ce programme,
pas le recréer.

### Intégration

1. **Code de parrainage** : chaque user owner peut générer son code via Settings → Affiliation.
   Format : `AILUNA-{ORG_SLUG}-{RANDOM_4}` (ex: `AILUNA-ACME-XK7P`).

2. **Lien d'inscription** : `https://app.ailunapro.com/signup?ref=AILUNA-ACME-XK7P`
   - UTM auto-injecté
   - Stocké dans cookie 90 jours
   - Lu au signup → `users/{uid}.referredBy = code`

3. **Attribution commission** :
   - Webhook `customer.subscription.created` → si `referredBy` présent → écrit dans
     `affiliations/{code}/conversions/{subId}`
   - Commission : 20% du MRR du parrainé (12 mois) par défaut, configurable via Settings
   - Stripe Connect (futur) ou paiement manuel mensuel via export CSV

### Firestore data model

```
affiliations/{code}
  ownerUid:       string
  orgId:          string
  rate:           number (0.20 par défaut)
  active:         boolean
  createdAt:      ISOString

affiliations/{code}/conversions/{subId}
  referredOrgId:  string
  subscriptionId: string
  mrrUsd:         number
  startedAt:      ISOString
  status:         'active' | 'churned'

affiliations/{code}/payouts/{payoutId}
  amount:         number
  currency:       string
  paidAt:         ISOString
  reference:      string
```

### Worker routes

- `GET /api/affiliation/code?orgId=...` → code existant ou générer
- `GET /api/affiliation/conversions?orgId=...` → liste des filleuls
- `GET /api/affiliation/earnings?orgId=...` → calcul MRR cumul + commissions dues
- `POST /api/affiliation/payout` (admin uniquement) → marquer payout effectué

### UI

- **Settings → Affiliation** : code, lien copy-to-clipboard, dashboard earnings,
  liste conversions, historique payouts.
- **Public landing** : `https://app.ailunapro.com/?ref={code}` capture `?ref=` automatiquement.

---

## 9. Modules fonctionnels

### Modules existants à conserver
Dashboard · Audits · Reports · AI Registry · Team · Settings · Billing · Invoices ·
Stripe Checkout · Portal.

### Modules à ajouter (par priorité)

#### 9.1 Diagnostic Express *(P1 — lead magnet public)*
Questionnaire 10 min, public (sans login).
- Score maturité IA + risques principaux ;
- Recommandations immédiates ;
- AiLunaPro priority badge ;
- Email capture → signup pré-rempli.

#### 9.2 AI ROI & Automation Calculator *(P1 — viral)*
Standalone public.
- Inputs : tâche, fréquence, durée actuelle, taux horaire ;
- Outputs : temps gagné/mois, coût économisé, ROI, agent IA recommandé.

#### 9.3 AI Agent Recommendation Engine *(P1)*
- Inputs : CA annuel, secteur, taille équipe, tâches chronophages, outils existants, budget ;
- Sorties : top 3 agents avec AiLunaPro #1 si match, alternatives sinon, ROI, devis.

#### 9.4 Shadow AI Survey *(P2)*
- Sondage anonyme partageable par lien public ;
- Cartographie usages non-déclarés ;
- Statut approuvé / non approuvé + niveau de risque ;
- Plan d'encadrement.

#### 9.5 EU AI Act Classification Engine *(P1)*
- Questionnaire auto-classification 4 niveaux ;
- Justification + obligations + recommandations.

#### 9.6 FRIA Module *(P2)*
- Article 27 — droits fondamentaux ;
- Vie privée / non-discrimination / transparence / recours ;
- Export rapport.

#### 9.7 Article 4 Training *(P2)*
- Guide IA responsable + 7 règles d'or ;
- Attestation lecture + signature électronique ;
- Tracking employés formés ;
- Export preuve conformité.

#### 9.8 Installation & Maintenance Module *(P1 — revenue)*
- Devis installation 3 niveaux ;
- Abonnement maintenance ;
- AI Assurance bundle ;
- Génération proposition PDF ;
- Suivi installation.

#### 9.9 AI Assurance *(P2)*
- État santé agent IA ;
- Score qualité réponse ;
- Incidents + sauvegardes + recommandations ;
- Rapport mensuel.

#### 9.10 Tokens IA Module *(P1)*
- Balance + allocation + consommation ;
- Top-up + subscription tokens ;
- Graphique usage ;
- Throttle 402 + CTA top-up.

#### 9.11 Affiliation Module *(P1)*
- Code parrainage + lien ;
- Dashboard earnings ;
- Conversions + payouts.

#### 9.12 COMEX Report Generator *(P2)*
- Format radar maturité ;
- Matrice risques priorisés ;
- Cartographie usages + Shadow AI ;
- Plan d'action 90 jours ;
- Export PDF.

#### 9.13 Drift Monitoring *(P3)*
- Métriques F1, data drift, concept drift, équité ;
- Alertes seuil ;
- Audit trail enrichi.

---

## 10. Architecture technique

### Stack

```
Frontend:    React + Vite + TypeScript + Firebase JS SDK (Auth, Firestore)
Backend:     Cloudflare Workers (Hono v4) + Stripe SDK + Firestore REST (service account JWT)
DB:          Firestore (multi-tenant via /organizations/{orgId}/...)
Auth:        Firebase Auth (real) + mock layer pour dev
Payments:    Stripe (test mode actuel, prod J2) + Stripe Connect (futur affiliation)
Storage:     Firebase Storage (assets, exports PDF) + R2 (futur)
Hosting:     Vercel/Netlify (frontend) + Cloudflare Workers (worker)
```

### Multi-tenant

```
/organizations/{orgId}
  /members/{uid}
  /audits/{auditId}
    /answers/{answerId}
  /reports/{reportId}
    /exports/{exportId}
  /registry/{systemId}
  /shadow-ai/{surveyId}
  /fria/{evalId}
  /trainings/{certId}
  /subscriptions/current        ← Stripe sync (J1)
  /billing_config/current       ← admin metadata (I.6 + J1.3)
  /tokens/current               ← NOUVEAU v2 (J1.4A)
  /tokens/current/usage/{eventId}       ← NOUVEAU v2 (J1.4A)
  /tokens/current/topups/{stripeSessionId} ← NOUVEAU v2 (J1.4A)
/affiliations/{code}            ← NOUVEAU v2
  /conversions/{subId}
  /payouts/{payoutId}
```

### Routes worker (état + cible)

| Catégorie | Route | État |
|---|---|---|
| Health | `GET /healthz` | ✅ |
| Auth | `GET /api/me` | ✅ |
| Audit | `POST /api/audits/:id/submit` | ⏳ skel |
| Reports | `POST /api/reports/:id/export` | ⏳ skel |
| Team | `POST /api/team/invite` | ⏳ skel |
| Billing checkout | `POST /api/billing/checkout` | ✅ J1.3 |
| Billing portal | `POST /api/billing/portal` | ✅ J1 |
| Billing sync | `POST /api/billing/sync-session` | ✅ J1.2 |
| Billing invoices | `GET /api/billing/invoices` | ✅ J1.2 |
| Stripe webhook | `POST /api/stripe/webhook` | ✅ J1 |
| Admin status | `GET /api/billing/admin/status` | ✅ J1.3A |
| Admin products | `GET /api/billing/admin/products` | ✅ J1.3A |
| Admin prices | `POST /api/billing/admin/prices` | ✅ J1.3A |
| Admin currency | `GET /api/billing/admin/exchange-rates` `POST /currency-settings` | ✅ J1.3A |
| Admin promos | `GET/POST /api/billing/admin/promotion-codes` | ⏳ J1.3B |
| Admin payment | `GET/POST /api/billing/admin/payment-settings` | ⏳ J1.3B |
| Tokens balance | `GET /api/tokens/balance` | ❌ |
| Tokens consume | `POST /api/tokens/consume` | ❌ |
| Tokens top-up | `POST /api/tokens/topup` | ❌ |
| Tokens usage | `GET /api/tokens/usage` | ❌ |
| Affiliation code | `GET /api/affiliation/code` | ❌ |
| Affiliation stats | `GET /api/affiliation/conversions` `GET /earnings` | ❌ |
| Affiliation payout | `POST /api/affiliation/payout` | ❌ |
| Diagnostic public | `POST /api/diagnostic/express` | ❌ |
| ROI calc public | `POST /api/roi/calculate` | ❌ |
| Recommendation | `POST /api/recommendation/agents` | ❌ |
| Shadow AI survey | `GET/POST /api/shadow-ai/survey` | ❌ |
| EU AI Act classify | `POST /api/eu-ai-act/classify` | ❌ |
| FRIA | `POST /api/fria/evaluate` | ❌ |

---

## 11. État d'avancement

### Phases commitées

| Phase | Commit | Contenu |
|---|---|---|
| A | `ff7fcb6` | Dashboard import |
| B | `857728d` | API contracts |
| C | `d46df31` | Tests + validators |
| D | `3c71dae` `7a4e472` | Hardening |
| E | `1c065f5` | Dual-mode |
| E2 | `f4b2b06` | Firestore rules |
| F.1 | `0c8b58b` | Registry |
| F.2 | `e82e856` | Audits |
| F.3 | `d6b0da0` | Reports |
| Auth reset | `245b493` | Forgot password |
| G | `8e7f6e6` | Worker skeleton |
| Perf | `89f6c91` | Lazy-load |
| H | `83231f7` | Settings |
| I | `2daee3f` | Billing UI mock |
| I.5 | `918b96f` | Diagnostic Stripe read-only |
| I.6 | `7814ff0` | Metadata editor |

### Phases non commitées (en review)

- **J1** : Stripe checkout réel + portal + webhook + custom 4-col grid
- **J1.1** : Stripe Pricing Table embed (gardé fallback)
- **J1.2** : Sync-session + invoices + Vite proxy + hash routing
- **J1.3A** : Admin status + currency multi (USD/EUR/GBP/CAD/AUD) + products/prices + auto-detect locale + persist localStorage

### Phases manquantes

- **J1.3B** : promo codes + payment settings + portal diagnostic
- **K1-K3** : Diagnostic Express + ROI Calc + Recommendation Engine
- **K4** : EU AI Act classifier + Registre enrichi
- **L1-L2** : Installation + Maintenance + Insurance + Devis PDF
- **M1-M3** : Shadow AI Survey + FRIA + Article 4 Training
- **N1** : COMEX Report
- **O** : Tokens IA module *(NOUVEAU v2)*
- **P** : Affiliation module *(NOUVEAU v2)*
- **J2** : Production deploy + monitoring + i18n

---

## 12. Roadmap

### Sprint 1 (1-2 semaines) — Stabilisation J1 + J1.3B

1. Deploy Firestore rules (debloquant) ;
2. Test E2E J1.3A ;
3. Commits séparés J1 → J1.1 → J1.2 → J1.3A ;
4. Implémenter J1.3B (promo + payment settings + portal panel) ;
5. Test E2E full billing.

### Sprint 2 (2 semaines) — Lead magnets + Recommendation

6. **K1** Diagnostic Express public ;
7. **K2** ROI Calculator public ;
8. **K3** AI Agent Recommendation Engine ;
9. AiLunaPro priority constant + badge UI partout ;
10. Catalogue Stripe étendu (24 produits).

### Sprint 3 (2 semaines) — Compliance core

11. **K4** EU AI Act Classifier ;
12. Registre IA enrichi (FRIA fields, base légale, mitigation, supervision, score) ;
13. Bundles commerciaux ;
14. Génération proposition PDF.

### Sprint 4 (2 semaines) — Revenue expansion

15. **L1** Installation Module + Stripe one-shot products ;
16. Maintenance subscription ;
17. **L2** AI Assurance + Stripe add-on ;
18. Module commercial unifié.

### Sprint 5 (2 semaines) — Tokens IA

19. **O1** Tokens Firestore data model + balance ;
20. Worker routes consume / topup / usage ;
21. Stripe metered billing setup ;
22. UI tokens dashboard + throttle 402 ;
23. Inclusion tokens dans plans SaaS.

### Sprint 6 (1-2 semaines) — Affiliation

24. **P1** Programme affiliation : code generation + Firestore data model ;
25. Worker routes affiliation ;
26. UI Settings → Affiliation (dashboard earnings) ;
27. Webhook attribution commissions ;
28. Public landing `?ref=` capture.

### Sprint 7 (2 semaines) — Compliance avancée

29. **M1** Shadow AI Survey ;
30. **M2** FRIA Module ;
31. **M3** Article 4 Training + Attestation.

### Sprint 8 (1 semaine) — Reporting & finalisation

32. **N1** COMEX Report Generator ;
33. Export PDF réel (jspdf worker) ;
34. Drift monitoring (option) ;
35. Audit trail enrichi.

### Sprint 9 (2 semaines) — Production

36. **J2** Wrangler deploy production ;
37. KV idempotency webhook ;
38. Sentry / monitoring ;
39. Email Cloud Functions (cancel, payment failed, renewal) ;
40. Rate limit Hono ;
41. CSP strict ;
42. Custom domain `api.ailunapro.com`.

### Sprint 10 (2 semaines) — i18n + multi-seat

43. i18n FR / EN / DE / ES ;
44. Multi-seat billing (quantity) ;
45. Stripe Tax integration ;
46. Refund/dispute UI.

---

## 13. Sécurité

### Règles immuables

- ❌ **Jamais** de `sk_live_` en `.dev.vars` (guard 403 actif via `assertStripeKeyAllowed` — APP_ENV doit être `production` pour autoriser `sk_live_`) ;
- ✅ `APP_ENV` en production via Cloudflare secret ou `[env.production.vars]` uniquement, **jamais** dans le `[vars]` global de `wrangler.toml` ;
- ✅ Firestore rules deploy : `npx firebase deploy --only firestore:rules --project audit-ai-cc9e2` (vérification manuelle dans Firebase Console après chaque deploy) ;
- ❌ **Jamais** de secrets dans le frontend ;
- ❌ **Jamais** de secrets dans Firestore (`stripSecrets` defense-in-depth) ;
- ❌ **Jamais** de `auto-fallback` silencieux sur monnaie/produit ;
- ✅ Owner-only sur toutes les routes admin (`requireOwner`) ;
- ✅ Webhook Stripe signature verification (`constructEventAsync`) ;
- ✅ Idempotency webhook events (Firestore `processed_events/{id}` à venir) ;
- ✅ Audit log toutes actions admin (à venir) ;
- ✅ Rate limit Hono sur routes admin (à venir) ;
- ✅ CSP strict (à venir).

### Conformité métier

- **EU AI Act** Article 4 — littératie IA documentée ;
- **EU AI Act** Article 27 — FRIA pour systèmes Haut Risque ;
- **EU AI Act** Articles 53/55 — clauses GPAI providers ;
- **RGPD** — DPIA pour traitements personnels ;
- **Souveraineté** — option SecNumCloud (futur) ;
- **Sanctions risque** — alerter user si système classé Inacceptable.

---

## 14. User stories

### Côté entreprise cliente

- **US-01** En tant qu'entreprise, je veux réaliser un diagnostic IA rapide (10 min) pour
  savoir quelles tâches je peux automatiser.
- **US-02** Je veux recevoir une recommandation d'agents IA adaptée à mon CA et mes besoins.
- **US-03** Je veux voir en priorité les solutions AiLunaPro avant les outils externes.
- **US-04** Je veux connaître le ROI estimé d'un agent IA avant l'installation.
- **US-05** Je veux souscrire à une maintenance mensuelle.
- **US-06** Je veux une AI Assurance pour réduire les risques.
- **US-07** Je veux acheter des tokens IA pour utiliser les agents.
- **US-08** Je veux suivre ma consommation tokens et recharger automatiquement.
- **US-09** Je veux parrainer d'autres entreprises et toucher des commissions.
- **US-10** Je veux générer un Registre IA conforme EU AI Act.
- **US-11** Je veux classer mes systèmes par niveau de risque.
- **US-12** Je veux faire un sondage Shadow AI anonyme dans mon entreprise.
- **US-13** Je veux former mes équipes Article 4 + attestation signée.
- **US-14** Je veux exporter un rapport COMEX en PDF.

### Côté administrateur

- **US-A1** Configurer prix par devise (J1.3A ✅).
- **US-A2** Activer/désactiver devises supportées (J1.3A ✅).
- **US-A3** Créer codes promo (J1.3B).
- **US-A4** Configurer méthodes de paiement (J1.3B).
- **US-A5** Suivre santé Stripe + dernier webhook (J1.3A ✅).
- **US-A6** Gérer le catalogue de produits IA (créer / désactiver).
- **US-A7** Voir le dashboard affiliation global + payouts.

### Côté plateforme (auto)

- **US-P1** Tracker `?ref=` cookie 90 jours.
- **US-P2** Attribuer commissions au signup → subscription.
- **US-P3** Décrémenter tokens balance sur chaque appel agent.
- **US-P4** Throttle 402 quand balance ≤ 0.
- **US-P5** Persister `subscription.currency` au webhook.

---

## 15. KPIs

### Performance technique

| Métrique | Cible |
|---|---|
| Worker latence p95 | < 200 ms |
| Firestore read p95 | < 100 ms |
| Stripe API p95 | < 500 ms |
| Frontend TTI | < 2.5 s |
| Uptime | 99.9% |

### Performance audit IA

| Métrique | Cible |
|---|---|
| F1-score modèles | > 0.95 |
| Latence inférence | < 25 ms |
| Drift (concept) | < 2% |
| Score équité | > 0.95 |
| Taux explicabilité | 100% |

### Business

| Métrique | Cible |
|---|---|
| ROI projets clients | > 300% |
| Taux automatisation processus | > 75% |
| Contribution IA au CA client | > 20% |
| Adoption utilisateurs | > 80% |
| Investissement formation | > 25% budget IA |

### Plateforme

| Métrique | Cible |
|---|---|
| MRR croissance | +15% mensuel |
| Conversion Free → Paid | > 5% |
| Churn mensuel | < 3% |
| Affiliation : conversions/affilié | > 2 |
| Tokens auto-recharge | > 60% utilisateurs payants |

---

## 16. Glossaire

| Terme | Définition |
|---|---|
| **EU AI Act** | Règlement européen sur l'IA (2024). Deadline mise en conformité 2 août 2026 |
| **Shadow AI** | Outil d'IA utilisé en entreprise sans approbation officielle (≈ 49% des outils IA) |
| **Registre IA** | Document officiel listant tous les systèmes IA d'une organisation |
| **FRIA** | Fundamental Rights Impact Assessment — Article 27 EU AI Act |
| **CASB** | Cloud Access Security Broker |
| **DLP** | Data Loss Prevention |
| **AI-SPM** | AI Security Posture Management |
| **CSE** | Comité Scientifique et Éthique |
| **XAI** | Explainable AI |
| **GPAI** | General Purpose AI (modèles fondation type GPT, Claude) |
| **Article 4** | Obligation EU AI Act de littératie IA pour les équipes |
| **Garantie Humaine** | Human-in-the-Loop sur décisions IA |
| **Drift** | Dégradation performance modèle après déploiement |
| **Token IA** | Unité de consommation IA dans la plateforme |
| **All-in-One** | Solution unique couvrant plusieurs cas d'usage (AiLunaPro) |
| **Affiliation** | Programme de parrainage commission % du MRR du parrainé |

---

## Annexe A — Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-27 | Architecture: CF Workers + Hono | Edge runtime, no Node.js |
| 2026-04-27 | Pas firebase-admin sur worker | Incompatible CF runtime — REST + JWT à la place |
| 2026-05-01 | Stripe v22 (`2026-04-22.dahlia`) | Latest stable, `current_period_*` sur SubscriptionItem |
| 2026-05-01 | `127.0.0.1` au lieu de `localhost` | IPv6/IPv4 ambiguity Windows |
| 2026-05-02 | Vite proxy `/api` → worker | Évite CORS preflight + IPv6 issue |
| 2026-05-03 | Custom 4-col pricing grid | Stripe Pricing Table trop rigide pour multi-currency + Free |
| 2026-05-04 | Multi-currency = real Stripe Prices | FX live = display only, jamais billing |
| 2026-05-05 | Pas de fallback silencieux currency | 400 explicite si user choisit currency sans price |
| 2026-05-06 | Tokens IA + Affiliation = nouveaux piliers v2 | Demande utilisateur, élargit modèle économique |

---

## Annexe B — Outils & références

- **EU AI Act** — https://artificialintelligenceact.eu/
- **Bpifrance IA Booster** — https://www.bpifrance.fr/nos-actualites/ia-booster
- **DNS Grille 43 critères** — Délégation au Numérique en Santé
- **Stripe API** — https://stripe.com/docs/api
- **Cloudflare Workers** — https://developers.cloudflare.com/workers/
- **Firebase** — https://firebase.google.com/docs
- **Open Exchange Rates** — https://open.er-api.com (FX display)

---

## Annexe C — Templates check-listes

### Audit Express 90 jours

- **J1-30** Inventaire (officiel + Shadow AI sondage anonyme)
- **J31-60** Documentation (Registre IA + classification + FRIA)
- **J61-90** Formation Article 4 + attestations + monitoring

### Registre IA — colonnes minimales

| # | Colonne | Type |
|---|---|---|
| 1 | Outil IA | string |
| 2 | Département | string |
| 3 | Finalité | text |
| 4 | Données traitées | enum |
| 5 | Statut approbation | bool |
| 6 | Niveau de risque EU AI Act | enum |
| 7 | Base légale | enum |
| 8 | Mesures de mitigation | text |
| 9 | Supervision humaine | text |
| 10 | Score conformité | number |

### 7 Règles d'Or (Article 4)

1. Confidentialité ;
2. Vigilance (vérifier hallucinations) ;
3. Transparence ;
4. Conformité (outils approuvés) ;
5. Garantie Humaine ;
6. Sécurité (signaler incidents) ;
7. Permissions (Copilot/Gemini scopes).

---

**Fin du cahier des charges v2.**

*Document maintenu en parallèle de l'implémentation. Toute décision architecturale ou
business doit être ajoutée à l'Annexe A — Decisions log.*
