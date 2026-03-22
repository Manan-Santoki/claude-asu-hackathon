# Demo Mode — CitizenOS Hackathon Showstopper

## The Big Idea

A single **"Try Demo"** button that launches a cinematic, guided walkthrough of CitizenOS through the eyes of 4 real-world personas. Instead of explaining what the app does, the demo *shows* it — auto-navigating pages, typing questions in chat, highlighting impact panels, and revealing how the same government action affects different people completely differently.

The wow moment: a judge or viewer picks a persona, and the entire app comes alive — navigating itself, showing personalized content, typing AI questions, and revealing how government affects *that specific person*. Then they switch to another persona and see the SAME actions through completely different eyes.

---

## Demo Flow — The 30-Second Pitch Version

```
[Try Demo] → Email capture → Pick a persona → App auto-pilots through 6 features
                                                    ↓
                              Narrator bar explains everything in real-time
                                                    ↓
                              "Now pick a DIFFERENT persona and see the difference"
                                                    ↓
                              CTA: "Ready to see what affects YOU? Sign up."
```

---

## The 4 Personas (Research-Backed)

Each persona represents a real demographic that government actions in 2025-2026 heavily impact. These are chosen because the mock data already contains actions targeting them.

### 1. Priya Sharma — H-1B Visa Holder

| Field | Value |
|-------|-------|
| **Name** | Priya Sharma |
| **Age** | 28 |
| **Role** | Software Engineer at a mid-size startup |
| **Location** | San Jose, CA |
| **Visa** | H-1B (employer-sponsored) |
| **Persona Tags** | `visa_holder`, `student` (former F-1) |
| **Issue Categories** | `immigration`, `labor`, `technology` |
| **Backstory** | Came to the US on an F-1 for her MS at ASU, converted to H-1B. Her employer is a 40-person startup that barely afforded the original filing fees. The $100K supplemental fee proclamation is existential for her career. |
| **Color/Theme** | Indigo / Globe icon |

**Why this persona hits hard:** The H-1B $100K fee is one of the most discussed 2025 immigration actions. Every hackathon judge at ASU will have students or colleagues affected. It's already in the mock data with legal challenges, timeline, and persona-specific impact text.

---

### 2. Marcus Rivera — Gig Worker

| Field | Value |
|-------|-------|
| **Name** | Marcus Rivera |
| **Age** | 34 |
| **Role** | Rideshare driver + food delivery (Uber, DoorDash) |
| **Location** | Austin, TX |
| **Status** | US Citizen, no health insurance through employer |
| **Persona Tags** | `gig_worker` |
| **Issue Categories** | `labor`, `healthcare`, `economy`, `tax` |
| **Backstory** | Left a warehouse job for the flexibility of gig work. Now drives 50 hours/week but has no benefits, no unemployment insurance, and his car maintenance costs are rising due to tariffs on auto parts. He needs to understand worker classification rules, healthcare options, and how trade policy hits his wallet. |
| **Color/Theme** | Amber / Briefcase icon |

**Why this persona hits hard:** Gig economy is massive and growing. Tariff executive orders, worker classification rules, and ACA changes all directly affect this demographic. Shows the breadth of CitizenOS beyond just immigration.

---

### 3. Sofia Chen — College Student

| Field | Value |
|-------|-------|
| **Name** | Sofia Chen |
| **Age** | 21 |
| **Role** | Junior at ASU, Computer Science major |
| **Location** | Tempe, AZ |
| **Status** | US Citizen, first-generation college student |
| **Persona Tags** | `student` |
| **Issue Categories** | `education`, `economy`, `healthcare`, `technology` |
| **Backstory** | $47K in student loans. Works part-time at a campus lab funded by a federal research grant. Heard about DOGE cuts to university funding but doesn't know if her job is safe. Wants to vote in the next election but doesn't know which candidates actually align with her values. |
| **Color/Theme** | Emerald / GraduationCap icon |

**Why this persona hits hard:** ASU hackathon. The judges are AT a university. Student debt, education funding cuts, and first-time voter engagement are universally relatable to the audience.

---

### 4. Bob Mitchell — Small Business Owner

| Field | Value |
|-------|-------|
| **Name** | Bob Mitchell |
| **Age** | 52 |
| **Role** | Owns a family restaurant (22 employees) |
| **Location** | Columbus, OH |
| **Status** | US Citizen, veteran (Army, 8 years) |
| **Persona Tags** | `small_business`, `veteran` |
| **Issue Categories** | `economy`, `healthcare`, `tax`, `veterans`, `labor` |
| **Backstory** | Opened his restaurant 15 years ago after leaving the Army. Steel tariffs raised his equipment costs. The Affordable Insulin Act matters because 3 of his employees are diabetic and insurance premiums are climbing. He wants to know how his Ohio reps voted and whether he should call them. |
| **Color/Theme** | Rose / Store icon |

**Why this persona hits hard:** Small business + veteran = bipartisan appeal. Tariffs, healthcare costs, and representative accountability are tangible, pocketbook issues. The "generate email to your rep" feature gets a natural showcase.

---

## Feature Showcase Map — What Each Persona Demonstrates

| Feature | Priya (H-1B) | Marcus (Gig) | Sofia (Student) | Bob (Biz Owner) |
|---------|:---:|:---:|:---:|:---:|
| **USA Map** (state click) | CA | TX | AZ | OH |
| **Actions Tracker** (browse/filter) | -- | -- | -- | -- |
| **Action Detail** (H-1B fee) | **PRIMARY** | -- | -- | -- |
| **Action Impact** (persona view) | **PRIMARY** | -- | -- | -- |
| **Action Chat** (ask a question) | **PRIMARY** | -- | -- | -- |
| **Legal Challenges** | **PRIMARY** | -- | -- | -- |
| **BillBreaker** (browse bills) | -- | -- | -- | **PRIMARY** |
| **Bill Detail** (Insulin Act) | -- | -- | -- | **PRIMARY** |
| **Bill Impact** (persona) | -- | -- | -- | **PRIMARY** |
| **RepScore** (browse reps) | -- | **PRIMARY** | -- | -- |
| **Rep Detail** (voting record) | -- | **PRIMARY** | -- | -- |
| **Contact Rep** (email gen) | -- | -- | -- | **PRIMARY** |
| **VoteMap Quiz** (policy quiz) | -- | -- | **PRIMARY** | -- |
| **Candidate Match** (results) | -- | -- | **PRIMARY** | -- |
| **Candidate Compare** | -- | -- | **PRIMARY** | -- |
| **Personalized Feed** | -- | **PRIMARY** | -- | -- |

