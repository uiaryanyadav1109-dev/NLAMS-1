import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, TrendingUp, IndianRupee, Users, Bell, LogOut,
  Search, Filter, ChevronDown, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight, Clock, FileText, CheckCircle2,
  AlertTriangle, Landmark, Zap, Eye, XCircle, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  stateData, projects, activityFeed,
  getKPITotals, getTop10StatesByArea
} from '../data/dashboardData';

// ─── India GeoJSON (simplified inline) ──────────────────────────────────────
// We'll fetch it at runtime from a CDN for accuracy
const INDIA_GEOJSON_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, title, value, prefix, suffix, color, trend, trendValue, delay }) {
  const colorMap = {
    amber: {
      bg: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      glow: 'shadow-amber-500/20',
      ring: 'ring-amber-500/20',
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
      ring: 'ring-emerald-500/20',
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/20',
      ring: 'ring-blue-500/20',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/20',
      ring: 'ring-purple-500/20',
    },
  };

  const c = colorMap[color] || colorMap.amber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-6 shadow-xl ${c.glow} ring-1 ${c.ring} cursor-default`}
    >
      {/* Subtle glow orb */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${c.bg} blur-2xl opacity-40`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-white/5 ${c.icon}`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trendValue}
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

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ label, current, total, color, icon: Icon }) {
  const percent = Math.round((current / total) * 100);

  const barColors = {
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
    blue: 'from-blue-500 to-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 ${color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`}>
            <Icon size={18} />
          </div>
          <span className="text-sm font-semibold text-white/80">{label}</span>
        </div>
        <span className="text-2xl font-black text-white">{percent}%</span>
      </div>
      <div className="relative h-4 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColors[color] || barColors.emerald}`}
        />
        <div className="absolute inset-0 animate-shimmer rounded-full" />
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/40">
        <span>{current.toLocaleString('en-IN')} achieved</span>
        <span>{total.toLocaleString('en-IN')} total</span>
      </div>
    </motion.div>
  );
}

// ─── Activity Item ─────────────────────────────────────────────────────────────
function ActivityItem({ item, index }) {
  const typeIcons = {
    milestone: <CheckCircle2 size={14} className="text-emerald-400" />,
    payment: <IndianRupee size={14} className="text-amber-400" />,
    proposal: <FileText size={14} className="text-blue-400" />,
    completed: <CheckCircle2 size={14} className="text-emerald-400" />,
    document: <FileText size={14} className="text-purple-400" />,
    hearing: <Users size={14} className="text-cyan-400" />,
    alert: <AlertTriangle size={14} className="text-red-400" />,
    approval: <CheckCircle2 size={14} className="text-emerald-400" />,
    legal: <Landmark size={14} className="text-orange-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-default group"
    >
      <div className="mt-1 flex-shrink-0">
        {typeIcons[item.type] || <Activity size={14} className="text-white/40" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-amber-400/80 mb-0.5">{item.state}</div>
        <div className="text-sm text-white/70 group-hover:text-white/90 transition-colors leading-snug">
          {item.message}
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-white/30">
          <Clock size={10} />
          {item.timestamp}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    Ongoing: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
    Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    Delayed: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
  };
  const c = cfg[status] || cfg.Ongoing;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'Ongoing' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}

// ─── Custom Bar Chart Tooltip ──────────────────────────────────────────────────
function CustomBarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-dark rounded-xl p-3 shadow-2xl border border-white/10">
      <div className="text-sm font-bold text-white mb-1">{d.name}</div>
      <div className="text-xs text-emerald-400">Acquired: {d.acquired.toLocaleString('en-IN')} acres</div>
      <div className="text-xs text-white/50">Notified: {d.notified.toLocaleString('en-IN')} acres</div>
    </div>
  );
}

