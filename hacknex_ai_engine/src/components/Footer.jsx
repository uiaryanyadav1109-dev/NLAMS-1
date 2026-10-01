import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin, Mail, Phone, Globe,
  Shield, Lock, ChevronRight, Heart, ExternalLink
} from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'National Dashboard', path: '/dashboard' },
    { label: 'GIS Land Map', path: '/map' },
    { label: 'Proposal Workflow', path: '/proposals' },
    { label: 'Compensation Tracker', path: '/compensation' },
    { label: 'R&R Management', path: '/rnr' },
    { label: 'Document Repository', path: '/documents' },
  ],
  'For Citizens': [
    { label: 'Check Land Status', path: '/status' },
    { label: 'Transparency Portal', path: '/transparency' },
    { label: 'File a Grievance', path: '/grievance' },
    { label: 'Compensation FAQs', path: '/faq' },
    { label: 'Know Your Rights', path: '/rights' },
    { label: 'Contact a DM', path: '/contact-dm' },
  ],
  'For Officers': [
    { label: 'Officer Login', path: '/auth' },
    { label: 'Training Portal', path: '/training' },
    { label: 'API Documentation', path: '/api-docs' },
    { label: 'Field App (PWA)', path: '/field-app' },
    { label: 'Integration Guide', path: '/integration' },
    { label: 'SOP Downloads', path: '/sop' },
  ],
  Government: [
    { label: 'About NLAMS', path: '/about' },
    { label: 'Policy Framework', path: '/policy' },
    { label: 'RFCTLARR Act', path: '/rfctlarr' },
    { label: 'Annual Reports', path: '/reports' },
    { label: 'Press Releases', path: '/press' },
    { label: 'RTI Portal', path: '/rti' },
  ],
};

const socialLinks = [
  { label: 'X', text: '𝕏' },
  { label: 'in', text: 'in' },
  { label: 'YT', text: '▶' },
  { label: 'fb', text: 'f' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: '#0D1F0A' }}>

      {/* Top Tiranga strip */}
      <div className="h-1.5 tiranga-bar" />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none grid-pattern opacity-20" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[250px] rounded-full opacity-8"
        style={{ background: 'radial-gradient(ellipse, #FF9933, transparent)', transform: 'translate(-30%, 50%)' }} />
      <div className="absolute top-0 right-0 w-[350px] h-[200px] rounded-full opacity-8"
        style={{ background: 'radial-gradient(ellipse, #138808, transparent)', transform: 'translate(30%, -30%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Subscribe CTA ── */}
        <div className="my-16 rounded-3xl p-8 md:p-10 relative overflow-hidden border"
          style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(19,136,8,0.06))', borderColor: 'rgba(255,153,51,0.2)' }}>
          <div className="absolute top-0 left-0 right-0 h-1 tiranga-bar" />
          <div className="absolute inset-0 grid-pattern opacity-15" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                Aapki Zameen, Aapka Adhikaar
              </h3>
              <p className="text-white/50 text-sm max-w-md">
                Subscribe for alerts on land acquisition notices, compensation updates, and platform news in your district.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-5 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 border bg-white/5 focus:outline-none transition-all"
                style={{ borderColor: 'rgba(255,153,51,0.2)' }}
                onFocus={(e) => { e.target.style.borderColor = '#FF9933'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,153,51,0.2)'; }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)', boxShadow: '0 4px 16px rgba(255,153,51,0.3)' }}
              >
                Subscribe <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-14">

          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md"
                style={{ background: 'linear-gradient(135deg, #FF9933, #fff, #138808)' }}>
                🇮🇳
              </div>
              <div>
                <div className="text-white font-black text-xl">NLAMS</div>
                <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#86efac' }}>
                  National Land Acquisition &<br />Management System
                </div>
              </div>
            </Link>

            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              India's unified digital platform for transparent, accountable, and citizen-first land acquisition governance. Serving farmers and officers across all 28 states.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              {[
                { icon: <MapPin size={13} />, text: 'Ministry of Rural Development, Krishi Bhavan, New Delhi — 110001' },
                { icon: <Mail size={13} />, text: 'nlams@gov.in' },
                { icon: <Phone size={13} />, text: '1800-XXX-XXXX (Toll Free)' },
                { icon: <Globe size={13} />, text: 'nlams.gov.in' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-white/40 text-xs">
                  <span className="mt-0.5 flex-shrink-0" style={{ color: '#FF9933' }}>{item.icon}</span>
                  <span className="leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {socialLinks.map((social, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF9933'; e.currentTarget.style.color = '#FF9933'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  {social.text}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold text-sm mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full inline-block" style={{ background: 'linear-gradient(180deg, #FF9933, #138808)' }} />
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="group flex items-center gap-1 text-white/40 hover:text-[#FF9933] text-sm transition-colors duration-200"
                    >
                      <ChevronRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all duration-200"
                        style={{ color: '#FF9933' }}
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Trust Badges ── */}
        <div className="border-t py-8" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6">
              {[
                { icon: <Shield size={13} />, text: 'ISO 27001 Certified', color: '#138808' },
                { icon: <Lock size={13} />, text: '256-bit SSL Encrypted', color: '#FF9933' },
                { icon: <Globe size={13} />, text: 'CERT-In Compliant', color: '#138808' },
                { icon: '🏛️', text: 'NIC Hosted', isEmoji: true },
                { icon: '📱', text: 'DigiLocker Integrated', isEmoji: true },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-white/35 text-xs">
                  {badge.isEmoji
                    ? <span className="text-sm">{badge.icon}</span>
                    : <span style={{ color: badge.color }}>{badge.icon}</span>
                  }
                  {badge.text}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {[{ emoji: '🇮🇳', label: 'Govt. of India' }, { emoji: '🌾', label: 'MoRD' }, { emoji: '🏛️', label: 'NIC' }].map((logo, i) => (
                <div key={i} className="flex flex-col items-center text-white/20 text-[9px] text-center">
                  <span className="text-xl">{logo.emoji}</span>
                  <span className="mt-0.5">{logo.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t py-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
            <div className="flex flex-wrap items-center gap-1 justify-center md:justify-start">
              <span>© 2024 Government of India.</span>
              <span className="mx-2 hidden md:inline">·</span>
              <span>Designed & developed by NIC</span>
              <span className="mx-2 hidden md:inline">·</span>
              <span className="flex items-center gap-1">
                Made with <Heart size={10} className="text-[#FF9933]" style={{ fill: '#FF9933' }} /> for 1.4 Billion Indians
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {['Privacy Policy', 'Terms of Service', 'Accessibility', 'RTI', 'Sitemap'].map((item, i) => (
                <React.Fragment key={i}>
                  <Link to="#" className="hover:text-[#FF9933] transition-colors">{item}</Link>
                  {i < 4 && <span className="text-white/10">·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Live status */}
        <div className="pb-6 text-center">
          <span className="inline-flex items-center gap-2 text-[10px] text-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
            All systems operational · Last updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Bottom Tiranga strip */}
      <div className="h-1.5 tiranga-bar" />
    </footer>
  );
}