Each persona has a PRIMARY feature spotlight (deep dive) + passes through 2-3 others (quick glance), ensuring every major module gets showcased across the 4 personas.

---

## Detailed Demo Sequences

### Persona 1: Priya Sharma — "How a proclamation changed my career"

**Focus:** Government Actions Tracker (the newest, most differentiating feature)

| Step | Page/Action | What Happens on Screen | Narrator Text |
|------|------------|----------------------|---------------|
| 1 | **Map `/`** | Map loads. California pulses/highlights. Auto-click on CA. State panel slides open showing "Actions" tab. | *"Priya is a software engineer in San Jose. Let's see what government actions affect her."* |
| 2 | **Actions tab** | State panel shows filtered actions for CA. The H-1B $100K Fee proclamation card is highlighted with a glow. Auto-click on it. | *"This proclamation changed everything for H-1B workers overnight — no Congressional vote needed."* |
| 3 | **Action Detail `/action/act-1`** | Page loads. AI Summary section auto-scrolls into view. Key phrases highlight: "$100,000", "F-1 students EXEMPT", "employers must pay". | *"CitizenOS breaks down legal jargon into plain English. Every action gets an AI-powered summary."* |
| 4 | **Impact Panel** | Persona selector shows. "Visa Holder" chip auto-selects with an animated click. Impact text typewriter-animates in. Then "Student" chip also selects, showing the F-1 exemption angle. | *"Same action, different impact. As a visa holder, Priya faces the $100K fee. But as a former F-1 student who changed status in the US — she's exempt."* |
| 5 | **Legal Challenges** | Section scrolls into view. Two court case cards animate in. Status badges pulse: "Upheld", "Pending". | *"Is this action being challenged in court? CitizenOS tracks every lawsuit so you know if relief is coming."* |
| 6 | **Action Chat** | Chat panel opens. A question auto-types: "Does this fee apply if I'm extending my existing H-1B?" Send button clicks. AI response streams in. | *"Don't understand something? Ask in plain English. CitizenOS answers using the actual text of the action."* |

**Transition:** *"That was Priya's world. Now let's see what government looks like for someone completely different..."*

---

### Persona 2: Marcus Rivera — "What my reps are doing about gig work"

**Focus:** RepScore + Personalized Action Feed

| Step | Page/Action | What Happens on Screen | Narrator Text |
|------|------------|----------------------|---------------|
| 1 | **Map `/`** | Map color mode switches to "Party Control". Texas highlights. Auto-click TX. State panel shows "Reps" tab. | *"Marcus drives for Uber in Austin. He wants to know: are his representatives fighting for gig workers?"* |
| 2 | **RepScore `/reps`** | Navigate to full RepScore dashboard. Filter auto-sets to Texas. Rep cards load. One rep card highlights — shows accountability score gauge. | *"RepScore tracks every representative's voting record, campaign promises, and accountability."* |
| 3 | **Rep Detail `/rep/:id`** | Auto-click a TX rep. Detail page loads. Score gauges animate (promise alignment, party loyalty, attendance). Voting record scrolls. | *"This rep promised to protect gig workers but voted against the Worker Classification Act. Promise alignment: 34%."* |
| 4 | **Actions Feed** | Navigate to `/actions`. Filter auto-sets: persona = "Gig Worker". Relevant actions appear: worker classification rules, ACA changes, tariff EOs affecting auto parts. | *"Marcus doesn't just care about bills. Executive orders and agency rules affect his daily life — tariffs raising auto parts, healthcare rule changes, worker classification."* |
| 5 | **Action Detail** | Auto-click on a tariff EO. Impact panel shows "Gig Worker" impact: increased vehicle maintenance costs. | *"A tariff executive order means Marcus pays 15% more for replacement tires and brake pads. No one voted on this."* |
| 6 | **Bill Chat** | Navigate to a worker classification bill. Chat auto-types: "Am I considered an employee or independent contractor under this bill?" Response streams. | *"Marcus asks the question every gig worker wants answered. CitizenOS gives him a straight answer."* |

**Transition:** *"Marcus needs to understand policy to protect his income. Sofia needs it to cast her first informed vote..."*

---

### Persona 3: Sofia Chen — "Finding my candidate match"

**Focus:** VoteMap (Policy Quiz + Candidate Matching)

| Step | Page/Action | What Happens on Screen | Narrator Text |
|------|------------|----------------------|---------------|
| 1 | **Map `/`** | Map switches to "Civic Engagement" color mode. Arizona highlights. Click AZ. State panel opens showing bills about education. | *"Sofia is a junior at ASU with $47K in student loans. She's voting for the first time — but for who?"* |
| 2 | **BillBreaker** | Navigate to a student loan relief bill. AI summary shows. Impact panel auto-selects "Student": specific savings amount, eligibility. | *"First, Sofia sees what's actually happening. This bill would forgive $20K for students working in public service. Her campus lab job counts."* |
| 3 | **VoteMap `/vote`** | Navigate to VoteMap. Quiz starts. Answers auto-fill one by one with smooth animations — each slider moves to Sofia's position. Progress bar fills. | *"Now the big question: which candidates actually match Sofia's values? 10 quick policy questions."* |
| 4 | **Quiz Q&A** | Show 3-4 questions animating: Immigration (slightly left), Education (strongly left), Economy (center), Climate (strongly left). Each answer has a brief flash showing the policy axis. | *"Sofia cares most about education funding and climate. She's moderate on the economy. Each answer maps to a policy axis."* |
| 5 | **Results** | Quiz submits. Match results animate in. Top match: 87% alignment. Radar chart draws itself axis by axis. Match cards rank by score. | *"87% match. The radar chart shows exactly where they agree and disagree. No more guessing."* |
| 6 | **Candidate Compare** | Two candidates auto-select for comparison. Side-by-side view loads. Radar charts overlay. Funding sources, controversy flags visible. | *"Compare side-by-side. Who's funded by small donors vs PACs? Any controversy flags? Make an informed choice."* |

**Transition:** *"Sofia found her candidate. Now meet Bob — a veteran and business owner who just wants to know one thing: did his rep keep their promises?"*

---

### Persona 4: Bob Mitchell — "Holding my rep accountable"

**Focus:** BillBreaker + RepScore Contact Feature

