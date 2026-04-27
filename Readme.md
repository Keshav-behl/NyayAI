# NyayAI — AI-Powered Indian Legal Platform
### Claude Code Handoff Document — Read This Fully Before Touching Any File

> Last updated: April 2026 | Status: Week 6 of 7 complete

---

## 1. WHAT THIS PROJECT IS

NyayAI is an AI-powered legal platform targeting the Indian legal market across three verticals:

- **B2C** — Individual citizens seeking legal help (document analysis, legal Q&A)
- **Marketplace** — Connecting clients with verified lawyers (booking, consultations, reviews)
- **B2B** — Law firms and enterprises via organization accounts and API access

**Core differentiator:** NyayAI owns the mass market (tier-2/3 cities, district courts) that competitors like Jurisphere ignore. Jurisphere targets the top ~500 law firms with large LLM corpora. NyayAI targets everyone else — lawyers and clients those firms don't touch.

**Strategic moat:** Per-lawyer private intelligence (uploaded judgments, clause libraries, judge profile notes) + BNS/BNSS criminal law transition as a near-term differentiator.

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 21, Express 4, Prisma ORM 5.22 |
| Database | PostgreSQL 16 (Docker on port 5433) |
| Frontend | React 18, Vite 5, TailwindCSS 3 |
| Auth | JWT (access 7d + refresh 30d, rotation) |
| Vector DB | Pinecone (integrated embeddings, llama-text-embed-v2, 1024 dims) |
| AI/LLM | NVIDIA API — meta/llama-3.3-70b-instruct |
| File Upload | Multer (local disk, /uploads folder) |
| Security | Helmet, express-rate-limit, express-validator |
| Logging | Winston |
| Testing | Jest, Supertest |
| DevOps | Docker Compose (local PostgreSQL) |

**Important ports:**
- Backend: `http://localhost:5001` (5000 blocked by macOS Control Center)
- Frontend: `http://localhost:5173`
- PostgreSQL Docker: port `5433` (5432 taken by local Postgres)
- pgAdmin: `http://localhost:5050`

---

## 3. PROJECT STRUCTURE

```
NyayAI/
├── docker-compose.yml
├── README.md                          ← this file
│
├── backend/
│   ├── .env                           ← DO NOT COMMIT
│   ├── .env.example
│   ├── package.json
│   ├── uploads/                       ← user uploaded files (gitignored)
│   ├── logs/                          ← winston logs (gitignored)
│   │
│   ├── prisma/
│   │   ├── schema.prisma              ← 9-table schema
│   │   ├── seed.js                    ← demo data
│   │   └── ingest-legal-data.js       ← Pinecone ingestion script
│   │
│   └── src/
│       ├── index.js                   ← server entry point (port 5001)
│       ├── app.js                     ← Express app + all middleware
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── lawyerController.js
│       │   ├── documentController.js
│       │   ├── analysisController.js  ← AI document analysis
│       │   ├── consultationController.js
│       │   ├── legalController.js     ← RAG pipeline
│       │   └── organizationController.js
│       │
│       ├── middleware/
│       │   ├── authenticate.js        ← JWT + API key auth (dual mode)
│       │   ├── authorize.js
│       │   ├── errorHandler.js
│       │   ├── notFound.js
│       │   ├── upload.js              ← Multer config
│       │   └── validate.js
│       │
│       ├── routes/
│       │   ├── health.js
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── lawyers.js
│       │   ├── documents.js           ← includes analysis endpoints
│       │   ├── consultations.js
│       │   ├── legal.js               ← /search and /ask (RAG)
│       │   └── organizations.js       ← B2B org management
│       │
│       ├── utils/
│       │   ├── prisma.js              ← singleton Prisma client
│       │   ├── logger.js              ← Winston
│       │   ├── claude.js              ← NVIDIA Llama wrapper (generateLegalAnswer, analyzeDocument)
│       │   ├── embeddings.js          ← text chunking utils
│       │   ├── pinecone.js            ← Pinecone client
│       │   ├── sanitize.js            ← prompt injection prevention
│       │   └── fileValidator.js       ← magic byte validation
│       │
│       └── __tests__/
│           ├── health.test.js
│           └── auth.test.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js                 ← proxy /api → localhost:5001
    ├── tailwind.config.js             ← custom colors: saffron, navy, gold
    ├── postcss.config.js
    ├── package.json
    │
    └── src/
        ├── main.jsx
        ├── index.css                  ← Tailwind base + custom components
        ├── App.jsx                    ← all routes defined here
        │
        ├── hooks/
        │   └── useAuth.jsx            ← AuthContext + login/register/logout
        │
        ├── services/
        │   └── api.js                 ← Axios instance, 120s timeout, auto-refresh
        │
        ├── components/
        │   └── BookingModal.jsx        ← consultation booking modal
        │
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx
            ├── ProfilePage.jsx        ← client + lawyer profile forms
            ├── LawyersPage.jsx        ← listing + filters + booking
            ├── DocumentsPage.jsx      ← upload + AI analysis modal
            ├── ConsultationsPage.jsx  ← booking management
            ├── LegalResearchPage.jsx  ← RAG chat interface
            ├── OrganizationsPage.jsx  ← org list + create modal
            └── OrganizationDetailPage.jsx ← overview + members + API tab
```

