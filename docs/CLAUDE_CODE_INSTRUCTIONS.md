# CitizenOS — Claude Code Build Instructions

> This document is the primary reference for AI agents (Claude Code, Cursor, Copilot) building CitizenOS. Read ALL documents in the `docs/` folder before starting any work.

## Context

CitizenOS is a hackathon project for HackASU (March 20–22, 2026). It is an AI-powered civic engagement platform with three modules: BillBreaker (legislation tracker), RepScore (representative accountability), and VoteMap (candidate matching). The user profile created during onboarding is the connective tissue — it personalizes all three modules.

## Critical Rules

1. **Use Bun, not npm or yarn.** All commands use `bun` or `bunx`. The project was initialized with `bunx create-next-app@latest`.
2. **Next.js 15 App Router only.** No Pages Router. Use Server Components by default. Use `"use client"` only when needed (interactivity, hooks, browser APIs).
3. **Prisma for all DB access.** Exception: pgvector operations use `prisma.$queryRaw` and `prisma.$executeRaw` because Prisma doesn't natively support the `vector` type.
4. **shadcn/ui for UI components.** Don't reinvent buttons, cards, forms, etc. Install what you need via `bunx --bun shadcn@latest add <component>`.
5. **Tailwind CSS v4 for styling.** No CSS modules, no styled-components. Use the shadcn/ui `cn()` utility for conditional classes.
6. **TypeScript strict mode.** All files are `.ts` or `.tsx`. No `any` types except when absolutely unavoidable (e.g., Prisma raw SQL results).
7. **Server Actions for mutations.** Use Next.js Server Actions (with `"use server"`) for form submissions, profile updates, triggering scrapes, etc. Use API Routes (`route.ts`) for data fetching that the client needs to call.
8. **Redis for caching.** Cache all external API responses with appropriate TTLs. See ARCHITECTURE.md for caching strategy.
9. **Self-hosted services have their own URLs.** Embedding model, OCR, etc. are separate services with REST APIs. Call them via `fetch()` using environment variables for their URLs.
10. **Never hardcode API keys.** All keys come from `process.env`. Reference `.env.example` for the full list.

## Step-by-Step Build Order

Follow this exact order. Each step builds on the previous one.

### Step 1: Project Initialization

```bash
bunx create-next-app@latest citizenos --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd citizenos
```

Then install all dependencies in one go:

```bash
# Production deps
bun add next-auth@beta @auth/prisma-adapter
bun add @prisma/client
bun add ioredis
bun add @aws-sdk/client-s3
bun add openai
bun add puppeteer
bun add d3 @types/d3
bun add recharts
bun add react-hook-form @hookform/resolvers zod
bun add lucide-react
bun add date-fns
bun add clsx tailwind-merge
bun add bcryptjs @types/bcryptjs

# Dev deps
bun add -d prisma
```

Init shadcn:
```bash
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add button card input label tabs badge dialog sheet separator avatar progress slider select checkbox radio-group form toast sonner table dropdown-menu tooltip popover command scroll-area skeleton
```

### Step 2: Docker Compose + Database

Create `docker-compose.yml` at project root (see ENV_SETUP.md for the full file).

```bash
docker compose up -d
```

Create `prisma/schema.prisma` with the FULL schema from DATABASE_SCHEMA.md. Then:

```bash
bunx prisma generate
bunx prisma migrate dev --name init
```

Then apply the pgvector migration manually:
```bash
# Connect to PG and run:
docker exec -it citizenos-db psql -U citizenos -d citizenos
```
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "BillChunk" ADD COLUMN IF NOT EXISTS embedding vector(768);
CREATE INDEX IF NOT EXISTS bill_chunk_embedding_idx ON "BillChunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
ALTER TABLE "CandidatePosition" ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE "QuizAnswer" ADD COLUMN IF NOT EXISTS embedding vector(768);
```

### Step 3: Core Utilities

Create these files first — everything else depends on them:

**`src/lib/db/prisma.ts`**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**`src/lib/redis.ts`**
```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default redis;

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached) as T;
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}
```

**`src/lib/minio.ts`**
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadToMinio(bucket: string, key: string, body: string | Buffer) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body }));
  return key;
}

export async function downloadFromMinio(bucket: string, key: string): Promise<string> {
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return await response.Body!.transformToString();
}
```

**`src/lib/api/openrouter.ts`**
```typescript
import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
    "X-Title": "CitizenOS",
  },
});

export async function llmComplete(
  systemPrompt: string,
  userPrompt: string,
  model: string = "anthropic/claude-sonnet-4",
  temperature: number = 0.3
): Promise<string> {
  const response = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: 4000,
  });
  return response.choices[0]?.message?.content || "";
}

export async function llmJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: string = "anthropic/claude-sonnet-4"
): Promise<T> {
  const response = await llmComplete(
    systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no backticks, no explanation.",
    userPrompt,
    model,
    0.2
  );
  return JSON.parse(response.trim().replace(/```json\n?|```/g, "")) as T;
}
```

### Step 4: Auth Setup

Reference: NextAuth v5 beta docs. Create:

- `src/lib/auth.ts` — NextAuth config with Prisma adapter + credentials provider
- `src/app/api/auth/[...nextauth]/route.ts` — API route handler
- `src/middleware.ts` — protect all routes except `/`, `/login`, `/register`, `/api/auth`
- `src/app/(auth)/login/page.tsx` — login form
- `src/app/(auth)/register/page.tsx` — register form (hash password with bcryptjs)

