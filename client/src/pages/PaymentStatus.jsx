import { useParams, Link } from 'react-router-dom';
import { HiCheckCircle, HiClock, HiXCircle } from 'react-icons/hi';
import './PaymentStatus.css';

export default function PaymentStatus() {
  const { status } = useParams();

  const config = {
    success: {
      icon: <HiCheckCircle className="status-icon success" />,
      title: 'Pembayaran Berhasil!',
      desc: 'Terima kasih! Game sudah ditambahkan ke perpustakaan kamu.',
      btnText: 'Lihat Perpustakaan',
      btnLink: '/library',
    },
    pending: {
      icon: <HiClock className="status-icon pending" />,
      title: 'Menunggu Pembayaran',
      desc: 'Silakan selesaikan pembayaran sesuai instruksi. Game akan ditambahkan setelah pembayaran dikonfirmasi.',
      btnText: 'Lihat Riwayat Pesanan',
      btnLink: '/orders',
    },
    error: {
      icon: <HiXCircle className="status-icon error" />,
      title: 'Pembayaran Gagal',
      desc: 'Maaf, terjadi masalah saat memproses pembayaran. Silakan coba lagi.',
      btnText: 'Kembali ke Keranjang',
      btnLink: '/cart',
    },
  };

  const current = config[status] || config.error;

  return (
    <div className="page-container container">
      <div className="payment-status animate-scaleIn">
        {current.icon}
        <h1 className="status-title">{current.title}</h1>
        <p className="status-desc">{current.desc}</p>
        <div className="status-actions">
          <Link to={current.btnLink} className="btn btn-primary btn-lg">
            {current.btnText}
          </Link>
          <Link to="/" className="btn btn-secondary">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
