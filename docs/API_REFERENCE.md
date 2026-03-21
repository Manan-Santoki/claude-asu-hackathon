# CitizenOS — External API Reference

## 1. Congress.gov API (Library of Congress)

**Purpose:** Federal bills, bill text, member info, roll-call votes, committee data.

- **Base URL:** `https://api.congress.gov/v3`
- **Auth:** API key as query param `?api_key=YOUR_KEY`
- **Key signup:** https://api.data.gov/signup/ (free, instant)
- **Rate limit:** 5,000 requests/hour
- **Format:** JSON (default) or XML

### Key Endpoints

```
GET /bill                                    # List all bills
GET /bill/{congress}/{type}/{number}         # Get specific bill
GET /bill/{congress}/{type}/{number}/text    # Get bill text
GET /bill/{congress}/{type}/{number}/actions # Get bill actions/status
GET /bill/{congress}/{type}/{number}/subjects # Get bill subjects
GET /bill/{congress}/{type}/{number}/cosponsors
GET /member                                  # List all members
GET /member/{bioguideId}                     # Get specific member
GET /member/{bioguideId}/sponsored-legislation
```

### Parameters
- `congress` = 119 (current, 2025-2027)
- `type` = hr (House), s (Senate), hjres, sjres, hconres, sconres, hres, sres
- `limit` = max 250 per page
- `offset` = pagination offset
- `sort` = updateDate+desc (default)

### Example Request
```bash
curl "https://api.congress.gov/v3/bill/119?api_key=YOUR_KEY&limit=20&sort=updateDate+desc"
```

### Example Response (bill list)
```json
{
  "bills": [
    {
      "congress": 119,
      "type": "HR",
      "number": 1234,
      "title": "To amend the Internal Revenue Code...",
      "url": "https://api.congress.gov/v3/bill/119/hr/1234",
      "latestAction": {
        "actionDate": "2025-03-15",
        "text": "Referred to the Committee on Ways and Means."
      },
      "updateDate": "2025-03-15T12:00:00Z"
    }
  ],
  "pagination": { "count": 5432, "next": "..." }
}
```

### Bill Text Access
The `/text` endpoint returns metadata about text versions. Actual text is hosted on GPO servers. You may need to:
1. Get text URL from the `/text` endpoint
2. Fetch the actual text (HTML, PDF, or XML format) from the GPO URL
3. If PDF: use self-hosted OCR to extract text

---

## 2. LegiScan API

**Purpose:** State-level legislation across all 50 states + Congress. More structured than scraping state legislature sites.

- **Base URL:** `https://api.legiscan.com/?key=YOUR_KEY`
- **Auth:** API key as query param
- **Key signup:** https://legiscan.com/legiscan (free account, instant)
- **Rate limit:** 30,000 queries/month (free tier)
- **Format:** JSON

### Key Operations

```
?op=getMasterList&state=AZ              # All bills for a state session
?op=getBill&id={bill_id}                # Get bill detail
?op=getBillText&id={text_id}            # Get bill text (base64 encoded)
?op=getRollCall&id={roll_call_id}       # Get vote details
?op=getSearch&state=AZ&query=education  # Search bills
?op=getSessionList&state=AZ             # List sessions for a state
?op=getSponsoredList&id={people_id}     # Bills sponsored by a legislator
```

### Example Request
```bash
curl "https://api.legiscan.com/?key=YOUR_KEY&op=getSearch&state=AZ&query=immigration&year=2"
```

### Example Response
```json
{
  "status": "OK",
  "searchresult": {
    "summary": { "count": 12, "page": 1, "range": "1-12" },
    "0": {
      "relevance": 95,
      "state": "AZ",
      "bill_number": "SB1234",
      "bill_id": 1567890,
      "title": "AN ACT relating to immigration enforcement...",
      "text_url": "https://legiscan.com/AZ/text/SB1234/id/...",
      "last_action": "Signed by Governor",
      "last_action_date": "2025-03-10"
    }
  }
}
```

### Notes
- Bill text returned as base64 encoded. Decode with `Buffer.from(text, 'base64').toString()`.
- Free tier is sufficient for hackathon (30k queries/month).
- State abbreviation codes: AZ, CA, TX, NY, FL, etc.

---

## 3. Open States v3 API (Plural Policy)

**Purpose:** State legislator lookup by address/district. Replaces the deprecated Google Civic Reps API.

