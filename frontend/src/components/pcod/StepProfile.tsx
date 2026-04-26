import { motion } from 'framer-motion';
import type { HealthProfile } from '@/utils/pcodAnalysis';

interface Props {
  profile: HealthProfile;
  onChange: (profile: HealthProfile) => void;
}

export function StepProfile({ profile, onChange }: Props) {
  const bmiColor = profile.bmi < 18.5 ? '#FBBF24' : profile.bmi < 25 ? '#4ADE80' : profile.bmi < 30 ? '#FBBF24' : '#EF4444';
  const bmiLabel = profile.bmi < 18.5 ? 'Underweight' : profile.bmi < 25 ? 'Normal' : profile.bmi < 30 ? 'Overweight' : 'Obese';

  const update = (key: keyof HealthProfile, val: string) => {
    const num = parseFloat(val) || 0;
    const next = { ...profile, [key]: num };
    // Recalculate BMI if height/weight fields exist
    onChange(next);
  };

  const fields: { key: keyof HealthProfile; label: string; unit: string; emoji: string }[] = [
    { key: 'age', label: 'Age', unit: 'years', emoji: '🎂' },
    { key: 'bmi', label: 'BMI', unit: 'kg/m²', emoji: '⚖️' },
    { key: 'avg_cycle_length', label: 'Avg Cycle Length', unit: 'days', emoji: '📅' },
    { key: 'cycle_variance_days', label: 'Cycle Variance', unit: 'days', emoji: '📊' },
    { key: 'cycles_tracked', label: 'Cycles Tracked', unit: '', emoji: '🔢' },
  ];

  return (
    <div className="space-y-3">
      <p className="text-lavender/50 font-body text-xs mb-1">
        Auto-filled from your profile. Edit if needed.
      </p>
      {fields.map((f, i) => (
        <motion.div
          key={f.key}
          className="glass-card p-3 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <span className="text-lg">{f.emoji}</span>
          <div className="flex-1">
            <p className="text-white/50 font-body text-[10px] uppercase tracking-wider">{f.label}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={profile[f.key] || ''}
              onChange={(e) => update(f.key, e.target.value)}
              className="w-16 px-2 py-1.5 rounded-lg bg-plum-700/50 border border-lavender/10 text-white font-body text-sm text-right focus:outline-none focus:border-purple-400/50"
            />
            {f.unit && <span className="text-lavender/40 font-body text-[10px] w-8">{f.unit}</span>}
          </div>
        </motion.div>
      ))}

      {/* BMI indicator */}
      <div className="glass-card p-3 flex items-center justify-between">
        <span className="text-white/50 font-body text-xs">BMI Status</span>
        <span className="text-xs font-body font-bold px-2 py-0.5 rounded-full" style={{ background: `${bmiColor}20`, color: bmiColor }}>
          {bmiLabel} ({profile.bmi.toFixed(1)})
        </span>
      </div>
    </div>
  );
}
