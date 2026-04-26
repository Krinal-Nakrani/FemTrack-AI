import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Play, Clock, Sparkles, Flame, Wind, Heart, Brain, X, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { generateExercisePlan } from '@/utils/geminiApi';
import type { AIExercise } from '@/utils/geminiApi';
import { getRecommendedExercises } from '@/config/exercises';
import { getPhaseLabel, getPhaseEmoji, getPhaseColor } from '@/lib/utils';

const intensityConfig = {
  gentle: { label: 'Gentle', color: '#4ADE80', icon: Wind },
  moderate: { label: 'Moderate', color: '#FBBF24', icon: Flame },
  active: { label: 'Active', color: '#EF4444', icon: Flame },
};

export function Exercise() {
  const { cycleData } = useCycle();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [aiExercises, setAiExercises] = useState<AIExercise[]>([]);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiGenerated, setAiGenerated] = useState(false);

  const todaySymptoms = cycleData.todayLog?.symptoms || [];
  const todayMood = cycleData.todayLog?.mood || '';
  const pcodHistory = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
  const pcodScore = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_score : 25;

  // Auto-generate AI yoga on page load
  useEffect(() => {
    const generate = async () => {
      setAiLoading(true);
      const plan = await generateExercisePlan(cycleData.phase, todaySymptoms, pcodScore, todayMood);
      setAiExercises(plan);
      setAiLoading(false);
      setAiGenerated(true);
    };
    generate();
  }, [cycleData.phase]);

  const recommendations = useMemo(() => {
    return getRecommendedExercises(cycleData.phase, todaySymptoms, pcodScore, todayMood, 3);
  }, [cycleData.phase, todaySymptoms, pcodScore, todayMood]);

  const phaseColor = getPhaseColor(cycleData.phase);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Today's Movement</h1>
          <p className="text-sm text-lavender/60 font-body mt-1">AI-powered exercise for your body today</p>
        </div>
        <motion.div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${phaseColor}20` }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Dumbbell size={24} style={{ color: phaseColor }} />
        </motion.div>
      </div>

      {/* Phase Context */}
      <GlassCard hover={false} padding="md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${phaseColor}15` }}>
            {getPhaseEmoji(cycleData.phase)}
          </div>
          <div className="flex-1">
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider">Current Phase</p>
            <p className="font-semibold font-body" style={{ color: phaseColor }}>{getPhaseLabel(cycleData.phase)}</p>
            <p className="text-xs text-lavender/60 font-body mt-1">Day {cycleData.currentDay} of {cycleData.avgCycleLength}</p>
          </div>
        </div>
      </GlassCard>

      {/* AI Reasoning Banner */}
      <motion.div className="glass-card p-4 border-l-4" style={{ borderLeftColor: phaseColor }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-lavender/50 font-body uppercase tracking-wider mb-1">AI Recommendation</p>
            <p className="text-sm text-lavender/90 font-body leading-relaxed">
              {cycleData.phase === 'menstrual' && "Your body needs rest and gentle movement. I've selected restorative exercises that ease cramps and boost your mood."}
              {cycleData.phase === 'follicular' && "Your energy is climbing! I've chosen dynamic exercises that match your rising estrogen levels."}
              {cycleData.phase === 'ovulation' && "You're at peak performance! I've picked high-energy workouts to maximize this window."}
              {cycleData.phase === 'luteal' && "Time to slow down. I've selected calming exercises that ease PMS symptoms and keep cortisol low."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Recommended Exercises */}
      <div className="space-y-4">
        <h3 className="text-xs text-lavender/60 font-body uppercase tracking-wider px-1">Recommended for You</h3>

        {recommendations.map(({ exercise, reasoning }, i) => {
          const IntensityIcon = intensityConfig[exercise.intensity].icon;
          const isPlaying = playingVideo === exercise.id;

          return (
            <motion.div key={exercise.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>
              <GlassCard hover={!isPlaying} padding="md">
                {/* Video Player */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="mb-4">
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={`${exercise.videoUrl}?autoplay=1&rel=0`}
                          title={exercise.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ border: 'none' }}
                        />
                      </div>
                      <button
                        onClick={() => setPlayingVideo(null)}
                        className="flex items-center gap-1 text-xs text-lavender/60 font-body mt-2 hover:text-white transition-colors"
                      >
                        <X size={12} /> Close video
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4">
                  {/* Thumbnail / Play Button */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setPlayingVideo(isPlaying ? null : exercise.id)}
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl relative overflow-hidden group/play"
                      style={{ background: `${phaseColor}10` }}
                    >
                      <span className="transition-transform duration-300 group-hover/play:scale-110">{exercise.thumbnail}</span>
                      <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover/play:opacity-100 transition-opacity">
                        <Play size={24} className="text-white" fill="white" />
                      </div>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-white font-semibold font-body text-sm truncate">{exercise.title}</h4>
                      <span className="flex items-center gap-1 text-[10px] font-semibold font-body px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${intensityConfig[exercise.intensity].color}15`, color: intensityConfig[exercise.intensity].color }}>
                        <IntensityIcon size={10} />
                        {intensityConfig[exercise.intensity].label}
                      </span>
                    </div>
                    <p className="text-xs text-lavender/60 font-body mt-1 line-clamp-2">{exercise.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-lavender/50 font-body"><Clock size={10} /> {exercise.duration}</span>
                      {exercise.goodForPcod && <span className="flex items-center gap-1 text-[10px] text-green-400/80 font-body"><Heart size={10} /> PCOD</span>}
                      <button onClick={() => setPlayingVideo(exercise.id)} className="text-[10px] text-rose-400 font-body font-semibold hover:text-rose-300 transition-colors ml-auto">
                        ▶ Watch Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="mt-3 pt-3 border-t border-lavender/10">
                  <div className="flex items-start gap-2">
                    <Brain size={12} className="text-lavender/40 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-lavender/50 font-body italic leading-relaxed">{reasoning}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* AI Yoga Section */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xs text-lavender/60 font-body uppercase tracking-wider px-1">🤖 AI Yoga Recommendations</h3>
          <button
            onClick={async () => {
              setAiLoading(true);
              const plan = await generateExercisePlan(cycleData.phase, todaySymptoms, pcodScore, todayMood);
              setAiExercises(plan);
              setAiLoading(false);
              setAiGenerated(true);
            }}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 text-xs font-body font-medium hover:bg-purple-600/30 transition disabled:opacity-50"
          >
            {aiLoading ? <><RefreshCw size={12} className="animate-spin" /> Generating...</> : aiGenerated ? <><RefreshCw size={12} /> Regenerate</> : <><Zap size={12} /> Generate Plan</>}
          </button>
        </div>

        {aiLoading && (
          <GlassCard hover={false} padding="md">
            <div className="flex items-center justify-center gap-3 py-6">
              <div className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <p className="text-lavender/60 font-body text-sm">Gemini is creating your personalized plan...</p>
            </div>
          </GlassCard>
        )}

        {!aiLoading && aiExercises.length > 0 && (
          <div className="space-y-3">
            {aiExercises.map((ex, i) => {
              const intColor = ex.intensity === 'gentle' ? '#4ADE80' : ex.intensity === 'moderate' ? '#FBBF24' : '#EF4444';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard hover padding="md">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${intColor}10` }}>
                        {ex.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-white font-semibold font-body text-sm">{ex.title}</h4>
                          <span className="text-[10px] font-bold font-body px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${intColor}15`, color: intColor }}>
                            {ex.intensity}
                          </span>
                        </div>
                        <p className="text-xs text-lavender/60 font-body mt-1">{ex.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] text-lavender/50 font-body"><Clock size={10} /> {ex.duration}</span>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtube_search)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-rose-400 font-body font-semibold hover:text-rose-300 ml-auto"
                          >
                            ▶ Watch on YouTube <ExternalLink size={9} />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-lavender/10">
                      <div className="flex items-start gap-2">
                        <Brain size={12} className="text-lavender/40 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-lavender/50 font-body italic">{ex.why}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {!aiLoading && !aiGenerated && (
          <GlassCard hover={false} padding="md">
            <div className="text-center py-4">
              <p className="text-lavender/40 font-body text-sm">Tap "Generate Plan" for AI-personalized yoga based on your cycle phase, symptoms, and health data</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

export default Exercise;
