# Feature: Government Actions Tracker

## Problem

CitizenOS only tracks **Congressional bills**. But most government actions that immediately affect people's lives are **not bills**:

- The **H-1B $100K fee** was a presidential proclamation — no Congressional vote
- **Tariffs** raising consumer prices were executive orders — effective immediately
- **DOGE cuts** to SSA, VA, USAID were administrative agency actions
- **Travel bans** were presidential proclamations
- **Social media vetting** for visa applicants was an agency policy change
- **H-1B lottery rule changes** were agency rulemaking (Federal Register)

Citizens have no single place to see all government actions affecting them, understand them in plain English, and ask questions about their personal impact.

## Solution

Expand CitizenOS from a bill tracker to a **unified Government Actions dashboard** that tracks 8 types of government actions, uses AI to explain them in plain English, maps them to user personas, and provides chat for personalized Q&A.

---

## Action Types

| Type | Source | Code Prefix | Takes Effect | Example |
|------|--------|-------------|-------------|---------|
| Bill | Congress.gov API | `bill` | After passage + signing | Affordable Insulin Now Act |
| Executive Order | Federal Register API | `eo` | Immediately on signing | Establishing DOGE |
| Presidential Proclamation | Federal Register API | `proc` | Immediately (usually) | H-1B $100K fee, travel bans |
| Presidential Memorandum | Federal Register API | `memo` | Immediately | USCIS social media vetting directive |
| Final Rule | Federal Register API | `rule` | On effective date (30-180 days) | H-1B lottery wage-level weighting |
| Proposed Rule | Federal Register API | `prorule` | Not yet — open for comment | Proposed student visa changes |
| Court Ruling | Curated | `court` | On ruling date | Judge blocking Harvard funding freeze |
| Agency Action | Curated | `agency` | Varies | SSA staffing cuts, Dept. of Ed reorganization |

---

## Data Source: Federal Register API

**Base URL:** `https://www.federalregister.gov/api/v1/`
**Auth:** None required (free, public API)
**Format:** JSON

### Key Endpoints

```
# Executive Orders (2025+)
GET /documents?conditions[type]=PRESDOCU
    &conditions[presidential_document_type_id]=2
    &conditions[publication_date][year]=2025
    &fields[]=title&fields[]=abstract&fields[]=signing_date
    &fields[]=executive_order_number&fields[]=html_url
    &fields[]=agencies&fields[]=topics&fields[]=pdf_url
    &fields[]=effective_on&fields[]=president

# Proclamations
GET /documents?conditions[type]=PRESDOCU
    &conditions[presidential_document_type_id]=3

# Agency Final Rules
GET /documents?conditions[type]=RULE
    &conditions[agencies][]={agency-slug}

# Proposed Rules (open for comment)
GET /documents?conditions[type]=PRORULE

# Search by keyword
GET /documents?conditions[term]=H-1B
```

### Response Fields Used

```typescript
{
  title: string                    // "Adjusting Imports of Steel"
  abstract: string                 // Short summary
  document_number: string          // Unique ID
  type: string                     // "Presidential Document" | "Rule" | "Proposed Rule"
  subtype: string                  // "Executive Order" | "Proclamation" | "Memorandum"
  executive_order_number: number   // For EOs only
  signing_date: string             // When president signed
  effective_on: string             // When it takes effect
  publication_date: string         // When published in Federal Register
  agencies: { name, slug }[]      // Issuing agencies
  topics: string[]                 // Subject categories
  html_url: string                 // Link to full text
  pdf_url: string                  // PDF version
  president: { name, identifier }  // Which president
}
```

---

## Data Model

### Unified GovernmentAction

Replaces the idea of bills-only. The existing `bills` table stays for backward compatibility, but a new `government_actions` table holds everything.

