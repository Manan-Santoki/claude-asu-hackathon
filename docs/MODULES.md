# CitizenOS — Module Specifications

## Shared: User Onboarding & Profile

### Onboarding Flow

The onboarding is a multi-step wizard shown after first login. Each step is optional but improves personalization. The wizard uses a stepper UI with progress indicator.

**Step 1: Location**
- Input: ZIP code (required — this is the minimum needed for any personalization)
- Auto-derive: state, congressional district, city
- API: Use a ZIP-to-district mapping dataset or Census geocoding API
- Store: `zip_code`, `state`, `congressional_district`, `city`

**Step 2: Identity**
- Citizenship status: US Citizen, Green Card Holder, H-1B, H-4, F-1 (student), J-1, L-1, O-1, B-1/B-2, TPS, DACA, Undocumented, Prefer not to say
- Age bracket: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- Store: `citizenship_status`, `age_bracket`

**Step 3: Occupation**
- Primary role (multi-select): Student, Veteran, Active Military, Small Business Owner, Self-Employed, Tech Worker, Healthcare Worker, Educator, Government Employee, Gig/Freelance Worker, Retired, Unemployed, Other
- Income bracket (optional): Under $25k, $25k-$50k, $50k-$75k, $75k-$100k, $100k-$150k, $150k+, Prefer not to say
- Store: `occupation_tags[]`, `income_bracket`

**Step 4: Policy Interests**
- Select all that apply: Healthcare, Immigration, Education, Climate/Environment, Economy/Jobs, Housing, Criminal Justice, Gun Policy, Technology/Privacy, Taxation, Social Security, Veterans Affairs, Foreign Policy, Civil Rights, Abortion/Reproductive Rights
- Rank top 3 priorities (drag to reorder)
- Store: `interest_tags[]`, `top_priorities[]` (ordered)

### Profile Data Model

```typescript
interface UserProfile {
  userId: string;
  zipCode: string;
  state: string;
  congressionalDistrict: string;
  city: string;
  citizenshipStatus: CitizenshipStatus;
  ageBracket: AgeBracket;
  occupationTags: OccupationType[];
  incomeBracket?: IncomeBracket;
  interestTags: PolicyArea[];
  topPriorities: PolicyArea[]; // ordered, max 3
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Module 1: BillBreaker

### Purpose
Transform dense legislative text into plain-English summaries with personalized impact analysis. Answer the question: "How does this bill affect ME specifically?"

### Pages

**Page: `/billbreaker` — Bills Dashboard**

Two-tab layout:

Tab 1: "Bills That Impact Me"
- Filtered feed of bills where the user's profile matches an impact profile
- Sorted by: impact severity (HIGH first), then recency
- Each bill card shows:
  - Bill number + short title
  - Status badge (Introduced, In Committee, Passed House, Passed Senate, Signed, Vetoed)
  - Impact severity badge (HIGH = red, MEDIUM = amber, LOW = blue)
  - 1-2 sentence impact summary personalized to user
  - Tags showing which profile attributes triggered the match (e.g., "F-1 Visa", "Student")
  - Date introduced
- Filters: severity, policy area, status, chamber (House/Senate), state (for state bills)
- Search: full-text search across bill titles and summaries

Tab 2: "All Recent Bills"
- Unfiltered chronological feed of all tracked bills
- Same card format but without personalized impact (shows general summary instead)
- Filters: policy area, status, chamber, state

**Page: `/billbreaker/[billId]` — Bill Detail**

Full bill view with sections:

Section 1: Header
- Bill number, full title, sponsors (with links to RepScore profiles)
- Status timeline (Introduced → Committee → Floor Vote → Other Chamber → President)
- Current status highlighted

Section 2: Plain-English Summary
- AI-generated summary (3-5 paragraphs)
- Key provisions as bullet points
- "Who it affects" section

Section 3: Impact On You (personalized)
- Based on user profile, shows specific impacts
- Impact severity with explanation
- Example: "As an F-1 student, this bill would change your OPT eligibility from 3 years to 1 year, directly affecting your post-graduation work authorization timeline."
- Which profile attributes are relevant

Section 4: Bill Chat (RAG-powered)
- Chat interface where user can ask questions about the bill
- "Does this affect my student loans?"
- "What's the timeline for implementation?"
- "Who opposes this bill and why?"
- Powered by RAG: question → embed → pgvector search over bill text chunks → LLM answer with citations

Section 5: Raw Bill Text
- Expandable section showing original text
- Highlighted sections that triggered impact analysis

### API Endpoints

```
GET  /api/bills                     # List bills with filters
GET  /api/bills/:id                 # Get bill detail
GET  /api/bills/:id/impact          # Get personalized impact for current user
POST /api/bills/:id/chat            # RAG chat message
POST /api/bills/sync                # Trigger bill sync from Congress.gov/LegiScan
GET  /api/bills/search?q=           # Full-text search
```

### AI Prompts

**Bill Summarization Prompt:**
```
You are a nonpartisan legislative analyst. Summarize this bill in plain English that a high school student could understand. Include:
1. What the bill does (2-3 paragraphs)
2. Key provisions (bullet points)
3. Who it primarily affects
4. Current status and likelihood of passage

