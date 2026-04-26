import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Stethoscope, Printer, Download, AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { PINEntry } from '@/components/passport/PINEntry';
import { CycleHeatmap } from '@/components/passport/CycleHeatmap';
import { hashPIN, aggregatePassportData } from '@/utils/passportHelpers';
import { generateClinicalSummary } from '@/utils/geminiApi';
import type { PassportData } from '@/utils/passportHelpers';

export function PassportPublic() {
  const { passportId } = useParams<{ passportId: string }>();
  const [state, setState] = useState<'loading' | 'pin' | 'paused' | 'dashboard'>('loading');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [data, setData] = useState<PassportData | null>(null);
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    // Find which user owns this passport by scanning localStorage
    // In production this would be a Firestore lookup
    const allKeys = Object.keys(localStorage);
    const passportKey = allKeys.find((k) => k.startsWith('femtrack_passport_') && localStorage.getItem(k) === passportId);

    if (!passportKey) {
      // Demo mode — show PIN gate with demo data
      setState('pin');
      return;
    }

    const uid = passportKey.replace('femtrack_passport_', '');
    const status = localStorage.getItem(`femtrack_passport_status_${uid}`) || 'active';
    if (status === 'paused') {
      setState('paused');
      return;
    }
    setState('pin');
  }, [passportId]);

  const handlePinSubmit = async (entered: string) => {
    setPinLoading(true);
    setPinError('');

    // Find user and verify PIN
    const allKeys = Object.keys(localStorage);
    const passportKey = allKeys.find((k) => k.startsWith('femtrack_passport_') && localStorage.getItem(k) === passportId);
    const uid = passportKey ? passportKey.replace('femtrack_passport_', '') : '';
    const storedHash = uid ? localStorage.getItem(`femtrack_pin_${uid}`) : null;

    const enteredHash = await hashPIN(entered);

    // Demo mode: accept "1234" if no PIN stored
    if (!storedHash && entered === '1234') {
      loadDemoData();
      return;
    }

    if (storedHash && enteredHash === storedHash) {
      loadDemoData();
      return;
    }

    setPinError('Incorrect PIN. Please ask your patient for the correct PIN.');
    setPinLoading(false);
  };

  const loadDemoData = () => {
    // Build passport data (in production, pull from Firestore)
    const demoData: PassportData = {
      name: 'Patient',
      passportId: passportId || 'FT-DEMO-000000',
      memberSince: 'Jan 2024',
      avgCycleLength: 30,
      cycleVariance: 4,
      cyclesTracked: 8,
      pcodRiskScore: 42,
      pcodRiskLevel: 'moderate',
      pcodTrend: 'improving',
      topSymptoms: ['cramps', 'fatigue', 'bloating', 'headache', 'acne'],
      currentPhase: 'follicular',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      cycleLengths: [28, 31, 29, 32, 30, 28],
      periodDates: generateDemoPeriodDates(),
      riskHistory: [58, 52, 48, 45, 42],
    };
    setData(demoData);
    setState('dashboard');
    setPinLoading(false);

    // Generate clinical summary
    setSummaryLoading(true);
    generateClinicalSummary({
      avgCycleLength: demoData.avgCycleLength,
      cycleVariance: demoData.cycleVariance,
      pcodRiskScore: demoData.pcodRiskScore,
      pcodTrend: demoData.pcodTrend,
      topSymptoms: demoData.topSymptoms,
      cyclesTracked: demoData.cyclesTracked,
    }).then((summary) => {
      setClinicalSummary(summary);
      setSummaryLoading(false);
    });
  };

  const generateDemoPeriodDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    for (let cycle = 0; cycle < 6; cycle++) {
      const start = new Date(today);
      start.setDate(start.getDate() - cycle * 30);
      for (let d = 0; d < 5; d++) {
        const pd = new Date(start);
        pd.setDate(pd.getDate() - d);
        dates.push(pd.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const TrendIcon = data?.pcodTrend === 'improving' ? TrendingDown : data?.pcodTrend === 'worsening' ? TrendingUp : Minus;

  // ─── LOADING ───
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-plum flex items-center justify-center">
        <div className="aurora-bg" />
        <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── PAUSED ───
  if (state === 'paused') {
    return (
      <div className="min-h-screen bg-plum flex items-center justify-center p-6">
        <div className="aurora-bg" />
        <motion.div className="glass-card p-8 max-w-md text-center relative z-10" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-red-400" />
          </div>
          <h1 className="text-xl font-display font-bold text-white mb-2">Passport Paused</h1>
          <p className="text-lavender/60 font-body text-sm">This passport is currently paused by its owner. Please ask your patient to reactivate it.</p>
        </motion.div>
      </div>
    );
  }

  // ─── PIN GATE ───
  if (state === 'pin') {
    return (
      <div className="min-h-screen bg-plum flex items-center justify-center p-6">
        <div className="aurora-bg" />
        <motion.div className="glass-card p-8 max-w-md w-full text-center relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-purple-600/15 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-display font-bold text-white mb-1">FemTrack AI — Cycle Passport</h1>
          <p className="text-lavender/60 font-body text-sm mb-6">Enter the 4-digit PIN to view full health details.</p>
          <PINEntry onSubmit={handlePinSubmit} error={pinError} loading={pinLoading} />
          <p className="text-lavender/30 text-[10px] font-body mt-6">Passport ID: {passportId}</p>
          <p className="text-lavender/20 text-[9px] font-body mt-1">Demo PIN: 1234</p>
        </motion.div>
      </div>
    );
  }

  // ─── DOCTOR DASHBOARD ───
  if (!data) return null;
  const riskColors = { low: '#4ADE80', moderate: '#FBBF24', high: '#EF4444' };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-gray-800">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌸</span>
          <div>
            <h1 className="text-sm font-bold text-gray-800">FemTrack AI — Clinical Passport View</h1>
            <p className="text-xs text-gray-400">ID: {passportId} • Last updated: {data.lastUpdated}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
            <Printer size={14} />
            Print
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Section 1 — Patient Summary */}
        <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{data.name}</h2>
              <p className="text-sm text-gray-400">Passport ID: {data.passportId} • Member since: {data.memberSince}</p>
            </div>
          </div>
        </motion.div>

        {/* Section 2 — Cycle Analysis */}
        <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            📊 Cycle Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Avg Cycle Length', value: `${data.avgCycleLength} days` },
              { label: 'Variance', value: `±${data.cycleVariance} days` },
              { label: 'Cycles Tracked', value: String(data.cyclesTracked) },
              { label: 'Regularity', value: data.cycleVariance <= 3 ? 'Regular' : data.cycleVariance <= 5 ? 'Mildly Irregular' : 'Irregular' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-purple-50">
                <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
          {/* Mini cycle length chart */}
          <div className="flex items-end gap-1 h-16">
            {data.cycleLengths.map((len, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md bg-purple-200" style={{ height: `${((len - 20) / 20) * 100}%`, minHeight: 8 }} />
                <span className="text-[8px] text-gray-400">{len}d</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 3 — PCOD Risk */}
        <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">⚠️ PCOD Risk Report</h3>
          <div className="flex items-center gap-6">
            {/* Risk ring */}
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={riskColors[data.pcodRiskLevel]} strokeWidth="10"
                  strokeDasharray={`${(data.pcodRiskScore / 100) * 327} 327`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{data.pcodRiskScore}</span>
                <span className="text-[10px] text-gray-400">/100</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold uppercase" style={{ color: riskColors[data.pcodRiskLevel] }}>{data.pcodRiskLevel}</span>
                <div className="flex items-center gap-1 text-xs" style={{ color: data.pcodTrend === 'improving' ? '#4ADE80' : data.pcodTrend === 'worsening' ? '#EF4444' : '#9CA3AF' }}>
                  <TrendIcon size={14} />
                  {data.pcodTrend}
                </div>
              </div>
              {/* Risk trend mini chart */}
              <div className="flex items-end gap-1 h-10">
                {data.riskHistory.map((score, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{
                    height: `${score}%`,
                    background: score > 60 ? '#EF4444' : score > 30 ? '#FBBF24' : '#4ADE80',
                    opacity: 0.3 + (i / data.riskHistory.length) * 0.7,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 4 — Symptoms */}
        <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">🩺 Symptom Pattern Report</h3>
          <div className="flex flex-wrap gap-2">
            {data.topSymptoms.map((s, i) => (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50">
                <div className="w-2 h-2 rounded-full" style={{ background: ['#C94B8A', '#9F7AEA', '#F59E0B', '#4ADE80', '#60A5FA'][i] }} />
                <span className="text-sm text-gray-700 capitalize">{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section 5 — AI Clinical Summary */}
        <motion.div className="bg-amber-50 rounded-2xl p-6 border border-amber-200" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Stethoscope size={16} className="text-amber-600" />
            AI Pre-Consultation Summary
          </h3>
          {summaryLoading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              Generating clinical summary...
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{clinicalSummary}</p>
          )}
          <p className="text-[10px] text-amber-600/60 mt-3 italic">
            AI-generated screening summary. Not a clinical diagnosis.
          </p>
        </motion.div>

        {/* Section 6 — 6-Month Heatmap */}
        <motion.div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">📅 6-Month Cycle Heatmap</h3>
          <CycleHeatmap periodDates={data.periodDates} />
        </motion.div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-lg">🌸</span>
            <span className="text-sm font-bold text-gray-400">FemTrack AI</span>
          </div>
          <p className="text-xs text-gray-300">Smart Period Tracking & PCOD Risk Prediction</p>
        </div>
      </div>
    </div>
  );
}

export default PassportPublic;