```sql
CREATE TABLE government_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  action_id TEXT UNIQUE NOT NULL,          -- 'eo-14110', 'proc-10923', 'rule-2025-04866', 'bill-hr1234-119'
  action_type TEXT NOT NULL,               -- 'bill','executive_order','proclamation','memorandum','final_rule','proposed_rule','court_ruling','agency_action'

  -- Content
  title TEXT NOT NULL,
  summary_raw TEXT,                        -- Original abstract/summary from source
  summary_ai TEXT,                         -- AI plain-English summary
  full_text_url TEXT,                      -- Link to full text
  pdf_url TEXT,

  -- Metadata
  issuing_authority TEXT,                  -- 'President','Congress','USCIS','DOL','Federal Court'
  agencies TEXT[],                         -- ['DHS','USCIS'] or ['Congress']
  document_number TEXT,                    -- Federal Register document number
  executive_order_number INT,             -- For EOs only

  -- Dates & Status
  signing_date DATE,
  effective_date DATE,
  publication_date DATE,
  status TEXT,                             -- 'active','pending','blocked','overturned','enacted','in_committee','proposed'
  status_detail TEXT,                      -- Latest action description

  -- Categorization (AI-tagged)
  categories TEXT[],                       -- ['immigration','economy','healthcare']
  affected_personas TEXT[],               -- ['visa_holder','small_business','student']
  impact_level TEXT CHECK (impact_level IN ('high','medium','low')),
  state_relevance TEXT[],                 -- States particularly affected

  -- AI enrichment
  impact_personas JSONB DEFAULT '{}',     -- { "visa_holder": "...", "student": "..." }
  impact_story TEXT,                      -- AI narrative
  ai_processed BOOLEAN DEFAULT false,

  -- Relationships
  related_action_ids TEXT[],              -- Links to related actions
  legal_challenges JSONB DEFAULT '[]',    -- [{ case_name, court, status, ruling_date, summary }]

  -- Source
  source_url TEXT,                        -- Original source (congress.gov, federalregister.gov, etc.)
  source_api TEXT,                        -- 'congress_gov' | 'federal_register' | 'curated'

  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat about any government action (reuses bill_chats pattern)
CREATE TABLE action_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_id TEXT REFERENCES government_actions(action_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved/tracked actions
CREATE TABLE saved_actions (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_id TEXT REFERENCES government_actions(action_id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, action_id)
);
```

### Extended Notifications

```sql
-- Extend existing notifications table to support all action types
-- Change bill_id → action_id, add new notification types
ALTER TABLE notifications
  ADD COLUMN action_id TEXT REFERENCES government_actions(action_id),
  ADD COLUMN action_type TEXT;

-- New notification types:
-- 'bill_alert', 'status_change', 'rep_voted'        (existing)
-- 'executive_order', 'proclamation', 'new_rule',     (new)
-- 'court_ruling', 'agency_action', 'comment_period'  (new)
```

---

## API Routes

### Government Actions (new endpoints)

```
GET    /api/actions?type={type}&category={cat}&persona={persona}&state={code}&page={n}&limit=20
                                          → Paginated list with filters
                                            type: 'all','bill','executive_order','proclamation','rule','court_ruling'
                                            Returns: [GovernmentAction] with summary_ai

GET    /api/actions/:action_id            → Full action detail + AI summary
                                            Returns: full record + impact_personas + legal_challenges

GET    /api/actions/:action_id/impact?personas=student,visa_holder
                                          → Persona-specific impact analysis
                                            Caches in impact_personas JSONB

GET    /api/actions/:action_id/story      → AI "Impact Story" narrative

POST   /api/actions/:action_id/chat       → Ask questions about this action
                                            Body: { message, history }
                                            Returns: { response }

POST   /api/actions/:action_id/save       → Track/bookmark action
DELETE /api/actions/:action_id/save       → Untrack action
GET    /api/actions/saved                 → User's tracked actions

GET    /api/actions/feed                  → Personalized feed based on user personas + categories
                                            Returns: recent actions sorted by relevance to user
                                            Uses: user_profiles + user_categories to filter and rank

GET    /api/actions/timeline/:action_id   → Full history chain for an action
                                            Returns: related actions in chronological order
                                            Example: EO → agency rule → court challenge → court ruling
```

### Data Pipeline (edge functions)

