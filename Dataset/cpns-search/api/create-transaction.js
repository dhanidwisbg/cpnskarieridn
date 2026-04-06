import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let snap;
//
function getMidtransSnap() {
  if (snap) return snap;
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
  });
  return snap;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const midtransSnap = getMidtransSnap();

    const orderId = `CPNS-${userId.slice(0, 8)}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 29000,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email,
      },
    };

    const transaction = await midtransSnap.createTransaction(parameter);

    // Save order_id to user profile
    await supabaseAdmin
      .from('user_profiles')
      .update({ midtrans_order_id: orderId })
      .eq('id', userId);

    res.status(200).json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error('Midtrans error:', error);
    res.status(500).json({ error: error.message });
  }
}
