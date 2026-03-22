// InsForge Edge Function: send-demo-email
// Sends a personalized demo alert email using Resend API
// Falls back gracefully if RESEND_API_KEY is not set

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { to, subject, html, persona } = await req.json();

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      // No API key — log and return simulated success
      console.log(`[send-demo-email] Simulated email to ${to} | Subject: ${subject} | Persona: ${persona}`);
      return new Response(JSON.stringify({
        success: true,
        simulated: true,
        message: 'Email simulated (no RESEND_API_KEY configured)',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CitizenOS Alerts <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[send-demo-email] Resend error:', result);
      return new Response(JSON.stringify({
        success: false,
        error: result.message || 'Failed to send email',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      simulated: false,
      emailId: result.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[send-demo-email] Error:', err);
    return new Response(JSON.stringify({
      success: false,
      error: String(err),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
