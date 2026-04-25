import { useState, useEffect, useMemo } from 'react';
import femtrackDB, { type DailyLog, type CycleRecord } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import {
  getCyclePhase,
  daysBetween,
  addDays,
  getDateString,
  type CyclePhase,
} from '@/lib/utils';

export interface CycleData {
  currentDay: number;
  phase: CyclePhase;
  daysUntilNext: number;
  confidenceWindow: number;
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodStart: string | null;
  nextPredicted: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  ovulationDate: string | null;
  cycles: CycleRecord[];
  logs: DailyLog[];
  todayLog: DailyLog | null;
}

export function useCycle() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [cycles, setCycles] = useState<CycleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.uid || 'anonymous';

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userLogs = await femtrackDB.logs
        .where('userId')
        .equals(userId)
        .sortBy('date');
      const userCycles = await femtrackDB.cycles
        .where('userId')
        .equals(userId)
        .sortBy('startDate');

      setLogs(userLogs);
      setCycles(userCycles);
    } catch (error) {
      console.error('Error loading cycle data:', error);
    }
    setLoading(false);
  };

  const cycleData = useMemo((): CycleData => {
    const today = getDateString();
    const todayLog = logs.find((l) => l.date === today) || null;

    // Find the last period start
    const periodLogs = logs
      .filter((l) => l.periodStatus === 'started')
      .sort((a, b) => b.date.localeCompare(a.date));

    const lastPeriodStart = periodLogs.length > 0 ? periodLogs[0].date : null;

    // Calculate averages from cycle records
    const completedCycles = cycles.filter((c) => c.length && c.length > 0);
    const avgCycleLength =
      completedCycles.length > 0
        ? Math.round(
            completedCycles.reduce((sum, c) => sum + (c.length || 28), 0) /
              completedCycles.length
          )
        : 28;

    const avgPeriodLength =
      completedCycles.length > 0
        ? Math.round(
            completedCycles.reduce((sum, c) => sum + (c.periodLength || 5), 0) /
              completedCycles.length
          )
        : 5;

    // Calculate current day
    let currentDay = 1;
    if (lastPeriodStart) {
      currentDay = daysBetween(lastPeriodStart, today) + 1;
    }

    // Determine phase
    const phase = getCyclePhase(currentDay, avgCycleLength);

    // Days until next period
    const daysUntilNext = Math.max(0, avgCycleLength - currentDay);
    const confidenceWindow = Math.min(3, Math.ceil(avgCycleLength * 0.1));

    // Next predicted start
    const nextPredicted = lastPeriodStart
      ? getDateString(addDays(lastPeriodStart, avgCycleLength))
      : null;

    // Fertile window (typically days 10-16 of cycle, centered around ovulation)
    const ovulationDay = Math.floor(avgCycleLength / 2);
    const fertileWindowStart = lastPeriodStart
      ? getDateString(addDays(lastPeriodStart, ovulationDay - 4))
      : null;
    const fertileWindowEnd = lastPeriodStart
      ? getDateString(addDays(lastPeriodStart, ovulationDay + 1))
      : null;
    const ovulationDate = lastPeriodStart
      ? getDateString(addDays(lastPeriodStart, ovulationDay))
      : null;

    return {
      currentDay,
      phase,
      daysUntilNext,
      confidenceWindow,
      avgCycleLength,
      avgPeriodLength,
      lastPeriodStart,
      nextPredicted,
      fertileWindowStart,
      fertileWindowEnd,
      ovulationDate,
      cycles,
      logs,
      todayLog,
    };
  }, [logs, cycles]);

  const saveLog = async (log: Omit<DailyLog, 'id' | 'userId' | 'synced' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const existing = await femtrackDB.logs
      .where('[userId+date]')
      .equals([userId, log.date])
      .first();

    if (existing) {
      await femtrackDB.logs.update(existing.id!, {
        ...log,
        userId,
        synced: false,
        updatedAt: now,
      });
    } else {
      await femtrackDB.logs.add({
        ...log,
        userId,
        synced: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Check if this is a period start — create/update cycle
    if (log.periodStatus === 'started') {
      const existingCycle = await femtrackDB.cycles
        .where('userId')
        .equals(userId)
        .and((c) => c.startDate === log.date)
        .first();

      if (!existingCycle) {
        // Close previous open cycle
        const openCycle = await femtrackDB.cycles
          .where('userId')
          .equals(userId)
          .and((c) => !c.endDate)
          .first();

        if (openCycle) {
          const length = daysBetween(openCycle.startDate, log.date);
          await femtrackDB.cycles.update(openCycle.id!, {
            endDate: log.date,
            length,
            synced: false,
          });
        }

        // Start new cycle
        await femtrackDB.cycles.add({
          cycleId: `cycle-${Date.now()}`,
          userId,
          startDate: log.date,
          endDate: null,
          length: null,
          periodLength: null,
          predictedNext: null,
          synced: false,
        });
      }
    }

    await loadData();
  };

  return { cycleData, loading, saveLog, refreshData: loadData };
}
