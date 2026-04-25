import { motion } from 'framer-motion';
import { MOODS } from '@/config/constants';

interface MoodStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function MoodStep({ value, onChange }: MoodStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        How Are You Feeling?
      </h2>
      <p className="text-sm text-lavender/60 font-body mb-8">
        Select your primary mood today
      </p>

      <div className="grid grid-cols-4 gap-4">
        {MOODS.map((mood, i) => {
          const isSelected = value === mood.id;
          return (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.85 }}
              whileHover={{ y: -4 }}
              onClick={() => onChange(mood.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 min-tap ${
                isSelected
                  ? 'bg-rose/15 shadow-glow-rose border border-rose/30'
                  : 'bg-plum-700/30 border border-transparent hover:bg-plum-700/50'
              }`}
              id={`mood-${mood.id}`}
            >
              <motion.span
                className="text-3xl"
                animate={
                  isSelected
                    ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5 }}
              >
                {mood.emoji}
              </motion.span>
              <span
                className={`text-xs font-body font-medium ${
                  isSelected ? 'text-white' : 'text-lavender/50'
                }`}
              >
                {mood.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
