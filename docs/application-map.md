# AiLunaPro — Application Map (factual inventory)

*Generated 2026-06-07. Source of truth: `src/types/audit.ts` Route union, `src/data/mockDashboard.ts` nav, `public/` static pages, `worker/src/routes/*`. Factual inventory — no roadmap, no assumptions.*

**Legend:** 🌐 public (no login) · 👤 authenticated member · 🛡️ owner/admin (or platform-admin for Operator)

---

## 1) Entry points

### A. Public — no login

**Static marketing/SEO pages (Cloudflare Pages, separate from the SPA):**

| Name | URL | Purpose | Auth |
|---|---|---|---|
| Audit Express (demo) | `/audit-express` | Anonymous tap-based AI-readiness demo + ROI | 🌐 |
| EU AI Act | `/eu-ai-act` | SEO / info page | 🌐 |
| FAQ | `/faq` | SEO / info | 🌐 |
| Méthodologie | `/methodologie` | SEO / info | 🌐 |
| Pricing | `/pricing` | SEO / pricing | 🌐 |
| Shadow AI | `/shadow-ai` | SEO / info | 🌐 |
| Use cases | `/use-cases` | SEO / info | 🌐 |

**Public worker APIs (consumed by the static pages / share links):**

| Route | Purpose | Auth |
|---|---|---|
| `POST /api/public/audit-express/{config,preview,extract,pdf}` | Anonymous Audit Express (Turnstile-gated) | 🌐 |
| `POST /api/public/diagnostic` · `POST /api/public/roi-calculation` | Public diagnostic / ROI compute | 🌐 |
| `GET /api/public/fx` · `GET /api/public/geo` | Currency / geo helpers | 🌐 |
| `GET /api/audit-express/shared/:token` | Shared Audit Express PDF (HMAC, no login) | 🌐 |
| `GET /api/reports/shared/:token` | Shared Report PDF (HMAC, no login) | 🌐 |

**SPA auth pages (public):**

| Name | Route | Purpose | Auth |
|---|---|---|---|
| Login | `#/login` | Sign in | 🌐 |
| Signup | `#/signup` | Create account | 🌐 |
| Forgot password | `#/forgot-password` | Reset password | 🌐 |
| Create org | `#/org/create` | First workspace | 🌐 (post-signup) |
| Accept invite | `#/accept-invite` | Join workspace | 🌐 (tokened) |

### B. Authenticated SPA routes (hash routing `#/…`)

| Name | Route | Purpose | Auth |
|---|---|---|---|
| Dashboard | `#/dashboard` | KPI overview | 👤 |
| New Audit | `#/audit/new` | Start questionnaire audit | 👤 |
| Audit result | `#/audit/result` | Computed audit result | 👤 |
| Audit assistance | `#/audit/assistance` | Action/recommendation plan for an audit | 👤 |
| Audit history | `#/audit/history` | Past audits | 👤 |
| Reports | `#/reports` | List of report snapshots | 👤 |
| Report detail | `#/reports/detail/:id` | View report + Download PDF + Rename + Sharing card | 👤 (rename/share 🛡️) |
| Report share (in-app) | `#/reports/share/:id` | In-app read-only view (same workspace) | 👤 |
| AI Registry | `#/registry` | Inventory of AI tools | 👤 |
| Agents | `#/agents` | Agent catalog + recommend panel | 👤 |
| Agent detail | `#/agents/detail/:id` | One agent | 👤 |
| Run Audit Express | `#/audit-express/run` | In-app Audit Express | 👤 |
| Saved Audits | `#/audit-express/saved` | Saved Audit Express list | 👤 |
| Saved Audit detail | `#/audit-express/detail/:id` | Detail + PDF + rename + share lifecycle + recommended agents | 👤 (mutations 🛡️) |
| Diagnostic | `#/diagnostic` | Diagnostic engine view | 👤 *(route exists; not in primary sidebar nav)* |
| ROI Calculator | `#/roi-calculator` | ROI compute | 👤 *(not in primary nav)* |
| System Builder | `#/system-builder` | Guided setup | 👤 *(not in primary nav)* |
| Team | `#/team` | Members / invites | 👤 (manage 🛡️) |
| Settings — Profile | `#/settings/profile` | User profile | 👤 |
| Settings — Org | `#/settings/org` | Org settings | 🛡️ |
| Settings — Preferences | `#/settings/preferences` | Preferences | 👤 |
| Settings — Billing | `#/settings/billing` · `#/billing` · `#/billing/success` | Stripe billing | 🛡️ |
| Buy tokens | `#/billing/tokens` | Token packs | 👤 / 🛡️ |
| Help | `#/help` | Help center | 👤 |
| Operator console | `#/operator` | Platform admin | 🛡️ platform-admin allowlist |

