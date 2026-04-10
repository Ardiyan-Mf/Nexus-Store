import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1A1A25',
                color: '#FFFFFF',
                border: '1px solid #2A2A3A',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
              },
              success: {
                iconTheme: {
                  primary: '#00E676',
                  secondary: '#1A1A25',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF5252',
                  secondary: '#1A1A25',
                },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
