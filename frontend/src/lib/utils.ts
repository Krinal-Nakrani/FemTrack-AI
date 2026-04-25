import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date | string, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export function getCyclePhase(dayOfCycle: number, cycleLength: number = 28): CyclePhase {
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= Math.floor(cycleLength * 0.5) - 2) return 'follicular';
  if (dayOfCycle <= Math.floor(cycleLength * 0.5) + 1) return 'ovulation';
  return 'luteal';
}

export function getPhaseColor(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual': return '#C94B8A';
    case 'follicular': return '#B39DDB';
    case 'ovulation': return '#FFD700';
    case 'luteal': return '#FF6B9D';
  }
}

export function getPhaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual': return 'Menstrual Phase';
    case 'follicular': return 'Follicular Phase';
    case 'ovulation': return 'Ovulation Window';
    case 'luteal': return 'Luteal Phase';
  }
}

export function getPhaseEmoji(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual': return '🌺';
    case 'follicular': return '🌱';
    case 'ovulation': return '🌸';
    case 'luteal': return '🌙';
  }
}

export function getPhaseInsight(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Rest is your superpower right now. Stay hydrated, eat iron-rich foods, and be gentle with yourself. Light yoga or walking can help ease cramps.';
    case 'follicular':
      return 'Your energy is rising! This is a great time to start new projects, try challenging workouts, and socialize. Estrogen is boosting your mood and creativity.';
    case 'ovulation':
      return "You're at your peak energy and confidence! Great time for important meetings, dates, or intense workouts. Your skin may be glowing too ✨";
    case 'luteal':
      return 'Time to slow down and nurture yourself. You might crave comfort foods — opt for complex carbs and magnesium-rich snacks. Journaling can help process emotions.';
  }
}
