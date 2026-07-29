export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ isPro: false });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/subscribers?select=email,status`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    console.log('All subscribers:', JSON.stringify(data));
    
    const isPro = Array.isArray(data) && data.some(
      row => row.email?.toLowerCase().trim() === email.toLowerCase().trim() 
             && row.status === 'active'
    );
    
    res.status(200).json({ isPro, debug: data });
  } catch(e) {
    console.error(e);
    res.status(500).json({ isPro: false, error: e.message });
  }
}
