import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Mohon isi semua field');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Berhasil masuk!');
      navigate('/');
    } catch (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'Email atau password salah'
        : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Gagal masuk dengan Google');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fadeIn">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-logo">
              <div className="logo-icon">N</div>
              <span className="logo-text">Nexus Store</span>
            </div>
            <h2 className="auth-visual-title">Selamat Datang Kembali</h2>
            <p className="auth-visual-desc">
              Masuk ke akunmu dan temukan game-game terbaik dengan harga spesial
            </p>
            <div className="auth-visual-features">
              <div className="feature-item">
                <span className="feature-icon">🎮</span>
                <span>Game Digital Terlengkap</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Pembayaran Aman & Mudah</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Download Instan</span>
              </div>
            </div>
          </div>
          <div className="auth-visual-glow" />
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1 className="auth-title">Masuk</h1>
            <p className="auth-subtitle">Masuk ke akun Nexus Store kamu</p>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin} id="google-login-btn">
            <FcGoogle className="google-icon" />
            Masuk dengan Google
          </button>

          <div className="auth-divider">
            <span>atau masuk dengan email</span>
          </div>

          <form className="auth-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <div className="input-with-icon">
                <HiOutlineMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Masuk'}
            </button>
          </form>

          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
