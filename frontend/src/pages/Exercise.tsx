import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Sparkles, Brain, ExternalLink, RefreshCw, Zap, Heart, Leaf, Music, ChevronRight } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { generateExercisePlan } from '@/utils/geminiApi';
import type { AIExercise } from '@/utils/geminiApi';
import { getRecommendedExercises } from '@/config/exercises';
import { getPhaseLabel, getPhaseEmoji, getPhaseColor } from '@/lib/utils';

const RELIEF_PROGRAMS = [
  { title: 'Period Pain Relief', desc: 'Gentle yoga for cramp relief', emoji: '🧘‍♀️', color: '#E8B4F8', search: 'period pain relief yoga exercises', dur: '15 min' },
  { title: 'Stress & Anxiety', desc: 'Breathwork and meditation', emoji: '🧠', color: '#B4D8F8', search: 'stress relief breathing exercises women', dur: '10 min' },
  { title: 'PCOD Wellness', desc: 'Hormone-balancing routines', emoji: '💪', color: '#F8D4B4', search: 'PCOD PCOS exercise routine yoga', dur: '20 min' },
  { title: 'Better Sleep', desc: 'Evening wind-down flow', emoji: '🌙', color: '#C4B4F8', search: 'yoga for better sleep women', dur: '12 min' },
];

const SOUNDSCAPES = [
  { title: 'Forest Rain', emoji: '🌧️', color: '#4ADE80', search: 'forest rain sounds relaxation 1 hour' },
  { title: 'Ocean Waves', emoji: '🌊', color: '#60A5FA', search: 'ocean waves sounds relaxation meditation' },
  { title: 'Night Garden', emoji: '🌿', color: '#A78BFA', search: 'peaceful night garden ambient sounds' },
  { title: 'Gentle Piano', emoji: '🎹', color: '#F472B6', search: 'gentle piano music relaxation sleep' },
];

