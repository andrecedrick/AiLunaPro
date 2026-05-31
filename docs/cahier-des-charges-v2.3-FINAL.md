# AUDIT AI / AiLunaPro — Cahier des charges v2.4 (FINAL, prêt pour Claude Code)

> **Remplace v2.1/v2.2/v2.3.** À fusionner dans `cahier-des-charges-v2.md`.
> Contient les specs détaillées de **K6 Luna Copilot**, la **calibration € de L3**, le **barème tokens R1**,
> 4 modules : **V1 Analyse de site**, **W1 Matrice Quick Win**, **X1 Audit de l'IA en place
> (réduction OPEX)**, **Y1 SOP**, **+ NFR (§7bis)** et **SEO & GEO (§7ter)** comme guardrails permanents.
> **v2.4 ajoute** : principe **Déterminisme & traçabilité** (§0.4), **Audit Express** killer demo publique
> (§3bis), **P1 PDF Report Renderer** (§3ter), **surfaces SEO/GEO concrètes** (§7ter étendu),
> **gating §17 étendu** (déterminisme + traçabilité + artefact + budgets perf, §7quater).
> Dernière mise à jour : 31 mai 2026.
>
> ⚠️ **Guardrail permanent** : finir d'abord J1.3A/J1.3B (billing admin, multi-currency, promo codes,
> payment settings, portal diagnostics). **Ne pas casser** checkout / invoices / portal. Les modules
> s'ouvrent dans l'ordre de la roadmap §10.
>
> 💶 **Note prix** : les montants € (L3) et le barème de crédits (R1) sont des **calibrations de départ
> à valider** contre les coûts réels et le marché. Paramétrables en admin et rafraîchis par Q1.

---

## 0. Les 3 principes directeurs

1. **Zéro-expertise** : utilisable seul de A à Z par un non-technicien. Pas d'écran vide, 1 action/écran, langage simple, « Luna le fait pour moi ».
2. **La collecte fait la qualité** : questionnaire + documents + site + IA existante = audit et conseil de qualité.
3. **Transparence = crédibilité** : « AiLunaPro est notre solution » affiché ; on dit quand l'externe est meilleur. Condition du N°1.
4. **Déterminisme & traçabilité** *(NON NÉGOCIABLE)* : un même input doit produire un même audit scoré.
   Le LLM **extrait** (température 0, structuré) ; le **scoring/classement est rule-based en code** (pas par le LLM) ;
   chaque résultat est **versionné (snapshot)** ; **aucun chiffre/risque sans source cliquable**. Cadre produit :
   AiLunaPro **aide à la préparation** EU AI Act — **jamais d'attestation/certification de conformité ni de conseil juridique**.

---

## 1. Recherche marché 2026 (inputs)

- **OpenClaw** & **Hermes Agent** = frameworks d'agents open-source auto-hébergés, model-agnostic, multi-canal → cibles d'**installation gérée** par André.
- **Benchmarks prix** : VPS 5-50 $/mo · conseil IA 100-450 $/h · retainers 5-25 k$/mo · automation 2,5-15 k$/mo · +20-40 % d'intégration cachée · dev custom 15 k$+ (le managed se positionne **sous** le custom = value prop).
- **Concurrence** lourde/grande-entreprise (Credo AI, Holistic AI, IBM, OneTrust, Modulos, Sprinto, FairNow) → **white space PME/indépendants guidé + clé-en-main**. Échéance EU AI Act **2 août 2026**.
- **Récupération revenus** : **Sequenzy** (email SaaS, dunning + panier abandonné, API REST + MCP) + **SMS** Twilio/Sakari/Vonage.

---

## 2. Le Parcours Audit AI (9 étapes, orchestré par Luna)

| # | Étape | Contenu | Modules |
|---|---|---|---|
| 1 | **Bienvenue & objectif** | gagner du temps / réduire coûts / conformité | U1 · K1A |
| 2 | **Profil + Analyse de site** | profil express (tap) **+ analyse auto du site** si dispo | U1 · K1A · **V1** |
| 3 | **Mes documents** | upload SOP/org/process (ou Luna pose des questions) | K5 |
| 4 | **Diagnostic + IA en place** | tâches automatisables, Shadow AI, EU AI Act **+ audit de l'IA déjà utilisée** | K4 · **X1** |
| 5 | **Quick Wins** | **matrice Impact × Effort** scorée, top priorités | **W1** |
| 6 | **Mon ROI** | économies €/mois + h/semaine + payback | K2A |
| 7 | **Ma reco** | AiLunaPro **ou** agents gérés (OpenClaw/Hermes) | K3+ |
| 8 | **Ma décision** | Luna compare, lève les objections, fait choisir | K6 |
| 9 | **Mon offre + SOP** | devis + contrat (ou abo AiLunaPro) **+ génération de SOP** | L3 · L4 · **Y1** |
| → | **Après** | déploiement géré + cockpit + suivi mensuel + expert IA | L3 · S1 |

---

## 3. MODULES

### U1 — Mode Assisté Zéro-Expertise *(transversal)*
Wizard linéaire (1 écran/action, progression n/9), choix pré-remplis, langage simple + toggle
« Explique-moi simplement », bouton « Luna le fait pour moi », reprise auto (lien email/SMS),
mobile-first + entrée WhatsApp, FR/EN. **AC** : un non-technicien complète les 9 étapes seul.

### V1 — Analyse de site *(NOUVEAU, priorité haute)*
- **Objectif** : analyser le site de l'**entreprise / autoentrepreneur / particulier** pour collecter
  l'information disponible et pré-remplir le profil.
