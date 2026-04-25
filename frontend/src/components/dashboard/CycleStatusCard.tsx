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

  return (
    <GlassCard glow="rose" hover={false} padding="lg" className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-20"
        style={{ background: phaseColor }}
      />

      <div className="relative z-10">
        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{getPhaseEmoji(phase)}</span>
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

        {/* Current day */}
        <div className="flex items-baseline gap-3 mb-2">
          <motion.span
            className="text-6xl font-display font-bold text-white"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            Day {currentDay}
          </motion.span>
        </div>

        <p className="text-lavender/70 text-sm font-body mb-6">
          of your {avgCycleLength}-day cycle
        </p>

        {/* Progress bar */}
        <div className="relative h-3 bg-plum-700/50 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}88)` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
          <div
            className="absolute inset-y-0 rounded-full opacity-50"
            style={{
              left: `${Math.min(progress, 100)}%`,
              width: '4px',
              background: phaseColor,
              boxShadow: `0 0 8px ${phaseColor}`,
            }}
          />
        </div>

        {/* Next period prediction */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider">
              Next Period
            </p>
            <p className="text-white font-semibold font-body">
              {daysUntilNext > 0
                ? `Expected in ${daysUntilNext - confidenceWindow}–${daysUntilNext + confidenceWindow} days`
                : 'Due any day now'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider">
              Confidence
            </p>
            <p className="text-lavender font-semibold font-body">
              ±{confidenceWindow} days
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default CycleStatusCard;