```
# Fetch and process new actions from Federal Register
POST   /api/pipeline/federal-register     → Fetch latest documents, AI-process, insert
                                            Runs on schedule (every 6 hours)
                                            Steps:
                                            1. Fetch new documents since last fetch
                                            2. For each: AI categorize → AI summarize → AI tag personas
                                            3. UPSERT into government_actions
                                            4. Generate notifications for matched users

# Existing bill pipeline continues unchanged
POST   /api/pipeline/congress-gov         → Fetch bills (existing)
```

---

## Frontend Architecture

### New Files

```
citizenos/src/
├── api/
│   └── actions.ts                         # Government Actions API client
├── stores/
│   └── useActionStore.ts                  # Zustand store for actions
├── components/
│   └── actions/                           # NEW MODULE
│       ├── ActionFeed.tsx                 # Personalized feed (dashboard)
│       ├── ActionCard.tsx                 # Universal card for any action type
│       ├── ActionDetailPage.tsx           # Full detail page (/action/:id)
│       ├── ActionHeader.tsx              # Title, type badge, authority, dates
│       ├── ActionTimeline.tsx            # Status/history timeline
│       ├── ActionTypeBadge.tsx           # Color-coded type badge component
│       ├── ActionImpactPanel.tsx         # Persona impact (reuses pattern)
│       ├── ActionChat.tsx                # Chat about any action (reuses BillChat pattern)
│       ├── ActionSearchPage.tsx          # Browse/search all actions (/actions)
│       ├── LegalChallenges.tsx           # Court challenge status cards
│       └── RelatedActions.tsx            # Chain of related actions
```

### Routes

```
/actions                → ActionSearchPage (browse/filter all government actions)
/action/:actionId       → ActionDetailPage (full detail + chat)
```

### Component Design

#### ActionCard

```
┌─────────────────────────────────────────────────────┐
│ [EO badge]  Executive Order #14110          Mar 18  │
│                                                     │
│ Adjusting Imports of Steel and Aluminum             │
│                                                     │
│ Imposes 25% tariffs on all steel imports and 10%    │
│ tariffs on aluminum imports effective immediately... │
│                                                     │
│ [immigration] [economy]     Impact: ██████ HIGH     │
│ Affects: Small Business, Gig Worker                 │
│                                              [📌]   │
└─────────────────────────────────────────────────────┘
```

**Type badge colors:**
| Type | Color | Label |
|------|-------|-------|
| Bill | blue | Bill |
| Executive Order | amber/orange | Exec Order |
| Proclamation | purple | Proclamation |
| Memorandum | indigo | Memo |
| Final Rule | teal | Rule |
| Proposed Rule | yellow | Proposed Rule |
| Court Ruling | slate | Court Ruling |
| Agency Action | gray | Agency Action |

