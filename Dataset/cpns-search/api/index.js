// LOCAL DEV ONLY — for Vercel deployment, use api/create-transaction.js and api/notification.js

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import midtransClient from 'midtrans-client';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Supabase
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Midtrans Snap API
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.VITE_MIDTRANS_CLIENT_KEY,
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create Midtrans Snap transaction
app.post('/api/create-transaction', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const orderId = `CPNS-${userId.slice(0, 8)}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 39000, // Rp 39.000
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email,
      },
      callbacks: {
        finish: process.env.VITE_APP_URL
          ? `${process.env.VITE_APP_URL}?payment=success`
          : 'http://localhost:5173?payment=success',
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Save order_id to user profile
    await supabaseAdmin
      .from('user_profiles')
      .update({ midtrans_order_id: orderId })
      .eq('id', userId);

    res.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error('Midtrans error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Midtrans notification webhook
app.post('/api/notification', async (req, res) => {
  try {
    // Notification body is sent directly by Midtrans
    const { order_id, transaction_status, fraud_status } = req.body;

    console.log(`[Midtrans] Notification received: ${order_id} - ${transaction_status}`);

    if (!order_id) {
      return res.status(200).json({ status: 'ok' });
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'accept' || fraud_status === undefined) {
        // Find user by midtrans_order_id and update is_paid
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
});

// Check payment status (server-side, bypasses RLS)
app.get('/api/payment-status', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_paid')
      .eq('id', userId)
      .maybeSingle();

    res.json({ isPaid: profile?.is_paid ?? false });
  } catch (error) {
    console.error('[PaymentStatus] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
