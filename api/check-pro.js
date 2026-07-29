export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ isPro: false });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const url = `${supabaseUrl}/rest/v1/subscribers?select=email,status&email=eq.${encodeURIComponent(email)}&status=eq.active`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    console.log('Supabase response:', text);
    
    const data = JSON.parse(text);
    const isPro = Array.isArray(data) && data.length > 0;
    
    res.status(200).json({ isPro, debug: data });
  } catch(e) {
    console.error(e);
    res.status(500).json({ isPro: false, error: e.message });
  }
}
