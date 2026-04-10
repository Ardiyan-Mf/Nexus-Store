import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Library from './pages/Library';
import OrderHistory from './pages/OrderHistory';
import PaymentStatus from './pages/PaymentStatus';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={
            <ProtectedRoute><Checkout /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute><Library /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrderHistory /></ProtectedRoute>
          } />
          <Route path="/payment/:status" element={<PaymentStatus />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