// ─── India Map Component ───────────────────────────────────────────────────────
function IndiaMap({ onStateClick, selectedState }) {
  const [geoData, setGeoData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Map GeoJSON state names to our stateData keys
  const nameMap = {
    "Maharashtra": "Maharashtra",
    "Uttar Pradesh": "Uttar Pradesh",
    "Rajasthan": "Rajasthan",
    "Tamil Nadu": "Tamil Nadu",
    "Gujarat": "Gujarat",
    "Karnataka": "Karnataka",
    "Madhya Pradesh": "Madhya Pradesh",
    "West Bengal": "West Bengal",
    "Telangana": "Telangana",
    "Andhra Pradesh": "Andhra Pradesh",
    "Kerala": "Kerala",
    "Punjab": "Punjab",
    "Odisha": "Odisha",
    "Orissa": "Odisha",
    "Bihar": "Bihar",
    "Jharkhand": "Jharkhand",
    "Chhattisgarh": "Chhattisgarh",
    "Chattisgarh": "Chhattisgarh",
    "Haryana": "Haryana",
    "Assam": "Assam",
    "Uttarakhand": "Uttarakhand",
    "Uttaranchal": "Uttarakhand",
    "Himachal Pradesh": "Himachal Pradesh",
    "Goa": "Goa",
  };

  function getProgressColor(progress) {
    if (progress >= 85) return '#10b981'; // emerald-500
    if (progress >= 70) return '#22c55e'; // green-500
    if (progress >= 60) return '#84cc16'; // lime-500
    if (progress >= 50) return '#eab308'; // yellow-500
    if (progress >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  }

  function style(feature) {
    const name = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || '';
    const mappedName = nameMap[name] || name;
    const data = stateData[mappedName];
    const progress = data?.progressPercent || 30;
    const isSelected = selectedState === mappedName;
    const isHovered = hoveredState === mappedName;

    return {
      fillColor: getProgressColor(progress),
      weight: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: 1,
      color: isSelected ? '#f59e0b' : isHovered ? '#ffffff' : 'rgba(255,255,255,0.2)',
      fillOpacity: isSelected ? 0.9 : isHovered ? 0.8 : 0.6,
    };
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.NAME_1 || feature.properties.name || feature.properties.ST_NM || '';
    const mappedName = nameMap[name] || name;
    const data = stateData[mappedName];

    if (data) {
      layer.bindTooltip(
        `<div style="font-family:Inter,sans-serif;padding:4px 0">
          <div style="font-weight:800;font-size:14px;margin-bottom:4px">${mappedName}</div>
          <div style="font-size:11px;color:#a3a3a3">Area Acquired: <span style="color:#10b981;font-weight:700">${data.totalAcquired.toLocaleString('en-IN')}</span> / ${data.totalNotified.toLocaleString('en-IN')} acres</div>
          <div style="font-size:11px;color:#a3a3a3">Compensation: <span style="color:#f59e0b;font-weight:700">₹${data.compensationDisbursed.toLocaleString('en-IN')}</span> Cr</div>
          <div style="font-size:11px;color:#a3a3a3">Families: <span style="color:#a78bfa;font-weight:700">${data.familiesAffected.toLocaleString('en-IN')}</span></div>
          <div style="font-size:11px;color:#a3a3a3">Progress: <span style="color:#10b981;font-weight:700">${data.progressPercent}%</span></div>
        </div>`,
        {
          direction: 'top',
          className: 'custom-tooltip',
          opacity: 1,
        }
      );
    }

    layer.on({
      mouseover: (e) => {
        setHoveredState(mappedName);
        e.target.setStyle({
          weight: 2,
          color: '#ffffff',
          fillOpacity: 0.8,
        });
      },
      mouseout: (e) => {
        setHoveredState(null);
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
      click: () => {
        onStateClick(mappedName === selectedState ? null : mappedName);
      },
    });
  }

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading India map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[22.5, 82.5]}
      zoom={4.5}
      scrollWheelZoom={false}
      dragging={true}
      zoomControl={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%', background: 'transparent', borderRadius: '1rem' }}
      className="rounded-2xl"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        opacity={0.3}
      />
      <GeoJSON
        ref={geoJsonRef}
        data={geoData}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function NationalDashboard() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const kpi = useMemo(() => getKPITotals(), []);
  const top10 = useMemo(() => getTop10StatesByArea(), []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchState = selectedState ? p.state === selectedState : true;
      const matchStatus = statusFilter === 'All' ? true : p.status === statusFilter;
      const matchSearch = searchTerm
        ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.purpose.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchState && matchStatus && matchSearch;
    });
  }, [selectedState, statusFilter, searchTerm]);

  const barColors = [
    '#FF9933', '#FFB347', '#E07800', '#F59E0B',
    '#22C55E', '#138808', '#10B981', '#059669',
    '#3B82F6', '#003580'
  ];

  return (
    <div className="min-h-screen bg-[#0D1F0A] relative overflow-hidden">
      {/* Background ambient tricolor glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tiranga accent — top */}
      <div className="h-1.5 tiranga-bar" />

      {/* ─── Dashboard Top Bar ────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(13,31,10,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left — Logo + Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF9933, #FFFFFF, #138808)' }}
              >
                <span className="text-gray-800 font-black text-xs">🇮🇳</span>
              </motion.div>
              <div>
                <div className="text-white font-black text-base leading-tight">NLAMS</div>
                <div className="text-[9px] text-[#86efac] font-bold tracking-widest uppercase">Govt. of India</div>
              </div>
            </Link>
            <div className="hidden xl:block h-7 w-px bg-white/10 mx-1" />
            <span className="hidden xl:inline text-white/80 font-bold text-sm tracking-wide">
              Central Ministry Portal
            </span>
          </div>

          {/* Center — Persona Quick Switcher (Tricolor Themed) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}>
              <span>🏛️</span>
              <span className="hidden md:inline">National View</span>
            </span>
            <Link
              to="/state-dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>🗳️</span>
              <span className="hidden md:inline">State (MH)</span>
            </Link>
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

          {/* Right — User + Actions */}
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2.5 mr-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #003580, #0033A0)' }}>
                RK
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white">Rajesh Kumar, IAS</div>
                <div className="text-[10px] text-white/40">Joint Secretary · MoRD</div>
              </div>
            </div>

            {/* Notification Bell */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#FF9933' }} />
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

        {/* State filter indicator */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30"
            >
              <MapPin size={16} className="text-amber-400" />
              <span className="text-sm text-white/80">
                Filtering by: <span className="font-bold text-amber-400">{selectedState}</span>
              </span>
              <button
                onClick={() => setSelectedState(null)}
                className="ml-auto text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── KPI Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            icon={MapPin}
            title="Total Area Notified"
            value={kpi.totalNotified}
            suffix=" acres"
            color="amber"
            trend="up"
            trendValue="+12.4%"
            delay={0}
          />
          <KPICard
            icon={TrendingUp}
            title="Total Area Acquired"
            value={kpi.totalAcquired}
            suffix=" acres"
            color="emerald"
            trend="up"
            trendValue="+8.7%"
            delay={0.1}
          />
          <KPICard
            icon={IndianRupee}
            title="Compensation Disbursed"
            value={kpi.compensationDisbursed}
            prefix="₹"
            suffix=" Cr"
            color="blue"
            trend="up"
            trendValue="+15.2%"
            delay={0.2}
          />
          <KPICard
            icon={Users}
            title="Families Affected"
            value={kpi.familiesAffected}
            suffix=" families"
            color="purple"
            trend="down"
            trendValue="-3.1%"
            delay={0.3}
          />
        </div>

        {/* ─── Map + Activity Feed ───────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* India Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-2 glass rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <MapPin size={18} className="text-emerald-400" />
                    Land Acquisition Progress — India
                  </h2>
                  <p className="text-xs text-white/40 mt-1">Click a state to filter projects below</p>
                </div>
                {/* Legend */}
                <div className="hidden md:flex items-center gap-4 text-[10px] text-white/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    High (&gt;85%)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-yellow-500" />
                    Medium
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-red-500" />
                    Low (&lt;50%)
                  </div>
                </div>
              </div>
            </div>
            <div className="h-[500px] relative">
              <IndiaMap
                onStateClick={setSelectedState}
                selectedState={selectedState}
              />
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass rounded-2xl flex flex-col"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Activity size={18} className="text-amber-400" />
                Live Activity Feed
              </h2>
              <p className="text-xs text-white/40 mt-1">Real-time updates across India</p>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1 max-h-[460px]">
              {activityFeed.map((item, i) => (
                <ActivityItem key={item.id} item={item} index={i} />
              ))}
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live — Updates every 30 seconds
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Progress Bars ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressBar
            label="Area Notified vs Area Acquired"
            current={kpi.totalAcquired}
            total={kpi.totalNotified}
            color="emerald"
            icon={TrendingUp}
          />
          <ProgressBar
            label="Compensation Sanctioned vs Disbursed"
            current={kpi.compensationDisbursed}
            total={kpi.compensationSanctioned}
            color="amber"
            icon={IndianRupee}
          />
        </div>

        {/* ─── Bar Chart — Top 10 States ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Top 10 States by Acquisition Area
              </h2>
              <p className="text-xs text-white/40 mt-1">Land area acquired in acres</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top10}
                layout="vertical"
                margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}
                />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="acquired" radius={[0, 8, 8, 0]} barSize={24}>
                  {top10.map((_, i) => (
                    <Cell key={i} fill={barColors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ─── Projects Table ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-5 border-b border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText size={18} className="text-blue-400" />
                  All Projects
                  <span className="text-xs font-normal text-white/40 ml-2">
                    ({filteredProjects.length} of {projects.length})
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
                    className="w-60 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:bg-white/8 transition-all"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                  {['All', 'Ongoing', 'Completed', 'Delayed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === status
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Project Name</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">State</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Purpose</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Area (acres)</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Families</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider text-right">Compensation</th>
                  <th className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredProjects.map((project, i) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                      onClick={() => {
                        // navigate to project detail
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/60">{project.state}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-md">{project.purpose}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-mono font-bold text-white/80">{project.area.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-mono text-white/60">{project.familiesAffected.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-mono text-amber-400/80">₹{project.compensationCr} Cr</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-white/40">{project.lastUpdated}</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* No results */}
          {filteredProjects.length === 0 && (
            <div className="py-16 text-center">
              <Search size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No projects match your filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setSelectedState(null);
                }}
                className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-5 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/30">
            <span>Showing {filteredProjects.length} of {projects.length} projects</span>
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-emerald-400" />
              Data refreshed at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </motion.div>

      </main>

      {/* ─── Leaflet Tooltip Styles ───────────────────────────────────── */}
      <style>{`
        .custom-tooltip {
          background: rgba(10, 15, 30, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
          color: #ffffff !important;
          backdrop-filter: blur(12px) !important;
        }
        .custom-tooltip::before {
          border-top-color: rgba(10, 15, 30, 0.95) !important;
        }
        .leaflet-container {
          background: transparent !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
