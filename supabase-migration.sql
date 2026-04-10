-- =============================================
-- NEXUS STORE - Database Migration
-- =============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run

-- 1. Tabel Profiles (otomatis terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: Auto-create profile saat user baru register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabel Games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  discount_percent INTEGER DEFAULT 0,
  cover_image TEXT,
  screenshots TEXT[] DEFAULT '{}',
  genre TEXT[] DEFAULT '{}',
  developer TEXT,
  publisher TEXT,
  release_date DATE,
  platform TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0.0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_id TEXT UNIQUE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'failed')),
  snap_token TEXT,
  payment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  price INTEGER NOT NULL
);

-- 5. Tabel User Library
CREATE TABLE IF NOT EXISTS user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (true);

-- Games policies (public read, admin write)
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert games" ON games
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update games" ON games
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete games" ON games
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE USING (true);
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order Items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );
CREATE POLICY "Users can insert order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- User Library policies
CREATE POLICY "Users can view own library" ON user_library
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert to library" ON user_library
  FOR INSERT WITH CHECK (true);

-- =============================================
-- SAMPLE DATA - Game Populer
-- =============================================

INSERT INTO games (title, slug, description, price, discount_percent, cover_image, screenshots, genre, developer, publisher, release_date, platform, rating, is_featured) VALUES
(
  'Grand Theft Auto V',
  'gta-5',
  'Grand Theft Auto V untuk PC memberi pemain kebebasan menjelajahi dunia Los Santos dan Blaine County yang luas dalam resolusi hingga 4k. Game ini menampilkan mode cerita yang epik dengan tiga karakter utama, serta GTA Online yang terus berkembang.',
  299000,
  40,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=800&fit=crop', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop'],
  ARRAY['Action', 'Adventure', 'Open World'],
  'Rockstar North',
  'Rockstar Games',
  '2013-09-17',
  ARRAY['PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One'],
  4.8,
  true
),
(
  'Cyberpunk 2077',
  'cyberpunk-2077',
  'Cyberpunk 2077 adalah RPG aksi dunia terbuka yang berlatar di Night City, kota metropolitan yang terobsesi dengan kekuatan, glamor, dan modifikasi tubuh. Kamu berperan sebagai V, seorang mercenary yang mencari implan unik.',
  549000,
  25,
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&fit=crop'],
  ARRAY['RPG', 'Action', 'Open World', 'Sci-Fi'],
  'CD Projekt Red',
  'CD Projekt',
  '2020-12-10',
  ARRAY['PC', 'PS5', 'Xbox Series X'],
  4.5,
  true
),
(
  'Elden Ring',
  'elden-ring',
  'Elden Ring adalah game action RPG yang dikembangkan oleh FromSoftware dan ditulis oleh Hidetaka Miyazaki dan George R. R. Martin. Jelajahi dunia Lands Between yang luas dan penuh misteri.',
  799000,
  10,
  'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&fit=crop'],
  ARRAY['RPG', 'Action', 'Souls-like', 'Fantasy'],
  'FromSoftware',
  'Bandai Namco',
  '2022-02-25',
  ARRAY['PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One'],
  4.9,
  true
),
(
  'Red Dead Redemption 2',
  'red-dead-redemption-2',
  'Red Dead Redemption 2 menceritakan kisah epik Arthur Morgan dan geng Van der Linde di Amerika tahun 1899. Dengan dunia terbuka yang sangat detail dan cerita yang memukau.',
  599000,
  30,
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&fit=crop'],
  ARRAY['Action', 'Adventure', 'Open World', 'Western'],
  'Rockstar Games',
  'Rockstar Games',
  '2018-10-26',
  ARRAY['PC', 'PS4', 'Xbox One'],
  4.9,
  false
),
(
  'The Witcher 3: Wild Hunt',
  'the-witcher-3',
  'The Witcher 3: Wild Hunt adalah RPG dunia terbuka pemenang penghargaan dengan cerita yang mendalam dan dunia fantasi yang luas. Bermain sebagai Geralt of Rivia, pemburu monster profesional.',
  349000,
  50,
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&fit=crop'],
  ARRAY['RPG', 'Action', 'Open World', 'Fantasy'],
  'CD Projekt Red',
  'CD Projekt',
  '2015-05-19',
  ARRAY['PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch'],
  4.9,
  true
),
(
  'God of War Ragnarök',
  'god-of-war-ragnarok',
  'Bergabunglah dengan Kratos dan Atreus dalam perjalanan mitologis mereka untuk mencari jawaban dan sekutu sebelum Ragnarök tiba. Jelajahi sembilan realm yang menakjubkan.',
  699000,
  15,
  'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&fit=crop'],
  ARRAY['Action', 'Adventure', 'Mythology'],
  'Santa Monica Studio',
  'Sony Interactive',
  '2022-11-09',
  ARRAY['PC', 'PS5', 'PS4'],
  4.8,
  false
),
(
  'Hogwarts Legacy',
  'hogwarts-legacy',
  'Hogwarts Legacy adalah RPG aksi dunia terbuka yang berlatar di dunia Harry Potter pada abad ke-19. Ciptakan karakter unikmu dan jelajahi Hogwarts, Hogsmeade, dan sekitarnya.',
  849000,
  20,
  'https://images.unsplash.com/photo-1598153346810-860daa814c4b?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&fit=crop'],
  ARRAY['RPG', 'Action', 'Adventure', 'Fantasy'],
  'Avalanche Software',
  'Warner Bros. Games',
  '2023-02-10',
  ARRAY['PC', 'PS5', 'Xbox Series X', 'Nintendo Switch'],
  4.6,
  true
),
(
  'Marvel''s Spider-Man 2',
  'spider-man-2',
  'Marvel''s Spider-Man 2 menampilkan Peter Parker dan Miles Morales dalam petualangan baru melawan ancaman terbesar mereka. Ayunkan jaring melintasi New York yang lebih besar.',
  749000,
  0,
  'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&h=800&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800&fit=crop'],
  ARRAY['Action', 'Adventure', 'Superhero'],
  'Insomniac Games',
  'Sony Interactive',
  '2023-10-20',
  ARRAY['PC', 'PS5'],
  4.7,
  false
);

-- =============================================
-- CATATAN:
-- Setelah menjalankan migration ini, jangan lupa:
-- 1. Set user pertama sebagai admin:
--    UPDATE profiles SET role = 'admin' WHERE email = 'email_anda@gmail.com';
-- 2. Upload gambar game ke Supabase Storage jika ingin gambar sendiri
-- =============================================
