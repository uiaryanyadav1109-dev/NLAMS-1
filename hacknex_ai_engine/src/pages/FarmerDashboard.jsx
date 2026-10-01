import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Bell, LogOut, Languages, Download, FileText,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, User,
  IndianRupee, Home, Briefcase, Truck, GraduationCap, BadgeCheck,
  XCircle, MessageSquarePlus, Send, Landmark, Shield, Eye,
  ArrowUpRight, CreditCard, Calendar, CircleDot, ChevronDown,
  Sprout, Scale
} from 'lucide-react';
import { MapContainer, TileLayer, Rectangle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  farmerProfile, landParcel, acquisitionSteps, compensationData,
  rrStatus, documents, grievances, grievanceTypes, labels
} from '../data/farmerData';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Yes/No/Pending Badge ─────────────────────────────────────────────────────
function StatusBadge({ value, lang }) {
  const t = labels[lang];
  const cfgMap = {
    Yes:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: <CheckCircle2 size={12} />, label: t.yes },
    No:      { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', icon: <XCircle size={12} />, label: t.no },
    Pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: <Clock size={12} />, label: t.pending },
    Paid:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: <CheckCircle2 size={12} />, label: t.paid },
  };
  const c = cfgMap[value] || cfgMap.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Acquisition Status Badge (big) ───────────────────────────────────────────
