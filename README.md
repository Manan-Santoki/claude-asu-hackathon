# CitizenOS — AI-Powered Civic Engagement Platform

> **Hackathon Project** — HackASU | March 20–22, 2026
> **Track:** Governance & Collaboration

## What is CitizenOS?

CitizenOS is an AI-powered civic engagement platform that makes democracy accessible, transparent, and personalized. Three interconnected modules:

1. **BillBreaker** — AI legislation tracker. Explains bills in plain English, shows personalized impact based on your profile (student, veteran, visa holder, small business owner, etc.)
2. **RepScore** — Representative accountability dashboard. Compares campaign promises against actual voting records, generates a "Promise Alignment Score"
3. **VoteMap** — Candidate matching engine. Maps candidates on policy axes, shows alignment with your priorities, includes reputation analysis

## Core Innovation

**Profile-first personalization.** During onboarding, users build a civic profile (age, occupation, visa status, interests, zip code). This profile is the "lens" through which every module filters data. A student on F-1 sees immigration bills flagged high-impact. A small business owner sees tax legislation highlighted. Same platform, different experience per user.

## Quick Start

```bash
git clone https://github.com/your-repo/citizenos.git && cd citizenos
bun install
cp .env.example .env    # Fill in API keys (see docs/ENV_SETUP.md)
docker compose up -d    # Start PG + Redis + MinIO
bunx prisma migrate dev
bunx prisma db seed
bun dev
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flows, module interactions |
| [MODULES.md](docs/MODULES.md) | Detailed spec per module (BillBreaker, RepScore, VoteMap) |
| [API_REFERENCE.md](docs/API_REFERENCE.md) | All external APIs — endpoints, auth, rate limits, formats |
| [TECH_STACK.md](docs/TECH_STACK.md) | Complete technology stack with justifications |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | PostgreSQL + pgvector schema, tables, relationships |
| [BUILD_PLAN.md](docs/BUILD_PLAN.md) | Step-by-step hackathon build plan with time estimates |
| [ENV_SETUP.md](docs/ENV_SETUP.md) | Environment variables, API key registration, infra setup |
| [CHECKLIST.md](docs/CHECKLIST.md) | Complete task checklist |
| [CLAUDE_CODE_INSTRUCTIONS.md](docs/CLAUDE_CODE_INSTRUCTIONS.md) | Instructions for AI agents to build this project |

## Tech Stack

- **Runtime:** Bun
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui, D3.js, Recharts
- **Backend:** Next.js API Routes + Server Actions, Prisma ORM
- **Database:** Self-hosted PostgreSQL 16 + pgvector extension
- **Cache:** Self-hosted Redis
- **Object Storage:** Self-hosted MinIO (S3-compatible)
- **AI:** OpenRouter (multi-model LLM), self-hosted embedding models, self-hosted OCR
- **Data Sources:** Congress.gov API, LegiScan API, Open States v3, FEC.gov API
- **Scraping:** FireCrawl, Crawl4AI, SerpAPI, Puppeteer
- **Auth:** NextAuth.js v5 (credentials + OAuth)
- **Deployment:** Hetzner VPS + Dokploy

## Project Structure

```
citizenos/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth group (login, register, onboarding)
│   │   ├── dashboard/page.tsx      # Main overview dashboard
│   │   ├── billbreaker/            # BillBreaker module
│   │   │   ├── page.tsx            # Bills dashboard
│   │   │   └── [billId]/page.tsx   # Bill detail + RAG chat
│   │   ├── repscore/               # RepScore module
│   │   │   ├── page.tsx            # My reps dashboard
│   │   │   └── [repId]/page.tsx    # Rep detail + promise timeline
│   │   ├── votemap/                # VoteMap module
│   │   │   ├── page.tsx            # Political compass + candidates
│   │   │   └── quiz/page.tsx       # Policy alignment quiz
│   │   ├── settings/page.tsx
│   │   └── api/                    # API Routes
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── billbreaker/            # BillBreaker components
│   │   ├── repscore/               # RepScore components
│   │   ├── votemap/                # VoteMap components
│   │   ├── onboarding/             # Onboarding wizard
│   │   └── shared/                 # Layout, nav, shared cards
│   ├── lib/
│   │   ├── api/                    # External API clients
│   │   ├── scraping/               # FireCrawl, SerpAPI, Puppeteer
│   │   ├── ai/                     # AI pipelines (summarize, impact, promises, matching)
│   │   ├── db/prisma.ts            # Prisma singleton
│   │   ├── redis.ts                # Redis client
│   │   └── minio.ts                # MinIO S3 client
│   ├── hooks/                      # Custom React hooks
│   └── types/                      # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml              # PG + Redis + MinIO for dev
├── Dockerfile
├── .env.example
├── package.json
└── next.config.ts
```

## License

MIT
