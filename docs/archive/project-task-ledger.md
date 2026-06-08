> ⚠️ **OBSOLETE / SUPERSEDED — archived 2026-06-07.** The single authoritative source of truth is `docs/cahier-des-charges-v2.md` (§0bis Master Ledger). This file is reference-only and carries **no agreed scope**.

# AiLunaPro — Project Task Ledger (truth-finding reconciliation)

*Generated 2026-06-07. Reconciles: `cahier-des-charges-v2.md` (§18 closures + §19 Option B), `cahier-des-charges-v2.4-FINAL.md` (unmerged spec), status/architecture docs, the Option B task plan, and verbal requests during this session. No smoothing, no optimistic language. Status reflects code + §18 trace, not intent.*

**Legend:** ✅ DONE (verified, traceable to commit + operator "prod verified") · 🟡 PARTIAL / lite / display-only · 🔴 NOT DONE · ⚠️ spec exists but uncaptured/contradictory.

---

## A. Core platform (shipped & verified)

| Task / Module | Status | Spec | Commit / batch |
|---|---|---|---|
| Billing / Stripe (checkout, sub, portal, top-ups, multi-currency) | ✅ | v2 §6/§7 · v2.4 0bis.2 | J1–J2 (closed) |
| Payment Methods (Customer Portal) | ✅ | v2.4 0bis.2 | J10 `868ef8a`/`e8cabd2` |
| K1A Diagnostic Express (public) | ✅ | v2 §11 · v2.4 K1A | `34c1fba` |
| K2A ROI Calculator (public) | ✅ | v2 §11 · v2.4 K2A | `dd15460` |
| K3A / K3+ Recommendation engine + Prioritized Action Plan | ✅ | v2 §11 · v2.4 K3+ | `543f960`, J9-D `5c3461d` |
| Audio Explanations (client TTS, disclaimer-first) | ✅ | v2.4 0bis.2 | J11 `3f2b84f`/`c99740f`/`2045318` |
| Analytics — PostHog **Phase A** (page/chunk, consent-first, no-PII) | ✅ | v2.4 0bis.2 | J13 `eafb399`→`ed1a3ba` |
| NFR: SPA cache / chunk-load resilience / Firestore resilience | ✅ | v2.4 §7bis | `9bcb741`/`925c690`/`73ec62d` |
| Determinism & traceability (rule-based scoring + version stamp) | ✅ | v2.4 §0.4/§3quater | `worker/.../determinism.ts` + replay tests |
| System Builder (static design guide) | 🟡 skeleton only | v2 §11 J9 | J9 (read-only, no persistence, no nav) |

## B. Audit Express & Reports (shipped this session — exceeds the v2.4 "Partial" status)

| Task | Status | Spec | Commit / batch |
|---|---|---|---|
| Audit Express §3bis (public demo + in-app run) | ✅ | v2.4 §3bis | f12fa3a + earlier J15/J16 |
| Audit Express: save / list / detail / rename | ✅ | §18 | J15 P1.1, `62afe87`, `e11a665` |
| Audit Express: recommended agents on detail | ✅ | §18 | `6192335` |
| Audit Express: PDF (deterministic) | ✅ | v2.4 §3ter P1 | J15/J16 |
| Audit Express: public HMAC share + revoke/regenerate/disable | ✅ | §18 | `c0c5431`, `d3c0258` |
| Reports A — worker scoring + premium deterministic Report PDF + AI sections | ✅ | §18 | `6434dfa` |
| Reports B — server detail recompute / file / rename | ✅ | §18 | `425e345`, `59fb537` |
| Reports C — public HMAC share + revoke/regenerate/disable + status badge | ✅ | §18 | `9240d94` |
| Render-crash stability hardening | ✅ | §18 | `2862368`, `c512891` |
| P1 PDF Report Renderer (§3ter) | ✅ (covered by the above) | v2.4 §3ter | — |

## C. Partial / lite / display-only

| Task | Status | Spec | Note |
|---|---|---|---|
| V1 — Analyse de site (URL crawl → editable stack/AI fiche) | 🟡 lite | v2.4 V1 | Audit Express `runExtraction` does the crawl; no editable "fiche" / standalone V1 surface |
| W1 — Quick Win matrix (Impact×Effort, top 3) | 🟡 lite | v2.4 W1 | Opportunity matrix exists inside the Audit Express PDF; no standalone scored W1 surface |
| Smart Locale + Currency | 🟡 display-only | v2.4 0bis.2 · v2 §9.24 | Currency **display** + FX ✅; **UI/content translation 🔴 (deferred §9.24)** |
| SEO/GEO public surfaces (§7ter) | 🟡 | v2.4 §7ter | Pages exist (`/audit-express`, `/eu-ai-act`, `/faq`, `/methodologie`, `/pricing`, `/shadow-ai`, `/use-cases`); sitemap.xml / schema.org / llms.txt missing |
| Analytics Phase B (feature-usage events) | 🔴 | v2.4 0bis.2 | Phase A only |

## D. NOT DONE — specced in v2.4-FINAL but unbuilt (and mostly NOT in live v2.md)

