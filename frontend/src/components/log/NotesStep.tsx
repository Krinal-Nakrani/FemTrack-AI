interface NotesStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesStep({ value, onChange }: NotesStepProps) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-white mb-2">Notes</h2>
      <p className="text-sm text-lavender/60 font-body mb-6">Anything else you'd like to record?</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How are you feeling today? Any observations..."
        rows={6}
        maxLength={500}
        className="w-full p-4 rounded-2xl bg-plum-700/30 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm resize-none focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/30 transition-all"
        id="log-notes"
      />
      <p className="text-xs text-lavender/30 font-body text-right mt-1">{value.length}/500</p>
    </div>
  );
}
