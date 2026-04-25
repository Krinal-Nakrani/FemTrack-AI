import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Heart, Calendar, Sparkles, Shield, ArrowLeft, Dumbbell, Activity } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { CYCLE_PHASES } from '@/config/constants';
import { getRecommendedExercises } from '@/config/exercises';
import type { CyclePhase } from '@/lib/utils';

const SUPPORT_TIPS: Record<string, string[]> = {
  menstrual: [
    "💆 Offer a warm compress or heating pad for cramps",
    "🍵 Make her a warm ginger or chamomile tea",
    "🛋️ Let her rest without guilt — her body is working hard",
    "🍫 Surprise her with her favorite comfort food",
    "🤗 A gentle back rub can ease lower back pain",
    "📱 Don't pressure her to go out — cozy night in is perfect",
  ],
  follicular: [
    "🎉 Plan something fun — her energy is rising!",
    "🏃 Suggest an active date: hiking, cycling, or dancing",
    "💬 She's more social now — catch up over a nice dinner",
    "🌟 Support her new ideas — creativity peaks this phase",
    "😊 Compliment her — confidence is naturally higher",
    "🎨 Try something creative together — painting, cooking class",
  ],
  ovulation: [
    "💃 She's at her peak! Plan exciting activities",
    "🌹 Romance is in the air — plan a special date night",
    "👂 She's extra communicative — be a great listener",
    "🏋️ Join her for a workout — she can handle intensity",
    "📸 Take photos together — she's feeling her best",
    "💕 Physical connection is naturally stronger now",
  ],
  luteal: [
    "🧘 Be extra patient — PMS can affect mood unpredictably",
    "🍿 Movie night with her favorite snacks is perfect",
    "🫂 Extra hugs and reassurance go a long way right now",
    "🌿 Suggest a calming walk in nature together",
    "💤 Respect her need for more sleep — don't take it personally",
    "🚫 Avoid starting difficult conversations this week",
  ],
};

// This component works in two modes:
// 1. Accessed via /partner/:token — shows shared data for the partner
// 2. The data comes from the user who shared the link
// For now we demonstrate with realistic demo data that matches the logged-in user's cycle
function getPartnerData(token: string | undefined) {
  // In production, this would fetch from Firestore using the token
  // For demo, we generate realistic data
  const today = new Date();
  const cycleDay = ((today.getDate() + 5) % 28) + 1; // Simulated current day
  let phase: CyclePhase = 'follicular';
  if (cycleDay <= 5) phase = 'menstrual';
  else if (cycleDay <= 13) phase = 'follicular';
  else if (cycleDay <= 16) phase = 'ovulation';
  else phase = 'luteal';

  const daysUntil = Math.max(0, 28 - cycleDay);

  return {
    name: token?.includes('demo') ? 'Your Partner' : 'Partner',
    phase,
    currentDay: cycleDay,
    cycleLength: 28,
    mood: phase === 'menstrual' ? '😩 Tired' : phase === 'follicular' ? '😊 Happy' : phase === 'ovulation' ? '⚡ Energetic' : '😌 Calm',
    energy: phase === 'ovulation' ? 5 : phase === 'follicular' ? 4 : phase === 'luteal' ? 2 : 1,
    daysUntilNext: daysUntil,
    symptoms: phase === 'menstrual' ? ['cramps', 'fatigue'] : phase === 'luteal' ? ['mood_swings', 'bloating'] : [],
  };
}

