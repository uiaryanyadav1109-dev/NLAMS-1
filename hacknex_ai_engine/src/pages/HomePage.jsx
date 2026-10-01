import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Play, ChevronDown, MapPin, Users, TrendingUp,
  Shield, CheckCircle, Star, Globe, Zap, Eye, Lock,
  FileText, BarChart3, Building2, Award,
  ChevronRight, Database, Smartphone, Pause, Volume2, VolumeX
} from 'lucide-react';

// ── Tiranga Particle Field ────────────────────────────────────────────────────
function ParticleField() {
  const colors = ['#FF9933', '#138808', '#ffffff', '#FF9933', '#138808'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 8,
    color: colors[i % colors.length],
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            opacity: 0.4,
          }}
          animate={{ y: [0, -30, 0], x: [0, (Math.random() - 0.5) * 20, 0], opacity: [0.15, 0.55, 0.15], scale: [1, 1.6, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Chakra SVG (Ashoka Chakra) ───────────────────────────────────────────────
function ChakraSVG({ size = 120, className = '' }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <circle cx="60" cy="60" r="55" fill="none" stroke="#0033A0" strokeWidth="4" />
      <circle cx="60" cy="60" r="8" fill="#0033A0" />
      {spokes.map((i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 60 + 8 * Math.cos(rad);
        const y1 = 60 + 8 * Math.sin(rad);
        const x2 = 60 + 51 * Math.cos(rad);
        const y2 = 60 + 51 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0033A0" strokeWidth="1.5" />;
      })}
      <circle cx="60" cy="60" r="51" fill="none" stroke="#0033A0" strokeWidth="1.5" />
    </svg>
  );
}

// ── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(parseFloat(start.toFixed(decimals)));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, decimals]);
  return <span ref={ref}>{prefix}{decimals ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-IN')}{suffix}</span>;
}

// ── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, color, bgColor, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="card-hover-3d bg-white rounded-3xl p-6 shadow-lg border border-orange-100 group cursor-default"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
        style={{ background: bgColor || `${color}15`, border: `1px solid ${color}30` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <h3 className="text-[#1a1a2e] font-bold text-lg mb-2 group-hover:text-[#FF9933] transition-colors">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      <div className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </motion.div>
  );
}

// ── Step Card ────────────────────────────────────────────────────────────────
function StepCard({ number, title, description, icon, delay, isLast }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex gap-5 group"
    >
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg"
          style={{ background: number % 2 === 0 ? 'linear-gradient(135deg, #138808, #0a5c04)' : 'linear-gradient(135deg, #FF9933, #E07800)', boxShadow: number % 2 === 0 ? '0 8px 20px rgba(19,136,8,0.3)' : '0 8px 20px rgba(255,153,51,0.3)' }}
        >
          {number}
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-3 min-h-[40px]" style={{ background: `linear-gradient(180deg, ${number % 2 === 0 ? '#138808' : '#FF9933'}40, transparent)` }} />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: number % 2 === 0 ? '#138808' : '#FF9933' }}>{icon}</span>
          <h4 className="text-[#1a1a2e] font-bold text-base">{title}</h4>
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ quote, name, role, state, rating, accentColor, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-6 flex flex-col gap-4 card-hover-3d shadow-lg border border-orange-50"
    >
      <div className="flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="fill-[#FF9933] text-[#FF9933]" />
        ))}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: accentColor || 'linear-gradient(135deg, #FF9933, #E07800)' }}>
          {name[0]}
        </div>
        <div>
          <div className="text-[#1a1a2e] font-semibold text-sm">{name}</div>
          <div className="text-gray-400 text-xs">{role} · {state}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Video Section ─────────────────────────────────────────────────────────────
