# Person A — Completed Tasks Checklist

## Sprint 0 — Full Frontend + Backend Foundation

### S0-1: Project Initialization
- [x] Initialize Vite + React + TypeScript project inside citizenos/
- [x] Install Tailwind CSS v4 + @tailwindcss/vite
- [x] Initialize shadcn/ui with components.json config
- [x] Add shadcn components: button, card, input, badge, tabs, sheet, avatar, select, checkbox, scroll-area, separator, popover, skeleton, sonner, dropdown-menu, toggle, switch
- [x] Install dependencies: react-simple-maps, zustand, react-router-dom, recharts, lucide-react, clsx, tailwind-merge, class-variance-authority, prop-types
- [x] Install dev dependencies: @types/react-simple-maps
- [x] Set up citizenos/src/styles/globals.css with Tailwind directives + CSS variables
- [x] Set up citizenos/.env.example with placeholder API keys (VITE_ prefixed)
- [x] Verify: project builds without errors (tsc + vite build pass)

### S0-2: InsForge Backend Setup
- [x] Create citizenos/src/lib/insforge.ts — InsForge SDK client (env-var based config)
- [x] Create citizenos/src/api/auth.ts — Auth using InsForge SDK (signUp, signInWithPassword, signInWithOAuth, signOut, getCurrentSession, setProfile, getProfile)
- [x] Connect InsForge MCP to Claude Code
- [x] Provision InsForge project (base URL + anon key configured)
- [x] Install @insforge/sdk and @insforge/react
- [x] Wrap app in InsforgeProvider (main.tsx)

### S0-3: Routing + Layout Shell
- [x] citizenos/src/main.tsx — React entry with BrowserRouter, imports globals.css
- [x] citizenos/src/App.tsx — Route definitions with React.lazy + Suspense:
  - [x] / → LandingPage (logged out) or USAMap (logged in)
  - [x] /map → USAMap (always accessible)
  - [x] /bill/:id → BillDetailPage
  - [x] /reps → RepScoreDashboard
  - [x] /rep/:memberId → RepDetailPage
  - [x] /vote → VoteMapPage
  - [x] /candidate/:id → CandidateDetail
  - [x] /actions → ActionSearchPage
  - [x] /action/:id → ActionDetailPage
  - [x] /dashboard → Dashboard
  - [x] /profile → ProfilePage
  - [x] /settings → SettingsPage (with NotifPreferences)
  - [x] /login → LoginForm
  - [x] /signup → SignupForm
  - [x] /onboarding → OnboardingFlow
- [x] citizenos/src/components/layout/PageWrapper.tsx — max-w-7xl, mx-auto, padding
- [x] citizenos/src/components/layout/Header.tsx — Logo, NavTabs (dynamic: Dashboard tab for logged-in, Home tab for logged-out), SearchBar, NotificationBell, UserMenu (Profile, Dashboard, Complete Profile, Settings, Logout), mobile responsive with Sheet sidebar
- [x] citizenos/src/components/layout/Dashboard.tsx — Welcome message, quick-link cards, ActionFeed, RepList for home state
- [x] citizenos/src/components/layout/LandingPage.tsx — Hero section, feature cards, sample government actions preview, CTA buttons for signup/login
- [x] citizenos/src/components/layout/OnboardingBanner.tsx — Persistent banner below header for logged-in users with incomplete onboarding, dismissible
- [x] Auth initialization on app start (loadProfile in App useEffect)
- [x] Sonner toast provider wired into RootLayout

### S0-4: Interactive USA Map
- [x] Download TopoJSON: citizenos/public/us-states-topo.json
- [x] citizenos/src/components/map/USAMap.tsx — react-simple-maps ComposableMap + Geographies + ZoomableGroup, clickable states, hover tooltip, 3 color modes (bill_activity, party_control, civic_score), home state highlighting, distinct bg-slate-300/dark:bg-slate-900 background
- [x] citizenos/src/components/map/StatePanel.tsx — shadcn Sheet (520px wide), slides from right, tabs (Bills, Actions, Reps, Candidates, Stats), Bills tab wired to BillList (compact mode), Actions tab wired to ActionFeed, Reps tab wired to RepList, Candidates tab wired to CandidateList
- [x] citizenos/src/components/map/MapLegend.tsx — Bottom-left overlay with color scale legend per mode
- [x] citizenos/src/components/map/MapControls.tsx — Top-right overlay with color mode dropdown
- [x] citizenos/src/stores/useMapStore.ts — selectedState, colorMode, hoveredState + actions
- [x] citizenos/src/api/map.ts — getStateStats() with 20 mock state entries

