import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { getDateString } from '@/lib/utils';
import { CycleStatusStep } from '@/components/log/CycleStatusStep';
import { FlowIntensityStep } from '@/components/log/FlowIntensityStep';
import { SymptomsStep } from '@/components/log/SymptomsStep';
import { MoodStep } from '@/components/log/MoodStep';
import { LifestyleStep } from '@/components/log/LifestyleStep';
import { NotesStep } from '@/components/log/NotesStep';
import { Confetti } from '@/components/log/Confetti';

const ALL_STEPS = [
  { key: 'status', label: 'Period Status' },
  { key: 'flow', label: 'Flow' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'mood', label: 'Mood' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'notes', label: 'Notes' },
];

export function Log() {
  const navigate = useNavigate();
  const { saveLog } = useCycle();
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    periodStatus: 'none' as 'started' | 'ongoing' | 'ended' | 'none',
    flowLevel: 0,
    symptoms: [] as string[],
    mood: '',
    sleepHours: 7,
    stressLevel: 2,
    waterIntake: 6,
    notes: '',
  });

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Dynamically compute visible steps based on period status
  // If "none" or "ended" → skip the flow step
  const activeSteps = useMemo(() => {
    const hasPeriod = formData.periodStatus === 'started' || formData.periodStatus === 'ongoing';
    if (hasPeriod) return ALL_STEPS;
    // Skip flow step when no period
    return ALL_STEPS.filter((s) => s.key !== 'flow');
  }, [formData.periodStatus]);

  const currentStepKey = activeSteps[step]?.key || 'status';

  const nextStep = () => {
    if (step < activeSteps.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If no period, ensure flowLevel is 0
      const dataToSave = {
        ...formData,
        flowLevel: (formData.periodStatus === 'started' || formData.periodStatus === 'ongoing')
          ? formData.flowLevel
          : 0,
      };
      await saveLog({
        date: getDateString(),
        ...dataToSave,
      });
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);
    } catch (err) {
      console.error('Error saving log:', err);
    }
    setSaving(false);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const goNext = () => {
    setDirection(1);
    nextStep();
  };

  const goPrev = () => {
    setDirection(-1);
    prevStep();
  };

  const renderStep = () => {
    switch (currentStepKey) {
      case 'status':
        return (
          <CycleStatusStep
            value={formData.periodStatus}
            onChange={(v) => {
              updateField('periodStatus', v);
              // Reset flow if switching to no period
              if (v === 'none' || v === 'ended') {
                updateField('flowLevel', 0);
              }
            }}
          />
        );
      case 'flow':
        return (
          <FlowIntensityStep
            value={formData.flowLevel}
            onChange={(v) => updateField('flowLevel', v)}
          />
        );
      case 'symptoms':
        return (
          <SymptomsStep
            value={formData.symptoms}
            onChange={(v) => updateField('symptoms', v)}
          />
        );
      case 'mood':
        return (
          <MoodStep
            value={formData.mood}
            onChange={(v) => updateField('mood', v)}
          />
        );
      case 'lifestyle':
        return (
          <LifestyleStep
            sleep={formData.sleepHours}
            stress={formData.stressLevel}
            water={formData.waterIntake}
            onSleepChange={(v) => updateField('sleepHours', v)}
            onStressChange={(v) => updateField('stressLevel', v)}
            onWaterChange={(v) => updateField('waterIntake', v)}
          />
        );
      case 'notes':
        return (
          <NotesStep
            value={formData.notes}
            onChange={(v) => updateField('notes', v)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto relative">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-plum-700/50 text-lavender hover:text-white transition-colors min-tap"
          id="log-back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-semibold text-white">
          Log Today
        </h1>
        <div className="w-10" />
      </div>

      {/* Progress indicator — dynamic based on active steps */}
      <div className="flex items-center gap-2 mb-8">
        {activeSteps.map((s, i) => (
          <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                i <= step
                  ? 'gradient-rose'
                  : 'bg-plum-700/50'
              }`}
            />
            <span
              className={`text-[9px] font-body transition-colors ${
                i === step ? 'text-rose-400' : 'text-lavender/30'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStepKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goPrev}
          disabled={step === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-body font-medium text-lavender/60 hover:text-white bg-plum-700/30 hover:bg-plum-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all min-tap"
          id="log-prev"
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>

        {step < activeSteps.length - 1 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goNext}
            className="flex items-center gap-2 btn-primary text-sm px-6 py-3"
            id="log-next"
          >
            Next
            <ArrowRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 btn-primary text-sm px-6 py-3"
            id="log-save"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Save Log
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default Log;
