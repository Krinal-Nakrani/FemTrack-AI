import { motion } from 'framer-motion';
import { GlassCard } from '@/components/shared/GlassCard';

interface WellnessRingProps {
  logged: number; // number of categories logged today
  total: number; // total categories available
}

export function WellnessRing({ logged, total }: WellnessRingProps) {
  const percentage = total > 0 ? (logged / total) * 100 : 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <GlassCard glow="lavender" padding="md" className="flex flex-col items-center">
      <p className="text-xs text-lavender/60 font-body uppercase tracking-wider mb-3">
        Today's Wellness
      </p>

      <div className="relative w-[130px] h-[130px]">
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="rgba(179, 157, 219, 0.15)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="url(#wellnessGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          />
          <defs>
            <linearGradient id="wellnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B39DDB" />
              <stop offset="100%" stopColor="#C94B8A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-display font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
          >
            {logged}/{total}
          </motion.span>
          <span className="text-[10px] text-lavender/60 font-body">logged</span>
        </div>
      </div>

      <p className="text-sm text-lavender/80 font-body mt-3 text-center">
        {percentage === 100
          ? '✨ All logged!'
          : percentage >= 50
          ? 'Keep it up!'
          : 'Start logging today'}
      </p>
    </GlassCard>
  );
}

export default WellnessRing;