### S0-5: Auth UI + Onboarding + OAuth + Profile
- [x] citizenos/src/stores/useAuthStore.ts — user, profiles, categories, isAuthenticated, isLoading, requiresEmailVerification + actions (login, signup, logout, loginWithGoogle, loginWithGitHub, loadProfile, saveOnboarding, hasCompletedOnboarding)
- [x] citizenos/src/api/auth.ts — Extended User type with visa_status, employment_status, age_group, household, onboarding_completed fields; OnboardingData interface
- [x] citizenos/src/components/auth/LoginForm.tsx — Email + password + Google/GitHub OAuth buttons, error display, redirect logic (routes to /onboarding if incomplete)
- [x] citizenos/src/components/auth/SignupForm.tsx — Name + email + password + Google/GitHub OAuth buttons, email verification flow, redirect to /onboarding
- [x] citizenos/src/components/auth/OnboardingFlow.tsx — 4-step wizard (Location, Background, Life Situation, Issues), skip-for-now option, comprehensive visa/employment/age/household fields, auto-builds personas from structured data
- [x] citizenos/src/components/auth/ProfilePage.tsx — Full profile page with inline editing per section (Location, Background, Life Situation, Policy Interests, Account info), avatar, onboarding completion prompt
- [x] Google OAuth via InsForge redirect flow (signInWithOAuth)
- [x] GitHub OAuth via InsForge redirect flow (signInWithOAuth)
- [x] Onboarding data stored as InsForge profile custom fields (state_code, zip_code, personas, categories, visa_status, employment_status, age_group, household, onboarding_completed)
- [x] Onboarding reminders: persistent banner (OnboardingBanner), notification dropdown prompt, "Complete Profile" in user menu — all hidden once onboarding is completed

### S0-6: Shared Libraries
- [x] citizenos/src/lib/utils.ts — cn() function for class merging
- [x] citizenos/src/lib/personas.ts — 8 personas with id, label, icon, description
- [x] citizenos/src/lib/categories.ts — 15 categories with id, label
- [x] citizenos/src/lib/states.ts — 50 states + DC with code, name, fips
- [x] citizenos/src/lib/policyAxes.ts — 10 policy axes with questions for VoteMap quiz
- [x] citizenos/src/lib/profileOptions.ts — Shared constants for visa types (21 options), employment statuses (13), age groups (7), household situations (11), with label lookup helpers

---

## Person A — BillBreaker Module

### A-Phase 1: Data Pipeline
- [x] citizenos/src/api/bills.ts — Bill API client with 10 realistic mock bills (healthcare, immigration, education, climate, tax, veterans, AI/tech, childcare, gun safety, housing), all functions: getBills, getBillDetail, getBillImpact, getBillStory, chatWithBill, saveBill, unsaveBill, getSavedBills, getRepsVoted
- [x] citizenos/src/stores/useBillStore.ts — bills, selectedBill, filters, chatHistory, impactResults, savedBillIds, isLoading + all actions
- [ ] Deploy edge functions (skipped — using mock data layer, ready to wire to real backend)

### A-Phase 2: UI Components
- [x] citizenos/src/components/billbreaker/BillList.tsx — Filter bar (category, status, search), BillCard grid, continuous pagination (appends on load more), loading skeleton, empty state, accepts stateFilter + compact props
- [x] citizenos/src/components/billbreaker/BillCard.tsx — Card with title, bill_id, status badge (color-coded), category badges, date, sponsor, bookmark toggle
- [x] citizenos/src/components/billbreaker/BillDetailPage.tsx — Full page composing all sub-components, loading skeleton, back nav
- [x] citizenos/src/components/billbreaker/BillHeader.tsx — Bill number, title, sponsor + party badge, status badge, date, categories
- [x] citizenos/src/components/billbreaker/StatusTimeline.tsx — Horizontal stepper (5 steps), checkmarks for completed, vetoed state handling
- [x] citizenos/src/components/billbreaker/AISummary.tsx — AI Generated badge, markdown-style rendering, toggle between AI/original summary
- [x] citizenos/src/components/billbreaker/PersonaSelector.tsx — Toggle chips from user profiles, fetches impact on toggle
- [x] citizenos/src/components/billbreaker/ImpactPanel.tsx — Persona impact cards with loading skeleton
- [x] citizenos/src/components/billbreaker/ImpactStory.tsx — Collapsible "How this affects your day" narrative section
- [x] citizenos/src/components/billbreaker/BillChat.tsx — Chat UI with ScrollArea, message bubbles, 3 suggested questions, send button, auto-scroll
- [x] citizenos/src/components/billbreaker/RepsVoted.tsx — Rep voting list with party badges and vote position colors
- [x] citizenos/src/components/billbreaker/BillActionBar.tsx — Sticky bottom bar: save toggle, share (clipboard + toast), contact rep
- [x] Wire BillList into StatePanel Bills tab
- [x] Map coloring by bill activity (blue gradient)

