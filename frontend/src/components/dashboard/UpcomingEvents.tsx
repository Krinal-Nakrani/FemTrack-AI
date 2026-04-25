import { motion } from 'framer-motion';
import { CalendarDays, Flower2, Sun } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

interface UpcomingEventsProps {
  nextPeriod: string | null;
  fertileStart: string | null;
  fertileEnd: string | null;
  ovulationDate: string | null;
}

export function UpcomingEvents({
  nextPeriod,
  fertileStart,
  fertileEnd,
  ovulationDate,
}: UpcomingEventsProps) {
  const events = [
    {
      icon: CalendarDays,
      label: 'Next Period',
      date: nextPeriod,
      color: '#C94B8A',
      bg: 'rgba(201, 75, 138, 0.15)',
    },
    {
      icon: Flower2,
      label: 'Fertile Window',
      date: fertileStart && fertileEnd
        ? `${formatDateShort(fertileStart)} – ${formatDateShort(fertileEnd)}`
        : null,
      color: '#FF6B9D',
      bg: 'rgba(255, 107, 157, 0.15)',
    },
    {
      icon: Sun,
      label: 'Ovulation',
      date: ovulationDate,
      color: '#FFD700',
      bg: 'rgba(255, 215, 0, 0.15)',
    },
  ].filter((e) => e.date);

  return (
    <div className="space-y-2">
      <h3 className="text-xs text-lavender/60 font-body uppercase tracking-wider px-1">
        Upcoming Events
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {events.map((event, i) => (
          <motion.div
            key={event.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.5 }}
            className="flex-shrink-0 flex items-center gap-3 glass-card px-4 py-3 min-w-[200px]"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: event.bg }}
            >
              <event.icon size={20} style={{ color: event.color }} />
            </div>
            <div>
              <p className="text-xs text-lavender/60 font-body">{event.label}</p>
              <p className="text-sm font-semibold text-white font-body">
                {typeof event.date === 'string' && event.date.includes('–')
                  ? event.date
                  : event.date
                  ? formatDateShort(event.date as string)
                  : '—'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingEvents;