Bill text:
{bill_text}

Bill metadata:
- Number: {bill_number}
- Title: {bill_title}
- Sponsors: {sponsors}
- Status: {status}
- Introduced: {date}
```

**Impact Analysis Prompt:**
```
You are a nonpartisan policy impact analyst. Given this bill summary and this user's profile, explain specifically how this bill would impact this person. Be concrete and specific — cite exact provisions and timelines.

Bill summary: {summary}
Key provisions: {provisions}

User profile:
- Citizenship/visa: {citizenship_status}
- Age: {age_bracket}
- Occupation: {occupation_tags}
- Location: {state}, {city}
- Interests: {interest_tags}

Rate the impact severity:
- HIGH: Directly changes their rights, benefits, costs, or legal status
- MEDIUM: Indirectly affects their field, community, or financial situation
- LOW: Tangentially related to their interests
- NONE: No meaningful connection to their profile

Respond in JSON:
{
  "severity": "HIGH|MEDIUM|LOW|NONE",
  "impact_summary": "1-2 sentence personalized impact",
  "detailed_explanation": "Full paragraph explaining the specific impact",
  "relevant_provisions": ["list of specific provisions that affect them"],
  "profile_triggers": ["which profile attributes are relevant"]
}
```

---

## Module 2: RepScore

### Purpose
Hold elected representatives accountable by comparing their campaign promises against their actual voting record. Generate a data-driven "Promise Alignment Score."

### Pages

**Page: `/repscore` — My Representatives Dashboard**

Auto-populated based on user's zip code:

Section 1: Federal Representatives
- 2 Senators + 1 House Rep
- Each card shows: photo, name, party, alignment score (circular gauge), years in office, top 3 policy areas, next election date

Section 2: State Representatives
- State Senator + State House Rep (from Open States)
- Same card format

Each card is clickable → goes to detail page.

**Page: `/repscore/[repId]` — Representative Detail**

Section 1: Header
- Photo, name, party, office, district, term dates
- Promise Alignment Score (large circular gauge with percentage)
- Quick stats: total promises tracked, kept, broken, in progress

Section 2: Promise Timeline
- Visual timeline (horizontal or vertical) showing:
  - Promise made (left/top): date, quote, source link
  - Arrow to fulfillment or current status
  - Status badge: KEPT (green), BROKEN (red), IN_PROGRESS (amber), NOT_YET_ACTIONABLE (gray)
  - For KEPT: date fulfilled, days to fulfill, evidence link
  - For BROKEN: contradicting vote(s), date of contradicting vote
- Filter by policy area, status
- Sort by date made, date resolved, category

Section 3: Voting Patterns
- Recharts bar chart: votes by policy area (for/against breakdown)
- Party-line voting percentage (gauge)
- Voting trend over time (line chart)
- Notable votes highlighted (bills with high public interest)

Section 4: Financial Breakdown
- Top 10 donors (individuals + PACs)
- Donations by industry sector (pie chart or treemap)
- Total raised vs spent
- Small donor vs large donor ratio

Section 5: Public Statements
- Timeline of scraped speeches, press releases, quotes
- AI-extracted key claims and positions
- Links to original sources

### API Endpoints

```
GET  /api/reps                      # Get reps for current user's zip
GET  /api/reps/lookup?zip=          # Lookup reps by zip code
GET  /api/reps/:id                  # Get rep detail
GET  /api/reps/:id/promises         # Get all promises with status
GET  /api/reps/:id/votes            # Get voting record
GET  /api/reps/:id/finances         # Get financial data
POST /api/reps/:id/scrape           # Trigger promise scraping for a rep
GET  /api/reps/:id/score            # Get promise alignment score
```

### Promise Extraction Prompt

```
You are analyzing a politician's public statements to extract specific promises and commitments. From the following text (scraped from their campaign website, speech, or press release), extract every concrete promise or commitment they made.

