const { supabase } = require('../lib/supabase');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token tidak valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Gagal memverifikasi token' });
  }
}

async function adminMiddleware(req, res, next) {
  try {
    await authMiddleware(req, res, async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .eq('isdeleted', 0)
        .single();

      if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak. Hanya admin.' });
      }

      next();
    });
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Gagal memverifikasi admin' });
  }
}

module.exports = { authMiddleware, adminMiddleware };
