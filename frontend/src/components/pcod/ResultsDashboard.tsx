import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Copy, Check, FileDown, RotateCcw, Stethoscope, AlertTriangle, Brain, Activity, Scale } from 'lucide-react';
import type { PCODResult } from '@/utils/pcodAnalysis';
import { getScanHistory, saveScanResult } from '@/utils/pcodAnalysis';

const RISK_COLORS = { low: '#4ADE80', moderate: '#FBBF24', high: '#EF4444' };
const BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  none: { bg: 'rgba(74,222,128,0.1)', color: '#4ADE80' },
  mild: { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24' },
  moderate: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  severe: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  significant: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  normal: { bg: 'rgba(74,222,128,0.1)', color: '#4ADE80' },
  borderline: { bg: 'rgba(251,191,36,0.1)', color: '#FBBF24' },
  elevated: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
  low: { bg: 'rgba(74,222,128,0.1)', color: '#4ADE80' },
  high: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
};

function Badge({ value }: { value: string }) {
  const s = BADGE_STYLES[value] || BADGE_STYLES['normal'];
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-body font-bold uppercase" style={{ background: s.bg, color: s.color }}>{value}</span>;
}

function MiniBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 1, delay: 0.3 }} />
    </div>
  );
}

interface Props {
  result: PCODResult;
  onScanAgain: () => void;
}

