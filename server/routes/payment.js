const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const { supabase } = require('../lib/supabase');

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Helper: add games to library after successful payment
async function addGamesToLibrary(orderId) {
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(game_id)')
    .eq('order_code', orderId)
    .single();

  if (!order) return;

  for (const item of order.order_items) {
    // Check if already in library
    const { data: existing } = await supabase
      .from('library')
      .select('id')
      .eq('user_id', order.user_id)
      .eq('game_id', item.game_id)
      .eq('isdeleted', 0)
      .maybeSingle();

    if (!existing) {
      await supabase.from('library').insert({
        user_id: order.user_id,
        game_id: item.game_id,
        purchased_at: new Date().toISOString(),
        status: 1,
        isdeleted: 0,
      });
    }
  }

  console.log(`🎮 Games added to user library for order ${orderId}`);
}

// POST /api/payment/create-transaction
router.post('/create-transaction', async (req, res) => {
  try {
    const { user_id, user_email, items, total } = req.body;

    if (!user_id || !items || items.length === 0 || !total) {
      return res.status(400).json({ error: 'Data transaksi tidak lengkap' });
    }

    // Generate unique order code
    const orderCode = `NEXUS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create Midtrans transaction parameter
    const parameter = {
      transaction_details: {
        order_id: orderCode,
        gross_amount: Math.round(total),
      },
      item_details: items.map(item => ({
        id: item.id,
        name: item.title.substring(0, 50),
        price: Math.round(item.price),
        quantity: 1,
      })),
      customer_details: {
        email: user_email,
      },
      credit_card: {
        secure: true,
      },
    };

    // Create Midtrans Snap transaction
    const transaction = await snap.createTransaction(parameter);

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id,
        order_code: orderCode,
        total_amount: Math.round(total),
        midtrans_order_id: orderCode,
        status: 1, // 1 = pending
        isdeleted: 0,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Save order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      game_id: item.id,
      price: Math.round(item.price),
      quantity: 1,
      status: 1,
      isdeleted: 0,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    console.log(`✅ Order created: ${orderCode} | Total: Rp ${total.toLocaleString()}`);

    res.json({
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_code: orderCode,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message || 'Gagal membuat transaksi' });
  }
});

// POST /api/payment/confirm-success
// Called by the client-side onSuccess callback to update order status
// and add games to library (because Midtrans webhook can't reach localhost)
router.post('/confirm-success', async (req, res) => {
  try {
    const { order_code } = req.body;

    if (!order_code) {
      return res.status(400).json({ error: 'order_code diperlukan' });
    }

    // Verify with Midtrans that the transaction is actually settled/captured
    let midtransStatus;
    try {
      midtransStatus = await snap.transaction.status(order_code);
    } catch (midtransError) {
      console.warn(`⚠️ Could not verify with Midtrans for ${order_code}: ${midtransError.message}`);
      // In sandbox mode, we'll still proceed if Midtrans verification fails
    }

    let paymentMethod = 'unknown';
    let isVerified = false;

    if (midtransStatus) {
      const { transaction_status, fraud_status, payment_type } = midtransStatus;
      paymentMethod = payment_type || 'unknown';

      // Only confirm if Midtrans says it's actually successful
      if (
        transaction_status === 'settlement' ||
        (transaction_status === 'capture' && fraud_status === 'accept')
      ) {
        isVerified = true;
      }
    }

    // In sandbox mode, trust the client callback if Midtrans verification fails
    if (!isVerified && process.env.MIDTRANS_IS_PRODUCTION !== 'true') {
      console.log(`⚠️ Sandbox mode: trusting client callback for ${order_code}`);
      isVerified = true;
    }

    if (!isVerified) {
      return res.status(400).json({ error: 'Transaksi belum berhasil menurut Midtrans' });
    }

    // Update order status to paid (2)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 2, // paid
        payment_method: paymentMethod,
        lastupdateddate: new Date().toISOString(),
      })
      .eq('order_code', order_code);

    if (updateError) throw updateError;

    // Add games to library
    await addGamesToLibrary(order_code);

    console.log(`✅ Order ${order_code} confirmed as PAID, games added to library`);
    res.json({ status: 'ok', message: 'Pembayaran dikonfirmasi dan game ditambahkan ke perpustakaan' });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payment/notification
// Webhook handler for Midtrans payment notifications
router.post('/notification', async (req, res) => {
  try {
    const notification = req.body;
    console.log('📨 Payment notification received:', JSON.stringify(notification, null, 2));

    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;

    console.log(`📋 Order: ${orderId} | Status: ${transactionStatus} | Fraud: ${fraudStatus} | Payment: ${paymentType}`);

    // Map Midtrans status to our status codes: 1=pending, 2=paid, 3=expired, 4=cancelled, 5=failed
    let orderStatus = 1;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        orderStatus = 2; // paid
      }
    } else if (transactionStatus === 'settlement') {
      orderStatus = 2; // paid
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      orderStatus = 4; // cancelled
    } else if (transactionStatus === 'expire') {
      orderStatus = 3; // expired
    } else if (transactionStatus === 'failure') {
      orderStatus = 5; // failed
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: orderStatus,
        payment_method: paymentType,
        lastupdateddate: new Date().toISOString(),
      })
      .eq('order_code', orderId);

    if (updateError) throw updateError;

    // If payment successful, add games to user's library
    if (orderStatus === 2) {
      await addGamesToLibrary(orderId);
    }

    console.log(`✅ Order ${orderId} updated to status: ${orderStatus}`);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/payment/status/:orderCode
router.get('/status/:orderCode', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_code', req.params.orderCode)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Order tidak ditemukan' });

    res.json(data);
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