| Step | Page/Action | What Happens on Screen | Narrator Text |
|------|------------|----------------------|---------------|
| 1 | **Map `/`** | Ohio highlights. Click OH. State panel shows Bills tab. The Affordable Insulin Act card appears (relevant to OH). | *"Bob owns a restaurant in Columbus. Three of his employees are diabetic. He heard about an insulin bill but doesn't know the details."* |
| 2 | **Bill Detail `/bill/hr-1234`** | Navigate to Affordable Insulin Now Act. AI summary loads. Key numbers highlight: "$35 cap", "7.4 million Americans", "$800/year savings". | *"BillBreaker turns 47 pages of legislation into 4 sentences. $35 insulin cap. $800 saved per employee per year."* |
| 3 | **Bill Impact** | Persona selector: "Small Business Owner" auto-selects. Impact text shows: lower group plan premiums, 1-3% savings. Then "Veteran" selects showing Bob's VA angle. | *"As a business owner, Bob saves on insurance. As a veteran, he already has VA pricing. CitizenOS shows BOTH angles."* |
| 4 | **Impact Story** | Impact story section scrolls into view. The narrative about Maria in Phoenix typewriter-animates. Emotional, specific, real. | *"Every bill has an Impact Story — a real scenario showing who this affects and how. This is Maria. She spends $297/month on insulin."* |
| 5 | **RepScore `/rep/:id`** | Navigate to Bob's OH rep. Voting record shows: this rep voted NO on the Insulin Act. Promise tracker shows: "Promised to lower healthcare costs" — status: BROKEN. | *"Bob's rep promised to lower healthcare costs but voted NO on the insulin bill. Promise status: Broken."* |
| 6 | **Contact Rep** | Contact form opens. Bill auto-selects. Concern field auto-types: "My employees can't afford insulin." AI generates a full email. Preview shows. | *"One click. CitizenOS drafts a personalized email to Bob's representative, citing the specific bill and his specific concern."* |

**Final CTA:** *"Four people. Four completely different lives. One platform that shows each of them exactly how government affects THEM. Ready to see yours?"*

---

## UI Architecture

### Component Tree

```
App.tsx
├── Header.tsx
│   └── [Try Demo] button (glowing, animated)
│
├── DemoOverlay (portal, renders above everything)
│   ├── DemoEmailCapture        — Step 0: optional email
│   ├── DemoPersonaPicker       — Step 1: choose a persona
│   ├── DemoNarratorBar         — Bottom bar with text + controls
│   ├── DemoSpotlight           — Dims everything except target element
│   ├── DemoAutoTyper           — Types text into inputs/chat
│   └── DemoProgressRail        — Top rail showing step progress
│
└── (existing app routes — demo navigates through them)
```

### New Files

```
citizenos/src/
├── components/
│   └── demo/
│       ├── DemoButton.tsx            # The "Try Demo" trigger button
│       ├── DemoOverlay.tsx           # Root overlay container (portal)
│       ├── DemoEmailCapture.tsx      # Email capture modal
│       ├── DemoPersonaPicker.tsx     # 4-persona selection screen
│       ├── DemoNarratorBar.tsx       # Bottom narrator with controls
│       ├── DemoSpotlight.tsx         # CSS spotlight/highlight effect
│       ├── DemoAutoTyper.tsx         # Typewriter text component
│       ├── DemoProgressRail.tsx      # Step indicator at top
│       └── DemoCTA.tsx              # Final call-to-action screen
├── stores/
│   └── useDemoStore.ts              # Demo state management
├── lib/
│   └── demoScripts.ts              # All 4 persona sequences defined here
```

### State Management — `useDemoStore.ts`

```typescript
interface DemoState {
  // Mode
  isActive: boolean               // Is demo mode on?
  phase: 'email' | 'picker' | 'playing' | 'cta'

  // Persona
  selectedPersona: DemoPersona | null
  completedPersonas: string[]     // IDs of personas already viewed

  // Sequence playback
  currentStepIndex: number
  totalSteps: number
  isAutoPlaying: boolean          // Auto-advance vs manual
  playbackSpeed: 'normal' | 'fast'

  // Spotlight
  spotlightTarget: string | null  // CSS selector of element to highlight
  narratorText: string            // Current narrator message

  // Email
  capturedEmail: string | null

  // Actions
  startDemo: () => void
  exitDemo: () => void
  selectPersona: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  toggleAutoPlay: () => void
  setSpotlight: (selector: string | null) => void
  setNarrator: (text: string) => void
  captureEmail: (email: string) => void
  switchPersona: () => void       // Go back to picker
}
```

### Demo Script Format — `demoScripts.ts`

```typescript
interface DemoPersona {
  id: string
  name: string
  age: number
  role: string
  location: string
  stateCode: string
  avatar: string                  // Emoji or illustration URL
  color: string                   // Theme color (tailwind class)
  icon: string                    // Lucide icon name
  tags: string[]                  // Persona tags
  categories: string[]            // Issue categories
  backstory: string               // 2-sentence intro
  steps: DemoStep[]
}

interface DemoStep {
  id: string
  // Navigation
  route?: string                  // Navigate to this route
  delay?: number                  // Wait before executing (ms)

  // UI actions
  spotlight?: string              // CSS selector to highlight
  click?: string                  // CSS selector to auto-click
  type?: {                        // Auto-type into an input
    selector: string
    text: string
    speed?: number                // ms per character
  }
  scroll?: string                 // CSS selector to scroll into view
  mapAction?: {                   // Map-specific actions
    highlightState?: string
    clickState?: string
    colorMode?: string
  }
  storeAction?: {                 // Trigger store mutations
    store: string
    method: string
    args: any[]
  }

  // Narrator
  narrator: string                // Text shown in narrator bar
  narratorDuration?: number       // How long to show (ms), default 4000

  // Timing
  autoAdvanceAfter?: number       // Auto-advance to next step after N ms
}
```

---

## Visual Design

### Demo Button (Header)

```
┌─────────────────────────────────────────────────────────────────┐
│ CitizenOS    Map  BillBreaker  RepScore  Actions  VoteMap       │
│                                                                 │
│                               ╭──────────────╮                  │
│                               │ ▶ Try Demo   │  ← pulsing glow │
│                               ╰──────────────╯     (amber)     │
│                                                  Login  [☀]     │
└─────────────────────────────────────────────────────────────────┘
```

- Amber/gold gradient background with subtle pulse animation
- `▶` play icon
- Positioned between spacer and search bar
- On mobile: full-width banner below header

### Email Capture Modal

```
╭─────────────────────────────────────────────╮
│                                             │
│        🇺🇸  Welcome to CitizenOS            │
│                                             │
│   See how government affects real people    │
│   through an interactive guided demo.       │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │  Enter your email (optional)        │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │        ▶  Start Demo                │   │
│   └─────────────────────────────────────┘   │
│                                             │
│              Skip, just show me →           │
│                                             │
╰─────────────────────────────────────────────╯
```