### Step 5: App Shell + Layout

Create the main layout with sidebar navigation:

- `src/app/layout.tsx` — root layout, wrap with SessionProvider
- `src/components/shared/AppShell.tsx` — sidebar + main content area
- `src/components/shared/Sidebar.tsx` — nav links with icons (Lucide)
- `src/components/shared/TopNav.tsx` — user avatar, logout

Sidebar links:
1. Dashboard (LayoutDashboard icon)
2. BillBreaker (FileText icon)
3. RepScore (Users icon)
4. VoteMap (Map icon)
5. Settings (Settings icon)

### Step 6: Onboarding

Create `/onboarding` page with multi-step wizard:

- Use React state to track current step (1-4)
- Each step is a separate component in `src/components/onboarding/`
- Final submit: Server Action that saves to `user_profiles`
- After completion: redirect to `/dashboard`
- Add onboarding guard: if user has no profile, redirect to `/onboarding`

### Step 7: BillBreaker Module

Build in this order:
1. API clients (`src/lib/api/congress.ts`, `src/lib/api/legiscan.ts`)
2. Bill sync API route (`POST /api/bills/sync`)
3. AI summarization pipeline (`src/lib/ai/summarize.ts`)
4. Impact analysis pipeline (`src/lib/ai/impact.ts`)
5. Embedding generation (`src/lib/ai/embeddings.ts`)
6. Bill list API route (`GET /api/bills`)
7. Dashboard UI (`/billbreaker/page.tsx`)
8. Bill detail page + RAG chat (`/billbreaker/[billId]/page.tsx`)

See MODULES.md for detailed specs, including exact AI prompts.

### Step 8: RepScore Module

Build in this order:
1. API clients (`src/lib/api/openstates.ts`, update `src/lib/api/fec.ts`)
2. Scraping utilities (`src/lib/scraping/firecrawl.ts`, `src/lib/scraping/serpapi.ts`)
3. Rep lookup API route (`GET /api/reps`)
4. Promise scraping route (`POST /api/reps/[repId]/scrape`)
5. Promise extraction AI (`src/lib/ai/promises.ts`)
6. Scoring engine
7. Dashboard UI (`/repscore/page.tsx`)
8. Rep detail page (`/repscore/[repId]/page.tsx`)

### Step 9: VoteMap Module

Build in this order:
1. Candidate scraping pipeline
2. Position extraction AI
3. Reputation analysis AI
4. Quiz page (`/votemap/quiz/page.tsx`)
5. Matching engine (`src/lib/ai/matching.ts`)
6. Political compass D3.js component
7. VoteMap dashboard (`/votemap/page.tsx`)
8. Candidate detail page

### Step 10: Dashboard + Polish

1. Main dashboard with 3 module summary cards
2. Seed data for demo
3. Loading states, error states, empty states
4. End-to-end test

## File Naming Conventions

- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- API Routes: `route.ts`
- Components: PascalCase (`BillCard.tsx`)
- Utilities: camelCase (`congress.ts`)
- Types: camelCase (`bill.ts`)
- Server Actions: inside components or in separate `actions.ts` files

## Component Patterns

### Server Component (default)
```typescript
// src/app/billbreaker/page.tsx
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import BillCard from "@/components/billbreaker/BillCard";

export default async function BillBreakerPage() {
  const session = await auth();
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session!.user!.id }
  });
  const bills = await prisma.bill.findMany({
    include: { impacts: true },
    orderBy: { introducedDate: "desc" },
    take: 20,
  });
  return (
    <div>
      <h1>BillBreaker</h1>
      {bills.map(bill => <BillCard key={bill.id} bill={bill} profile={profile} />)}
    </div>
  );
}
```

### Client Component (when needed)
```typescript
// src/components/billbreaker/BillChat.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BillChat({ billId }: { billId: string }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    // Call API route for RAG chat
    const res = await fetch(`/api/bills/${billId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: data.answer }]);
    setInput("");
  }

  return (
    <div>
      {messages.map((m, i) => <div key={i}>{m.role}: {m.content}</div>)}
      <Input value={input} onChange={e => setInput(e.target.value)} />
      <Button onClick={handleSend}>Ask</Button>
    </div>
  );
}
```

### API Route
```typescript
// src/app/api/bills/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const bills = await prisma.bill.findMany({
    where: severity ? { impacts: { some: { severity } } } : undefined,
    include: { impacts: true, sponsors: true },
    orderBy: { introducedDate: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ bills, page, limit });
}
```

## Important Reference Files

Before implementing any module, read these documents:
- **MODULES.md** — Exact page specs, component lists, API endpoints, AI prompts
- **API_REFERENCE.md** — External API endpoints, auth methods, rate limits, example responses
- **DATABASE_SCHEMA.md** — Full Prisma schema, pgvector setup, key queries
- **TECH_STACK.md** — All packages with versions, install commands
- **ENV_SETUP.md** — All environment variables, Docker compose, verification steps
- **BUILD_PLAN.md** — Time-boxed build phases
- **CHECKLIST.md** — Complete task list with priorities

## When In Doubt

1. For UI: use shadcn/ui components first, customize with Tailwind
2. For data fetching: Server Components + Prisma for pages, API Routes for client-side fetches
3. For AI: OpenRouter with the prompts from MODULES.md, parse JSON responses
4. For caching: Redis with the TTL strategy from ARCHITECTURE.md
5. For scraping: FireCrawl first, Puppeteer as fallback
6. For vectors: pgvector with raw SQL through Prisma `$queryRaw`
