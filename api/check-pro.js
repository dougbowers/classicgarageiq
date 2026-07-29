export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ isPro: false });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/subscribers?email=eq.${encodeURIComponent(email)}&status=eq.active&select=email,status`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    const data = await response.json();
    const isPro = data && data.length > 0;
    res.status(200).json({ isPro });
  } catch(e) {
    res.status(500).json({ isPro: false, error: e.message });
  }
}
