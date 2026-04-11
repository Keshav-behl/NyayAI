
```markdown
# NyayAI — AI-Powered Indian Legal Platform

> Justice, powered by intelligence 🇮🇳

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL 16 (Docker) |
| Frontend | React 18, Vite, TailwindCSS |
| Auth | JWT (access + refresh tokens) |
| Vector DB | Pinecone (integrated embeddings) |
| Embeddings | llama-text-embed-v2 (NVIDIA hosted) |
| AI/LLM | Llama 3.3 70b (NVIDIA API) |
| File Upload | Multer (local storage) |
| Testing | Jest, Supertest |
| DevOps | Docker Compose (local) |

---

## Project Structure

```
nyayai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── ingest-legal-data.js
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── consultationController.js
│       │   ├── documentController.js
│       │   ├── lawyerController.js
│       │   ├── legalController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authenticate.js
│       │   ├── errorHandler.js
│       │   ├── notFound.js
│       │   ├── upload.js
│       │   └── validate.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── consultations.js
│       │   ├── documents.js
│       │   ├── health.js
│       │   ├── lawyers.js
│       │   ├── legal.js
│       │   └── users.js
│       └── utils/
│           ├── claude.js
│           ├── embeddings.js
│           ├── logger.js
│           ├── pinecone.js
│           └── prisma.js
├── frontend/
│   └── src/
│       ├── components/
│       │   └── BookingModal.jsx
│       ├── hooks/
│       │   └── useAuth.jsx
│       ├── pages/
│       │   ├── ConsultationsPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── DocumentsPage.jsx
│       │   ├── HomePage.jsx
│       │   ├── LegalResearchPage.jsx
│       │   ├── LawyersPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── RegisterPage.jsx
│       └── services/
│           └── api.js
└── docker-compose.yml
```

---

## Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up -d postgres
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env        # fill in your keys
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
node prisma/ingest-legal-data.js   # loads Indian law into Pinecone
npm run dev
```
Backend: `http://localhost:5001` | Health: `http://localhost:5001/health`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

---

## Environment Variables

```
# Server
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL="postgresql://nyayai_user:nyayai_password@localhost:5433/nyayai_db"

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Frontend
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Pinecone
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=nyayai-legal
PINECONE_HOST=https://nyayai-legal-xxxx.svc.pinecone.io

# NVIDIA (LLM + Embeddings)
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxx
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nyayai.in | Admin@123 |
| Client | client@nyayai.in | Client@123 |
| Lawyer | lawyer@nyayai.in | Lawyer@123 |

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /health | No | Health check |
| POST | /api/v1/auth/register | No | Register user |
| POST | /api/v1/auth/login | No | Login |
| POST | /api/v1/auth/refresh | No | Refresh token |
| POST | /api/v1/auth/logout | Yes | Logout |
| GET | /api/v1/auth/me | Yes | Current user |
| GET | /api/v1/users/profile | Yes | Get profile |
| PUT | /api/v1/users/profile | Yes | Update profile |
| PUT | /api/v1/users/lawyer-profile | Yes (Lawyer) | Update lawyer profile |
| GET | /api/v1/lawyers | No | List lawyers |
| GET | /api/v1/lawyers/:id | No | Get lawyer |
| GET | /api/v1/documents | Yes | List documents |
| POST | /api/v1/documents/upload | Yes | Upload document |
| DELETE | /api/v1/documents/:id | Yes | Delete document |
| GET | /api/v1/consultations | Yes | List consultations |
| POST | /api/v1/consultations | Yes (Client) | Book consultation |
| PATCH | /api/v1/consultations/:id/status | Yes | Update status |
| POST | /api/v1/consultations/:id/review | Yes (Client) | Submit review |
| POST | /api/v1/legal/search | Yes | Semantic legal search |
| POST | /api/v1/legal/ask | Yes | AI legal answer (RAG) |

---

## Database Schema (9 Tables)

| Table | Purpose |
|-------|---------|
| users | All user accounts |
| refresh_tokens | JWT refresh token store |
| client_profiles | B2C client data |
| lawyer_profiles | Marketplace lawyer data |
| organizations | B2B org accounts |
| organization_members | Org ↔ User join table |
| consultations | Booking & session records |
| documents | Uploaded legal documents |
| ai_analyses | AI processing results |
| audit_logs | Full audit trail |

---

## Legal Data (Pinecone)

23 sections ingested across 5 acts:

| Act | Sections |
|-----|---------|
| IPC | 302, 307, 354, 376, 406, 420, 498A, 120B |
| CrPC | 41, 154, 161, 167, 438, 482 |
| Contract Act | 10, 14, 19, 73, 74 |
| Consumer Protection Act | 2(7), 35 |
| RTI Act | 3, 7 |

---

## Features Built

| Feature | Status |
|---------|--------|
| JWT Auth (register, login, refresh, logout) | ✅ |
| User profiles (client + lawyer) | ✅ |
| Lawyer listing with filters | ✅ |
| Document upload (PDF, images) | ✅ |
| Consultation booking | ✅ |
| Consultation status management | ✅ |
| Review & rating system | ✅ |
| Semantic legal search (Pinecone RAG) | ✅ |
| AI legal answers (Llama 3.3 70b) | ✅ |
| AI document analysis | 🔜 Week 5 |
| B2B multi-tenant | 🔜 Week 6 |
| PhonePe payments | 🔜 Week 7 |
| AWS deployment | 🔜 Week 7 |

---

## Week Roadmap

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundation — DB, Express, Auth, React | ✅ |
| 2 | Profiles, document upload, lawyer listing | ✅ |
| 3 | Consultation booking, status, reviews | ✅ |
| 4 | Pinecone RAG + NVIDIA Llama legal research | ✅ |
| 5 | AI document analysis | 🔜 |
| 6 | B2B multi-tenant, org API keys | 🔜 |
| 7 | PhonePe payments + AWS deployment | 🔜 |

---

## Running Tests

```bash
cd backend && npm test
```

---

## Architecture

```
User → React Frontend (Vite)
         ↓ Axios + JWT
       Express API (Node.js)
         ↓ Prisma ORM
       PostgreSQL (Docker)

Legal Research Flow:
User Question → Pinecone Semantic Search
                (llama-text-embed-v2)
                ↓ Top 5 relevant sections
              NVIDIA Llama 3.3 70b
                ↓ RAG answer
              User gets cited legal answer

Document Analysis Flow (Week 5):
Uploaded PDF → Text extraction
               ↓
             NVIDIA Llama 3.3 70b
               ↓ Analysis
             Structured report
```

---

Built for Bharat 🇮🇳 — Making Indian law accessible to every citizen.
```

Copy-paste this into your `README.md` and push. Ready for Week 5 whenever you are!