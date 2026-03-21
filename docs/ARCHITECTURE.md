# CitizenOS — System Architecture

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                               │
│  Next.js 15 App Router + React 19 + Tailwind v4 + shadcn/ui      │
│  D3.js (political compass) + Recharts (voting patterns)           │
├──────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                                │
│  Next.js API Routes + Server Actions + NextAuth.js v5             │
│  Rate limiting via Redis · Job queuing for scraping tasks         │
├──────────────────────────────────────────────────────────────────┤
│  AI & PROCESSING LAYER                                            │
│  OpenRouter LLMs (summarization, scoring, extraction)             │
│  Self-hosted embedding model · Self-hosted OCR                    │
│  RAG pipeline: text chunking → embeddings → pgvector search → LLM│
├──────────────────────────────────────────────────────────────────┤
│  DATA SOURCES LAYER                                               │
│  Congress.gov API · LegiScan API · Open States v3 · FEC.gov API   │
│  FireCrawl · Crawl4AI · SerpAPI · Puppeteer                       │
├──────────────────────────────────────────────────────────────────┤
│  STORAGE LAYER                                                    │
│  PostgreSQL 16 + pgvector (self-hosted)                           │
│  Redis (caching + rate limiting + job queue)                      │
│  MinIO (S3-compatible, scraped content + PDFs)                    │
├──────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                                   │
│  Hetzner VPS · Dokploy (Docker deployment)                        │
│  Cloudflare Tunnel (optional) · Traefik reverse proxy             │
└──────────────────────────────────────────────────────────────────┘
```

## Module Interaction & Shared Profile

The user profile is the connective tissue across all three modules. It is created during onboarding and stored in the `user_profiles` table. Every module reads from it.

```
                    ┌─────────────────┐
                    │  USER PROFILE   │
                    │  zip, visa,     │
                    │  occupation,    │
                    │  age, interests │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌─────────────┐ ┌──────────┐ ┌──────────┐
       │ BILLBREAKER │ │ REPSCORE │ │ VOTEMAP  │
       │             │ │          │ │          │
       │ Profile →   │ │ Zip →    │ │ Interest │
       │ impact      │ │ my reps  │ │ → match  │
       │ filtering   │ │ lookup   │ │ scoring  │
       └─────────────┘ └──────────┘ └──────────┘
