import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileDown, Stethoscope, Info } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useCycle } from '@/hooks/useCycle';

const RISK_COLORS = { low: '#4ADE80', moderate: '#FBBF24', high: '#EF4444' };

interface FactorData { name: string; score: number; maxScore: number; description: string; }

export function PCOD() {
  const { cycleData } = useCycle();
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'moderate' | 'high'>('low');
  const [factors, setFactors] = useState<FactorData[]>([]);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Calculate local risk score from available data
    let score = 0;
    const cycleVar = cycleData.cycles.length > 1
      ? Math.sqrt(cycleData.cycles.filter((c) => c.length).reduce((sum, c) => sum + Math.pow((c.length || 28) - cycleData.avgCycleLength, 2), 0) / Math.max(cycleData.cycles.filter((c) => c.length).length, 1))
      : 2;
    score += Math.min(cycleVar * 5, 25);

    const symptomCounts: Record<string, number> = {};
    cycleData.logs.forEach((l) => l.symptoms.forEach((s) => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; }));
    const acneFreq = (symptomCounts['acne'] || 0) / Math.max(cycleData.logs.length, 1);
    const hairLossFreq = (symptomCounts['hair_loss'] || 0) / Math.max(cycleData.logs.length, 1);
    score += acneFreq * 20 + hairLossFreq * 20;

    const totalSymptoms = Object.values(symptomCounts).reduce((a, b) => a + b, 0);
    const symptomScore = Math.min((totalSymptoms / Math.max(cycleData.logs.length, 1)) * 10, 20);
    score += symptomScore;

    const gapIrregularity = cycleData.avgCycleLength > 35 || cycleData.avgCycleLength < 21 ? 15 : 0;
    score += gapIrregularity;

    score = Math.min(Math.round(score), 100);
    // Use sample score if no data
    if (cycleData.logs.length === 0) score = 25;

    setRiskScore(score);
    setRiskLevel(score <= 30 ? 'low' : score <= 60 ? 'moderate' : 'high');

    setFactors([
      { name: 'Cycle Irregularity', score: Math.min(Math.round(cycleVar * 5), 25), maxScore: 25, description: 'Based on variation in your cycle lengths' },
      { name: 'Symptom Pattern', score: Math.round(symptomScore), maxScore: 20, description: 'Frequency and severity of reported symptoms' },
      { name: 'Acne Frequency', score: Math.round(acneFreq * 20), maxScore: 20, description: 'How often acne is reported across cycles' },
      { name: 'Hair Loss Pattern', score: Math.round(hairLossFreq * 20), maxScore: 20, description: 'Frequency of hair loss symptoms' },
      { name: 'Cycle Length', score: gapIrregularity, maxScore: 15, description: 'Whether cycle length falls outside normal range (21-35 days)' },
    ]);
  }, [cycleData]);

  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * riskScore));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [riskScore]);

  const trendData = [
    { month: 'Nov', score: 20 }, { month: 'Dec', score: 22 }, { month: 'Jan', score: 25 },
    { month: 'Feb', score: 23 }, { month: 'Mar', score: 24 }, { month: 'Apr', score: riskScore },
  ];

  const color = RISK_COLORS[riskLevel];
  const angle = (riskScore / 100) * 180;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">PCOD Risk</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-plum-700/50 text-lavender text-sm font-body hover:bg-plum-700/70 transition-colors min-tap" id="export-pcod">
          <FileDown size={16} /> Export PDF
        </button>
      </div>

      {/* Risk Gauge */}
      <GlassCard hover={false} padding="lg" className="flex flex-col items-center" glow={riskLevel === 'high' ? 'coral' : 'lavender'}>
        <div className="relative w-[200px] h-[110px] mb-4">
          <svg width="200" height="110" viewBox="0 0 200 110">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
            <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="rgba(179,157,219,0.1)" strokeWidth="12" strokeLinecap="round" />
            <motion.path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray="267" initial={{ strokeDashoffset: 267 }} animate={{ strokeDashoffset: 267 - (riskScore / 100) * 267 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            <motion.line x1="100" y1="100" x2="100" y2="25" stroke={color} strokeWidth="2.5" strokeLinecap="round"
              style={{ transformOrigin: '100px 100px' }} initial={{ rotate: -90 }} animate={{ rotate: angle - 90 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            <circle cx="100" cy="100" r="5" fill={color} />
          </svg>
        </div>
        <span className="text-5xl font-display font-bold" style={{ color }}>{animatedScore}</span>
        <span className="text-sm text-lavender/60 font-body">/100</span>
        <span className="text-sm font-semibold font-body px-4 py-1.5 rounded-full mt-3" style={{ background: `${color}15`, color }}>
          {riskLevel === 'low' ? 'Low Risk' : riskLevel === 'moderate' ? 'Moderate Risk' : 'High Risk'}
        </span>
      </GlassCard>

      {/* Factor Breakdown */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Risk Factor Breakdown</h3>
        <div className="space-y-4">
          {factors.map((f, i) => (
            <motion.div key={f.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-body text-lavender/80">{f.name}</span>
                <span className="text-xs font-body text-lavender/50">{f.score}/{f.maxScore}</span>
              </div>
              <div className="h-2 bg-plum-700/50 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(f.score / f.maxScore) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                  style={{ background: f.score / f.maxScore > 0.6 ? RISK_COLORS.high : f.score / f.maxScore > 0.3 ? RISK_COLORS.moderate : RISK_COLORS.low }} />
              </div>
              <p className="text-[10px] text-lavender/40 font-body mt-1">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* What This Means */}
      <GlassCard hover={false} padding="md">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-lavender flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-2">What This Means</h3>
            <p className="text-sm text-lavender/70 font-body leading-relaxed">
              {riskLevel === 'low' && "Your cycle patterns and symptoms suggest a low risk for PCOD. Keep tracking to maintain accurate predictions. Regular cycles and minimal hormonal symptoms are great indicators of reproductive health."}
              {riskLevel === 'moderate' && "Some of your patterns indicate moderate risk factors for PCOD. This doesn't mean you have PCOD, but it's worth discussing with your healthcare provider, especially if you notice increasing irregularity."}
              {riskLevel === 'high' && "Several risk factors in your data suggest elevated PCOD risk. We strongly recommend consulting a healthcare professional for proper evaluation. Early detection and management can make a significant difference."}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Doctor CTA */}
      {riskScore > 60 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard hover padding="md" glow="coral" className="border border-red-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <Stethoscope size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-display font-semibold text-white">Should I See a Doctor?</h3>
                <p className="text-xs text-lavender/60 font-body mt-1">Based on your risk score, we recommend consulting a gynecologist or endocrinologist for evaluation.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Trend */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Risk Score Trend (6 Months)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,157,219,0.1)" />
            <XAxis dataKey="month" tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={{ background: 'rgba(26,10,46,0.9)', border: '1px solid rgba(179,157,219,0.2)', borderRadius: '12px', color: '#B39DDB', fontSize: '12px' }} />
            <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ fill: color, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
        <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/70 font-body leading-relaxed">
          <strong>Disclaimer:</strong> This is not a medical diagnosis. FemTrack AI provides risk estimates based on self-reported data and statistical models. Please consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
        </p>
      </div>
    </div>
  );
}

export default PCOD;