#### ActionDetailPage Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back                                                       │
│                                                              │
│ [Proclamation]  [HIGH IMPACT]  [Active — In Effect]          │
│ ─────────────────────────────────────────────────────────     │
│ Adjusting Nonimmigrant Worker Admission Programs             │
│ Signed: Sep 19, 2025 │ Effective: Sep 21, 2025               │
│ Authority: President │ Published: Federal Register            │
│                                                              │
│ ┌──── AI Summary ────────────────────────────────────────┐   │
│ │ This proclamation requires employers hiring H-1B       │   │
│ │ workers from outside the US to pay a $100,000          │   │
│ │ supplemental fee per petition. Exemptions exist for... │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Status Timeline ───────────────────────────────────┐   │
│ │ ● Signed (Sep 19) → ● Effective (Sep 21) →            │   │
│ │   ● Challenged in court (Oct 15) →                     │   │
│ │   ● Upheld by judge (Dec 19) →                         │   │
│ │   ○ Appeal pending (ongoing)                           │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Who This Affects ──────────────────────────────────┐   │
│ │ [Visa Holder ✓] [Small Business ✓] [Student]           │   │
│ │                                                        │   │
│ │ 🎓 Visa Holder: F-1 students changing to H-1B from    │   │
│ │    within the US are EXEMPT from the $100K fee. But    │   │
│ │    those applying from abroad must have employer pay...  │   │
│ │                                                        │   │
│ │ 🏪 Small Business: Companies hiring H-1B workers now   │   │
│ │    face $100K per petition on top of existing fees...   │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Legal Status ──────────────────────────────────────┐   │
│ │ ⚖ 2 court challenges                                   │   │
│ │                                                        │   │
│ │ ITServe Alliance v. DHS — D.D.C.                       │   │
│ │ Status: Fee upheld (Dec 19, 2025)                      │   │
│ │                                                        │   │
│ │ NASSCOM v. USCIS — S.D.N.Y.                            │   │
│ │ Status: Pending (hearing scheduled Mar 2026)            │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Related Actions ───────────────────────────────────┐   │
│ │ → Final Rule: H-1B Lottery Wage-Level Weighting        │   │
│ │ → USCIS Notice: Social Media Vetting Expansion         │   │
│ │ → Bill S.910: Immigration Reform Act (in committee)    │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Ask About This Action ─────────────────────────────┐   │
│ │ 💬 Chat                                                │   │
│ │                                                        │   │
│ │ [Does this fee apply to H-1B extensions?]              │   │
│ │ [Am I exempt as an F-1 student?]                       │   │
│ │ [What are my options if my employer won't pay?]        │   │
│ │                                                        │   │
│ │ ┌─────────────────────────────┐  [Send]                │   │
│ │ │ Type your question...       │                        │   │
│ │ └─────────────────────────────┘                        │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──── Actions ───────────────────────────────────────────┐   │
│ │ [📌 Track] [📤 Share] [📧 Contact Rep About This]      │   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### ActionFeed (Dashboard Integration)

```
┌──── What's Affecting You ────────────────────────────────────┐
│                                                              │
│ Based on your profile: Student, Visa Holder (AZ)             │
│                                                              │
│ ┌─ TODAY ─────────────────────────────────────────────────┐  │
│ │ [Proc] H-1B Supplemental Fee — court ruling expected    │  │
│ │ [Rule] USCIS expands social media review to H-4 dep.   │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ THIS WEEK ─────────────────────────────────────────────┐  │
│ │ [Bill] Student Loan Relief Act — committee hearing Thu  │  │
│ │ [EO]   Dept. of Education reorganization — 6 programs   │  │
│ │        transferred to other agencies                    │  │
│ │ [Agency] DOGE cuts to university research grants — $2B  │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ [View all actions →]                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Notification Expansion

### New Trigger Types

| Trigger | When | Who Gets Notified |
|---------|------|-------------------|
| New Executive Order | EO signed matching user categories | Users with matching category prefs |
| New Proclamation | Proclamation published | Users with matching personas |
| New Final Rule | Rule takes effect | Users with matching categories |
| Comment Period Open | Proposed rule opens for comment | All users with matching categories |
| Court Ruling | Court blocks or upholds an action user tracks | Users tracking that action |
| Status Change | Any tracked action changes status | Users tracking that action |

### Notification Message Format

```
[Type Badge] Title
One-line AI impact summary for YOUR profile
Time ago • [View →]
```

Example:
```
[Proclamation] H-1B $100K Fee Upheld by Federal Judge
As a visa holder, this means your employer will need to budget $100K per
H-1B petition for workers abroad. F-1 students changing status are exempt.
2 hours ago • [View →]
```

---

## AI Prompt Architecture

### Action Categorization Prompt

```
You are a policy analyst. Given a government action, return:
1. categories: array of matching categories from [immigration, healthcare, education, economy, tax, climate, gun_policy, criminal_justice, foreign_policy, social_issues, government_spending, veterans, housing, technology, labor, trade]
2. affected_personas: array from [student, veteran, visa_holder, small_business, senior, parent, healthcare_worker, gig_worker]
3. impact_level: 'high' | 'medium' | 'low'
4. state_relevance: array of state codes if geographically targeted, empty if national

Action title: {title}
Action type: {type}
Abstract: {abstract}
```

### Action Summary Prompt

```
You are a civic educator explaining a government action to a regular citizen.
Write a 3-4 sentence plain-English summary of what this action does and why it matters.
Avoid legal jargon. Include specific numbers, dates, and who is affected.

Action type: {type} (e.g., Executive Order, Proclamation, Agency Rule)
Title: {title}
Original text/abstract: {abstract}
Effective date: {effective_date}
```

### Action Chat Prompt

```
You are CitizenOS, a helpful civic assistant. A user is asking about a government action.
Answer in plain English. Be specific about who is affected and what they should do.
If the user asks "does this affect me?", use their profile to give a personalized answer.

Government Action:
- Type: {type}
- Title: {title}
- Summary: {summary_ai}
- Status: {status}
- Effective date: {effective_date}
- Legal challenges: {legal_challenges}

User Profile:
- Personas: {user_personas}
- State: {user_state}

User Question: {message}
```

---

## StatePanel & Map Integration

### StatePanel "Actions" Tab

The existing StatePanel tabs (Bills, Representatives, Candidates, Stats) gain an **"Actions" tab** that shows executive orders, rules, and other actions relevant to the selected state.

```
Tabs: [Bills | Reps | Actions | Candidates | Stats]
                       ↑ NEW
```

The Actions tab renders `<ActionFeed stateFilter={selectedState} />` showing actions with that state in `state_relevance[]`.

### Map Color Mode: "Government Activity"

New color mode option in MapControls:
- Color states by total government action count (bills + EOs + rules affecting that state)
- Darker = more actions affecting that state

---

## Dashboard Expansion

The Dashboard page (`/dashboard`) adds an **ActionFeed** section above the existing quick links:

```
Dashboard
├── ActionFeed (personalized, top 5-10 recent actions)  ← NEW
├── Quick Links (existing: Saved Bills, Followed Reps, Policy Quiz)
├── Your Representatives (existing, from Person B)
```

---

## Migration Strategy

### Phase 1: Mock Data Layer (Hackathon MVP)

- Create `api/actions.ts` with mock executive orders, proclamations, rules
- Include the H-1B example and 4-5 other real-world examples
- Wire into `useActionStore.ts`
- Build all UI components with mock data
- Chat works with keyword matching (same as BillChat pattern)

### Phase 2: Federal Register Integration (Post-Hackathon)

- Replace mock data with Federal Register API calls
- Add scheduled pipeline to fetch new documents
- AI categorization + summarization on ingest
- Real-time notifications

### Phase 3: Full Pipeline

- Court ruling tracking (curated + scraped)
- Proposed rule comment integration (link to regulations.gov)
- Action relationship graph (EO → rule → court challenge)
- Push notifications

---

## Implementation Checklist

### Data Layer
- [x] `citizenos/src/api/actions.ts` — Mock data + API functions (getActions, getActionDetail, getActionImpact, chatWithAction, saveAction, getActionFeed)
- [x] `citizenos/src/stores/useActionStore.ts` — Zustand store
- [x] Mock data: 10 government actions (mix of EOs, proclamations, rules, court rulings) with realistic content including H-1B example

### UI Components
- [x] `ActionTypeBadge.tsx` — Color-coded type badge
- [x] `ActionCard.tsx` — Universal card for any action type
- [x] `ActionFeed.tsx` — Personalized feed for dashboard + StatePanel
- [x] `ActionSearchPage.tsx` — Browse/filter all actions (/actions route)
- [x] `ActionDetailPage.tsx` — Full detail composing sub-components
- [x] `ActionHeader.tsx` — Title, type, authority, dates, status
- [x] `ActionTimeline.tsx` — Status history timeline
- [x] `ActionImpactPanel.tsx` — Persona impact (reuse pattern from BillBreaker)
- [x] `ActionChat.tsx` — Q&A chat (reuse pattern from BillChat)
- [x] `LegalChallenges.tsx` — Court challenge cards
- [x] `RelatedActions.tsx` — Chain of related actions

### Integration
- [x] Add `/actions` and `/action/:id` routes to App.tsx
- [x] Add "Actions" tab to StatePanel
- [x] Add ActionFeed to Dashboard
- [x] Add nav link in Header
- [ ] Extend notification types to include action-based triggers
- [ ] Add "Government Activity" color mode to map

### Notification Expansion
- [ ] Extend Notification interface with action_id and new types
- [ ] Add mock notifications for EO/proclamation/rule events
- [ ] Update NotificationDropdown to handle new types + navigate to /action/:id
