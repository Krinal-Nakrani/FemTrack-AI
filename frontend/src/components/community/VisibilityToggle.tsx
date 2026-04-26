import { Globe, User, Shield } from 'lucide-react';

type Visibility = 'public' | 'anonymous' | 'doctors_only';

interface VisibilityToggleProps {
  value: Visibility;
  onChange: (v: Visibility) => void;
}

const options: { key: Visibility; icon: typeof Globe; label: string; desc: string }[] = [
  { key: 'public', icon: Globe, label: 'Public', desc: 'Everyone can see' },
  { key: 'anonymous', icon: User, label: 'Anonymous', desc: 'Public but no name' },
  { key: 'doctors_only', icon: Shield, label: 'Doctors Only', desc: 'Only doctors see this' },
];

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-body font-medium text-lavender/70 uppercase tracking-wider">
        Who can see this question?
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map(opt => {
          const selected = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onChange(opt.key)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selected
                  ? opt.key === 'doctors_only'
                    ? 'border-teal/40 bg-teal/10'
                    : 'border-rose/40 bg-rose/10'
                  : 'border-lavender/10 bg-plum-700/20 hover:border-lavender/20'
              }`}
            >
              <opt.icon size={18} className={
                selected
                  ? opt.key === 'doctors_only' ? 'text-teal-400' : 'text-rose-400'
                  : 'text-lavender/40'
              } />
              <div>
                <p className={`text-xs font-body font-bold ${selected ? 'text-white' : 'text-lavender/60'}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-lavender/40 font-body">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VisibilityToggle;
