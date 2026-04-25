import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';

interface PCODMeterProps {
  score: number; // 0-100
  riskLevel: 'low' | 'moderate' | 'high';
}

export function PCODMeter({ score, riskLevel }: PCODMeterProps) {
  const angle = (score / 100) * 180;
  const riskConfig = {
    low: { color: '#4ADE80', label: 'Low Risk', bg: 'rgba(74, 222, 128, 0.1)' },
    moderate: { color: '#FBBF24', label: 'Moderate', bg: 'rgba(251, 191, 36, 0.1)' },
    high: { color: '#EF4444', label: 'High Risk', bg: 'rgba(239, 68, 68, 0.1)' },
  };

  const config = riskConfig[riskLevel];

  return (
    <GlassCard
      glow={riskLevel === 'high' ? 'coral' : 'lavender'}
      padding="md"
      className="flex flex-col items-center"
    >
      <p className="text-xs text-lavender/60 font-body uppercase tracking-wider mb-3">
        PCOD Risk
      </p>

      <div className="relative w-[140px] h-[80px] mb-2">
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* Background arc */}
          <path
            d="M 10 75 A 60 60 0 0 1 130 75"
            fill="none"
            stroke="rgba(179, 157, 219, 0.15)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <motion.path
            d="M 10 75 A 60 60 0 0 1 130 75"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="190"
            initial={{ strokeDashoffset: 190 }}
            animate={{ strokeDashoffset: 190 - (score / 100) * 190 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
          {/* Needle */}
          <motion.line
            x1="70"
            y1="75"
            x2="70"
            y2="25"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: '70px 75px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
          {/* Center dot */}
          <circle cx="70" cy="75" r="4" fill={config.color} />
        </svg>
      </div>

      {/* Score */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span
          className="text-3xl font-display font-bold"
          style={{ color: config.color }}
        >
          {score}
        </span>
        <span className="text-sm text-lavender/60 font-body">/100</span>
      </motion.div>

      <span
        className="text-xs font-semibold font-body px-3 py-1 rounded-full mt-2"
        style={{ background: config.bg, color: config.color }}
      >
        {config.label}
      </span>
    </GlassCard>
  );
}

export default PCODMeter;
