export interface DemoStep {
  id: string

  // Navigation
  route?: string
  transition?: string               // Label for page transition overlay (e.g. "BillBreaker")

  // UI actions — executed in sequence with delays
  spotlight?: string                 // CSS selector to highlight
  cursorTarget?: string              // CSS selector to move cursor to
  click?: string                     // CSS selector to auto-click after cursor arrives
  type?: {                           // Auto-type into an input
    selector: string
    text: string
    speed?: number
  }
  scroll?: string                    // CSS selector to scroll into view

  // Map
  mapAction?: {
    highlightState?: string
    clickState?: string
    colorMode?: string
  }

  // Store injection (run on step enter)
  storeActions?: StoreAction[]

  // Notification
  notification?: {
    title: string
    subtitle: string
    type: string
    sendEmail?: boolean              // Actually send email to captured address
  }

  // Narrator
  narrator: string
  narratorDuration?: number

  // Timing
  autoAdvanceAfter?: number
}

export interface StoreAction {
  store: 'auth' | 'quiz' | 'map' | 'bill' | 'action' | 'rep'
  action: string
  args?: unknown[]
}

export interface DemoPersona {
  id: string
  name: string
  age: number
  role: string
  location: string
  stateCode: string
  emoji: string
  color: string
  colorAccent: string
  icon: string
  tags: string[]
  categories: string[]
  backstory: string
  question: string
  quizAnswers: Record<string, number>
  steps: DemoStep[]
}

// ─── Persona Definitions ────────────────────────────────────────────────────