| Module | Status | Spec | Captured in live source of truth? |
|---|---|---|---|
| U1 — Mode assisté zéro-expertise (1-action wizard) | 🔴 | v2.4 §3 U1 | ⚠️ No (not in v2.md/§19) |
| K5 — Document Intelligence (**RAG** → R2+Vectorize) | 🔴 | v2.4 K5 (J1.5) | ⚠️ Only as §19.B5 — but **re-scoped no-LLM/deterministic**, which **contradicts** K5's RAG/Vectorize design |
| X1 — Audit of AI-in-place / OPEX reduction | 🔴 | v2.4 X1 (J1.5) | ⚠️ No (not in v2.md/§19) |
| K6 — **Luna Copilot** (SSE tool-use orchestrator, Anthropic API) | 🔴 | v2.4 K6 (J1.6) | ⚠️ Only as §19.B4 — but **re-scoped rule-based/no-LLM**, which **contradicts** K6's LLM/SSE design |
| L3 — Managed quote (€ calibration, SLA) | 🔴 | v2.4 L3 (J1.7) | ⚠️ No |
| L4 — Contract generation + e-signature | 🔴 | v2.4 L4 (J1.7) | ⚠️ No |
| Y1 — SOP generation | 🔴 | v2.4 Y1 (J1.7) | ⚠️ No |
| R1 — Partner / White-label + credits ledger | 🔴 | v2.4 R1 (J1.8) | ⚠️ No |
| S1 — Monthly monitoring + paid AI Expert | 🔴 | v2.4 S1 (J1.9) | ⚠️ No |
| T1 — Revenue recovery (dunning email Sequenzy + SMS) | 🔴 | v2.4 T1 (J1.9) | ⚠️ Partial overlap with §19.B2 re-engagement (not the full dunning) |
| Q1 — Intelligence Refresh Engine (human-in-loop) | 🔴 | v2.4 Q1 (J1.10) | ⚠️ No |

## E. Option B (§19) — net-new, gated, NONE implemented

| Item | Status | Note |
|---|---|---|
| B1 Global nav for non-sidebar pages | 🔴 | §19, gated |
| B2 Systematic login/signup + lead capture + abandoned-flow | 🔴 | §19, gated (overlaps T1) |
| B3 System Builder → core feature | 🔴 | §19, gated (skeleton exists) |
| B4 Luna AI Copilot (visible surface) | 🔴 | §19, gated — **decision A rule-based vs B LLM unresolved; conflicts with v2.4 K6** |
| B5 Document upload → audit | 🔴 | §19, gated — **conflicts with v2.4 K5 (RAG)** |
| B6 i18n + currency | 🔴 (translation) / 🟡 (currency) | §19, gated |
| B7 Product hygiene + final inspection | 🔴 | §19, gated |

---

## Discrepancy register (explicit)
1. **Unmerged spec:** `v2.4-FINAL` was marked "to be merged into v2.md" — the merge never happened for U1/V1/K5/X1/W1/K6/L3/L4/Y1/R1/S1/T1/Q1. The live "source of truth" (`v2.md`) does not track these. **Tracking gap.**
2. **Two competing cahiers:** `v2.md` (Jun 7, live) vs `v2.4-FINAL.md` (May 31). The "v2.4-FINAL" name implies it supersedes "v2", but `v2.md` is the maintained one. **Ambiguous source of truth.**
3. **Spec contradictions (no-LLM guardrail vs original specs):** v2.4 **K5 = RAG/Vectorize** and **K6 = SSE tool-use + Anthropic API** (both LLM). The product's standing "no-LLM, deterministic" guardrail and §19.B4/B5 re-scope these as rule-based — a **direct contradiction** that is unresolved.
4. **Stale docs alongside current ones:** `AiLunaPro-Architecture-And-Status.md` says "backend not started" (false now); `AiLunaPro-Status-Dashboard.md` + `AiLunaPro-Handoff.md` are May-31 snapshots predating the June epics; `backend-routes.md` (May 1) is superseded by `application-map.md`. Reading these misleads.
5. **Forward-reconciliation gap:** v2.4's status table still lists Audit Express as "Partial (Phase 4)", though it is now fully shipped — docs were not updated forward.
6. **No untraceable "done":** every ✅ in sections A/B maps to a commit and an operator "prod verified". No "done" claim lacks a trace.

## Source-of-truth & structure recommendation
- **Single source of truth:** keep **`cahier-des-charges-v2.md`** — **but it must absorb the unmerged v2.4 modules** (section D) as explicit deferred/§19 items before it can be called complete.
- **Living status:** this file **`docs/project-task-ledger.md`** — keep current at each closure.
- **Supporting references (keep):** `application-map.md`/`.pdf`, `firestore-access-matrix.md`, `option-b-task-plan.md`/`.pdf`. Fold `backend-routes.md` into `application-map.md`.
- **Reconcile-then-archive:** `cahier-des-charges-v2.4-FINAL.md` — do **not** archive until section D is merged into v2.md/this ledger; until then it remains a referenced spec source.
- **Archive (dated snapshots, obsolete):** `AiLunaPro-Architecture-And-Status.md`, `AiLunaPro-Status-Dashboard.md`, `AiLunaPro-Handoff.md` → move under `docs/archive/` with a clear OBSOLETE banner.

## Closing
**Based on the documentation audit, the project is NOT functionally complete relative to the full v2.4-FINAL vision.** The **core** (billing, K1A/K2A/K3A, Audit Express, Reports, audio, currency-display, analytics A, NFR, determinism, PDF) is shipped and prod-verified. A **large monetization/transformation tier** (U1, V1-full, K5, X1, W1-full, K6/Luna, L3, L4, Y1, R1, S1, T1, Q1) and **all of Option B (§19 B1–B7)** are **not implemented**, and several were **dropped from the live source of truth**. The product can be considered "deliverable as a core compliance + Audit/Reports product", but **not** "feature-complete" against the documented vision.