---

## 4. ENVIRONMENT VARIABLES

```bash
# backend/.env

NODE_ENV=development
PORT=5001

DATABASE_URL="postgresql://nyayai_user:nyayai_password@localhost:5433/nyayai_db"

JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

LOG_LEVEL=debug

PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=nyayai-legal
PINECONE_HOST=https://nyayai-legal-xxxx.svc.pinecone.io

NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx
```

---

## 5. DATABASE SCHEMA (9 TABLES)

```
users               → all accounts (CLIENT, LAWYER, ORG_ADMIN, SUPER_ADMIN)
refresh_tokens      → JWT refresh token store with rotation
client_profiles     → B2C: name, phone, city, state, language preference
lawyer_profiles     → marketplace: bar number, specializations[], fee, rating
organizations       → B2B: name, type, plan, apiKey (unique, nyay_ prefix)
organization_members → org ↔ user join (OWNER, ADMIN, MEMBER, VIEWER)
consultations       → bookings: status, type, amount, rating, review
documents           → uploaded files: category, status, fileUrl
ai_analyses         → AI results linked to documents: type, result JSON
audit_logs          → full audit trail: userId, action, entity, metadata
```

Key schema decisions:
- All IDs are UUIDs
- `lawyer_profiles.specializations` and `languages` are `String[]` (Postgres arrays)
- `ai_analyses.result` is `Json` (stores `{ text: "..." }`)
- `organizations.apiKey` is `@unique` with `nyay_` prefix + 64 hex chars
- Soft deletes not implemented yet — hard deletes only

---

## 6. API REFERENCE (ALL ENDPOINTS)

### Auth
```
POST /api/v1/auth/register     → { email, password, role }
POST /api/v1/auth/login        → { email, password }
POST /api/v1/auth/refresh      → { refreshToken }
POST /api/v1/auth/logout       → { refreshToken } [auth]
GET  /api/v1/auth/me           → [auth]
```

### Users
```
GET  /api/v1/users/profile              → [auth]
PUT  /api/v1/users/profile              → [auth] { fullName, phone, city, state, preferredLanguage }
PUT  /api/v1/users/lawyer-profile       → [auth, LAWYER] { fullName, bio, fee, specializations... }
```

### Lawyers
```
GET  /api/v1/lawyers                    → ?city&state&specialization&language&minFee&maxFee&page&limit
GET  /api/v1/lawyers/:id
```

### Documents
```
GET  /api/v1/documents                  → [auth]
POST /api/v1/documents/upload           → [auth] multipart { file, title, category }
POST /api/v1/documents/:id/analyze      → [auth] { analysisType }
GET  /api/v1/documents/:id/analyses     → [auth]
DELETE /api/v1/documents/:id            → [auth]
```

