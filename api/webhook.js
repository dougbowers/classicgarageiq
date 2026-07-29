export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    const { type, data } = event;
    const obj = data?.object;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (type === 'customer.subscription.created' && 
        (obj?.status === 'active' || obj?.status === 'trialing')) {
      await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          email: obj?.customer_email || '',
          stripe_customer_id: obj?.customer,
          status: 'active'
        })
      });
    }

    if (type === 'invoice.payment_succeeded') {
      const email = obj?.customer_email;
      const customerId = obj?.customer;
      if (email || customerId) {
        await fetch(`${supabaseUrl}/rest/v1/subscribers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            email: email || '',
            stripe_customer_id: customerId,
            status: 'active'
          })
        });
      }
    }

    if (type === 'customer.subscription.deleted') {
      const customerId = obj?.customer;
      await fetch(`${supabaseUrl}/rest/v1/subscribers?stripe_customer_id=eq.${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
    }

    res.status(200).json({ received: true });
  } catch(e) {
    console.error('Webhook error:', e);
    res.status(200).json({ received: true });
  }
}
