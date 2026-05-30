import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import MiniCart from './components/MiniCart';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import Reviews from './pages/Reviews';

// Institutional & Service
import About from './pages/About';
import Stores from './pages/Stores';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Faq from './pages/Faq';
import Returns from './pages/Returns';
import Shipping from './pages/Shipping';
import Payments from './pages/Payments';

// i18n
import './i18n';
import './App.css';

function App() {
  const { token, user } = useAuthStore();
  const isAdmin = token && user?.is_admin;

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={token ? <Account /> : <Navigate to="/login" />} />
            <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
            <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/login" />} />
            <Route path="/reviews" element={<Reviews />} />

            <Route path="/sobre" element={<About />} />
            <Route path="/lojas" element={<Stores />} />
            <Route path="/carreiras" element={<Careers />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/politica-privacidade" element={<Privacy />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/trocas" element={<Returns />} />
            <Route path="/entregas" element={<Shipping />} />
            <Route path="/pagamento" element={<Payments />} />
          </Routes>
        </main>
        <Footer />
        <MiniCart />
      </div>
    </Router>
  );
}

export default App;
