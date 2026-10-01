import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAIBot from './components/FloatingAIBot';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import NationalDashboard from './pages/NationalDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import StateDashboard from './pages/StateDashboard';
import DistrictDashboard from './pages/DistrictDashboard';
import NewProposalPage from './pages/NewProposalPage';
import GisLandMapPage from './pages/GisLandMapPage';

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 px-4"
      style={{ background: '#FFF8F0' }}>
      <div className="text-center bg-white rounded-3xl p-12 max-w-md shadow-lg border border-orange-100">
        <div className="text-5xl mb-4">🚧</div>
        <h1 className="text-2xl font-black text-[#1a1a2e] mb-2">{title}</h1>
        <p className="text-gray-500 text-sm">This page is under active development as part of the NLAMS platform.</p>
        <div className="mt-6 h-1 tiranga-bar rounded-full" />
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const hideChrome = [
    '/auth',
    '/dashboard',
    '/farmer-dashboard',
    '/state-dashboard',
    '/district-dashboard',
    '/new-proposal',
    '/map',
  ].includes(location.pathname);

  return (
    <>
      {!hideChrome && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/dashboard" element={<NationalDashboard />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/state-dashboard" element={<StateDashboard />} />
          <Route path="/district-dashboard" element={<DistrictDashboard />} />
          <Route path="/new-proposal" element={<NewProposalPage />} />
          <Route path="/map" element={<GisLandMapPage />} />
          <Route path="/proposals" element={<PageWrapper><PlaceholderPage title="Proposal Workflow" /></PageWrapper>} />
          <Route path="/compliance" element={<PageWrapper><PlaceholderPage title="Compliance Module" /></PageWrapper>} />
          <Route path="/transparency" element={<PageWrapper><PlaceholderPage title="Transparency Portal" /></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><PlaceholderPage title="About NLAMS" /></PageWrapper>} />
          <Route path="/contact" element={<PageWrapper><PlaceholderPage title="Contact Us" /></PageWrapper>} />
          <Route path="*" element={<PageWrapper><PlaceholderPage title="Page Not Found" /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      {!hideChrome && <Footer />}
      <FloatingAIBot />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
