import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const STATUS_MAP = {
  1: { label: 'Menunggu', type: 'warning' },
  2: { label: 'Berhasil', type: 'success' },
  3: { label: 'Kadaluarsa', type: 'danger' },
  4: { label: 'Dibatalkan', type: 'danger' },
  5: { label: 'Gagal', type: 'danger' },
};

export default function AdminPanel() {
  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('games');
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, discount: 0,
    image_url: '', category: '', developer: '', publisher: '',
    release_date: '', platform: 'PC', rating: 4.0,
    min_requirements: '', rec_requirements: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch games
      const gamesRes = await supabase.from('games').select('*').eq('isdeleted', 0).order('createddate', { ascending: false });
      setGames(gamesRes.data || []);

      // Fetch orders (without game join to avoid FK error)
      const ordersRes = await supabase.from('orders').select('*, order_items(*)').eq('isdeleted', 0).order('createddate', { ascending: false }).limit(50);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingGame(null);
    setFormData({
      title: '', description: '', price: 0, discount: 0,
      image_url: '', category: '', developer: '', publisher: '',
      release_date: '', platform: 'PC', rating: 4.0,
      min_requirements: '', rec_requirements: '',
    });
    setShowModal(true);
  };

  const openEditModal = (game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      description: game.description || '',
      price: game.price,
      discount: game.discount || 0,
      image_url: game.image_url || '',
      category: game.category || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      release_date: game.release_date || '',
      platform: game.platform || 'PC',
      rating: game.rating || 4.0,
      min_requirements: game.min_requirements || '',
      rec_requirements: game.rec_requirements || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gameData = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      discount: parseFloat(formData.discount),
      image_url: formData.image_url,
      category: formData.category,
      developer: formData.developer,
      publisher: formData.publisher,
      release_date: formData.release_date || null,
      platform: formData.platform,
      rating: parseFloat(formData.rating),
      min_requirements: formData.min_requirements,
      rec_requirements: formData.rec_requirements,
      lastupdateddate: new Date().toISOString(),
    };

    try {
      if (editingGame) {
        const { error } = await supabase.from('games').update(gameData).eq('game_id', editingGame.game_id);
        if (error) throw error;
        toast.success('Game berhasil diperbarui!');
      } else {
        const { error } = await supabase.from('games').insert({ ...gameData, status: 1, isdeleted: 0 });
        if (error) throw error;
        toast.success('Game berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (gameId, title) => {
    if (!confirm(`Yakin hapus game "${title}"?`)) return;
    try {
      const { error } = await supabase.from('games').update({ isdeleted: 1, lastupdateddate: new Date().toISOString() }).eq('game_id', gameId);
      if (error) throw error;
      toast.success('Game berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="page-container container">
      <div className="admin-header">
        <h1 className="section-title"><HiOutlineShieldCheck /> Admin Panel</h1>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
          Game ({games.length})
        </button>
        <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Pesanan ({orders.length})
        </button>
      </div>

      {activeTab === 'games' && (
        <div className="admin-section animate-fadeIn">
          <div className="admin-toolbar">
            <button className="btn btn-primary" onClick={openAddModal}>
              <HiOutlinePlus /> Tambah Game
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Harga</th>
                  <th>Diskon</th>
                  <th>Rating</th>
                  <th>Kategori</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game.game_id}>
                    <td>
                      <div className="admin-game-cell">
                        <img
                          src={game.image_url}
                          alt=""
                          className="admin-game-thumb"
                          onError={(e) => {
                            if (!e.target.dataset.hasError) {
                              e.target.dataset.hasError = 'true';
                              e.target.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50"><rect fill="#1A1A25" width="40" height="50"/><text fill="#6C5CE7" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">G</text></svg>')}`;
                            }
                          }}
                        />
                        <div>
                          <span className="admin-game-title">{game.title}</span>
                          <span className="admin-game-slug">{game.platform}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatPrice(game.price)}</td>
                    <td>{game.discount > 0 ? `${game.discount}%` : '-'}</td>
                    <td>⭐ {Number(game.rating).toFixed(1)}</td>
                    <td>{game.category || '-'}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEditModal(game)}>
                          <HiOutlinePencil />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(game.game_id, game.title)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section animate-fadeIn">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Code</th>
                  <th>Tanggal</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Metode</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><code>{order.order_code}</code></td>
                    <td className="text-sm">{new Date(order.createddate).toLocaleDateString('id-ID')}</td>
                    <td>{order.order_items?.length || 0} item</td>
                    <td>{formatPrice(order.total_amount)}</td>
                    <td>
                      <span className={`badge badge-${(STATUS_MAP[order.status] || {}).type || 'danger'}`}>
                        {(STATUS_MAP[order.status] || {}).label || 'Unknown'}
                      </span>
                    </td>
                    <td>{order.payment_method || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGame ? 'Edit Game' : 'Tambah Game Baru'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="form-group">
                  <label className="form-label">Judul *</label>
                  <input className="form-input" required value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <input className="form-input" placeholder="Action, RPG, dll" value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Harga (IDR) *</label>
                  <input className="form-input" type="number" required value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Diskon (%)</label>
                  <input className="form-input" type="number" min="0" max="100" value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input className="form-input" value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-input" value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}>
                    <option value="PC">PC</option>
                    <option value="PS5">PS5</option>
                    <option value="PS4">PS4</option>
                    <option value="Xbox Series X">Xbox Series X</option>
                    <option value="Xbox One">Xbox One</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Developer</label>
                  <input className="form-input" value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publisher</label>
                  <input className="form-input" value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Rilis</label>
                  <input className="form-input" type="date" value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (0-5)</label>
                  <input className="form-input" type="number" step="0.1" min="0" max="5" value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" rows={3} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Minimum Requirements</label>
                <textarea className="form-input" rows={2} value={formData.min_requirements}
                  onChange={(e) => setFormData({ ...formData, min_requirements: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Recommended Requirements</label>
                <textarea className="form-input" rows={2} value={formData.rec_requirements}
                  onChange={(e) => setFormData({ ...formData, rec_requirements: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">
                  {editingGame ? 'Simpan Perubahan' : 'Tambah Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
