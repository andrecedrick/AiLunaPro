> ⚠️ **OBSOLETE / SUPERSEDED — archived 2026-06-07.** The single authoritative source of truth is `docs/cahier-des-charges-v2.md` (§0bis Master Ledger). This file is reference-only and carries **no agreed scope**.

# Option B — Sequential, Non-Skippable Task Plan (execution contract)

*Generated 2026-06-07. Planning only — no code, no UI, no implementation. Derived strictly from §19 of `docs/cahier-des-charges-v2.md` (commit 9905f41). One task per §19 item, executed strictly in order. Each task = its own pre-flight → GO → implement → gates → prod-verify → §18 closure, before the next begins.*

**Global rules (apply to every task):**
- **Strictly sequential.** No task starts until the previous is completed, verified, and explicitly closed (§18 entry recorded).
- **No parallel execution.** One task in flight at a time.
- **Every task is gated.** Pre-flight is read-only; implementation begins only on explicit GO.
- **Standing guardrails** (from the project): determinism preserved, no PII in logs/URLs/tokens, Stripe = sole billing source, no new dependencies unless explicitly approved, CSP unchanged unless a task scopes it, org isolation, deploy flow = Pages from repo root / Worker from `worker/`.

---

## Task 1 — Global navigation for non-sidebar pages
- **Related §19 item:** B1
- **Goal:** Establish an adaptive navigation framework so `#/diagnostic`, `#/roi-calculator`, `#/system-builder` (and future campaign pages) are discoverable in-app while remaining usable as standalone public campaign links.
- **Why it comes now:** Foundational — B2 (login/lead capture on those pages), B3 (System Builder in nav), and B4 (Copilot surface) all depend on a defined navigation/chrome model existing first.
- **Inputs required:** §19.B1; the application map (`docs/application-map.md`) listing current routes + chromeless vs authenticated state. No prior task.
- **Affected areas:** Frontend, UX, Docs.
- **Non-goals:** No redesign of funnel content; no change to the public APIs of those pages; no auth/lead logic (that is Task 2).
- **Acceptance criteria:** A documented, implemented rule for chromeless-vs-navigated per page; authenticated users can reach these pages and always have a clear path back to Dashboard / Reports / Audit Express; anonymous campaign visitors still get the chromeless funnel.
- **Verification checklist:** Each page opened anonymously = chromeless (brand + Login/Sign-up only); opened authenticated = app nav / "Back to app" present; back-paths work; build/tsc/vitest/hygiene gates green; prod-verified.
- **Gate before next task:** Operator "prod verified" + §18 closure for B1 recorded.

---

## Task 2 — Systematic Login/Sign-up + lead capture + abandoned-flow tracking
- **Related §19 item:** B2
- **Goal:** Present Login/Sign-up on every public/chromeless surface and record every lead interaction with anonymous→authenticated continuity, abandoned-flow detection, and re-engagement hooks.
- **Why it comes now:** Depends on Task 1 — the nav/chrome model must exist so Login/Sign-up placement is consistent across the (now-framed) public pages.
- **Inputs required:** Task 1 closed; **DECISION: lead-storage model** (existing consented analytics vs a new consented store); existing consent banner / PostHog gating; existing Audit Express continuity pattern.
- **Affected areas:** Frontend, Worker, Analytics, UX, Docs (Infra only if a new store is chosen).
- **Non-goals:** No session replay, no keystroke capture; no non-consented tracking; no legal/compliance claims; no billing changes.
- **Acceptance criteria:** Login/Sign-up visible on all public surfaces; leads recorded per consent; an anonymous result carries into the account after auth; unfinished diagnostic/audit detectable; re-engagement hook defined; zero PII in logs.
- **Verification checklist:** Consent-off ⇒ no tracking; consent-on ⇒ events recorded (no PII); anonymous→login continuity works end-to-end; abandoned-flow event fires on drop-off; gates green; prod-verified.
- **Gate before next task:** Lead-storage decision approved + "prod verified" + §18 closure for B2.

---

