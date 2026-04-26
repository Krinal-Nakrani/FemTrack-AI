import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PINEntryProps {
  onSubmit: (pin: string) => void;
  error?: string;
  loading?: boolean;
}

export function PINEntry({ onSubmit, error, loading }: PINEntryProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    if (newDigits.every((d) => d !== '')) {
      onSubmit(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4">
        {digits.map((digit, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <input
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className={`w-16 h-20 rounded-2xl text-center text-3xl font-bold transition-all duration-200 outline-none ${
                digit
                  ? 'bg-purple-600/30 border-2 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                  : 'bg-white/5 border-2 border-white/10 text-white/50'
              } ${error ? 'border-red-400/50 shake' : ''}`}
              id={`pin-input-${i}`}
            />
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm font-body text-center"
        >
          {error}
        </motion.p>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-lavender/60 text-sm font-body">
          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          Verifying...
        </div>
      )}
    </div>
  );
}
