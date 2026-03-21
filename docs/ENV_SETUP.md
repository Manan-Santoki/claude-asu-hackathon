# CitizenOS — Environment Setup

## .env.example

```bash
# ============================================================
# DATABASE
# ============================================================
DATABASE_URL="postgresql://citizenos:your_password@localhost:5432/citizenos?schema=public"

# ============================================================
# REDIS
# ============================================================
REDIS_URL="redis://localhost:6379"

# ============================================================
# MINIO (S3-COMPATIBLE)
# ============================================================
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_BILLS="bill-texts"
MINIO_BUCKET_SCRAPED="scraped-content"
MINIO_USE_SSL=false

# ============================================================
# AUTH (NextAuth.js v5)
# ============================================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
# Optional OAuth providers:
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
# GITHUB_CLIENT_ID=""
# GITHUB_CLIENT_SECRET=""

# ============================================================
# GOVERNMENT DATA APIs
# ============================================================
# Congress.gov API — Free, sign up at https://api.data.gov/signup/
CONGRESS_GOV_API_KEY=""

# LegiScan API — Free tier, sign up at https://legiscan.com/legiscan
LEGISCAN_API_KEY=""

# Open States v3 — Free, sign up at https://open.pluralpolicy.com/
OPENSTATES_API_KEY=""

# FEC.gov API — Free, sign up at https://api.open.fec.gov/developers/
FEC_API_KEY=""

# ============================================================
# SCRAPING APIs
# ============================================================
# SerpAPI — Free tier (100/mo), sign up at https://serpapi.com/
SERPAPI_API_KEY=""

# FireCrawl — Free tier (500 pages) or self-host
# If using cloud: sign up at https://firecrawl.dev/
# If self-hosted: set to your local instance URL
FIRECRAWL_API_KEY=""
FIRECRAWL_BASE_URL="https://api.firecrawl.dev/v1"
# For self-hosted: FIRECRAWL_BASE_URL="http://localhost:3002/v1"

# Crawl4AI — Self-hosted, no key needed
CRAWL4AI_BASE_URL="http://localhost:11235"

# ============================================================
# AI / LLM
# ============================================================
# OpenRouter — Pay-per-token, sign up at https://openrouter.ai/
OPENROUTER_API_KEY=""

# Self-hosted embedding model endpoint
EMBEDDING_SERVER_URL="http://localhost:8080"
EMBEDDING_DIMENSION=768  # depends on model (384 for MiniLM, 768 for BGE-base)

# Self-hosted OCR model endpoint
OCR_SERVER_URL="http://localhost:8081"

# ============================================================
# APP CONFIG
# ============================================================
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

## API Key Registration Guide

### 1. Congress.gov API (Required — Priority 1)
1. Go to https://api.data.gov/signup/
2. Enter name and email
3. API key is emailed instantly
4. Set `CONGRESS_GOV_API_KEY` in `.env`
5. Test: `curl "https://api.congress.gov/v3/bill/119?api_key=YOUR_KEY&limit=1"`

### 2. LegiScan API (Required — Priority 1)
1. Go to https://legiscan.com/legiscan
2. Create a free account
3. After login, go to API page to generate key
4. Set `LEGISCAN_API_KEY` in `.env`
5. Test: `curl "https://api.legiscan.com/?key=YOUR_KEY&op=getSessionList&state=AZ"`

### 3. Open States v3 (Required — Priority 2)
1. Go to https://open.pluralpolicy.com/
2. Create a free account
3. Navigate to API keys section
4. Generate a key
5. Set `OPENSTATES_API_KEY` in `.env`
6. Test: `curl -H "X-API-KEY: YOUR_KEY" "https://v3.openstates.org/people.geo?lat=33.4484&lng=-111.9260"`

### 4. FEC.gov API (Required — Priority 3)
1. Go to https://api.open.fec.gov/developers/
2. Sign up for a free API key
3. Set `FEC_API_KEY` in `.env`
4. Test: `curl "https://api.open.fec.gov/v1/candidates/search/?name=sinema&api_key=YOUR_KEY"`

### 5. SerpAPI (Required — Priority 2)
1. Go to https://serpapi.com/
2. Sign up for a free account (100 searches/month)
3. Get API key from dashboard
4. Set `SERPAPI_API_KEY` in `.env`

### 6. FireCrawl (Optional if self-hosting)
1. Go to https://firecrawl.dev/
2. Sign up for free tier (500 pages/month)
3. Get API key from dashboard
4. Set `FIRECRAWL_API_KEY` in `.env`
5. Or self-host: https://github.com/mendableai/firecrawl — set `FIRECRAWL_BASE_URL` to local instance

### 7. OpenRouter (Required — Priority 1)
1. Go to https://openrouter.ai/
2. Create account and add credits ($5-10 is plenty for hackathon)
3. Generate API key
4. Set `OPENROUTER_API_KEY` in `.env`

## Docker Compose Setup

### docker-compose.yml
```yaml
version: "3.8"

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: citizenos-db
    environment:
      POSTGRES_DB: citizenos
      POSTGRES_USER: citizenos
      POSTGRES_PASSWORD: citizenos_dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U citizenos"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: citizenos-redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

  minio:
    image: minio/minio
    container_name: citizenos-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  redisdata:
  miniodata:
```

### Start Infrastructure
```bash
docker compose up -d
# Wait for health checks
docker compose ps
```

### Create MinIO Buckets
After MinIO starts:
1. Open http://localhost:9001
2. Login: minioadmin / minioadmin
3. Create buckets: `bill-texts`, `scraped-content`

Or via CLI:
```bash
# Install mc (MinIO client)
brew install minio/stable/mc  # or download from MinIO docs

mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/bill-texts
mc mb local/scraped-content
```

## Prisma Setup

```bash
# Generate client
bunx prisma generate

# Run migrations
bunx prisma migrate dev --name init

# Apply pgvector columns (raw SQL)
# Copy the SQL from DATABASE_SCHEMA.md "Migration: Add pgvector Columns" section
# Run via psql or Prisma Studio

# Seed database
bunx prisma db seed

# Open visual browser
bunx prisma studio
```

## Verify Everything Works

```bash
# 1. Database
bunx prisma studio  # should open browser with tables

# 2. Redis
docker exec citizenos-redis redis-cli ping  # should return PONG

# 3. MinIO
curl http://localhost:9000/minio/health/live  # should return OK

# 4. Congress.gov API
curl "https://api.congress.gov/v3/bill/119?api_key=$CONGRESS_GOV_API_KEY&limit=1"

# 5. App
bun dev  # should start on http://localhost:3000
```