- **Inputs** : URL (optionnelle). Si pas de site → Luna bascule sur questions (zéro friction).
- **Pipeline** : fetch + crawl léger (pages clés : accueil, à propos, services, contact, mentions) →
  extraction LLM (description activité, offres, cible, équipe, localisations, coordonnées) +
  **détection de stack** (CMS, analytics, outils marketing, **widgets/chatbots IA, scripts d'IA**).
- **Outputs** : pré-remplit `company_profile` + alimente **X1** (inventaire IA détecté) et **K5**.
- **Garde-fous** : respect robots.txt, pas de scraping intrusif, données publiques uniquement, validation user de la fiche.
- **AC** : une URL → fiche entreprise pré-remplie + liste d'outils/IA détectés, éditable par l'user.

### K5 — Document Intelligence (RAG)
Upload PDF/DOCX/XLSX/CSV → R2 + **Vectorize (namespace orgId)** → fiche entreprise auto + **audit
quality score**. Chiffrement at-rest, détection PII, isolation org, effacement. **AC** : 3 docs → fiche
+ ≥ 5 tâches + ≥ 1 risque, traçables aux sources.

### W1 — Matrice Quick Win *(NOUVEAU, priorité haute)*
- **Objectif** : appliquer à chaque utilisateur la **matrice Impact × Effort** sur les tâches détectées.
- **Inputs** : tâches automatisables (diagnostic K4 + docs K5 + site V1 + IA en place X1).
- **Scoring** :
  ```
  Impact (0-5)  = w1·temps_gagné + w2·coût_évité + w3·revenu_potentiel + w4·risque_réduit
  Effort (0-5)  = w1·complexité + w2·intégrations + w3·préparation_données + w4·conduite_changement
  Score = Impact / Effort   →   classement
  Quadrants : Quick Win (Impact↑/Effort↓) · Projet (Impact↑/Effort↑) · Bonus (Impact↓/Effort↓) · À éviter (Impact↓/Effort↑)
  ```
- **Outputs** : matrice 2×2 visuelle (cockpit) + liste priorisée + « commence par ces 3 ».
- **AC** : à partir des tâches détectées, l'user voit une matrice + un top 3 expliqué en langage simple.

### X1 — Audit de l'IA en place & réduction OPEX *(NOUVEAU, priorité haute)*
- **Objectif** : examiner les systèmes IA déjà utilisés et **proposer des modifications pour réduire l'OPEX**.
- **Inputs** : IA détectée (V1) + déclarée (questionnaire) + docs (factures/abonnements via K5).
- **Logique** :
  1. inventorier les outils IA actuels + leur coût mensuel estimé ;
  2. détecter redondances / chevauchements / outils surdimensionnés / Shadow AI ;
  3. proposer : consolidation (souvent vers AiLunaPro), changement de modèle (cf. model_catalog),
     renégociation, suppression de doublons, agents gérés là où c'est moins cher ;
  4. **quantifier l'économie OPEX (€/mois, %) + payback**.
- **Outputs** : « stack actuel vs stack optimisé », économie chiffrée (sourcée, pas de promesse), feed ROI (K2A) et reco (K3+).
- **AC** : un inventaire de 3+ outils IA → tableau avant/après + économie €/mois estimée + 3 actions concrètes.

### K3+ — Recommendation Fork (AiLunaPro-first vs agents gérés) *(extension K3A)*
Score de couverture AiLunaPro ; ≥ seuil → AiLunaPro (badge) ; sinon → agents gérés (L3). Output : pourquoi,
problème résolu, gains+ROI, intégrations, offre, « quand l'externe est préférable ». Transparence obligatoire.

---

### K6 — Luna Copilot — **SPEC TECHNIQUE DÉTAILLÉE** *(priorité haute, J1.6)*

**Rôle** : agent conversationnel qui **parle et réfléchit avec l'utilisateur**, orchestre automatiquement
les 9 étapes jusqu'à une bonne décision.

**Stack**
- **Runtime** : Cloudflare Worker, réponse **streaming SSE** (`ReadableStream`).
- **État** : Firestore `audit_sessions/{sessionId}`.
- **Orchestrateur** : Anthropic API (Claude) en **tool use** ; modèle paramétrable via `model_catalog` (Q1).
- **RAG** : Vectorize + R2 (K5). **Auth** : compte requis pour sauvegarder ; entrée publique anonyme possible (Turnstile, session éphémère) qui incite à créer un compte pour recevoir l'offre.

**Boucle agentique (par tour)**
```
1. charger session (state + historique)
2. construire messages = [system prompt] + [résumé d'état] + [historique tronqué] + [message user]
3. appeler Claude avec la liste d'outils
4. tant que la réponse contient un tool_use (max N=6 itérations/tour) :
     exécuter l'outil serveur → ajouter tool_result → rappeler Claude
5. streamer le texte final à l'utilisateur (SSE)
6. persister state (currentStep, collected, decisions, messages, toolCalls)
```

**State machine**
- `currentStep` ∈ 1..9 · `collected{}` · `decisions[]` · `flags[]` (ex. `no_website`, `low_data`).
- **Gating déterministe** : ROI (étape 6) requiert profil + diagnostic ; reco (7) requiert ROI + besoins ;
  devis (9) requiert reco = « agents gérés ». Luna peut revisiter une étape.

**Outils exposés (function calling)**
| Outil | Input | Output |
|---|---|---|
| `analyze_site` | `{url}` | profil + stack/IA détectés (V1) |
| `query_documents` | `{query}` | extraits RAG (K5) |
| `run_diagnostic` | `{answers}` | tâches automatisables + scores (K4) |
| `audit_existing_ai` | `{inventory}` | stack actuel vs optimisé + économie OPEX (X1) |
| `quick_win_matrix` | `{tasks}` | matrice + priorisation (W1) |
| `classify_eu_ai_act` | `{systems}` | niveaux de risque |
| `calculate_roi` | `{params}` | économies + payback (K2A) |
| `recommend_agents` | `{profile,needs}` | fork AiLunaPro/externe (K3+) |
| `build_quote` | `{scope}` | devis géré (L3) |
| `draft_contract` | `{quoteId}` | contrat (L4) |
| `generate_sop` | `{process}` | SOP structuré (Y1) |
| `save_audit_state` | `{patch}` | persistance |

**System prompt (ossature)**
- **Persona** : « Luna », conseillère IA — claire, bienveillante, professionnelle, pédagogue ; tutoie/vouvoie selon préférence.
- **Mission** : mener l'user étape par étape jusqu'à une décision éclairée, en langage simple.
- **Règles** : 1 question à la fois ; toujours proposer des choix ; **aucun chiffre non sourcé** ;
  **validation humaine** sur les décisions clés ; **transparence AiLunaPro-first** + dire quand l'externe est mieux ;
  rester dans le scope audit/IA ; **ne jamais exposer de PII** issue des docs dans les logs ;
  proposer « je le fais pour toi » si l'user hésite.
- **Style de sortie** : court, concret, étape annoncée, action claire.

**Protocole de streaming (events SSE)**
`token` (texte) · `step` (changement d'étape + progression) · `tool_start`/`tool_end` (surfacés en langage
simple : « J'analyse ton site… », « Je calcule ton ROI… ») · `action` (boutons : souscrire / demander devis /
signer) · `error` · `done`.

**Limites & robustesse**
- Max 6 itérations d'outils/tour ; **cap coût/session** ; troncature + résumé de l'historique au-delà de X tokens ;
  timeout par outil ; retries idempotents ; rate-limit par org ; en cas d'échec LLM/outil → message gracieux + fallback formulaire.

**Data model `audit_sessions`**
```
{ sessionId, orgId, userId|null, channel: web|whatsapp,
  status: active|completed|abandoned, currentStep,
  collected: { profile, siteAnalysis, documents[], diagnostic, existingAI, quickWins, roi, recommendation, quote, contract, sops[] },
  decisions: [], flags: [], messages: [], toolCalls: [], cost, createdAt, updatedAt }
```

**API**
- `POST /api/copilot/session` → `{sessionId}`
- `POST /api/copilot/message` `{sessionId, message}` → **SSE stream**
- `GET /api/copilot/session/{id}` → état (reprise)

**Acceptance**
- En une session, Luna produit : profil (+ site si dispo) → diagnostic + audit IA existante → matrice Quick Win →
  ROI → reco forkée → décision → offre (devis+contrat ou abo) → SOP, **sans formulaire mort**, en langage simple,
  avec sauvegarde/reprise, et sans exposer de PII.

---

### L3 — Devis & Installation GÉRÉE — **CALIBRATION € DÉTAILLÉE** *(J1.7)*

> Rappel : **André héberge et installe** OpenClaw/Hermes **sur ses serveurs** (service géré). Le devis
> couvre tout + le **mensuel** + la **facturation**. Montants ci-dessous = **calibration de départ à valider**.

**Hypothèses de coût André (paramétrables, MAJ par Q1)**
| Poste | Coût interne estimé /mois |
|---|---|
| Serveur mutualisé (Starter) | ~€10-15 |
| Serveur dédié (Pro) | ~€40-80 |
| Serveur GPU / modèles locaux (Métier souverain) | ~€150-400 |
| API LLM par agent (usage) | ~€20-150 selon volume |
| Maintenance (temps/outillage) | variable selon palier |

**Paliers proposés (prix client, €)**
| Palier | Inclus | Setup one-shot | Mensuel (hébergement + maintenance + assurance) |
|---|---|---|---|
| **Starter** | 1 agent, 1-2 canaux, serveur mutualisé, monitoring de base | **€490 – €990** | **€99 – €199 /mo** |
| **Pro** | multi-agent, CRM + outils, skills custom légers, serveur dédié | **€1 900 – €3 900** | **€299 – €599 /mo** |
| **Métier** | sur-mesure, intégrations profondes, dédié/souverain, SLA renforcé | **€6 000 – €15 000+** | **€900 – €2 500 /mo** (+ usage) |

- **AI Assurance** (add-on) : **+€49 – €199 /mo** ou **+10-20 %** du mensuel.
- **API LLM** : incluse avec plafond (Starter/Pro) ou refacturée à l'usage (Métier).

**Formule du moteur de devis**
```
Setup    = Palier_setup + Σ(intégrations) ;  appliquer ×1.2 à ×1.4 (intégration/imprévus)
Mensuel  = Hébergement + Maintenance(palier) + Assurance(option) + API_LLM_estimée + Marge
```
**Exemple (Pro, 2 intégrations CRM/Slack)** : Setup = (2 900 + 2×400) × 1.3 ≈ **€4 810** ;
Mensuel ≈ Hébergement 60 + Maintenance 250 + Assurance 120 + API 90 + marge → **≈ €520/mo**.

**Contenu obligatoire du devis** : specs serveur, périmètre (agents/canaux/intégrations/modèles), setup
détaillé, mensuel détaillé, conditions de facturation (devise, périodicité, mise en service, engagement,
résiliation), **SLA** (dispo visée, délais support, périmètre incident), checklists install + formation.

**Flux** : Luna `build_quote` → revue/édition admin → **contrat L4** → acceptation + signature → Stripe
(setup one-shot + abonnements récurrents) → ouverture projet + checklist d'install.

---

### L4 — Génération de Contrat *(couplé à L3, J1.7)*
À l'acceptation du devis : contrat liant les parties (périmètre, prix one-shot + récurrents, SLA, durée,
résiliation, responsabilités hébergement/sécurité/données RGPD+EU AI Act, confidentialité, propriété
données/prompts/configs, limitation de responsabilité). E-signature (native ou DocuSign/Dropbox Sign),
horodatage, PDF aux 2 parties, lié au devis + Stripe. **AC** : accepter un devis → contrat pré-rempli signable + archivé.