### Consultations
```
GET  /api/v1/consultations              → [auth]
POST /api/v1/consultations              → [auth, CLIENT] { lawyerId, type, scheduledAt, notes }
PATCH /api/v1/consultations/:id/status  → [auth] { status }
POST /api/v1/consultations/:id/review   → [auth, CLIENT] { rating, review }
```

### Legal Research (RAG)
```
POST /api/v1/legal/search               → [auth] { query, topK }
POST /api/v1/legal/ask                  → [auth] { question }
```

### Organizations
```
GET  /api/v1/organizations/mine         → [auth]
POST /api/v1/organizations              → [auth] { name, type, email, phone, city, state, gstin }
GET  /api/v1/organizations/:id          → [auth, member only]
PUT  /api/v1/organizations/:id          → [auth, OWNER/ADMIN]
POST /api/v1/organizations/:id/regenerate-key → [auth, OWNER only]
```

### Health
```
GET  /health                            → no auth, returns DB status + uptime
GET  /api/v1                            → no auth, API info
```

---

## 7. AUTHENTICATION SYSTEM

**Dual auth mode** — `authenticate` middleware handles both:

1. **JWT tokens** (frontend users) — `Authorization: Bearer eyJ...`
2. **API keys** (B2B programmatic access) — `Authorization: Bearer nyay_xxxx`

API key flow:
- Looks up org by `apiKey` in DB
- Attaches `req.user = { id: ownerUserId, organizationId, orgPlan, isApiKeyAuth: true }`
- Works from any system/terminal globally (when server is publicly accessible)

Currently server is local only — needs deployment for external access.

**Refresh token rotation:** On every refresh, old token deleted and new one issued. Tokens expire in 30 days.

---

## 8. AI PIPELINE

### Legal Research (RAG)
```
User question
    ↓ sanitizeQuestion() — prompt injection prevention
    ↓ Pinecone searchRecords() — semantic search, namespace: __default__
    ↓ Top 5 sections retrieved (act, section, title, originalText)
    ↓ Build context string
    ↓ NVIDIA Llama 3.3 70b — generateLegalAnswer()
    ↓ Return { question, answer, sources[] }
```

### Document Analysis
```
Upload PDF/image
    ↓ Magic byte validation (fileValidator.js)
    ↓ pdf-parse v1.1.1 — text extraction
    ↓ sanitizeForPrompt() — injection prevention
    ↓ NVIDIA Llama 3.3 70b — analyzeDocument()
    ↓ Save to ai_analyses table
    ↓ Update document status → ANALYZED
```

Analysis types: `DOCUMENT_SUMMARY`, `RISK_ASSESSMENT`, `CLAUSE_EXTRACTION`, `COMPLIANCE_CHECK`

### Pinecone Index
- Index name: `nyayai-legal`
- Model: `llama-text-embed-v2` (NVIDIA hosted, integrated embeddings)
- Dimensions: 1024
- Namespace: `__default__`
- 23 sections ingested: IPC (8), CrPC (6), Contract Act (5), Consumer Protection (2), RTI (2)

---

## 9. SECURITY MEASURES IMPLEMENTED

| Measure | Status | Location |
|---------|--------|----------|
| bcrypt password hashing (rounds: 12) | ✅ | authController.js |
| JWT with refresh token rotation | ✅ | authController.js, authenticate.js |
| Helmet.js security headers | ✅ | app.js |
| Rate limiting (100 req/15min) | ✅ | app.js |
| CORS (not wildcard) | ✅ | app.js |
| Input validation (express-validator) | ✅ | all routes |
| Prompt injection sanitization | ✅ | sanitize.js |
| Magic byte file validation | ✅ | fileValidator.js |
| Filename sanitization | ✅ | upload.js, fileValidator.js |
| Document ownership check before analysis | ✅ | analysisController.js |
| API key hidden from non-owners | ✅ | organizationController.js |
| Sensitive data not logged | ✅ | legalController.js, analysisController.js |
| Audit log table | ✅ | schema + controllers |
| Prisma ORM (no SQL injection) | ✅ | all queries |

