# 🎮 Nexus Store — Toko Game Digital

Website toko game digital dengan React JS, Node.js Express, Supabase, dan Midtrans.

![Nexus Store](client/src/assets/hero-banner.png)

---

## 📋 Daftar Isi

1. [Fitur](#fitur)
2. [Tech Stack](#tech-stack)
3. [Panduan Setup](#panduan-setup)
   - [Step 1: Setup Supabase](#step-1-setup-supabase)
   - [Step 2: Setup Google OAuth](#step-2-setup-google-oauth)
   - [Step 3: Setup Midtrans](#step-3-setup-midtrans)
   - [Step 4: Konfigurasi Environment](#step-4-konfigurasi-environment)
   - [Step 5: Menjalankan Project](#step-5-menjalankan-project)
4. [Struktur Project](#struktur-project)
5. [Panduan Admin](#panduan-admin)

---

## ✨ Fitur

- 🏠 **Home Page** — Hero section, katalog game, filter genre, pencarian
- 🔐 **Autentikasi** — Login email/password, Login with Google, Registrasi
- 🎮 **Detail Game** — Gallery gambar, info lengkap, harga & diskon
- 🛒 **Keranjang** — Tambah/hapus game, kalkulasi harga otomatis
- 💳 **Checkout** — Pembayaran via Midtrans (GoPay, BCA VA, Mandiri, dll)
- 📚 **Perpustakaan** — Koleksi game yang sudah dibeli
- 📦 **Riwayat Pesanan** — Track status pesanan
- 👤 **Profil** — Kelola informasi akun
- ⚙️ **Admin Panel** — CRUD game, lihat pesanan (khusus admin)
- 🌙 **Dark Mode** — UI modern dengan tema gelap
- 📱 **Responsive** — Optimal di semua ukuran layar

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React JS (Vite) |
| Styling | Vanilla CSS + CSS Variables |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Autentikasi | Supabase Auth (Email + Google OAuth) |
| Payment Gateway | Midtrans Snap API |
| Font | Inter (Google Fonts) |

---

## 🚀 Panduan Setup

### Step 1: Setup Supabase

1. Buka [https://supabase.com](https://supabase.com) dan **login/daftar**
2. Klik **"New Project"**
   - Nama: `Nexus Store`
   - Database Password: (buat password yang kuat, simpan!)
   - Region: Southeast Asia (Singapore)
   - Klik **Create new project**
3. Tunggu sampai project selesai dibuat (~2 menit)
4. **Catat credentials:**
   - Buka **Settings** → **API**
   - Salin **Project URL** → ini adalah `SUPABASE_URL`
   - Salin **`anon` public key** → ini adalah `VITE_SUPABASE_ANON_KEY`
   - Salin **`service_role` key** → ini adalah `SUPABASE_SERVICE_KEY` (untuk backend)

5. **Jalankan Migration SQL:**
   - Buka **SQL Editor** di sidebar kiri
   - Klik **New query**
   - Copy-paste seluruh isi file `supabase-migration.sql`
   - Klik **Run** (atau Ctrl+Enter)
   - Pastikan tidak ada error

6. **Aktifkan Email Auth:**
   - Buka **Authentication** → **Providers** → **Email**
   - Pastikan toggle **Enable Email provider** aktif
   - (Opsional) Disable "Confirm email" untuk development agar tidak perlu verifikasi email

---

### Step 2: Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. **Buat Project Baru:**
   - Klik dropdown project di atas → **New Project**
   - Nama: `Nexus Store` → **Create**

3. **Setup OAuth Consent Screen:**
   - Buka **APIs & Services** → **OAuth consent screen**
   - Pilih **External** → **Create**
   - Isi:
     - App name: `Nexus Store`
     - User support email: (email kamu)
     - Developer contact: (email kamu)
   - Klik **Save and Continue** (lewati scopes, test users)
   - Klik **Publish App** (agar bisa digunakan oleh siapa saja)

4. **Buat OAuth Credentials:**
   - Buka **APIs & Services** → **Credentials**
   - Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Nexus Store Web`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:5173
     ```
   - **Authorized redirect URIs:**
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```
     (Ganti `YOUR_PROJECT_ID` dengan project ID Supabase kamu — lihat di Supabase URL)
   - Klik **Create**
   - **Salin Client ID dan Client Secret**

5. **Pasang di Supabase:**
   - Buka Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - Toggle **Enable Sign in with Google**
   - Paste **Client ID** dan **Client Secret**
   - Klik **Save**

6. **Set Redirect URL:**
   - Buka **Authentication** → **URL Configuration**
   - Di **Redirect URLs**, tambahkan:
     ```
     http://localhost:5173/**
     ```

---

### Step 3: Setup Midtrans

1. Buka [https://midtrans.com](https://midtrans.com) dan **daftar akun Merchant**
2. Setelah login ke dashboard:
   - Pastikan kamu di mode **Sandbox** (toggle di kiri atas)
3. **Dapatkan API Keys:**
   - Buka **Settings** → **Access Keys**
   - Salin **Server Key** → ini adalah `MIDTRANS_SERVER_KEY`
   - Salin **Client Key** → ini adalah `MIDTRANS_CLIENT_KEY` dan `VITE_MIDTRANS_CLIENT_KEY`

4. **Set Notification URL:**
   - Buka **Settings** → **Configuration**
   - **Payment Notification URL:**
     ```
     http://localhost:5000/api/payment/notification
     ```
     > ⚠️ Untuk development, gunakan tool seperti [ngrok](https://ngrok.com) agar Midtrans bisa mengirim notifikasi ke localhost:
     > ```bash
     > npx ngrok http 5000
     > ```
     > Lalu gunakan URL ngrok sebagai notification URL, contoh:
     > `https://abc123.ngrok.io/api/payment/notification`

   - **Finish Redirect URL:** `http://localhost:5173/payment/success`
   - **Unfinish Redirect URL:** `http://localhost:5173/payment/pending`
   - **Error Redirect URL:** `http://localhost:5173/payment/error`

5. **Update Client Key di index.html:**
   - Buka file `client/index.html`
   - Ganti `YOUR_MIDTRANS_CLIENT_KEY` dengan Client Key Midtrans kamu:
     ```html
     <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="SB-Mid-client-XXXXX"></script>
     ```

---

### Step 4: Konfigurasi Environment

**Frontend (`client/.env`):**
```bash
# Salin dari client/.env.example
cp client/.env.example client/.env
```

Edit `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
VITE_API_URL=http://localhost:5000/api
```

**Backend (`server/.env`):**
```bash
# Salin dari server/.env.example
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...your-service-role-key
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

### Step 5: Menjalankan Project

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
```

Buka browser: [http://localhost:5173](http://localhost:5173)

---

## 📁 Struktur Project

```
Nexus Store/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── assets/         # Gambar (hero banner, dll)
│   │   ├── components/     # Navbar, Footer, GameCard, HeroSection, ProtectedRoute
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── lib/            # Supabase client
│   │   └── pages/          # Home, Login, Register, GameDetail, Cart, Checkout, dll
│   ├── .env                # Environment variables
│   └── index.html          # Entry HTML + Midtrans Snap script
├── server/                 # Node.js Backend
│   ├── lib/                # Supabase admin client
│   ├── middleware/          # Auth middleware
│   ├── routes/             # API routes (games, orders, payment)
│   ├── .env                # Environment variables
│   └── index.js            # Express entry point
├── supabase-migration.sql  # Database schema + sample data
└── README.md               # Panduan (file ini)
```

---

## 👑 Panduan Admin

Untuk menjadikan akun sebagai admin:

1. **Daftar/Login** dengan akun yang ingin dijadikan admin
2. Buka **Supabase Dashboard** → **SQL Editor**
3. Jalankan query:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'email_kamu@gmail.com';
   ```
4. **Refresh halaman** website
5. Sekarang kamu bisa akses **Admin Panel** dari menu profil

---

## 🧪 Testing Pembayaran (Sandbox)

Midtrans Sandbox menyediakan nomor kartu test:

| Metode | Nomor Test |
|--------|-----------|
| Visa | 4811 1111 1111 1114 |
| Mastercard | 5211 1111 1111 1117 |
| CVV | 123 |
| Exp Date | Bulan/tahun di masa depan |

Untuk GoPay, BCA VA, dll — gunakan simulator yang tersedia di Midtrans Sandbox Dashboard.

---

## 📝 Catatan Penting

- **Sandbox Mode**: Semua transaksi Midtrans dalam mode sandbox — tidak ada uang sungguhan
- **Production**: Untuk go live, ganti API keys ke Production keys dan ubah Snap URL dari `sandbox` ke production
- **Webhook**: Untuk development lokal, gunakan ngrok agar Midtrans bisa mengirim notifikasi pembayaran
- **Google OAuth**: Pastikan redirect URI sudah benar di Google Cloud Console dan Supabase

---

Dibuat dengan ❤️ oleh Nexus Store Team
