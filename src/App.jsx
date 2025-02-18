import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Category from './pages/Category';
import ScanQR from './pages/ScanQR';
import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/category" element={<Category />} />
          <Route path="/scan-qr" element={<ScanQR />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;