### Y1 — Génération de SOP *(NOUVEAU, J1.7)*
- **Objectif** : produire les **SOP** (procédures opérationnelles) du process IA-augmenté et des agents installés.
- **Inputs** : process audités (K5/V1), Quick Wins retenus (W1), agents choisis (K3+/L3).
- **Outputs** : SOP structuré par process — objectif, étapes, **rôles**, **déclencheurs**, **points de
  contrôle humains (garantie humaine)**, **fallback/escalade**, monitoring, KPIs. + **runbook agent**
  (ce que l'agent fait, escalade, supervision). Export PDF/MD, **versionné**, stocké, lié à S1 (suivi).
- **AC** : pour un process retenu, génère un SOP complet (rôles + déclencheurs + fallback) signé/validé par l'user.

---

### R1 — Mode Partenaire / White-label — **BARÈME DE TOKENS DÉTAILLÉ** *(J1.8 — levier N°1)*

> D'autres entrepreneurs/agences créent **devis + contrats + audits pour LEURS clients**. En retour ils
> **souscrivent un plan** ou **achètent des crédits**. Effet réseau = principal moteur vers le N°1.

**Unité** : **Crédit Audit AI** (distinct des tokens de génération IA). Chaque crédit **inclut une allocation
LLM raisonnable** pour l'action ; le dépassement lourd est plafonné/top-up. *(Mapping indicatif : 1 crédit ≈ €0,80 — à valider.)*

**Barème par action (calibration de départ)**
| Action | Crédits |
|---|---|
| Analyse de site (V1) | 3 |
| Session Luna Copilot complète (K6) | 5 |
| Diagnostic (K4) | 3 |
| Audit IA en place / OPEX (X1) | 5 |
| Matrice Quick Win (W1) | 2 |
| Calcul ROI (K2A) | 1 |
| Génération de devis (L3) | 5 |
| Génération de contrat (L4) | 8 |
| Génération de SOP (Y1, par SOP) | 3 |
| Rapport COMEX (N1) | 10 |
> Chaîne complète type (audit→quick win→ROI→reco→devis→contrat) ≈ **25-30 crédits** ≈ **€20-25** de coût plateforme refacturable au client final par le partenaire.

**Plans partenaires (€, à valider)**
| Plan | Crédits inclus /mois | Prix /mois | Prix/crédit effectif |
|---|---|---|---|
| **Partner Starter** | 100 | €49 | €0,49 |
| **Partner Pro** | 400 | €149 | €0,37 |
| **Partner Agency** | 1 200 | €349 | €0,29 |
| **Token Packs** (top-up) | 50 / 150 / 500 | €39 / €99 / €299 | dégressif |

**Exemple (partenaire faisant 10 audits complets/mois)** : 10 × ~28 crédits ≈ **280 crédits/mois** →
**Partner Pro** (400 inclus) couvre confortablement avec marge.

**Garde-fous** : isolation multi-tenant stricte (`partnerId`/`orgId` + Firestore rules) ; branding partenaire
sur devis/contrats ; **règle AiLunaPro-first affichée même en white-label** ; quotas anti-abus ; ledger de crédits auditable.

---

### S1 — Suivi mensuel + Expert IA (payant) *(J1.9)*
Abonnement mensuel : monitoring continu + Luna « **Expert Advisor** » (chatbot conseil/optimisation) +
**rapport de performance mensuel** (RPE, OPEX, h/semaine, santé agents) + alertes (dérive/incidents).
Add-on de la maintenance L3 ou offre autonome. Stripe mensuel. **AC** : rapport mensuel + dialogue Expert IA.

### T1 — Récupération de revenus (Dunning + Panier abandonné) *(J1.9)*
- **Email** : **Sequenzy** (REST API + MCP) — déclencheurs Stripe `invoice.payment_failed` (dunning),
  trial expiring, `quote.sent` non accepté, `audit.started` non terminé. Séquences + revenue attribution.
- **SMS** : **Twilio** (ou **Sakari** / **Vonage**) pour relances critiques (impayé J+1/J+3, devis en attente).
- **Orchestration** : Worker émet les events (Stripe webhook + events produit) → `/internal/recovery/dispatch` → Sequenzy (email) + provider SMS.
- **Conformité** : opt-in/opt-out, GDPR/CAN-SPAM (natif Sequenzy), STOP SMS, fenêtres horaires.
- **AC** : impayé → email J0 + SMS J+1 + relance J+3 ; devis non ouvert J+2 → relance ; tout traçable/attribuable.

### Q1 — Intelligence Refresh Engine *(J1.10)*
Cron : OpenRouter models API, Artificial Analysis, veille frameworks (OpenClaw/Hermes/GitHub), watch
EU AI Act/ISO 42001, prix marché. Diffs → **file de revue admin (human-in-the-loop)**. **Jamais
d'auto-mutation** de la logique d'audit/décision sans validation. Après validation : MAJ `model_catalog`,
`agent_tool_catalog`, `pricing_benchmarks`, questionnaires/scoring + badge « à jour le JJ/MM ».

---

## 3bis. Audit Express — Killer demo publique *(<5 min, sans compte) — priorité haute*

> **Objectif** : prouver la valeur €/risque **avant tout compte**, en <5 min. Bat les incumbents
> sur le **speed-to-value**. Porte d'entrée principale (SEO/GEO → demo → compte).

- **Entrée** : page publique `/audit-express` (Turnstile, session éphémère anonyme, zéro PII stockée).
- **Inputs** : URL (optionnelle) **ou** 3-5 réponses tap. Pas d'upload, pas de questionnaire long.
- **Pipeline (lite, déterministe)** :
  1. **V1-lite** : fetch + crawl léger (accueil/à-propos/services), extraction LLM (temp 0) → activité,
     cible, **stack/IA détectés** (chatbots, widgets IA, analytics). Respect robots.txt, données publiques.
  2. **K1A diagnostic-lite** : tâches automatisables + Shadow AI + **niveau EU AI Act indicatif** (rule-based).
  3. **K2A ROI-lite** : économies €/mois + h/semaine estimées (fourchette sourcée).
  4. **X1-lite** : 2-3 outils IA détectés → **économie OPEX indicative** (€/mois, sourcée).
- **Outputs** (à l'écran, langage simple) : "Voici ce que Luna a vu" — tâches, Shadow AI, niveau EU AI Act
  indicatif, **€X/mois économisables**, top 3 Quick Wins. **Chaque chiffre = source/raison cliquable.**
- **CTA** : **créer un compte** pour (a) **sauvegarder** l'audit, (b) **exporter le PDF** (P1), (c) audit complet 9 étapes.
- **Garde-fous** : "**Estimation de préparation, pas une attestation de conformité ni un conseil juridique.**"
  Aucune donnée perso requise ; rien de stocké sans compte ; déterministe (même URL → même sortie).
- **AC** : URL ou 3 taps → résultat €/risque en <5 min, sans compte, avec CTA compte+PDF, chiffres sourcés.

---

## 3ter. P1 — PDF Report Renderer *(NOUVEAU — artefact B2B partageable, priorité haute)*

- **Objectif** : transformer un audit (Express ou complet) en **artefact PDF téléchargeable/partageable**
  — preuve de valeur pour le board/COMEX, viralité B2B, livrable partenaire (R1 white-label).
- **Contenu** : synthèse, profil, diagnostic + Shadow AI, **niveau EU AI Act indicatif**, Matrice Quick Win (W1),
  ROI (K2A), **stack actuel vs optimisé + économie OPEX (X1)**, top actions. **Sources/raisons annexées.**
- **Exigences** : **déterministe** (même audit → même PDF), **versionné** (snapshot horodaté + version moteur),
  branding (partenaire en white-label R1), pas de PII non nécessaire, footer disclaimer "préparation, pas certification".
- **Sortie** : PDF (+ MD optionnel), stocké (R2, scopé orgId/partnerId), lié à la session d'audit et à S1.
- **Gating** : tout module produisant un livrable affichable DOIT pouvoir l'exporter en PDF/MD versionné (§7quater).
- **AC** : un audit complété → PDF téléchargeable, reproductible (même input → même doc), brandable, sourcé.

---

## 3quater. Déterminisme & traçabilité — **SPEC** *(applique §0.4 à tous les modules LLM : V1, K6, X1, W1, K1A, K2A)*

- **Séparation stricte** : le LLM **extrait/structure uniquement** (température **0**, sortie JSON schématisée) ;
  **tout scoring, classement, seuil, € et niveau de risque = code rule-based** (jamais le LLM).
  → garantit reproductibilité, auditabilité, et fiabilité white-label.
- **Snapshots versionnés** : chaque audit persiste `{inputsHash, engineVersion, rulesetVersion, modelId, output, sources[], createdAt}`.
  Rejouable. Une MAJ de barème/règles (Q1) crée une **nouvelle version**, n'altère pas les snapshots passés.
- **Traçabilité** : chaque chiffre/risque/reco affiché porte une **source cliquable** (doc, page site, règle, benchmark).
- **Gate (bloquant §17)** : **même input → même sortie scorée** (test rejoué : `inputsHash` identique ⇒ output identique).
- **Cadre** : sorties = **aide à la préparation**, jamais attestation/certification/conseil juridique.

---

## 4. Architecture — impacts (Cloudflare Worker + Firestore)

**Collections** (multi-tenant, scopées `orgId`/`partnerId`) :
`documents`, `doc_chunks`(+Vectorize), `company_profile`, `site_analyses`, `audit_sessions`,
`existing_ai_inventory`, `quick_win_matrices`, `external_agents_catalog`, `quotes`, `contracts`, `sops`,
`partners`, `partner_clients`, `credit_ledger`, `subscriptions_followup`, `recovery_events`,
`model_catalog`, `agent_tool_catalog`, `pricing_benchmarks`, `regulation_watch`, `refresh_review_queue`.

**Routes Worker** (auth + role-gated ; Turnstile public) :
`/api/site/analyze` · `/api/documents/{upload,index}` · `/api/copilot/{session,message}` ·
`/api/diagnostic/run` · `/api/existing-ai/audit` · `/api/quickwin/matrix` · `/api/roi/calculate` ·
`/api/recommend` · `/api/quote/{build,accept}` · `/api/contract/{draft,sign}` · `/api/sop/generate` ·
`/api/partner/{create-client,quote,usage}` · `/api/followup/{subscribe,report}` ·
`/internal/webhooks/stripe` · `/internal/recovery/dispatch` · `/api/catalog/{models,agent-tools}` ·
`/internal/cron/refresh` · `/api/admin/refresh-queue`.

**Intégrations** : Vectorize + R2 + Workers AI (RAG) ; Anthropic API (Luna) ; Sequenzy (email) ;
Twilio/Sakari/Vonage (SMS) ; DocuSign/Dropbox Sign (e-sign) ; Stripe (one-shot + récurrents + crédits metered).

---

## 5. Stripe — produits

8 catégories v2 **+** : External Managed Agent — Setup (one-shot, paliers) · Managed Hosting+Maintenance
(mensuel, par palier) · AI Assurance (add-on) · Monthly Follow-up + AI Expert (S1, mensuel) · Partner Plan
(Starter/Pro/Agency, mensuel) · Partner Credit Packs (metered) · Audit Pro/Document Audit (one-shot, si payant).
Réutiliser le mapping product→plan partagé (J1-Hardening). Multi-currency.

---

## 6. User stories & KPIs (additionnels)

**Stories** : analyser mon site · uploader mes docs · voir l'IA que j'utilise déjà **et combien j'économise
en l'optimisant** · voir ma matrice Quick Win · être guidé par Luna · recevoir un **devis géré complet +
contrat à signer** · obtenir mes **SOP** · souscrire **suivi + expert IA** ·
*(partenaire)* créer devis/contrats/audits brandés et suivre mes crédits ·
*(admin)* éditer devis/contrat, calibrer prix/crédits, valider les MAJ catalogue, voir les revenus par source ·
*(auto)* relancer impayés/abandons (email+SMS), MAJ catalogue après validation.

**KPIs** : audit quality score (>80 %) · complétion Luna (1→9) · économie OPEX moyenne détectée (X1) ·
conversion par branche · devis→signés (taux+valeur) · MRR récurrent · partenaires actifs & crédits consommés ·
taux récupération dunning/panier · fraîcheur catalogue (<7 j) · NPS.

---

## 7. Roadmap (après J1.3A/J1.3B)

- **J1.4** — K3+ fork
- **J1.5** — K5 (RAG) + **V1 (site)** + **X1 (IA en place/OPEX)** + Shadow AI + **U1 (mode assisté)**
- **J1.6** — **K6 Luna Copilot** + **W1 (Quick Win)**
- **J1.7** — **L3 (devis géré € calibré)** + **L4 (contrat)** + **Y1 (SOP)** + Stripe setup/maintenance/assurance
- **J1.8** — **R1 (partenaire/white-label + crédits)**
- **J1.9** — **S1 (suivi+expert)** + **T1 (Sequenzy + SMS)**
- **J1.10** — **Q1 (auto-update)**
- **J2** — Production / secrets / monitoring / i18n

Chaque phase passe le **gate d'inspection** (v2 §17).

---

## 7bis. NFR — Performance, Résilience, Sécurité & Observabilité *(REQUIS + learnings shippés)*

> **Statut** : guardrails **OBLIGATOIRES** pour tout module futur (V1, K6, X1, L3, R1…).
> Items marqués ✅ = déjà livrés + validés prod (passe Perf Hardening + J13). Voir
> `cahier-des-charges-v2.md` §18 (lignes gate **PERF** et **J13→J14**) pour les commits + preuves.

### 7bis.1 Politique de cache SPA-safe (Cloudflare) — ✅ LIVRÉ
- **HTML** (`/` + `/index.html`) → **`Cache-Control: no-cache, must-revalidate`** (jamais de TTL long).
- **Assets hashés** (`/assets/*`) → **`max-age=31536000, immutable`**.
- **Routes API** (`/api/*`) → **bypass cache**.
- **INTERDIT** : toute Page Rule / Cache Rule / Browser-Cache-TTL de zone qui force un TTL HTML long.
  Browser Cache TTL = **"Respect Existing Headers"**.
- **Implémentation** : `public/_headers` (Vite copie vers dist root) + Cloudflare Cache Rules
  (`audit-html-bypass` FIRST, `audit-assets-cache`, `audit-api-bypass`).
- **Raison** : HTML stale (TTL 4h) référençait des hash de chunks supprimés après redeploy →
  "Couldn't load the page" (class-A chunk-load). *(Réf. Batch A `9bcb741` + fix infra CF.)*
- **AC** : `curl -I /` → `no-cache, must-revalidate` ; `/assets/*.js` → `immutable`.

### 7bis.2 Résilience chunk-load — ✅ LIVRÉ
- **`lazyWithRetry`** : 1 retry auto (backoff court) sur échec d'import dynamique (chunk/network).
- **ErrorBoundary chunk-aware** : détecte erreurs chunk → message clair (ad-blocker/réseau) +
  bouton **"Retry loading"** (reset → ré-import Suspense, sans full reload) + **"Reload page"**.
- **Télémétrie** (no-PII, post-consent) : `chunk_load_failed` / `chunk_retry_recovered` / `chunk_retry_failed`.
- **AC** : chunk échoué → 1 retry transparent ; si échec persistant → UI actionnable, jamais blank.

### 7bis.3 Résilience Firestore + boot — ✅ LIVRÉ
- **`initializeFirestore(app, { experimentalAutoDetectLongPolling: true })`** (jamais `getFirestore` nu).
  Fallback HTTP long-poll quand WebChannel streaming cassé par antivirus web-shield (Kaspersky)/proxy/VPN.
- **Boot watchdog** : **jamais d'écran blanc** sur hang long. Timer (≤8s) sur `isLoading` →
  notice connectivité actionnable ("Still connecting…" + domaines à autoriser + bouton Reload).
- **Providers fail-soft** : aucun provider ne doit bloquer le shell. Listeners gatés sur session
  prête (ex. `TokensContext` onSnapshot `if (!enabled || !orgId) return`). Reads liste = `Promise.allSettled`
  (jamais `Promise.all` — 1 read échoué ne vide pas la liste).
- **AC** : sous AV/proxy, Dashboard charge ; Firestore `channel?…` = 200 ; pas de blank multi-min.
  *(Réf. P1 watchdog `925c690`, P2-a long-poll `7f4d985`.)*

### 7bis.4 Sécurité analytics (PostHog) — ✅ LIVRÉ
- **Consent-first** + **DNT respecté** (`navigator.doNotTrack==='1'` → auto-decline). No-op strict sans consentement.
- **Désactivé hard** : session **replay**, **autocapture**, **surveys**, `capture_pageview` auto, `capture_pageleave`.
- **`sanitize_properties` OBLIGATOIRE** : force props URL (`$current_url`/`$pathname`/`$referrer`/`$initial_*`/
  `$session_entry_*`) → **origin-only** (jamais hash/id/query ; referrers blanchis). Events portent route
  template id-free uniquement. Anonyme (jamais `identify` avec uid/email).
- **Détection block-by-env** : probe `/e/` → si `ERR_BLOCKED_BY_CLIENT` (tracking-prevention/AV/firewall/DNS)
  → notice dismissible ("allow us.i.posthog.com, optionnel").
- **SDK lazy** post-consent (jamais au boot path).
- ⚠️ **Résidence** : host actuel = **US** (`us.i.posthog.com`). v1 acceptable (anonyme, `ip=0`, zéro PII).
  **EU-host/self-host** = requis avant tout traitement de données EU sensibles.
  *(Réf. J13 `eafb399`/`73ec62d`/`3e07847`/`ed1a3ba`.)*

### 7bis.5 Protocole de mesure perf + budgets
- **Mesure propre (obligatoire avant tout verdict perf)** : DevTools **Preserve log OFF**, **Disable cache OFF**,
  incognito clean (sans extensions), 1 seul navigate, lire **DOMContentLoaded/Load** (PAS "Finish" cumulé).
  Toujours comparer **incognito clean vs profil extensions** (sépare code vs environnement).
- **Budgets cibles** (à tenir/valider) :
  | Métrique | Cible |
  |---|---|
  | LCP (4G, mid-tier) | < 2.5 s |
  | TTI | < 3.5 s |
  | TBT | < 300 ms |
  | Bundle entry (`index`) gz | < 120 KB (actuel ~91 KB) |
  | Vendor chunks lazy (firebase-store/auth, posthog) | hors boot path / post-consent |
- **Règle** : pas de fix perf "au feeling" — exiger trace/waterfall/console. Pas de régression
  scoring/auth/billing/privacy. Pas de dépendance lourde nouvelle.

---

## 7ter. SEO & GEO (Search + Generative Engine Optimization) *(REQUIS — planifié)*

> **Statut** : **planifié** (non implémenté). Guardrail **OBLIGATOIRE** dès qu'une surface marketing/help
> publique est exposée. Chaque item ouvre son §17 dédié.

### 7ter.1 Surfaces publiques REQUISES (liste exacte)
Pré-requis car l'app est **auth-gated** → sans ces pages, **zéro acquisition organique/AI-search**.
Rendu **SSR/prerender statique** (pas derrière le shell hash-routé app), URLs propres (pas de `#`).

| Page | URL | Rôle |
|---|---|---|
| Landing produit | `/` (marketing) | proposition de valeur, CTA Audit Express |
| **Audit Express (demo)** | `/audit-express` | killer demo §3bis (entrée funnel) |
| Cas d'usage PME | `/use-cases/pme` | SEO intent PME |
| Cas d'usage indépendant | `/use-cases/independant` | SEO intent solo |
| Cas d'usage RH / juridique | `/use-cases/rh`, `/use-cases/juridique` | SEO vertical |
| EU AI Act expliqué | `/eu-ai-act` | pilier GEO (forte intent 2026) |
| Shadow AI expliqué | `/shadow-ai` | pilier GEO |
| FAQ | `/faq` | FAQPage schema, GEO |
| Pricing | `/pricing` | intent transactionnel |
| Méthodologie / approche | `/methodologie` | HowTo schema, trust |
| Help public | `/help` | support indexable (≠ help in-app) |
| Glossaire IA | `/glossaire` | longue traîne SEO/GEO |

### 7ter.2 Map indexable vs noindex
- **INDEXABLE** : toutes les pages du tableau 7ter.1 (marketing/demo/cas/EU-AI-Act/FAQ/pricing/méthodo/help/glossaire).
- **`noindex`** (meta robots + `X-Robots-Tag: noindex`) : **tout `/app/*`** — dashboard, audits, reports, billing,
  settings, copilot session, registry, agents, team. **Exclu du sitemap.**
- **Audit Express** `/audit-express` = indexable ; les **résultats de session** = noindex (éphémères, par-session).

### 7ter.3 sitemap / robots / canonical / OG
- **`sitemap.xml`** : uniquement les URLs indexables (tableau 7ter.1) ; régénéré au build.
- **`robots.txt`** : `Allow:` public ; `Disallow: /app/` (+ routes privées) ; ligne `Sitemap:` ; référence `llms.txt`.
- **Canonical** : balise `<link rel="canonical">` propre **par page publique** (URLs sans `#` ; le hash-routing reste app-only).
- **OpenGraph + Twitter cards** : `og:title/description/image/url` + `twitter:card=summary_large_image` sur chaque page publique.

### 7ter.4 Données structurées (schema.org JSON-LD)
- **Organization** (landing) : nom, logo, URL, description, `sameAs` réseaux.
- **SoftwareApplication** (landing/pricing) : catégorie, offres/pricing, audience.
- **FAQPage** (`/faq`, `/eu-ai-act`, `/shadow-ai`) : Q/R structurées (maximise extraction AI-search).
- **HowTo** (`/methodologie`) : étapes de l'audit (sans promesse de certification).

### 7ter.5 GEO — `llms.txt` (contenu exact)
Fichier racine `llms.txt` — **stable, sourcé, sans hype** :
- **Une phrase de positionnement** : "AiLunaPro — guided AI audit & managed-agent advisory for SMBs & independents (EU AI Act preparation)".
- **Liens stables** : landing, `/audit-express`, `/eu-ai-act`, `/shadow-ai`, `/methodologie`, `/faq`, `/pricing`.
- **Résumé produit** : parcours guidé 9 étapes, audit IA en place + OPEX, Quick Wins, ROI, agents gérés.
- **Disclaimer obligatoire** : "**Preparation support, NOT a compliance certification, attestation, or legal advice.**"
- **Ce qu'on ne fait pas** : pas de certif légale, pas de stockage PII en demo, déterministe.

### 7ter.6 i18n (si/quand activé) — *(next, hors v2.4)*
- **`hreflang`** par locale + URLs localisées ; **traductions humaines** — **JAMAIS de traduction LLM** indexée.
  *(Cohérent §9.24 : lang-only display.)*

---

## 7quater. Gating — NFR & SEO/GEO & Déterminisme comme guardrails permanents
- §0.4 (déterminisme) + §3quater + §7bis (NFR) + §7ter (SEO/GEO) = **critères de gate §17 OBLIGATOIRES**
  pour V1, K6, X1, W1, K1A, K2A, L3, L4, Y1, R1, S1, Q1.
- **Checks bloquants exit-gate (v2.4)** — un module ne PASS que si **tous** vérifiés :
  1. **Déterminisme** : même input → même sortie scorée (LLM temp 0 extraction-only, scoring rule-based code, snapshot rejoué). ✅ test.
  2. **Traçabilité** : chaque chiffre/risque/reco affiché → **source cliquable**.
  3. **Artefact** : tout livrable affichable → **export PDF/MD versionné** (P1).
  4. **Budgets perf** : LCP < 2.5s · TTI < 3.5s · TBT < 300ms · entry bundle gz < 120KB (mesure propre §7bis.5).
  5. **NFR** : cache SPA-safe intact · aucun provider bloquant le shell · graceful-degradation 3rd-party.
  6. **Privacy/analytics** : consent-first + scrub origin-only + no replay/autocapture/surveys.
  7. **Surface publique** : module à valeur démontrable → page indexable correspondante (§7ter) OU justification noindex.
  8. **Trust** : surface audit/risque → disclaimer "préparation, pas attestation/certification/conseil juridique".
- **§18 (cahier-des-charges-v2.md)** :
  - **Shippé/validé** : cache SPA-safe, chunk-resilience, Firestore long-poll, boot watchdog, providers fail-soft,
    PostHog consent-first + scrub + block-notice (lignes gate **PERF** + **J13→J14**, commits `9bcb741`/`925c690`/`7f4d985`/`ed1a3ba`).
  - **Planifié (v2.4)** : déterminisme/scoring rule-based + snapshots, Audit Express (§3bis), P1 PDF renderer (§3ter),
    surfaces SEO/GEO (§7ter), budgets perf formels en gate, schema/llms.txt.
  - **Next (PAS v2.4, listé non développé)** : i18n hreflang + traductions humaines · autosave draft local + sync ·
    anti-abus crédits white-label (budget LLM org/jour + quotas + ledger) · EU-host/self-host analytics.

---

## 7quinquies. CHECKPOINT OBLIGATOIRE — Inspection générale fin-d'étape + sync docs *(v2.4, bloquant)*

> **Règle dure** : à la fin de **chaque étape/batch**, et **avant de déclarer une étape CLOSED**, exécuter
> une **passe d'inspection GÉNÉRALE** (pas seulement les tests ciblés) pour découvrir proactivement
> bugs/erreurs/régressions. Complète (n'annule pas) le gate §17 du `cahier-des-charges-v2.md`.

**A. Passe d'inspection générale (tous obligatoires)**
1. **Build/tsc** clean (le build gate échoue sur erreur de type).
2. **Baseline inspect** : suite tests projet (`tests/`), distinguer échecs **pré-existants** vs **régressions** (rejouer à l'état précédent si doute).
3. **Forbidden-phrasing grep** : aucune revendication certif/conformité/conseil juridique hors listes d'interdictions.
4. **Routing** : pas de route cassée ; hash-routing app-only ; surfaces publiques non régressées.
5. **Isolation cross-tenant** : pas d'IDOR ; scope `orgId`/`partnerId` ; `firestore.rules` cohérentes.
6. **Sécurité & logs** : zéro PII/secret en logs/analytics ; `dlog` DEBUG-gated ; pas de secret en bundle public.
7. **Caching correctness** : HTML `no-cache, must-revalidate` + `/assets/*` immutable + API bypass (curl prod).
8. **Perf quick check** : pas de régression évidente (bundle entry, providers non-bloquants, lazy intact).
9. **Hygiène repo** : **aucun artefact junk/untracked/0-byte** (`git status --porcelain` clean ; scan fichiers vides trackés).

**B. Enregistrement (cahier et/ou §18)** — obligatoire à chaque clôture :
- changements shippés · **commits** · **hashes prod** (fe/worker) · warnings connus · différés · do-next / do-NOT.

**C. Règle de blocage**
- Si **un seul** axe A **FAIL** → l'étape **ne peut pas être CLOSED** : corriger → re-gater → seulement ensuite clôturer.
- Les échecs **pré-existants** (hors scope) sont **consignés ⚠️ différé** (pas must-fix), avec preuve qu'ils précèdent l'étape.

**D. Pourquoi (anti-régression)**
- Évite la récurrence de bugs (ex. junk 0-byte committé via `git add -A`, HTML cache stale, mock test cassé par refactor).
  L'inspection générale > tests ciblés : elle **cherche** les régressions au lieu d'attendre qu'elles remontent en prod.

---

## 8. Message à coller dans Claude Code (EN)

```
Extend Audit AI (Cloudflare Worker + Firestore + Stripe). NOT MagicAI.

DO NOT implement yet. Finish current priority: J1.3A/J1.3B billing admin, multi-currency, promo codes,
payment settings, portal diagnostics. Do NOT break working checkout/invoices/portal.

PRINCIPLES: (1) Zero-expertise guided flow (no blank screens, 1 action/screen, plain language, "Luna does
it for me", mobile + WhatsApp, resumable, FR/EN). (2) Collection quality drives audit quality.
(3) Transparency: always show "AiLunaPro is our solution" + when external is better.

9-STEP JOURNEY (orchestrated by Luna): Welcome/goal → Profile + SITE ANALYSIS → Documents (RAG) →
Diagnostic + EXISTING-AI AUDIT → QUICK WIN MATRIX → ROI → Recommendation FORK (AiLunaPro vs managed
external agents) → AI-assisted decision → Offer (quote + contract or AiLunaPro sub) + SOP generation →
Managed deployment + cockpit + monthly follow-up.

MODULES:
- U1 Zero-Expertise Guided Mode (transversal wizard).
- V1 Site Analysis: input URL → crawl key pages (respect robots) → LLM extract business profile + detect
  tech/AI stack (chatbots, AI widgets, marketing tools). No URL → Luna asks questions. Feeds company_profile + X1.
- K5 Document Intelligence (RAG): upload → R2 + Vectorize (namespace per orgId) → company profile + audit
  quality score. Encrypt at rest, PII detection, per-org isolation.
- X1 Existing-AI Audit & OPEX reduction: inventory current AI tools + monthly cost → detect
  redundancy/overlap/oversized/shadow AI → propose consolidation (often to AiLunaPro), model switch,
  renegotiation, managed agents → QUANTIFY OPEX savings (€/mo, %, payback). Sourced, not promises.
- W1 Quick Win Matrix: score detected tasks Impact(0-5)/Effort(0-5) → 2x2 matrix + prioritized top 3.
- K3+ Recommendation Fork (AiLunaPro vs managed external agents).
- K6 LUNA COPILOT (core): CF Worker SSE streaming + Firestore state (audit_sessions) + Anthropic API tool
  use (model from model_catalog) + Vectorize/R2 RAG. Per-turn agentic loop: load session → build messages
  (system + state summary + truncated history + user msg) → call Claude with tools → while tool_use (max 6
  iterations) execute server tool + append result + recall → stream text → persist state. State machine
  currentStep 1..9 with deterministic gating. Tools: analyze_site, query_documents, run_diagnostic,
  audit_existing_ai, quick_win_matrix, classify_eu_ai_act, calculate_roi, recommend_agents, build_quote,
  draft_contract, generate_sop, save_audit_state. Guardrails: no unsourced numbers, human validation on key
  decisions, AiLunaPro-first transparency, scope-limited, never leak document PII. SSE events:
  token/step/tool_start/tool_end/action/error/done (tools surfaced in plain language). Limits: max tool
  iterations/turn, per-session cost cap, history summarization, timeouts, graceful fallback to form. Public
  anonymous entry (Turnstile) that prompts account creation to save. Routes: POST /api/copilot/session,
  POST /api/copilot/message (SSE), GET /api/copilot/session/{id}.
- L3 MANAGED Agent Install & Quote: WE host OpenClaw/Hermes/others on OUR servers (client does NOT
  self-host). Quote MUST include server specs, scope, ONE-SHOT setup, RECURRING MONTHLY (hosting +
  maintenance + optional AI assurance + estimated LLM API), billing terms, SLA, install + training
  checklists. Engine: Setup = setup_tier + Σ integrations, ×1.2-1.4 ; Monthly = hosting + maintenance +
  assurance + LLM + margin. Tiers Starter/Pro/Métier. Admin can edit before send. Multi-currency.
  (Calibrated € figures in the spec are starting points, parameterizable.)
- L4 Contract Generation on quote acceptance: binding contract (scope, prices, SLA, term, termination,
  data/security GDPR+EU AI Act, confidentiality, IP, liability). E-signature (native or DocuSign/Dropbox
  Sign), timestamp, PDF to both parties, linked to Stripe.
- Y1 SOP Generation: from audited processes + chosen agents → structured SOP (objective, steps, roles,
  triggers, HUMAN checkpoints, fallback/escalation, monitoring, KPIs) + agent runbook. Versioned PDF/MD, linked to S1.
- R1 Partner / White-label: agencies create quotes/contracts/audits for THEIR clients; pay via partner
  plan OR credits. Credit-metered actions (site 3, Luna session 5, diagnostic 3, existing-AI 5, quickwin 2,
  ROI 1, quote 5, contract 8, SOP 3, COMEX 10). Plans Starter/Pro/Agency + credit packs. Strict multi-tenant
  isolation (partnerId/orgId), partner branding, AiLunaPro-first preserved, anti-abuse quotas, auditable credit_ledger.
- S1 Monthly Follow-up + AI Expert (paid): monitoring + Luna "Expert Advisor" + monthly performance report
  (RPE, OPEX, hours saved, agent health). Stripe monthly.
- T1 Revenue Recovery: dunning + abandoned quote/checkout/audit via EMAIL (Sequenzy, REST API + MCP,
  triggers: invoice.payment_failed, trial expiring, quote.sent not accepted, audit.started not finished) +
  SMS (Twilio/Sakari/Vonage) for critical reminders. Opt-in/opt-out, GDPR/CAN-SPAM, STOP. Worker emits events;
  /internal/recovery/dispatch fans out to Sequenzy (email) + SMS provider.
- Q1 Intelligence Refresh Engine: Cron polling OpenRouter models API, Artificial Analysis, agentic-tools
  watch (OpenClaw/Hermes/GitHub), EU AI Act/ISO 42001 watch, market pricing. Diffs → ADMIN REVIEW QUEUE
  (human-in-the-loop). Never auto-mutate audit/decision logic without approval.

NEW FIRESTORE COLLECTIONS: documents, doc_chunks(+Vectorize), company_profile, site_analyses,
audit_sessions, existing_ai_inventory, quick_win_matrices, external_agents_catalog, quotes, contracts, sops,
partners, partner_clients, credit_ledger, subscriptions_followup, recovery_events, model_catalog,
agent_tool_catalog, pricing_benchmarks, regulation_watch, refresh_review_queue. Multi-tenant, scoped by
orgId/partnerId, with Firestore rules.

NEW ROUTES: /api/site/analyze, /api/documents/{upload,index}, /api/copilot/{session,message},
/api/diagnostic/run, /api/existing-ai/audit, /api/quickwin/matrix, /api/roi/calculate, /api/recommend,
/api/quote/{build,accept}, /api/contract/{draft,sign}, /api/sop/generate,
/api/partner/{create-client,quote,usage}, /api/followup/{subscribe,report}, /internal/webhooks/stripe,
/internal/recovery/dispatch, /api/catalog/{models,agent-tools}, /internal/cron/refresh, /api/admin/refresh-queue.

INTEGRATIONS: Vectorize + R2 + Workers AI (RAG); Anthropic API (Luna); Sequenzy (email); Twilio/Sakari/Vonage
(SMS); DocuSign/Dropbox Sign (e-sign); Stripe (one-shot + recurring + metered credits).

ROADMAP: J1.4 = K3+ ; J1.5 = K5 + V1 + X1 + U1 ; J1.6 = K6 + W1 ; J1.7 = L3 + L4 + Y1 ; J1.8 = R1 ;
J1.9 = S1 + T1 ; J1.10 = Q1 ; then J2 Production. Each phase passes the end-of-step inspection gate.
```

---

*Fin du cahier des charges v2.3 FINAL. Remplace v2.1 et v2.2. À fusionner dans `cahier-des-charges-v2.md` puis transmettre à Claude Code.*
