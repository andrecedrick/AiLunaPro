# Méthode complète d'Audit IA — Guide expert (B2B · B2C · Particulier · tous secteurs)

> **Source de connaissance :** synthèse de 14 vidéos d'experts (audits IA $5K → $100K, vente d'audits, calcul temps→argent, AI Search/GEO), du tableur *AUDIT TEMPS → ARGENT*, du cadre réglementaire EU AI Act, et d'apports d'expertise propres.
> **Usage :** référentiel opérationnel pour mener et vendre un audit IA de très haute qualité, et alimenter les modules de la plateforme AiLunaPro (Diagnostic Express, AI Agent Recommendation, ROI Calculator, Shadow AI, EU AI Act, FRIA, Formation Art. 4).
> **Dernière mise à jour :** 2026-06-26.

---

## 0. Philosophie — ce qu'est *vraiment* un audit IA

Un audit IA n'est **pas** une liste d'outils à acheter. C'est un **diagnostic stratégique** qui aligne la technologie sur le métier, l'argent et le risque.

Quatre principes directeurs :

1. **« L'IRM avant la chirurgie ».** Un chirurgien n'opère pas sans imagerie. On diagnostique l'inefficacité *avant* de prescrire la moindre techno. L'audit évite de gaspiller 50 000 € dans des outils inutiles.
2. **« L'IA ne répare pas le chaos, elle le scale ».** Sur un processus flou ou cassé, l'IA rend l'inefficacité *plus rapide*. On nettoie le processus d'abord.
3. **On vend la clarté, pas le code.** Le client n'achète pas un workflow n8n invisible ; il achète de la certitude et une direction. Posture = **partenaire de transformation**, pas développeur.
4. **On facture la taille du problème résolu, pas le temps passé.** Un audit à 500 € résout un problème pour une personne ; un audit à 10 000 € résout des problèmes structurels pour 10 départements.

**Erreurs fatales à éviter :**
- *Shiny object syndrome* — courir sur le dernier outil sans stratégie → fatigue des outils, abonnements morts.
- *Ne parler qu'au PDG* — le dirigeant connaît la destination ; seuls les employés de terrain connaissent les **nids-de-poule**.
- *Ignorer la conduite du changement* — si les équipes craignent d'être remplacées, elles saboteront l'adoption.
- *Vouloir tout automatiser* — l'IA gère idéalement **80 % des tâches structurées** ; les 20 % de jugement restent humains.

---

## 1. Les formules & calculs (référence maître)

### 1.1 Taux horaire réel (Tₕ)
Base de toute valorisation du temps.

```
Tₕ = Salaire mensuel net / (Heures travaillées par semaine × 4,33)
```
*Exemple tableur : 7 000 € / (60 × 4,33) ≈ 27 €/h.* (4,33 = nombre moyen de semaines par mois ; le tableur source arrondit parfois à ×4.)

### 1.2 Coût horaire *chargé* (Tᶜ)
Pour les audits B2B sérieux, on n'utilise jamais le salaire brut seul.

```
Tᶜ = Tₕ × coefficient de charge
```
- Coefficient typique **1,5 à 2,3** (salaire + cotisations + congés + outils + locaux + management).
- Raccourci de terrain souvent utilisé dans les vidéos : **40 $/h chargé** pour un employé standard.

### 1.3 Coût annuel d'une tâche (Cₐ)
```
Cₐ = Heures par semaine × 52 × Tᶜ
```
*Exemple : 10 h/sem d'emails × 52 × 27 € ≈ 14 040 €/an.*

### 1.4 Coût de l'inefficacité globale (à l'échelle d'une équipe)
```
C_ineff = Temps perdu/jour × Nb employés × Jours travaillés/an × Tᶜ
```
*Exemple : 8 SDR × 2 h/jour × 260 jours × 40 $ = **166 400 $/an** de perte sèche.*
→ Ce chiffre rend un projet à 60 000 $ « gratuit » (rentabilisé en ~5 mois).

