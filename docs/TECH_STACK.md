# CitizenOS — Technology Stack

## Runtime & Package Manager

| Tool | Version | Why |
|------|---------|-----|
| **Bun** | latest | Fast JS runtime + package manager + bundler. Replaces Node.js + npm. |

### Project Init
```bash
bunx create-next-app@latest citizenos --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd citizenos
```

---

## Frontend

| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 15 (latest) | App Router, Server Components, Server Actions, API Routes |
| **React** | 19 | UI rendering |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui** | latest | Pre-built accessible components (cards, buttons, tabs, dialogs, forms, sliders) |
| **D3.js** | 7.x | Political compass scatter plot, custom visualizations |
| **Recharts** | 2.x | Voting pattern bar charts, line charts, pie charts |
| **Lucide React** | latest | Icons |
| **React Hook Form** | 7.x | Form handling (onboarding wizard, quiz) |
| **Zod** | 3.x | Schema validation (forms + API) |

### shadcn/ui Components to Install
```bash
bunx --bun shadcn@latest init
bunx --bun shadcn@latest add button card input label tabs badge dialog sheet separator avatar progress slider select checkbox radio-group form toast sonner
```

---

## Backend

| Tool | Purpose |
|------|---------|
| **Next.js API Routes** | REST endpoints under `/api/` |
| **Next.js Server Actions** | Mutations (profile update, trigger scrape, submit quiz) |
| **Prisma ORM** | Database access, migrations, type-safe queries |
| **NextAuth.js v5** | Authentication (credentials + Google/GitHub OAuth) |

### Auth Setup
```bash
bun add next-auth@beta @auth/prisma-adapter
```

NextAuth config supports:
- Credentials provider (email + password)
- Google OAuth (optional)
- GitHub OAuth (optional)
- Session strategy: JWT (simpler) or database sessions
- Prisma adapter for user storage

---

## Database

| Tool | Purpose |
|------|---------|
| **PostgreSQL 16** | Primary database (self-hosted on Hetzner) |
| **pgvector** | Vector similarity search for RAG + policy matching |
| **Prisma** | ORM, migrations, schema management |

### Docker Image
Use `pgvector/pgvector:pg16` which includes the pgvector extension pre-installed.

### Enable pgvector
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Prisma pgvector Support
Prisma doesn't natively support vector types. Use raw SQL for vector operations:
```typescript
// Store embedding
await prisma.$executeRaw`
  UPDATE bill_chunks SET embedding = ${embedding}::vector
  WHERE id = ${chunkId}
`;

// Similarity search
const results = await prisma.$queryRaw`
  SELECT id, content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM bill_chunks
  WHERE bill_id = ${billId}
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT 5
`;
```

---

## Caching & Queuing

| Tool | Purpose |
|------|---------|
| **Redis 7** | API response caching, rate limiting, job queuing |
| **ioredis** | Redis client for Node.js/Bun |

```bash
bun add ioredis
```

---

## Object Storage

| Tool | Purpose |
|------|---------|
| **MinIO** | S3-compatible storage for scraped content, bill PDFs, raw HTML |
| **@aws-sdk/client-s3** | S3 client (works with MinIO) |

```bash
bun add @aws-sdk/client-s3
```

### MinIO Buckets
- `bill-texts` — raw bill text files (HTML, PDF, XML)
- `scraped-content` — scraped campaign sites, news articles
- `embeddings-cache` — pre-computed embedding vectors (optional backup)

---

## AI & NLP

| Tool | Purpose |
|------|---------|
| **OpenRouter** | Multi-model LLM access (Claude, Gemini, etc.) |
| **Self-hosted embedding model** | Generate embeddings for RAG and policy matching |
| **Self-hosted OCR** | Extract text from bill PDFs |
| **LangChain.js** (optional) | Chain prompts, manage RAG pipeline |

### OpenRouter Client
```bash
# No special SDK needed — standard fetch to OpenAI-compatible API
# OR use the OpenAI SDK with custom base URL:
bun add openai
```

```typescript
import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://citizenos.example.com",
    "X-Title": "CitizenOS"
  }
});
```

### Embedding Model
Self-hosted embedding model exposed as an API endpoint. Use a lightweight model like `all-MiniLM-L6-v2` or `bge-base-en-v1.5`.

```typescript
// Call self-hosted embedding server
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.EMBEDDING_SERVER_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await response.json();
  return data.embedding; // float[] of dimension 384 or 768
}
```

---

## Scraping

| Tool | Purpose |
|------|---------|
| **FireCrawl** | Primary scraper for campaign sites. Can self-host on Hetzner. |
| **Crawl4AI** | Secondary AI-native crawler. Self-hosted Docker container. |
| **SerpAPI** | Google search results as JSON. Cloud API. |
| **Puppeteer** | Fallback for JS-heavy sites. |

```bash
bun add puppeteer
# FireCrawl and SerpAPI are REST APIs — no SDK needed, use fetch
# Crawl4AI is self-hosted — communicate via REST
```

---

## Dev Tools

| Tool | Purpose |
|------|---------|
| **TypeScript** | Type safety everywhere |
| **ESLint** | Linting |
| **Prettier** | Code formatting |
| **Prisma Studio** | Visual database browser (`bunx prisma studio`) |

---

## Deployment (Hetzner + Dokploy)

### Dockerfile
```dockerfile
FROM oven/bun:1 AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["bun", "server.js"]
```

### next.config.ts
```typescript
const nextConfig = {
  output: "standalone",  // Required for Docker
  experimental: {
    serverActions: { bodySizeLimit: "4mb" }
  }
};
export default nextConfig;
```

### Dokploy Deployment
1. Connect Git repository to Dokploy
2. Set build type: Dockerfile
3. Configure environment variables in Dokploy UI
4. Set up Traefik domain routing
5. Deploy

---

## Full Dependency List

### Production
```bash
bun add next react react-dom
bun add next-auth@beta @auth/prisma-adapter
bun add prisma @prisma/client
bun add ioredis
bun add @aws-sdk/client-s3
bun add openai                # OpenRouter client (OpenAI-compatible)
bun add puppeteer
bun add d3 @types/d3
bun add recharts
bun add react-hook-form @hookform/resolvers zod
bun add lucide-react
bun add date-fns              # Date formatting
bun add clsx tailwind-merge   # Utility for className merging
```

### Dev
```bash
bun add -d typescript @types/react @types/node
bun add -d prisma
bun add -d eslint eslint-config-next
bun add -d prettier
```
