const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// GET /api/orders/:userId — Get user orders
router.get('/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          games (title, game_id, image_url)
        )
      `)
      .eq('user_id', req.params.userId)
      .eq('isdeleted', 0)
      .order('createddate', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