### 1.5 Coût de l'inaction — COI (Cost Of Inaction)
La métrique de vente la plus puissante : combien le client perd **chaque jour** à ne rien changer.
```
COI = (Leads perdus × Taux de closing × Valeur client annuelle) + Coût du temps perdu
```

### 1.6 ROI — deux lectures
**ROI projet (implémentation) :**
```
ROI = Économies annuelles / Coût d'implémentation unique
Payback (mois) = Coût d'implémentation / (Économies annuelles / 12)
```
Seuil de succès : **payback < 12 mois**.

**ROI de l'audit (vision globale) :**
```
ROI_audit = [(Gains de productivité + Coûts évités) − Coût de l'audit] / Coût de l'audit
```
*Benchmark constaté : ROI médian **+159,8 % à 12 mois**, **+159,8 %→ jusqu'à 24 mois** sur projets bien cadrés. Pour 100 € investis → ~259,80 € de retour.*

### 1.7 Heures récupérées & capacité
```
Heures récupérées/an = (H_actuel − H_après_IA) × 52
Capacité additionnelle = Heures récupérées / Durée moyenne d'une unité de production
```
*Exemple tableur : tâche 30 h/mois → 4 h/mois après IA = **26 h/mois** récupérées.*

### 1.8 Formules de conformité & qualité (côté risque)
- **Impact Ratio (règle des 80 %)** : `IR = taux de réussite groupe défavorisé / taux groupe favorisé`. Seuil d'alerte **< 0,8** → présomption de biais → gel du déploiement.
- **F1-score** cible **> 0,95** ; **latence** < 25 ms ; **dérive (drift)** < 2 % ; **uptime** 99,99 %.

---

## 2. Méthode de calcul du temps → argent (le cœur opérationnel)

Quatre étapes systématiques :

1. **Inventaire « Hier matin ».** Ne jamais demander *« que faites-vous ? »* (on obtient la version idéalisée). Demander : *« Racontez-moi votre matinée d'hier : qu'avez-vous fait à 9h00 ? Puis à 9h15 ? Et ensuite ? »*
2. **Décomposition atomique.** Une tâche globale (« gérer les emails ») se découpe en étapes élémentaires : ouvrir le CRM → filtrer les 24 h → vérifier le profil → rédiger → envoyer. On automatise au niveau atomique, pas au niveau global.
3. **Quantification hebdomadaire.** Volume hebdo pour chaque tâche atomique (H/sem).
4. **Conversion monétaire.** Appliquer Cₐ (§1.3) puis C_ineff (§1.4) si plusieurs personnes.

**Astuce de collecte de données :** transcrire les entretiens avec **Fireflies / Fathom**, puis injecter dans **NotebookLM** (ou la plateforme) pour générer les premières analyses et la cartographie.

---

## 3. Système de décision — le « Verdict » par tâche

### 3.1 Les 3 critères de qualification (issus du tableur AUDIT TEMPS → ARGENT)
| Critère | Valeurs possibles | Ce qu'on cherche |
|---|---|---|
| **Qui peut le faire ?** | Toi seul · Spécialiste formé · N'importe qui formé | Niveau de compétence requis |
| **Règles claires ?** | Oui · Non | Processus documenté, logique Si/Alors |
| **Énergie ?** | Énergisant · Neutre · Épuisant | Impact psychologique sur le dirigeant |

### 3.2 La logique du verdict
- **🟢 GARDER** — tâche **énergisante**, stratégique, fort effet de levier (vision, prospection haut niveau). *Le dirigeant garde.*
- **🤝 DÉLÉGUER** *(ou IA copilote)* — **épuisante**, requiert un **spécialiste**, **pas** de règles claires documentées. L'IA assiste, ne remplace pas.
- **🤖 AUTOMATISER** — **épuisante**, faisable par **n'importe qui**, **règles claires** (entrée structurée, sortie prévisible, logique Si/Alors).
- **⚠️ REPENSER / ÉLIMINER** — faible valeur, peu fréquente (1×/trimestre) ou totalement non structurée.

