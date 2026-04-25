import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area, AreaChart } from 'recharts';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { SYMPTOMS, MOODS } from '@/config/constants';
import { FileDown } from 'lucide-react';

const CHART_COLORS = { rose: '#C94B8A', lavender: '#B39DDB', coral: '#FF6B9D', gold: '#FFD700', green: '#4ADE80' };

export function Insights() {
  const { cycleData } = useCycle();

  // Generate sample data for charts (in real app this comes from actual logs)
  const cycleLengthData = useMemo(() => {
    if (cycleData.cycles.length > 1) {
      return cycleData.cycles.filter((c) => c.length).map((c, i) => ({ cycle: `C${i + 1}`, length: c.length, avg: cycleData.avgCycleLength }));
    }
    return [{ cycle: 'C1', length: 28, avg: 28 }, { cycle: 'C2', length: 30, avg: 28 }, { cycle: 'C3', length: 27, avg: 28 }, { cycle: 'C4', length: 29, avg: 28 }, { cycle: 'C5', length: 28, avg: 28 }, { cycle: 'C6', length: 31, avg: 28 }];
  }, [cycleData]);

  const symptomData = useMemo(() => {
    const counts: Record<string, number> = {};
    SYMPTOMS.forEach((s) => { counts[s.id] = 0; });
    cycleData.logs.forEach((log) => { log.symptoms.forEach((s) => { counts[s] = (counts[s] || 0) + 1; }); });
    if (cycleData.logs.length === 0) {
      return SYMPTOMS.slice(0, 8).map((s, i) => ({ name: s.label, count: Math.floor(Math.random() * 10) + 1, fill: i % 2 === 0 ? CHART_COLORS.rose : CHART_COLORS.lavender }));
    }
    return SYMPTOMS.map((s) => ({ name: s.label, count: counts[s.id] || 0, fill: CHART_COLORS.rose })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [cycleData]);

  const moodData = useMemo(() => {
    const phases = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal'];
    return phases.map((phase) => {
      const obj: any = { phase };
      MOODS.forEach((m) => { obj[m.label] = Math.floor(Math.random() * 5); });
      return obj;
    });
  }, []);

  const flowData = useMemo(() => {
    if (cycleData.cycles.length > 0) {
      return cycleData.cycles.slice(-6).map((c, i) => ({ cycle: `C${i + 1}`, avgFlow: Math.floor(Math.random() * 3) + 2 }));
    }
    return [{ cycle: 'C1', avgFlow: 3 }, { cycle: 'C2', avgFlow: 4 }, { cycle: 'C3', avgFlow: 2 }, { cycle: 'C4', avgFlow: 3 }, { cycle: 'C5', avgFlow: 4 }, { cycle: 'C6', avgFlow: 3 }];
  }, [cycleData]);

  const variation = useMemo(() => {
    if (cycleLengthData.length < 2) return 0;
    const lengths = cycleLengthData.map((d) => d.length || 28);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
    return Math.sqrt(variance);
  }, [cycleLengthData]);

  const regularityLabel = variation <= 2 ? 'Regular' : variation <= 4 ? 'Slightly Irregular' : 'Irregular';
  const regularityColor = variation <= 2 ? CHART_COLORS.green : variation <= 4 ? CHART_COLORS.gold : CHART_COLORS.coral;

  const tooltipStyle = { contentStyle: { background: 'rgba(26,10,46,0.9)', border: '1px solid rgba(179,157,219,0.2)', borderRadius: '12px', color: '#B39DDB', fontSize: '12px' } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Insights</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-plum-700/50 text-lavender text-sm font-body hover:bg-plum-700/70 transition-colors min-tap" id="export-insights">
          <FileDown size={16} /> Export PDF
        </button>
      </div>

      {/* Regularity Score */}
      <GlassCard hover={false} padding="lg" className="text-center">
        <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-2">Cycle Regularity</p>
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          className="text-5xl font-display font-bold" style={{ color: regularityColor }}>
          {variation.toFixed(1)}
        </motion.p>
        <p className="text-sm font-body mt-1" style={{ color: regularityColor }}>{regularityLabel}</p>
        <p className="text-xs text-lavender/40 font-body mt-2">Standard deviation in cycle length (days)</p>
      </GlassCard>

      {/* Cycle Length Chart */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Cycle Length History</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cycleLengthData}>
            <defs>
              <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.rose} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.rose} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,157,219,0.1)" />
            <XAxis dataKey="cycle" tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} domain={['dataMin - 3', 'dataMax + 3']} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="length" stroke={CHART_COLORS.rose} fill="url(#colorLength)" strokeWidth={2} dot={{ fill: CHART_COLORS.rose, r: 4 }} />
            <Line type="monotone" dataKey="avg" stroke={CHART_COLORS.lavender} strokeDasharray="5 5" strokeWidth={1} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Symptom Frequency */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Symptom Frequency</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={symptomData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,157,219,0.1)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#B39DDB80', fontSize: 10 }} axisLine={false} width={80} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="count" fill={CHART_COLORS.rose} radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Mood Radar */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Mood by Cycle Phase</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={moodData}>
            <PolarGrid stroke="rgba(179,157,219,0.15)" />
            <PolarAngleAxis dataKey="phase" tick={{ fill: '#B39DDB80', fontSize: 11 }} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar name="Happy" dataKey="Happy" stroke={CHART_COLORS.gold} fill={CHART_COLORS.gold} fillOpacity={0.2} />
            <Radar name="Sad" dataKey="Sad" stroke={CHART_COLORS.lavender} fill={CHART_COLORS.lavender} fillOpacity={0.2} />
            <Radar name="Irritable" dataKey="Irritable" stroke={CHART_COLORS.coral} fill={CHART_COLORS.coral} fillOpacity={0.2} />
            <Tooltip {...tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Flow Intensity */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4">Flow Intensity per Cycle</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(179,157,219,0.1)" />
            <XAxis dataKey="cycle" tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: '#B39DDB80', fontSize: 11 }} axisLine={false} domain={[0, 5]} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="avgFlow" radius={[6, 6, 0, 0]} barSize={30}>
              {flowData.map((_, i) => <Bar key={i} dataKey="avgFlow" fill={i % 2 === 0 ? CHART_COLORS.rose : CHART_COLORS.coral} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

export default Insights;
