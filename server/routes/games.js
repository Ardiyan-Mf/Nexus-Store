const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// GET /api/games — Get all games
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let query = supabase
      .from('games')
      .select('*')
      .eq('status', 1)
      .eq('isdeleted', 0);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    switch (sort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'name':
        query = query.order('title', { ascending: true });
        break;
      default:
        query = query.order('createddate', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/games/:id — Get single game by game_id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', req.params.id)
      .eq('status', 1)
      .eq('isdeleted', 0)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Game tidak ditemukan' });

    res.json(data);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
