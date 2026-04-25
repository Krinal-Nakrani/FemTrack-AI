import { motion } from 'framer-motion';

interface CycleStatusStepProps {
  value: 'started' | 'ongoing' | 'ended' | 'none';
  onChange: (value: 'started' | 'ongoing' | 'ended' | 'none') => void;
}

const options = [
  { value: 'started' as const, label: 'Yes, started today', emoji: '🩸', color: '#C94B8A' },
  { value: 'ongoing' as const, label: 'Still going', emoji: '🔴', color: '#E85486' },
  { value: 'ended' as const, label: 'Ended today', emoji: '✅', color: '#4ADE80' },
  { value: 'none' as const, label: 'No period today', emoji: '⭕', color: '#B39DDB' },
];

export function CycleStatusStep({ value, onChange }: CycleStatusStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Period Status
      </h2>
      <p className="text-sm text-lavender/60 font-body mb-8">
        Did your period start or continue today?
      </p>

      <div className="space-y-3">
        {options.map((option, i) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 min-tap ${
              value === option.value
                ? 'border-rose/50 bg-rose/10'
                : 'border-lavender/10 bg-plum-700/30 hover:border-lavender/20'
            }`}
            id={`cycle-status-${option.value}`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span
              className={`font-body font-medium text-sm ${
                value === option.value ? 'text-white' : 'text-lavender/70'
              }`}
            >
              {option.label}
            </span>
            {value === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-6 h-6 rounded-full gradient-rose flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
