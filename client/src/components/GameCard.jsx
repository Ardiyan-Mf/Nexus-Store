import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiCheck, HiStar, HiOutlineDownload } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './GameCard.css';
import { useState, useRef, memo } from 'react';

function GameCard({ game, isOwned = false }) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(game.game_id);
  const imgErrorRef = useRef(false);
  const [imgError, setImgError] = useState(false);

  const discountedPrice = Math.round(
    game.price - (game.price * (game.discount || 0) / 100)
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart && !isOwned) {
      addToCart(game);
      toast.success(`${game.title} ditambahkan ke keranjang!`);
    }
  };

  // Fallback: inline SVG data URI — never triggers a network request
  const placeholderImage = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="550"><rect fill="#1A1A25" width="400" height="550"/><text fill="#6C5CE7" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${game.title.substring(0, 18)}</text></svg>`
  )}`;

  return (
    <Link
      to={`/game/${game.game_id}`}
      className="game-card"
      id={`game-card-${game.game_id}`}
    >
      <div className="game-card-image">
        <img
          key={game.image_url}
          src={imgError ? placeholderImage : game.image_url}
          alt={game.title}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!imgErrorRef.current) {
              imgErrorRef.current = true;
              setImgError(true);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#1A1A25',
            borderRadius: '8px 8px 0 0',
          }}
        />

        <div className="game-card-overlay">
          {isOwned ? (
            <Link
              to="/library"
              className="add-cart-btn owned"
              onClick={(e) => e.stopPropagation()}
            >
              <HiOutlineDownload /> Sudah Dimiliki
            </Link>
          ) : (
            <button
              className={`add-cart-btn ${inCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={inCart}
            >
              {inCart ? (
                <>
                  <HiCheck /> Dalam Keranjang
                </>
              ) : (
                <>
                  <HiOutlineShoppingCart /> Tambahkan
                </>
              )}
            </button>
          )}
        </div>

        {isOwned && (
          <span className="owned-tag">✓ Dimiliki</span>
        )}

        {!isOwned && game.discount > 0 && (
          <span className="discount-tag">-{game.discount}%</span>
        )}
      </div>

      <div className="game-card-info">
        <div className="game-card-genres">
          {game.category && (
            <span className="genre-tag">{game.category}</span>
          )}
        </div>

        <h3 className="game-card-title">{game.title}</h3>

        <div className="game-card-meta">
          {game.rating > 0 && (
            <span className="game-rating">
              <HiStar className="star-icon" />
              {Number(game.rating).toFixed(1)}
            </span>
          )}
          {game.platform && (
            <span className="platform-tag">{game.platform}</span>
          )}
        </div>

        <div className="game-card-price">
          {isOwned ? (
            <span className="price-owned">Dalam Perpustakaan</span>
          ) : game.discount > 0 ? (
            <>
              <span className="price-original">
                {formatPrice(game.price)}
              </span>
              <span className="price-discounted">
                {formatPrice(discountedPrice)}
              </span>
            </>
          ) : (
            <span className="price-current">
              {formatPrice(game.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default memo(GameCard);