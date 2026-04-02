# 🏛️ NyayAI - AI-Powered Legal Platform for India

**Complete Product Architecture & Build Plan**

---

## 📦 What's Included

This package contains everything you need to build NyayAI locally:

### 1. **NyayAI_Complete_Architecture.pdf** (20 pages)
Comprehensive document covering:
- Product architecture (B2B, B2C, Marketplace)
- System design & APIs
- AI design with RAG pipeline
- Database schema (all 8 tables)
- Security & privacy framework
- Lawyer marketplace design
- Week 1-7 build roadmap
- Success metrics & differentiation strategy
- **APPENDIX: Detailed Week 1 Tasks**

**Use this for:** Understanding the full system, architecture decisions, security models, and long-term roadmap.

---

### 2. **WEEK1_QUICK_START.md** (Reference Guide)
Step-by-step instructions for Week 1 setup:
- Prerequisites check
- Backend initialization
- Database setup (PostgreSQL)
- Express server creation
- React frontend creation
- Git configuration
- Troubleshooting guide

**Use this for:** Building everything from scratch on your local machine.

---

### 3. **WEEK1_TASK_REFERENCE.md** (One-Page Cheat Sheet)
Quick reference for all 7 Week 1 tasks:
- Exact bash commands for each task
- Time estimates
- Completion checklist
- Success criteria
- Quick fix commands

**Use this for:** Fast reference while coding, print and stick to your monitor.

---

### 4. **WEEK1_PROGRESS_TRACKER.txt** (Printable Sheet)
Detailed progress tracker with:
- All 7 tasks with subtasks
- Time spent tracking
- Blocker notes
- Final verification checklist

**Use this for:** Tracking progress, identifying blockers, team accountability.

---

## 🚀 Quick Start (5 minutes)

### Read First
1. This README (2 mins)
2. WEEK1_TASK_REFERENCE.md (3 mins)

### Then Start Building
```bash
# Task 1: Backend Init
mkdir nyayai && cd nyayai
npm init -y
npm install express cors dotenv prisma @prisma/client jsonwebtoken bcrypt

# Task 2: Database
createdb nyayai
npx prisma init
# Copy schema from PDF APPENDIX → prisma/schema.prisma
npx prisma migrate dev --name initial_schema

# Task 3: Express Server
# Create src/server.ts with Express app + health endpoint
npm run dev

# Task 4: React Frontend
npm create vite@latest client -- --template react
cd client && npm install
npm run dev

# Done! Backend: http://localhost:3000 | Frontend: http://localhost:5173
```

---

## 📋 What to Build (Week 1)

### Your Goal This Week
Set up the **foundation** - get backend, database, and frontend running locally.

### 7 Tasks (10-12 hours total)

| # | Task | Time | Status |
|---|------|------|--------|
| 1 | Backend initialization | 2h | - |
| 2 | PostgreSQL database setup | 1.5h | - |
| 3 | Express server & routes | 1h | - |
| 4 | React frontend with Vite | 1.5h | - |
| 5 | Git & version control | 0.5h | - |
| 6 | Docker setup (optional) | 1h | - |
| 7 | Testing & documentation | 1h | - |

### Success Criteria
- ✅ Backend running: `curl http://localhost:3000/api/v1/health`
- ✅ Frontend loading: http://localhost:5173
- ✅ Database created with 8 tables
- ✅ Git repository initialized
- ✅ Tests passing
- ✅ Can clone and run in 2 minutes

---

## 🏗️ Architecture Overview

### Three Modules

```
┌─────────────────────────────────────────┐
│        B2B (Law Firms & Banks)          │
├─────────────────────────────────────────┤
│ • Contract review + risk analysis       │
│ • Legal argument generation             │
│ • Compliance automation                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      B2C (Individual Consumers)          │
├─────────────────────────────────────────┤
│ • AI legal assistant Q&A                │
│ • Document generation                   │
│ • Step-by-step guidance                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    Marketplace (Lawyer Matching)         │
├─────────────────────────────────────────┤
│ • Verified lawyer profiles              │
│ • Smart matching algorithm              │
│ • Consultation booking & ratings        │
└─────────────────────────────────────────┘
```

### Tech Stack
- **Frontend:** React (Vite) + TailwindCSS
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL (local)
- **Vector DB:** Pinecone (for legal knowledge, Week 4)
- **AI:** Claude API (Week 5+)
- **DevOps:** Docker, GitHub Actions

---

## 📚 Database (8 Core Tables)

After running migrations, you'll have:

1. **Users** - All users (consumers, lawyers, admins)
2. **Organizations** - B2B clients (law firms, banks)
3. **Documents** - Uploaded contracts, notices, agreements
4. **ContractAnalysis** - AI analysis results
5. **Feedback** - Lawyer feedback on AI suggestions
6. **Conversations** - B2C chat history
7. **Messages** - Individual chat messages
8. **LawyerProfile** - Verified lawyers in marketplace
9. **Consultations** - Booked lawyer consultations (bonus)

Full schema in PDF APPENDIX.

