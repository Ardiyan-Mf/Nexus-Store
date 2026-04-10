import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { HiOutlineClock, HiCheckCircle, HiXCircle, HiClock } from 'react-icons/hi';
import './OrderHistory.css';

// Status mapping: 1=pending, 2=paid, 3=expired, 4=cancelled, 5=failed
const STATUS_MAP = {
  1: { label: 'Menunggu', type: 'warning' },
  2: { label: 'Berhasil', type: 'success' },
  3: { label: 'Kadaluarsa', type: 'danger' },
  4: { label: 'Dibatalkan', type: 'danger' },
  5: { label: 'Gagal', type: 'danger' },
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      // Try with join first, fallback to without join if FK doesn't exist
      let data, error;

      try {
        const result = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              games (title, game_id, image_url)
            )
          `)
          .eq('user_id', user.id)
          .eq('isdeleted', 0)
          .order('createddate', { ascending: false });

        data = result.data;
        error = result.error;

        // If FK join fails, fetch without join
        if (error && error.code === 'PGRST200') {
          console.warn('FK relationship missing, fetching orders without game join...');
          const ordersResult = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', user.id)
            .eq('isdeleted', 0)
            .order('createddate', { ascending: false });

          if (ordersResult.error) throw ordersResult.error;
          data = ordersResult.data;
          error = null;
        } else if (error) {
          throw error;
        }
      } catch (joinError) {
        // Final fallback: just orders without items
        const ordersOnly = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('isdeleted', 0)
          .order('createddate', { ascending: false });

        data = ordersOnly.data;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const s = STATUS_MAP[status] || { label: 'Unknown', type: 'danger' };
    const Icon = s.type === 'success' ? HiCheckCircle : s.type === 'warning' ? HiClock : HiXCircle;
    return (
      <span className={`badge badge-${s.type}`}>
        <Icon /> {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="page-container container">
        <h1 className="section-title">Riwayat Pesanan</h1>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 12, marginBottom: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="page-container container">
      <h1 className="section-title">Riwayat Pesanan</h1>

      {orders.length === 0 ? (
        <div className="orders-empty animate-fadeIn">
          <HiOutlineClock style={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
          <h2>Belum Ada Pesanan</h2>
          <p>Riwayat pesanan akan muncul di sini setelah kamu melakukan pembelian.</p>
        </div>
      ) : (
        <div className="orders-list animate-fadeIn">
          {orders.map(order => (
            <div key={order.id} className="order-card glass-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="order-label">Order Code</span>
                  <span className="order-value">{order.order_code}</span>
                </div>
                <div className="order-date">
                  {new Date(order.createddate).toLocaleDateString('id-ID', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </div>
                {getStatusBadge(order.status)}
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="order-items">
                  {order.order_items.map(item => (
                    <div key={item.id} className="order-item">
                      {item.games?.image_url && (
                        <img
                          src={item.games.image_url}
                          alt=""
                          className="order-item-img"
                          onError={(e) => {
                            if (!e.target.dataset.hasError) {
                              e.target.dataset.hasError = 'true';
                              e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="65"><rect fill="#1A1A25" width="50" height="65"/><text fill="#6C5CE7" font-family="sans-serif" font-size="10" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Game</text></svg>')}`;
                            }
                          }}
                        />
                      )}
                      <span className="order-item-title">{item.games?.title || `Game #${item.game_id?.substring(0, 8)}`}</span>
                      <span className="order-item-price">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-footer">
                <div className="order-payment-type">
                  {order.payment_method && <span>Via {order.payment_method}</span>}
                </div>
                <div className="order-total">
                  Total: <strong>{formatPrice(order.total_amount)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