- Frosted glass backdrop
- Single email field — no name, no password, minimal friction
- Stored in localStorage or sent to InsForge

### Persona Picker (Full-Screen)

```
╭──────────────────────────────────────────────────────────────────────╮
│                                                                      │
│              Who do you want to be?                                  │
│              Pick a persona to see CitizenOS through their eyes.     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  │    🌐         │  │    💼         │  │    🎓         │  │    🏪         │
│  │              │  │              │  │              │  │              │
│  │ Priya Sharma │  │Marcus Rivera │  │  Sofia Chen  │  │Bob Mitchell  │
│  │              │  │              │  │              │  │              │
│  │  H-1B Visa   │  │  Gig Worker  │  │   Student    │  │ Biz Owner +  │
│  │  Holder      │  │  Austin, TX  │  │   ASU, AZ    │  │ Veteran, OH  │
│  │  San Jose,CA │  │              │  │              │  │              │
│  │              │  │  "How do     │  │ "Who should  │  │ "Did my rep  │
│  │ "Will I lose │  │  tariffs hit │  │  I vote      │  │  keep their  │
│  │  my visa?"   │  │  my wallet?" │  │  for?"       │  │  promises?"  │
│  │              │  │              │  │              │  │              │
│  │  [Start →]   │  │  [Start →]   │  │  [Start →]   │  │  [Start →]   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
│                                                                      │
│                    [ ▶ Watch All Four (Auto-Play) ]                   │
│                                                                      │
╰──────────────────────────────────────────────────────────────────────╯
```

- Each card has the persona's theme color as a border/accent
- Hover: card lifts with shadow, background shifts to persona color
- Quote at bottom of each card is the persona's burning question
- "Watch All Four" auto-plays all 4 in sequence (for hands-off demo to judges)

### Narrator Bar (During Playback)

```
┌──────────────────────────────────────────────────────────────────────┐
│  EXISTING APP UI (dimmed slightly when spotlight is active)          │
│                                                                      │
│  ┌─────────────────────────────────────────────┐                     │
│  │  SPOTLIGHTED ELEMENT (full brightness)      │ ← highlighted      │
│  └─────────────────────────────────────────────┘                     │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ ▍                                                                    │
│ ▍  🌐 Priya Sharma                                   Step 3 of 6    │
│ ▍                                                                    │
│ ▍  "CitizenOS breaks down legal jargon into plain     ◀  ▶▶  ▶  ✕  │
│ ▍   English. Every action gets an AI-powered summary."               │
│ ▍                                                    [Auto] [Speed]  │
│ ▍                                                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ←progress bar  │
└──────────────────────────────────────────────────────────────────────┘
```

- Fixed to bottom of screen, ~120px tall
- Left border color = persona theme color
- Persona avatar + name on the left
- Narrator text center (typewriter animation)
- Controls on right: Previous, Play/Pause, Next, Exit
- Auto/Manual toggle + Speed toggle
- Progress bar at very bottom

### Spotlight Effect

- CSS `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` on target element
- Target gets `position: relative; z-index: 10001`
- Smooth transition when spotlight moves between elements
- Optional pulse animation on spotlighted element

### Demo Progress Rail (Top)

```
━━━━━●━━━━━━━━━━●━━━━━━━━━━●━━━━━━━━━━○━━━━━━━━━━○━━━━━━━━━━○━━
     Map      Actions    Impact      Legal     Chat       Done
                          Panel    Challenges
```

- Thin rail below the header
- Dots for each step, filled = completed, hollow = upcoming, large = current
- Labels appear on hover

### Final CTA Screen

```
╭──────────────────────────────────────────────────────────────────╮
│                                                                  │
│                    You just saw CitizenOS through                │
│                    Priya's eyes.                                 │
│                                                                  │
│     The same platform. Four completely different experiences.     │
│                                                                  │
│     ┌───────────────────────────────────────────────────────┐    │
│     │                                                       │    │
│     │   🌐 Priya  ✓     💼 Marcus       🎓 Sofia           │    │
│     │                    🏪 Bob                             │    │
│     │                                                       │    │
│     │   [ Try Another Persona ]                             │    │
│     │                                                       │    │
│     └───────────────────────────────────────────────────────┘    │
│                                                                  │
│                         — or —                                   │
│                                                                  │
│     ┌───────────────────────────────────────────────────────┐    │
│     │          Ready to see what affects YOU?               │    │
│     │                                                       │    │
│     │          [ Sign Up — It's Free ]                      │    │
│     │                                                       │    │
│     └───────────────────────────────────────────────────────┘    │
│                                                                  │
│                    [ Exit Demo ]                                 │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯
```

---

## Technical Architecture

### How Auto-Navigation Works

The demo engine uses `react-router-dom`'s `useNavigate()` to programmatically navigate between pages. Each step in the script can specify a `route` to navigate to.

```
DemoEngine (custom hook)
│
├── Reads current step from useDemoStore
├── On step change:
│   ├── navigate(step.route) if route specified
│   ├── setTimeout → spotlight(step.spotlight)
│   ├── setTimeout → autoType(step.type) if typing step
│   ├── setTimeout → click(step.click) if click step
│   └── setTimeout → autoAdvance if autoPlaying
│
└── Listens for manual next/prev from narrator controls
```

### How Spotlight Works

```typescript
// DemoSpotlight.tsx
// Uses a CSS approach: a full-screen overlay with a "hole" cut out

function DemoSpotlight({ targetSelector }: { targetSelector: string | null }) {
  // 1. Find the target element by CSS selector
  // 2. Get its bounding rect
  // 3. Render a full-screen overlay with clip-path that excludes the target rect
  // 4. Add a glowing border around the target
  // 5. Smooth transition when target changes (CSS transition on clip-path)
}
```

### How Auto-Typing Works

```typescript
// DemoAutoTyper.tsx
// Types text character by character into a target input/textarea

function useAutoTyper() {
  return async (selector: string, text: string, speed = 50) => {
    const el = document.querySelector(selector) as HTMLInputElement
    if (!el) return

    el.focus()
    for (let i = 0; i <= text.length; i++) {
      // Set value character by character
      // Dispatch input events so React state updates
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set
      nativeInputValueSetter?.call(el, text.slice(0, i))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await sleep(speed)
    }
  }
}
```

### How Store Injection Works

