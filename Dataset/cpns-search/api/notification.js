import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, transaction_status, fraud_status } = req.body;

    console.log(`[Midtrans] Notification received: ${order_id} - ${transaction_status}`);

    if (!order_id) {
      return res.status(200).json({ status: 'ok' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'accept' || fraud_status === undefined) {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('midtrans_order_id', order_id)
          .maybeSingle();

        if (profile) {
          await supabaseAdmin
            .from('user_profiles')
            .update({
              is_paid: true,
              paid_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
          console.log(`[Midtrans] User ${profile.id} is now PAID`);
        } else {
          console.log(`[Midtrans] No profile found for order: ${order_id}`);
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Midtrans] Notification error:', error);
    res.status(500).json({ error: error.message });
  }
}
