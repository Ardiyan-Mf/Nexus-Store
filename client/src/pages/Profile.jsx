import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil, HiCheck, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Profile.css';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName, phone, address });
      toast.success('Profil berhasil diperbarui!');
      setEditing(false);
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container">
      <h1 className="section-title">Profil Saya</h1>

      <div className="profile-layout animate-fadeIn">
        <div className="profile-card glass-card">
          <div className="profile-header">
            <div className="profile-avatar-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                <HiOutlineUser />
              )}
            </div>
            <div className="profile-header-info">
              <h2>{profile?.full_name || 'Pengguna'}</h2>
              <span className="profile-role badge badge-primary">
                {profile?.role === 'admin' ? '👑 Admin' : '🎮 Customer'}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <label><HiOutlineMail /> Email</label>
              <span>{user?.email}</span>
            </div>

            <div className="profile-field">
              <label><HiOutlineUser /> Nama Lengkap</label>
              {editing ? (
                <input type="text" className="form-input" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} />
              ) : (
                <span>{profile?.full_name || '-'}</span>
              )}
            </div>

            <div className="profile-field">
              <label><HiOutlinePhone /> Telepon</label>
              {editing ? (
                <input type="text" className="form-input" value={phone}
                  onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
              ) : (
                <span>{profile?.phone || '-'}</span>
              )}
            </div>

            <div className="profile-field">
              <label><HiOutlineLocationMarker /> Alamat</label>
              {editing ? (
                <textarea className="form-input" value={address}
                  onChange={(e) => setAddress(e.target.value)} placeholder="Alamat lengkap" rows={3}
                  style={{ resize: 'vertical' }} />
              ) : (
                <span>{profile?.address || '-'}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Bergabung sejak</label>
              <span>{profile?.createddate ? new Date(profile.createddate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {editing ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                    <HiCheck /> Simpan
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                    Batal
                  </button>
                </>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                  <HiOutlinePencil /> Edit Profil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
