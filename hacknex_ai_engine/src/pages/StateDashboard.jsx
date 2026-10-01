import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, LogOut, TrendingUp, IndianRupee, Users, Landmark,
  FileText, CheckCircle2, Clock, AlertTriangle, Activity, Search,
  ChevronDown, ArrowUpRight, ArrowDownRight, Zap, XCircle, X,
  ThumbsUp, ThumbsDown, Shield, Send, Eye, CircleDot, Loader2,
  BarChart3, FolderOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  stateProfile, stateKPI, districtData, pendingProposals,
  ongoingProjects, delayedAlerts, stateActivityFeed,
  getDistrictCompensationChart
} from '../data/stateData';

// Maharashtra GeoJSON
const MH_GEOJSON_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/district/maharashtra.geojson';

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ end, duration = 1800, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start;
    let raf;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <span>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, title, value, prefix, suffix, color, trend, delay }) {
  const cm = {
    amber:   { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', icon: 'text-amber-400', ring: 'ring-amber-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    blue:    { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', icon: 'text-blue-400', ring: 'ring-blue-500/20' },
    red:     { bg: 'from-red-500/20 to-red-600/5', border: 'border-red-500/30', icon: 'text-red-400', ring: 'ring-red-500/20' },
    purple:  { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
  };
  const c = cm[color] || cm.amber;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-6 ring-1 ${c.ring} cursor-default`}
    >
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${c.bg} blur-2xl opacity-40`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/5 ${c.icon}`}><Icon size={24} strokeWidth={2} /></div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend.dir === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'
            }`}>
              {trend.dir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.val}
            </div>
          )}
        </div>
        <div className="text-3xl font-black text-white mb-1 tracking-tight">
          <AnimatedCounter end={value} prefix={prefix || ''} suffix={suffix || ''} />
        </div>
        <div className="text-sm text-white/50 font-medium">{title}</div>
      </div>
    </motion.div>
  );
}

