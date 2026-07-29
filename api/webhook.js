export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = req.body;
  } catch(e) {
    return res.status(400).json({ error: e.message });
  }

  const { type, data } = event;
  const customer = data?.object?.customer;
  const status = data?.object?.status;

  if (type === 'customer.subscription.created' && 
      (status === 'active' || status === 'trialing')) {
    console.log('New Pro subscriber:', customer);
  }

  if (type === 'customer.subscription.deleted') {
    console.log('Cancelled subscription:', customer);
  }

  if (type === 'invoice.payment_succeeded') {
    console.log('Payment succeeded for:', customer);
  }

  res.status(200).json({ received: true });
}
