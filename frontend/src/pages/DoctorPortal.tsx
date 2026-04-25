import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Users, FileText, MessageCircle, TrendingUp, AlertTriangle, Search, ArrowLeft, Send, ChevronRight, Activity, Calendar, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';

interface Patient {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  pcodRisk: number;
  riskLevel: 'low' | 'moderate' | 'high';
  cycleRegularity: string;
  avgCycleLength: number;
  currentPhase: string;
  currentDay: number;
  recentSymptoms: string[];
  messages: { text: string; from: 'patient' | 'doctor'; time: string }[];
  cycleLengths: number[];
  riskHistory: number[];
}

const PATIENTS: Patient[] = [
  {
    id: '1', name: 'Patient A (Sarah J.)', age: 24, lastVisit: '2026-04-20',
    pcodRisk: 35, riskLevel: 'moderate', cycleRegularity: 'Slightly Irregular', avgCycleLength: 32,
    currentPhase: 'Luteal', currentDay: 22,
    recentSymptoms: ['acne', 'hair loss', 'fatigue', 'mood swings'],
    messages: [
      { text: "My cycles have been getting longer recently (35+ days). Should I be concerned?", from: 'patient', time: '2h ago' },
      { text: "Also experiencing more acne than usual on my chin and jawline.", from: 'patient', time: '2h ago' },
    ],
    cycleLengths: [28, 30, 32, 35, 33, 32],
    riskHistory: [18, 22, 25, 30, 33, 35],
  },
  {
    id: '2', name: 'Patient B (Priya P.)', age: 28, lastVisit: '2026-04-18',
    pcodRisk: 12, riskLevel: 'low', cycleRegularity: 'Regular', avgCycleLength: 28,
    currentPhase: 'Follicular', currentDay: 8,
    recentSymptoms: ['cramps'],
    messages: [
      { text: "Routine check — everything feels normal this cycle.", from: 'patient', time: '1d ago' },
    ],
    cycleLengths: [28, 27, 28, 29, 28, 28],
    riskHistory: [10, 12, 11, 13, 12, 12],
  },
  {
    id: '3', name: 'Patient C (Anita S.)', age: 22, lastVisit: '2026-04-22',
    pcodRisk: 72, riskLevel: 'high', cycleRegularity: 'Irregular', avgCycleLength: 42,
    currentPhase: 'Unknown', currentDay: 45,
    recentSymptoms: ['acne', 'hair loss', 'weight gain', 'fatigue', 'mood swings', 'insomnia'],
    messages: [
      { text: "Doctor, I haven't had my period in 45 days. My skin is breaking out badly and I've gained 4kg in the last 2 months. I'm really worried.", from: 'patient', time: '5h ago' },
      { text: "Also having trouble sleeping and feeling exhausted all day.", from: 'patient', time: '5h ago' },
    ],
    cycleLengths: [28, 35, 38, 42, 50, 45],
    riskHistory: [25, 35, 45, 55, 65, 72],
  },
];

const riskColors = { low: '#4ADE80', moderate: '#FBBF24', high: '#EF4444' };