export const DEMO_PERSONAS: DemoPersona[] = [

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIYA SHARMA — H-1B Visa Holder
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'priya',
    name: 'Priya Sharma',
    age: 28,
    role: 'Software Engineer',
    location: 'San Jose, CA',
    stateCode: 'CA',
    emoji: '\u{1F310}',
    color: 'from-indigo-500 to-violet-600',
    colorAccent: 'border-indigo-500',
    icon: 'Globe',
    tags: ['visa_holder', 'student'],
    categories: ['immigration', 'labor', 'technology'],
    backstory: 'Came to the US on an F-1 for her MS at ASU, converted to H-1B. Her employer is a 40-person startup.',
    question: 'Will I lose my visa?',
    quizAnswers: {
      immigration: 2, healthcare: 1, economy: 1, education: 2,
      climate: 1, gun_policy: 0, criminal_justice: 1, foreign_policy: 1,
      social_issues: 2, gov_spending: -1,
    },
    steps: [
      // ── MAP ──
      {
        id: 'p-1',
        route: '/',
        transition: 'Interactive Map',
        narrator: 'Meet Priya \u2014 a software engineer in San Jose on an H-1B visa. Let\'s explore what government actions affect her, starting with the interactive map.',
        autoAdvanceAfter: 5500,
      },
      {
        id: 'p-2',
        mapAction: { highlightState: 'CA', colorMode: 'bill_activity' },
        cursorTarget: '[data-state="CA"]',
        click: '[data-state="CA"]',
        narrator: 'The map shows all 50 states color-coded by government activity. Clicking California reveals bills, actions, and representatives specific to Priya\'s state.',
        autoAdvanceAfter: 6000,
      },
      // ── ACTIONS TRACKER ──
      {
        id: 'p-3',
        route: '/actions',
        transition: 'Actions Tracker',
        narrator: 'The Actions Tracker goes beyond bills \u2014 it tracks executive orders, proclamations, agency rules, and court rulings. These affect people immediately, with no Congressional vote.',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'p-4',
        route: '/action/act-1',
        transition: 'H-1B $100K Fee',
        narrator: 'This presidential proclamation added a $100,000 fee to every H-1B petition. The AI summary breaks down 40 pages of legal text into plain English with specific dates and numbers.',
        spotlight: '[data-demo="ai-summary"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'p-5',
        narrator: 'The impact panel shows how this action affects Priya specifically as a visa holder. The same action looks completely different to a small business owner or a student.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'p-6',
        narrator: 'Two active court challenges. One fee upheld, one pending appeal. CitizenOS tracks every lawsuit so Priya knows if relief is coming.',
        spotlight: '[data-demo="legal-challenges"]',
        scroll: '[data-demo="legal-challenges"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'p-7',
        narrator: 'Priya can ask any question in plain English. The AI answers using the actual text of the proclamation, tailored to her visa status.',
        spotlight: '[data-demo="action-chat"]',
        scroll: '[data-demo="action-chat"]',
        type: {
          selector: '[data-demo="chat-input"]',
          text: 'Does this $100K fee apply if I\'m extending my existing H-1B?',
          speed: 35,
        },
        autoAdvanceAfter: 8000,
      },
      // ── BILLBREAKER ──
      {
        id: 'p-8',
        route: '/bill/hr-1234',
        transition: 'BillBreaker',
        narrator: 'BillBreaker turns complex legislation into plain English. This bill caps insulin at $35/month \u2014 relevant because Priya\'s coworker is diabetic. See the AI summary, status timeline, and how representatives voted.',
        spotlight: '[data-demo="ai-summary"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'p-9',
        narrator: 'The impact panel shows how this bill affects different personas. Priya sees it from a visa holder and student perspective \u2014 her coworker sees the small business angle.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 6000,
      },
      // ── REPSCORE ──
      {
        id: 'p-10',
        route: '/reps',
        transition: 'RepScore',
        narrator: 'RepScore tracks every representative\'s voting record, campaign promises, and accountability score. Priya can see how her California reps voted on immigration issues.',
        spotlight: '[data-demo="rep-list"]',
        autoAdvanceAfter: 6000,
      },
      // ── VOTEMAP ──
      {
        id: 'p-11',
        route: '/vote',
        transition: 'VoteMap',
        narrator: 'VoteMap matched Priya with candidates based on her policy values across 10 axes. 87% match with her top candidate \u2014 the radar chart shows exactly where they agree and disagree.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 7000,
      },
      // ── NOTIFICATION + EMAIL ──
      {
        id: 'p-12',
        notification: {
          title: 'H-1B Fee Court Ruling: Appeal Denied',
          subtitle: 'The D.C. Circuit has upheld the $100K H-1B supplemental fee. Your employer\'s petition costs are now confirmed permanent.',
          type: 'court_ruling',
          sendEmail: true,
        },
        narrator: 'A court ruling just dropped! CitizenOS sends Priya a real-time alert with personalized impact analysis \u2014 and a personalized email with news articles and a link to chat. Check your inbox!',
        autoAdvanceAfter: 10000,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARCUS RIVERA — Gig Worker
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'marcus',
    name: 'Marcus Rivera',
    age: 34,
    role: 'Rideshare Driver',
    location: 'Austin, TX',
    stateCode: 'TX',
    emoji: '\u{1F4BC}',
    color: 'from-amber-500 to-orange-600',
    colorAccent: 'border-amber-500',
    icon: 'Briefcase',
    tags: ['gig_worker'],
    categories: ['labor', 'healthcare', 'economy', 'tax'],
    backstory: 'Left a warehouse job for gig work flexibility. Drives 50 hours/week with no benefits or unemployment insurance.',
    question: 'How do tariffs hit my wallet?',
    quizAnswers: {
      immigration: 0, healthcare: 2, economy: 1, education: 0,
      climate: 0, gun_policy: -1, criminal_justice: 1, foreign_policy: -1,
      social_issues: 0, gov_spending: 1,
    },
    steps: [
      // ── MAP ──
      {
        id: 'm-1',
        route: '/',
        transition: 'Interactive Map',
        narrator: 'Meet Marcus \u2014 an Uber driver in Austin, TX. No employer benefits, no unemployment insurance. Let\'s see what government is doing about it.',
        autoAdvanceAfter: 5500,
      },
      {
        id: 'm-2',
        mapAction: { highlightState: 'TX', colorMode: 'party_control' },
        cursorTarget: '[data-state="TX"]',
        click: '[data-state="TX"]',
        narrator: 'The map can show party control, bill activity, or civic engagement scores. Texas highlights in red. Clicking reveals Marcus\'s state-specific data.',
        autoAdvanceAfter: 6000,
      },
      // ── REPSCORE (Marcus's main concern) ──
      {
        id: 'm-3',
        route: '/reps',
        transition: 'RepScore',
        narrator: 'Marcus wants to know: are his representatives fighting for gig workers? RepScore tracks voting records, campaign promises, and accountability for every member of Congress.',
        spotlight: '[data-demo="rep-list"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'm-4',
        route: '/rep/sen-cruz',
        narrator: 'Score gauges show promise alignment, party loyalty, and attendance. This rep promised to protect gig workers but voted against the Worker Classification Act. Promise alignment: 34%.',
        spotlight: '[data-demo="score-gauges"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'm-5',
        narrator: 'The voting record shows every vote, with the bill title and how the rep voted. Marcus can see exactly which promises were kept and which were broken.',
        spotlight: '[data-demo="voting-record"]',
        scroll: '[data-demo="voting-record"]',
        autoAdvanceAfter: 6000,
      },
      // ── ACTIONS TRACKER ──
      {
        id: 'm-6',
        route: '/actions',
        transition: 'Actions Tracker',
        narrator: 'Marcus doesn\'t just care about bills. Tariff executive orders raise auto parts prices. Agency rules change worker classification. These take effect immediately.',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'm-7',
        route: '/action/act-4',
        narrator: 'This executive order imposed 25% tariffs on steel imports. For Marcus, that means higher costs for replacement tires, brake pads, and vehicle maintenance. No one voted on this.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      // ── BILLBREAKER ──
      {
        id: 'm-8',
        route: '/bill/hr-1234',
        transition: 'BillBreaker',
        narrator: 'The Affordable Insulin Act matters to Marcus \u2014 as a gig worker with no employer insurance, a $35 insulin cap could save him thousands. BillBreaker explains exactly who\'s eligible.',
        spotlight: '[data-demo="ai-summary"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'm-9',
        narrator: 'Marcus asks the question every gig worker wants answered. The AI gives a straight, specific answer using the bill text.',
        spotlight: '[data-demo="bill-chat"]',
        scroll: '[data-demo="bill-chat"]',
        type: {
          selector: '[data-demo="chat-input"]',
          text: 'Am I eligible for the affordability program as a gig worker without employer insurance?',
          speed: 30,
        },
        autoAdvanceAfter: 8000,
      },
      // ── VOTEMAP ──
      {
        id: 'm-10',
        route: '/vote',
        transition: 'VoteMap',
        narrator: 'VoteMap matched Marcus with candidates based on his policy priorities \u2014 healthcare access, labor rights, and economic policy. The radar chart reveals alignment across 10 axes.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 6000,
      },
      // ── NOTIFICATION + EMAIL ──
      {
        id: 'm-11',
        notification: {
          title: 'New DOL Rule: Gig Worker Reclassification',
          subtitle: 'The Department of Labor has finalized a rule that may reclassify rideshare drivers as employees, entitling them to benefits and minimum wage protections.',
          type: 'final_rule',
          sendEmail: true,
        },
        narrator: 'Breaking \u2014 a new labor rule just dropped that could reclassify gig workers as employees. Marcus gets an instant alert AND a personalized email with news coverage. Check your inbox!',
        autoAdvanceAfter: 10000,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOFIA CHEN — College Student
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sofia',
    name: 'Sofia Chen',
    age: 21,
    role: 'Student at ASU',
    location: 'Tempe, AZ',
    stateCode: 'AZ',
    emoji: '\u{1F393}',
    color: 'from-emerald-500 to-teal-600',
    colorAccent: 'border-emerald-500',
    icon: 'GraduationCap',
    tags: ['student'],
    categories: ['education', 'economy', 'healthcare', 'technology'],
    backstory: '$47K in student loans. Works part-time at a campus lab. Voting for the first time.',
    question: 'Who should I vote for?',
    quizAnswers: {
      immigration: 1, healthcare: 2, economy: 1, education: 2,
      climate: 2, gun_policy: 1, criminal_justice: 2, foreign_policy: 0,
      social_issues: 2, gov_spending: -1,
    },
    steps: [
      // ── MAP ──
      {
        id: 's-1',
        route: '/',
        transition: 'Interactive Map',
        narrator: 'Meet Sofia \u2014 a junior at ASU with $47K in student loans. She\'s voting for the first time and wants to make an informed choice. Let\'s start with the map.',
        autoAdvanceAfter: 5500,
      },
      {
        id: 's-2',
        mapAction: { highlightState: 'AZ', colorMode: 'civic_score' },
        cursorTarget: '[data-state="AZ"]',
        click: '[data-state="AZ"]',
        narrator: 'Arizona highlights on the civic engagement map. The state panel shows bills, government actions, representatives, and candidates specific to Sofia\'s location.',
        autoAdvanceAfter: 6000,
      },
      // ── BILLBREAKER ──
      {
        id: 's-3',
        route: '/bill/hr-1234',
        transition: 'BillBreaker',
        narrator: 'Sofia\'s roommate is diabetic. The Affordable Insulin Act would cap her insulin at $35/month. BillBreaker explains the bill in plain English with AI-powered analysis.',
        spotlight: '[data-demo="ai-summary"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 's-4',
        narrator: 'The impact panel shows how this bill specifically affects students \u2014 campus health centers could access the affordability program, and students stay covered until age 26 on parent plans.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      // ── ACTIONS TRACKER ──
      {
        id: 's-5',
        route: '/actions',
        transition: 'Actions Tracker',
        narrator: 'Sofia\'s campus lab job is federally funded. Executive orders and agency actions on education funding affect her directly. The Actions Tracker monitors all 8 types of government actions.',
        autoAdvanceAfter: 6000,
      },
      {
        id: 's-6',
        route: '/action/act-1',
        narrator: 'Even the H-1B proclamation matters to Sofia \u2014 as a student considering graduate school, the impact panel shows how F-1 to H-1B conversion rules affect her future career options.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      // ── REPSCORE ──
      {
        id: 's-7',
        route: '/reps',
        transition: 'RepScore',
        narrator: 'Before voting, Sofia checks her representatives\' track records. RepScore reveals who actually kept their education promises and who just talked about it.',
        spotlight: '[data-demo="rep-list"]',
        autoAdvanceAfter: 6000,
      },
      // ── VOTEMAP (Sofia's primary feature) ──
      {
        id: 's-8',
        route: '/vote',
        transition: 'VoteMap',
        narrator: 'The big question: who should Sofia vote for? VoteMap asks 10 policy questions and matches her with candidates. Her answers are already filled in based on her profile.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 's-9',
        narrator: 'The radar chart shows exactly where Sofia and her top match agree and disagree across all 10 policy axes. Education and climate are strong matches. Economy shows some divergence.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 's-10',
        narrator: 'Side-by-side comparison reveals funding sources, endorsements, and controversy flags. One candidate funded by small donors, the other by PACs. Now Sofia can make an informed choice.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 7000,
      },
      // ── NOTIFICATION + EMAIL ──
      {
        id: 's-11',
        notification: {
          title: 'Student Loan Relief Act Passes Committee',
          subtitle: 'The Senate HELP Committee just approved a bill that would forgive $20K in student loans for public service workers. Campus lab work may qualify.',
          type: 'bill_status',
          sendEmail: true,
        },
        narrator: 'A student loan bill just passed committee! Sofia gets an instant alert \u2014 her campus lab job may qualify for $20K in forgiveness. A personalized email with full details is on its way. Check your inbox!',
        autoAdvanceAfter: 10000,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOB MITCHELL — Small Business Owner + Veteran
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bob',
    name: 'Bob Mitchell',
    age: 52,
    role: 'Restaurant Owner & Veteran',
    location: 'Columbus, OH',
    stateCode: 'OH',
    emoji: '\u{1F3EA}',
    color: 'from-rose-500 to-pink-600',
    colorAccent: 'border-rose-500',
    icon: 'Store',
    tags: ['small_business', 'veteran'],
    categories: ['economy', 'healthcare', 'tax', 'veterans', 'labor'],
    backstory: 'Opened his restaurant 15 years ago after the Army. Three employees are diabetic. Steel tariffs raised equipment costs.',
    question: 'Did my rep keep their promises?',
    quizAnswers: {
      immigration: -1, healthcare: 1, economy: -1, education: 0,
      climate: -1, gun_policy: -2, criminal_justice: 0, foreign_policy: 1,
      social_issues: -1, gov_spending: 2,
    },
    steps: [
      // ── MAP ──
      {
        id: 'b-1',
        route: '/',
        transition: 'Interactive Map',
        narrator: 'Meet Bob \u2014 Army veteran, restaurant owner in Columbus, OH. Three of his employees are diabetic and insurance costs are climbing. He wants answers.',
        autoAdvanceAfter: 5500,
      },
      {
        id: 'b-2',
        mapAction: { highlightState: 'OH' },
        cursorTarget: '[data-state="OH"]',
        click: '[data-state="OH"]',
        narrator: 'Ohio on the map. The state panel shows everything relevant to Bob\'s location \u2014 bills in committee, executive orders in effect, and his representatives\' records.',
        autoAdvanceAfter: 6000,
      },
      // ── BILLBREAKER (Bob's key concern) ──
      {
        id: 'b-3',
        route: '/bill/hr-1234',
        transition: 'BillBreaker',
        narrator: 'Bob heard about an insulin bill but doesn\'t know the details. BillBreaker turns 47 pages of legislation into 4 sentences. $35 insulin cap. $800 saved per employee per year.',
        spotlight: '[data-demo="ai-summary"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'b-4',
        narrator: 'As a small business owner, Bob saves on group insurance premiums. As a veteran, he already has VA pricing. CitizenOS shows BOTH perspectives on the same bill.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      {
        id: 'b-5',
        narrator: 'Every bill has an Impact Story \u2014 a real scenario showing who this affects and how. Maria in Phoenix spends $297/month on insulin. Under this bill: $35.',
        spotlight: '[data-demo="impact-story"]',
        scroll: '[data-demo="impact-story"]',
        autoAdvanceAfter: 6000,
      },
      // ── ACTIONS TRACKER ──
      {
        id: 'b-6',
        route: '/actions',
        transition: 'Actions Tracker',
        narrator: 'Bob\'s kitchen equipment costs spiked after tariff executive orders on steel and aluminum. The Actions Tracker monitors these orders, their court challenges, and how they affect small businesses.',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'b-7',
        route: '/action/act-4',
        narrator: 'This executive order imposed 25% tariffs on steel imports. For Bob, that\'s thousands more for commercial kitchen equipment. The impact panel breaks down the cost to his bottom line.',
        spotlight: '[data-demo="impact-panel"]',
        scroll: '[data-demo="impact-panel"]',
        autoAdvanceAfter: 7000,
      },
      // ── REPSCORE (Bob's main concern) ──
      {
        id: 'b-8',
        route: '/reps',
        transition: 'RepScore',
        narrator: 'Bob\'s Ohio rep promised to lower healthcare costs. Did they deliver? RepScore shows the voting record, promise tracker, and accountability score.',
        spotlight: '[data-demo="rep-list"]',
        autoAdvanceAfter: 6000,
      },
      {
        id: 'b-9',
        route: '/rep/sen-cruz',
        narrator: 'This rep voted NO on the Affordable Insulin Act \u2014 despite promising to lower healthcare costs. Promise status: Broken. Bob can generate a personalized email to hold them accountable.',
        spotlight: '[data-demo="contact-rep"]',
        scroll: '[data-demo="contact-rep"]',
        type: {
          selector: '[data-demo="chat-input"]',
          text: 'My 3 employees are diabetic and you voted NO on the insulin bill.',
          speed: 30,
        },
        autoAdvanceAfter: 8000,
      },
      // ── VOTEMAP ──
      {
        id: 'b-10',
        route: '/vote',
        transition: 'VoteMap',
        narrator: 'VoteMap shows Bob which candidates align with his values \u2014 fiscal conservatism, veteran support, healthcare access. The radar chart reveals agreement across 10 policy axes.',
        spotlight: '[data-demo="match-results"]',
        autoAdvanceAfter: 6000,
      },
      // ── NOTIFICATION + EMAIL ──
      {
        id: 'b-11',
        notification: {
          title: 'Affordable Insulin Act: Senate Vote Thursday',
          subtitle: 'The Senate will vote on the $35 insulin cap this Thursday. Your OH representative is listed as undecided. Now is the time to make your voice heard.',
          type: 'bill_status',
          sendEmail: true,
        },
        narrator: 'The insulin bill heads to the Senate floor Thursday! Bob gets an instant alert that his rep is undecided. A personalized email with news coverage and a "Contact your rep" link is in his inbox. Check your email!',
        autoAdvanceAfter: 10000,
      },
    ],
  },
]