export function ResultsDashboard({ result, onScanAgain }: Props) {
  const [animScore, setAnimScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const color = RISK_COLORS[result.pcod_risk_level] || '#FBBF24';
  const history = getScanHistory();

  // Animate score
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    let frame: number;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setAnimScore(Math.round((1 - Math.pow(1 - p, 3)) * result.pcod_risk_score));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [result.pcod_risk_score]);

  const copyNote = () => {
    navigator.clipboard.writeText(result.specialist_note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveResult = () => {
    saveScanResult(result);
    setSaved(true);
  };

  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (result.pcod_risk_score / 100) * circumference;

  return (
    <div className="space-y-5">
      {/* Disclaimer */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <p className="text-amber-300 text-[11px] font-body">⚠️ FemTrack AI is an AI-assisted screening tool. This is not a medical diagnosis. PCOD diagnosis requires clinical examination, blood tests, and ultrasound by a qualified gynecologist.</p>
      </div>

      {/* Section 1 — Risk Ring */}
      <motion.div className="glass-card p-6 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="relative w-48 h-48 mx-auto">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <motion.circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }} strokeDasharray={circumference} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{animScore}</span>
            <span className="text-[10px] text-lavender/40 font-body">PCOD Risk Score</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="text-sm font-bold uppercase px-3 py-1 rounded-full" style={{ background: `${color}20`, color }}>{result.pcod_risk_level} Risk</span>
          <span className="text-lavender/40 text-xs font-body">AI Confidence: {result.confidence}%</span>
        </div>
      </motion.div>

      {/* Section 2 — Three Signal Pillars */}
      <div className="grid grid-cols-1 gap-3">
        {/* Face Signals */}
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-3">🧴 Face Signals</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-body">
            <div><span className="text-lavender/40">Acne</span> <Badge value={result.face_signals.acne_severity} /></div>
            <div><span className="text-lavender/40">Facial Hair</span> <Badge value={result.face_signals.facial_hair} /></div>
            <div><span className="text-lavender/40">Pigmentation</span> <Badge value={result.face_signals.pigmentation} /></div>
            <div><span className="text-lavender/40">Oiliness</span> <Badge value={result.face_signals.skin_oiliness} /></div>
          </div>
          <p className="text-lavender/50 text-[10px] font-body mt-2 italic">{result.face_signals.acne_pattern}</p>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-body mb-1"><span className="text-lavender/40">Androgenic Score</span><span className="text-white">{result.face_signals.androgenic_face_score}/100</span></div>
            <MiniBar value={result.face_signals.androgenic_face_score} color="#C94B8A" />
          </div>
        </motion.div>

        {/* Symptom Signals */}
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-3">🩺 Symptom Signals</h4>
          {[
            { label: 'Menstrual Irregularity', val: result.symptom_signals.menstrual_irregularity_score, color: '#9F7AEA' },
            { label: 'Hyperandrogenism', val: result.symptom_signals.hyperandrogenism_score, color: '#F59E0B' },
            { label: 'Metabolic', val: result.symptom_signals.metabolic_score, color: '#60A5FA' },
          ].map((s) => (
            <div key={s.label} className="mb-2">
              <div className="flex justify-between text-[10px] font-body mb-0.5"><span className="text-lavender/40">{s.label}</span><span className="text-white">{s.val}</span></div>
              <MiniBar value={s.val} color={s.color} />
            </div>
          ))}
          <p className="text-[10px] font-body text-lavender/50 mt-1">Strongest: <span className="text-white">{result.symptom_signals.strongest_symptom}</span></p>
        </motion.div>

        {/* Metabolic Signals */}
        <motion.div className="glass-card p-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-3">⚖️ Metabolic Signals</h4>
          <div className="flex flex-wrap gap-2">
            <div className="text-[11px] font-body"><span className="text-lavender/40 mr-1">BMI Risk</span><Badge value={result.metabolic_signals.bmi_risk} /></div>
            <div className="text-[11px] font-body"><span className="text-lavender/40 mr-1">Cycle Variance</span><Badge value={result.metabolic_signals.cycle_variance_risk} /></div>
            <div className="text-[11px] font-body"><span className="text-lavender/40 mr-1">Insulin Resistance</span><Badge value={result.metabolic_signals.insulin_resistance_likelihood} /></div>
          </div>
        </motion.div>
      </div>

      {/* Section 3 — Key Risk Factors */}
      <motion.div className="p-4 rounded-2xl" style={{ background: `${color}08`, border: `1px solid ${color}20` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-2"><AlertTriangle size={14} style={{ color }} /> Why the AI flagged this</h4>
        {result.key_risk_factors.map((f, i) => (
          <p key={i} className="text-xs text-lavender/70 font-body mb-1 flex items-start gap-2"><span className="mt-0.5">•</span>{f}</p>
        ))}
      </motion.div>

      {/* Section 4 — AI Explanation */}
      <motion.div className="glass-card p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-2"><Brain size={14} className="text-purple-400" /> AI Explanation</h4>
        <p className="text-sm text-lavender/70 font-body leading-relaxed">{result.explanation}</p>
        <p className="text-sm text-white/80 font-body mt-2 leading-relaxed">{result.what_this_means}</p>
      </motion.div>

      {/* Section 5 — Specialist Note */}
      <motion.div className="p-4 rounded-2xl bg-amber-900/10 border border-amber-700/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <h4 className="text-xs font-body font-bold text-white flex items-center gap-2 mb-2">📋 Ready to share with your doctor</h4>
        <p className="text-xs text-lavender/70 font-body bg-plum-700/40 p-3 rounded-xl">{result.specialist_note}</p>
        <button onClick={copyNote} className="flex items-center gap-1.5 mt-2 text-xs font-body text-purple-400 hover:text-purple-300">
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy to Clipboard</>}
        </button>
      </motion.div>

      {/* Section 6 — Next Steps */}
      <div className="space-y-2">
        <h4 className="text-xs font-body font-bold text-white">Next Steps</h4>
        {result.next_steps.map((step, i) => (
          <motion.div key={i} className="glass-card p-3 flex items-start gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${color}20`, color }}>{i + 1}</div>
            <p className="text-xs text-lavender/70 font-body flex-1">{step}</p>
          </motion.div>
        ))}
      </div>

      {/* Section 7 — History */}
      {history.length >= 2 && (
        <div className="glass-card p-4">
          <h4 className="text-xs font-body font-bold text-white mb-3">📈 Risk Trend</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={history.map((h) => ({ date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), score: h.pcod_risk_score }))}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8884' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#8884' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={{ background: '#1a0a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Section 8 — Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={saveResult} disabled={saved} className="py-3 rounded-xl font-body text-sm font-medium transition-all flex items-center justify-center gap-2" style={{ background: saved ? 'rgba(74,222,128,0.1)' : 'rgba(139,92,246,0.2)', color: saved ? '#4ADE80' : '#A78BFA' }}>
          {saved ? <><Check size={14} /> Saved</> : <><Activity size={14} /> Save to Profile</>}
        </button>
        <button onClick={onScanAgain} className="py-3 rounded-xl bg-white/5 text-lavender/50 font-body text-sm font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Scan Again
        </button>
      </div>
    </div>
  );
}
