import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FilePlus, ArrowLeft, Send, CheckCircle2, Shield, Landmark,
  MapPin, Users, IndianRupee, FileText, Upload, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import { districtProfile, rejectedProposals } from '../data/districtData';

export default function NewProposalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resubmitId = searchParams.get('resubmit');

  const [formData, setFormData] = useState({
    projectName: '',
    purpose: 'National Highway Expansion',
    tehsil: 'Haveli',
    area: '',
    families: '',
    estimatedCompensation: '',
    acquiringDepartment: 'National Highways Authority of India (NHAI)',
    description: '',
    gramSabhaPassed: true,
    siaCompleted: true,
    documentsAttached: 4,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // If resubmitting a rejected proposal, prefill the data!
  useEffect(() => {
    if (resubmitId) {
      const found = rejectedProposals.find(p => p.id === resubmitId);
      if (found) {
        setFormData(prev => ({
          ...prev,
          projectName: found.name,
          purpose: found.purpose,
          area: found.area.toString(),
          families: found.families.toString(),
          estimatedCompensation: found.compensationEst.toString(),
          description: `Resubmission addressing remarks: ${found.rejectionReason}`,
        }));
      }
    }
  }, [resubmitId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        navigate('/district-dashboard');
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0D1F0A] text-white relative overflow-hidden">
      {/* Background ambient tricolor glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tiranga accent — top */}
      <div className="h-1.5 tiranga-bar" />

      {/* ── Top Bar ── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(13,31,10,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/district-dashboard')}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <FilePlus size={18} className="text-amber-400" />
              <h1 className="font-bold text-white text-base">
                {resubmitId ? 'Resubmit Proposal' : 'Submit New Land Acquisition Proposal'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>District: <strong className="text-amber-400">{districtProfile.district}</strong></span>
            <span>·</span>
            <span>Collector: <strong className="text-white/80">{districtProfile.officer.name}</strong></span>
          </div>
        </div>
      </motion.header>

      {/* ── Main Form Container ── */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence>
          {submittedSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-3xl p-12 text-center border border-emerald-500/30 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Proposal Submitted Successfully!</h2>
              <p className="text-white/60 text-sm mb-4">
                Assigned ID: <span className="font-mono text-amber-400 font-bold">PROP-PUN-2026-007</span>
              </p>
              <p className="text-xs text-white/40">
                Your proposal has been transmitted to the State Government Revenue Department for initial review & clearance.
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="glass rounded-3xl p-8 space-y-8 border border-white/10"
            >
              {/* Resubmit Notice */}
              {resubmitId && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-amber-400">Resubmitting Proposal: {resubmitId}</div>
                    <div className="text-xs text-white/60 mt-1">
                      Data prefilled from previous submission. Please ensure all requested attachments (e.g. SIA & Gram Sabha resolutions) are uploaded.
                    </div>
                  </div>
                </div>
              )}

              {/* Section 1: Basic Project Info */}
              <div>
                <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Landmark size={18} />
                  1. Project Identification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Project Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pune–Satara Expressway Extension Phase II"
                      value={formData.projectName}
                      onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Public Purpose *</label>
                    <select
                      value={formData.purpose}
                      onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                    >
                      <option value="National Highway Expansion" className="bg-[#0a0f1e]">National Highway Expansion</option>
                      <option value="Industrial Infrastructure" className="bg-[#0a0f1e]">Industrial Infrastructure & SEZ</option>
                      <option value="Metro Rail Infrastructure" className="bg-[#0a0f1e]">Metro Rail Infrastructure</option>
                      <option value="Irrigation & Water Project" className="bg-[#0a0f1e]">Irrigation & Water Storage</option>
                      <option value="Urban Development / Ring Road" className="bg-[#0a0f1e]">Urban Development / Ring Road</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Tehsil / Sub-Division *</label>
                    <select
                      value={formData.tehsil}
                      onChange={e => setFormData({ ...formData, tehsil: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                    >
                      <option value="Haveli" className="bg-[#0a0f1e]">Haveli Tehsil</option>
                      <option value="Mulshi" className="bg-[#0a0f1e]">Mulshi Tehsil</option>
                      <option value="Hinjawadi" className="bg-[#0a0f1e]">Hinjawadi Sub-Division</option>
                      <option value="Khed" className="bg-[#0a0f1e]">Khed Tehsil</option>
                      <option value="Baramati" className="bg-[#0a0f1e]">Baramati Tehsil</option>
                      <option value="Mawal" className="bg-[#0a0f1e]">Mawal Tehsil</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Acquisition Extent & Financial Estimates */}
              <div className="pt-6 border-t border-white/5">
                <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={18} />
                  2. Land Extent & Impact Metrics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Total Land Area (Acres) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 680"
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Estimated Affected Families *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 210"
                      value={formData.families}
                      onChange={e => setFormData({ ...formData, families: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Est. Compensation (₹ Crore) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 142.5"
                      value={formData.estimatedCompensation}
                      onChange={e => setFormData({ ...formData, estimatedCompensation: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono text-amber-400 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Statutory Clearances & Attachments */}
              <div className="pt-6 border-t border-white/5">
                <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield size={18} />
                  3. Statutory Clearances & Verification
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.gramSabhaPassed}
                      onChange={e => setFormData({ ...formData, gramSabhaPassed: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">Gram Sabha Resolution Passed</div>
                      <div className="text-xs text-white/40">Section 4(1) public consent obtained</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.siaCompleted}
                      onChange={e => setFormData({ ...formData, siaCompleted: e.target.checked })}
                      className="w-5 h-5 rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">SIA Report Completed</div>
                      <div className="text-xs text-white/40">Social Impact Assessment verified</div>
                    </div>
                  </label>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-dashed border-white/20 text-center">
                  <Upload size={32} className="mx-auto text-amber-400 mb-2" />
                  <div className="text-sm font-bold text-white">Upload Supporting Documents</div>
                  <div className="text-xs text-white/40 mt-1">Attach Geo-Spatial Maps, Land Parcel Index, SIA Copy & Gram Sabha minutes (PDF up to 25MB)</div>
                  <button type="button" className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-all">
                    Browse Files (4 files selected)
                  </button>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-6 border-t border-white/5 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/district-dashboard')}
                  className="flex-1 py-4 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Transmitting Proposal to State Govt...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Transmit Proposal to State Government
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
