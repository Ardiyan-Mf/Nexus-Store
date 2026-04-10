import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiStar, HiArrowRight, HiOutlineDownload } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import heroBg from '../assets/hero-banner.png';
import './HeroSection.css';
import { useState, useRef } from 'react';

export default function HeroSection({ featuredGame, isOwned = false }) {
  const { addToCart, isInCart } = useCart();
  const imgErrorRef = useRef(false);
  const [imgError, setImgError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (featuredGame && !isInCart(featuredGame.game_id) && !isOwned) {
      addToCart(featuredGame);
      toast.success(`${featuredGame.title} ditambahkan ke keranjang!`);
    }
  };

  const discountedPrice = featuredGame
    ? Math.round(featuredGame.price - (featuredGame.price * (featuredGame.discount || 0) / 100))
    : 0;

  return (
    <section className="hero" id="hero-section">
      <div className="hero-bg">
        <img src={heroBg} alt="" className="hero-bg-image" />
        <div className="hero-bg-overlay" />
        <div className="hero-bg-gradient" />
      </div>

      <div className="container hero-content">
        <div className="hero-text animate-fadeInUp">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Game Pilihan Minggu Ini
          </div>
          <h1 className="hero-title">
            {featuredGame ? featuredGame.title : 'Temukan Game Favoritmu'}
          </h1>
          <p className="hero-desc">
            {featuredGame
              ? (featuredGame.description?.substring(0, 180) + '...')
              : 'Jelajahi ribuan game digital dengan harga terbaik. Pembayaran mudah dan aman melalui berbagai metode pembayaran.'}
          </p>

          {featuredGame ? (
            <div className="hero-actions">
              {!isOwned && (
                <div className="hero-price-block">
                  {featuredGame.discount > 0 && (
                    <span className="hero-discount">-{featuredGame.discount}%</span>
                  )}
                  <div className="hero-prices">
                    {featuredGame.discount > 0 && (
                      <span className="hero-price-original">{formatPrice(featuredGame.price)}</span>
                    )}
                    <span className="hero-price-current">{formatPrice(discountedPrice)}</span>
                  </div>
                </div>
              )}
              <div className="hero-btns">
                {isOwned ? (
                  <Link to="/library" className="btn btn-primary btn-lg">
                    <HiOutlineDownload /> Buka Perpustakaan
                  </Link>
                ) : (
                  <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                    <HiOutlineShoppingCart /> {isInCart(featuredGame.game_id) ? 'Dalam Keranjang' : 'Beli Sekarang'}
                  </button>
                )}
                <Link to={`/game/${featuredGame.game_id}`} className="btn btn-secondary btn-lg">
                  Lihat Detail <HiArrowRight />
                </Link>
              </div>
            </div>
          ) : (
            <div className="hero-btns">
              <Link to="/" className="btn btn-primary btn-lg">
                Jelajahi Games <HiArrowRight />
              </Link>
            </div>
          )}

          {featuredGame?.rating > 0 && (
            <div className="hero-meta">
              <span className="hero-rating">
                <HiStar /> {Number(featuredGame.rating).toFixed(1)} / 5.0
              </span>
              <span className="hero-dev">{featuredGame.developer}</span>
              <span className="hero-platforms">{featuredGame.platform}</span>
            </div>
          )}
        </div>

        <div className="hero-visual animate-scaleIn">
          {featuredGame?.image_url && (
            <div className="hero-game-cover">
              <img
                src={imgError
                  ? `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550"><rect fill="#1A1A25" width="400" height="550"/><text fill="#6C5CE7" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${featuredGame.title.substring(0, 20)}</text></svg>`)}`
                  : featuredGame.image_url}
                alt={featuredGame.title}
                onError={() => {
                  if (!imgErrorRef.current) {
                    imgErrorRef.current = true;
                    setImgError(true);
                  }
                }}
              />
              <div className="hero-cover-glow" />
            </div>
          )}
        </div>
      </div>

      <div className="hero-particle hero-particle-1" />
      <div className="hero-particle hero-particle-2" />
      <div className="hero-particle hero-particle-3" />
    </section>
  );
}
