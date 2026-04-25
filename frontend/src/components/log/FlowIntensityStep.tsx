import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { FLOW_LEVELS } from '@/config/constants';

interface FlowIntensityStepProps {
  value: number;
  onChange: (value: number) => void;
}

export function FlowIntensityStep({ value, onChange }: FlowIntensityStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Flow Intensity
      </h2>
      <p className="text-sm text-lavender/60 font-body mb-8">
        How heavy is your flow today?
      </p>

      <div className="flex items-end justify-center gap-4 mb-8">
        {FLOW_LEVELS.map((flow, i) => (
          <motion.button
            key={flow.level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(flow.level)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 min-tap ${
              value === flow.level
                ? 'bg-rose/15 shadow-glow-rose'
                : 'hover:bg-plum-700/30'
            }`}
            id={`flow-${flow.level}`}
          >
            <div className="relative">
              {Array.from({ length: flow.level }).map((_, di) => (
                <Droplets
                  key={di}
                  size={16 + flow.level * 4}
                  className="transition-colors duration-300"
                  style={{
                    color: value === flow.level ? flow.color : 'rgba(179, 157, 219, 0.3)',
                    position: di > 0 ? 'absolute' : 'relative',
                    top: di > 0 ? `${di * -3}px` : undefined,
                    left: di > 0 ? `${di * 2}px` : undefined,
                    opacity: di > 0 ? 0.5 : 1,
                  }}
                />
              ))}
            </div>
            <span
              className={`text-xs font-body font-medium transition-colors ${
                value === flow.level ? 'text-white' : 'text-lavender/40'
              }`}
            >
              {flow.label}
            </span>
          </motion.button>
        ))}
      </div>

      {value === 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => onChange(0)}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-lavender/20 text-lavender/50 text-sm font-body hover:border-lavender/30 transition-colors"
          id="flow-none"
        >
          No flow today
        </motion.button>
      )}
    </div>
  );
}