Formule logique du tableur (reconstituée) :
```
SI Énergie = "Énergisant" → GARDER
SINON SI (Qui = "N'importe qui formé" ET Règles = "Oui") → AUTOMATISER
SINON SI (Règles = "Non" OU Qui = "Spécialiste") → DÉLÉGUER
SINON → REPENSER
```

### 3.3 Les 4 filtres d'automatisation (à passer avant tout « AUTOMATISER »)
1. **Entrée structurée ?** (formulaires, emails types, base de données)
2. **Sortie prévisible ?** (réponses standard, extraction, classification)
3. **Décisions basées sur des règles ?** (Si/Alors, scoring par critères)
4. **Répété assez souvent ?** (quotidien / hebdomadaire)
→ 4 « oui » = candidat idéal à l'automatisation.

### 3.4 Matrice de priorisation Impact × Difficulté (2×2)
| | **Difficulté basse** | **Difficulté haute** |
|---|---|---|
| **Impact haut** | 🟢 **Quick Wins** (< 90 jours) | 🔵 **Big Swings** (phase 2-3) |
| **Impact bas** | ⚪ Low priority (ignorer) | 🔴 **Money Pits** (éviter absolument) |

### 3.5 Le framework des 3E (ordre de priorité)
1. **Enhance (Améliorer)** ce qui rapporte déjà.
2. **Eliminate (Éliminer)** les tâches inutiles.
3. **Expand (Étendre)** vers de nouveaux revenus.

---

## 4. Banque de questions d'audit (exhaustive, par catégorie)

### A. Découverte & vision
- Quel est votre **résultat idéal** (dream outcome) ?
- Présentez-moi votre activité de A à Z. Quel est votre **parcours client** (du premier clic à la vente) ?
- Que voulez-vous que l'IA fasse pour vous ? Quelles attentes vis-à-vis de cette techno ?
- À quoi ressemble le **succès** pour vous ?

### B. Objectifs & mesure
- Quel est votre objectif principal ? Vos **3 objectifs majeurs sur 12 mois** ?
- S'il y avait **une seule chose** à résoudre pour faire bouger le chiffre d'affaires, ce serait quoi ?
- Vos métriques clés : **CA annuel, taux de conversion, CAC, LTV** ?

### C. Douleurs & inefficacités
- Quel est le **problème le plus coûteux** aujourd'hui ?
- **Où perdez-vous de l'argent** en sachant que le problème existe sans l'avoir résolu ?
- Qu'est-ce qui cause de la **frustration** ? Où votre journée **ralentit**-elle ?

### D. Processus & tâches (méthode « Hier matin »)
- Racontez-moi votre **matinée d'hier**, étape par étape. Quoi en premier ? Puis ? Ensuite ?
- Guidez-moi à travers les **2 premières heures** de votre journée.
- *« Et après, qu'est-ce qui se passe ? »* (répéter jusqu'à la tâche atomique)
- Quelle est la partie la plus **manuelle / répétitive** de votre travail ?

### E. Temps & énergie
- Combien d'**heures/semaine** sur cette tâche précise ?
- Si vous aviez **5 h de plus/semaine**, qu'en feriez-vous ?
- Cette tâche vous **donne-t-elle de l'énergie** ou est-elle **épuisante** ?

### F. Outils, données & Shadow AI
- Quelle est votre **stack logicielle** actuelle ? Quels outils pour ce workflow ?
- Où sont **stockées les données** ? Qui y a accès ?
- Utilisez-vous **ChatGPT / Claude / Midjourney** sans approbation officielle ? *(détection Shadow AI)*

