import { motion } from 'framer-motion';
import type { SymptomAnswers } from '@/utils/pcodAnalysis';

const QUESTIONS: { key: keyof SymptomAnswers; label: string; emoji: string }[] = [
  { key: 'irregular_periods', label: 'Irregular or missed periods?', emoji: '📅' },
  { key: 'heavy_periods', label: 'Periods heavier/more painful than usual?', emoji: '💧' },
  { key: 'weight_gain', label: 'Unexplained weight gain?', emoji: '⚖️' },
  { key: 'fatigue', label: 'Fatigue even after full sleep?', emoji: '😴' },
  { key: 'hair_thinning', label: 'Hair thinning on scalp?', emoji: '💇' },
  { key: 'excess_facial_hair', label: 'Excess hair on face/body?', emoji: '🪒' },
  { key: 'skin_darkening', label: 'Skin darkening around neck/armpits?', emoji: '🫳' },
  { key: 'mood_swings', label: 'Mood swings / anxiety spikes?', emoji: '🎭' },
];

const OPTIONS: { value: 'yes' | 'sometimes' | 'no'; label: string; color: string }[] = [
  { value: 'yes', label: 'Yes', color: '#EF4444' },
  { value: 'sometimes', label: 'Sometimes', color: '#FBBF24' },
  { value: 'no', label: 'No', color: '#4ADE80' },
];

interface Props {
  answers: SymptomAnswers;
  onChange: (answers: SymptomAnswers) => void;
}

export function StepSymptoms({ answers, onChange }: Props) {
  const answered = Object.values(answers).filter((v) => v !== 'no' || v).length;

  return (
    <div className="space-y-3">
      <p className="text-lavender/50 font-body text-xs mb-2">{answered}/8 answered</p>
      {QUESTIONS.map((q, i) => (
        <motion.div
          key={q.key}
          className="glass-card p-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{q.emoji}</span>
            <div className="flex-1">
              <p className="text-white font-body text-sm font-medium mb-2">{q.label}</p>
              <div className="flex gap-2">
                {OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onChange({ ...answers, [q.key]: opt.value })}
                    className="flex-1 py-1.5 rounded-lg text-xs font-body font-medium transition-all"
                    style={{
                      background: answers[q.key] === opt.value ? `${opt.color}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${answers[q.key] === opt.value ? `${opt.color}50` : 'rgba(255,255,255,0.08)'}`,
                      color: answers[q.key] === opt.value ? opt.color : 'rgba(200,200,220,0.5)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