### Security items NOT yet implemented (planned Week 7-8)
- [ ] Multi-tenancy org-level data isolation on document/consultation queries
- [ ] API key hashing (currently plain text in DB)
- [ ] httpOnly cookies for tokens (currently localStorage)
- [ ] CSRF protection
- [ ] Brute force lockout on login (account-level, not just rate limit)
- [ ] MFA for lawyer/admin accounts
- [ ] S3 file storage (currently local disk — security risk)
- [ ] Log scrubbing (PII in Winston logs)
- [ ] DPDP Act compliance (data deletion endpoint)
- [ ] npm audit fixes

---

## 10. FRONTEND CURRENT STATE

### Design System (CURRENT — to be replaced)
```css
/* tailwind.config.js custom colors */
saffron: { 500: '#FF6B00', 600: '#E05E00' }
navy:    { 800: '#0D1B3E', 900: '#071028' }
gold:    { 400: '#F5C842', 500: '#E6B800' }

/* Fonts */
heading: Playfair Display, serif
body:    DM Sans, sans-serif

/* Custom Tailwind components in index.css */
.btn-primary   → saffron bg
.btn-secondary → gold border
.card          → navy-800 bg, white/10 border
.input         → navy-900 bg, white/20 border
```

### Design System (NEW — to be implemented)
A Claude Design handoff bundle exists at the project root (`NyayAI-handoff.zip`). This is the target design. Key differences:

```css
/* New design tokens */
--bg: #0a0a0a           /* near-black */
--bg-2: #111110
--bg-3: #171715
--ink: #f5f1e8          /* warm off-white */
--ink-2: #d8d2c2
--ink-3: #8a8478
--gold: #c9a96b         /* warmer, dimmer gold */
--rule: #26231d         /* subtle borders */

/* New fonts */
--serif: "Instrument Serif", "Cormorant Garamond"
--sans: "Inter"
--mono: "JetBrains Mono"
--deva: "Noto Serif Devanagari"  /* Hindi support */
```

The handoff bundle contains:
- `project/styles.css` — 1,287 line design system
- `project/src/home.jsx` — interactive chat demo with streaming UI
- `project/src/pricing.jsx` — 3-tier pricing (Advocate ₹4,900, Chambers ₹3,900/seat, Institution custom)
- `project/src/features.jsx` — features page
- `project/src/about.jsx` — about page
- `project/src/shared.jsx` — Nav, Footer, Language ribbon (12 Indian languages)
- `project/components/layout.jsx` — page layout wrapper

**Implementation priority for design:**
1. Global CSS variables and fonts (replace tailwind theme)
2. Nav + Footer (shared.jsx → Layout component)
3. HomePage (most complex — has interactive chat demo)
4. Auth pages (Login, Register)
5. Dashboard
6. All inner pages (Profile, Lawyers, Documents, Consultations, Legal Research, Organizations)

---

## 11. DEMO CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nyayai.in | Admin@123 |
| Client | client@nyayai.in | Client@123 |
| Lawyer | lawyer@nyayai.in | Lawyer@123 |

Demo org API key: regenerate from Organizations page (previous key was shared publicly).

---

## 12. WEEK-BY-WEEK PROGRESS

| Week | Feature | Status |
|------|---------|--------|
| 1 | Foundation — PostgreSQL, Express, JWT auth, React + Vite | ✅ Done |
| 2 | User profiles, document upload (drag+drop), lawyer listing + filters | ✅ Done |
| 3 | Consultation booking, status management, review + rating system | ✅ Done |
| 4 | Pinecone RAG pipeline, 23 legal sections ingested, legal research page | ✅ Done |
| 5 | AI document analysis (4 types), prompt injection security, magic byte validation | ✅ Done |
| 6 | B2B organizations, API key auth, org detail page (Overview/Members/API tabs) | ✅ In Progress |
| 6 remaining | Member invitations, org-scoped data isolation | 🔜 |
| 7 | PhonePe payments (pending business registration), AWS deployment, ngrok for demos | 🔜 |
| 8 | Security hardening Phase 1 (S3, httpOnly cookies, brute force, API key hashing) | 🔜 |
| 9 | DPDP compliance, DPA template, privacy policy, penetration test | 🔜 |

