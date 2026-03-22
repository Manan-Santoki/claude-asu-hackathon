# CitizenOS

A civic engagement platform that helps US citizens understand legislation, track representative accountability, and find candidates aligned with their values — all through an interactive, map-driven interface.

## What It Does

CitizenOS is built around four core modules, all accessible through an interactive USA map:

### BillBreaker
Breaks down complex legislation into plain English. Browse bills, see AI-generated summaries, understand how each bill impacts you based on your persona (student, veteran, parent, small business owner, etc.), and chat with an AI to ask questions about any bill.

### Government Actions Tracker
Goes beyond bills to track **all types of government actions** — executive orders, presidential proclamations, agency rules, court rulings, and more. Citizens can see how actions like tariffs, travel bans, H-1B fee changes, and DOGE cuts affect them personally, with AI-powered plain-English explanations and personalized impact analysis.

### RepScore
Track your representatives' voting records, campaign promises, and accountability scores. Compare representatives side-by-side, view funding sources, and contact them directly through generated emails.

### VoteMap
Take a policy quiz and get matched with candidates based on your values. Compare candidates side-by-side, view funding sources and endorsements, and explore policy alignment through radar charts.

### Interactive USA Map
The home screen features a clickable SVG map of the United States. Click any state to explore bills, government actions, representatives, and candidates specific to that state through a slide-out panel with tabbed navigation.

### Authentication & Personalization
Full authentication flow powered by InsForge with email/password login, Google and GitHub OAuth, and email verification. A 4-step onboarding wizard collects your location, visa/citizenship status (F-1, H-1B, OPT, DACA, Green Card, etc.), employment, age, and life situation to personalize what you see. Onboarding is optional — users are reminded via a banner, notification, and menu item until completed. A dedicated profile page lets you view and edit all your details at any time.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI) |
| State Management | Zustand |
| Routing | react-router-dom 7 |
| Maps | react-simple-maps |
| Charts | recharts |
| Icons | lucide-react |
| Auth | InsForge (BaaS) — Email, Google & GitHub OAuth |
| Backend | InsForge (BaaS) |

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Manan-Santoki/claude-asu-hackathon.git
cd claude-asu-hackathon

# Install root dependencies
npm install

# Install app dependencies
cd citizenos
npm install
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example .env
```

Fill in the required environment variables in `.env`:

```
VITE_INSFORGE_API_BASE_URL=    # InsForge backend URL
VITE_INSFORGE_API_KEY=         # InsForge API key
```

Optional API keys for external data sources:

```
VITE_CONGRESS_GOV_API_KEY=
VITE_PROPUBLICA_API_KEY=
VITE_GOOGLE_CIVIC_API_KEY=
VITE_OPENSECRETS_API_KEY=
```

### Running the App

```bash
cd citizenos
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build     # TypeScript check + Vite production build
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

## Project Structure

```
claude-asu-hackathon/
├── citizenos/                  # Main React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Login, Signup, Onboarding, Profile (InsForge OAuth)
│   │   │   ├── billbreaker/    # Bill analysis module
│   │   │   ├── actions/        # Government Actions Tracker module
│   │   │   ├── repscore/       # Representative tracking module
│   │   │   ├── votemap/        # Candidate matching module
│   │   │   ├── map/            # Interactive USA map
│   │   │   ├── layout/         # Header, Dashboard, LandingPage, OnboardingBanner, PageWrapper
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── stores/             # Zustand state stores
│   │   ├── api/                # API client layer (mock + InsForge)
│   │   ├── lib/                # Utilities & constants
│   │   └── styles/             # Global CSS
│   ├── seed/                   # Mock data & seeding scripts
│   └── public/                 # Static assets (TopoJSON map data)
├── AGENTS.md                   # InsForge SDK documentation
├── plan.md                     # Architecture & design document
├── feature.md                  # Government Actions Tracker specification
└── checklist.md                # Sprint task tracker
```

## Routes

| Path | Page |
|------|------|
| `/` | Landing Page (logged out) / Map (logged in) |
| `/map` | Interactive USA Map |
| `/bill/:id` | Bill Detail |
| `/actions` | Government Actions Search & Browse |
| `/action/:id` | Action Detail (EO, rule, court ruling, etc.) |
| `/reps` | Representative Dashboard |
| `/rep/:memberId` | Representative Detail |
| `/vote` | VoteMap — Candidate Matching |
| `/candidate/:id` | Candidate Detail |
| `/dashboard` | User Dashboard |
| `/profile` | User Profile (view & edit) |
| `/settings` | Settings & Notification Preferences |
| `/login` | Login |
| `/signup` | Sign Up |
| `/onboarding` | 4-Step Onboarding Wizard |

## License

This project was built as part of a hackathon. See the repository for license details.
