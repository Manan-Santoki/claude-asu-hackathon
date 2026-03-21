# CitizenOS — Database Schema

## Overview

PostgreSQL 16 with pgvector extension. Managed via Prisma ORM.

## Entity Relationship Diagram

```
users 1──* user_profiles
users 1──* quiz_answers
users 1──* user_sessions (NextAuth)

bills 1──* bill_impacts
bills 1──* bill_chunks (pgvector embeddings)
bills 1──* bill_sponsors (junction)

representatives 1──* rep_promises
representatives 1──* rep_votes
representatives 1──* rep_finances
representatives *──* districts (junction: rep_districts)

candidates 1──* candidate_positions
candidates 1──* candidate_reputation_items
candidates 1──* candidate_financials

districts 1──* representatives
districts 1──* candidates
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

// ============================================================
// AUTH (NextAuth.js tables)
// ============================================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?   // For credentials provider
  accounts      Account[]
  sessions      Session[]
  profile       UserProfile?
  quizAnswers   QuizAnswer[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================================
// USER PROFILE (shared across all modules)
// ============================================================

model UserProfile {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  zipCode              String
  state                String
  congressionalDistrict String?
  city                 String?
  citizenshipStatus    String   // enum stored as string
  ageBracket           String
  occupationTags       String[] // array of occupation types
  incomeBracket        String?
  interestTags         String[] // array of policy areas
  topPriorities        String[] // ordered array, max 3
  onboardingCompleted  Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([zipCode])
  @@index([state])
  @@index([congressionalDistrict])
}

// ============================================================
// BILLBREAKER MODULE
// ============================================================

model Bill {
  id              String        @id @default(cuid())
  externalId      String        @unique // e.g., "119-hr-1234" or legiscan ID
  source          String        // "congress_gov" or "legiscan"
  congress        Int?          // e.g., 119
  type            String        // hr, s, hjres, etc.
  number          Int
  title           String
  shortTitle      String?
  status          String        // introduced, in_committee, passed_house, etc.
  statusDate      DateTime?
  chamber         String        // house, senate
  state           String?       // null for federal, "AZ" for state bills
  introducedDate  DateTime?
  policyAreas     String[]      // tagged policy areas
  summaryPlain    String?       @db.Text // AI-generated plain English summary
  fullTextUrl     String?       // URL to full text
  fullTextKey     String?       // MinIO object key for stored text
  sponsors        BillSponsor[]
  impacts         BillImpact[]
  chunks          BillChunk[]
  lastSyncedAt    DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([state])
  @@index([chamber])
  @@index([introducedDate])
  @@index([policyAreas])
}

model BillSponsor {
  id       String @id @default(cuid())
  billId   String
  bill     Bill   @relation(fields: [billId], references: [id], onDelete: Cascade)
  name     String
  party    String?
  state    String?
  role     String // sponsor, cosponsor
  bioguideId String? // link to representative

  @@index([billId])
}

model BillImpact {
  id               String @id @default(cuid())
  billId           String
  bill             Bill   @relation(fields: [billId], references: [id], onDelete: Cascade)
  profileArchetype String // "f1_student", "veteran", "small_business", etc.
  severity         String // HIGH, MEDIUM, LOW, NONE
  impactSummary    String @db.Text // 1-2 sentence personalized summary
  detailedExplanation String? @db.Text
  relevantProvisions String[] // provisions that trigger this impact
  profileTriggers    String[] // which profile attributes matched

  @@unique([billId, profileArchetype])
  @@index([billId])
  @@index([profileArchetype])
  @@index([severity])
}

// pgvector chunks for RAG
model BillChunk {
  id        String   @id @default(cuid())
  billId    String
  bill      Bill     @relation(fields: [billId], references: [id], onDelete: Cascade)
  content   String   @db.Text
  chunkIndex Int     // order within the bill
  // embedding stored via raw SQL (Prisma doesn't support vector type natively)
  // Column: embedding vector(768) — created via migration SQL
  createdAt DateTime @default(now())

  @@index([billId])
}

// ============================================================
// REPSCORE MODULE
// ============================================================

model Representative {
  id               String          @id @default(cuid())
  externalId       String          @unique // bioguide ID or Open States ID
  source           String          // "congress_gov", "openstates"
  name             String
  firstName        String?
  lastName         String?
  party            String
  chamber          String          // house, senate, state_house, state_senate
  state            String
  district         String?
  photoUrl         String?
  websiteUrl       String?
  contactEmail     String?
  contactPhone     String?
  termStart        DateTime?
  termEnd          DateTime?
  nextElection     DateTime?
  promiseScore     Float?          // cached Promise Alignment Score (0-100)
  partyLineVotePct Float?          // cached party-line voting percentage
  promises         RepPromise[]
  votes            RepVote[]
  finances         RepFinance[]
  scrapedContent   RepScrapedContent[]
  lastSyncedAt     DateTime?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@index([state])
  @@index([district])
  @@index([chamber])
  @@index([party])
}

model RepPromise {
  id               String   @id @default(cuid())
  repId            String
  rep              Representative @relation(fields: [repId], references: [id], onDelete: Cascade)
  text             String   @db.Text // the promise text
  category         String   // policy area
  specificity      String   // SPECIFIC or VAGUE
  dateMade         DateTime?
  dateResolved     DateTime?
  status           String   // KEPT, BROKEN, IN_PROGRESS, NOT_YET_ACTIONABLE
  confidence       Float?   // 0.0-1.0
  evidence         String?  @db.Text // explanation
  sourceUrl        String?
  relevantVoteIds  String[] // IDs of votes that determined status
  daysToFulfill    Int?     // days from election to fulfillment (if KEPT)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([repId])
  @@index([status])
  @@index([category])
}

model RepVote {
  id           String   @id @default(cuid())
  repId        String
  rep          Representative @relation(fields: [repId], references: [id], onDelete: Cascade)
  voteId       String   // external vote ID
  billTitle    String?
  billNumber   String?
  voteDate     DateTime
  votePosition String   // yea, nay, not_voting, present
  policyArea   String?  // tagged category
  partyPosition String? // what the party voted
  withParty    Boolean? // did they vote with party?
  createdAt    DateTime @default(now())

  @@index([repId])
  @@index([voteDate])
  @@index([policyArea])
}

model RepFinance {
  id              String   @id @default(cuid())
  repId           String
  rep             Representative @relation(fields: [repId], references: [id], onDelete: Cascade)
  cycle           Int      // election cycle year
  totalRaised     Float?
  totalSpent      Float?
  cashOnHand      Float?
  contributorName String?
  contributorType String?  // individual, pac, party
  amount          Float?
  industry        String?
  date            DateTime?
  createdAt       DateTime @default(now())

  @@index([repId])
  @@index([cycle])
}

model RepScrapedContent {
  id          String   @id @default(cuid())
  repId       String
  rep         Representative @relation(fields: [repId], references: [id], onDelete: Cascade)
  sourceUrl   String
  sourceType  String   // campaign_site, press_release, speech, news_article
  rawContent  String?  @db.Text // or MinIO key reference
  minioKey    String?  // key in MinIO bucket
  scrapedAt   DateTime @default(now())
  processed   Boolean  @default(false)

  @@index([repId])
  @@index([processed])
}

// ============================================================
// VOTEMAP MODULE
// ============================================================

model Candidate {
  id               String   @id @default(cuid())
  externalId       String?  @unique // FEC candidate ID if available
  name             String
  firstName        String?
  lastName         String?
  party            String
  officeSought     String   // e.g., "US House AZ-05", "US Senate AZ"
  state            String
  district         String?
  photoUrl         String?
  websiteUrl       String?
  isIncumbent      Boolean  @default(false)
  repId            String?  // link to Representative if incumbent
  overallAlignment Float?   // cached (computed per-user, so this is a default/average)
  reputationGrade  String?  // A-F
  positions        CandidatePosition[]
  reputationItems  CandidateReputationItem[]
  financials       CandidateFinancial[]
  lastScrapedAt    DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([state])
  @@index([district])
  @@index([party])
}

model CandidatePosition {
  id            String   @id @default(cuid())
  candidateId   String
  candidate     Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  policyArea    String   // healthcare_access, immigration, climate, etc.
  score         Float    // -2 to +2
  justification String?  @db.Text
  source        String?  // where this position was determined from
  // embedding stored via raw SQL: embedding vector(768)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([candidateId, policyArea])
  @@index([candidateId])
}

model CandidateReputationItem {
  id           String   @id @default(cuid())
  candidateId  String
  candidate    Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  itemType     String   // positive, controversy, endorsement
  description  String   @db.Text
  severity     String?  // HIGH, MEDIUM, LOW (for controversies)
  status       String?  // PROVEN, ALLEGED, DISMISSED, ONGOING
  sourceUrl    String?
  date         DateTime?
  createdAt    DateTime @default(now())

  @@index([candidateId])
  @@index([itemType])
}

model CandidateFinancial {
  id              String   @id @default(cuid())
  candidateId     String
  candidate       Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  cycle           Int
  totalRaised     Float?
  totalSpent      Float?
  contributorName String?
  contributorType String?
  amount          Float?
  industry        String?
  date            DateTime?
  createdAt       DateTime @default(now())

  @@index([candidateId])
}

// ============================================================
// VOTEMAP QUIZ
// ============================================================

model QuizAnswer {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  policyArea String   // matches CandidatePosition.policyArea
  score      Float    // -2 to +2
  // embedding vector stored via raw SQL for matching
  takenAt    DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, policyArea])
  @@index([userId])
}
```