### C. Primary sidebar nav (the visible menu)

Dashboard · New Audit · Reports · Audit history · **Run Audit Express** · **Saved Audits** · AI Registry · Agents · Team · Settings · Billing · Help.

*(Diagnostic, ROI Calculator, System Builder, Operator are routable but not in this sidebar list.)*

---

## 2) Feature → where it lives

| Feature | Entry point(s) |
|---|---|
| **Audit Express** | Public demo `/audit-express`; in-app `#/audit-express/run`; list `#/audit-express/saved`; detail `#/audit-express/detail/:id`; worker `/api/(public/)audit-express/*` |
| **Reports (from New Audit)** | `#/audit/new` → submit → `#/reports` → `#/reports/detail/:id`; worker `/api/reports/{detail,file,title,share,…}` |
| **Sharing** | Audit Express: detail share card → `/api/audit-express/{share,…,shared/:token}`. Reports: detail share card → `/api/reports/{share,…,shared/:token}`. Plus in-app `#/reports/share/:id` |
| **PDF generation** | Audit Express PDF (worker, deterministic) via Saved/Run detail "Download PDF"; Report PDF (worker, deterministic) via `#/reports/detail` "Download PDF"; public PDFs via shared links |
| **Recommendations** | Agents catalog `#/agents` + RecommendPanel; "Recommended agents" card on Saved Audit detail; worker `/api/recommend`, `/api/agents` |
| **Assistant-like behavior** | `#/audit/assistance` (static action/recommendation plan) · `AudioExplanation` (browser TTS narration of a report) · Audit Express "understanding" (rule-based). **No conversational copilot.** |

---

## 3) "Luna AI Copilot" — explicit answer

**No.** There is **no distinct feature, route, or UI named "Luna AI Copilot."**

- The only occurrence of "Luna AI" is a **marketing tagline**: `CTABlock.tsx` → *"✨ Powered by Luna AI"*. The words "copilot" / "assistant" elsewhere are only **example data** (registry tool names, a questionnaire option, Audit Express opportunity titles like "support assistant") — not a product feature.

**Existing features that partially cover the concept:**

- `#/audit/assistance` — a generated **action plan** (static, rule-based; not conversational).
- Agents catalog + `/api/recommend` — **recommends** AI agents from a profile.
- `AudioExplanation` — **narrates** a report via browser speech (one-way TTS).
- Audit Express "understanding" — rule-based interpretation of a crawled site.

**What's missing for it to be a real, explicit Copilot:** a dedicated route/UI; a conversational/interactive surface; the ability to take a user request and act/answer across the product; and (if intended) an LLM — which the codebase currently does **not** use anywhere (all engines are deterministic / rule-based).

---

## 4) Gap summary

- **Exists today:** questionnaire Audits → Reports (detail, premium PDF, rename, full share lifecycle); Audit Express (public + in-app, save, detail, PDF, share lifecycle, recommended agents); AI Registry; Agents catalog + recommendations; Diagnostic / ROI / System Builder routes; Team / Settings / Billing (Stripe); Operator console; public SEO pages; deterministic hand-rolled PDFs; HMAC public sharing for both Audit Express and Reports.
- **Never implemented:** any "Luna AI Copilot" feature; document/file upload → analysis (confirmed net-new); any LLM-based behavior.
- **Only implicit / conceptual:** "Luna AI" as a brand tagline; "assistant/copilot" as example data and agent categories — not shipped product surfaces.
- **Would require a new epic:** (a) an explicit **Luna AI Copilot** (conversational/assistant surface — and a decision on LLM vs rule-based); (b) **Document upload → audit**. Both are net-new, gated.

---

*Waiting for your confirmation on what is missing or should be formalized.*