### A-Phase 3: Notifications
- [x] citizenos/src/api/notifications.ts — 6 mock notifications, all CRUD functions + preferences
- [x] citizenos/src/stores/useNotifStore.ts — notifications, unreadCount, preferences, polling (60s interval)
- [x] citizenos/src/components/billbreaker/NotificationBell.tsx — Bell icon + red badge (bg-red-600 text-white, visible in both light/dark), opens popover dropdown
- [x] citizenos/src/components/billbreaker/NotificationDropdown.tsx — Notification list with impact-level borders, time ago, mark read, navigate to bill, onboarding prompt pinned at top for incomplete profiles
- [x] citizenos/src/components/billbreaker/NotifPreferences.tsx — Category toggles, notification type toggles, auto-save
- [x] Wire NotificationBell into Header.tsx

### A-Phase 4: Polish
- [x] Bill search/filter bar with keyword search
- [x] Skeleton loading states on BillList, BillDetail
- [x] Empty states with icons and messages
- [ ] Error handling: toast notifications on API failure, retry buttons (not needed — mock data doesn't fail)
- [x] Cross-module: getRepsVoted returns mock voting data for bill detail pages

---

## Person B — RepScore Module

### B-Phase 1: Data Pipeline
- [x] citizenos/src/api/reps.ts — Rep API client with mock data, all functions: getReps, getRepDetail, getRepVoteHistory, getRepFunding
- [x] citizenos/src/stores/useRepStore.ts — Zustand store for reps list, filters, selected rep, loading states
- [x] citizenos/seed/seed-reps.json — Seed data for representatives

### B-Phase 2: UI Components
- [x] citizenos/src/components/repscore/RepList.tsx — Filterable rep list, accepts stateFilter prop, compact mode
- [x] citizenos/src/components/repscore/RepCard.tsx — Rep card with party badge, score, state, vote stats
- [x] citizenos/src/components/repscore/RepScoreDashboard.tsx — Full dashboard with filters and rep grid
- [x] citizenos/src/components/repscore/RepDetailPage.tsx — Full detail page with voting history, funding, scores
- [x] citizenos/src/components/repscore/RepVoteHistory.tsx — Vote history table with bill links
- [x] citizenos/src/components/repscore/RepFunding.tsx — Funding sources chart + list
- [x] citizenos/src/components/repscore/RepScoreBreakdown.tsx — Score breakdown by category
- [x] citizenos/src/components/repscore/RepCompare.tsx — Side-by-side rep comparison
- [x] citizenos/src/components/repscore/ScoreCard.tsx — Individual score metric card
- [x] citizenos/src/components/repscore/CompareDrawer.tsx — Drawer UI for rep comparison selection
- [x] citizenos/src/components/repscore/PartyBadge.tsx — Color-coded party badge (D/R/I)
- [x] Wire RepList into StatePanel Reps tab
- [x] Wire /reps route to RepScoreDashboard
- [x] Wire /rep/:memberId route to RepDetailPage

---

## VoteMap Module

### Data Layer
- [x] citizenos/src/api/candidates.ts — Candidate API with mock data
- [x] citizenos/src/api/quiz.ts — Policy quiz API with questions and scoring
- [x] citizenos/src/stores/useQuizStore.ts — Quiz state management
- [x] citizenos/seed/seed-candidates.json — Candidate seed data
- [x] citizenos/seed/seed-positions.json — Candidate position seed data

### UI Components
- [x] citizenos/src/components/votemap/VoteMapPage.tsx — Landing page with quiz start
- [x] citizenos/src/components/votemap/PolicyQuiz.tsx — Interactive policy quiz
- [x] citizenos/src/components/votemap/QuizQuestion.tsx — Individual quiz question component
- [x] citizenos/src/components/votemap/QuizResults.tsx — Quiz results with candidate matches
- [x] citizenos/src/components/votemap/MatchList.tsx — Ranked candidate match list
- [x] citizenos/src/components/votemap/MatchCard.tsx — Individual match card with score
- [x] citizenos/src/components/votemap/CandidateList.tsx — Browsable candidate list
- [x] citizenos/src/components/votemap/CandidateDetail.tsx — Full candidate detail page
- [x] citizenos/src/components/votemap/CandidateCompare.tsx — Side-by-side candidate comparison
- [x] citizenos/src/components/votemap/PolicyRadar.tsx — Radar chart for policy positions
- [x] citizenos/src/components/votemap/FundingChart.tsx — Campaign funding visualization
- [x] citizenos/src/components/votemap/ReputationCard.tsx — Candidate reputation summary
- [x] Wire /vote route to VoteMapPage
- [x] Wire /candidate/:id route to CandidateDetail
- [x] Wire CandidateList into StatePanel Candidates tab

---

## Government Actions Tracker Module

### Data Layer
- [x] citizenos/src/api/actions.ts — Mock data + API functions (getActions, getActionDetail, getActionImpact, chatWithAction, saveAction, getActionFeed)
- [x] citizenos/src/stores/useActionStore.ts — Zustand store following useBillStore pattern
- [x] Mock data: 10 government actions (EOs, proclamations, rules, court rulings) with realistic content including H-1B example

### UI Components
- [x] citizenos/src/components/actions/ActionTypeBadge.tsx — Color-coded badge for 8 action types
- [x] citizenos/src/components/actions/ActionCard.tsx — Universal card with type/impact/date/categories/save
- [x] citizenos/src/components/actions/ActionFeed.tsx — Personalized feed for Dashboard + StatePanel using auth store personas
- [x] citizenos/src/components/actions/ActionSearchPage.tsx — Browse/filter with type/category/persona dropdowns
- [x] citizenos/src/components/actions/ActionDetailPage.tsx — Full detail page composing all sub-components
- [x] citizenos/src/components/actions/ActionHeader.tsx — Title, authority, agencies, status, save/link buttons
- [x] citizenos/src/components/actions/ActionTimeline.tsx — Responsive horizontal/vertical timeline with completed/pending
- [x] citizenos/src/components/actions/ActionImpactPanel.tsx — Persona selector + impact results + collapsible impact story
- [x] citizenos/src/components/actions/ActionChat.tsx — Q&A chat mirroring BillChat pattern
- [x] citizenos/src/components/actions/LegalChallenges.tsx — Court challenge cards with status badges
- [x] citizenos/src/components/actions/RelatedActions.tsx — Clickable related action cards

### Integration
- [x] Add /actions and /action/:id routes to App.tsx
- [x] Add "Actions" tab to StatePanel
- [x] Add ActionFeed to Dashboard
- [x] Add "Actions" nav link in Header

---

## UI Fixes & Polish

- [x] Fix notification badge visibility in light mode — changed from bg-destructive/text-destructive-foreground to bg-red-600/text-white
- [x] Fix map background blending into states in light mode — changed from bg-muted/30 to bg-slate-300 dark:bg-slate-900
- [x] Widen StatePanel sidebar from 400px to 520px to prevent bill card content overflow
- [x] BillList compact mode — single-column grid when rendered inside StatePanel sidebar
- [x] Continuous bill pagination — useBillStore.fetchBills now appends bills on load more instead of replacing
- [x] Dynamic nav tabs — Dashboard tab visible only when logged in, Home tab for logged out
- [x] User dropdown menu — added Profile and Complete Profile (when onboarding incomplete) items

---

## Pending / Not Yet Done

- [ ] Deploy edge functions to InsForge (using mock data layer — ready to wire to real backend)
- [ ] Error handling: toast notifications on API failure, retry buttons
- [ ] Real API integration: replace mock data in api/bills.ts, api/reps.ts, api/candidates.ts, api/actions.ts with InsForge SDK calls
- [ ] Federal Register API integration for live government actions data
- [ ] Congress.gov API integration for live bill data
- [ ] ProPublica / Google Civic API integration for live representative data
- [ ] Search bar functionality (currently placeholder — no search logic wired)
- [ ] State statistics tab in StatePanel (shows "coming soon" placeholder)
- [ ] Push notifications / email notifications (currently polling-based mock only)
- [ ] Password reset / forgot password flow
- [ ] User account deletion
- [ ] Mobile-responsive polish for all detail pages
- [ ] Accessibility audit (keyboard nav, screen reader labels, focus traps)
