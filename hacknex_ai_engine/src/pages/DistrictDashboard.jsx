import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, LogOut, FilePlus, TrendingUp, IndianRupee, Users, Landmark,
  FileText, CheckCircle2, Clock, AlertTriangle, Activity, Search,
  ChevronDown, ArrowUpRight, ArrowDownRight, Zap, XCircle, X,
  Shield, Send, Eye, CircleDot, Camera, Radio, RotateCcw, ChevronRight, CornerDownRight
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  districtProfile, districtKPI, districtProposals,
  districtOngoingProjects, fieldActivityFeed, rejectedProposals
} from '../data/districtData';

// Fix default marker icon for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ end, duration = 1600, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  React.useEffect(() => {
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

// ─── KPI Card Component ────────────────────────────────────────────────────────
function KPICard({ icon: Icon, title, value, prefix, suffix, color, trend, delay }) {
  const cm = {
    amber:   { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', icon: 'text-amber-400', ring: 'ring-amber-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    blue:    { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', icon: 'text-blue-400', ring: 'ring-blue-500/20' },
    purple:  { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
  };
  const c = cm[color] || cm.amber;
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
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

// ─── Status Badge Component for Proposals ─────────────────────────────────────
function ProposalStatusBadge({ status }) {
  const cfg = {
    Pending:  { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400', label: '🟡 Pending State Review' },
    Approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: '🟢 Approved by State' },
    Rejected: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: '🔴 Rejected (Needs Action)' },
    Live:     { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400', label: '🔵 Live Active Project' },
  };
  const c = cfg[status] || cfg.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'Pending' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

// ─── Stage Badge Component for Ongoing Projects ──────────────────────────────
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

// ─── Field Officer Activity Icon ──────────────────────────────────────────────
const fieldIcons = {
  geotag:       <MapPin size={15} className="text-emerald-400" />,
  photo:        <Camera size={15} className="text-blue-400" />,
  hearing:      <Users size={15} className="text-amber-400" />,
  verification: <Shield size={15} className="text-purple-400" />,
};

// ─── Pune District Map ────────────────────────────────────────────────────────
function DistrictMap() {
  return (
    <div className="h-full min-h-[380px] rounded-2xl overflow-hidden border border-white/10 relative">
      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={11}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: '#0a0f1e' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {districtOngoingProjects.map(p => (
          <CircleMarker
            key={p.id}
            center={p.coordinates}
            radius={p.delayed ? 10 : 8}
            pathOptions={{
              color: p.delayed ? '#ef4444' : '#10b981',
              fillColor: p.delayed ? '#ef4444' : '#10b981',
              fillOpacity: 0.7,
              weight: p.delayed ? 3 : 2,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#fff' }}>{p.name}</div>
                <div style={{ color: '#a3a3a3', fontSize: '11px', marginTop: '2px' }}>
                  Tehsil: <strong>{p.tehsil}</strong> · Stage: <strong>{p.stage}</strong>
                </div>
                <div style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, marginTop: '2px' }}>
                  Area: {p.area} acres · {p.families} families
                </div>
                {p.delayed && (
                  <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>
                    ⚠ Delayed by {p.delayDays} days
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map Overlay Badge */}
      <div className="absolute top-3 left-3 z-[400] glass-dark px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-white/80 flex items-center gap-2">
        <MapPin size={14} className="text-amber-400" />
        Pune District Geo-GIS View
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN DISTRICT DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function DistrictDashboard() {
  const navigate = useNavigate();
  const [expandedProposal, setExpandedProposal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const profile = districtProfile;
  const kpi = districtKPI;

  const filteredProposals = useMemo(() => {
    return districtProposals.filter(p =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#0D1F0A] text-white relative overflow-hidden">
      {/* Background ambient tricolor glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none" />

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
          {/* Left: Logo & District Identity */}
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

            {/* District identity */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md"
                style={{ background: 'linear-gradient(135deg, #138808, #0a5c04)' }}>
                {profile.emblem}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {profile.district} District Revenue Office
                </div>
                <div className="text-[10px] text-white/40">State of Maharashtra</div>
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
            <Link
              to="/state-dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>🗳️</span>
              <span className="hidden md:inline">State (MH)</span>
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}>
              <span>📋</span>
              <span className="hidden md:inline">District (Pune)</span>
            </span>
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

          {/* Right: Officer Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 mr-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}>
                VM
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

      {/* ─── Main Dashboard Content ─────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

        {/* ─── KPI Cards Row ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard icon={FileText} title="Total Proposals Submitted" value={kpi.totalProposals} color="amber" trend={kpi.trends.proposals} delay={0} />
          <KPICard icon={TrendingUp} title="Active Projects in District" value={kpi.activeProjects} color="emerald" trend={kpi.trends.projects} delay={0.1} />
          <KPICard icon={Users} title="Families Affected in District" value={kpi.familiesAffected} color="purple" trend={kpi.trends.families} delay={0.2} />
          <KPICard icon={IndianRupee} title="Compensation Pending" value={kpi.compensationPending} prefix="₹" suffix=" Cr" color="blue" trend={kpi.trends.compensation} delay={0.3} />
        </div>

        {/* ─── Quick Action Button (Big & Prominent) ──────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/new-proposal')}
            className="w-full max-w-xl py-5 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 shadow-2xl shadow-amber-500/25 border border-amber-400/30 flex items-center justify-center gap-3 transition-all"
          >
            <FilePlus size={24} className="animate-pulse" />
            + Submit New Land Acquisition Proposal
          </motion.button>
        </motion.div>

        {/* ─── My Proposals Table ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText size={20} className="text-amber-400" />
                My Submitted Proposals
                <span className="text-xs font-normal text-white/40 ml-2">({districtProposals.length} total)</span>
              </h2>
              <p className="text-xs text-white/40 mt-1">Track land acquisition proposals initiated by Pune District Revenue Office</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Proposal ID', 'Project Name', 'Public Purpose', 'Area (acres)', 'Est. Cost', 'Submitted Date', 'Status & Remarks'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProposals.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setExpandedProposal(expandedProposal === p.id ? null : p.id)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                        p.status === 'Rejected' ? 'bg-red-500/[0.03]' : ''
                      }`}
                    >
                      <td className="px-5 py-4 text-xs font-mono text-white/50">{p.id}</td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-white/90">{p.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-md">{p.purpose}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-mono text-white/70">{p.area.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-sm font-mono text-amber-400/80">₹{p.compensationEst} Cr</td>
                      <td className="px-5 py-4 text-xs text-white/40 font-mono">{p.submittedDate}</td>
                      <td className="px-5 py-4">
                        <ProposalStatusBadge status={p.status} />
                      </td>
                    </motion.tr>

                    {/* Expandable row for Rejection Reasons or Notes */}
                    <AnimatePresence>
                      {expandedProposal === p.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/[0.01]"
                        >
                          <td colSpan={7} className="px-5 py-3 border-b border-white/5">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 flex items-start gap-2">
                              <CornerDownRight size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                              <div>
                                {p.status === 'Rejected' ? (
                                  <>
                                    <strong className="text-red-400">Rejection Remark from State Govt ({p.rejectedDate}): </strong>
                                    <span>{p.rejectionReason}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/new-proposal?resubmit=${p.id}`);
                                      }}
                                      className="ml-3 font-bold text-amber-400 hover:underline"
                                    >
                                      Resubmit Now →
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <strong className="text-emerald-400">Status Update: </strong>
                                    <span>{p.statusNote}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ─── District Map + Field Officer Activity Row ──────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pune District Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="xl:col-span-2 glass rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-400" />
                  Pune District Active Projects Map
                </h2>
                <p className="text-xs text-white/40 mt-1">Live GIS plotting of active acquisition sites in Pune</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ongoing</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Delayed</span>
              </div>
            </div>
            <div className="h-[380px]">
              <DistrictMap />
            </div>
          </motion.div>

          {/* Ground Level Field Officer Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl flex flex-col"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Radio size={18} className="text-blue-400 animate-pulse" />
                Field Officer Activity
              </h2>
              <p className="text-xs text-white/40 mt-1">Real-time ground verification updates from surveyors</p>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3 max-h-[340px]">
              {fieldActivityFeed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${item.avatarColor} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {item.officerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white/90">{item.officerName}</div>
                        <div className="text-[9px] text-white/40">{item.role}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/30 font-mono">{item.timestamp}</span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed pl-9">
                    {item.message}
                  </p>
                  <div className="mt-2 text-[10px] text-amber-400/80 font-medium pl-9 flex items-center gap-1">
                    <Zap size={10} /> {item.project}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Ongoing Projects Table ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-400" />
                Ongoing Live Projects in District
                <span className="text-xs font-normal text-white/40 ml-2">({districtOngoingProjects.length} active)</span>
              </h2>
              <p className="text-xs text-white/40 mt-1">Live land acquisition execution progress in Pune</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  {['Project Name', 'Tehsil', 'Acquisition Stage', 'Area (acres)', 'Families', 'Compensation %', 'Last Updated', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {districtOngoingProjects.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                      p.delayed ? 'bg-red-500/[0.03] border-l-2 border-l-red-500' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {p.delayed && <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />}
                        <span className="text-sm font-semibold text-white/90">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/60">{p.tehsil}</td>
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
                          <AlertTriangle size={10} /> {p.delayDays}d delayed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 size={10} /> On Track
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ─── Rejected Proposals Section (Action Required) ───────── */}
        {rejectedProposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl overflow-hidden border border-red-500/30 bg-red-500/5 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <XCircle size={20} className="text-red-400" />
                Rejected Proposals Requiring Resubmission
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                  {rejectedProposals.length} Action Needed
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {rejectedProposals.map(r => (
                <div key={r.id} className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/40">{r.id}</span>
                      <span className="text-sm font-bold text-white/90">{r.name}</span>
                      <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">{r.purpose}</span>
                    </div>
                    <p className="text-xs text-red-400/90 mt-2 leading-relaxed">
                      ❌ <strong>Reason for Rejection: </strong>{r.rejectionReason}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/new-proposal?resubmit=${r.id}`)}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Resubmit Proposal
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}
