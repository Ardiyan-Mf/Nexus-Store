import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error('Mohon isi semua field');
      return;
    }
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      toast.success('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
      navigate('/login');
    } catch (error) {
      if (error.message.includes('already registered')) {
        toast.error('Email sudah terdaftar');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Gagal daftar dengan Google');
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
            <h2 className="auth-visual-title">Gabung Bersama Kami</h2>
            <p className="auth-visual-desc">
              Buat akun dan mulai eksplorasi ribuan game digital dengan penawaran terbaik
            </p>
            <div className="auth-visual-features">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <span>Diskon Eksklusif Member</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Perpustakaan Game Pribadi</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔔</span>
                <span>Notifikasi Promo Terbaru</span>
              </div>
            </div>
          </div>
          <div className="auth-visual-glow" />
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h1 className="auth-title">Daftar</h1>
            <p className="auth-subtitle">Buat akun Nexus Store baru</p>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin} id="google-register-btn">
            <FcGoogle className="google-icon" />
            Daftar dengan Google
          </button>

          <div className="auth-divider">
            <span>atau daftar dengan email</span>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullname">Nama Lengkap</label>
              <div className="input-with-icon">
                <HiOutlineUser className="input-icon" />
                <input
                  type="text"
                  id="fullname"
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Konfirmasi Password</label>
              <div className="input-with-icon">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  className="form-input"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="form-error">Password tidak cocok</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg auth-submit"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Daftar'}
            </button>
          </form>

          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