export function PartnerPortal() {
  const { token } = useParams<{ token: string }>();
  const data = useMemo(() => getPartnerData(token), [token]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const phaseInfo = CYCLE_PHASES[data.phase];
  const tips = SUPPORT_TIPS[data.phase];

  // Get exercise recommendations to show partner
  const exercises = useMemo(() => {
    return getRecommendedExercises(data.phase, data.symptoms, 25, '', data.energy);
  }, [data.phase, data.symptoms, data.energy]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tips.length]);

  const phaseEmoji = data.phase === 'menstrual' ? '🌺' : data.phase === 'follicular' ? '🌱' : data.phase === 'ovulation' ? '🌸' : '🌙';

  return (
    <div className="min-h-screen bg-plum relative overflow-hidden">
      <div className="aurora-bg" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 text-lavender/60 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-body">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-rose-400" />
            <span className="text-sm font-body text-lavender/60">Partner Care</span>
          </div>
        </motion.div>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.div
            className="w-20 h-20 rounded-full gradient-rose flex items-center justify-center mx-auto mb-4 shadow-glow-rose"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Heart size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-white">Partner Care Dashboard</h1>
          <p className="text-sm text-lavender/60 font-body mt-1">Here's how you can support her today</p>
        </motion.div>

        {/* Phase Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hover={false} padding="lg" className="mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${phaseInfo.color}15` }}>
                {phaseEmoji}
              </div>
              <div className="flex-1">
                <p className="text-xs text-lavender/50 font-body uppercase tracking-wider">She's in</p>
                <p className="font-semibold font-body text-lg" style={{ color: phaseInfo.color }}>{phaseInfo.label}</p>
                <p className="text-xs text-lavender/60 font-body">Day {data.currentDay} of {data.cycleLength}</p>
              </div>
              <div className="text-right">
                <Calendar size={16} className="text-lavender/40 mb-1 ml-auto" />
                <p className="text-xs text-lavender/50 font-body">{data.daysUntilNext}d</p>
                <p className="text-[10px] text-lavender/40 font-body">until next</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Mood & Energy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4 mb-4">
          <GlassCard hover={false} padding="md" className="text-center">
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-2">Her Mood</p>
            <p className="text-lg font-body text-white">{data.mood}</p>
          </GlassCard>
          <GlassCard hover={false} padding="md" className="text-center">
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-2">Energy Level</p>
            <div className="flex justify-center gap-1.5 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-6 rounded-full"
                  style={{ background: i <= data.energy ? phaseInfo.color : 'rgba(179,157,219,0.15)' }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                />
              ))}
            </div>
            <p className="text-xs text-lavender/50 font-body">
              {data.energy <= 2 ? 'Low — be gentle' : data.energy <= 3 ? 'Moderate' : 'High — she\'s energized!'}
            </p>
          </GlassCard>
        </motion.div>

        {/* Support Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard hover={false} padding="lg" glow="rose" className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-yellow-400" />
              <p className="text-sm font-display font-semibold text-white">How to Support Her Today</p>
            </div>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  className={`p-3 rounded-xl font-body text-sm transition-all duration-500 ${
                    i === currentTipIndex
                      ? 'bg-rose/15 border border-rose/25 text-white shadow-lg shadow-rose/5'
                      : 'text-lavender/50 hover:text-lavender/70'
                  }`}
                >
                  {tip}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Exercise She Might Do */}
        {exercises.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard hover={false} padding="md" className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell size={14} className="text-lavender" />
                <p className="text-sm font-display font-semibold text-white">Her Recommended Exercise</p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-plum-700/30">
                <span className="text-2xl">{exercises[0].exercise.thumbnail}</span>
                <div>
                  <p className="text-sm font-body text-white">{exercises[0].exercise.title}</p>
                  <p className="text-xs text-lavender/60 font-body">{exercises[0].exercise.duration} · {exercises[0].exercise.category}</p>
                </div>
              </div>
              <p className="text-[10px] text-lavender/40 font-body mt-2 italic">
                Maybe join her for this one? Working out together builds connection 💕
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* What her symptoms mean */}
        {data.symptoms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard hover={false} padding="md" className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} className="text-lavender" />
                <p className="text-sm font-display font-semibold text-white">What She's Experiencing</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.symptoms.map((s) => (
                  <span key={s} className="text-xs font-body px-3 py-1.5 rounded-full bg-rose/10 text-rose-300 border border-rose/15">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-lavender/40 font-body mt-2">
                These are normal for her current phase. Be understanding and supportive.
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Privacy */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-2 justify-center text-center mt-6">
          <Shield size={14} className="text-green-400" />
          <p className="text-[10px] text-lavender/30 font-body">She controls what you can see. All data is encrypted. Respect her privacy always.</p>
        </motion.div>

        <p className="text-center text-[10px] text-lavender/20 font-body mt-4">FemTrack AI Partner Portal</p>
      </div>
    </div>
  );
}

export default PartnerPortal;