- **Base URL:** `https://v3.openstates.org`
- **Auth:** `X-API-KEY` header or `?apikey=YOUR_KEY`
- **Key signup:** https://open.pluralpolicy.com/ (free account)
- **Rate limit:** Not strictly documented, be reasonable (~100 req/min)
- **Format:** JSON

### Key Endpoints

```
GET /people?jurisdiction=Arizona&chamber=lower
GET /people?jurisdiction=ocd-jurisdiction/country:us/state:az/government
GET /people/{ocd_person_id}
GET /jurisdictions
GET /jurisdictions/{jurisdiction_id}
```

### Geo Lookup (Find Reps by Location)
```
GET /people.geo?lat=33.4484&lng=-111.9260
```
This returns legislators for the given lat/lng coordinates. Convert zip to lat/lng first using a geocoding service or lookup table.

### Example Response
```json
{
  "results": [
    {
      "id": "ocd-person/abc123",
      "name": "Jane Smith",
      "party": "Democratic",
      "current_role": {
        "title": "Senator",
        "org_classification": "upper",
        "district": "15",
        "jurisdiction": { "name": "Arizona" }
      },
      "links": [{ "url": "https://azleg.gov/..." }],
      "email": "jsmith@azleg.gov"
    }
  ]
}
```

### Notes
- For federal reps, use Congress.gov `/member` endpoint instead.
- Open States is best for STATE legislators.
- Convert zip to lat/lng using a dataset or geocoding API before calling `/people.geo`.

---

## 4. FEC.gov API (Federal Election Commission)

**Purpose:** Campaign finance data — contributions, expenditures, donor info, committee filings.

- **Base URL:** `https://api.open.fec.gov/v1`
- **Auth:** API key as query param `?api_key=YOUR_KEY`
- **Key signup:** https://api.open.fec.gov/developers/ (free, instant)
- **Rate limit:** 1,000 requests/hour
- **Format:** JSON

### Key Endpoints

```
GET /candidates/search/?name=John+Smith          # Search candidates
GET /candidate/{candidate_id}/                    # Candidate detail
GET /candidate/{candidate_id}/totals/             # Financial totals
GET /schedules/schedule_a/?committee_id={id}      # Individual contributions TO
GET /schedules/schedule_b/?committee_id={id}      # Disbursements FROM
GET /committee/{committee_id}/                     # Committee detail
GET /elections/?state=AZ&district=05&cycle=2026   # Election overview
```

### Example: Get Top Contributors
```bash
curl "https://api.open.fec.gov/v1/schedules/schedule_a/?committee_id=C00123456&sort=-contribution_receipt_amount&per_page=20&api_key=YOUR_KEY"
```

### Example Response
```json
{
  "results": [
    {
      "contributor_name": "SMITH, JOHN",
      "contributor_employer": "ACME CORP",
      "contributor_occupation": "CEO",
      "contribution_receipt_amount": 5000,
      "contribution_receipt_date": "2025-01-15",
      "contributor_city": "PHOENIX",
      "contributor_state": "AZ"
    }
  ],
  "pagination": { "pages": 5, "per_page": 20, "count": 94 }
}
```

### Notes
- `candidate_id` format: e.g., `H6AZ05123` (H=House, 6=cycle year, AZ=state, 05=district)
- `committee_id` format: e.g., `C00123456`
- Financial data lags 1-3 months behind real-time filings.

---

## 5. OpenRouter API

**Purpose:** Multi-model LLM access. Used for summarization, impact analysis, promise extraction, reputation scoring, RAG answers, and policy matching.

- **Base URL:** `https://openrouter.ai/api/v1`
- **Auth:** `Authorization: Bearer YOUR_KEY`
- **Key signup:** https://openrouter.ai/ (pay-per-token)
- **Format:** OpenAI-compatible JSON

### Usage

```typescript
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://citizenos.example.com",
    "X-Title": "CitizenOS"
  },
  body: JSON.stringify({
    model: "anthropic/claude-sonnet-4",  // or google/gemini-2.5-flash, etc.
    messages: [
      { role: "system", content: "You are a nonpartisan legislative analyst..." },
      { role: "user", content: "Summarize this bill: ..." }
    ],
    temperature: 0.3,
    max_tokens: 2000
  })
});
```

### Recommended Models by Task
- **Bill summarization:** `anthropic/claude-sonnet-4` (high quality, good at structured output)
- **Impact analysis:** `anthropic/claude-sonnet-4` (needs nuanced reasoning)
- **Promise extraction:** `google/gemini-2.5-flash` (fast, good at structured extraction, cheaper)
- **RAG answers:** `anthropic/claude-sonnet-4` (good at citing sources)
- **Reputation analysis:** `anthropic/claude-sonnet-4` (needs careful, balanced analysis)
- **Quick classifications:** `google/gemini-2.5-flash` (fast and cheap for simple categorization)

