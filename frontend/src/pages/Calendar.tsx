import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Droplets, StickyNote, Save, Trash2 } from 'lucide-react';
import { useCycle } from '@/hooks/useCycle';
import { GlassCard } from '@/components/shared/GlassCard';
import { isSameDay, addDays, getDateString } from '@/lib/utils';
import femtrackDB from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function Calendar() {
  const { cycleData, refreshData } = useCycle();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slideDir, setSlideDir] = useState(0);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [markingPeriod, setMarkingPeriod] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Load notes from localStorage
  useEffect(() => {
    const uid = user?.uid || 'anon';
    const stored = localStorage.getItem(`femtrack_cal_notes_${uid}`);
    if (stored) setNotes(JSON.parse(stored));
  }, [user]);

  const saveNote = (date: string, text: string) => {
    const uid = user?.uid || 'anon';
    const updated = { ...notes, [date]: text };
    if (!text) delete updated[date];
    setNotes(updated);
    localStorage.setItem(`femtrack_cal_notes_${uid}`, JSON.stringify(updated));
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: { date: Date; inMonth: boolean }[] = [];
    for (let i = startPad - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), inMonth: false });
    for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), inMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), inMonth: false });
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

  const dayStyles: Record<string, { bg: string; text: string; border: string }> = {
    period: { bg: 'rgba(244,63,94,0.35)', text: 'text-white', border: 'border-rose-400/50' },
    predicted: { bg: 'rgba(179,157,219,0.15)', text: 'text-lavender', border: 'border-lavender/20' },
    fertile: { bg: 'rgba(236,72,153,0.12)', text: 'text-pink-300', border: 'border-pink-400/20' },
    ovulation: { bg: 'rgba(250,204,21,0.2)', text: 'text-yellow-300', border: 'border-yellow-400/30' },
    default: { bg: 'transparent', text: 'text-lavender/70', border: 'border-transparent' },
  };

  const prevMonth = () => { setSlideDir(-1); setCurrentMonth(new Date(year, month - 1, 1)); };
  const nextMonth = () => { setSlideDir(1); setCurrentMonth(new Date(year, month + 1, 1)); };

  const selectedLog = selectedDate ? cycleData.logs.find((l) => l.date === selectedDate) : null;

  const markPeriodDate = async (date: string) => {
    if (!user) return;
    const existing = await femtrackDB.logs.where('[userId+date]').equals([user.uid, date]).first();
    if (existing) {
      const newStatus = existing.periodStatus === 'started' || existing.periodStatus === 'ongoing' ? 'none' : 'started';
      await femtrackDB.logs.update(existing.id!, { periodStatus: newStatus, updatedAt: new Date().toISOString() });
    } else {
      await femtrackDB.logs.add({
        date, userId: user.uid, periodStatus: 'started', flowLevel: 3, symptoms: [], mood: '',
        sleepHours: 0, stressLevel: 0, waterIntake: 0, notes: '', synced: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });
    }
    refreshData();
  };

  const isFuture = (date: Date) => date > today;

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Cycle Calendar</h1>
        <button
          onClick={() => setMarkingPeriod(!markingPeriod)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-body font-medium transition-all ${
            markingPeriod ? 'bg-rose-500/30 text-rose-300 shadow-lg' : 'bg-white/5 text-lavender/50'
          }`}
        >
          <Droplets size={12} /> {markingPeriod ? 'Marking Period...' : 'Mark Period'}
        </button>
      </div>

      {markingPeriod && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <p className="text-rose-300 text-xs font-body">Tap on past dates to mark/unmark period days. Future dates cannot be marked.</p>
        </motion.div>
      )}

      <GlassCard hover={false} padding="md">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender min-tap">
            <ChevronLeft size={20} />
          </button>
          <AnimatePresence mode="wait">
            <motion.div key={`${year}-${month}`} initial={{ opacity: 0, y: slideDir * 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: slideDir * -10 }}
              className="text-center">
              <h2 className="text-lg font-display font-bold text-white">{MONTHS[month]}</h2>
              <p className="text-[10px] text-lavender/40 font-body">{year}</p>
            </motion.div>
          </AnimatePresence>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender min-tap">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-body font-semibold text-lavender/30 py-1 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait">
          <motion.div key={`${year}-${month}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const ds = getDateString(day.date);
              const type = day.inMonth ? getDayType(day.date) : 'default';
              const isToday = isSameDay(day.date, new Date());
              const style = dayStyles[type];
              const hasNote = !!notes[ds];
              const future = isFuture(day.date);

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (!day.inMonth) return;
                    if (markingPeriod && !future) {
                      markPeriodDate(ds);
                    } else {
                      setSelectedDate(ds);
                      setNote(notes[ds] || '');
                    }
                  }}
                  disabled={markingPeriod && future}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-body transition-all min-tap border
                    ${!day.inMonth ? 'opacity-15' : ''} ${style.text} ${style.border}
                    ${selectedDate === ds ? 'ring-2 ring-rose-400 ring-offset-1 ring-offset-plum' : ''}
                    ${future && markingPeriod ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
                  `}
                  style={{ background: style.bg }}
                >
                  <span className={`${isToday ? 'font-bold' : ''}`}>{day.date.getDate()}</span>
                  {isToday && <div className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-rose-400" />}
                  {hasNote && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  {type === 'ovulation' && <span className="absolute -top-1 -right-1 text-[8px]">🥚</span>}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {[
          { color: 'bg-rose-500/50', label: 'Period', emoji: '🩸' },
          { color: 'bg-lavender/30', label: 'Predicted', emoji: '📅' },
          { color: 'bg-pink-400/20', label: 'Fertile', emoji: '💗' },
          { color: 'bg-yellow-400/30', label: 'Ovulation', emoji: '🥚' },
          { color: 'bg-amber-400', label: 'Note', emoji: '📝', small: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`${item.small ? 'w-2 h-2' : 'w-3 h-3'} rounded-full ${item.color}`} />
            <span className="text-[10px] text-lavender/50 font-body">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Cycle Stats */}
      <GlassCard hover={false} padding="sm">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-xl font-display font-bold text-white">{cycleData.avgCycleLength}</p>
            <p className="text-[10px] text-lavender/40 font-body">Avg Cycle</p>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-lavender/15 to-transparent" />
          <div>
            <p className="text-xl font-display font-bold text-white">{cycleData.avgPeriodLength}</p>
            <p className="text-[10px] text-lavender/40 font-body">Avg Period</p>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-lavender/15 to-transparent" />
          <div>
            <p className="text-xl font-display font-bold text-white">Day {cycleData.currentDay}</p>
            <p className="text-[10px] text-lavender/40 font-body">Current</p>
          </div>
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-lavender/15 to-transparent" />
          <div>
            <p className="text-xl font-display font-bold text-rose-400">{cycleData.daysUntilNext}</p>
            <p className="text-[10px] text-lavender/40 font-body">Days Left</p>
          </div>
        </div>
      </GlassCard>

      {/* Date Detail Sheet */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg glass-card rounded-b-none p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-[10px] text-lavender/40 font-body capitalize">{getDayType(new Date(selectedDate + 'T00:00:00'))} phase</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 rounded-xl hover:bg-plum-700/50 text-lavender">
                  <X size={18} />
                </button>
              </div>

              {/* Logged data */}
              {selectedLog ? (
                <div className="space-y-2">
                  {selectedLog.periodStatus !== 'none' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-rose/20 text-rose-300 px-2.5 py-1 rounded-full font-body font-medium">🩸 Period: {selectedLog.periodStatus}</span>
                      {selectedLog.flowLevel > 0 && <span className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-full font-body">Flow: {selectedLog.flowLevel}/5</span>}
                    </div>
                  )}
                  {selectedLog.symptoms.length > 0 && (
                    <div>
                      <p className="text-[10px] text-lavender/40 font-body mb-1">Symptoms</p>
                      <div className="flex flex-wrap gap-1">{selectedLog.symptoms.map((s) => <span key={s} className="text-[10px] bg-plum-700/50 text-lavender/70 px-2 py-0.5 rounded-full font-body">{s}</span>)}</div>
                    </div>
                  )}
                  {selectedLog.mood && <p className="text-xs text-lavender/60 font-body">Mood: <span className="text-white">{selectedLog.mood}</span></p>}
                  {selectedLog.notes && <p className="text-xs text-lavender/50 font-body italic">"{selectedLog.notes}"</p>}
                </div>
              ) : (
                <p className="text-xs text-lavender/30 font-body">No health data logged for this day.</p>
              )}

              {/* Note section */}
              <div>
                <p className="text-[10px] text-lavender/40 font-body mb-1 flex items-center gap-1"><StickyNote size={10} /> Personal Note</p>
                <div className="flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for this date..."
                    className="flex-1 px-3 py-2 rounded-lg bg-plum-700/50 border border-lavender/10 text-white font-body text-xs placeholder-lavender/30 focus:outline-none focus:border-purple-400/40"
                  />
                  <button onClick={() => { saveNote(selectedDate, note); }} className="px-3 py-2 rounded-lg bg-purple-600/30 text-purple-300 text-xs">
                    <Save size={14} />
                  </button>
                  {notes[selectedDate] && (
                    <button onClick={() => { saveNote(selectedDate, ''); setNote(''); }} className="px-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Calendar;
