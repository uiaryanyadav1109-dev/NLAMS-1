import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Building2,
  MapPin, ArrowRight, CheckCircle, Shield, Globe,
  ChevronRight, Loader2
} from 'lucide-react';

const roles = [
  { id: 'central', label: 'Central Ministry', emoji: '🏛️', color: '#003580', desc: 'Ministry of Land Resources' },
  { id: 'state', label: 'State Government', emoji: '🗳️', color: '#138808', desc: 'State Revenue Dept.' },
  { id: 'district', label: 'District Officer', emoji: '📋', color: '#FF9933', desc: 'District Collector / DM' },
  { id: 'landowner', label: 'Landowner / Farmer', emoji: '🌾', color: '#E07800', desc: 'Affected Citizen / Farmer' },
];


const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#FF9933' : p.id % 3 === 1 ? '#138808' : '#ffffff',
            opacity: 0.3,
          }}
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function InputField({ icon, label, type = 'text', placeholder, value, onChange, error, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF9933] transition-colors">
          {icon}
        </div>
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-${isPassword ? '12' : '4'} py-4 rounded-2xl text-sm text-[#1a1a2e] placeholder-gray-400 outline-none transition-all duration-200 bg-white
            ${error
              ? 'border-2 border-red-400 focus:border-red-500'
              : 'border border-gray-200 focus:border-[#FF9933] focus:shadow-sm'
            }`}
          style={!error ? { '--tw-shadow': '0 0 0 3px rgba(255,153,51,0.1)' } : {}}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF9933] transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </motion.p>
      )}
    </div>
  );
}


export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [selectedRole, setSelectedRole] = useState('district');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // For multi-step register

  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    role: 'district', state: '', empId: '',
  });

  const validate = (form, type) => {
    const errs = {};
    if (type === 'login') {
      if (!form.email) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 6) errs.password = 'Min. 6 characters';
    }
    if (type === 'register') {
      if (!form.name) errs.name = 'Full name is required';
      if (!form.email) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.phone) errs.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit number';
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Min. 8 characters';
      if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
      if (!form.state) errs.state = 'Select your state';
    }
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate(loginForm, 'login');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
    navigate(
      selectedRole === 'landowner' ? '/farmer-dashboard' :
      selectedRole === 'state' ? '/state-dashboard' :
      selectedRole === 'district' ? '/district-dashboard' :
      '/dashboard'
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validate({ ...regForm, role: selectedRole }, 'register');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
    navigate(
      selectedRole === 'landowner' ? '/farmer-dashboard' :
      selectedRole === 'state' ? '/state-dashboard' :
      selectedRole === 'district' ? '/district-dashboard' :
      '/dashboard'
    );
  };

  const roleInfo = roles.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#FFF8F0' }}>
      <FloatingParticles />
      <div className="absolute inset-0 grid-pattern-light opacity-40" />


      {/* ── Left Panel (visual) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-farm.png')" }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(5,11,20,0.85) 0%, rgba(5,30,15,0.75) 50%, rgba(5,11,20,0.9) 100%)'
        }} />

        {/* Decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="w-[500px] h-[500px] rounded-full border border-emerald-500/10 absolute -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-[350px] h-[350px] rounded-full border border-amber-500/10 absolute -translate-x-1/2 -translate-y-1/2"
          />
          <div className="w-[200px] h-[200px] rounded-full border border-white/5 absolute -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #FF9933, #FFFFFF, #138808)' }}>
              🇮🇳
            </div>
            <div>
              <div className="text-white font-black text-xl">NLAMS</div>
              <div className="text-emerald-400 text-[10px] tracking-widest uppercase font-semibold">Govt. of India</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-3">
              आपकी ज़मीन
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                आपका मकान
              </span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Secure access to India's National Land Acquisition & Management System. 
              Transparent, accountable, and citizen-first.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {[
              { icon: <Shield size={15} />, text: 'Enterprise-grade security & encryption' },
              { icon: <Globe size={15} />, text: 'Available across all 28 states & 8 UTs' },
              { icon: <CheckCircle size={15} />, text: 'Role-based access for every stakeholder' },
              { icon: <MapPin size={15} />, text: 'GIS-enabled real-time parcel tracking' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/70 text-sm"
              >
                <span className="text-emerald-400">{item.icon}</span>
                {item.text}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          © 2024 Government of India · Ministry of Rural Development
          <br />
          All rights reserved · NIC Certified Platform
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-xl">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
              style={{ background: 'linear-gradient(135deg, #FF9933, #FFFFFF, #138808)' }}>
              🇮🇳
            </div>
            <div>
              <div className="text-[#003580] font-black text-xl">NLAMS</div>
              <div className="text-[#138808] text-[10px] tracking-widest uppercase font-bold">Govt. of India</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl p-1.5 flex gap-1 mb-8 shadow-sm border border-orange-100">
            {[
              { id: 'login', label: 'Sign In' },
              { id: 'register', label: 'Register' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setErrors({}); setSuccess(false); setStep(1); }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  tab === t.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-500 hover:text-[#FF9933]'
                }`}
                style={tab === t.id ? { background: 'linear-gradient(135deg, #FF9933, #E07800)' } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>


          {/* SUCCESS STATE */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <div className="glass-dark rounded-3xl p-10 text-center max-w-sm mx-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle size={40} className="text-emerald-400" />
                  </motion.div>
                  <h3 className="text-white font-black text-2xl mb-2">
                    {tab === 'login' ? 'Welcome Back!' : 'Account Created!'}
                  </h3>
                  <p className="text-white/60 text-sm">Redirecting to your dashboard...</p>
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── LOGIN FORM ── */}
          <AnimatePresence mode="wait">
            {tab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Welcome back 👋</h1>
                  <p className="text-gray-500 text-sm">Sign in to access the NLAMS portal.</p>
                </div>

                {/* Role selector for login */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole(role.id)}
                      className={`relative flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 overflow-hidden ${
                        selectedRole === role.id
                          ? ''
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      style={selectedRole === role.id ? {
                        borderColor: role.color,
                        background: `${role.color}10`,
                        boxShadow: `0 0 16px ${role.color}20`,
                      } : {}}
                    >
                      <span className="text-2xl flex-shrink-0">{role.emoji}</span>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${selectedRole === role.id ? 'text-[#1a1a2e]' : 'text-gray-600'}`}>
                          {role.label}
                        </div>
                        <div className="text-gray-400 text-[10px] truncate">{role.desc}</div>
                      </div>
                      {selectedRole === role.id && (
                        <motion.div
                          layoutId="selectedRole"
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{ border: `2px solid ${role.color}60` }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField
                    icon={<Mail size={16} />}
                    label="Official Email"
                    type="email"
                    placeholder="officer@gov.in"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    error={errors.email}
                  />
                  <InputField
                    icon={<Lock size={16} />}
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    error={errors.password}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginForm.remember}
                        onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF9933] focus:ring-[#FF9933]"
                      />
                      <span className="text-gray-500 text-sm">Remember me</span>
                    </label>
                    <button type="button" className="text-[#FF9933] text-sm hover:text-[#E07800] transition-colors font-medium">
                      Forgot password?
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="btn-glow w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{
                      background: loading
                        ? 'rgba(255,153,51,0.5)'
                        : 'linear-gradient(135deg, #FF9933, #E07800)',
                      boxShadow: '0 8px 24px rgba(255,153,51,0.35)',
                    }}
                  >
                    {loading ? (
                      <><Loader2 size={20} className="animate-spin" /> Authenticating...</>
                    ) : (
                      <>Sign In Securely <ArrowRight size={20} /></>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs">or continue with</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* DigiLocker */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold text-[#003580] bg-white border border-[#003580]/20 hover:border-[#003580]/40 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <span className="text-xl">🔐</span>
                  Sign in with DigiLocker / Aadhaar
                </motion.button>

                <p className="text-center text-gray-500 text-xs mt-6">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setTab('register')}
                    className="text-[#FF9933] hover:text-[#E07800] font-semibold transition-colors"
                  >
                    Register here
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="text-3xl font-black text-white mb-2">Create Account ✨</h1>
                  <p className="text-white/50 text-sm">Join NLAMS — the national platform for transparent land governance.</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2].map((s) => (
                    <React.Fragment key={s}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          step >= s
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {step > s ? <CheckCircle size={14} /> : s}
                      </div>
                      {s < 2 && (
                        <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-amber-500' : 'bg-white/10'}`} />
                      )}
                    </React.Fragment>
                  ))}
                  <span className="ml-2 text-white/40 text-xs">
                    Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Role & Access'}
                  </span>
                </div>

                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleRegister}
                  className="space-y-4">

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        <InputField
                          icon={<User size={16} />}
                          label="Full Name"
                          placeholder="Rajesh Kumar"
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          error={errors.name}
                        />
                        <InputField
                          icon={<Mail size={16} />}
                          label="Official Email"
                          type="email"
                          placeholder="officer@gov.in"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          error={errors.email}
                        />
                        <InputField
                          icon={<Phone size={16} />}
                          label="Mobile Number"
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          error={errors.phone}
                        />
                        <InputField
                          icon={<Lock size={16} />}
                          label="Create Password"
                          type="password"
                          placeholder="Min. 8 characters"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          error={errors.password}
                        />
                        <InputField
                          icon={<Lock size={16} />}
                          label="Confirm Password"
                          type="password"
                          placeholder="Repeat password"
                          value={regForm.confirm}
                          onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })}
                          error={errors.confirm}
                        />

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn-glow w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                          }}
                        >
                          Continue to Role Setup
                          <ChevronRight size={20} />
                        </motion.button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Role selector */}
                        <div>
                          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                            Select Your Role
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {roles.map((role) => (
                              <motion.button
                                key={role.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole(role.id)}
                                className="relative flex items-center gap-2 p-3 rounded-2xl border text-left transition-all duration-200"
                                style={selectedRole === role.id ? {
                                  borderColor: role.color,
                                  background: `${role.color}15`,
                                  boxShadow: `0 0 15px ${role.color}20`,
                                } : { borderColor: 'rgba(255,255,255,0.1)' }}
                              >
                                <span className="text-xl">{role.emoji}</span>
                                <div>
                                  <div className={`text-xs font-bold ${selectedRole === role.id ? 'text-white' : 'text-white/60'}`}>
                                    {role.label}
                                  </div>
                                  <div className="text-white/30 text-[9px]">{role.desc}</div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">State / UT</label>
                          <div className="relative">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                            <select
                              value={regForm.state}
                              onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm text-white outline-none transition-all appearance-none cursor-pointer
                                ${errors.state
                                  ? 'border-2 border-red-500/60 bg-red-500/5'
                                  : 'border border-white/10 bg-white/5 focus:border-emerald-500/60 focus:bg-emerald-500/5'
                                }`}
                            >
                              <option value="" className="bg-gray-900">Select State / UT</option>
                              {states.map((s) => (
                                <option key={s} value={s} className="bg-gray-900">{s}</option>
                              ))}
                            </select>
                          </div>
                          {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                        </div>

                        {/* Employee ID (optional for some roles) */}
                        {selectedRole !== 'landowner' && (
                          <InputField
                            icon={<Building2 size={16} />}
                            label="Employee / Officer ID (Optional)"
                            placeholder="e.g., IAS-MP-2024-0042"
                            value={regForm.empId}
                            onChange={(e) => setRegForm({ ...regForm, empId: e.target.value })}
                          />
                        )}

                        <div className="flex gap-3">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 rounded-2xl text-sm font-semibold text-white/60 border border-white/10 hover:border-white/30 hover:text-white transition-all"
                          >
                            Back
                          </motion.button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="btn-glow flex-[2] flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold text-white disabled:opacity-70"
                            style={{
                              background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                              boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                            }}
                          >
                            {loading ? (
                              <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
                            ) : (
                              <>Create Account <ArrowRight size={18} /></>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <p className="text-center text-white/40 text-xs mt-6">
                  Already have an account?{' '}
                  <button
                    onClick={() => setTab('login')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                  >
                    Sign in
                  </button>
                </p>

                <p className="text-center text-white/25 text-[10px] mt-4 leading-relaxed">
                  By registering, you agree to the Government of India's Terms of Service.
                  <br />
                  Your data is protected under the Digital Personal Data Protection Act, 2023.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