During demo mode, certain store actions are pre-configured:
- Auth store is set with the persona's profile (state, personas, categories)
- When navigating to a bill/action detail, the store is pre-loaded with the target item
- Chat responses are pre-scripted (no real AI call needed during demo)

```typescript
// In demoScripts.ts, each step can trigger store mutations:
{
  storeAction: {
    store: 'auth',
    method: 'setDemoProfile',
    args: [{ stateCode: 'CA', personas: ['visa_holder'], categories: ['immigration'] }]
  }
}
```

### Demo-Aware Components

Some components need to behave differently during demo:

| Component | Normal Behavior | Demo Behavior |
|-----------|----------------|---------------|
| `BillChat` / `ActionChat` | Calls mock API, waits for response | Uses pre-scripted responses, streams faster |
| `PersonaSelector` | Waits for user click | Auto-selects persona chips with animation |
| `PolicyQuiz` | Waits for user to move sliders | Auto-animates slider positions |
| `ContactRep` | Waits for user to type concern | Auto-fills concern text |
| `USAMap` | Waits for state click | Auto-highlights and clicks states |
| `Header` | Shows Login button | Shows "Exit Demo" + persona badge |

Check `useDemoStore.isActive` to branch behavior:

```typescript
const isDemo = useDemoStore(s => s.isActive)

// In a component:
useEffect(() => {
  if (isDemo && shouldAutoSelect) {
    // Auto-select this persona chip after a delay
    setTimeout(() => handleSelect('visa_holder'), 800)
  }
}, [isDemo])
```

---

## Data Flow During Demo

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ DemoButton   │────▶│ useDemoStore │────▶│ DemoEngine     │
│ (trigger)    │     │ (state)      │     │ (orchestrator) │
└─────────────┘     └──────────────┘     └────────────────┘
                           │                      │
                           │                      ├── useNavigate()
                           │                      ├── spotlight()
                           │                      ├── autoType()
                           │                      └── storeInject()
                           │
                    ┌──────┴──────────────────────────────┐
                    │         Existing App Stores          │
                    ├── useAuthStore (demo profile)        │
                    ├── useBillStore (pre-load bill)       │
                    ├── useActionStore (pre-load action)   │
                    ├── useRepStore (pre-load rep)         │
                    ├── useQuizStore (pre-fill answers)    │
                    └── useMapStore (highlight state)      │
                                                          │
                    ┌─────────────────────────────────────┘
                    │
              ┌─────┴──────┐
              │ Existing   │
              │ UI renders │
              │ normally   │
              └────────────┘
```

The key insight: **the demo doesn't render fake UI**. It drives the REAL app by injecting state and triggering navigation. The viewer sees the actual product working.

---

## Edge Cases & Polish

### Keyboard Shortcuts (During Demo)
- `→` or `Space`: Next step
- `←`: Previous step
- `Escape`: Exit demo
- `P`: Toggle auto-play
- `1-4`: Jump to persona

### Mobile Support
- Narrator bar becomes a bottom sheet (60% height)
- Persona picker becomes a vertical scrollable list
- Spotlight still works (uses viewport-relative positioning)
- Auto-typing speed reduced for readability

### Resume & Skip
- If viewer closes browser, localStorage saves `{ lastPersona, lastStep }`
- "Skip to End" button in narrator controls
- "Skip This Persona" to jump to next persona in auto-play-all mode

### Analytics Events (Optional)
```typescript
// Track for hackathon metrics
trackDemoEvent('demo_started', { email: capturedEmail })
trackDemoEvent('persona_selected', { persona: 'priya' })
trackDemoEvent('step_viewed', { persona: 'priya', step: 3 })
trackDemoEvent('demo_completed', { persona: 'priya', duration: 45000 })
trackDemoEvent('signup_from_demo', { email })
```

### Preventing Demo State Leakage
- On demo exit, call `resetDemoState()` which:
  - Clears injected auth profile
  - Resets all stores to initial state
  - Navigates back to `/`
  - Removes demo CSS classes
  - Clears demo localStorage (except email)

---

## Implementation Priority

### Phase 1 — MVP (Hackathon Night)
1. `useDemoStore.ts` — state management
2. `DemoButton.tsx` — trigger in header
3. `DemoPersonaPicker.tsx` — persona selection
4. `DemoNarratorBar.tsx` — narrator with controls
5. `demoScripts.ts` — Priya's sequence only (6 steps)
6. `DemoEngine` hook — navigation + narrator text
7. Basic spotlight (just narrator + navigation, no fancy overlay)

### Phase 2 — Polish
8. `DemoSpotlight.tsx` — CSS spotlight effect
9. `DemoAutoTyper.tsx` — typewriter for chat/inputs
10. All 4 persona sequences in `demoScripts.ts`
11. `DemoEmailCapture.tsx` — email modal
12. `DemoProgressRail.tsx` — step indicator
13. "Watch All Four" auto-play mode
14. `DemoCTA.tsx` — final call-to-action

### Phase 3 — Extra
15. Demo-aware component patches (auto-select personas, auto-quiz)
16. Keyboard shortcuts
17. Mobile narrator bottom sheet
18. Resume from localStorage
19. Analytics events

---

## Why This Will Win

1. **No other civic tech demo is interactive.** Every competitor will have slides or a static walkthrough. CitizenOS will drive itself.

2. **The persona contrast is the story.** Showing the SAME action (H-1B fee) through a visa holder's eyes vs a small business owner's eyes — that's the "aha" moment that makes judges remember you.

3. **It proves the product works.** The demo drives the REAL app. It's not a mockup or a video. The judge can interrupt the demo, click around, and explore — and the app keeps working.

4. **Email capture = leads.** Even at a hackathon, capturing judge/viewer emails shows business thinking.

5. **"Watch All Four" is a hands-off mode.** Set it up on a laptop at a booth, walk away, and it sells itself.

6. **It showcases EVERY feature.** The 4 personas collectively touch: Map, Actions Tracker, BillBreaker, RepScore, VoteMap, Chat, Impact Analysis, Legal Challenges, Contact Rep, Candidate Compare, and the Personalized Feed. Nothing is left out.

---

## Post-Demo: Live Email Alerts (The Second Wow Moment)

The demo doesn't end when the walkthrough finishes. The email the viewer entered at the start becomes a **live subscription** — they receive real, personalized email alerts as if they *are* the persona they chose.

### The Concept

After the demo completes:
1. The viewer's email is stored in InsForge DB, linked to the persona they watched
2. A background pipeline monitors real government actions (bills passing, EOs signed, court rulings)
3. When something relevant happens, an InsForge edge function sends a **personalized email** to every demo subscriber
4. The email is written *as if to that persona* — "Hi Priya, a bill that affects your H-1B status just passed..."
5. The email includes real news articles sourced via TinyFish API
6. A "Chat about this" CTA in the email links back to CitizenOS where they can ask questions

This turns a 2-minute demo into a **persistent relationship**. A judge who watched the demo on Friday gets an email Monday morning saying "Hi Priya — the court just ruled on the H-1B fee case. Here's what it means for you." That's unforgettable.

### Database Schema — `demo_subscriptions`

```sql
CREATE TABLE demo_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Subscriber
  email TEXT NOT NULL,
  persona_id TEXT NOT NULL,           -- 'priya' | 'marcus' | 'sofia' | 'bob'
  persona_name TEXT NOT NULL,         -- 'Priya Sharma'

  -- Persona profile (copied from demo persona definition)
  persona_tags TEXT[],                -- ['visa_holder', 'student']
  persona_categories TEXT[],          -- ['immigration', 'labor', 'technology']
  persona_state TEXT,                 -- 'CA'

  -- Subscription state
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  emails_sent INT DEFAULT 0,

  -- Prevent duplicates
  UNIQUE(email, persona_id)
);