## Task 3 — System Builder promoted to a core feature
- **Related §19 item:** B3
- **Goal:** Make System Builder a first-class, discoverable feature (main navigation + clear entry points) positioned as the central AI-design/governance guide and a bridge from Audit results → system setup.
- **Why it comes now:** Depends on Task 1 (the adaptive main-nav framework needed to add it as a real nav destination).
- **Inputs required:** Task 1 closed; §19.B3; **DECISION: whether v1.x adds persistence/checklists** (today in-memory only).
- **Affected areas:** Frontend, UX, Docs (Worker only if persistence is approved).
- **Non-goals:** No scoring; no LLM; no legal advice; remains read-only in v1 unless persistence is explicitly approved.
- **Acceptance criteria:** System Builder reachable from main nav + a clear Audit-result entry point; mandatory disclaimer retained; read-only behavior preserved (or persistence only if approved).
- **Verification checklist:** Nav entry + Audit→builder bridge work; disclaimer present; no scoring/LLM introduced; gates green; prod-verified.
- **Gate before next task:** Persistence decision resolved + "prod verified" + §18 closure for B3.

---

## Task 4 — Luna AI Copilot (visible named guidance surface)
- **Related §19 item:** B4 *(gated epic)*
- **Goal:** Introduce a visible, named "Luna AI Copilot" surface that guides users through audits, reports, and features and improves onboarding.
- **Why it comes now:** Depends on Tasks 1–3 — it guides users across navigation (B1), onboarding/continuity (B2), and System Builder (B3); building it earlier would point at incomplete surfaces.
- **Inputs required:** Tasks 1–3 closed; **DECISION (blocking): rule-based/deterministic (Option A) vs conversational/LLM (Option B — currently out of scope).** No pre-flight until this is decided.
- **Affected areas:** Frontend, UX, Docs (Worker/Infra only if a non-rule-based option were ever approved — out of scope now).
- **Non-goals:** No LLM and no conversational behavior in v1 (explicitly out of scope); no non-determinism; no new dependency.
- **Acceptance criteria:** A discoverable Copilot surface delivering deterministic, rule-based guidance (contextual help, guided next-steps, deep-links) consistent with the no-LLM architecture.
- **Verification checklist:** Surface visible + reachable; guidance is deterministic/rule-based (no model calls); no PII; gates green; prod-verified.
- **Gate before next task:** A-vs-B decision recorded (expected: A) + "prod verified" + §18 closure for B4.

---

## Task 5 — Document upload → deterministic analysis pipeline
- **Related §19 item:** B5 *(gated epic)*
- **Goal:** Let companies upload documents and run deterministic, rule-based analysis that feeds/pre-fills audits and reports.
- **Why it comes now:** Sequenced after the core surfaces (1–4) so its output plugs into a stable audit/report pipeline; it is otherwise independent.
- **Inputs required:** Tasks 1–4 closed; **DECISION: confirm deterministic/no-LLM/rule-based interpretation + v1 format scope** (e.g. plain text / PDF text-layer first).
- **Affected areas:** Frontend, Worker, UX, Docs (Infra only if server-side parsing/storage is chosen — recommended approach keeps raw bytes client-side).
- **Non-goals:** No LLM; no semantic interpretation; no raw-document persistence; no new PDF/report engine; no OCR/DOCX in v1.
- **Acceptance criteria:** Upload (capped type/size, org-scoped, auth-gated) → deterministic signal extraction → scrubbed, non-PII signals pre-fill an audit/report; same input ⇒ same signals; raw files never persisted.
- **Verification checklist:** PII scrubbed before analysis/storage/logs; determinism test (same doc ⇒ same signals); size/type caps enforced; no raw-file persistence; gates green; prod-verified.
- **Gate before next task:** Deterministic/scope decision approved + "prod verified" + §18 closure for B5.

---