## Migration: Add pgvector Columns

After running `bunx prisma migrate dev`, apply this raw SQL migration to add vector columns (Prisma doesn't generate these automatically):

```sql
-- migration: add_vector_columns.sql

CREATE EXTENSION IF NOT EXISTS vector;

-- Bill chunks: 768-dimensional embeddings for RAG
ALTER TABLE "BillChunk" ADD COLUMN IF NOT EXISTS embedding vector(768);
CREATE INDEX IF NOT EXISTS bill_chunk_embedding_idx ON "BillChunk" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Candidate positions: 768-dimensional embeddings for matching
ALTER TABLE "CandidatePosition" ADD COLUMN IF NOT EXISTS embedding vector(768);
CREATE INDEX IF NOT EXISTS candidate_position_embedding_idx ON "CandidatePosition" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Quiz answers: 768-dimensional embeddings for matching
ALTER TABLE "QuizAnswer" ADD COLUMN IF NOT EXISTS embedding vector(768);
```

## Key Queries

### Get bills that impact a user
```sql
SELECT b.*, bi.severity, bi.impact_summary
FROM "Bill" b
JOIN "BillImpact" bi ON bi."billId" = b.id
WHERE bi."profileArchetype" = ANY($1)  -- user's profile tags
  AND bi.severity != 'NONE'
ORDER BY
  CASE bi.severity
    WHEN 'HIGH' THEN 1
    WHEN 'MEDIUM' THEN 2
    WHEN 'LOW' THEN 3
  END,
  b."introducedDate" DESC;
```

### RAG similarity search
```sql
SELECT id, content, 1 - (embedding <=> $1::vector) as similarity
FROM "BillChunk"
WHERE "billId" = $2
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

### Calculate Promise Alignment Score
```sql
SELECT
  "repId",
  COUNT(*) FILTER (WHERE status = 'KEPT') as kept,
  COUNT(*) FILTER (WHERE status = 'BROKEN') as broken,
  COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
  COUNT(*) FILTER (WHERE status NOT IN ('NOT_YET_ACTIONABLE')) as total_scored,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'KEPT') +
     0.5 * COUNT(*) FILTER (WHERE status = 'IN_PROGRESS'))
    / NULLIF(COUNT(*) FILTER (WHERE status NOT IN ('NOT_YET_ACTIONABLE')), 0)
    * 100, 1
  ) as alignment_score
FROM "RepPromise"
WHERE "repId" = $1
GROUP BY "repId";
```
