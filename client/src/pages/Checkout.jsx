import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineCreditCard } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Checkout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Checkout() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/payment/create-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
          items: cartItems.map(item => ({
            id: item.game_id,
            title: item.title,
            price: getDiscountedPrice(item),
          })),
          total: getTotal(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      const orderCode = data.order_code;

      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: async function (result) {
            // Konfirmasi ke server agar order diupdate & game masuk library
            try {
              await fetch(`${API_URL}/payment/confirm-success`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_code: orderCode }),
              });
            } catch (err) {
              console.error('Error confirming payment:', err);
            }
            clearCart();
            toast.success('Pembayaran berhasil!');
            navigate('/payment/success');
          },
          onPending: function (result) {
            toast('Menunggu pembayaran...', { icon: '⏳' });
            navigate('/payment/pending');
          },
          onError: function (result) {
            toast.error('Pembayaran gagal');
            navigate('/payment/error');
          },
          onClose: function () {
            toast('Pembayaran dibatalkan', { icon: '❌' });
            setLoading(false);
          }
        });
      } else {
        throw new Error('Midtrans Snap belum dimuat. Pastikan Client Key sudah benar.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  // Redirect ke cart jika keranjang kosong — pakai <Navigate> bukan navigate()
  // navigate() di dalam render body menyebabkan infinite loop
  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="page-container container">
      <h1 className="section-title">Checkout</h1>

      <div className="checkout-layout animate-fadeIn">
        <div className="checkout-items">
          <h3 className="checkout-subtitle">Item Pesanan ({cartItems.length})</h3>
          {cartItems.map(item => (
            <div key={item.game_id} className="checkout-item">
              <img
                src={item.image_url}
                alt={item.title}
                className="checkout-item-img"
                onError={(e) => {
                  if (!e.target.dataset.hasError) {
                    e.target.dataset.hasError = 'true';
                    e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100"><rect fill="#1A1A25" width="80" height="100"/><text fill="#6C5CE7" font-family="sans-serif" font-size="10" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">${item.title.substring(0, 12)}</text></svg>`)}`;
                  }
                }}
              />
              <div className="checkout-item-info">
                <span className="checkout-item-title">{item.title}</span>
                <span className="checkout-item-platform">{item.platform}</span>
              </div>
              <span className="checkout-item-price">{formatPrice(getDiscountedPrice(item))}</span>
            </div>
          ))}
        </div>

        <div className="checkout-payment glass-card">
          <h3 className="checkout-subtitle">
            <HiOutlineCreditCard /> Pembayaran
          </h3>

          <div className="checkout-user-info">
            <span className="checkout-label">Email</span>
            <span className="checkout-value">{user?.email}</span>
          </div>

          <div className="checkout-summary">
            <div className="checkout-row">
              <span>Subtotal ({cartItems.length} item)</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <div className="checkout-row">
              <span>Biaya layanan</span>
              <span className="text-green">Gratis</span>
            </div>
            <div className="checkout-divider" />
            <div className="checkout-row checkout-total">
              <span>Total Pembayaran</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg checkout-pay-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <><HiOutlineLockClosed /> Bayar {formatPrice(getTotal())}</>
            )}
          </button>

          <div className="checkout-secure">
            <HiOutlineLockClosed />
            <span>Pembayaran diproses secara aman oleh Midtrans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
