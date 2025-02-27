import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Employees from './pages/Employees';
import ScanQR from './pages/ScanQR';
import Settings from './pages/Settings';
import { ThemeProvider } from './ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/scan-qr" element={<ScanQR />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;