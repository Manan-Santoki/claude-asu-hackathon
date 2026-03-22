import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Map,
  FileText,
  Users,
  Vote,
  Gavel,
  Scale,
  Landmark,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Eye,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Palette,
  Info,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Reusable building blocks                                          */
/* ------------------------------------------------------------------ */

function Term({
  word,
  children,
}: {
  word: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <dt className="font-semibold text-foreground">{word}</dt>
      <dd className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </dd>
    </div>
  )
}

function Expandable({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors rounded-lg"
      >
        <span className="font-medium text-sm">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

function FeatureSection({
  icon: Icon,
  title,
  route,
  color,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  route: string
  color: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-6" id={title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="flex items-start gap-4">
        <div className={`rounded-lg p-2.5 shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-lg font-bold">{title}</h2>
            <Link
              to={route}
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              Go to {title} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <dl className="divide-y">{children}</dl>
        </div>
      </div>
    </Card>
  )
}

function QuickNavButton({
  label,
  target,
  icon: Icon,
}: {
  label: string
  target: string
  icon: React.ElementType
}) {
  return (
    <a
      href={`#${target}`}
      className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md border hover:bg-accent/50 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
        {step}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StatusBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <Badge variant="secondary" className={`text-xs ${className}`}>
      {label}
    </Badge>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function LedgerPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ============================================================ */}
        {/* HERO / PAGE HEADER                                           */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-3 bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Civic Ledger
              </h1>
              <p className="text-muted-foreground text-sm">
                Your plain-language guide to everything on CitizenOS
              </p>
            </div>
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3 items-start">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  New to U.S. politics?
                </strong>{' '}
                No worries. This page explains every feature, button, color, and
                term you'll see on CitizenOS in simple everyday language. Whether
                you're a citizen, a resident, a student, or just curious — this
                guide is for you. No political science degree needed.
              </div>
            </div>
          </Card>
        </div>

        {/* Quick jump nav */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Jump to section
          </p>
          <div className="flex flex-wrap gap-2">
            <QuickNavButton
              label="How Government Works"
              target="how-government-works"
              icon={Landmark}
            />
            <QuickNavButton
              label="How a Bill Becomes Law"
              target="how-a-bill-becomes-law"
              icon={FileText}
            />
            <QuickNavButton
              label="Interactive Map"
              target="interactive-map"
              icon={Map}
            />
            <QuickNavButton
              label="BillBreaker"
              target="billbreaker"
              icon={FileText}
            />
            <QuickNavButton
              label="RepScore"
              target="repscore"
              icon={Users}
            />
            <QuickNavButton
              label="Actions"
              target="actions"
              icon={Gavel}
            />
            <QuickNavButton
              label="VoteMap"
              target="votemap"
              icon={Vote}
            />
            <QuickNavButton
              label="Data Sources"
              target="data-sources"
              icon={BookOpen}
            />
            <QuickNavButton
              label="Glossary"
              target="glossary"
              icon={Scale}
            />
            <QuickNavButton
              label="FAQ"
              target="faq"
              icon={HelpCircle}
            />
          </div>
        </div>

        <Separator />

        {/* ============================================================ */}
        {/* HOW U.S. GOVERNMENT WORKS                                    */}
        {/* ============================================================ */}
        <Card className="p-6" id="how-government-works">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">
                How the U.S. Government Works
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Think of it like a company with two offices — one national
                headquarters (federal) and 50 branch offices (state). Each makes
                its own rules, and both affect your life.
              </p>
              <dl className="divide-y">
                <Term word="Federal Government (National Level)">
                  The national government based in Washington, D.C. It makes
                  rules that apply to <strong>everyone in the country</strong>.
                  Think of it as the "head office." It handles big-picture stuff
                  like the military, immigration, Social Security, national
                  taxes, and foreign policy. It has three branches:
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>
                      <strong>Executive</strong> — The President. Runs the
                      government day-to-day, signs bills into law, issues
                      executive orders.
                    </li>
                    <li>
                      <strong>Legislative</strong> — Congress (Senate + House of
                      Representatives). Writes and votes on new laws.
                    </li>
                    <li>
                      <strong>Judicial</strong> — The courts, including the
                      Supreme Court. Interprets laws and settles disputes.
                    </li>
                  </ul>
                </Term>
                <Term word="State Government (Local Level)">
                  Each of the 50 states has its own government that makes laws
                  for <strong>that state only</strong>. These laws cover
                  day-to-day things like driver's licenses, public schools,
                  local roads, healthcare programs, police, and state taxes. Each
                  state has a <strong>Governor</strong> (like a mini-president)
                  and its own legislature (state house + state senate). The map
                  on CitizenOS shows how active each state's legislature is.
                </Term>
                <Term word="Congress (Federal Lawmaking Body)">
                  Congress is where federal laws are made. It has{' '}
                  <strong>two chambers</strong> that must both agree for a bill
                  to become law:
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>
                      <strong>Senate</strong> — 100 members (2 per state, no
                      matter the state's size). Senators serve 6-year terms.
                      They confirm judges, approve treaties, and vote on bills.
                    </li>
                    <li>
                      <strong>House of Representatives</strong> — 435 members
                      (states with more people get more). House members serve
                      2-year terms. Tax and spending bills must start here.
                    </li>
                  </ul>
                </Term>
                <Term word="State Legislature">
                  Your state's own version of Congress. Most states have a state
                  senate and state house. They pass laws on education, roads,
                  healthcare, policing, and most things that directly affect your
                  daily life. The <strong>bill counts on the map</strong> come
                  from state legislatures — not from federal Congress.
                </Term>
                <Term word="What's the Difference Between Federal and State Bills?">
                  <strong>Federal bills</strong> are proposed laws being debated
                  in the U.S. Congress in Washington, D.C. They apply to
                  everyone. <strong>State bills</strong> are proposed laws in
                  your state's own legislature. They only apply within that
                  state. On CitizenOS, the <strong>map colors</strong> show
                  state legislature activity, while the{' '}
                  <strong>BillBreaker tab and state panel "Federal Bills"</strong>{' '}
                  show federal legislation.
                </Term>
              </dl>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* HOW A BILL BECOMES LAW — VISUAL STEP-BY-STEP                */}
        {/* ============================================================ */}
        <Card className="p-6" id="how-a-bill-becomes-law">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">
                How a Bill Becomes a Law (Step by Step)
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Only about 5% of bills ever become law. Here's the journey every
                bill takes, and what the status labels on CitizenOS mean.
              </p>

              <div className="space-y-4">
                <StepCard
                  step={1}
                  title="A member of Congress writes and introduces a bill"
                  description="Any Senator or House Representative can propose a new law. This person is called the 'Sponsor.' On CitizenOS, you'll see their name on the bill card."
                />
                <div className="ml-3.5 border-l-2 border-dashed h-3" />
                <StepCard
                  step={2}
                  title="The bill goes to a Committee"
                  description="A small group of Congress members who specialize in that topic reviews the bill. For example, a tax bill goes to the Finance Committee. Most bills die here — the committee decides if it's worth a full vote."
                />
                <div className="ml-3.5 border-l-2 border-dashed h-3" />
                <StepCard
                  step={3}
                  title="The full chamber debates and votes"
                  description="If the committee approves it, the full House or Senate debates the bill and votes. A simple majority (more than half) is usually needed to pass."
                />
                <div className="ml-3.5 border-l-2 border-dashed h-3" />
                <StepCard
                  step={4}
                  title="The other chamber does the same thing"
                  description="If the House passes a bill, the Senate must also pass it (and vice versa). Both chambers must agree on the exact same text. This is why many bills stall — one chamber passes it but the other doesn't."
                />
                <div className="ml-3.5 border-l-2 border-dashed h-3" />
                <StepCard
                  step={5}
                  title="The President signs or vetoes"
                  description="If both chambers pass the bill, it goes to the President. If the President signs it, it becomes law (Enacted). If the President rejects it (Vetoed), Congress can still override the veto with a 2/3 vote in both chambers — but this is very rare."
                />
              </div>

              <Separator className="my-5" />

              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                What the status badges mean
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="Introduced"
                    className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
                  />
                  <span className="text-muted-foreground">
                    Just submitted, no vote yet
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="In Committee"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  />
                  <span className="text-muted-foreground">
                    Being reviewed by experts
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="Passed House"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  />
                  <span className="text-muted-foreground">
                    Approved by the House
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="Passed Senate"
                    className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  />
                  <span className="text-muted-foreground">
                    Approved by the Senate
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="Enacted"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  />
                  <span className="text-muted-foreground">
                    Signed into law
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge
                    label="Vetoed"
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  />
                  <span className="text-muted-foreground">
                    Rejected by the President
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* INTERACTIVE MAP                                              */}
        {/* ============================================================ */}
        <FeatureSection
          icon={Map}
          title="Interactive Map"
          route="/map"
          color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          description="A color-coded map of the United States. Click any state to explore its federal bills, representatives, executive actions, and candidates. Hover to see a quick summary."
        >
          <Term word="What am I looking at?">
            The map shows all 50 U.S. states plus Washington, D.C. Each state is
            colored based on the mode you select (top-right controls). By
            default, it shows <strong>bill activity</strong> — how many bills
            each state's legislature has introduced this year.
          </Term>
          <Term word="State Bills Count (hover tooltip)">
            When you hover over a state, you see something like{' '}
            <em>"California — 4,231 state bills this year."</em> This is the
            total number of <strong>state legislature</strong> bills introduced
            this calendar year. These are laws proposed in the state's own house
            and senate — <strong>not</strong> in federal Congress. A higher
            number means a more active state legislature.
          </Term>
          <Term word="Color Mode: Bill Activity (blue shading)">
            <div className="flex items-center gap-2 mt-1 mb-2">
              <div className="h-4 w-8 rounded bg-blue-100" />
              <span>Few bills</span>
              <ArrowRight className="h-3 w-3" />
              <div className="h-4 w-8 rounded bg-blue-700" />
              <span>Many bills</span>
            </div>
            Darker blue = more bills introduced this year. This lets you quickly
            see which states have the most active legislatures. A very light
            state might have hundreds of bills, while a dark state like
            California or New York might have thousands.
          </Term>
          <Term word="Color Mode: Party Control">
            Shows which political party controls each state government:{' '}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge
                label="Democrat"
                className="bg-blue-100 text-blue-800"
              />
              <span className="text-xs">
                — Democrats control the governor's office and legislature
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge
                label="Republican"
                className="bg-red-100 text-red-800"
              />
              <span className="text-xs">
                — Republicans control both
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <StatusBadge
                label="Split"
                className="bg-purple-100 text-purple-800"
              />
              <span className="text-xs">
                — Power is divided (e.g., a Democrat governor with a Republican
                legislature)
              </span>
            </div>
          </Term>
          <Term word="Color Mode: Civic Score (green shading)">
            <div className="flex items-center gap-2 mt-1 mb-2">
              <div className="h-4 w-8 rounded bg-green-100" />
              <span>Low score</span>
              <ArrowRight className="h-3 w-3" />
              <div className="h-4 w-8 rounded bg-green-700" />
              <span>High score</span>
            </div>
            A 0–100 score measuring how legislatively active a state is. It's
            calculated from the bill count — more bills means a higher score.
            Think of it as a "busyness" rating for the state government.
          </Term>
          <Term word="Home State (gold border)">
            If you've set your state in your profile, your home state gets a
            gold/amber border so it's easy to spot on the map.
          </Term>
          <Term word="Side Panel — What Happens When You Click a State">
            Clicking a state opens a panel on the right with four tabs:
            <ul className="mt-2 ml-4 space-y-1 list-disc">
              <li>
                <strong>Federal Bills</strong> — Bills in the U.S. Congress
                sponsored by members from that state. This is different from the
                state-level bill count shown on the map.
              </li>
              <li>
                <strong>Actions</strong> — Executive orders and federal
                regulatory actions that affect this state.
              </li>
              <li>
                <strong>Reps</strong> — The state's Senators and House
                Representatives with their scores.
              </li>
              <li>
                <strong>Candidates</strong> — People currently running for
                office in that state.
              </li>
            </ul>
          </Term>
        </FeatureSection>

        {/* ============================================================ */}
        {/* BILLBREAKER                                                  */}
        {/* ============================================================ */}
        <FeatureSection
          icon={FileText}
          title="BillBreaker"
          route="/bill"
          color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
          description="Breaks down complex federal legislation into plain English. Bills are often hundreds of pages of dense legal text — BillBreaker translates them so you can understand what Congress is actually doing."
        >
          <Term word="What is a Bill?">
            A bill is a <strong>proposed law</strong>. Someone in Congress writes
            it, formally introduces it, and then it goes through a process of
            debate and votes before it can become law. Think of it like a
            proposal at work — someone suggests it, people discuss it, and then
            everyone votes on whether to adopt it.
          </Term>
          <Term word="Bill ID (e.g., H.R.1234 or S.567)">
            Every bill gets a unique number.{' '}
            <strong>H.R.</strong> means it started in the House of
            Representatives. <strong>S.</strong> means it started in the Senate.
            The number is assigned in order as bills are introduced.
          </Term>
          <Term word="Sponsor">
            The Congress member who wrote and introduced the bill. Shown as
            "Rep." (House Representative) or "Sen." (Senator) followed by their
            name and party. The sponsor is the bill's champion — they're the one
            pushing to get it passed.
          </Term>
          <Term word="Co-Sponsor">
            Other Congress members who officially support the bill. Having many
            co-sponsors means the bill has broad support and is more likely to
            advance.
          </Term>
          <Term word="Category Tags">
            Bills are grouped by topic — like "Healthcare," "Education,"
            "Defense," "Economy," "Environment," etc. You can filter by category
            to find bills about topics you care about.
          </Term>
          <Term word="AI Summary">
            A plain-English explanation of what the bill does, generated by AI.
            Instead of reading 200 pages of legal text, you get a 2-3 paragraph
            summary that explains: what the bill does, who it helps, who it
            affects, and why it matters.
          </Term>
          <Term word="Impact Panel & Personas">
            Shows how a bill might affect <strong>you personally</strong>. Select
            a persona (student, worker, parent, veteran, small business owner,
            etc.) to see a tailored explanation. For example, a student might
            care about how a bill affects financial aid, while a parent might
            care about child tax credits.
          </Term>
          <Term word="Impact Story">
            A narrative explanation of how the bill could play out in real life.
            Think of it as a "day in the life" example that shows concrete
            effects.
          </Term>
          <Term word="Bill Chat">
            An AI chatbot you can ask questions about the bill. Not sure what a
            specific section means? Just ask. It's like having a political
            science tutor who read the whole bill for you.
          </Term>
          <Term word="Reps Voted">
            Shows how each Congress member voted on the bill — Yea (yes), Nay
            (no), or Not Voting. This helps you see if your own representatives
            supported or opposed the bill.
          </Term>
          <Term word="Save / Bookmark">
            Tap the bookmark icon to save a bill to your dashboard. You'll get
            updates when the bill's status changes.
          </Term>
        </FeatureSection>

        {/* ============================================================ */}
        {/* REPSCORE                                                     */}
        {/* ============================================================ */}
        <FeatureSection
          icon={Users}
          title="RepScore"
          route="/reps"
          color="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200"
          description="Track and rate your federal representatives. Think of it as a performance review for the people who represent you in Congress. See their voting record, promises kept, and how to contact them."
        >
          <Term word="Who are my Representatives?">
            Every American has <strong>3 federal representatives</strong>:
            <ul className="mt-2 ml-4 space-y-1 list-disc">
              <li>
                <strong>2 Senators</strong> — represent your entire state.
                Elected statewide.
              </li>
              <li>
                <strong>1 House Representative</strong> — represents your
                specific district (a geographic area within your state). States
                with more people have more districts.
              </li>
            </ul>
            Set your state in your profile and CitizenOS will show you your
            specific representatives.
          </Term>
          <Term word="Party Badge (D / R / I)">
            <div className="flex flex-wrap gap-2 mt-1">
              <StatusBadge
                label="D — Democrat"
                className="bg-blue-100 text-blue-800"
              />
              <StatusBadge
                label="R — Republican"
                className="bg-red-100 text-red-800"
              />
              <StatusBadge
                label="I — Independent"
                className="bg-purple-100 text-purple-800"
              />
            </div>
            <span className="block mt-1">
              The political party your representative belongs to. Democrats and
              Republicans are the two major parties. Independents don't belong to
              either.
            </span>
          </Term>
          <Term word="Chamber: Senate vs. House">
            "Senate" or "House" next to a rep's name tells you which chamber of
            Congress they serve in. Senators and House Representatives have
            different roles and powers.
          </Term>
          <Term word="Voting Record">
            A log of every bill your representative voted on — "Yea" (yes),
            "Nay" (no), or "Not Voting" (they were absent or abstained). This is
            the most direct way to see if your rep's actions match their words.
          </Term>
          <Term word="Alignment Score">
            How closely a representative's votes align with your stated
            interests and priorities. A higher score means they vote in ways that
            match what you care about.
          </Term>
          <Term word="Party Loyalty %">
            How often the representative votes with their own party. A high
            percentage means they follow the party line; a low percentage means
            they're more independent.
          </Term>
          <Term word="Attendance %">
            How often the representative shows up to vote. A lower number means
            they're missing votes — which means they're not doing their job of
            representing you.
          </Term>
          <Term word="Bipartisanship Score">
            How often the representative works with members of the other party.
            A higher score means they're more willing to compromise and
            collaborate across party lines.
          </Term>
          <Term word="Effectiveness Score">
            How many of the bills they've sponsored actually advance through the
            process. A high score means they're good at getting things done, not
            just introducing bills that go nowhere.
          </Term>
          <Term word="Bills Sponsored">
            Bills your representative personally introduced or co-sponsored.
            This shows what issues they actively work on — not just what they
            talk about.
          </Term>
          <Term word="Promise Tracker">
            Tracks campaign promises — what they said they'd do vs. what they
            actually did:
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>Kept</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <XCircle className="h-3.5 w-3.5 text-red-600" />
                <span>Broken</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-purple-600" />
                <span>Compromised</span>
              </div>
            </div>
          </Term>
          <Term word="Contact Rep">
            Phone number, email, and office address so you can actually reach
            out. Calling your representative is one of the most effective ways
            to influence legislation — their staff tracks every call.
          </Term>
        </FeatureSection>

        {/* ============================================================ */}
        {/* ACTIONS                                                      */}
        {/* ============================================================ */}
        <FeatureSection
          icon={Gavel}
          title="Actions"
          route="/actions"
          color="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
          description="Executive orders, presidential memoranda, and regulatory changes — government actions that don't go through Congress. The President and federal agencies can make sweeping changes without a single Congressional vote."
        >
          <Term word="Why Does This Section Exist?">
            Many people think laws only come from Congress, but the
            President and federal agencies also take major actions that affect
            your daily life — from environmental rules to immigration policies.
            This section tracks those actions so nothing happens without your
            knowledge.
          </Term>
          <Term word="Executive Order">
            A directive from the President that has the force of law. It doesn't
            need Congress to approve it. The President signs it, and it takes
            effect. Examples: travel bans, federal hiring freezes, environmental
            regulations. Executive orders can be reversed by the next president.
          </Term>
          <Term word="Presidential Memorandum">
            Similar to an executive order but usually more narrow in scope. It
            directs a specific federal agency to take a specific action. For
            example, telling the Department of Education to change student loan
            rules.
          </Term>
          <Term word="Rule / Regulation">
            Detailed guidelines created by federal agencies (like the EPA, FDA,
            or FCC) to implement laws. When Congress passes a broad law, agencies
            write the specific rules. A rule change can affect everything from
            food labels to internet pricing to car emissions.
          </Term>
          <Term word="Proclamation">
            A formal statement from the President. Some are ceremonial (National
            Pizza Day), but others have real legal effect (declaring a national
            emergency).
          </Term>
          <Term word="Federal Register">
            The official daily journal of the U.S. government. Every executive
            order, proposed rule, and public notice gets published here —
            think of it as the government's public diary. The Actions tab pulls
            directly from this source.
          </Term>
          <Term word="Impact Badge: High / Medium / Low">
            <div className="flex flex-wrap gap-2 mt-1 mb-1">
              <StatusBadge
                label="High Impact"
                className="bg-red-100 text-red-800"
              />
              <StatusBadge
                label="Medium Impact"
                className="bg-yellow-100 text-yellow-800"
              />
              <StatusBadge
                label="Low Impact"
                className="bg-green-100 text-green-800"
              />
            </div>
            An estimate of how much the action affects everyday people. "High"
            means major changes to policy, funding, or rights. "Low" means
            routine or procedural.
          </Term>
          <Term word="Action Type Badge">
            The colored badge at the top of each action card tells you what
            kind of government action it is — Executive Order, Memorandum, Rule,
            Proclamation, etc. This helps you quickly scan what's happening.
          </Term>
          <Term word="Timeline">
            Shows the progression of an action from announcement to
            implementation. Important because many actions don't take effect
            immediately — they go through comment periods and reviews.
          </Term>
          <Term word="Legal Challenges">
            Lawsuits filed against government actions. Courts can block, modify,
            or overturn executive orders if they violate the Constitution or
            existing law. This section shows ongoing court battles.
          </Term>
        </FeatureSection>

        {/* ============================================================ */}
        {/* VOTEMAP                                                      */}
        {/* ============================================================ */}
        <FeatureSection
          icon={Vote}
          title="VoteMap"
          route="/vote"
          color="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
          description="Take a short policy quiz, then see which candidates running for office most closely match your views. It also shows candidate funding, policy positions, and reputation — so you can make an informed choice."
        >
          <Term word="Policy Quiz">
            A short questionnaire about your views on key issues (healthcare,
            economy, education, immigration, environment, etc.). Your answers
            are used to calculate which candidates align with your beliefs. It
            takes about 2 minutes.
          </Term>
          <Term word="Match Score">
            After completing the quiz, each candidate gets a percentage showing
            how closely their positions match yours. 90% match means you agree
            on almost everything. 40% means you disagree on most issues.
          </Term>
          <Term word="Candidate">
            A person running for public office — House of Representatives,
            Senate, or President. Data comes from the Federal Election Commission
            (FEC), the official source for campaign information.
          </Term>
          <Term word="Incumbent">
            The person currently holding the office. They're running for
            re-election against "challengers" who want to take their seat.
            Incumbents usually have an advantage because they're already known.
          </Term>
          <Term word="Challenger">
            A candidate running against the incumbent. They're trying to win the
            seat from the person who currently holds it.
          </Term>
          <Term word="Policy Positions (Score Bar: -2 to +2)">
            A visual scale showing where a candidate stands on each issue:
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 rounded bg-gradient-to-r from-red-400 to-red-600" />
                <span>-2 / -1 = More conservative position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 rounded bg-gray-300" />
                <span>0 = Centrist / moderate position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 rounded bg-gradient-to-r from-blue-400 to-blue-600" />
                <span>+1 / +2 = More progressive position</span>
              </div>
            </div>
          </Term>
          <Term word="Funding / Campaign Finance">
            Shows who is financing the candidate's campaign — total money
            raised, number of individual donors, and top contributors.
            Understanding who funds a candidate helps you understand whose
            interests they might prioritize.
          </Term>
          <Term word="Reputation Card">
            A summary of the candidate's public record and how they're perceived
            — including endorsements, controversies, and track record.
          </Term>
          <Term word="District">
            A geographic area within a state that elects one House
            Representative. For example, Arizona has 9 districts. Senators
            represent the whole state, not a specific district. Your district is
            determined by where you live.
          </Term>
        </FeatureSection>

        {/* ============================================================ */}
        {/* DASHBOARD                                                    */}
        {/* ============================================================ */}
        <Card className="p-6" id="dashboard">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 shrink-0">
              <Eye className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg font-bold">Dashboard</h2>
                <Link
                  to="/dashboard"
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  Go to Dashboard <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your personal homepage on CitizenOS. After you log in, the
                Dashboard gives you a quick snapshot of everything relevant to
                you.
              </p>
              <dl className="divide-y">
                <Term word="Quick Links (Saved Bills, Actions, Reps, Quiz)">
                  Four cards at the top for instant access to your saved items.
                  Numbers on each card show how many items you've bookmarked.
                </Term>
                <Term word="Notifications">
                  Updates about bills you've saved, actions in your categories,
                  or news about your representatives. Filtered by importance
                  (high/medium) so you see what matters most.
                </Term>
                <Term word="Government Actions Feed">
                  A compact list of the latest executive actions, so you can
                  stay informed without going to the full Actions page.
                </Term>
                <Term word="Your Representatives">
                  If you've set your state, you'll see your Senators and House
                  Representative right on the dashboard with their party and
                  key scores.
                </Term>
              </dl>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* DATA SOURCES                                                 */}
        {/* ============================================================ */}
        <Card className="p-6" id="data-sources">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">
                Where Our Data Comes From
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                CitizenOS pulls from <strong>official government APIs</strong> —
                the same databases that government websites use. We don't make
                up numbers or editorialize. Every data point has a source.
              </p>
              <dl className="divide-y">
                <Term word="Congress.gov API">
                  Run by the Library of Congress. This is the official source for
                  federal bills, resolutions, representatives, committees, and
                  voting records. Powers the BillBreaker and RepScore sections.
                </Term>
                <Term word="OpenStates API">
                  Tracks state legislature activity across all 50 states +
                  D.C. This is where the map's bill counts and civic scores come
                  from. Data is updated daily. OpenStates is a respected
                  nonpartisan civic data project.
                </Term>
                <Term word="Federal Register API">
                  Published by the National Archives. The official source for
                  executive orders, regulations, proclamations, and other
                  presidential actions. Powers the Actions section.
                </Term>
                <Term word="FEC (Federal Election Commission) API">
                  The official source for campaign finance data — who's running
                  for office, how much they've raised, and who's donating. Powers
                  the VoteMap candidates section.
                </Term>
                <Term word="Google Civic Information API">
                  Provides representative contact information like phone numbers,
                  email addresses, and office addresses. Used in the Contact Rep
                  feature.
                </Term>
                <Term word="LIVE API vs. DEMO DATA badges">
                  Throughout the app you'll see small badges:{' '}
                  <StatusBadge
                    label="LIVE API"
                    className="bg-green-100 text-green-800"
                  />{' '}
                  means the data is coming from a real government source right
                  now.{' '}
                  <StatusBadge
                    label="DEMO DATA"
                    className="bg-amber-100 text-amber-800"
                  />{' '}
                  means we're showing sample data (usually because the API is
                  temporarily unavailable or rate-limited). The underlying data
                  source is always shown so you know exactly what you're looking
                  at.
                </Term>
              </dl>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* COMMON TERMS GLOSSARY                                        */}
        {/* ============================================================ */}
        <Card className="p-6" id="glossary">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">
                Common Terms Glossary (A–Z)
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Words you'll see across CitizenOS and in political news,
                explained in everyday language.
              </p>
              <dl className="divide-y">
                <Term word="Amendment">
                  A change or addition to a bill (or the Constitution). Congress
                  members can propose amendments to modify a bill before voting
                  on it.
                </Term>
                <Term word="Appropriation">
                  Government money set aside for a specific purpose. An
                  "appropriations bill" decides how federal money gets spent —
                  this is how Congress controls the budget.
                </Term>
                <Term word="Bipartisan">
                  Supported by both Democrats and Republicans. A bipartisan bill
                  has sponsors from both parties, which usually means it has a
                  better chance of passing.
                </Term>
                <Term word="Caucus">
                  An informal group of Congress members who share a common
                  interest or identity. Examples: the Congressional Black
                  Caucus, the Freedom Caucus. They coordinate to push shared
                  priorities.
                </Term>
                <Term word="Cloture">
                  A Senate procedure to end debate and force a vote. Requires 60
                  of 100 senators to agree. This is how they stop a filibuster.
                </Term>
                <Term word="Constituent">
                  A person who lives in a representative's district or state.
                  If you live in Arizona, you are a "constituent" of Arizona's
                  senators. Your representatives are supposed to represent your
                  interests.
                </Term>
                <Term word="Deficit / Surplus">
                  When the government spends more than it takes in (taxes), that
                  gap is the "deficit." If it takes in more than it spends,
                  that's a "surplus." The U.S. has been running deficits for
                  decades.
                </Term>
                <Term word="Filibuster">
                  When a senator talks indefinitely to delay or block a vote.
                  It's a stalling tactic unique to the Senate. Cloture (see
                  above) is the way to stop it.
                </Term>
                <Term word="Gerrymandering">
                  Drawing congressional district boundaries to give one party an
                  unfair advantage. Named after Governor Elbridge Gerry in 1812
                  who approved weirdly shaped districts. It's legal in most
                  states but controversial.
                </Term>
                <Term word="Gridlock">
                  When Congress can't pass any laws because the two parties
                  refuse to compromise. Common when different parties control the
                  House and Senate.
                </Term>
                <Term word="Impeachment">
                  The formal process for charging a federal official (including
                  the President) with misconduct. The House votes to impeach; the
                  Senate holds a trial. Impeachment doesn't automatically mean
                  removal from office.
                </Term>
                <Term word="Lame Duck">
                  An elected official still in office after losing an election
                  or choosing not to run again. They serve out their remaining
                  term but have reduced political power.
                </Term>
                <Term word="Lobby / Lobbyist">
                  A person or group that tries to influence lawmakers on behalf
                  of a company, industry, or cause. Lobbying is legal and
                  happens constantly in D.C. Companies, unions, nonprofits — all
                  employ lobbyists.
                </Term>
                <Term word="Midterm Elections">
                  Elections held halfway through a president's 4-year term. All
                  435 House seats and about 1/3 of the 100 Senate seats are up
                  for vote. These elections often shift the balance of power.
                </Term>
                <Term word="Omnibus Bill">
                  A massive bill that bundles many unrelated laws into one
                  package. Often thousands of pages long. Members sometimes
                  attach unrelated "riders" (see below) to get them passed.
                </Term>
                <Term word="PAC / Super PAC">
                  Political Action Committee — an organization that raises money
                  to support or oppose candidates. A Super PAC can raise
                  unlimited money but can't coordinate directly with a candidate.
                  This is a major source of campaign funding.
                </Term>
                <Term word="Partisan">
                  Strongly aligned with one political party. The opposite of
                  "bipartisan." A "partisan bill" is supported only by members of
                  one party.
                </Term>
                <Term word="Primary Election">
                  An election within a party to choose their candidate for the
                  general election. For example, multiple Republicans compete in
                  a primary, and the winner becomes the Republican candidate.
                </Term>
                <Term word="Quorum">
                  The minimum number of members who must be present for a vote
                  to count. In the House, it's 218 out of 435. In the Senate,
                  it's 51 out of 100.
                </Term>
                <Term word="Redistricting">
                  Redrawing congressional district boundaries, which happens
                  every 10 years after the Census. This determines how many House
                  seats each state gets and which voters are in which districts.
                </Term>
                <Term word="Resolution">
                  A formal statement by Congress that may or may not have the
                  force of law. A "joint resolution" can become law; a "simple
                  resolution" is just an official opinion.
                </Term>
                <Term word="Rider">
                  An unrelated provision attached to a bill. For example, a
                  military spending bill might have a rider about farm subsidies.
                  Riders are controversial because they bypass normal debate.
                </Term>
                <Term word="Swing State">
                  A state where elections are very close and could go to either
                  party. These states get the most campaign attention. Examples:
                  Arizona, Pennsylvania, Georgia, Wisconsin.
                </Term>
                <Term word="Term Limit">
                  A restriction on how many times someone can be elected to the
                  same office. The President has a 2-term limit (8 years total).
                  Congress members currently have no term limits.
                </Term>
                <Term word="Trifecta">
                  When one party controls the governorship, state house, and
                  state senate. This makes it much easier to pass legislation
                  since there's no opposition to block it.
                </Term>
                <Term word="Veto Override">
                  If the President vetoes a bill, Congress can still make it law
                  by voting again with a 2/3 majority in both the House and
                  Senate. This is very rare.
                </Term>
                <Term word="Whip">
                  A party leader whose job is to count votes and make sure party
                  members vote the "right" way. Think of it as the team captain
                  keeping everyone in line.
                </Term>
              </dl>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* UNDERSTANDING THE UI — COLORS, BADGES, ICONS                */}
        {/* ============================================================ */}
        <Card className="p-6" id="understanding-the-ui">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200 shrink-0">
              <Palette className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-1">
                Understanding Colors, Badges & Icons
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                A quick reference for the visual elements you'll see throughout
                CitizenOS.
              </p>
              <dl className="divide-y">
                <Term word="Party Colors">
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-blue-500" />
                      <span>
                        <strong>Blue</strong> — Democrat
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-red-500" />
                      <span>
                        <strong>Red</strong> — Republican
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-purple-500" />
                      <span>
                        <strong>Purple</strong> — Independent / Split control
                      </span>
                    </div>
                  </div>
                </Term>
                <Term word="Bill Status Colors">
                  <div className="flex flex-wrap gap-2 mt-1">
                    <StatusBadge
                      label="Introduced"
                      className="bg-sky-100 text-sky-800"
                    />
                    <StatusBadge
                      label="In Committee"
                      className="bg-amber-100 text-amber-800"
                    />
                    <StatusBadge
                      label="Passed House"
                      className="bg-blue-100 text-blue-800"
                    />
                    <StatusBadge
                      label="Passed Senate"
                      className="bg-indigo-100 text-indigo-800"
                    />
                    <StatusBadge
                      label="Enacted"
                      className="bg-green-100 text-green-800"
                    />
                    <StatusBadge
                      label="Vetoed"
                      className="bg-red-100 text-red-800"
                    />
                  </div>
                  <span className="block mt-2">
                    Colors go from cool (blue/sky) for early stages to warm
                    (green/red) for final outcomes.
                  </span>
                </Term>
                <Term word="Impact Levels">
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label="High Impact"
                        className="bg-red-100 text-red-800"
                      />
                      <span className="text-xs">
                        Major policy change — affects many people
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label="Medium Impact"
                        className="bg-yellow-100 text-yellow-800"
                      />
                      <span className="text-xs">
                        Moderate change — affects specific groups
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label="Low Impact"
                        className="bg-green-100 text-green-800"
                      />
                      <span className="text-xs">
                        Routine / procedural — limited direct effect
                      </span>
                    </div>
                  </div>
                </Term>
                <Term word="Bookmark / Save Icon">
                  The bookmark icon on bill and action cards saves items to your
                  Dashboard. Saved items appear in your quick links and you'll
                  receive notifications when they change.
                </Term>
                <Term word="LIVE API / DEMO DATA">
                  <StatusBadge
                    label="LIVE API"
                    className="bg-green-100 text-green-800"
                  />{' '}
                  = real-time government data.{' '}
                  <StatusBadge
                    label="DEMO DATA"
                    className="bg-amber-100 text-amber-800"
                  />{' '}
                  = sample data shown when the API is temporarily unavailable.
                </Term>
              </dl>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* FAQ                                                          */}
        {/* ============================================================ */}
        <Card className="p-6" id="faq">
          <div className="flex items-start gap-4">
            <div className="rounded-lg p-2.5 bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200 shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-2">
                <Expandable title="I'm not a U.S. citizen. Can I still use CitizenOS?">
                  Absolutely. CitizenOS is a public information tool — anyone
                  can explore bills, track government actions, learn about
                  representatives, and understand how the U.S. political system
                  works. You don't need to be a citizen or even a resident to
                  use it.
                </Expandable>
                <Expandable title="What's the difference between the bill count on the map and the bills in BillBreaker?">
                  The map shows <strong>state legislature</strong> bills —
                  laws proposed in each state's own government. BillBreaker
                  shows <strong>federal bills</strong> — laws proposed in the
                  U.S. Congress in Washington, D.C. They're two completely
                  different sets of legislation. State bills only apply within
                  that state; federal bills apply to the whole country.
                </Expandable>
                <Expandable title="How often is the data updated?">
                  It depends on the source. Congress.gov data updates within
                  hours of new bills and votes. OpenStates (state bill counts)
                  updates daily. The Federal Register publishes new actions
                  every business day. FEC campaign data updates quarterly during
                  election season. We cache data for a few minutes to keep
                  things fast.
                </Expandable>
                <Expandable title="Is CitizenOS politically biased?">
                  No. We pull data directly from official, nonpartisan
                  government sources. We don't add editorials, opinions, or
                  political commentary. The AI summaries are designed to be
                  neutral and factual. Party labels (D, R, I) come from
                  official records, not our judgments.
                </Expandable>
                <Expandable title="What does the AI summary do differently than just reading the bill?">
                  Bills are written in dense legal language, often hundreds of
                  pages long. The AI reads the full text and gives you a 2-3
                  paragraph summary in plain English — what the bill does, who
                  it affects, and why it matters. It saves you hours of reading
                  and helps you understand bills that would otherwise be
                  inaccessible.
                </Expandable>
                <Expandable title="Can I contact my representative through CitizenOS?">
                  CitizenOS provides your representative's official phone
                  number, email, and office address (via Google Civic
                  Information). You'll need to call, email, or write them
                  directly — we don't send messages on your behalf. Calling is
                  often the most effective method.
                </Expandable>
                <Expandable title="What does 'Split' party control mean on the map?">
                  It means power is divided in that state. Usually this means
                  the governor is from one party while the state legislature is
                  controlled by the other party. This often leads to more
                  political negotiation (and sometimes gridlock).
                </Expandable>
                <Expandable title="How is the Civic Score calculated?">
                  The civic score is derived from the number of state
                  legislature bills introduced. It uses a logarithmic formula —
                  so going from 0 to 100 bills makes a big difference, but
                  going from 2,000 to 2,100 doesn't change the score much.
                  The maximum score is 100.
                </Expandable>
                <Expandable title="What personas are available in BillBreaker's Impact Panel?">
                  Common personas include: Student, Worker, Parent, Small
                  Business Owner, Veteran, Retiree, Healthcare Worker,
                  Immigrant, and more. Each shows how a bill might affect
                  someone in that situation. Select the one closest to your life
                  circumstances for the most relevant analysis.
                </Expandable>
                <Expandable title="Why does it say 'DEMO DATA' instead of 'LIVE API'?">
                  Government APIs have usage limits. If we hit a rate limit or
                  the API is temporarily down, we show cached sample data
                  instead of nothing. The "DEMO DATA" badge lets you know the
                  information might not be the most current — but it's still
                  based on real data.
                </Expandable>
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* FOOTER                                                       */}
        {/* ============================================================ */}
        <Card className="p-6 bg-muted/50">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              Still have questions?
            </p>
            <p className="text-xs text-muted-foreground">
              Visit our{' '}
              <a
                href="https://github.com/Manan-Santoki/claude-asu-hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub repository
              </a>{' '}
              or reach out to the team. We're building this for everyone —
              your feedback makes it better.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link to="/map">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Map className="h-3.5 w-3.5" />
                  Explore the Map
                </Button>
              </Link>
              <Link to="/bill">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Browse Bills
                </Button>
              </Link>
              <Link to="/vote">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Vote className="h-3.5 w-3.5" />
                  Take the Quiz
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