---

## 🔐 Security & Privacy

This week: Basic setup. Full security implementation in Week 8.

**Already included:**
- JWT authentication skeleton
- Encrypted passwords (bcrypt)
- .env file for secrets (gitignored)
- CORS configuration

**For later:**
- ACP protection (anonymization before AI)
- PII encryption at rest
- Audit logging
- Multi-tenancy isolation

---

## 📖 Documentation Structure

```
nyayai/
├── README.md                          (This file)
├── WEEK1_QUICK_START.md              (Step-by-step setup)
├── WEEK1_TASK_REFERENCE.md           (One-page cheat sheet)
├── WEEK1_PROGRESS_TRACKER.txt        (Printable tracker)
├── NyayAI_Complete_Architecture.pdf  (Full specs)
│
├── src/                               (Backend)
│   ├── server.ts                     (Express entry)
│   ├── middleware/                   (Auth, errors)
│   ├── routes/                       (API endpoints)
│   └── services/                     (Business logic)
│
├── client/                            (Frontend - React)
│   ├── src/
│   └── package.json
│
├── prisma/
│   ├── schema.prisma                 (Database definition)
│   └── migrations/                   (Migration history)
│
└── docker-compose.yml                (Optional: containerized)
```

---

## 🎯 By End of Week 1

You'll have:
✅ Fully functional local dev environment
✅ PostgreSQL database with schema
✅ Express backend with health endpoint
✅ React frontend connected to backend
✅ Git repository with clean history
✅ Documentation and tests
✅ Ready to start Week 2 (authentication)

**Time investment:** 10-12 hours (1-2 hours/day)

---

## 🆘 If You Get Stuck

### Check These First
1. **WEEK1_QUICK_START.md** - Detailed troubleshooting section
2. **WEEK1_TASK_REFERENCE.md** - Quick fix commands
3. **PostgreSQL not starting?** → `brew services start postgresql`
4. **Port 3000 taken?** → `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`
5. **Database won't migrate?** → `npx prisma migrate reset` (be careful, deletes data)

### Get Help
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- Try: `npm run dev` + `npm test`
- Read error message carefully (usually tells you what's wrong)

---

## 📊 Week-by-Week Roadmap

After Week 1, you'll build:

- **Week 2:** Authentication (JWT, signup, login, org management)
- **Week 3:** B2B document upload & extraction
- **Week 4:** Vector DB & legal knowledge base
- **Week 5:** AI contract analysis (Claude integration)
- **Week 6:** Feedback loop & fine-tuning
- **Week 7:** B2C chat bot

See PDF for full Week 2-7 details.

---

## 💡 Pro Tips

1. **Don't skip Docker:** Setup now, saves headaches later
2. **Commit often:** Small commits = easier debugging
3. **Use Prisma Studio:** `npx prisma studio` to visually explore DB
4. **Keep .env safe:** Never commit it (already in .gitignore)
5. **Test everything:** Write tests as you code
6. **Document as you go:** Future you will thank you
7. **Take breaks:** Coding fatigue = bugs

---

## ✅ Final Checklist Before Week 2

```
BACKEND:
  □ npm run dev works
  □ GET /health returns 200 OK
  □ PostgreSQL running
  □ Database: nyayai exists
  □ Prisma schema applied
  □ No errors on startup

FRONTEND:
  □ npm run dev works
  □ React app loads (localhost:5173)
  □ Can call backend API
  □ No CORS errors

DEVOPS:
  □ Git repo initialized
  □ .gitignore configured
  □ Initial commit made
  □ Docker compose working (optional)

DOCUMENTATION:
  □ README.md complete
  □ API_DOCS.md listing endpoints
  □ ARCHITECTURE.md overview
  □ Code is clean & commented

TESTING:
  □ npm test passes
  □ No console errors
  □ Health endpoint tested
```

---

## 🎓 Learning Resources

- **Node.js:** https://nodejs.org/docs/
- **Express:** https://expressjs.com/
- **Prisma:** https://www.prisma.io/docs/
- **React:** https://react.dev/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **Docker:** https://docs.docker.com/

---

## 🚀 Ready to Start?

1. ✅ Read WEEK1_QUICK_START.md (10 mins)
2. ✅ Follow Task 1 step-by-step
3. ✅ Complete all 7 tasks
4. ✅ Check off progress tracker
5. ✅ Celebrate completion! 🎉

**Estimated time: Friday of Week 1**

---

## Questions Before Starting?

- Check WEEK1_QUICK_START.md (Troubleshooting section)
- Check PDF APPENDIX (Full Week 1 details)
- Read error messages carefully
- Google error messages + "Node.js" or "PostgreSQL"

---

## Next: Week 2

Once Week 1 is done, you'll build:
- User authentication (signup, login, logout)
- JWT tokens + refresh mechanism
- Organization management
- User roles & permissions
- Lawyer registration & verification

See PDF Section 10 for Week 2 details.

---

**Good luck! You've got this! 🚀**

*NyayAI - Making legal tech accessible to India*