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
            stroke="rgba(179, 157, 219, 0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const a = (tick / 100) * Math.PI;
            const innerR = 52;
            const outerR = 58;
            const cx = 70 - innerR * Math.cos(a);
            const cy = 75 - innerR * Math.sin(a);
            const cx2 = 70 - outerR * Math.cos(a);
            const cy2 = 75 - outerR * Math.sin(a);
            return (
              <line
                key={tick}
                x1={cx} y1={cy} x2={cx2} y2={cy2}
                stroke="rgba(179,157,219,0.2)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
          {/* Gradient arc */}
          <defs>
            <linearGradient id="pcodGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* Glow behind */}
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
            filter="url(#gaugeGlow)"
            opacity={0.3}
          />
          {/* Colored arc */}
          <motion.path
            d="M 10 75 A 60 60 0 0 1 130 75"
            fill="none"
            stroke="url(#pcodGaugeGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="190"
            initial={{ strokeDashoffset: 190 }}
            animate={{ strokeDashoffset: 190 - (score / 100) * 190 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
          {/* Needle */}
          <motion.line
            x1="70" y1="75"
            x2="70" y2="25"
            stroke={config.color}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: '70px 75px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            transition={{ duration: 1.5, type: 'spring', stiffness: 60, damping: 12, delay: 0.5 }}
          />
          {/* Center dot with glow */}
          <circle cx="70" cy="75" r="5" fill={config.color} />
          <circle cx="70" cy="75" r="8" fill={config.color} opacity="0.2" />
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

      <motion.span
        className="text-xs font-semibold font-body px-3 py-1 rounded-full mt-2"
        style={{ background: config.bg, color: config.color }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
      >
        {config.label}
      </motion.span>
    </GlassCard>
  );
}

export default PCODMeter;
