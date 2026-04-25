import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { getPhaseInsight, type CyclePhase } from '@/lib/utils';

interface InsightOfDayProps {
  phase: CyclePhase;
}

export function InsightOfDay({ phase }: InsightOfDayProps) {
  const insight = getPhaseInsight(phase);
  const [displayText, setDisplayText] = useState('');

  // Typewriter effect
  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < insight.length) {
        setDisplayText(insight.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [insight]);

  return (
    <GlassCard hover={false} padding="md">
      <div className="flex items-start gap-4">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative"
          style={{ background: 'rgba(255, 215, 0, 0.15)' }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Lightbulb size={20} className="text-yellow-400" />
          {/* Glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ background: 'rgba(255, 215, 0, 0.1)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>
        <div className="flex-1">
          <p className="text-xs text-lavender/60 font-body uppercase tracking-wider mb-1">
            Insight of the Day
          </p>
          <p className="text-sm text-lavender/90 font-body leading-relaxed">
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-0.5 h-4 bg-lavender/60 ml-0.5 align-middle"
            />
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export default InsightOfDay;