export function Exercise() {
  const { cycleData } = useCycle();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [aiExercises, setAiExercises] = useState<AIExercise[]>([]);
  const [aiLoading, setAiLoading] = useState(true);

  const todaySymptoms = cycleData.todayLog?.symptoms || [];
  const todayMood = cycleData.todayLog?.mood || '';
  const pcodHistory = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
  const pcodScore = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_score : 25;

  useEffect(() => {
    const generate = async () => {
      setAiLoading(true);
      const plan = await generateExercisePlan(cycleData.phase, todaySymptoms, pcodScore, todayMood);
      setAiExercises(plan);
      setAiLoading(false);
    };
    generate();
  }, [cycleData.phase]);

  const phaseColor = getPhaseColor(cycleData.phase);

  const recommendations = useMemo(() => {
    return getRecommendedExercises(cycleData.phase, todaySymptoms, pcodScore, todayMood, 3);
  }, [cycleData.phase, todaySymptoms, pcodScore, todayMood]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Self Care</h1>
          <p className="text-sm text-lavender/60 font-body mt-1">AI-powered wellness for your body & mind</p>
        </div>
        <motion.div
          className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
          style={{ background: `${phaseColor}20`, border: `1px solid ${phaseColor}40` }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm">{getPhaseEmoji(cycleData.phase)}</span>
          <span className="text-xs font-body font-medium" style={{ color: phaseColor }}>{getPhaseLabel(cycleData.phase)}</span>
        </motion.div>
      </div>

      {/* Phase-based relief banner */}
      <div className="text-xs text-lavender/50 font-body uppercase tracking-wider px-1">
        {cycleData.phase === 'menstrual' ? 'Menstrual cramps relief' :
         cycleData.phase === 'follicular' ? 'Energy boosting routines' :
         cycleData.phase === 'ovulation' ? 'Peak performance workouts' : 'PMS comfort & calm'}
      </div>

      {/* Hero Program Cards — horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
        {RELIEF_PROGRAMS.map((prog, i) => (
          <motion.a
            key={prog.title}
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(prog.search)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[260px] h-[160px] rounded-2xl p-5 relative overflow-hidden snap-start group"
            style={{ background: `linear-gradient(135deg, ${prog.color}40, ${prog.color}15)` }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-white font-display font-bold text-base leading-tight">{prog.title}</h3>
            <p className="text-white/60 font-body text-xs mt-1">{prog.desc}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] text-white/50 font-body flex items-center gap-1"><Clock size={10} /> {prog.dur}</span>
            </div>
            <div className="absolute bottom-3 left-5 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition">
              <Play size={16} className="text-white ml-0.5" fill="white" />
            </div>
            <span className="absolute top-4 right-4 text-4xl opacity-30">{prog.emoji}</span>
          </motion.a>
        ))}
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-400" /> Programs for you
          </h2>
          <button
            onClick={async () => {
              setAiLoading(true);
              const plan = await generateExercisePlan(cycleData.phase, todaySymptoms, pcodScore, todayMood);
              setAiExercises(plan);
              setAiLoading(false);
            }}
            className="flex items-center gap-1 text-[10px] text-purple-400 font-body"
          >
            <RefreshCw size={10} /> Refresh
          </button>
        </div>

        {aiLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mb-3" />
                <div className="h-3 w-24 bg-white/5 rounded mb-2" />
                <div className="h-2 w-full bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiExercises.map((ex, i) => {
              const intColor = ex.intensity === 'gentle' ? '#4ADE80' : ex.intensity === 'moderate' ? '#FBBF24' : '#EF4444';
              return (
                <motion.a
                  key={i}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.youtube_search)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 hover:border-purple-400/20 transition-all group"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${intColor}12` }}>
                      {ex.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-body font-semibold text-sm truncate">{ex.title}</h4>
                      <p className="text-[11px] text-lavender/50 font-body mt-0.5 line-clamp-2">{ex.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-lavender/40 font-body flex items-center gap-1"><Clock size={9} /> {ex.duration}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${intColor}15`, color: intColor }}>{ex.intensity}</span>
                        <span className="text-[10px] text-rose-400 font-body ml-auto flex items-center gap-1 group-hover:gap-2 transition-all">
                          ▶ Watch <ExternalLink size={8} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-lavender/5">
                    <p className="text-[10px] text-lavender/40 font-body italic flex items-start gap-1">
                      <Brain size={10} className="mt-0.5 flex-shrink-0" /> {ex.why}
                    </p>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}
      </div>

      {/* Curated Video Exercises */}
      <div>
        <h2 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
          <Heart size={14} className="text-rose-400" /> Phase-matched exercises
        </h2>
        <div className="space-y-3">
          {recommendations.map(({ exercise, reasoning }, i) => (
            <motion.div key={exercise.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
              <GlassCard hover padding="md">
                <AnimatePresence>
                  {playingVideo === exercise.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4">
                      <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        <iframe src={`${exercise.videoUrl}?autoplay=1&rel=0`} title={exercise.title}
                          className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: 'none' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPlayingVideo(playingVideo === exercise.id ? null : exercise.id)}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative overflow-hidden group/play flex-shrink-0"
                    style={{ background: `${phaseColor}10` }}>
                    <span className="transition-transform group-hover/play:scale-110">{exercise.thumbnail}</span>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/play:opacity-100 transition-opacity rounded-2xl">
                      <Play size={20} className="text-white" fill="white" />
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold font-body text-sm truncate">{exercise.title}</h4>
                    <p className="text-[11px] text-lavender/50 font-body mt-0.5 line-clamp-1">{exercise.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-lavender/40 font-body flex items-center gap-1"><Clock size={9} /> {exercise.duration}</span>
                      {exercise.goodForPcod && <span className="text-[10px] text-green-400/70 font-body flex items-center gap-1"><Leaf size={9} /> PCOD</span>}
                    </div>
                  </div>
                  <button onClick={() => setPlayingVideo(exercise.id)} className="p-2 rounded-xl bg-rose/10 text-rose-400 hover:bg-rose/20 transition flex-shrink-0">
                    <Play size={16} fill="currentColor" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Soundscapes */}
      <div>
        <h2 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
          <Music size={14} className="text-purple-400" /> Soundscapes
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
          {SOUNDSCAPES.map((s, i) => (
            <motion.a
              key={s.title}
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(s.search)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-shrink-0 w-[120px] h-[120px] rounded-2xl flex flex-col items-center justify-center gap-2 snap-start group"
              style={{ background: `linear-gradient(180deg, ${s.color}20, ${s.color}08)`, border: `1px solid ${s.color}20` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                <Play size={12} className="text-white ml-0.5" fill="white" />
              </div>
              <span className="text-xs font-body font-medium text-white text-center px-2">{s.title}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Exercise;
