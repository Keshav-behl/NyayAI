# NyayAI — AI-Powered Indian Legal Platform

> Justice, powered by intelligence 🇮🇳

## Quick Start

### 1. Start PostgreSQL (Docker)
```bash
docker-compose up -d postgres
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
npm run dev
```
Backend: http://localhost:5000  |  Health: http://localhost:5000/health

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Demo Credentials (after seeding)

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@nyayai.in    | Admin@123  |
| Client | client@nyayai.in   | Client@123 |
| Lawyer | lawyer@nyayai.in   | Lawyer@123 |

## Week Roadmap

| Week | Focus |
|------|-------|
| 1 ✅ | Foundation — DB, Express, Auth, React |
| 2    | Profiles, document upload, lawyer listing |
| 3    | Bookings, Razorpay, notifications |
| 4    | Pinecone vector DB + RAG pipeline |
| 5    | Claude API — AI document analysis |
| 6    | B2B multi-tenant, org API keys |
| 7    | Testing, perf, AWS deployment |