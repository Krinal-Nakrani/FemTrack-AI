import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ClipboardList, User, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import femtrackDB from '@/lib/db';
import { StepCamera } from '@/components/pcod/StepCamera';
import { StepSymptoms } from '@/components/pcod/StepSymptoms';
import { StepProfile } from '@/components/pcod/StepProfile';
import { ResultsDashboard } from '@/components/pcod/ResultsDashboard';
import { analyzePCOD, saveScanResult } from '@/utils/pcodAnalysis';
import type { SymptomAnswers, HealthProfile, PCODResult } from '@/utils/pcodAnalysis';

type Phase = 'steps' | 'scanning' | 'results';

const STEPS = [
  { key: 'camera', label: 'Face Scan', icon: Camera },
  { key: 'symptoms', label: 'Symptoms', icon: ClipboardList },
  { key: 'profile', label: 'Health Profile', icon: User },
];

const SCAN_MESSAGES = [
  'Analyzing facial skin signals...',
  'Evaluating symptom patterns...',
  'Calculating metabolic markers...',
  'Cross-referencing clinical data...',
  'Generating risk assessment...',
];

const DEFAULT_SYMPTOMS: SymptomAnswers = {
  irregular_periods: 'no', heavy_periods: 'no', weight_gain: 'no', fatigue: 'no',
  hair_thinning: 'no', excess_facial_hair: 'no', skin_darkening: 'no', mood_swings: 'no',
};

