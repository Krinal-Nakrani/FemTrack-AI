import { motion } from 'framer-motion';
import { Calendar, Droplets, Activity, Clock, ChevronRight } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { formatDate } from '@/lib/utils';

export function History() {
  const { cycleData } = useCycle();

  // Build timeline from cycles and logs
  const timeline = cycleData.cycles
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((cycle, i) => {
      const cycleLogs = cycleData.logs.filter(
        (l) => l.date >= cycle.startDate && (cycle.endDate ? l.date < cycle.endDate : true)
      );
      const symptoms = new Set<string>();
      const moods = new Set<string>();
      cycleLogs.forEach((l) => {
        l.symptoms.forEach((s) => symptoms.add(s));
        if (l.mood) moods.add(l.mood);
      });

      return {
        id: cycle.cycleId,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        length: cycle.length,
        periodLength: cycle.periodLength,
        symptoms: Array.from(symptoms),
        moods: Array.from(moods),
        logCount: cycleLogs.length,
      };
    });

  // If no real data, show sample
  const displayTimeline = timeline.length > 0 ? timeline : [
    { id: 'sample-1', startDate: '2026-03-28', endDate: '2026-04-24', length: 27, periodLength: 5, symptoms: ['cramps', 'fatigue', 'bloating'], moods: ['tired', 'calm'], logCount: 12 },
    { id: 'sample-2', startDate: '2026-02-28', endDate: '2026-03-28', length: 28, periodLength: 4, symptoms: ['headache', 'mood_swings'], moods: ['anxious', 'happy'], logCount: 8 },
    { id: 'sample-3', startDate: '2026-01-30', endDate: '2026-02-28', length: 29, periodLength: 5, symptoms: ['cramps', 'back_pain', 'acne'], moods: ['irritable', 'sad'], logCount: 15 },
    { id: 'sample-4', startDate: '2026-01-02', endDate: '2026-01-30', length: 28, periodLength: 5, symptoms: ['bloating', 'cravings'], moods: ['happy', 'energetic'], logCount: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">History</h1>
          <p className="text-sm text-lavender/60 font-body mt-1">Your cycle timeline</p>
        </div>
        <div className="flex items-center gap-2 text-lavender/50">
          <Clock size={16} />
          <span className="text-sm font-body">{displayTimeline.length} cycles</span>
        </div>
      </div>

      {/* Summary Stats */}
      <GlassCard hover={false} padding="md">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-display font-bold text-white">{cycleData.avgCycleLength}</p>
            <p className="text-[10px] text-lavender/50 font-body">Avg Cycle</p>
          </div>
          <div className="w-px h-8 bg-lavender/10" />
          <div>
            <p className="text-2xl font-display font-bold text-white">{cycleData.avgPeriodLength}</p>
            <p className="text-[10px] text-lavender/50 font-body">Avg Period</p>
          </div>
          <div className="w-px h-8 bg-lavender/10" />
          <div>
            <p className="text-2xl font-display font-bold text-white">{displayTimeline.length}</p>
            <p className="text-[10px] text-lavender/50 font-body">Tracked</p>
          </div>
        </div>
      </GlassCard>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-rose/30 via-lavender/20 to-transparent" />

        <div className="space-y-4">
          {displayTimeline.map((cycle, i) => (
            <motion.div
              key={cycle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: i === 0 ? '#C94B8A' : 'rgba(179,157,219,0.3)',
                  background: i === 0 ? 'rgba(201,75,138,0.2)' : 'rgba(26,10,46,0.8)',
                }}
              >
                {i === 0 && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-rose-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>

              <GlassCard hover padding="md" className="group">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-rose-400" />
                      <span className="text-sm font-semibold text-white font-body">
                        {formatDate(cycle.startDate)}
                      </span>
                      {i === 0 && (
                        <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-rose/15 text-rose-300">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-lavender/50 font-body">
                      {cycle.endDate ? `Ended ${formatDate(cycle.endDate)}` : 'In progress'}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-lavender/30 group-hover:text-lavender/60 transition-colors" />
                </div>

                <div className="flex gap-4 mt-3">
                  {cycle.length && (
                    <div className="flex items-center gap-1">
                      <Activity size={12} className="text-lavender/40" />
                      <span className="text-xs text-lavender/60 font-body">{cycle.length} days</span>
                    </div>
                  )}
                  {cycle.periodLength && (
                    <div className="flex items-center gap-1">
                      <Droplets size={12} className="text-rose-400/60" />
                      <span className="text-xs text-lavender/60 font-body">{cycle.periodLength}d period</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-lavender/60 font-body">{cycle.logCount} logs</span>
                  </div>
                </div>

                {/* Symptoms */}
                {cycle.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {cycle.symptoms.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-body px-2 py-0.5 rounded-full bg-plum-700/50 text-lavender/60"
                      >
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {cycle.symptoms.length > 5 && (
                      <span className="text-[10px] font-body text-lavender/40">
                        +{cycle.symptoms.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default History;