### G. Qualification pour l'automatisation
- Qui peut faire cette tâche ? (vous seul / spécialiste / n'importe qui)
- Avez-vous des **règles claires documentées** ?
- (+ les 4 filtres du §3.3)

### H. ROI & coût de l'inaction
- Quel est le **coût horaire chargé** de la personne qui fait la tâche ?
- Quel est le **COI** : combien ça coûte/jour de ne pas automatiser ?
- Combien de personnes font ce travail aujourd'hui ?

---

## 5. Méthodologie complète — déroulé d'une mission

**Durées :** *Quick Strike* TPE/PME ≈ **2 semaines** · audit complet ETI **4 à 8 semaines**.

| Phase | Objet | Livrable intermédiaire |
|---|---|---|
| **1. Cadrage** | Objectifs mesurables (pas « faire de l'IA » mais « passer de 3 h à 5 min »), appétence au risque, **Comité Scientifique & Éthique** | Note de cadrage |
| **2. Cartographie** | Entretiens terrain (**≥ 10 personnes**), workflow en boîtes+flèches (Miro/LucidChart), recensement **Shadow AI** | Cartographie des processus + registre brut |
| **3. Analyse atomique** | Décomposition, filtres d'automatisation, verdict par tâche | Tableau verdict |
| **4. Quantification COI** | Chiffrer la douleur (§1) | Modèle financier |
| **5. Classification & conformité** | Niveaux de risque EU AI Act, FRIA si haut risque, biais (IR 80 %) | Registre IA + scoring |
| **6. Solution design** | Co-construction des reco avec les parties prenantes (adoption) | Reco priorisées |
| **7. Roadmap 90 jours** | Quick Wins → Big Swings | Feuille de route + rapport exécutif |
| **8. Monitoring (MCO)** | Révision registre, veille réglementaire, drift | Abonnement récurrent |

---

## 6. Audit selon la cible : B2B · B2C · Particulier

### 6.1 B2B (entreprises, le cœur de cible)
- **Angle :** coût de l'inefficacité à l'échelle (C_ineff, COI), conformité EU AI Act, Shadow AI, RH/Finance/Ops.
- **Interlocuteurs :** PDG (destination) **+ ≥ 10 employés terrain** (nids-de-poule).
- **Segmentation par CA :**
  - *Indépendants / TPE* → automatiser le chronophage simple (emails, devis/factures, RDV, relances, chatbot site).
  - *PME en croissance* → productivité d'équipe (service client IA, qualif. prospects, CRM, reporting, RH, gestion doc.).
  - *ETI / grands comptes* → IA stratégique (agents par département, prédictif, détection fraude/anomalies, conformité, IA sur données propriétaires).
- **Niches porteuses :** logistique & assurance (saisie manuelle massive), **mid-market 5–50 M$** (budget + manque d'expertise interne), associations/ONG (budgets + urgence de modernisation), immobilier, BTP/industrie, santé (réglementé).

### 6.2 B2C (marques vendant au grand public)
- **Angle :** expérience client, conversion, contenu, **visibilité IA (GEO)**, support 24/7.
- **Tâches typiques :** support niveau 1, recommandation produit, personnalisation, modération, génération de contenu, réponse aux avis.
- **Risque clé :** transparence (chatbot = obligation d'informer), hallucinations sur conseils produit, biais, RGPD sur données clients.
- **KPIs :** temps de réponse, taux de résolution self-service, CSAT/NPS, taux de conversion assisté par IA, part de voix dans les réponses IA.

### 6.3 Particulier / Solopreneur / Créateur
- **Angle :** récupérer du temps personnel, valoriser une expertise, **« productize yourself »**.
- **Outil central :** le **tableur AUDIT TEMPS → ARGENT** (profil → taux horaire → verdict par tâche).
- **Tâches typiques :** emails/DM, montage, écriture, planning, facturation, veille.
- **Question pivot :** *« Si vous aviez 5 h de plus/semaine, qu'en feriez-vous ? »* → on chiffre la valeur de ces heures et on automatise pour les libérer.

---

## 7. Audit par secteur (avec les réseaux sociaux & la visibilité IA)

### 7.1 Visibilité IA / AI Search / GEO (Generative Engine Optimization)
Rupture avec le SEO classique : on ne vise plus « 10 liens bleus » mais être **cité et recommandé** par les LLM.

**Vérifications :**
- Les LLM comprennent-ils vos produits, services, USP ?
- **Positionnement concurrentiel** : qui l'IA met-elle en avant face à vous ?
- **Sources** utilisées par l'IA pour parler de vous (Reddit, Quora, médias) ?
- **Exactitude** : l'IA propage-t-elle des erreurs sur vous ?

**Outils :** Semrush *AI Visibility Toolkit*, **Ahrefs Brand Radar**, tests manuels **ChatGPT / Perplexity / Gemini / Google AI Overviews**.

**Métriques :** Visibility Score (0-100), Relative Visibility (par plateforme), Monthly Audience (prompts où la marque apparaît), Cited Pages, **Brand Sentiment Score** (% positif/négatif/neutre).

**Questions GEO à poser :**
- Quelles sont les **3 questions** que vos clients posent le plus aux IA à votre sujet ?
- Si une IA recommande un **concurrent** plutôt que vous, savez-vous quel argument elle utilise ?
- Vos pages de blog sont-elles captées comme **« sources de vérité »** par les moteurs IA ?

**Levier d'action :** *Source Opportunities* — repérer les sites tiers cités par l'IA où vous êtes absent → liste prioritaire de **PR digitale**. Corriger le sentiment négatif à la source (ex. transparence prix sur le site → l'IA met à jour sa perception).

### 7.2 Réseaux sociaux & marketing de contenu
- **Storytelling vs spam :** le contenu bâtit-il une **autorité** (récits d'échecs/succès) ou recopie-t-il des démos techniques ?
- **Productize yourself :** le contenu reflète-t-il une expertise unique difficile à copier ?
- **Shadow Social :** des employés génèrent-ils du contenu par IA sans supervision (risque hallucination / perte d'authenticité) ?
- **Métrique ultime LinkedIn :** **Qualified Meetings Booked** (au-delà des likes/impressions). Analyser quels *hooks* résonnent.
- **Tâches automatisables :** repurposing multi-formats, planification, première rédaction (copilote), réponse aux commentaires, veille concurrentielle, reporting analytics.

### 7.3 Autres secteurs — points de contrôle rapides
- **Logistique :** planification de routes (cas réel : **1 000 h chauffeurs/an** + 180 000 € carburant économisés).
- **Assurance :** unification des réponses (cas réel : 3 employés, 3 réponses différentes → **498 000 $** d'économies identifiées).
- **Immobilier :** réponse locataires −68 % (15 h → 3 h/sem).
- **Industrie/BTP :** audit 8 sem → 15 opportunités → **250 000 $** de pipeline.
- **Santé / Finance :** secteurs **régulés** → FRIA obligatoire, cloud souverain, garantie humaine renforcée.

---

## 8. Conformité, Shadow AI & éthique (volet réglementaire)

### 8.1 Détection du Shadow AI
≈ **49 %** des outils IA en entreprise sont non approuvés ; **43 %** des salariés contournent les interdictions → passer de l'**interdiction** à l'**encadrement**.
- **Sondage anonyme** (30 premiers jours) — sans crainte de sanction.
- **CASB / DLP / AI-SPM** — visibilité technique sur les flux, blocage des données sensibles vers IA publiques, AI Red Teaming.
- **Analyse des logs** réseau.

### 8.2 Classification EU AI Act (4 niveaux)
| Niveau | Exemples | Obligation |
|---|---|---|
| **Inacceptable** (interdit depuis fév. 2025) | scoring social, manipulation, biométrie de masse | Interdiction · amende **35 M€ / 7 % CA** |
| **Haut risque** | recrutement, évaluation salariés, crédit, médical | Doc. technique, supervision humaine, **registre**, **FRIA** · amende **15 M€ / 3 %** |
| **Limité** | chatbots, deepfakes, contenu génératif | Transparence (informer l'utilisateur) |
| **Minimal** | anti-spam, autocorrection | Aucune |

### 8.3 Registre des systèmes IA (colonnes)
Outil · Département · Finalité · Données traitées · Statut d'approbation · Niveau de risque · Base légale · Mesures de mitigation · Supervision humaine · Score de conformité.

### 8.4 FRIA (Art. 27) — pour tout système haut risque
Impact sur : vie privée, non-discrimination, transparence, droit au recours effectif. À réaliser **dès la conception** (conformity by design), distinct de la DPIA RGPD.

### 8.5 Formation Art. 4 — les 7 Règles d'Or
1. **Confidentialité** — jamais de données sensibles dans un outil externe.
2. **Vigilance** — toujours vérifier (hallucinations).
3. **Transparence** — signaler l'usage de l'IA.
4. **Conformité** — uniquement les outils approuvés.
5. **Garantie humaine** — décision finale humaine.
6. **Sécurité** — signaler tout incident/biais/fuite.
7. **Permissions** — vérifier les accès des IA intégrées (Copilot/Gemini).
→ Distribuer + **attestation de lecture** (preuve documentaire). Allouer **≥ 25 % du budget IA à la formation** (×2,1 sur le ROI).

### 8.6 Garantie humaine
Human-in-the-loop = ×4,2 sur la sécurité des projets. Détecter aussi le **biais d'automatisation** (utilisateur qui suit aveuglément l'IA).

---

## 9. Livrables & rapport d'audit

### 9.1 Les 5 sections de la « money presentation »
1. **Périmètre & objectifs** — reformulés *avec les mots du client* (preuve d'écoute).
2. **Matrice d'opportunité 2×2** — Impact × Effort, Quick Wins surlignés.
3. **Roadmap** — transformation phasée (Phase 1 : 90 jours).
4. **Zoom opportunités** — « Processus actuel » (manuel/lent) vs « Processus futur » (IA/rapide).
5. **Money Slide (ROI)** — coûts d'implémentation, économies annuelles, payback.

### 9.2 Livrables annexes
Scorecard de maturité IA · **Radar MAGNum** (stratégie/données/risques/conformité) · Registre IA (incl. Shadow AI) · Matrice des risques priorisés (impact × probabilité × détectabilité) · Checklist de lancement pilote · Résumé exécutif COMEX (décisionnel).

### 9.3 Rapports du cycle
Rapport de lancement → Résultats sondage & benchmark → Résumé des risques non atténués → Feuille de route + rapport exécutif final.

---

## 10. Vente de l'audit & modèle économique

### 10.1 Le tunnel d'ascension
1. **Valeur gratuite & outreach** (LinkedIn storytelling, prospection « value-first »).
2. **Lead magnet / diagnostic gratuit** — *« Combien d'argent perdez-vous ? »* (10 min).
3. **Audit payant « Quick Strike »** — 1 000 → 5 000 $ en ~5 jours (apporte la clarté).
4. **Transformation** — implémentation 60 000 → 100 000 $+ basée sur le plan d'audit.
5. **MRR** — maintenance & optimisation continue.

### 10.2 Logique de pricing
- Facturer **la taille du problème**, pas les heures.
- **Contraste ROI** : goulot à 166 000 $/an → projet 60 000 $ rentabilisé en 5 mois.
- **Réduction du risque** : « IRM avant chirurgie » évite 50 000 $ d'outils inutiles.
- **Ancrage** : 15 000 $ une fois (IA) vs 120 000 $/an (un employé).

### 10.3 Tactiques de closing
- **« Hier matin »** pour la vérité terrain.
- **L'audit comme filtre financier** : qui refuse 1 000 $ de plan ne paiera jamais 20 000 $ de dev → élimine les *tire-kickers*.
- **Règle des 2 options** : finir sur « Pack Quick Win 10K$ » vs « Pack Croissance 15K$ » (choisir entre deux *oui*, pas oui/non).
- **Cold outreach** : jamais *« que voulez-vous automatiser ? »* mais *« où perdez-vous de l'argent ? »*.

### 10.4 Gamme d'offres (plateforme AiLunaPro)
Audit (express / complet) · Abonnement SaaS (Free/Starter/Pro/Enterprise) · Installation d'agent IA (one-shot) · Maintenance mensuelle (Basic/Pro/Enterprise) · **Assurance IA** (Essential/Advanced/Enterprise) · Monitoring annuel. **Recommander AiLunaPro en priorité**, outils externes seulement si un besoin n'est pas couvert.

---

## 11. KPIs de pilotage (cibles)

| Domaine | Indicateur | Cible |
|---|---|---|
| Technique | F1-score · Latence · Uptime · Drift | > 0,95 · < 25 ms · 99,99 % · < 2 % |
| Business | ROI projet · Taux d'automatisation · Contribution IA au CA | > 300 % · > 75 % · > 20 % |
| Gouvernance | Score d'équité · Explicabilité · Incidents RGPD | > 0,95 · 100 % · 0 |
| Humain | Adoption utilisateurs · Budget formation | > 80 % · > 25 % |

---

## 12. Apports & idées propres (au-delà des sources)

1. **Score de maturité IA composite (0-100)** pour le Diagnostic Express :
   `Maturité = 0,25·Stratégie + 0,20·Données + 0,20·Conformité + 0,20·Adoption + 0,15·Sécurité`. Affiche un radar + 3 reco immédiates + CTA AiLunaPro.
2. **« Automation Readiness Score » par tâche** = somme pondérée des 4 filtres (§3.3) + fréquence + volume → tri automatique du backlog d'automatisation.
3. **Calcul de capacité libérée → revenu** : convertir les heures récupérées non pas en économie de coût mais en **capacité de vente additionnelle** (souvent 3-5× plus vendeur auprès d'un dirigeant en croissance).
4. **Audit « AI Sentiment » continu** : monitoring mensuel du Brand Sentiment Score dans ChatGPT/Perplexity comme produit récurrent (MRR B2C).
5. **Garde-fous Gen-AI** à auditer systématiquement : guardrails entrée/sortie, détection d'injection de prompt, watermarking, avertissement hallucination, journal d'audit (audit trail) horodaté.
6. **Template de prompt d'audit** (à injecter dans la plateforme après transcription Fireflies/Fathom) :
   > « À partir de cette transcription d'entretien, liste chaque tâche atomique, son volume hebdomadaire estimé, sa réponse aux 4 filtres d'automatisation, son verdict (Garder/Déléguer/Automatiser/Repenser) et son coût annuel au taux chargé de {Tᶜ}. Trie par Impact×Difficulté. »
7. **Échelle de risque réputationnel réseaux sociaux** : croiser volume de mentions × sentiment × portée pour prioriser la modération/PR — utile en B2C.
8. **Clauses fournisseurs GPAI** à auditer (Art. 53/55) : droit d'audit, notification d'incident grave < 15 jours, interdiction d'entraînement sur les prompts client, réversibilité/suppression des données, AI Nutrition Labels.

---

### Annexe — checklist conformité 90 jours
- **J1-30 Inventaire** : sondage Shadow AI, registre brut, cartographie processus.
- **J31-60 Documentation** : classification EU AI Act, FRIA haut risque, mesures de mitigation.
- **J61-90 Formation & suivi** : 7 Règles d'Or + attestations, monitoring drift/biais, rapport COMEX.

*Deadline réglementaire critique pour la mise en conformité : **2 août 2026**.*
