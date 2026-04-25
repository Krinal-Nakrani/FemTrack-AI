import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { isSameDay, addDays, getDateString } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const { cycleData } = useCycle();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slideDir, setSlideDir] = useState(0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: { date: Date; inMonth: boolean }[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), inMonth: false });
    }
    return days;
  }, [year, month]);

  const getDayType = (date: Date): string => {
    const ds = getDateString(date);
    const log = cycleData.logs.find((l) => l.date === ds);
    if (log && (log.periodStatus === 'started' || log.periodStatus === 'ongoing')) return 'period';

    const { lastPeriodStart, avgCycleLength } = cycleData;
    if (lastPeriodStart) {
      const nextStart = addDays(lastPeriodStart, avgCycleLength);
      const nextEnd = addDays(nextStart, cycleData.avgPeriodLength);
      if (date >= nextStart && date <= nextEnd) return 'predicted';

      const ovDay = Math.floor(avgCycleLength / 2);
      const fertStart = addDays(lastPeriodStart, ovDay - 4);
      const fertEnd = addDays(lastPeriodStart, ovDay + 1);
      const ovDate = addDays(lastPeriodStart, ovDay);

      if (isSameDay(date, ovDate)) return 'ovulation';
      if (date >= fertStart && date <= fertEnd) return 'fertile';
    }
    return 'default';
  };

  const dayColors: Record<string, string> = {
    period: 'bg-rose-500 text-white',
    predicted: 'bg-lavender/30 text-lavender border border-lavender/30',
    fertile: 'bg-pink-400/20 text-pink-300 border border-pink-400/30',
    ovulation: 'bg-yellow-400/30 text-yellow-300 border border-yellow-400/40',
    default: 'text-lavender/70 hover:bg-plum-700/40',
  };

  const prevMonth = () => { setSlideDir(-1); setCurrentMonth(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setSlideDir(1); setCurrentMonth(new Date(year, month + 1, 1)); };

  const selectedLog = selectedDate ? cycleData.logs.find((l) => l.date === selectedDate) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Calendar</h1>

      <GlassCard hover={false} padding="md">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender min-tap" id="cal-prev">
            <ChevronLeft size={20} />
          </button>
          <AnimatePresence mode="wait">
            <motion.h2 key={`${year}-${month}`} initial={{ opacity: 0, x: slideDir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: slideDir * -30 }}
              className="text-lg font-display font-semibold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </motion.h2>
          </AnimatePresence>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender min-tap" id="cal-next">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-body font-medium text-lavender/40 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait">
          <motion.div key={`${year}-${month}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const ds = getDateString(day.date);
              const type = day.inMonth ? getDayType(day.date) : 'default';
              const isToday = isSameDay(day.date, new Date());
              return (
                <motion.button key={i} whileTap={{ scale: 0.9 }}
                  onClick={() => day.inMonth && setSelectedDate(ds)}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-body transition-all min-tap
                    ${!day.inMonth ? 'opacity-20' : ''} ${dayColors[type]}
                    ${selectedDate === ds ? 'ring-2 ring-rose-400' : ''}`}
                  id={`cal-day-${ds}`}>
                  {day.date.getDate()}
                  {isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-400" />}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-2">
        {[
          { color: 'bg-rose-500', label: 'Period' },
          { color: 'bg-lavender/40', label: 'Predicted' },
          { color: 'bg-pink-400/30', label: 'Fertile' },
          { color: 'bg-yellow-400/40', label: 'Ovulation' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-xs text-lavender/50 font-body">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Cycle summary */}
      <GlassCard hover={false} padding="sm">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-lg font-display font-bold text-white">{cycleData.avgCycleLength}</p>
            <p className="text-[10px] text-lavender/50 font-body">Avg Cycle</p>
          </div>
          <div className="w-px h-8 bg-lavender/10" />
          <div>
            <p className="text-lg font-display font-bold text-white">{cycleData.avgPeriodLength}</p>
            <p className="text-[10px] text-lavender/50 font-body">Avg Period</p>
          </div>
          <div className="w-px h-8 bg-lavender/10" />
          <div>
            <p className="text-lg font-display font-bold text-white">±3</p>
            <p className="text-[10px] text-lavender/50 font-body">Variation</p>
          </div>
        </div>
      </GlassCard>

      {/* Bottom sheet drawer */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setSelectedDate(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg glass-card rounded-b-none p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <button onClick={() => setSelectedDate(null)} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender min-tap">
                  <X size={18} />
                </button>
              </div>
              {selectedLog ? (
                <div className="space-y-3">
                  {selectedLog.periodStatus !== 'none' && <div className="flex items-center gap-2"><span className="text-xs bg-rose/20 text-rose-300 px-2 py-1 rounded-full font-body">Period: {selectedLog.periodStatus}</span></div>}
                  {selectedLog.flowLevel > 0 && <p className="text-sm text-lavender/70 font-body">Flow: Level {selectedLog.flowLevel}</p>}
                  {selectedLog.symptoms.length > 0 && <div><p className="text-xs text-lavender/50 font-body mb-1">Symptoms:</p><div className="flex flex-wrap gap-1">{selectedLog.symptoms.map((s) => <span key={s} className="text-xs bg-plum-700/50 text-lavender/80 px-2 py-1 rounded-full font-body">{s}</span>)}</div></div>}
                  {selectedLog.mood && <p className="text-sm text-lavender/70 font-body">Mood: {selectedLog.mood}</p>}
                  {selectedLog.notes && <p className="text-sm text-lavender/60 font-body italic">"{selectedLog.notes}"</p>}
                </div>
              ) : (
                <p className="text-sm text-lavender/40 font-body">No data logged for this day.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;
