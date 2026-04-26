import { motion } from 'framer-motion';
import { Calendar, Droplets, Activity, Clock, ChevronRight, FileText, Smile, Stethoscope } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { formatDate } from '@/lib/utils';

export function History() {
  const { cycleData } = useCycle();

  // Build cycle timeline
  const cycleTimeline = cycleData.cycles
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((cycle) => {
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
        id: cycle.cycleId, startDate: cycle.startDate, endDate: cycle.endDate,
        length: cycle.length, periodLength: cycle.periodLength,
        symptoms: Array.from(symptoms), moods: Array.from(moods), logCount: cycleLogs.length,
      };
    });

  // Build daily log timeline (last 30 entries)
  const recentLogs = [...cycleData.logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  const hasCycles = cycleTimeline.length > 0;
  const hasLogs = recentLogs.length > 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">History</h1>
          <p className="text-sm text-lavender/60 font-body mt-1">Your complete health timeline</p>
        </div>
        <div className="flex items-center gap-2 text-lavender/50">
          <Clock size={16} />
          <span className="text-sm font-body">{recentLogs.length} entries</span>
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
            <p className="text-2xl font-display font-bold text-white">{recentLogs.length}</p>
            <p className="text-[10px] text-lavender/50 font-body">Days Logged</p>
          </div>
          <div className="w-px h-8 bg-lavender/10" />
          <div>
            <p className="text-2xl font-display font-bold text-white">{cycleTimeline.length}</p>
            <p className="text-[10px] text-lavender/50 font-body">Cycles</p>
          </div>
        </div>
      </GlassCard>

      {/* Cycles Section */}
      {hasCycles && (
        <div>
          <h2 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
            <Droplets size={14} className="text-rose-400" /> Cycle Records
          </h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-rose/30 via-lavender/20 to-transparent" />
            <div className="space-y-3">
              {cycleTimeline.map((cycle, i) => (
                <motion.div key={cycle.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative pl-14">
                  <div className="absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: i === 0 ? '#C94B8A' : 'rgba(179,157,219,0.3)', background: i === 0 ? 'rgba(201,75,138,0.2)' : 'rgba(26,10,46,0.8)' }}>
                    {i === 0 && <motion.div className="w-2 h-2 rounded-full bg-rose-400" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
                  </div>
                  <GlassCard hover padding="md" className="group">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={13} className="text-rose-400" />
                          <span className="text-sm font-semibold text-white font-body">{formatDate(cycle.startDate)}</span>
                          {i === 0 && <span className="text-[10px] font-body px-2 py-0.5 rounded-full bg-rose/15 text-rose-300">Current</span>}
                        </div>
                        <p className="text-xs text-lavender/50 font-body">{cycle.endDate ? `Ended ${formatDate(cycle.endDate)}` : 'In progress'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      {cycle.length && <div className="flex items-center gap-1"><Activity size={11} className="text-lavender/40" /><span className="text-xs text-lavender/60 font-body">{cycle.length}d cycle</span></div>}
                      {cycle.periodLength && <div className="flex items-center gap-1"><Droplets size={11} className="text-rose-400/60" /><span className="text-xs text-lavender/60 font-body">{cycle.periodLength}d period</span></div>}
                      <div className="flex items-center gap-1"><span className="text-xs text-lavender/60 font-body">{cycle.logCount} logs</span></div>
                    </div>
                    {cycle.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cycle.symptoms.slice(0, 5).map((s) => (
                          <span key={s} className="text-[10px] font-body px-2 py-0.5 rounded-full bg-plum-700/50 text-lavender/60">{s.replace(/_/g, ' ')}</span>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily Log Timeline */}
      <div>
        <h2 className="text-sm font-display font-semibold text-white mb-3 flex items-center gap-2">
          <FileText size={14} className="text-purple-400" /> Daily Log History
        </h2>

        {!hasLogs ? (
          <GlassCard hover={false} padding="lg">
            <div className="text-center py-6">
              <p className="text-3xl mb-3">📝</p>
              <p className="text-white font-body font-medium text-sm">No logs yet</p>
              <p className="text-lavender/40 font-body text-xs mt-1">Start logging your symptoms, mood, and flow to see your history here</p>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log, i) => {
              const isPeriod = log.periodStatus === 'started' || log.periodStatus === 'ongoing';
              return (
                <motion.div key={log.date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <GlassCard hover padding="sm" className={isPeriod ? 'border-l-2 border-l-rose-400' : ''}>
                    <div className="flex items-center gap-3">
                      {/* Date bubble */}
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isPeriod ? 'bg-rose/15' : 'bg-white/5'}`}>
                        <span className="text-[10px] text-lavender/40 font-body leading-none">
                          {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-white leading-none">
                          {new Date(log.date + 'T00:00:00').getDate()}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isPeriod && <span className="text-[10px] bg-rose/20 text-rose-300 px-1.5 py-0.5 rounded-full font-body">🩸 {log.periodStatus}</span>}
                          {log.flowLevel > 0 && <span className="text-[10px] text-blue-300 font-body">Flow: {log.flowLevel}/5</span>}
                          {log.mood && <span className="text-[10px] text-lavender/50 font-body flex items-center gap-0.5"><Smile size={9} /> {log.mood}</span>}
                        </div>
                        {log.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {log.symptoms.slice(0, 4).map((s) => (
                              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full bg-plum-700/40 text-lavender/50 font-body">{s.replace(/_/g, ' ')}</span>
                            ))}
                            {log.symptoms.length > 4 && <span className="text-[9px] text-lavender/30 font-body">+{log.symptoms.length - 4}</span>}
                          </div>
                        )}
                        {log.notes && <p className="text-[10px] text-lavender/40 font-body italic mt-0.5 truncate">"{log.notes}"</p>}
                      </div>

                      {/* Right stats */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {log.sleepHours > 0 && <span className="text-[9px] text-lavender/30 font-body">😴 {log.sleepHours}h</span>}
                        {log.waterIntake > 0 && <span className="text-[9px] text-lavender/30 font-body">💧 {log.waterIntake}L</span>}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
