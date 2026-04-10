import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { HiOutlineDownload, HiOutlineCollection } from 'react-icons/hi';
import './Library.css';

export default function Library() {
  const { user } = useAuth();
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLibrary();
  }, [user]);

  const fetchLibrary = async () => {
    try {
      let data, error;

      // Try with join first
      const result = await supabase
        .from('library')
        .select('*, games(*)')
        .eq('user_id', user.id)
        .eq('isdeleted', 0)
        .order('purchased_at', { ascending: false });

      data = result.data;
      error = result.error;

      // Fallback if FK relationship doesn't exist
      if (error && error.code === 'PGRST200') {
        console.warn('FK relationship missing for library→games, fetching without join...');
        const libResult = await supabase
          .from('library')
          .select('*')
          .eq('user_id', user.id)
          .eq('isdeleted', 0)
          .order('purchased_at', { ascending: false });

        if (libResult.error) throw libResult.error;

        // Fetch game details separately
        const gameIds = (libResult.data || []).map(l => l.game_id).filter(Boolean);
        let gamesMap = {};
        if (gameIds.length > 0) {
          const gamesResult = await supabase
            .from('games')
            .select('*')
            .in('game_id', gameIds);
          if (gamesResult.data) {
            gamesResult.data.forEach(g => { gamesMap[g.game_id] = g; });
          }
        }

        data = (libResult.data || []).map(item => ({
          ...item,
          games: gamesMap[item.game_id] || null,
        }));
        error = null;
      } else if (error) {
        throw error;
      }

      setLibrary(data || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container container">
        <h1 className="section-title">Perpustakaan</h1>
        <div className="library-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="library-card-skeleton">
              <div className="skeleton" style={{ aspectRatio: '3/4' }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container container">
      <h1 className="section-title">Perpustakaan</h1>

      {library.length === 0 ? (
        <div className="library-empty animate-fadeIn">
          <HiOutlineCollection className="library-empty-icon" />
          <h2>Perpustakaan Kosong</h2>
          <p>Kamu belum memiliki game. Beli game pertamamu sekarang!</p>
          <Link to="/" className="btn btn-primary btn-lg">Jelajahi Game</Link>
        </div>
      ) : (
        <div className="library-grid animate-fadeIn">
          {library.map(item => (
            <div key={item.id} className="library-card glass-card">
              <Link to={`/game/${item.games?.game_id || item.game_id}`} className="library-card-image">
                <img
                  src={item.games?.image_url}
                  alt={item.games?.title}
                  onError={(e) => {
                    if (!e.target.dataset.hasError) {
                      e.target.dataset.hasError = 'true';
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect fill="#1A1A25" width="300" height="400"/><text fill="#6C5CE7" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${(item.games?.title || 'Game').substring(0, 18)}</text></svg>`)}`;
                    }
                  }}
                />
                <div className="library-card-overlay">
                  <button className="btn btn-primary btn-sm">
                    <HiOutlineDownload /> Download
                  </button>
                </div>
              </Link>
              <div className="library-card-info">
                <Link to={`/game/${item.games?.game_id || item.game_id}`} className="library-card-title">
                  {item.games?.title || 'Game'}
                </Link>
                <span className="library-card-date">
                  Dibeli: {new Date(item.purchased_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