export function PCODScan() {
  const { user } = useAuth();
  const { cycleData } = useCycle();
  const [phase, setPhase] = useState<Phase>('steps');
  const [step, setStep] = useState(0);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomAnswers>(DEFAULT_SYMPTOMS);
  const [healthProfile, setHealthProfile] = useState<HealthProfile>({
    age: 22, bmi: 22.5, avg_cycle_length: 28, cycle_variance_days: 3, cycles_tracked: 0,
  });
  const [result, setResult] = useState<PCODResult | null>(null);
  const [scanMsg, setScanMsg] = useState(0);
  const [symptomsConfirmed, setSymptomsConfirmed] = useState(false);
  const [profileConfirmed, setProfileConfirmed] = useState(false);

  // Load profile data
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const profile = await femtrackDB.profiles.where('odataId').equals(user.uid).first();
      const storedAge = localStorage.getItem(`femtrack_age_${user.uid}`);
      const age = storedAge ? parseInt(storedAge) : (profile?.dob ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / 31557600000) : 22);

      const validCycles = cycleData.cycles.filter((c) => c.length && c.length > 0);
      const lengths = validCycles.map((c) => c.length!);
      const avg = lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : cycleData.avgCycleLength || 28;
      const variance = lengths.length > 1
        ? Math.round(Math.sqrt(lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length))
        : 3;

      setHealthProfile({
        age,
        bmi: parseFloat((parseFloat(localStorage.getItem(`femtrack_weight_${user.uid}`) || '60') / Math.pow(parseFloat(localStorage.getItem(`femtrack_height_${user.uid}`) || '165') / 100, 2)).toFixed(1)),
        avg_cycle_length: avg,
        cycle_variance_days: variance,
        cycles_tracked: validCycles.length || cycleData.cycles.length,
      });
    };
    load();
  }, [user, cycleData]);

  const symptomsAnswered = Object.values(symptoms).some((v) => v !== 'no');
  const canRun = !!faceImage && symptomsConfirmed && profileConfirmed;

  const runAnalysis = async () => {
    if (!faceImage) return;
    setPhase('scanning');
    setScanMsg(0);

    // Cycle through scan messages
    const interval = setInterval(() => {
      setScanMsg((prev) => Math.min(prev + 1, SCAN_MESSAGES.length - 1));
    }, 1000);

    try {
      const res = await analyzePCOD(faceImage, symptoms, healthProfile);
      clearInterval(interval);
      // Ensure minimum 4 seconds scanning screen
      await new Promise((r) => setTimeout(r, 500));
      setResult(res);
      saveScanResult(res);
      setPhase('results');
    } catch {
      clearInterval(interval);
      setPhase('steps');
    }
  };

  const scanAgain = () => {
    setPhase('steps');
    setStep(0);
    setFaceImage(null);
    setSymptoms(DEFAULT_SYMPTOMS);
    setResult(null);
    setSymptomsConfirmed(false);
    setProfileConfirmed(false);
  };

  // ─── SCANNING SCREEN ───
  if (phase === 'scanning') {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
        <motion.div className="w-32 h-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center relative"
          animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <div className="w-24 h-24 rounded-full border-2 border-rose-400/40 flex items-center justify-center">
            <Zap size={32} className="text-purple-400" />
          </div>
          <motion.div className="absolute w-full h-full rounded-full border-t-2 border-rose-400"
            animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
        </motion.div>
        <motion.p className="text-white font-body font-medium mt-6" key={scanMsg}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {SCAN_MESSAGES[scanMsg]}
        </motion.p>
        <div className="flex gap-1 mt-4">
          {SCAN_MESSAGES.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full transition-all ${i <= scanMsg ? 'bg-purple-400' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
    );
  }

  // ─── RESULTS ───
  if (phase === 'results' && result) {
    return (
      <div className="max-w-lg mx-auto pb-20">
        <h1 className="text-2xl font-display font-bold text-white mb-1">PCOD Analysis Results</h1>
        <p className="text-sm text-lavender/60 font-body mb-6">Powered by Gemini AI multimodal analysis</p>
        <ResultsDashboard result={result} onScanAgain={scanAgain} />
      </div>
    );
  }

  // ─── STEPS ───
  return (
    <div className="max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold text-white">PCOD Risk Detection</h1>
        <p className="text-sm text-lavender/60 font-body mt-1">
          Combines your face scan, symptoms, and health data for AI-powered PCOD screening
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((s, i) => (
          <button key={s.key} onClick={() => setStep(i)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-medium transition-all ${
              step === i ? 'bg-purple-600/40 text-white shadow-lg' : (i === 0 && faceImage) || (i === 1 && symptomsConfirmed) || (i === 2 && profileConfirmed) ? 'bg-green-500/10 text-green-400' : 'text-lavender/40'
            }`}>
            {(i === 0 && faceImage) || (i === 1 && symptomsConfirmed) || (i === 2 && profileConfirmed) ? '✓' : <s.icon size={14} />}
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="cam" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="text-lg font-display font-semibold text-white mb-4">Step 1 — Face Capture</h2>
            <p className="text-xs text-lavender/50 font-body mb-4">We analyze visible androgen markers: acne patterns, facial hair, skin pigmentation, and oiliness.</p>
            <StepCamera onCapture={(b64) => { setFaceImage(b64 || null); if (b64) setStep(1); }} captured={faceImage} />
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="sym" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="text-lg font-display font-semibold text-white mb-2">Step 2 — Symptom Check</h2>
            <p className="text-xs text-lavender/50 font-body mb-4">Quick self-assessment of PCOD-associated symptoms.</p>
            <StepSymptoms answers={symptoms} onChange={setSymptoms} />
            <button onClick={() => { setSymptomsConfirmed(true); setStep(2); }} className="w-full mt-4 py-3 rounded-xl bg-purple-600/30 text-purple-300 font-body text-sm font-medium flex items-center justify-center gap-2">
              Continue <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="prof" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <h2 className="text-lg font-display font-semibold text-white mb-2">Step 3 — Health Profile</h2>
            <p className="text-xs text-lavender/50 font-body mb-4">Verify your health data for accurate assessment.</p>
            <StepProfile profile={healthProfile} onChange={setHealthProfile} />
            <button onClick={() => { setProfileConfirmed(true); runAnalysis(); }} disabled={!faceImage || !symptomsConfirmed}
              className="w-full mt-6 py-3.5 rounded-xl gradient-rose text-white font-body text-sm font-bold disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
              <Zap size={16} /> Run PCOD Analysis
            </button>
            {!faceImage && <p className="text-amber-400/60 text-xs font-body text-center mt-2">⚠️ Complete face scan first (Step 1)</p>}
            {faceImage && !symptomsConfirmed && <p className="text-amber-400/60 text-xs font-body text-center mt-2">⚠️ Complete symptom check first (Step 2)</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PCODScan;
