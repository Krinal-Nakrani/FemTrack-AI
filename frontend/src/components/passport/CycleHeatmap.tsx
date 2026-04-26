import { motion } from 'framer-motion';

interface CycleHeatmapProps {
  periodDates: string[];
  cycleLengths?: number[];
}

export function CycleHeatmap({ periodDates }: CycleHeatmapProps) {
  // Build 6-month grid (26 weeks × 7 days)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - 6);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Align to Sunday

  const periodSet = new Set(periodDates);
  const weeks: { date: Date; dateStr: string; isPeriod: boolean; isFuture: boolean }[][] = [];
  const current = new Date(startDate);

  while (current <= today || weeks.length < 26) {
    const week: typeof weeks[0] = [];
    for (let d = 0; d < 7; d++) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${day}`;
      week.push({
        date: new Date(current),
        dateStr: ds,
        isPeriod: periodSet.has(ds),
        isFuture: current > today,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    if (weeks.length >= 26) break;
  }

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: week[0].date.toLocaleDateString('en', { month: 'short' }), col: i });
      lastMonth = m;
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 ml-6">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[9px] text-lavender/40 font-body absolute"
            style={{ left: `${m.col * 14 + 24}px` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0.5 mt-5 relative">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((label, i) => (
            <span key={i} className="text-[8px] text-lavender/30 font-body h-[10px] flex items-center">{label}</span>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => (
              <motion.div
                key={day.dateStr}
                className="w-[10px] h-[10px] rounded-[2px] cursor-default"
                style={{
                  background: day.isFuture
                    ? 'rgba(179,157,219,0.05)'
                    : day.isPeriod
                      ? '#E879A0'
                      : 'rgba(179,157,219,0.08)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.002 }}
                title={`${day.dateStr}${day.isPeriod ? ' — Period' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 ml-6">
        <div className="flex items-center gap-1.5">
          <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: 'rgba(179,157,219,0.08)' }} />
          <span className="text-[9px] text-lavender/40 font-body">No period</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[10px] h-[10px] rounded-[2px]" style={{ background: '#E879A0' }} />
          <span className="text-[9px] text-lavender/40 font-body">Period day</span>
        </div>
      </div>
    </div>
  );
}
