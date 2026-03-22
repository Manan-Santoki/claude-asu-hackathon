// InsForge Edge Function: sync-state-stats
// Fetches current-year bill counts from OpenStates API and updates state_stats table.
// Accepts ?offset=0&limit=10 to process a subset of states per invocation.
// Call multiple times with different offsets to cover all 51 states.

import { createClient } from 'npm:@insforge/sdk';

const OPENSTATES_BASE = 'https://v3.openstates.org';
const OPENSTATES_API_KEY = Deno.env.get('OPENSTATES_API_KEY');

const ALL_CODES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const STATE_CODE_TO_NAME = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',
  CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',
  FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',
  IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',
  MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',
  MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',
  NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',
  NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',
  VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',
  WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',
};

const PARTY_CONTROL = {
  AL:'R',AK:'R',AZ:'split',AR:'R',CA:'D',CO:'D',CT:'D',DE:'D',
  FL:'R',GA:'R',HI:'D',ID:'R',IL:'D',IN:'R',IA:'R',KS:'split',
  KY:'split',LA:'R',ME:'D',MD:'D',MA:'D',MI:'D',MN:'D',MS:'R',
  MO:'R',MT:'R',NE:'R',NV:'split',NH:'split',NJ:'D',NM:'D',NY:'D',
  NC:'R',ND:'R',OH:'R',OK:'R',OR:'D',PA:'split',RI:'D',SC:'R',
  SD:'R',TN:'R',TX:'R',UT:'R',VT:'split',VA:'split',WA:'D',WV:'R',
  WI:'split',WY:'R',DC:'D',
};

function deriveCivicScore(billCount) {
  if (billCount <= 0) return 30;
  const raw = 30 + 14 * Math.log(billCount);
  return Math.min(100, Math.max(30, Math.round(raw)));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchBillCount(stateName, createdSince) {
  const url = new URL(`${OPENSTATES_BASE}/bills`);
  url.searchParams.set('apikey', OPENSTATES_API_KEY);
  url.searchParams.set('jurisdiction', stateName);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('created_since', createdSince);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OpenStates ${res.status}: ${stateName}`);
  const json = await res.json();
  return json.pagination.total_items;
}

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Parse offset/limit from query params (default: 9 states starting at 0)
  const url = new URL(req.url);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const limit = parseInt(url.searchParams.get('limit') || '9', 10);
  const codes = ALL_CODES.slice(offset, offset + limit);

  if (codes.length === 0) {
    return new Response(JSON.stringify({ success: true, message: 'No states in range' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const client = createClient({
    baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
    anonKey: Deno.env.get('ANON_KEY'),
  });

  const currentYear = new Date().getFullYear();
  const createdSince = `${currentYear}-01-01`;
  const errors = [''].slice(0, 0);
  let updated = 0;
  let failed = 0;

  // Process sequentially — 1 request every ~7s stays under 10/min
  for (const code of codes) {
    try {
      const stateName = STATE_CODE_TO_NAME[code];
      if (!stateName) continue;

      const billCount = await fetchBillCount(stateName, createdSince);
      const civicScore = deriveCivicScore(billCount);
      const partyControl = PARTY_CONTROL[code] || 'split';

      const { error } = await client.database
        .from('state_stats')
        .update({
          bill_count: billCount,
          civic_score: civicScore,
          party_control: partyControl,
          state_name: stateName,
          updated_at: new Date().toISOString(),
        })
        .eq('code', code);

      if (error) throw new Error(`DB: ${error.message}`);
      updated++;
    } catch (e) {
      failed++;
      errors.push(String(e instanceof Error ? e.message : 'Unknown'));
    }

    // 7s gap between requests
    if (codes.indexOf(code) < codes.length - 1) {
      await sleep(7000);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    updated,
    failed,
    errors,
    range: `${offset}-${offset + codes.length - 1}`,
    nextOffset: offset + limit < ALL_CODES.length ? offset + limit : null,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
