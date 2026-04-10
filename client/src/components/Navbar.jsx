import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineSearch, HiMenu, HiX, HiOutlineLogout, HiOutlineCollection, HiOutlineClock, HiOutlineShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setProfileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} id="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="logo-icon">N</div>
          <span className="logo-text">Nexus Store</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Cari game..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="navbar-search-input"
          />
        </form>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart" id="navbar-cart">
            <HiOutlineShoppingCart />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuOpen(!profileMenuOpen);
                }}
                id="navbar-profile-btn"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="profile-avatar"
                    onError={(e) => {
                      if (!e.target.dataset.hasError) {
                        e.target.dataset.hasError = 'true';
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <HiOutlineUser />
                )}
                <span className="profile-name">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="profile-menu animate-fadeIn">
                  <Link to="/profile" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                    <HiOutlineUser /> Profil Saya
                  </Link>
                  <Link to="/library" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                    <HiOutlineCollection /> Perpustakaan
                  </Link>
                  <Link to="/orders" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}>
                    <HiOutlineClock /> Riwayat Pesanan
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="profile-menu-item admin-item" onClick={() => setProfileMenuOpen(false)}>
                      <HiOutlineShieldCheck /> Admin Panel
                    </Link>
                  )}
                  <div className="profile-menu-divider" />
                  <button className="profile-menu-item logout-item" onClick={handleSignOut}>
                    <HiOutlineLogout /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="navbar-login-btn">
              Masuk
            </Link>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fadeInDown">
          <form className="mobile-search" onSubmit={handleSearch}>
            <HiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>
          <Link to="/" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Beranda</Link>
          <Link to="/cart" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>
            Keranjang {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Profil</Link>
              <Link to="/library" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Perpustakaan</Link>
              <Link to="/orders" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Riwayat Pesanan</Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button className="mobile-menu-link logout" onClick={handleSignOut}>Keluar</button>
            </>
          ) : (
            <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Masuk</Link>
          )}
        </div>
      )}
    </nav>
  );
}
