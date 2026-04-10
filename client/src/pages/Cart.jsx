import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { HiOutlineTrash, HiArrowRight, HiOutlineShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, getTotal } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountedPrice = (item) => {
    return Math.round(item.price - (item.price * (item.discount || 0) / 100));
  };

  const handleRemove = (item) => {
    removeFromCart(item.game_id);
    toast.success(`${item.title} dihapus dari keranjang`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container container">
        <div className="cart-empty animate-fadeIn">
          <div className="cart-empty-icon">
            <HiOutlineShoppingCart />
          </div>
          <h2>Keranjang Kosong</h2>
          <p>Belum ada game di keranjang. Yuk jelajahi katalog kami!</p>
          <Link to="/" className="btn btn-primary btn-lg">
            Jelajahi Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container container">
      <h1 className="section-title">Keranjang Belanja</h1>

      <div className="cart-layout animate-fadeIn">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.game_id} className="cart-item glass-card">
              <Link to={`/game/${item.game_id}`} className="cart-item-image">
                <img
                  src={item.image_url}
                  alt={item.title}
                  onError={(e) => {
                    if (!e.target.dataset.hasError) {
                      e.target.dataset.hasError = 'true';
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="260"><rect fill="#1A1A25" width="200" height="260"/><text fill="#6C5CE7" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${item.title.substring(0, 18)}</text></svg>`)}`;
                    }
                  }}
                />
              </Link>
              <div className="cart-item-info">
                <Link to={`/game/${item.game_id}`} className="cart-item-title">{item.title}</Link>
                <div className="cart-item-meta">
                  {item.platform && <span className="platform-tag">{item.platform}</span>}
                </div>
                <div className="cart-item-genres">
                  {item.category && <span className="genre-tag">{item.category}</span>}
                </div>
              </div>
              <div className="cart-item-price-section">
                {item.discount > 0 && (
                  <span className="cart-discount">-{item.discount}%</span>
                )}
                <div className="cart-item-prices">
                  {item.discount > 0 && (
                    <span className="cart-price-original">{formatPrice(item.price)}</span>
                  )}
                  <span className="cart-price-current">{formatPrice(getDiscountedPrice(item))}</span>
                </div>
              </div>
              <button className="cart-remove-btn" onClick={() => handleRemove(item)} aria-label="Hapus">
                <HiOutlineTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary glass-card">
          <h3 className="summary-title">Ringkasan Pesanan</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.game_id} className="summary-item">
                <span className="summary-item-name">{item.title}</span>
                <span className="summary-item-price">{formatPrice(getDiscountedPrice(item))}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span className="summary-total-price">{formatPrice(getTotal())}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Checkout <HiArrowRight />
          </Link>
          <button className="btn btn-danger btn-sm" onClick={() => { clearCart(); toast.success('Keranjang dikosongkan'); }} style={{ width: '100%' }}>
            Kosongkan Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