Source: {source_url}
Date: {scrape_date}
Text: {scraped_text}

For each promise, provide:
- text: the exact or closely paraphrased promise
- category: one of [healthcare, education, immigration, economy, defense, climate, civil_rights, technology, housing, taxation, criminal_justice, veterans, foreign_policy, gun_policy, other]
- specificity: SPECIFIC (has measurable outcome or deadline) or VAGUE (general aspiration)
- date_context: when this promise was likely made (from context clues)

Respond as JSON array:
[
  {
    "text": "I will introduce legislation to cap insulin prices at $35/month",
    "category": "healthcare",
    "specificity": "SPECIFIC",
    "date_context": "2024 campaign"
  }
]

Only extract actual commitments ("I will", "I pledge to", "We need to and I'll fight for"). Skip general statements of value ("I believe in freedom") unless they include a concrete action.
```

### Promise Scoring Prompt

```
You are comparing a politician's promise against their actual voting record. Determine whether this promise has been kept, broken, is in progress, or hasn't had a chance to be acted upon.

Promise: {promise_text}
Category: {promise_category}
Date made: {date_made}

Relevant votes cast since promise was made:
{votes_json}

Relevant bills introduced/cosponsored:
{bills_json}

Determine status:
- KEPT: Voted for / cosponsored legislation that fulfills this promise
- BROKEN: Voted against legislation that would fulfill this promise, or voted for legislation that contradicts it
- IN_PROGRESS: Relevant legislation exists but hasn't come to a final vote yet, and no contradicting votes
- NOT_YET_ACTIONABLE: No relevant legislation has been introduced

Respond in JSON:
{
  "status": "KEPT|BROKEN|IN_PROGRESS|NOT_YET_ACTIONABLE",
  "confidence": 0.0-1.0,
  "evidence": "explanation of why this status was assigned",
  "relevant_vote_ids": ["list of vote IDs that support this determination"],
  "fulfillment_date": "date fulfilled if KEPT, null otherwise"
}
```

---

## Module 3: VoteMap

### Purpose
Help users make informed voting decisions by mapping candidates on policy axes, computing alignment with user priorities, and surfacing reputation information from public records.

### Pages

**Page: `/votemap/quiz` — Policy Alignment Quiz**

15-question quiz covering key policy areas. Each question:
- Statement of a policy position
- Scale: Strongly Disagree (-2), Disagree (-1), Neutral (0), Agree (+1), Strongly Agree (+2)
- Example: "The government should provide universal healthcare coverage" → -2 to +2

Policy areas covered (one question each):
1. Healthcare access
2. Immigration policy
3. Climate action
4. Education funding
5. Economic regulation
6. Gun policy
7. Abortion/reproductive rights
8. Criminal justice reform
9. Foreign policy interventionism
10. Technology/privacy regulation
11. Housing affordability
12. Tax policy (progressive vs flat)
13. Social security / entitlements
14. Veterans benefits
15. Civil rights / equality

After quiz: redirect to `/votemap` with results.

**Page: `/votemap` — Political Compass & Candidates**

Section 1: Your Political Compass
- D3.js 2D scatter plot
- X-axis: Economic (left = progressive/regulated, right = free market)
- Y-axis: Social (bottom = traditional/authoritarian, top = progressive/libertarian)
- User's position plotted as a highlighted/pulsing dot
- Candidates in user's district plotted as labeled dots
- Color-coded by party (blue = Dem, red = Rep, yellow = Independent, gray = Other)
- Click candidate dot → flyout panel with quick info
- Zoom/pan enabled

Section 2: Candidate Cards (below compass)
- Grid of candidate cards sorted by alignment score (highest first)
- Each card: photo, name, party, alignment percentage, top 3 matching issues, top 3 diverging issues, reputation score (stars or grade), controversy flag if applicable
- Click → full candidate profile

**Page: `/votemap/candidate/[id]` — Candidate Profile**

Section 1: Header + Alignment
- Photo, name, party, office sought, district
- Overall alignment score (large %)
- Radar chart: user vs candidate positions on all 15 policy axes

Section 2: Position Breakdown
- Table/accordion: each policy area with:
  - Candidate position (-2 to +2 with explanation)
  - User position (-2 to +2)
  - Match indicator (agree, partial, disagree)
  - Source: where this position was extracted from (campaign site, voting record, speech)

Section 3: Reputation Analysis
- Overall reputation grade (A-F or 1-5 stars)
- Positive record: notable achievements, bipartisan work, endorsements
- Controversies: any legal issues, accusations, scandals — from public record only
- Public perception summary
- All with source links

Section 4: Voting History (if incumbent)
- Same voting pattern charts as RepScore
- Key votes highlighted

Section 5: Financial Backers
- Top donors, PAC support, industry breakdown
- Same as RepScore financial section

### API Endpoints

```
GET  /api/candidates                 # Get candidates for user's district
GET  /api/candidates/:id             # Get candidate detail
GET  /api/candidates/:id/positions   # Get positions on all policy axes
GET  /api/candidates/:id/reputation  # Get reputation analysis
POST /api/candidates/match           # Submit quiz answers, get alignment scores
GET  /api/votemap/compass            # Get compass data (all candidates + user position)
POST /api/votemap/quiz               # Save quiz answers
POST /api/candidates/:id/scrape      # Trigger data collection for a candidate
```

### Position Extraction Prompt

```
You are analyzing a political candidate's public positions. From the following sources (campaign website, voting record, speeches, interviews), determine their position on each policy axis.