-- Track which actions have been emailed to avoid duplicates
CREATE TABLE demo_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES demo_subscriptions(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,            -- Which bill/action triggered the email
  action_type TEXT NOT NULL,          -- 'bill', 'proclamation', 'executive_order', etc.
  email_subject TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened BOOLEAN DEFAULT false,       -- Track open rates (pixel tracking)
  clicked BOOLEAN DEFAULT false,      -- Track CTA clicks

  UNIQUE(subscription_id, action_id)  -- One email per action per subscriber
);
```

### TinyFish API Integration — Real News & Articles

TinyFish is used to scrape real, current news articles about government actions. This makes emails feel alive and credible — not just "we generated this with AI."

#### TinyFish Scraping Targets

| Source | What We Scrape | Why |
|--------|---------------|-----|
| **Reuters** | H-1B news, tariff updates, policy changes | Credible, non-partisan, well-structured |
| **AP News** | Bill passage, executive order coverage | Wire service = first to report |
| **Congress.gov** | Bill status changes (introduced → passed) | Authoritative source of truth |
| **Federal Register** | New EOs, proclamations, rules published | Official government gazette |
| **SCOTUSblog / CourtListener** | Court rulings on challenged actions | Legal challenge resolution |
| **University news** (ASU, etc.) | Education funding, research grant impacts | Relevant to student persona |

#### TinyFish API Usage

```typescript
// lib/tinyfish.ts

const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY  // Server-side only (edge function)
const TINYFISH_BASE = 'https://api.tinyfish.ai/v1'

interface TinyFishArticle {
  url: string
  title: string
  source: string           // 'Reuters', 'AP News', etc.
  published_at: string
  snippet: string           // First 200 chars of article
  image_url?: string
  relevance_score: number   // TinyFish scoring
}

// Scrape news articles related to a government action
async function fetchRelatedArticles(query: string, limit = 5): Promise<TinyFishArticle[]> {
  const res = await fetch(`${TINYFISH_BASE}/scrape`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TINYFISH_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      sources: ['reuters.com', 'apnews.com', 'congress.gov', 'federalregister.gov'],
      limit,
      recency: '7d',       // Last 7 days
      fields: ['title', 'url', 'snippet', 'published_at', 'image_url'],
    }),
  })
  return res.json()
}
```

#### Example: Scrape Query Per Persona

| Persona | Action Trigger | TinyFish Query |
|---------|---------------|----------------|
| Priya (H-1B) | Court ruling on H-1B fee | `"H-1B supplemental fee court ruling 2026"` |
| Priya (H-1B) | New USCIS rule published | `"USCIS H-1B rule change 2026"` |
| Marcus (Gig) | Worker classification bill passes | `"gig worker classification bill Congress"` |
| Marcus (Gig) | Tariff EO on auto parts | `"tariff auto parts executive order impact"` |
| Sofia (Student) | Student loan bill committee hearing | `"student loan relief bill hearing 2026"` |
| Sofia (Student) | DOGE education cuts | `"DOGE university research funding cuts"` |
| Bob (Biz Owner) | Insulin Act vote in Senate | `"Affordable Insulin Act Senate vote"` |
| Bob (Biz Owner) | OH rep voting record news | `"Ohio representative healthcare vote"` |

### Email Template Design

Each email is persona-aware, action-specific, and includes real news sources.

#### Email Structure

```
From: CitizenOS Alerts <alerts@citizenos.app>
To: judge@example.com
Subject: Priya, the H-1B fee just got upheld in court — here's what it means

─────────────────────────────────────────────

  CitizenOS                    [View on web →]

─────────────────────────────────────────────

  Hi Priya,

  A court ruling just dropped that directly affects
  your H-1B status.

  ┌─────────────────────────────────────────┐
  │ ⚖ COURT RULING                          │
  │                                         │
  │ ITServe Alliance v. DHS                 │
  │ D.C. District Court                     │
  │                                         │
  │ The $100,000 H-1B supplemental fee has  │
  │ been UPHELD. The court ruled the        │
  │ President has authority to set visa fees │
  │ under INA §212(f).                      │
  │                                         │
  │ Appeal pending in D.C. Circuit.         │
  └─────────────────────────────────────────┘

  WHAT THIS MEANS FOR YOU (Visa Holder):

  Your employer's $100K per-petition cost is now
  confirmed. If you're currently on F-1 and planning
  to switch to H-1B, do it while you're in the US —
  the change-of-status exemption still holds.

  ┌─────────────────────────────────────────┐
  │ 📰 IN THE NEWS                          │
  │                                         │
  │ Reuters · 2 hours ago                   │
  │ "Federal judge upholds $100K H-1B fee,  │
  │  tech industry vows appeal"             │
  │ [Read article →]                        │
  │                                         │
  │ AP News · 5 hours ago                   │
  │ "H-1B fee ruling: What visa holders     │
  │  need to know"                          │
  │ [Read article →]                        │
  │                                         │
  │ The Hindu · 3 hours ago                 │
  │ "Impact on Indian IT workers: $100K     │
  │  fee here to stay, for now"             │
  │ [Read article →]                        │
  └─────────────────────────────────────────┘

  ┌─────────────────────────────────────────┐
  │ 💬 Have questions?                       │
  │                                         │
  │ Chat with CitizenOS about this ruling.  │
  │ Ask anything in plain English.          │
  │                                         │
  │ [ Chat About This Action → ]            │
  │     ↑ links to /action/act-1?chat=open  │
  └─────────────────────────────────────────┘

  ─────────────────────────────────────────

  You're receiving this because you explored
  CitizenOS as Priya Sharma (H-1B Visa Holder).

  [Unsubscribe] · [Switch persona] · [Sign up for real]