export function DoctorPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sentReplies, setSentReplies] = useState<Record<string, string[]>>({});

  const filtered = PATIENTS.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const patient = selectedId ? PATIENTS.find((p) => p.id === selectedId) : null;

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedId) return;
    setSentReplies((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), replyText],
    }));
    setReplyText('');
  };

  return (
    <div className="min-h-screen bg-plum relative overflow-hidden">
      <div className="aurora-bg" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lavender/60 hover:text-white transition-colors"><ArrowLeft size={20} /></Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Stethoscope size={22} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Gynecologist Dashboard</h1>
                <p className="text-xs text-lavender/60 font-body">FemTrack AI · Doctor Portal</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-lavender/60 font-body"><Users size={16} />{PATIENTS.length} patients</span>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Patients', value: PATIENTS.length, icon: Users, color: '#B39DDB' },
            { label: 'High Risk', value: PATIENTS.filter((p) => p.riskLevel === 'high').length, icon: AlertTriangle, color: '#EF4444' },
            { label: 'Pending Msgs', value: PATIENTS.reduce((sum, p) => sum + p.messages.filter((m) => m.from === 'patient').length, 0), icon: MessageCircle, color: '#60A5FA' },
            { label: 'Avg Risk Score', value: Math.round(PATIENTS.reduce((s, p) => s + p.pcodRisk, 0) / PATIENTS.length), icon: Activity, color: '#FBBF24' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard hover={false} padding="md">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-lavender/50 font-body">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-lavender/40" />
              <input type="text" placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-blue-400/50 transition-all" />
            </div>

            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left glass-card p-4 transition-all hover:border-blue-400/20 ${selectedId === p.id ? 'border-blue-400/40 shadow-[0_0_15px_rgba(96,165,250,0.15)]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender/30 to-rose/30 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {p.name.split('(')[1]?.slice(0, 2) || p.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        {p.messages.filter((m) => m.from === 'patient').length > 0 && !(sentReplies[p.id]?.length) && (
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-lavender/50 font-body">Age {p.age} · {p.currentPhase} · Day {p.currentDay}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-body" style={{ color: riskColors[p.riskLevel] }}>{p.pcodRisk}</span>
                      <ChevronRight size={14} className="text-lavender/30" />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Patient Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {patient ? (
                <motion.div key={patient.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Summary */}
                  <GlassCard hover={false} padding="lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-display font-bold text-white">{patient.name}</h2>
                        <p className="text-sm text-lavender/60 font-body">Age {patient.age} · Last visit: {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 text-xs font-body hover:bg-blue-500/25 transition-colors">
                        <FileText size={12} /> Export PDF
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'PCOD Risk', value: patient.pcodRisk, color: riskColors[patient.riskLevel], suffix: '/100' },
                        { label: 'Cycle Length', value: patient.avgCycleLength, color: '#B39DDB', suffix: ' days' },
                        { label: 'Current Day', value: patient.currentDay, color: '#FF6B9D', suffix: '' },
                        { label: 'Symptoms', value: patient.recentSymptoms.length, color: '#FBBF24', suffix: ' active' },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-xl bg-plum-700/30 text-center">
                          <p className="text-xl font-display font-bold" style={{ color: stat.color }}>{stat.value}<span className="text-xs text-lavender/40">{stat.suffix}</span></p>
                          <p className="text-[10px] text-lavender/50 font-body">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* High Risk Alert */}
                  {patient.riskLevel === 'high' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-300 font-body">⚠️ Clinical Attention Required</p>
                          <p className="text-xs text-red-300/70 font-body mt-1 leading-relaxed">
                            Patient presents with classic PCOD indicators: <strong>irregular cycles ({patient.avgCycleLength}+ days)</strong>,
                            <strong> {patient.recentSymptoms.length} concurrent symptoms</strong> including hormonal markers (acne, hair loss, weight gain).
                            Risk score trending upward over 6 months.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-body hover:bg-red-500/30 transition-colors">
                              <Pill size={12} /> Order Hormonal Panel
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-body hover:bg-red-500/30 transition-colors">
                              <Calendar size={12} /> Schedule Ultrasound
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Two-column layout */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Symptoms */}
                    <GlassCard hover={false} padding="md">
                      <h3 className="text-sm font-display font-semibold text-white mb-3">Active Symptoms</h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.recentSymptoms.map((s) => (
                          <span key={s} className="text-xs font-body px-3 py-1.5 rounded-full bg-plum-700/50 text-lavender/80 border border-lavender/10">{s}</span>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Cycle Length Trend */}
                    <GlassCard hover={false} padding="md">
                      <h3 className="text-sm font-display font-semibold text-white mb-3">
                        <TrendingUp size={14} className="inline mr-1" /> Cycle Length Trend
                      </h3>
                      <div className="flex items-end gap-2 h-20">
                        {patient.cycleLengths.map((len, i) => (
                          <motion.div key={i} className="flex-1 rounded-t-lg relative group" style={{ background: len > 35 ? riskColors.high : len > 30 ? riskColors.moderate : riskColors.low, opacity: 0.5 + (i / 10) }}
                            initial={{ height: 0 }} animate={{ height: `${(len / 55) * 100}%` }} transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}>
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-lavender/60 font-body opacity-0 group-hover:opacity-100 transition-opacity">{len}d</span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {patient.cycleLengths.map((_, i) => (
                          <span key={i} className="text-[8px] text-lavender/30 font-body flex-1 text-center">C{i + 1}</span>
                        ))}
                      </div>
                    </GlassCard>
                  </div>

                  {/* Risk Score Trend */}
                  <GlassCard hover={false} padding="md">
                    <h3 className="text-sm font-display font-semibold text-white mb-3">PCOD Risk Score History</h3>
                    <div className="flex items-end gap-3 h-24">
                      {patient.riskHistory.map((score, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <motion.div className="w-full rounded-t-lg" style={{ background: `linear-gradient(to top, ${score > 60 ? riskColors.high : score > 30 ? riskColors.moderate : riskColors.low}, transparent)` }}
                            initial={{ height: 0 }} animate={{ height: `${(score / 100) * 100}%` }} transition={{ delay: 0.3 + i * 0.1 }} />
                          <span className="text-[9px] text-lavender/50 font-body">{score}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
                        <span key={m} className="text-[9px] text-lavender/40 font-body flex-1 text-center">{m}</span>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Messaging */}
                  <GlassCard hover={false} padding="md">
                    <h3 className="text-sm font-display font-semibold text-white mb-3">
                      <MessageCircle size={14} className="inline mr-1" /> Patient Communication
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                      {patient.messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-xl ${msg.from === 'patient' ? 'bg-plum-700/50 border border-lavender/10' : 'bg-blue-500/15 border border-blue-500/15'}`}>
                            <p className="text-sm text-lavender/90 font-body">{msg.text}</p>
                            <p className="text-[10px] text-lavender/40 font-body mt-1">{msg.from === 'patient' ? '👤 Patient' : '🩺 You'} · {msg.time}</p>
                          </div>
                        </div>
                      ))}
                      {sentReplies[patient.id]?.map((reply, i) => (
                        <div key={`reply-${i}`} className="flex justify-end">
                          <div className="max-w-[80%] p-3 rounded-xl bg-blue-500/15 border border-blue-500/15">
                            <p className="text-sm text-lavender/90 font-body">{reply}</p>
                            <p className="text-[10px] text-lavender/40 font-body mt-1">🩺 You · just now</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="Type your medical advice..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-blue-400/50 transition-all" />
                      <motion.button whileTap={{ scale: 0.9 }} onClick={handleSendReply}
                        className="px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Stethoscope size={48} className="text-lavender/20 mb-4" />
                  <p className="text-lg font-display text-lavender/40">Select a Patient</p>
                  <p className="text-sm text-lavender/30 font-body mt-1">Click on a patient to view their health dashboard</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorPortal;
