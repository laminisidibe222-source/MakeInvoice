import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

// CORS — allow your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// IMPORTANT: keep raw body for webhook signature verification if needed
app.use('/api/paydunya/webhook', express.json({ type: '*/*' }));
app.use(express.json());

// Supabase admin client (service role — full access, backend only)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// Plan configuration (source of truth for prices)
// ============================================
const PLANS = {
  starter:  { name: 'Starter',  amount: 4500,  limit: 10,  label: 'MakeInvoice Starter — 10 factures' },
  pro:      { name: 'Pro',      amount: 7500,  limit: 30,  label: 'MakeInvoice Pro — 30 factures' },
  business: { name: 'Business', amount: 12000, limit: 100, label: 'MakeInvoice Business — 100 factures' },
};

// ============================================
// PayDunya base URL
// ============================================
const PAYDUNYA_BASE = process.env.PAYDUNYA_MODE === 'test'
  ? 'https://app.paydunya.com/sandbox-api/v1'
  : 'https://app.paydunya.com/api/v1';

// ============================================
// Auth middleware — verifies Supabase JWT
// ============================================
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

// ============================================
// Health check
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.PAYDUNYA_MODE });
});

// ============================================
// GET /api/me — returns user plan + quota
// ============================================
app.get('/api/me', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, invoices_generated, invoices_limit, full_name, company_name')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================
// POST /api/pay — create PayDunya checkout
// ============================================
app.post('/api/pay', requireAuth, async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PLANS[plan];

    if (!planConfig) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    // Build payload for PayDunya
    const payload = {
      invoice: {
        total_amount: planConfig.amount,
        description: planConfig.label,
      },
      store: {
        name: 'MakeInvoice',
        tagline: 'Générateur de factures professionnel',
        website_url: process.env.FRONTEND_URL,
      },
      custom_data: {
        user_id: req.user.id,
        user_email: req.user.email,
        plan,
        method: req.body.method || 'wave',
        phone: req.body.phone || '',
      },
      actions: {
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/paydunya/webhook`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    };

    const response = await fetch(`${PAYDUNYA_BASE}/checkout-invoice/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
        'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
        'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('PayDunya create response:', data);

    if (data.response_code !== '00') {
      return res.status(500).json({
        error: 'Échec de création du paiement',
        details: data,
      });
    }

    // Log the pending payment
    await supabase.from('payments').insert({
      user_id: req.user.id,
      plan,
      amount: planConfig.amount,
      provider: 'paydunya',
      provider_token: data.token,
      status: 'pending',
      metadata: { checkout_url: data.response_text },
    });

    res.json({
      checkout_url: data.response_text,
      token: data.token,
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// POST /api/paydunya/webhook — PayDunya IPN callback
// ============================================
app.post('/api/paydunya/webhook', async (req, res) => {
  try {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));

    // PayDunya sends the payment data in req.body
    // We need to verify it by fetching the invoice status
    const { data } = req.body;

    if (!data || !data.token) {
      return res.status(400).send('Invalid webhook payload');
    }

    // Verify the payment status with PayDunya
    const verifyResponse = await fetch(
      `${PAYDUNYA_BASE}/checkout-invoice/confirm/${data.token}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
          'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
          'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log('PayDunya verify:', verifyData);

    // Check status — "completed" means payment succeeded
    if (verifyData.status !== 'completed') {
      console.log('Payment not completed:', verifyData.status);
      return res.status(200).send('OK — not completed');
    }

    const customData = verifyData.custom_data || {};
    const { user_id, plan } = customData;

    if (!user_id || !plan) {
      console.error('Missing user_id or plan in webhook');
      return res.status(400).send('Missing metadata');
    }

    // 1. Upgrade user plan via RPC
    const { error: rpcError } = await supabase.rpc('upgrade_plan', {
      p_user_id: user_id,
      p_plan: plan,
    });

    if (rpcError) {
      console.error('Upgrade error:', rpcError);
      return res.status(500).send('Upgrade failed');
    }

    // 2. Mark payment as completed
    await supabase
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('provider_token', data.token);

    console.log(`✅ User ${user_id} upgraded to ${plan}`);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook error');
  }
});

// ============================================
// POST /api/invoices — create invoice (server-side quota check)
// ============================================
app.post('/api/invoices', requireAuth, async (req, res) => {
  try {
    // Check quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('invoices_generated, invoices_limit')
      .eq('id', req.user.id)
      .single();

    if (profile.invoices_generated >= profile.invoices_limit) {
      return res.status(403).json({
        error: 'Quota atteint. Passez à un plan supérieur.',
        code: 'QUOTA_EXCEEDED',
      });
    }

    // Insert invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Increment counter
    await supabase.rpc('increment_invoice_count', { p_user_id: req.user.id });

    res.json(invoice);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// Start server
// ============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 MakeInvoice backend running on port ${PORT}`);
  console.log(`   PayDunya mode: ${process.env.PAYDUNYA_MODE}`);
});