─────────────────────────────────────────
```

#### Email for Each Persona (Examples)

| Persona | Subject Line | Key Content |
|---------|-------------|-------------|
| **Priya** | "Priya, the H-1B fee just got upheld in court" | Court ruling detail + visa holder impact + 3 news articles + chat CTA |
| **Marcus** | "Marcus, a new rule could reclassify gig workers" | DOL proposed rule + gig worker impact + comment period deadline + news |
| **Sofia** | "Sofia, the student loan bill just passed committee" | Bill advancement + student impact + what happens next + news articles |
| **Bob** | "Bob, your OH rep voted NO on the insulin bill" | Vote record + promise broken flag + 3 news articles + "Contact your rep" CTA |

### InsForge Edge Function — Email Sender

```
citizenos/
└── insforge/
    └── functions/
        ├── send-demo-alert/
        │   └── index.ts          # Main email sender function
        ├── check-action-updates/
        │   └── index.ts          # Polls for new action changes
        └── tinyfish-scrape/
            └── index.ts          # Fetches news articles via TinyFish
```

#### Edge Function: `send-demo-alert`

```typescript
// insforge/functions/send-demo-alert/index.ts
// Triggered by: check-action-updates when a relevant action changes status

import { createClient } from '@insforge/sdk'

interface AlertPayload {
  action_id: string
  action_type: string
  action_title: string
  status_change: string           // 'passed' | 'signed' | 'ruling' | 'effective'
  summary: string
  persona_impact: Record<string, string>
  news_articles: TinyFishArticle[]
}

export default async function handler(req: Request) {
  const insforge = createClient({ /* ... */ })
  const payload: AlertPayload = await req.json()

  // 1. Find all active demo subscriptions whose personas match this action
  const { data: subscribers } = await insforge
    .from('demo_subscriptions')
    .select('*')
    .eq('is_active', true)
    .overlaps('persona_categories', payload.action_categories)

  // 2. For each subscriber, generate persona-specific email
  for (const sub of subscribers) {
    const personaImpact = payload.persona_impact[sub.persona_tags[0]] || payload.summary

    // 3. Use InsForge AI to generate the email body
    const { text: emailBody } = await insforge.ai.chat({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are writing a personalized email alert for CitizenOS.
            The recipient experienced the demo as "${sub.persona_name}" (${sub.persona_tags.join(', ')}).
            Write as if they ARE this persona. Use first name. Keep it under 200 words.
            Include the specific impact for their persona.
            Mention the news articles naturally.
            End with a CTA to chat about this action on CitizenOS.`
        },
        {
          role: 'user',
          content: JSON.stringify({
            persona: sub.persona_name,
            action: payload.action_title,
            status: payload.status_change,
            impact: personaImpact,
            articles: payload.news_articles.map(a => ({ title: a.title, source: a.source })),
          })
        }
      ]
    })

    // 4. Send via InsForge email or external service (Resend/SendGrid)
    await sendEmail({
      to: sub.email,
      subject: `${sub.persona_name.split(' ')[0]}, ${generateSubjectLine(payload)}`,
      html: renderEmailTemplate({
        personaName: sub.persona_name,
        personaIcon: getPersonaEmoji(sub.persona_id),
        body: emailBody,
        articles: payload.news_articles,
        actionUrl: `https://citizenos.app/action/${payload.action_id}?chat=open`,
        unsubscribeUrl: `https://citizenos.app/unsubscribe/${sub.id}`,
      }),
    })

    // 5. Log the sent email
    await insforge.from('demo_email_log').insert({
      subscription_id: sub.id,
      action_id: payload.action_id,
      action_type: payload.action_type,
      email_subject: `${sub.persona_name.split(' ')[0]}, ${generateSubjectLine(payload)}`,
    })

    // 6. Update subscription stats
    await insforge.from('demo_subscriptions')
      .update({ last_email_sent_at: new Date(), emails_sent: sub.emails_sent + 1 })
      .eq('id', sub.id)
  }

  return new Response(JSON.stringify({ sent: subscribers.length }), { status: 200 })
}
```

#### Edge Function: `check-action-updates`

```typescript
// insforge/functions/check-action-updates/index.ts
// Runs on a cron schedule (every 6 hours) or triggered manually
// Checks Federal Register API + Congress.gov for status changes

export default async function handler(req: Request) {
  const insforge = createClient({ /* ... */ })

  // 1. Get all actions we're tracking
  const { data: trackedActions } = await insforge
    .from('government_actions')
    .select('action_id, action_type, title, status, categories, impact_personas')

  // 2. For each, check if status has changed
  for (const action of trackedActions) {
    const currentStatus = await fetchCurrentStatus(action) // Hits Federal Register / Congress.gov

    if (currentStatus !== action.status) {
      // 3. Status changed! Fetch news articles via TinyFish
      const articles = await fetchRelatedArticles(action.title)

      // 4. Update action in DB
      await insforge.from('government_actions')
        .update({ status: currentStatus, status_detail: currentStatus })
        .eq('action_id', action.action_id)

      // 5. Trigger email alerts
      await fetch(`${INSFORGE_BASE}/functions/send-demo-alert`, {
        method: 'POST',
        body: JSON.stringify({
          action_id: action.action_id,
          action_type: action.action_type,
          action_title: action.title,
          status_change: currentStatus,
          summary: action.summary_ai,
          persona_impact: action.impact_personas,
          news_articles: articles,
          action_categories: action.categories,
        }),
      })
    }
  }

  return new Response(JSON.stringify({ checked: trackedActions.length }))
}
```

### Chat Continuation — "Chat About This" CTA

When the email recipient clicks "Chat About This Action", they land on the action detail page with the chat panel pre-opened and a contextual starter message.

#### Deep Link Format

```
https://citizenos.app/action/{action_id}?chat=open&persona={persona_id}&ref=demo-email
```

#### How It Works

```typescript
// In ActionDetailPage.tsx — detect deep link params

const [searchParams] = useSearchParams()
const chatOpen = searchParams.get('chat') === 'open'
const demoPersona = searchParams.get('persona')
const isDemoRef = searchParams.get('ref') === 'demo-email'

