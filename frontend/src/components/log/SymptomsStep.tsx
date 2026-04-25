import { motion } from 'framer-motion';
import { SYMPTOMS } from '@/config/constants';

interface SymptomsStepProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function SymptomsStep({ value, onChange }: SymptomsStepProps) {
  const toggleSymptom = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((s) => s !== id));
    } else {
      onChange([...value, id]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">
        Physical Symptoms
      </h2>
      <p className="text-sm text-lavender/60 font-body mb-6">
        Tap all that apply today
      </p>

      <div className="flex flex-wrap gap-3">
        {SYMPTOMS.map((symptom, i) => {
          const isSelected = value.includes(symptom.id);
          return (
            <motion.button
              key={symptom.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleSymptom(symptom.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-body font-medium transition-all duration-300 min-tap ${
                isSelected
                  ? 'bg-rose/20 text-white border border-rose/40 shadow-glow-rose/30'
                  : 'bg-plum-700/30 text-lavender/60 border border-lavender/10 hover:border-lavender/20'
              }`}
              id={`symptom-${symptom.id}`}
            >
              <span>{symptom.emoji}</span>
              <span>{symptom.label}</span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 text-rose-400"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {value.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-lavender/50 font-body mt-4"
        >
          {value.length} symptom{value.length !== 1 ? 's' : ''} selected
        </motion.p>
      )}
    </div>
  );
}
