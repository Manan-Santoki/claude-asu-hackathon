// InsForge Edge Function: fetch-news
// Proxies News API requests to avoid browser CORS issues.
// Accepts GET ?q=<query>&pageSize=<n> OR POST { q, pageSize, language }

const NEWS_API_BASE = 'https://newsapi.org/v2';
const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY');

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let query, pageSize, language;

    if (req.method === 'POST') {
      // InsForge SDK sends POST with JSON body
      const body = await req.json();
      query = body.q;
      pageSize = body.pageSize || '10';
      language = body.language || 'en';
    } else {
      // Direct GET with query params
      const url = new URL(req.url);
      query = url.searchParams.get('q');
      pageSize = url.searchParams.get('pageSize') || '10';
      language = url.searchParams.get('language') || 'en';
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: q' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params = new URLSearchParams({
      q: query,
      sortBy: 'publishedAt',
      pageSize,
      language,
      apiKey: NEWS_API_KEY,
    });

    const res = await fetch(`${NEWS_API_BASE}/everything?${params.toString()}`);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[fetch-news] Error:', err);
    return new Response(JSON.stringify({
      status: 'error',
      message: String(err),
      articles: [],
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