useEffect(() => {
  if (chatOpen) {
    // Auto-open chat panel
    setChatExpanded(true)

    // If coming from demo email, pre-populate a starter message
    if (isDemoRef && demoPersona) {
      const starterMessages: Record<string, string> = {
        priya: "I just got your email about this. What does this ruling mean for my H-1B petition that's already pending?",
        marcus: "I saw this affects gig workers. Can you explain what changes for me specifically?",
        sofia: "How does this affect my student loans? I'm a junior at ASU.",
        bob: "I run a restaurant with 22 employees. What's the bottom line impact on my business?",
      }
      // Show the starter as a suggestion chip, not auto-sent
      setSuggestedQuestion(starterMessages[demoPersona])
    }
  }
}, [chatOpen, demoPersona, isDemoRef])
```

#### Chat UI Enhancement — Persona Context Badge

When arriving from a demo email, the chat shows a contextual badge:

```
┌──── Ask About This Action ──────────────────────────┐
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🌐 Chatting as Priya Sharma (H-1B Visa Holder)│  │
│  │    Based on your demo profile                  │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  Suggested: "What does this ruling mean for my       │
│              H-1B petition that's pending?"           │
│              [ Ask this → ]                          │
│                                                      │
│  ┌──────────────────────────────────┐  [Send]        │
│  │ Type your question...            │                │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

The chat uses the persona context to give persona-specific answers:

```typescript
// When sending chat message, include persona context if from demo
const chatPayload = {
  actionId: action.action_id,
  message: userMessage,
  history: chatHistory,
  // NEW: persona context for demo users
  personaContext: demoPersona ? {
    id: demoPersona,
    name: DEMO_PERSONAS[demoPersona].name,
    tags: DEMO_PERSONAS[demoPersona].tags,
    state: DEMO_PERSONAS[demoPersona].stateCode,
  } : undefined,
}
```

### Email Subscription Flow — Updated CTA Screen

The final CTA screen after the demo now has a stronger email pitch:

```
╭──────────────────────────────────────────────────────────────────╮
│                                                                  │
│           You just experienced CitizenOS as Priya.              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  ✉ Stay in Priya's shoes                                 │  │
│  │                                                            │  │
│  │  We'll email you when real government actions affect       │  │
│  │  Priya's life — court rulings, new rules, bill votes.     │  │
│  │                                                            │  │
│  │  Each email includes:                                      │  │
│  │  • What happened (plain English)                           │  │
│  │  • How it affects Priya specifically                       │  │
│  │  • Real news articles from Reuters, AP, etc.               │  │
│  │  • A "Chat about this" link to ask follow-up questions     │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐    │  │
│  │  │ judge@example.com (from earlier)        [Change]  │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  │                                                            │  │
│  │  [ ✉ Subscribe as Priya ]    [ Try another persona ]      │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│                         — or —                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │       See what affects the REAL you.                       │  │
│  │       [ Sign Up — It's Free ]                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯
```

### Complete Data Flow — Demo to Email to Chat

```
DEMO TIME                          HOURS/DAYS LATER                    ON CLICK
─────────                          ────────────────                    ────────

[Try Demo]                         [check-action-updates]              [Email CTA]
    │                                    │                                  │
    ▼                                    ▼                                  ▼
Email capture ──────────┐          Federal Register API             /action/:id?chat=open
    │                   │          Congress.gov API                       │
    ▼                   │               │                                ▼
Pick persona            │               ▼                           Chat opens with
    │                   │          Status change detected?          persona context
    ▼                   │               │ YES                            │
Watch demo              │               ▼                                ▼
    │                   │          TinyFish API                     AI answers using
    ▼                   │          → scrape news articles           persona profile
"Subscribe as           │               │                          + action details
 Priya" CTA             │               ▼                          + latest status
    │                   │          InsForge AI
    ▼                   │          → generate persona email
                        │               │
demo_subscriptions ◄────┘               ▼
    │                              send-demo-alert
    │                              → send email with:
    │                                 • Persona greeting
    │                                 • Action summary
    │                                 • Persona impact
    │                                 • News articles
    │                                 • Chat CTA link
    │                                      │
    │                                      ▼
    │                              demo_email_log
    │                              (track sent/open/click)
    │
    └──── subscriber gets email ──── clicks "Chat" ──── asks questions ──── signs up for real
```

### Implementation Priority — Email System

#### Phase 1 — Hackathon Night (store email + show concept)
1. `demo_subscriptions` table in InsForge
2. Frontend: save email + persona to DB on "Subscribe" click
3. Toast: "You'll get an email when something happens to Priya"
4. Pre-write 1 example email as HTML template (show in demo as preview)

#### Phase 2 — Next Day (send real emails)
5. `send-demo-alert` edge function
6. `tinyfish-scrape` edge function (or inline in send-demo-alert)
7. Email template renderer (HTML + inline CSS for email clients)
8. `check-action-updates` edge function (manual trigger for demo)
9. Unsubscribe endpoint

#### Phase 3 — Polish
10. `check-action-updates` on cron (every 6 hours)
11. Open/click tracking pixels
12. "Switch persona" from email
13. Multiple TinyFish source support
14. Email preference management page

### New Files (Email System)

```
citizenos/
├── src/
│   ├── components/demo/
│   │   └── DemoSubscribe.tsx          # "Subscribe as Priya" UI in CTA screen
│   ├── api/
│   │   └── demoSubscriptions.ts       # Client-side: save subscription to InsForge DB
│   └── lib/
│       └── tinyfish.ts                # TinyFish API client (types + fetch wrapper)
│
└── insforge/functions/
    ├── send-demo-alert/
    │   ├── index.ts                   # Email sender edge function
    │   └── templates/
    │       ├── alert-email.html       # Base HTML email template
    │       └── styles.ts              # Inline CSS for email clients
    ├── check-action-updates/
    │   └── index.ts                   # Status change monitor (cron)
    └── tinyfish-scrape/
        └── index.ts                   # TinyFish news fetcher
```

### Why The Email System Wins

1. **It extends the demo beyond the room.** The judge leaves the hackathon, gets an email 2 days later. That's when they remember you.

2. **It proves the product is real.** Sending actual emails with real news articles = this isn't a mockup. The pipeline works.

3. **The persona continuity is memorable.** "Hi Priya" in their inbox — they remember being Priya during the demo. Emotional connection.

4. **Chat continuation closes the loop.** Email → click → chat → sign up. Full funnel from demo viewer to real user.

5. **TinyFish integration shows technical depth.** Real news scraping + AI-generated personalized emails + deep links = judges see a real product, not a weekend hack.