---

## 13. WEEK 6 — REMAINING TASKS

### Task 3: Member Invitations (NOT YET BUILT)
- `POST /api/v1/organizations/:id/invite` — invite user by email
- `POST /api/v1/organizations/:id/members/:memberId/role` — change role
- `DELETE /api/v1/organizations/:id/members/:memberId` — remove member
- Frontend: invite form in Members tab, role change dropdown, remove button

### Task 4: Org-Scoped Data Isolation (CRITICAL SECURITY — NOT YET BUILT)
Every document and consultation query must be scoped to the org when accessed via API key. Currently org members can only see their own personal data — org-wide visibility for admins is not implemented.

```js
// Example: when req.user.isApiKeyAuth === true,
// documents query should include organizationId filter
const where = req.user.isApiKeyAuth
  ? { organizationId: req.user.organizationId }
  : { userId: req.user.id };
```

---

## 14. KNOWN ISSUES & DECISIONS

| Issue | Decision |
|-------|----------|
| macOS port 5000 blocked by AirPlay | Using port 5001 |
| PostgreSQL port 5432 conflict | Docker uses port 5433 |
| pdf-parse v2 crashes on Node 21 | Pinned to v1.1.1 |
| file-type v16 different export | `FileType.fromBuffer` pattern |
| Anthropic API credits needed | Switched to NVIDIA API (free tier) |
| Pinecone namespace empty string | Must use `__default__` namespace |
| Phone validation too strict | Using `isString()` only for now |
| GSTIN not validated | Accepting any string for MVP |

---

## 15. HOW TO RUN LOCALLY

```bash
# Terminal 1 — Start DB
cd /Users/keshav/Developer/NyayAI
docker-compose up -d postgres

# Terminal 2 — Backend
cd backend
npm run dev
# → http://localhost:5001/health

# Terminal 3 — Frontend
cd frontend
npm run dev
# → http://localhost:5173

# One-time setup (first run only)
cd backend
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
node prisma/ingest-legal-data.js   # loads 23 legal sections into Pinecone
```

---

## 16. WHAT CLAUDE CODE SHOULD DO NEXT

### Priority 1 — Design Implementation
Read the handoff bundle (`NyayAI-handoff.zip`) fully before starting. Implement the new design system across all frontend pages. The backend does not change. Match the visual output of the handoff files pixel-perfectly.

Implementation order:
1. Replace `frontend/src/index.css` with new CSS variables from `project/styles.css`
2. Update `frontend/tailwind.config.js` to match new design tokens
3. Create shared Layout component (Nav + Footer from `project/src/shared.jsx`)
4. Rebuild `HomePage.jsx` with interactive chat demo
5. Update all inner pages one by one

### Priority 2 — Week 6 Remaining
- Member invitation system (Task 3)
- Org-scoped data isolation (Task 4 — security critical)

### Priority 3 — Week 7
- ngrok setup for external API demos
- AWS EC2 deployment (backend) + S3 (file storage)
- PhonePe integration (pending business registration)

### Priority 4 — Security Hardening
Refer to Section 9 for the full list of unimplemented security measures. Do Phase 1 items before onboarding paying customers.

---

## 17. COMPETITIVE CONTEXT

**Jurisphere** — main competitor, targets top ~500 law firms, large corpus, fine-tuned LLMs, corporate/tier-1 focus.

**NyayAI positioning** — mass market, tier-2/3 cities, district courts, citizen-facing B2C layer (no competitor has this), marketplace + AI research + document analysis in one platform.

**Key differentiators to protect:**
- BNS/BNSS (new criminal codes effective July 1 2024) ingestion — not yet done, time-sensitive window
- Per-lawyer private intelligence (uploaded judgments, clause libraries) — schema ready, not built
- Citizen B2C layer — homepage chat demo is the hook

---

*Built for Bharat 🇮🇳 — Making Indian law accessible to every citizen.*