Candidate: {candidate_name}
Party: {party}
Office: {office_sought}

Sources:
{scraped_content}

Voting record (if incumbent):
{voting_record}

For each of these 15 policy areas, rate their position from -2 to +2:
-2 = Strongly against / conservative position
-1 = Somewhat against / lean conservative
 0 = Neutral or unclear
+1 = Somewhat for / lean progressive
+2 = Strongly for / progressive position

Policy areas:
1. healthcare_access (Universal coverage ←→ Market-based)
2. immigration (Open/path to citizenship ←→ Restrictive/enforcement)
3. climate (Strong regulation/Green New Deal ←→ Deregulation/fossil fuels)
4. education (Increase public funding ←→ School choice/vouchers)
5. economy (More regulation/worker protections ←→ Free market/deregulation)
6. gun_policy (Strict gun control ←→ Gun rights/2A expansion)
7. abortion (Protect/expand access ←→ Restrict/ban)
8. criminal_justice (Reform/reduce incarceration ←→ Law and order/tough on crime)
9. foreign_policy (Diplomacy/multilateral ←→ Military strength/unilateral)
10. technology (Regulate big tech/privacy ←→ Light regulation/innovation)
11. housing (Government housing programs ←→ Market solutions)
12. taxation (Progressive/higher taxes on wealthy ←→ Flat/lower taxes)
13. social_security (Expand benefits ←→ Privatize/reduce)
14. veterans (Increase VA funding ←→ Privatize VA services)
15. civil_rights (Expand protections ←→ Reduce government role)

Respond as JSON:
{
  "positions": {
    "healthcare_access": { "score": 2, "justification": "...", "source": "campaign website" },
    ...
  }
}
```

### Reputation Analysis Prompt

```
You are conducting a factual reputation analysis of a political candidate based on publicly available information. Be strictly factual — cite sources, avoid speculation, distinguish between allegations and proven facts.

Candidate: {candidate_name}
Party: {party}
Office: {office_sought}

Public records and news articles:
{scraped_news_content}

Campaign information:
{campaign_content}

Provide a structured reputation analysis:

{
  "overall_grade": "A|B|C|D|F",
  "grade_justification": "Brief explanation of overall grade",
  "positive_record": [
    { "item": "description", "source": "url", "date": "when" }
  ],
  "controversies": [
    {
      "item": "description",
      "severity": "HIGH|MEDIUM|LOW",
      "status": "PROVEN|ALLEGED|DISMISSED|ONGOING",
      "source": "url",
      "date": "when"
    }
  ],
  "endorsements": ["Notable endorsements"],
  "bipartisan_record": "Description of cross-party work, if any",
  "public_perception_summary": "1-2 sentence summary"
}

Rules:
- Only include controversies from credible news sources
- Clearly mark allegations as allegations (not proven facts)
- Include context for controversies (outcomes, responses)
- Be politically neutral — apply the same standard to all candidates
```
