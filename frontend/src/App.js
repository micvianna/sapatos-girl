import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';

// Fake Component for testing
import FakeModal from './components/FakeModal';

// i18n
import './i18n';
import './App.css';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <Footer />
        <FakeModal />
      </div>
    </Router>
  );
}

export default App;
