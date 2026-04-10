import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaTwitter, FaInstagram, FaDiscord, FaYoutube } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">N</div>
              <span className="logo-text">Nexus Store</span>
            </div>
            <p className="footer-desc">
              Toko game digital terpercaya dengan koleksi game terlengkap dan harga terbaik. Pembayaran aman & mudah.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="social-link" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="social-link" aria-label="Discord"><FaDiscord /></a>
              <a href="#" className="social-link" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Navigasi</h4>
            <Link to="/">Beranda</Link>
            <Link to="/cart">Keranjang</Link>
            <Link to="/library">Perpustakaan</Link>
            <Link to="/orders">Riwayat Pesanan</Link>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Kategori</h4>
            <Link to="/?category=Action">Action</Link>
            <Link to="/?category=RPG">RPG</Link>
            <Link to="/?category=Adventure">Adventure</Link>
            <Link to="/?category=Shooter">Shooter</Link>
          </div>

          <div className="footer-links">
            <h4 className="footer-title">Bantuan</h4>
            <a href="#">FAQ</a>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat & Ketentuan</a>
            <div className="footer-contact">
              <HiOutlineMail /> support@nexusstore.id
            </div>
            <div className="footer-contact">
              <HiOutlineLocationMarker /> Jakarta, Indonesia
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nexus Store. Semua hak dilindungi.</p>
          <p className="footer-payment-text">Pembayaran aman oleh Midtrans</p>
        </div>
      </div>
    </footer>
  );
}