function AcquisitionBadge({ status }) {
  const colors = {
    Notification: 'from-blue-500 to-blue-600',
    Award: 'from-purple-500 to-purple-600',
    Compensation: 'from-amber-500 to-orange-500',
    Possession: 'from-emerald-500 to-emerald-600',
    'R&R': 'from-cyan-500 to-cyan-600',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white bg-gradient-to-r ${colors[status] || colors.Compensation} shadow-lg`}>
      <CircleDot size={14} className="animate-pulse" />
      {status} Stage
    </span>
  );
}

// ─── Mini Land Map ────────────────────────────────────────────────────────────
function LandMiniMap() {
  const { coordinates, plotBounds } = landParcel;
  return (
    <div className="h-52 rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={[coordinates.lat, coordinates.lng]}
        zoom={16}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Rectangle
          bounds={plotBounds}
          pathOptions={{
            color: '#f59e0b',
            weight: 3,
            fillColor: '#f59e0b',
            fillOpacity: 0.25,
            dashArray: '8 4',
          }}
        />
        <Marker position={[coordinates.lat, coordinates.lng]}>
          <Popup>
            <strong>{landParcel.plotNumber}</strong><br />
            {landParcel.area} acres
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function AcquisitionStepper({ lang }) {
  const t = labels[lang];

  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-white/10" />
        <div
          className="absolute top-6 left-[10%] h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-1000"
          style={{
            width: `${((acquisitionSteps.filter(s => s.status === 'completed').length + 0.5) / acquisitionSteps.length) * 80}%`,
          }}
        />

        {acquisitionSteps.map((step, i) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isPending = step.status === 'pending';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex flex-col items-center text-center relative z-10 flex-1"
            >
              {/* Circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/30'
                  : isCurrent
                    ? 'bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/40 animate-pulse'
                    : 'bg-white/5 border-white/20'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-white" />
                ) : isCurrent ? (
                  <CircleDot size={20} className="text-white" />
                ) : (
                  <span className="text-sm font-bold text-white/30">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className={`mt-3 text-sm font-bold ${
                isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-white/30'
              }`}>
                {lang === 'hi' ? step.labelHi : step.label}
              </div>

              {/* Description */}
              <div className="mt-1 text-[10px] text-white/40 max-w-[120px] leading-tight">
                {lang === 'hi' ? step.descriptionHi : step.description}
              </div>

              {/* Dates */}
              <div className="mt-3 space-y-1">
                <div className="text-[10px] text-white/30">
                  {t.expected}: <span className="text-white/50 font-mono">{step.expectedDate}</span>
                </div>
                {step.actualDate && (
                  <div className="text-[10px] text-white/30">
                    {t.actual}: <span className="text-emerald-400/80 font-mono">{step.actualDate}</span>
                  </div>
                )}
              </div>

              {/* Delay flag */}
              {step.delayDays > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30"
                >
                  <AlertTriangle size={10} className="text-red-400" />
                  <span className="text-[10px] font-bold text-red-400">
                    {t.delayed} {step.delayDays} {t.days}
                  </span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Mobile stepper (vertical) */}
      <div className="md:hidden space-y-4">
        {acquisitionSteps.map((step, i) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400'
                    : isCurrent
                      ? 'bg-amber-500 border-amber-400 animate-pulse'
                      : 'bg-white/5 border-white/20'
                }`}>
                  {isCompleted ? <CheckCircle2 size={14} className="text-white" /> :
                   isCurrent ? <CircleDot size={14} className="text-white" /> :
                   <span className="text-xs font-bold text-white/30">{i + 1}</span>}
                </div>
                {i < acquisitionSteps.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-1 ${isCompleted ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>

              {/* Content */}
              <div className="pb-4 flex-1">
                <div className={`font-bold text-sm ${
                  isCompleted ? 'text-emerald-400' : isCurrent ? 'text-amber-400' : 'text-white/30'
                }`}>
                  {lang === 'hi' ? step.labelHi : step.label}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {lang === 'hi' ? step.descriptionHi : step.description}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-white/30">
                  <span>{t.expected}: <span className="font-mono text-white/50">{step.expectedDate}</span></span>
                  {step.actualDate && <span>{t.actual}: <span className="font-mono text-emerald-400/80">{step.actualDate}</span></span>}
                </div>
                {step.delayDays > 0 && (
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30">
                    <AlertTriangle size={10} className="text-red-400" />
                    <span className="text-[10px] font-bold text-red-400">{t.delayed} {step.delayDays} {t.days}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Farmer Dashboard ────────────────────────────────────────────────────
export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [showGrievanceForm, setShowGrievanceForm] = useState(false);
  const [grievanceType, setGrievanceType] = useState('');
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const t = labels[lang];
  const isHi = lang === 'hi';
  const profile = farmerProfile;
  const parcel = landParcel;
  const comp = compensationData;
  const paidPercent = Math.round((comp.amountPaid / comp.totalSanctioned) * 100);

  const formatINR = (n) => '₹' + n.toLocaleString('en-IN');

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowGrievanceForm(false);
      setSubmitted(false);
      setGrievanceType('');
      setGrievanceDesc('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D1F0A] relative overflow-hidden">
      {/* Background ambient tricolor glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tiranga accent — top */}
      <div className="h-1.5 tiranga-bar" />

      {/* ─── Top Bar ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(13,31,10,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left — Logo + Farmer info */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FF9933, #FFFFFF, #138808)' }}
              >
                <span className="text-gray-800 font-black text-xs">🇮🇳</span>
              </motion.div>
              <div>
                <div className="text-white font-black text-sm leading-tight">NLAMS</div>
                <div className="text-[8px] text-[#86efac] font-bold tracking-widest uppercase">Govt. of India</div>
              </div>
            </Link>

            <div className="hidden xl:block h-7 w-px bg-white/10 mx-1" />

            {/* Farmer identity */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md text-sm"
                style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}>
                🌾
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  {isHi ? profile.nameHi : profile.name}
                </div>
                <div className="text-[10px] text-white/40">
                  {isHi ? profile.villageHi : profile.village}, {isHi ? profile.districtHi : profile.district}
                </div>
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
            <Link
              to="/district-dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
            >
              <span>📋</span>
              <span className="hidden md:inline">District (Pune)</span>
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}>
              <span>🌾</span>
              <span className="hidden md:inline">Farmer Portal</span>
            </span>
            <Link
              to="/"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
              title="Return to Public Home"
            >
              <span>🏠</span>
            </Link>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-white/15 hover:border-amber-400/40 hover:bg-amber-500/10 transition-all"
            >
              <Languages size={13} className="text-[#FF9933]" />
              <span className="text-white/80">{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </motion.button>

            {/* Bell */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                style={{ background: '#FF9933' }} />
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">{t.logout}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ─── My Land Card + Mini Map ────────────────────────────── */}
        <FadeIn delay={0}>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sprout size={20} className="text-emerald-400" />
                {t.myLand}
              </h2>
              <AcquisitionBadge status={parcel.acquisitionStatus} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              {/* Map */}
              <div className="lg:col-span-2 p-5">
                <LandMiniMap />
              </div>

              {/* Land Details */}
              <div className="lg:col-span-3 p-5 lg:border-l border-white/5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <DetailRow label={t.plotNumber} value={parcel.plotNumber} mono />
                  <DetailRow label={t.surveyNo} value={parcel.surveyNumber} mono />
                  <DetailRow label={t.area} value={`${parcel.area} ${t.acres} (${parcel.areaHectare} ${t.hectare})`} />
                  <DetailRow label={t.landType} value={isHi ? parcel.landTypeHi : parcel.landType} />
                  <DetailRow label={t.crop} value={isHi ? parcel.cropGrownHi : parcel.cropGrown} />
                  <DetailRow label={t.village} value={isHi ? parcel.location.villageHi : parcel.location.village} />
                  <DetailRow label={t.taluka} value={isHi ? parcel.location.talukaHi : parcel.location.taluka} />
                  <DetailRow label={t.district} value={isHi ? parcel.location.districtHi : parcel.location.district} />
                </div>

                {/* Acquiring Project */}
                <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-2">{t.project}</div>
                  <div className="text-white font-bold text-sm mb-1">
                    {isHi ? parcel.projectNameHi : parcel.projectName}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Landmark size={11} /> {t.purpose}: <span className="text-white/60">{isHi ? parcel.projectPurposeHi : parcel.projectPurpose}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield size={11} /> {t.acquiringBody}: <span className="text-white/60">{isHi ? parcel.acquiringBodyHi : parcel.acquiringBody}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ─── Acquisition Status Stepper ─────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-8">
              <Scale size={20} className="text-amber-400" />
              {t.stepper}
            </h2>
            <AcquisitionStepper lang={lang} />
          </div>
        </FadeIn>

        {/* ─── Compensation + R&R Row ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compensation Card */}
          <FadeIn delay={0.15}>
            <div className="glass rounded-2xl h-full">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <IndianRupee size={20} className="text-amber-400" />
                  {t.compensation}
                </h2>
              </div>
              <div className="p-5 space-y-5">
                {/* Amounts */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400/60 font-bold uppercase mb-1">{t.totalSanctioned}</div>
                    <div className="text-lg font-black text-emerald-400">{formatINR(comp.totalSanctioned)}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="text-[10px] text-blue-400/60 font-bold uppercase mb-1">{t.amountPaid}</div>
                    <div className="text-lg font-black text-blue-400">{formatINR(comp.amountPaid)}</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-[10px] text-amber-400/60 font-bold uppercase mb-1">{t.amountPending}</div>
                    <div className="text-lg font-black text-amber-400">{formatINR(comp.amountPending)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between mb-2 text-xs">
                    <span className="text-white/40">{t.amountPaid}</span>
                    <span className="text-white font-bold">{paidPercent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${paidPercent}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-white/40">
                    <CreditCard size={13} className="text-white/20" />
                    {t.paymentMode}: <span className="text-white/70">{isHi ? comp.paymentModeHi : comp.paymentMode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <Calendar size={13} className="text-white/20" />
                    {t.expectedPayment}: <span className="text-white/70 font-mono">{comp.expectedPaymentDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    <Landmark size={13} className="text-white/20" />
                    {comp.bankName} (****{comp.bankAccountLast4})
                  </div>
                  <div className="flex items-center gap-2 text-white/40">
                    {t.bankLinked}: <StatusBadge value={comp.bankLinked ? 'Yes' : 'No'} lang={lang} />
                  </div>
                </div>

                {/* Payment history */}
                <div>
                  <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{t.paymentHistory}</div>
                  <div className="space-y-2">
                    {comp.payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            p.status === 'Paid' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                          }`}>
                            {p.status === 'Paid' ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Clock size={13} className="text-amber-400" />}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white/80">{isHi ? p.typeHi : p.type}</div>
                            <div className="text-[10px] text-white/30 font-mono">{p.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white/90 font-mono">{formatINR(p.amount)}</span>
                          <StatusBadge value={p.status} lang={lang} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* R&R Status Card */}
          <FadeIn delay={0.2}>
            <div className="glass rounded-2xl h-full">
              <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Home size={20} className="text-cyan-400" />
                  {t.rrTitle}
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Eligibility highlight */}
                <div className={`p-4 rounded-xl border ${
                  rrStatus.eligible
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rrStatus.eligible ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                      {rrStatus.eligible ? <BadgeCheck size={20} className="text-emerald-400" /> : <XCircle size={20} className="text-red-400" />}
                    </div>
                    <div>
                      <div className="text-xs text-white/40">{t.rrEligible}</div>
                      <div className={`text-lg font-black ${rrStatus.eligible ? 'text-emerald-400' : 'text-red-400'}`}>
                        {rrStatus.eligible ? t.yes : t.no}
                      </div>
                    </div>
                  </div>
                </div>

                {/* R&R Items */}
                <div className="space-y-3">
                  <RRItem icon={<Home size={16} />} label={t.houseAllotted} value={rrStatus.houseAllotted} lang={lang} color="cyan" />
                  <RRItem icon={<Briefcase size={16} />} label={t.employment} value={rrStatus.employmentAssistance} lang={lang} color="blue" />
                  <RRItem icon={<Truck size={16} />} label={t.relocation} value={rrStatus.relocationSupport} lang={lang} color="purple" />
                  <RRItem icon={<GraduationCap size={16} />} label={t.skillTraining} value={rrStatus.skillTraining} lang={lang} color="emerald" />
                </div>

                {/* Annuity */}
                {rrStatus.annuity === 'Yes' && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IndianRupee size={18} className="text-amber-400" />
                        <div>
                          <div className="text-xs text-white/40">{t.annuity}</div>
                          <div className="text-lg font-black text-amber-400">{formatINR(rrStatus.annuityAmount)}<span className="text-xs text-white/30 font-normal"> / year</span></div>
                        </div>
                      </div>
                      <StatusBadge value="Yes" lang={lang} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ─── My Documents ───────────────────────────────────────── */}
        <FadeIn delay={0.25}>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                {t.documents}
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      doc.available ? 'bg-purple-500/15' : 'bg-white/5'
                    }`}>
                      <FileText size={18} className={doc.available ? 'text-purple-400' : 'text-white/20'} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${doc.available ? 'text-white/90' : 'text-white/30'}`}>
                        {isHi ? doc.nameHi : doc.name}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/30">
                        {doc.dateIssued && (
                          <span>{t.dateIssued}: <span className="font-mono">{doc.dateIssued}</span></span>
                        )}
                        {doc.fileSize && <span>{doc.fileSize}</span>}
                      </div>
                    </div>
                  </div>

                  {doc.available ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                    >
                      <Download size={13} />
                      {t.download}
                    </motion.button>
                  ) : (
                    <span className="text-[10px] text-white/20 italic">{t.notAvailable}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ─── Grievance Section ───────────────────────────────────── */}
        <FadeIn delay={0.3}>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquarePlus size={20} className="text-red-400" />
                {t.grievance}
              </h2>
              <p className="text-xs text-white/40 mt-1">{t.grievanceDesc}</p>
            </div>

            <div className="p-5 space-y-5">
              {/* Past Complaints */}
              {grievances.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">{t.pastComplaints}</div>
                  {grievances.map((g) => (
                    <div key={g.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-xs text-white/30">{t.complaintId}: <span className="font-mono text-white/60">{g.id}</span></div>
                          <div className="text-sm font-bold text-white/90 mt-1">{isHi ? g.typeHi : g.type}</div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {isHi ? g.statusHi : g.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{isHi ? g.descriptionHi : g.description}</p>
                      <div className="flex flex-wrap gap-4 text-[10px] text-white/30">
                        <span>{t.submittedOn}: <span className="font-mono">{g.submittedOn}</span></span>
                        <span>{t.lastUpdate}: <span className="font-mono">{g.lastUpdate}</span></span>
                      </div>
                      {g.responseNote && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-400/70 leading-relaxed">
                          💬 {isHi ? g.responseNoteHi : g.responseNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Raise New Complaint */}
              <AnimatePresence>
                {!showGrievanceForm ? (
                  <motion.button
                    key="open-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowGrievanceForm(true)}
                    className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquarePlus size={18} />
                    {t.grievance}
                  </motion.button>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleSubmitGrievance}
                    className="space-y-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden"
                  >
                    {submitted ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-center py-6"
                      >
                        <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
                        <div className="text-lg font-bold text-emerald-400">
                          {lang === 'en' ? 'Complaint Submitted!' : 'शिकायत दर्ज हो गई!'}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {lang === 'en' ? 'You will be notified about updates.' : 'आपको अपडेट की सूचना दी जाएगी।'}
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <select
                          value={grievanceType}
                          onChange={e => setGrievanceType(e.target.value)}
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500/40 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0a0f1e]">{t.selectIssue}</option>
                          {grievanceTypes.map(gt => (
                            <option key={gt.value} value={gt.value} className="bg-[#0a0f1e]">
                              {isHi ? gt.labelHi : gt.label}
                            </option>
                          ))}
                        </select>

                        <textarea
                          value={grievanceDesc}
                          onChange={e => setGrievanceDesc(e.target.value)}
                          required
                          placeholder={t.describeIssue}
                          rows={3}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500/40 transition-all resize-none"
                        />

                        <div className="flex gap-3">
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center gap-2"
                          >
                            <Send size={14} />
                            {t.submitComplaint}
                          </motion.button>
                          <button
                            type="button"
                            onClick={() => setShowGrievanceForm(false)}
                            className="px-4 py-2.5 rounded-xl text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>

      </main>

      {/* Leaflet styles */}
      <style>{`
        .leaflet-container { background: #0a0f1e !important; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value, mono }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">{label}</div>
      <div className={`text-sm text-white/80 font-semibold ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}

function RRItem({ icon, label, value, lang, color }) {
  const colorMap = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-white/70 font-medium">{label}</span>
      </div>
      <StatusBadge value={value} lang={lang} />
    </div>
  );
}