---

## 6. SerpAPI

**Purpose:** Google search results as structured JSON. Used for finding politician speeches, press releases, news articles, controversy searches.

- **Base URL:** `https://serpapi.com/search`
- **Auth:** `api_key` query param
- **Key signup:** https://serpapi.com/ (free tier: 100 searches/month)
- **Rate limit:** 100/month free, then paid plans
- **Format:** JSON

### Example
```bash
curl "https://serpapi.com/search?engine=google&q=Mark+Kelly+campaign+promises+2024&api_key=YOUR_KEY"
```

### Response Structure
```json
{
  "organic_results": [
    {
      "position": 1,
      "title": "Mark Kelly's Key Campaign Promises",
      "link": "https://example.com/article",
      "snippet": "Senator Kelly pledged to...",
      "date": "2024-10-15"
    }
  ]
}
```

### Search Queries to Use
```
# Promise extraction
"{rep_name} campaign promises {election_year}"
"{rep_name} platform issues {election_year}"
"{rep_name} pledge commitment"

# Reputation research
"{candidate_name} controversy OR scandal OR lawsuit"
"{candidate_name} endorsements {election_year}"
"{candidate_name} political positions"

# Statement finding
"{rep_name} press release {topic}"
"{rep_name} speech {topic} transcript"
```

---

## 7. FireCrawl

**Purpose:** AI-native web scraping. Crawl campaign websites, extract structured content from politician pages.

- **Base URL:** `https://api.firecrawl.dev/v1` (or self-hosted)
- **Auth:** `Authorization: Bearer YOUR_KEY`
- **Key signup:** https://firecrawl.dev/ (free tier: 500 pages)
- **Can self-host:** Yes, open source — ideal for Hetzner deployment

### Scrape a Page
```typescript
const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: "https://candidate-website.com/issues",
    formats: ["markdown", "html"]
  })
});
```

### Crawl a Site
```typescript
// Crawl entire campaign site
const response = await fetch("https://api.firecrawl.dev/v1/crawl", {
  method: "POST",
  headers: { "Authorization": `Bearer ${FIRECRAWL_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://candidate-website.com",
    limit: 20,           // max pages
    maxDepth: 3,         // depth limit
    includePaths: ["/issues", "/platform", "/priorities", "/about", "/press"]
  })
});
```

---

## 8. Crawl4AI

**Purpose:** Open-source AI-native crawler. Alternative/supplement to FireCrawl for more complex scraping.

- **Self-hosted:** Run as a Docker container on Hetzner
- **GitHub:** https://github.com/unclecode/crawl4ai
- **No API key needed** (self-hosted)

### Usage (via REST API when self-hosted)
```typescript
const response = await fetch("http://localhost:11235/crawl", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    urls: ["https://candidate-website.com/issues"],
    extraction_config: {
      type: "llm",
      instruction: "Extract all political positions and policy stances"
    }
  })
});
```

---

## 9. Puppeteer

**Purpose:** Fallback browser automation for JS-heavy sites that FireCrawl/Crawl4AI can't render.

- **Self-hosted:** Run as part of the Next.js app or as a separate service
- **No API key needed**
- **Package:** `puppeteer` or `puppeteer-core` with Chromium

### Usage
```typescript
import puppeteer from "puppeteer";

async function scrapeCampaignSite(url: string): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  const content = await page.evaluate(() => document.body.innerText);
  await browser.close();
  return content;
}
```

---

## Rate Limit Summary

| API | Free Tier Limit | Strategy |
|-----|----------------|----------|
| Congress.gov | 5,000 req/hour | Cache aggressively (6hr TTL), batch requests |
| LegiScan | 30,000 req/month | Cache results, only fetch new/updated bills |
| Open States v3 | ~100 req/min | Cache rep data (12hr TTL) |
| FEC.gov | 1,000 req/hour | Cache financial data (24hr TTL) |
| OpenRouter | Pay-per-token | Use cheaper models for simple tasks, cache AI outputs |
| SerpAPI | 100 req/month (free) | Cache search results, be selective about queries |
| FireCrawl | 500 pages (free) | Self-host for unlimited, or cache scraped content |

### Redis Caching Pattern
```typescript
async function cachedFetch<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}
```
