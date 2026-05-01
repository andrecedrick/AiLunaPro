# Backend Routes — AiLunaPro Worker

**Runtime:** Cloudflare Workers + Hono v4  
**Entry:** `worker/src/index.ts`  
**Local dev:** `npm run worker:dev` (runs on `http://localhost:8787`)

---

## Middleware stack (applied globally)

| Middleware | File | Notes |
|---|---|---|
| Error handler | `middleware/error.ts` | Wraps all routes; returns `{ error, code }` JSON |
| CORS | `middleware/cors.ts` | Reads `ALLOWED_ORIGINS` env var; handles preflight |
| Auth (per-route) | `middleware/auth.ts` | Firebase JWT verify via JWKS; injects `uid` into context |

---

## Implemented routes (Phase G)

| Method | Path | Auth | Status | Notes |
|---|---|---|---|---|
| GET | `/healthz` | None | ✅ Live | Uptime probe; returns `{ ok, timestamp }` |
| GET | `/api/me` | Required | ✅ Live | Returns `{ uid }` from verified Firebase token |
| POST | `/api/audits/:id/submit` | Required | 🟡 Skeleton | Server-side audit submit; no logic yet |
| POST | `/api/reports/:id/export` | Required | 🟡 Skeleton | PDF generation; no logic yet |
| POST | `/api/team/invite` | Required | 🟡 Skeleton | Email invite dispatch; no logic yet |
| POST | `/api/stripe/webhook` | None (Stripe-Signature) | 🟡 Skeleton | Stripe event handler; no logic yet |

---

## Planned routes (future phases)

| Phase | Method | Path | Purpose |
|---|---|---|---|
| H | PUT | `/api/profile` | Update user display name in Firestore |
| H | DELETE | `/api/org/:id` | Soft-delete organization |
| I | POST | `/api/stripe/checkout` | Create Stripe checkout session |
| I | GET | `/api/billing/status` | Read subscription status |
| G+ | POST | `/api/reports/:id/export` | Real PDF generation (Puppeteer / @cloudflare/puppeteer) |
| G+ | POST | `/api/team/invite` | Send invitation email via Resend |

---

## Auth flow

```
Frontend
  1. firebase.auth().currentUser.getIdToken()  →  Bearer <JWT>
  2. fetch('http://localhost:8787/api/me', { headers: { Authorization: 'Bearer <JWT>' } })

Worker
  3. auth.ts middleware verifies JWT against Firebase JWKS
  4. Extracts uid from token.sub
  5. Sets c.variables.uid for the route handler
  6. Returns { uid } (or runs business logic in future phases)
```

---

## Local dev

```bash
# Install worker deps
cd worker && npm install

# Run worker (hot-reload)
npm run worker:dev          # from repo root
# OR
cd worker && npx wrangler dev
```

Worker runs on `http://localhost:8787` by default.  
Frontend runs on `http://localhost:5174`.  
CORS is pre-configured for both ports.
