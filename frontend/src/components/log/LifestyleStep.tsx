import { motion } from 'framer-motion';
import { Moon, Brain, Droplets } from 'lucide-react';

interface LifestyleStepProps {
  sleep: number;
  stress: number;
  water: number;
  onSleepChange: (v: number) => void;
  onStressChange: (v: number) => void;
  onWaterChange: (v: number) => void;
}

const stressLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const stressColors = ['#4ADE80', '#86EFAC', '#FBBF24', '#F97316', '#EF4444'];

export function LifestyleStep({ sleep, stress, water, onSleepChange, onStressChange, onWaterChange }: LifestyleStepProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-display font-bold text-white">Lifestyle</h2>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Moon size={18} className="text-lavender" />
          <span className="text-sm font-body font-medium text-white">Sleep</span>
          <span className="ml-auto text-sm font-body font-bold text-lavender">{sleep}h</span>
        </div>
        <input type="range" min="0" max="12" step="0.5" value={sleep} onChange={(e) => onSleepChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(90deg, #B39DDB ${(sleep/12)*100}%, rgba(179,157,219,0.15) ${(sleep/12)*100}%)` }}
          id="sleep-slider" />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Brain size={18} className="text-lavender" />
          <span className="text-sm font-body font-medium text-white">Stress</span>
        </div>
        <div className="flex gap-3">
          {[1,2,3,4,5].map((level) => (
            <motion.button key={level} whileTap={{ scale: 0.9 }} onClick={() => onStressChange(level)}
              className={`flex-1 py-3 rounded-xl text-xs font-body font-medium transition-all min-tap ${stress === level ? 'text-white' : 'bg-plum-700/30 text-lavender/40'}`}
              style={stress === level ? { background: stressColors[level-1] } : undefined}
              id={`stress-${level}`}>{stressLabels[level-1]}</motion.button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Droplets size={18} className="text-blue-400" />
          <span className="text-sm font-body font-medium text-white">Water</span>
          <span className="ml-auto text-sm font-body font-bold text-blue-400">{water} glasses</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.button key={i} whileTap={{ scale: 0.8 }} onClick={() => onWaterChange(i+1)}
              className={`flex-1 h-10 rounded-lg transition-all min-tap ${i < water ? 'bg-blue-400/30 border border-blue-400/40' : 'bg-plum-700/30 border border-lavender/10'}`}
              id={`water-${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
