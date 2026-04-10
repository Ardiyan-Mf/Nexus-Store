import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { HiOutlineShoppingCart, HiCheck, HiStar, HiArrowLeft, HiOutlineCalendar, HiOutlineDesktopComputer, HiOutlineUserGroup } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './GameDetail.css';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const [isOwned, setIsOwned] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [id]);

  useEffect(() => {
    if (user && game) {
      checkOwnership();
    }
  }, [user, game]);

  const fetchGame = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', id)
        .eq('status', 1)
        .eq('isdeleted', 0)
        .single();
      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const { data } = await supabase
        .from('library')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', game.game_id)
        .eq('isdeleted', 0)
        .single();
      setIsOwned(!!data);
    } catch {
      setIsOwned(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!isInCart(game.game_id)) {
      addToCart(game);
      toast.success(`${game.title} ditambahkan ke keranjang!`);
    }
  };

  if (loading) {
    return (
      <div className="page-container container">
        <div className="game-detail-skeleton">
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
            <div className="skeleton" style={{ height: 40, width: '60%' }} />
            <div className="skeleton" style={{ height: 20, width: '40%' }} />
            <div className="skeleton" style={{ height: 100 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="page-container container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Game tidak ditemukan</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Kembali ke Beranda</Link>
      </div>
    );
  }

  const discountedPrice = Math.round(game.price - (game.price * (game.discount || 0) / 100));

  return (
    <div className="page-container">
      <div className="container">
        <Link to="/" className="back-link">
          <HiArrowLeft /> Kembali ke Beranda
        </Link>

        <div className="game-detail">
          <div className="game-detail-gallery">
            <div className="gallery-main">
              <img
                src={game.image_url}
                alt={game.title}
                className="gallery-main-img"
                onError={(e) => {
                  if (!e.target.dataset.hasError) {
                    e.target.dataset.hasError = 'true';
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect fill="#1A1A25" width="800" height="450"/><text fill="#6C5CE7" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${game.title.substring(0, 25)}</text></svg>`)}`;
                  }
                }}
              />
            </div>
          </div>

          <div className="game-detail-info">
            <div className="game-detail-genres">
              {game.category && (
                <span className="badge badge-primary">{game.category}</span>
              )}
              {game.platform && (
                <span className="badge badge-primary">{game.platform}</span>
              )}
            </div>

            <h1 className="game-detail-title">{game.title}</h1>

            <div className="game-detail-meta">
              {game.rating > 0 && (
                <div className="meta-item">
                  <HiStar className="meta-icon star" />
                  <span className="meta-value">{Number(game.rating).toFixed(1)} / 5.0</span>
                </div>
              )}
              <div className="meta-item">
                <HiOutlineCalendar className="meta-icon" />
                <span className="meta-value">
                  {game.release_date ? new Date(game.release_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </span>
              </div>
            </div>

            <p className="game-detail-desc">{game.description}</p>

            <div className="game-detail-specs">
              <div className="spec-item">
                <HiOutlineUserGroup className="spec-icon" />
                <div>
                  <span className="spec-label">Developer</span>
                  <span className="spec-value">{game.developer || '-'}</span>
                </div>
              </div>
              <div className="spec-item">
                <HiOutlineUserGroup className="spec-icon" />
                <div>
                  <span className="spec-label">Publisher</span>
                  <span className="spec-value">{game.publisher || '-'}</span>
                </div>
              </div>
              <div className="spec-item">
                <HiOutlineDesktopComputer className="spec-icon" />
                <div>
                  <span className="spec-label">Platform</span>
                  <span className="spec-value">{game.platform || '-'}</span>
                </div>
              </div>
            </div>

            {/* Min/Rec Requirements */}
            {(game.min_requirements || game.rec_requirements) && (
              <div className="game-detail-specs">
                {game.min_requirements && (
                  <div className="spec-item">
                    <div>
                      <span className="spec-label">Minimum Requirements</span>
                      <span className="spec-value">{game.min_requirements}</span>
                    </div>
                  </div>
                )}
                {game.rec_requirements && (
                  <div className="spec-item">
                    <div>
                      <span className="spec-label">Recommended Requirements</span>
                      <span className="spec-value">{game.rec_requirements}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Card */}
            <div className="game-price-card glass-card">
              <div className="price-section">
                {game.discount > 0 && (
                  <span className="badge badge-discount">-{game.discount}%</span>
                )}
                <div className="price-values">
                  {game.discount > 0 && (
                    <span className="price-original">{formatPrice(game.price)}</span>
                  )}
                  <span className="price-final">{formatPrice(discountedPrice)}</span>
                </div>
              </div>

              {isOwned ? (
                <Link to="/library" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                  <HiCheck /> Sudah Dimiliki — Buka Perpustakaan
                </Link>
              ) : isInCart(game.game_id) ? (
                <Link to="/cart" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                  <HiCheck /> Dalam Keranjang — Lihat Keranjang
                </Link>
              ) : (
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleAddToCart}>
                  <HiOutlineShoppingCart /> Tambahkan ke Keranjang
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
