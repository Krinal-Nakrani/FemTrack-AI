import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';
import { getPhaseLabel, getPhaseEmoji, getPhaseColor, type CyclePhase } from '@/lib/utils';

interface CycleStatusCardProps {
  currentDay: number;
  phase: CyclePhase;
  daysUntilNext: number;
  confidenceWindow: number;
  avgCycleLength: number;
}

export function CycleStatusCard({
  currentDay,
  phase,
  daysUntilNext,
  confidenceWindow,
  avgCycleLength,
}: CycleStatusCardProps) {
  const progress = (currentDay / avgCycleLength) * 100;
  const phaseColor = getPhaseColor(phase);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <GlassCard glow="rose" hover={false} padding="lg" className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] opacity-15"
        style={{ background: phaseColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[80px] opacity-10"
        style={{ background: '#B39DDB' }}
      />

      <div className="relative z-10">
        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-6">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          >
            {getPhaseEmoji(phase)}
          </motion.span>
          <span
            className="text-sm font-semibold font-body px-3 py-1 rounded-full"
            style={{
              background: `${phaseColor}20`,
              color: phaseColor,
            }}
          >
            {getPhaseLabel(phase)}
          </span>
        </div>

        <div className="flex items-center gap-8">
          {/* Activity Ring */}
          <div className="relative w-[170px] h-[170px] flex-shrink-0">
            <svg width="170" height="170" viewBox="0 0 170 170" className="transform -rotate-90">
              {/* Track ring */}
              <circle
                cx="85" cy="85" r={radius}
                fill="none"
                stroke="rgba(179, 157, 219, 0.1)"
                strokeWidth="12"
              />
              {/* Progress ring */}
              <motion.circle
                cx="85" cy="85" r={radius}
                fill="none"
                stroke={`url(#cycleRingGrad)`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
              {/* Glow ring (behind) */}
              <motion.circle
                cx="85" cy="85" r={radius}
                fill="none"
                stroke={phaseColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                opacity={0.2}
                filter="url(#ringBlur)"
              />
              <defs>
                <linearGradient id="cycleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={phaseColor} />
                  <stop offset="100%" stopColor={`${phaseColor}88`} />
                </linearGradient>
                <filter id="ringBlur">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-4xl font-display font-bold text-white"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
              >
                {currentDay}
              </motion.span>
              <span className="text-xs text-lavender/60 font-body">
                of {avgCycleLength} days
              </span>
            </div>
          </div>

          {/* Right info */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-1">
                Next Period
              </p>
              <p className="text-white font-semibold font-body text-sm">
                {daysUntilNext > 0
                  ? `In ${daysUntilNext - confidenceWindow}–${daysUntilNext + confidenceWindow} days`
                  : 'Due any day now'}
              </p>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-lavender/10 via-lavender/20 to-lavender/10" />
            <div>
              <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-1">
                Confidence
              </p>
              <div className="flex items-center gap-2">
                <p className="text-lavender font-semibold font-body text-sm">
                  ±{confidenceWindow} days
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-3 rounded-full"
                      style={{
                        background: i <= (5 - confidenceWindow) ? phaseColor : 'rgba(179,157,219,0.15)',
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default CycleStatusCard;
