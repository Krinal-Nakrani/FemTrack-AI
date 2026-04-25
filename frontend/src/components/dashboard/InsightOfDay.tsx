import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { getPhaseInsight, type CyclePhase } from '@/lib/utils';

interface InsightOfDayProps {
  phase: CyclePhase;
}

export function InsightOfDay({ phase }: InsightOfDayProps) {
  const insight = getPhaseInsight(phase);

  return (
    <GlassCard hover={false} padding="md">
      <div className="flex items-start gap-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255, 215, 0, 0.15)' }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Lightbulb size={20} className="text-yellow-400" />
        </motion.div>
        <div>
          <p className="text-xs text-lavender/60 font-body uppercase tracking-wider mb-1">
            Insight of the Day
          </p>
          <p className="text-sm text-lavender/90 font-body leading-relaxed">
            {insight}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export default InsightOfDay;