## Task 6 — Internationalization + currency activation
- **Related §19 item:** B6
- **Goal:** Enable UI + generated-content translation and online currency handling for pricing/ROI/reports, with explicit unsupported-locale/currency fallback.
- **Why it comes now:** Cross-cutting — must come after the surfaces (1–5) are stable so translation/currency are applied once to a settled UI/content set (avoids re-translating moving targets).
- **Inputs required:** Tasks 1–5 closed; **DECISION: translation approach** (static dictionaries vs a translation service — service may conflict with no-new-deps/determinism); existing language selector + FX helper (`/api/public/fx`) + currency selector.
- **Affected areas:** Frontend, Worker, UX, Docs.
- **Non-goals:** Stripe remains the sole billing source (display/conversion must not change charged-amount semantics); no PDF non-determinism (must stay deterministic per locale+inputs); no new deps unless approved.
- **Acceptance criteria:** UI + generated content translate; currency display/conversion works for pricing/ROI/reports; unsupported locale/currency falls back gracefully; PDFs remain deterministic per (locale, inputs).
- **Verification checklist:** Each supported locale/currency renders correctly; unsupported ⇒ documented fallback; charged amounts unchanged; deterministic-PDF test per locale; gates green; prod-verified.
- **Gate before next task:** Translation-approach decision approved + "prod verified" + §18 closure for B6.

---

## Task 7 — Product hygiene & final inspection (ready-to-ship)
- **Related §19 item:** B7
- **Goal:** Activate or remove every inactive button, complete a full UI/UX cleanup, and run a deep functional + visual inspection against an explicit ready-to-ship checklist before public delivery.
- **Why it comes now:** Must be last — it inspects and finalizes the complete product including everything delivered in Tasks 1–6.
- **Inputs required:** Tasks 1–6 closed; full route/CTA inventory; the §17 inspection discipline.
- **Affected areas:** Frontend, UX, Docs (and any small fixes surfaced by inspection).
- **Non-goals:** No new features; cleanup and inspection only.
- **Acceptance criteria:** Every CTA/nav item is wired or removed; consistent empty/error/loading states; stale copy fixed (e.g. Reports "stored locally" footer); a signed-off ready-to-ship checklist (build/tsc, full vitest, hygiene, cross-tenant + deterministic-PDF spot-checks, deploy-flow verification).
- **Verification checklist:** Button/CTA audit table (each = wired or removed); UX consistency pass; full gates green; cross-tenant + determinism spot-checks pass; deploy-flow verified (Pages from root / Worker from `worker/`); prod-verified.
- **Gate before next task:** Final "prod verified" + §18 closure for B7 → Option B epic complete.

---

## Complete ordered task list
1. **Task 1 — B1** Global navigation for non-sidebar pages.
2. **Task 2 — B2** Login/Sign-up + lead capture + abandoned-flow tracking.
3. **Task 3 — B3** System Builder promoted to a core feature.
4. **Task 4 — B4** Luna AI Copilot (visible rule-based guidance surface) *(gated; decision A-vs-B)*.
5. **Task 5 — B5** Document upload → deterministic analysis pipeline *(gated; decision)*.
6. **Task 6 — B6** Internationalization + currency activation *(decision: translation approach)*.
7. **Task 7 — B7** Product hygiene & final inspection (ready-to-ship).

## Summary — why this order prevents omissions, and where GO decisions are required
The order follows hard dependencies: **navigation (B1)** is the backbone, so lead capture (B2), System Builder discovery (B3), and the Copilot surface (B4) all attach to a framework that already exists; **document analysis (B5)** is sequenced after the core so its output feeds a stable audit/report pipeline; **i18n + currency (B6)** comes after the UI/content is settled to avoid re-translating moving targets; and **hygiene + final inspection (B7)** is necessarily last because it finalizes everything built before it. Executing one task at a time, each closed (verified + §18-recorded) before the next, guarantees no item is skipped or diluted — the §18 closure trail is the audit of completeness. **Explicit GO/decision points required:** before Task 2 (lead-storage model), before Task 3 (System Builder persistence), **before Task 4 (rule-based vs LLM Copilot — blocking; LLM out of scope now)**, before Task 5 (confirm deterministic/no-LLM + v1 formats), before Task 6 (translation approach), and a GO to start each task plus a final ready-to-ship sign-off at Task 7. No pre-flight or implementation proceeds without your explicit GO per task.