// ─── Stage Badge ──────────────────────────────────────────────────────────────
function StageBadge({ stage }) {
  const cfg = {
    Notification: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
    Award:        { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    Compensation: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    Possession:   { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
    'R&R':        { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  };
  const c = cfg[stage] || cfg.Notification;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <CircleDot size={10} />
      {stage}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const c = priority === 'high'
    ? 'bg-red-500/15 text-red-400 border-red-500/30'
    : 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${c}`}>
      {priority}
    </span>
  );
}

// ─── Activity Icon ────────────────────────────────────────────────────────────
const actTypeIcons = {
  proposal:  <FileText size={14} className="text-blue-400" />,
  milestone: <CheckCircle2 size={14} className="text-emerald-400" />,
  approval:  <ThumbsUp size={14} className="text-emerald-400" />,
  document:  <FileText size={14} className="text-purple-400" />,
  payment:   <IndianRupee size={14} className="text-amber-400" />,
  legal:     <Landmark size={14} className="text-orange-400" />,
  hearing:   <Users size={14} className="text-cyan-400" />,
  alert:     <AlertTriangle size={14} className="text-red-400" />,
};

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-dark rounded-xl p-3 shadow-2xl border border-white/10 text-xs">
      <div className="font-bold text-white mb-1">{d.name}</div>
      <div className="text-emerald-400">Sanctioned: ₹{d.sanctioned} Cr</div>
      <div className="text-amber-400">Disbursed: ₹{d.disbursed} Cr</div>
      <div className="text-white/40 mt-1">
        Gap: ₹{d.sanctioned - d.disbursed} Cr ({Math.round((d.disbursed / d.sanctioned) * 100)}% paid)
      </div>
    </div>
  );
}

// ─── State Map ────────────────────────────────────────────────────────────────
function StateMap() {
  const [geoData, setGeoData] = useState(null);
  const geoRef = useRef(null);

  useEffect(() => {
    fetch(MH_GEOJSON_URL)
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  const districtActivityColor = (name) => {
    const d = districtData[name];
    if (!d) return '#1e293b';
    if (d.activity === 'high') return '#10b981';
    if (d.activity === 'medium') return '#f59e0b';
    return '#334155';
  };

  const geoStyle = (feature) => {
    const name = feature.properties.NAME_2 || feature.properties.district || feature.properties.DISTRICT || '';
    return {
      fillColor: districtActivityColor(name),
      weight: 1,
      color: 'rgba(255,255,255,0.15)',
      fillOpacity: 0.5,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.NAME_2 || feature.properties.district || feature.properties.DISTRICT || '';
    const d = districtData[name];
    if (d) {
      layer.bindTooltip(
        `<div style="font-family:Inter,sans-serif">
          <div style="font-weight:800;font-size:13px;margin-bottom:3px">${name}</div>
          <div style="font-size:11px;color:#a3a3a3">Projects: <b style="color:#10b981">${d.projects}</b></div>
          <div style="font-size:11px;color:#a3a3a3">Area: <b style="color:#f59e0b">${d.area.toLocaleString('en-IN')}</b> acres</div>
          <div style="font-size:11px;color:#a3a3a3">Families: <b style="color:#a78bfa">${d.families}</b></div>
        </div>`,
        { className: 'state-tooltip', direction: 'top', opacity: 1 }
      );
    }
    layer.on({
      mouseover: (e) => e.target.setStyle({ weight: 2, color: '#fff', fillOpacity: 0.7 }),
      mouseout: (e) => { if (geoRef.current) geoRef.current.resetStyle(e.target); },
    });
  };

  return (
    <div className="h-full min-h-[400px] rounded-xl overflow-hidden">
      <MapContainer
        center={[19.5, 76.0]}
        zoom={6.2}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png" opacity={0.25} />
        {geoData && <GeoJSON ref={geoRef} data={geoData} style={geoStyle} onEachFeature={onEachFeature} />}
        {ongoingProjects.map(p => (
          <CircleMarker
            key={p.id}
            center={p.coordinates}
            radius={p.delayed ? 8 : 6}
            pathOptions={{
              color: p.delayed ? '#ef4444' : '#10b981',
              fillColor: p.delayed ? '#ef4444' : '#10b981',
              fillOpacity: 0.7,
              weight: p.delayed ? 2 : 1,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong>{p.name}</strong><br />
                <span style={{ color: '#a3a3a3', fontSize: '11px' }}>{p.district} · {p.stage}</span><br />
                {p.delayed && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>⚠ Delayed by {p.delayDays} days</span>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

// ─── Approve / Reject Modal ──────────────────────────────────────────────────
function ActionModal({ type, proposal, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    setTimeout(() => { onConfirm(); onClose(); }, 800);
  };

  const isApprove = type === 'approve';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="glass-dark rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl"
      >
        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className={`mx-auto mb-3 ${isApprove ? 'text-emerald-400' : 'text-red-400'}`} />
            <div className="text-lg font-bold text-white">
              {isApprove ? 'Proposal Approved!' : 'Proposal Returned'}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {isApprove ? 'Forwarded to Central Ministry' : 'Sent back to district with remarks'}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isApprove ? 'bg-emerald-500/20' : 'bg-red-500/20'
              }`}>
                {isApprove ? <ThumbsUp size={20} className="text-emerald-400" /> : <ThumbsDown size={20} className="text-red-400" />}
              </div>
              <div>
                <div className="text-white font-bold">{isApprove ? 'Approve Proposal' : 'Reject Proposal'}</div>
                <div className="text-xs text-white/40">{proposal.id}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
              <div className="text-sm font-semibold text-white/90">{proposal.name}</div>
              <div className="text-xs text-white/40 mt-1">{proposal.district} · {proposal.area} acres · ₹{proposal.compensationEst} Cr est.</div>
            </div>

            {isApprove ? (
              <p className="text-sm text-white/50 mb-5">
                This will <span className="text-emerald-400 font-semibold">sign and approve</span> the proposal and forward it to the Central Ministry for final clearance.
              </p>
            ) : (
              <div className="mb-5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">Reason for Rejection *</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="Provide a reason (will be sent to the district)..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading || (!isApprove && !reason.trim())}
                className={`flex-[2] py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isApprove
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : isApprove ? <ThumbsUp size={16} /> : <Send size={16} />}
                {loading ? 'Processing...' : isApprove ? 'Sign & Approve' : 'Return to District'}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function StateDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState(pendingProposals);
  const [modal, setModal] = useState(null); // { type, proposal }
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const chartData = useMemo(() => getDistrictCompensationChart(), []);
  const kpi = stateKPI;
  const profile = stateProfile;

  const filteredProjects = useMemo(() => {
    return ongoingProjects.filter(p => {
      const matchStage = stageFilter === 'All' || p.stage === stageFilter;
      const matchSearch = !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStage && matchSearch;
    });
  }, [stageFilter, searchTerm]);

  const handleProposalAction = (proposalId) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
  };

  return (
    <div className="min-h-screen bg-[#0D1F0A] relative overflow-hidden">
      {/* Background ambient tricolor glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tiranga accent — top */}
      <div className="h-1.5 tiranga-bar" />

      {/* ─── Top Bar ──────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(13,31,10,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF9933, #FFFFFF, #138808)' }}
              >
                <span className="text-sm">🇮🇳</span>
              </motion.div>
              <div>
                <div className="text-white font-black text-base leading-tight">NLAMS</div>
                <div className="text-[9px] text-[#86efac] font-bold tracking-widest uppercase">Govt. of India</div>
              </div>
            </Link>

            <div className="hidden xl:block h-7 w-px bg-white/10 mx-1" />

            {/* State identity */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #138808, #0a5c04)' }}>
                {profile.emblem}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {profile.state} Government
                </div>
                <div className="text-[10px] text-white/40">Revenue Dept · Mantralaya</div>
              </div>
            </div>
          </div>

          {/* Center — Persona Quick Switcher (Tricolor Themed) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span className="hidden md:inline">National View</span>
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #138808, #0a5c04)' }}>
              <span>🗳️</span>
              <span className="hidden md:inline">State (MH)</span>
            </span>
            <Link
              to="/district-dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>📋</span>
              <span className="hidden md:inline">District (Pune)</span>
            </Link>
            <Link
              to="/farmer-dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>🌾</span>
              <span className="hidden md:inline">Farmer Portal</span>
            </Link>
            <Link
              to="/"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              title="Return to Public Home"
            >
              <span>🏠</span>
            </Link>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 mr-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #138808, #0a5c04)' }}>
                SK
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white">{profile.officer.name}</div>
                <div className="text-[10px] text-white/40">{profile.officer.designation}</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={17} />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-bold text-white rounded-full px-1"
                style={{ background: '#FF9933' }}>
                {profile.unreadNotifications}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

        {/* ─── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard icon={FolderOpen} title="Total Projects in State" value={kpi.totalProjects} color="blue" trend={kpi.trends.projects} delay={0} />
          <KPICard icon={MapPin} title="Area Under Acquisition" value={kpi.areaUnderAcquisition} suffix=" acres" color="emerald" trend={kpi.trends.area} delay={0.1} />
          <KPICard icon={IndianRupee} title="Compensation Pending" value={kpi.compensationPending} prefix="₹" suffix=" Cr" color="amber" trend={kpi.trends.compensation} delay={0.2} />
          <KPICard icon={Users} title="Families Displaced" value={kpi.familiesDisplaced} color="red" trend={kpi.trends.families} delay={0.3} />
        </div>

        {/* ─── Pending Proposals ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText size={20} className="text-amber-400" />
                Pending Proposals
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  {proposals.length} pending your approval
                </span>
              </h2>
              <p className="text-xs text-white/40 mt-1">Proposals from District Collectors awaiting State Government approval</p>
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 size={48} className="text-emerald-500/30 mx-auto mb-3" />
              <div className="text-white/50 text-sm font-semibold">All proposals cleared!</div>
              <div className="text-white/30 text-xs">No pending approvals at this time.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Proposal ID', 'Project Name', 'District', 'Purpose', 'Area', 'Families', 'Est. Cost', 'Submitted', 'Priority', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {proposals.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4 text-xs font-mono text-white/50">{p.id}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-white/90">{p.name}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{p.documents} documents attached</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">{p.district}</td>
                      <td className="px-5 py-4"><span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">{p.purpose}</span></td>
                      <td className="px-5 py-4 text-sm font-mono text-white/70">{p.area.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-sm font-mono text-white/60">{p.families}</td>
                      <td className="px-5 py-4 text-sm font-mono text-amber-400/80">₹{p.compensationEst} Cr</td>
                      <td className="px-5 py-4 text-xs text-white/40 font-mono">{p.submittedDate}</td>
                      <td className="px-5 py-4"><PriorityBadge priority={p.priority} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setModal({ type: 'approve', proposal: p })}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                            title="Approve"
                          >
                            <ThumbsUp size={15} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setModal({ type: 'reject', proposal: p })}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                            title="Reject"
                          >
                            <ThumbsDown size={15} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ─── Map + Delayed Alerts + Activity Feed ───────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* State Map */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            className="xl:col-span-2 glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <MapPin size={18} className="text-emerald-400" />
                {profile.state} — District Acquisition Map
              </h2>
              <p className="text-xs text-white/40 mt-1">Districts colored by activity · Project pins shown on map</p>
            </div>
            <div className="h-[450px]">
              <StateMap />
            </div>
            <div className="px-5 py-3 border-t border-white/5 flex items-center gap-6 text-[10px] text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> High Activity</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500" /> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-700" /> Low</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Delayed Project</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> On Track</span>
            </div>
          </motion.div>

          {/* Right column — Alerts + Feed */}
          <div className="flex flex-col gap-6">
            {/* Delayed Alerts */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
              className="glass rounded-2xl">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  Delayed Projects
                  <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">{delayedAlerts.length}</span>
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {delayedAlerts.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 hover:bg-red-500/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-bold text-white/90 group-hover:text-red-400 transition-colors">{a.name}</div>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-400">
                        {a.delayDays}d late
                      </span>
                    </div>
                    <div className="text-[11px] text-white/40 mb-1.5">{a.district} · {a.stage}</div>
                    <div className="text-xs text-red-400/70 leading-relaxed">{a.issue}</div>
                    <div className="text-[10px] text-white/25 mt-2 flex items-center gap-1"><Clock size={10} /> {a.lastAction}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="glass rounded-2xl flex-1 flex flex-col">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Activity size={16} className="text-blue-400" />
                  Recent Activity
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1 max-h-[300px]">
                {stateActivityFeed.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="flex gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-default"
                  >
                    <div className="mt-0.5 flex-shrink-0">{actTypeIcons[item.type] || <Activity size={14} className="text-white/30" />}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white/60 leading-snug">{item.message}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-white/25">
                        <Clock size={9} /> {item.timestamp}
                        <span className="text-white/15">·</span>
                        <span>{item.district}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-3 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-white/25">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Live — {profile.state} only
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Compensation Bar Chart ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                District-wise Compensation Overview
              </h2>
              <p className="text-xs text-white/40 mt-1">Sanctioned vs Disbursed (₹ Cr) — identifies payment bottlenecks</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" width={110} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }} />
                <RTooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend
                  wrapperStyle={{ paddingTop: 16 }}
                  formatter={(val) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{val}</span>}
                />
                <Bar dataKey="sanctioned" name="Sanctioned (Saffron)" fill="#FF9933" radius={[0, 6, 6, 0]} barSize={14} />
                <Bar dataKey="disbursed" name="Disbursed (India Green)" fill="#138808" radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ─── Ongoing Projects Table ─────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Ongoing Projects
                <span className="text-xs font-normal text-white/40 ml-2">
                  ({filteredProjects.length} of {ongoingProjects.length})
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-56 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 transition-all"
                />
              </div>
              {/* Stage filter */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                {['All', 'Notification', 'Award', 'Compensation', 'Possession', 'R&R'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStageFilter(s)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                      stageFilter === s ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Project Name', 'District', 'Stage', 'Area (acres)', 'Families', 'Compensation %', 'Last Updated', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredProjects.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`cursor-pointer transition-colors group ${
                        p.delayed
                          ? 'bg-red-500/[0.03] hover:bg-red-500/[0.06] border-l-2 border-l-red-500/50'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {p.delayed && <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />}
                          <span className="text-sm font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">{p.district}</td>
                      <td className="px-5 py-4"><StageBadge stage={p.stage} /></td>
                      <td className="px-5 py-4 text-sm font-mono text-white/70">{p.area.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-sm font-mono text-white/60">{p.families}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.compensationPercent >= 80 ? 'bg-emerald-500' : p.compensationPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${p.compensationPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-white/50">{p.compensationPercent}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-white/40 font-mono">{p.lastUpdated}</td>
                      <td className="px-5 py-4">
                        {p.delayed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                            <AlertTriangle size={10} />
                            {p.delayDays}d delayed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 size={10} /> On Track
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-16 text-center">
              <Search size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No projects match your filters</p>
            </div>
          )}

          <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/25">
            <span>Showing {filteredProjects.length} of {ongoingProjects.length} projects</span>
            <span className="flex items-center gap-1"><Zap size={11} className="text-emerald-400" /> Live · {profile.state}</span>
          </div>
        </motion.div>
      </main>

      {/* ─── Action Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <ActionModal
            type={modal.type}
            proposal={modal.proposal}
            onClose={() => setModal(null)}
            onConfirm={() => handleProposalAction(modal.proposal.id)}
          />
        )}
      </AnimatePresence>

      {/* ─── Map Tooltip Styles ────────────────────────────────────── */}
      <style>{`
        .state-tooltip {
          background: rgba(10,15,30,0.95) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 12px !important;
          padding: 10px 14px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
          color: #fff !important;
        }
        .state-tooltip::before { border-top-color: rgba(10,15,30,0.95) !important; }
        .leaflet-container { background: transparent !important; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}