```

## Data Flow: BillBreaker

```
INGESTION (cron or on-demand):
  Congress.gov API ──→ Federal bills (text, summary, sponsors, status)
  LegiScan API ──────→ State bills (filtered by user's state)
       │
       ▼
  PROCESSING PIPELINE:
  1. Fetch full bill text (API or scrape from GPO)
  2. If PDF: self-hosted OCR → extract text
  3. Store raw text in MinIO (S3)
  4. Chunk text (1000 tokens, 200 overlap)
  5. Generate embeddings (self-hosted model) → store in pgvector
  6. OpenRouter LLM: generate plain-English summary
  7. OpenRouter LLM: for EACH profile archetype, generate impact analysis
     - Profile archetypes: student, veteran, small_business, immigrant,
       parent, retiree, healthcare_worker, gig_worker, homeowner, renter
     - Each gets: impact_severity (HIGH/MEDIUM/LOW/NONE), impact_summary
  8. Store bill + summaries + impacts in PostgreSQL
       │
       ▼
  USER-FACING:
  1. User opens BillBreaker dashboard
  2. Server matches user profile tags against bill impact_profiles
  3. Returns two feeds:
     a. "Bills That Impact Me" — filtered, sorted by severity
     b. "All Recent Bills" — unfiltered browse
  4. Bill detail page: full summary + personalized impact + RAG chat
  5. RAG chat flow:
     User question → embed question → pgvector similarity search
     → retrieve top-5 chunks → inject into LLM prompt → answer
```

## Data Flow: RepScore

```
TRIGGER: User zip code (from profile or manual entry)
       │
       ▼
  REP LOOKUP:
  Open States v3 API → state + federal reps by address/district
  Congress.gov API → member details, committee memberships
       │
       ▼
  THREE PARALLEL PIPELINES PER REP:

  PIPELINE A — VOTING RECORD:
  Congress.gov API → all roll-call votes for this member
  Categorize each vote by policy area:
    healthcare, education, immigration, economy, defense,
    climate, civil_rights, technology, housing, taxation
  Calculate: party_line_pct, votes_with_party, votes_against_party
  Store in: rep_votes table

  PIPELINE B — PROMISE EXTRACTION:
  FireCrawl → scrape campaign website /issues, /platform, /priorities
  SerpAPI → google: "{rep name} campaign promises {year}"
  SerpAPI → google: "{rep name} press release pledge"
  Puppeteer → fallback for JS-heavy sites
  Store raw scraped HTML/text in MinIO
  OpenRouter LLM → extract structured promises:
    { text, category, date_made, source_url, specificity_score }
  Store in: rep_promises table

  PIPELINE C — FINANCIAL DATA:
  FEC.gov API → candidate committee filings
  FEC.gov API → top contributors (individuals + PACs)
  Categorize donors by industry sector
  Store in: rep_finances table
       │
       ▼
  SCORING ENGINE:
  For each promise, compare against voting record:
    - KEPT: voted consistently with promise
    - BROKEN: voted against promise
    - IN_PROGRESS: relevant bills pending, no contradicting votes
    - NOT_YET_ACTIONABLE: no relevant legislation introduced

  Promise Alignment Score = (kept + 0.5 * in_progress) / total_scored * 100

  Timeline calculation:
    promise_date → election_date → fulfillment_date → days_to_fulfill
       │
       ▼
  USER-FACING:
  1. Rep cards with photo, party, alignment score, top issues
  2. Click → full detail: promise timeline, voting pattern charts,
     donor breakdown, party-line %, score trend over time
```

## Data Flow: VoteMap

```
TRIGGER: User completes policy quiz OR browses candidates
       │
       ▼
  CANDIDATE DATA COLLECTION (per candidate in user's district):

  1. Congress.gov / LegiScan → voting history (if incumbent)
  2. Crawl4AI → campaign website positions
  3. FireCrawl → structured scrape of issues/platform pages
  4. SerpAPI → news articles, interviews, public statements
  5. SerpAPI → controversy search: "{name} accusations OR scandal OR lawsuit"
  6. OpenRouter LLM → extract positions on 15 policy axes:
     healthcare, immigration, climate, education, economy, gun_policy,
     abortion, criminal_justice, foreign_policy, technology, housing,
     taxation, social_security, veterans, civil_rights
     Each position: -2 (strongly against) to +2 (strongly for) with text justification
  7. OpenRouter LLM → generate reputation summary:
     { overall_score, controversies[], positive_record[], public_perception }
  8. Generate position embeddings (self-hosted model)
  Store in: candidates, candidate_positions, candidate_reputation tables
       │
       ▼
  MATCHING ENGINE:
  1. User takes quiz: 15 policy questions, each answer → -2 to +2 scale
  2. User answers embedded into same vector space as candidate positions
  3. Cosine similarity: user_vector · candidate_vector = alignment_score
  4. Per-issue breakdown: where you agree, where you diverge
  5. OpenRouter LLM: generate natural language explanation of match/diverge
       │
       ▼
  USER-FACING:
  1. Political compass: D3.js 2D scatter plot (economic axis × social axis)
     - User plotted as highlighted point
     - Candidates plotted around them
     - Click candidate → detail flyout
  2. Radar chart: policy area alignment overlay (user vs candidate)
  3. Candidate cards: photo, party, alignment %, reputation score,
     top matching issues, controversy flags
  4. Full candidate profile: positions, voting history (if incumbent),
     reputation analysis, financial backers, endorsements
```

## Infrastructure Architecture (Hetzner + Dokploy)

```
Hetzner VPS
├── Dokploy (Docker orchestration)
│   ├── citizenos-app          # Next.js container (Bun runtime)
│   ├── postgres               # PostgreSQL 16 + pgvector
│   ├── redis                  # Redis 7
│   ├── minio                  # MinIO S3
│   ├── embedding-server       # Self-hosted embedding model (API)
│   └── ocr-server             # Self-hosted OCR model (API)
├── Traefik                    # Reverse proxy + SSL
└── Cloudflare Tunnel          # (optional) expose to internet
```

### Docker Compose (Development)

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: citizenos
      POSTGRES_USER: citizenos
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redisdata:/data"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports: ["9000:9000", "9001:9001"]
    volumes: ["miniodata:/data"]

volumes:
  pgdata:
  redisdata:
  miniodata:
```

## Caching Strategy

```
Redis cache layers:
├── Bill data:     cache:bill:{billId}           TTL: 6 hours
├── Bill summary:  cache:summary:{billId}        TTL: 24 hours
├── Rep data:      cache:rep:{repId}             TTL: 12 hours
├── Rep votes:     cache:votes:{repId}           TTL: 6 hours
├── Candidate:     cache:candidate:{candidateId} TTL: 24 hours
├── Search:        cache:search:{queryHash}      TTL: 1 hour
├── Rate limits:   ratelimit:{userId}:{endpoint} TTL: per-window
└── Scrape jobs:   queue:scrape:{jobId}          TTL: until processed
```

## Security Considerations

- All API keys stored in environment variables, never in code
- NextAuth.js handles session management with JWT or database sessions
- Rate limiting on all API routes via Redis
- User profile data encrypted at rest in PostgreSQL
- MinIO buckets are private by default
- Scraping respects robots.txt and rate limits to external services
- No PII exposed in client-side code — all profile matching happens server-side