function VideoSection() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: '-10%' });
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;
    if (inView) { videoRef.current.play().catch(() => {}); }
    else { videoRef.current.pause(); }
  }, [inView]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPaused(false); }
    else { videoRef.current.pause(); setPaused(true); }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <section ref={sectionRef} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFF8F0 0%, #0D1F0A 100%)' }}>

      {/* decorative blobs */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-[#FFF8F0]" style={{ zIndex: 0 }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-[#FF9933] text-xs font-bold tracking-widest uppercase mb-4 px-5 py-2 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/10">
            <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
            Watch NLAMS in Action
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            A Platform Built for{' '}
            <span className="text-gradient-tiranga">Every Indian</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From remote villages to ministerial desks — see how NLAMS connects farmers, officers, and policymakers on one unified platform.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glow behind video */}
          <div className="absolute -inset-4 rounded-[32px] opacity-40 blur-2xl"
            style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }} />

          {/* Tiranga border */}
          <div className="absolute -inset-[3px] rounded-[28px]" style={{ background: 'linear-gradient(135deg, #FF9933, #fff, #138808)' }} />

          {/* Video wrapper */}
          <div className="relative rounded-[26px] overflow-hidden bg-black shadow-2xl">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 tiranga-bar z-20" />

            <video
              ref={videoRef}
              src="/nlams-promo.mp4"
              className="w-full aspect-video object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(13,31,10,0.5) 0%, transparent 40%, transparent 60%, rgba(13,31,10,0.2) 100%)' }}
            />

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between z-20">
              <div>
                <p className="text-white font-black text-xl drop-shadow-lg">🌾 NLAMS — Digital India</p>
                <p className="text-white/70 text-sm">Transforming Land Governance for 1.4 Billion Indians</p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all"
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white border border-white/30 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}
                >
                  {paused ? <Play size={16} className="ml-0.5" /> : <Pause size={16} />}
                </motion.button>
              </div>
            </div>

            {/* Chakra watermark */}
            <div className="absolute top-4 right-4 opacity-15 pointer-events-none">
              <ChakraSVG size={50} className="chakra-spin" />
            </div>
          </div>
        </motion.div>

        {/* Stats below video */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {[
            { val: '3', suf: 'Min', label: 'Avg. Approval Time', color: '#FF9933' },
            { val: '99', suf: '%', label: 'Paperless Process', color: '#138808' },
            { val: '28', suf: '+', label: 'States Live', color: '#FF9933' },
            { val: '0', suf: ' Leaks', label: 'Data Breach Record', color: '#138808' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center glass-dark rounded-2xl p-5 border border-white/10"
            >
              <div className="text-3xl font-black mb-1" style={{ color: s.color }}>
                {s.val}{s.suf}
              </div>
              <div className="text-white/55 text-xs font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Marquee: State badges ─────────────────────────────────────────────────────
function StateBadgeMarquee() {
  const states = [
    'Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh',
    'Karnataka', 'Tamil Nadu', 'Bihar', 'West Bengal', 'Telangana',
    'Odisha', 'Punjab', 'Haryana', 'Jharkhand', 'Chhattisgarh',
    'Assam', 'Kerala', 'Uttarakhand', 'Himachal Pradesh', 'Goa',
  ];
  const doubled = [...states, ...states];
  return (
    <div className="overflow-hidden py-4 border-y border-orange-100">
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <div key={i} className="mx-3 flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2"
            style={{ background: i % 2 === 0 ? '#FFF3E6' : '#F0FFF0', color: i % 2 === 0 ? '#E07800' : '#138808', border: `1px solid ${i % 2 === 0 ? '#FFB34780' : '#138808'}30` }}>
            <span>{i % 2 === 0 ? '🧡' : '💚'}</span> {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const features = [
    { icon: <MapPin size={24} />, title: 'GIS Land Mapping', description: 'Real-time geo-tagged parcel boundaries with Leaflet maps across every district and state.', color: '#138808', bgColor: '#f0fff0' },
    { icon: <Shield size={24} />, title: 'Role-Based Access', description: 'Granular RBAC for Central Ministry, State Govt, District Officers, and Landowners.', color: '#003580', bgColor: '#f0f4ff' },
    { icon: <BarChart3 size={24} />, title: 'National Dashboard', description: 'Live KPIs: area notified vs acquired, compensation disbursed, families affected — all live.', color: '#FF9933', bgColor: '#fff8f0' },
    { icon: <FileText size={24} />, title: 'Digital Workflow', description: 'Proposal → Notification → Award → Compensation → Possession → R&R — all digital.', color: '#8b5cf6', bgColor: '#faf5ff' },
    { icon: <Database size={24} />, title: 'Audit Trail', description: 'Tamper-proof document repository with version history. Every action logged with timestamps.', color: '#ef4444', bgColor: '#fff5f5' },
    { icon: <Smartphone size={24} />, title: 'Field PWA', description: 'Field officers geo-tag parcels from mobile. Works offline, syncs when connected.', color: '#06b6d4', bgColor: '#f0fdff' },
  ];

  const steps = [
    { number: 1, icon: <FileText size={16} />, title: 'Submit Acquisition Proposal', description: 'District Officer submits proposal with parcel boundary drawn on the GIS map interface.', isLast: false },
    { number: 2, icon: <CheckCircle size={16} />, title: 'State Government Review', description: 'State portal receives proposal in queue. Officials approve/reject with digital signature.', isLast: false },
    { number: 3, icon: <Building2 size={16} />, title: 'Central Ministry Oversight', description: 'Ministry views national dashboard — area notified, compensation disbursed, families affected.', isLast: false },
    { number: 4, icon: <Users size={16} />, title: 'Landowner Notification', description: 'Automated SMS/email alerts to affected landowners. Public-facing read-only portal for transparency.', isLast: false },
    { number: 5, icon: <TrendingUp size={16} />, title: 'Compensation Disbursement', description: 'Mark disbursement per family. Auto-updates affected-family count and progress bars.', isLast: false },
    { number: 6, icon: <Award size={16} />, title: 'R&R Completion', description: 'Rehabilitation & Resettlement tracked. Predictive analytics estimates completion timeline.', isLast: true },
  ];

  const testimonials = [
    { quote: 'NLAMS has reduced our land acquisition processing time from 18 months to under 6 months. The GIS mapping is truly a game-changer.', name: 'Rajesh Kumar', role: 'District Collector', state: 'Madhya Pradesh', rating: 5, accentColor: 'linear-gradient(135deg, #FF9933, #E07800)' },
    { quote: 'Finally, I can track my compensation status online instead of visiting government offices every week. This is real Digital India.', name: 'Sunita Devi', role: 'Farmer', state: 'Uttar Pradesh', rating: 5, accentColor: 'linear-gradient(135deg, #138808, #0a5c04)' },
    { quote: 'The audit trail and role-based access gives us the accountability we needed. No more lost documents or unauthorized approvals.', name: 'Priya Sharma', role: 'State Revenue Secretary', state: 'Rajasthan', rating: 5, accentColor: 'linear-gradient(135deg, #003580, #0033A0)' },
  ];

  const stats = [
    { value: 28, suffix: '+', label: 'States Connected', icon: <Globe size={20} /> },
    { value: 4.2, suffix: 'L+', label: 'Parcels Geo-Tagged', icon: <MapPin size={20} />, decimals: 1 },
    { value: 98.6, suffix: '%', label: 'Uptime Guaranteed', icon: <Zap size={20} />, decimals: 1 },
    { value: 12400, suffix: '+', label: 'Officers Enrolled', icon: <Users size={20} /> },
  ];

  const statColors = ['#FF9933', '#138808', '#FF9933', '#138808'];

  return (
    <div className="overflow-x-hidden" style={{ background: '#FFF8F0' }}>

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background image with parallax */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/hero-farm.png')", transform: 'scale(1.1)' }}
          />
          {/* Multi-layer overlay - darker for Indian golden hour feel */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(13,31,10,0.25) 0%, rgba(13,31,10,0.45) 35%, rgba(13,31,10,0.92) 82%, rgba(13,31,10,1) 100%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, rgba(13,31,10,0.65) 0%, transparent 55%, rgba(13,31,10,0.25) 100%)'
          }} />
          {/* Saffron glow */}
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(ellipse at 25% 60%, rgba(255,153,51,0.35) 0%, transparent 55%)'
          }} />
          {/* Green glow */}
          <div className="absolute inset-0 opacity-15" style={{
            background: 'radial-gradient(ellipse at 75% 35%, rgba(19,136,8,0.3) 0%, transparent 50%)'
          }} />
        </motion.div>

        <ParticleField />

        {/* Tiranga vertical ribbon — right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 z-10 tiranga-stripe opacity-80" />

        {/* Hero content */}
        <motion.div
          style={{ y: textY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full"
        >
          <div className="max-w-4xl">

            {/* Gov badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 mb-7"
            >
              <div className="glass-dark rounded-full px-5 py-2 border border-white/15 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF9933] rounded-full animate-pulse" />
                <span className="text-[#FF9933] text-xs font-bold tracking-widest uppercase">
                  भारत सरकार · Government of India
                </span>
              </div>
            </motion.div>

            {/* Primary SLOGAN */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <h1 className="text-6xl sm:text-7xl lg:text-[88px] font-black leading-none tracking-tight mb-4">
                <span className="block text-white drop-shadow-2xl" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}>
                  आपकी ज़मीन
                </span>
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #FF9933 0%, #FFB347 40%, #FF9933 70%, #E07800 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 35px rgba(255,153,51,0.55))',
                  }}
                >
                  आपका मकान
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl sm:text-2xl text-white/80 font-light max-w-2xl leading-relaxed mb-2"
            >
              <span className="text-white font-semibold">Aapki Zameen, Aapka Makaan</span> — Your Land, Your Right.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62 }}
              className="text-base text-white/55 max-w-xl leading-relaxed mb-10"
            >
              India's unified <strong className="text-white/80">GIS-enabled National Land Acquisition & Management System</strong> — 
              bringing full lifecycle transparency, fair compensation, and digital accountability.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth?tab=register')}
                className="btn-glow flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #FF9933, #E07800)',
                  boxShadow: '0 8px 32px rgba(255,153,51,0.45), 0 0 0 1px rgba(255,153,51,0.25)',
                }}
              >
                Access Portal
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white glass-dark border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #138808, #0a5c04)' }}>
                  <Play size={14} className="ml-0.5" />
                </div>
                Watch Demo
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate('/transparency')}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-medium text-[#138808] hover:text-white transition-colors"
                style={{ color: '#86efac' }}
              >
                <Eye size={16} />
                Public Transparency Portal
              </motion.button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-wrap items-center gap-6 mt-12"
            >
              {[
                { icon: <Shield size={13} />, text: 'ISO 27001 Certified', col: '#86efac' },
                { icon: <Lock size={13} />, text: '256-bit Encryption', col: '#86efac' },
                { icon: <CheckCircle size={13} />, text: 'CERT-In Compliant', col: '#86efac' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/45 text-xs">
                  <span style={{ color: item.col }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Floating Chakra */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute right-8 lg:right-20 top-1/2 -translate-y-1/2 hidden lg:block"
          >
            <div className="relative">
              <ChakraSVG size={200} className="chakra-spin opacity-25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl animate-float opacity-60">🌾</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════════ */}
      <StateBadgeMarquee />

      {/* ══ STATS ════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 section-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 text-center group hover:scale-105 transition-transform shadow-md border border-orange-50"
              >
                <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform" style={{ color: statColors[i] }}>
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-black mb-1" style={{ color: statColors[i] }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
                </div>
                <div className="text-gray-500 text-xs font-semibold tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VIDEO SECTION ════════════════════════════════════════════════════════ */}
      <div id="video-section">
        <VideoSection />
      </div>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 section-white">
        <div className="absolute inset-0 grid-pattern-light" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[#138808] text-xs font-bold tracking-widest uppercase mb-4 px-5 py-2 rounded-full border border-[#138808]/30 bg-[#138808]/8">
              Platform Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a2e] mb-4">
              Everything in{' '}
              <span className="text-gradient-saffron">One Platform</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From GIS mapping to compensation tracking — NLAMS digitizes every step of the land acquisition lifecycle.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.1} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 section-saffron-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <span className="inline-block text-[#FF9933] text-xs font-bold tracking-widest uppercase mb-4 px-5 py-2 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/10">
                  Digital Lifecycle
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a2e] mb-4 leading-tight">
                  The Complete
                  <br />
                  <span className="text-gradient-tiranga">Acquisition Journey</span>
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  NLAMS replaces fragmented, state-specific paper trails with a single, unified digital workflow.
                </p>
              </motion.div>
              <div>
                {steps.map((step, i) => (
                  <StepCard key={i} {...step} delay={i * 0.12} />
                ))}
              </div>
            </div>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:sticky lg:top-32"
            >
              <div className="relative">
                <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-2xl">
                  {/* Window bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="flex-1 ml-4 text-center">
                      <div className="inline-block px-4 py-1 rounded-md bg-gray-100 text-gray-500 text-xs">
                        nlams.gov.in/dashboard
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Tricolor header strip */}
                    <div className="h-1 rounded-full tiranga-bar" />

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Area Notified', value: '2.4L ha', color: '#138808', bg: '#f0fff0' },
                        { label: 'Compensation', value: '₹8,420 Cr', color: '#FF9933', bg: '#fff8f0' },
                        { label: 'Families', value: '12,400', color: '#003580', bg: '#f0f4ff' },
                      ].map((item, i) => (
                        <div key={i} className="rounded-2xl p-3 text-center" style={{ background: item.bg }}>
                          <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
                          <div className="text-gray-400 text-[10px] mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Map placeholder */}
                    <div className="rounded-2xl overflow-hidden relative" style={{ height: 155, background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
                      <div className="absolute inset-0 grid-pattern opacity-40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <MapPin size={28} className="mx-auto mb-2" style={{ color: '#FF9933' }} />
                          <span className="text-white/60 text-xs">India GIS Map — Live Parcels</span>
                        </div>
                      </div>
                      {[
                        { left: '30%', top: '40%' }, { left: '55%', top: '30%' },
                        { left: '45%', top: '60%' }, { left: '70%', top: '50%' },
                        { left: '25%', top: '65%' },
                      ].map((pos, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{ ...pos, background: i % 2 === 0 ? '#FF9933' : '#138808' }}
                          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                        />
                      ))}
                    </div>

                    {/* Progress bars */}
                    {[
                      { label: 'Proposal → Approval', pct: 78, color: '#FF9933' },
                      { label: 'Award → Possession', pct: 54, color: '#138808' },
                      { label: 'R&R Completion', pct: 41, color: '#003580' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>{item.label}</span>
                          <span style={{ color: item.color }} className="font-bold">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: item.color }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.5 + i * 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2 shadow-lg border border-green-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#138808] rounded-full animate-pulse" />
                    <span className="text-[#138808] text-xs font-semibold">Live Updates</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-orange-100"
                >
                  <div className="text-[#FF9933] text-xs font-bold">+234 parcels today</div>
                  <div className="text-gray-400 text-[10px]">across 12 districts</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ STAKEHOLDERS ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 section-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[#003580] text-xs font-bold tracking-widest uppercase mb-4 px-5 py-2 rounded-full border border-[#003580]/25 bg-[#003580]/8">
              Multi-Stakeholder Platform
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a2e] mb-4">
              One Platform,{' '}
              <span className="text-gradient-green">Every Stakeholder</span>
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { role: 'Central Ministry', emoji: '🏛️', color: '#8b5cf6', bg: '#faf5ff', border: '#8b5cf644', desc: 'National overview, choropleth maps, policy decisions.', access: ['National Dashboard', 'Policy Reports', 'Escalation Controls'] },
              { role: 'State Government', emoji: '🗳️', color: '#003580', bg: '#f0f4ff', border: '#00358044', desc: 'State-wide project queue, digital approvals, budget tracking.', access: ['Proposal Approvals', 'State Analytics', 'Budget Mgmt'] },
              { role: 'District Officer', emoji: '📋', color: '#138808', bg: '#f0fff0', border: '#13880844', desc: 'Submit proposals, draw parcel boundaries on GIS map.', access: ['Proposal Submission', 'GIS Mapping', 'Field Reports'] },
              { role: 'Landowner / Farmer', emoji: '🌾', color: '#FF9933', bg: '#fff8f0', border: '#FF993344', desc: 'Track compensation status, view notices, R&R progress.', access: ['Compensation Tracker', 'Notice Alerts', 'R&R Status'] },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl p-6 card-hover-3d group border shadow-md"
                style={{ background: item.bg, borderColor: item.border }}
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-lg mb-2 text-[#1a1a2e] group-hover:text-[#FF9933] transition-colors">{item.role}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div className="space-y-2 mb-5">
                  {item.access.map((a, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle size={12} style={{ color: item.color }} />
                      {a}
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/auth')}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{ borderColor: `${item.color}50`, color: item.color, background: `${item.color}0d` }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${item.color}1a`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${item.color}0d`; }}
                >
                  Login as {item.role.split(' ')[0]} →
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 section-cream">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-[#FF9933] text-xs font-bold tracking-widest uppercase mb-4 px-5 py-2 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/8">
              Voices from the Field
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#1a1a2e]">
              Trusted by <span className="text-gradient-saffron">Thousands</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} delay={i * 0.15} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden section-green-dark">
        {/* Tiranga glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 30% 50%, #FF9933 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(ellipse at 70% 50%, #138808 0%, transparent 60%)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <div className="rounded-3xl p-12 border border-white/10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(19,136,8,0.06))' }}>
            {/* Top tiranga stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 tiranga-bar" />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 tiranga-bar" />

            <ChakraSVG size={60} className="chakra-pulse mx-auto mb-6 opacity-40" />
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to Transform
              <br />
              <span className="text-gradient-tiranga">Land Governance?</span>
            </h2>
            <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto">
              Join 28+ states on NLAMS. Bring transparency, fairness, and speed to every land acquisition for India's future.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth?tab=register')}
                className="btn-glow flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)', boxShadow: '0 8px 32px rgba(255,153,51,0.4)' }}
              >
                Start Free Today <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/about')}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white border border-white/20 hover:border-white/40 transition-all"
              >
                Learn More <ChevronRight size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
