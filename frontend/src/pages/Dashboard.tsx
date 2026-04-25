import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import { getGreeting } from '@/lib/utils';
import { ParticleBackground } from '@/components/dashboard/ParticleBackground';
import { CycleStatusCard } from '@/components/dashboard/CycleStatusCard';
import { WellnessRing } from '@/components/dashboard/WellnessRing';
import { PCODMeter } from '@/components/dashboard/PCODMeter';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { InsightOfDay } from '@/components/dashboard/InsightOfDay';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

export function Dashboard() {
  const { user } = useAuth();
  const { cycleData, loading } = useCycle();

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // Calculate how many categories were logged today
  const todayLog = cycleData.todayLog;
  let loggedCount = 0;
  const totalCategories = 5; // flow, symptoms, mood, lifestyle, notes
  if (todayLog) {
    if (todayLog.flowLevel > 0) loggedCount++;
    if (todayLog.symptoms.length > 0) loggedCount++;
    if (todayLog.mood) loggedCount++;
    if (todayLog.sleepHours > 0 || todayLog.stressLevel > 0) loggedCount++;
    if (todayLog.notes) loggedCount++;
  }

  if (loading) {
    return (
      <div className="relative">
        <ParticleBackground />
        <div className="relative z-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ParticleBackground />

      <div className="relative z-10 space-y-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {getGreeting()}, {firstName} 🌸
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-1">
              Here's your cycle overview
            </p>
          </div>
        </motion.div>

        {/* Cycle Status — large prominent card */}
        <CycleStatusCard
          currentDay={cycleData.currentDay}
          phase={cycleData.phase}
          daysUntilNext={cycleData.daysUntilNext}
          confidenceWindow={cycleData.confidenceWindow}
          avgCycleLength={cycleData.avgCycleLength}
        />

        {/* Wellness Ring + PCOD Meter */}
        <div className="grid grid-cols-2 gap-4">
          <WellnessRing logged={loggedCount} total={totalCategories} />
          <PCODMeter score={25} riskLevel="low" />
        </div>

        {/* Upcoming Events */}
        <UpcomingEvents
          nextPeriod={cycleData.nextPredicted}
          fertileStart={cycleData.fertileWindowStart}
          fertileEnd={cycleData.fertileWindowEnd}
          ovulationDate={cycleData.ovulationDate}
        />

        {/* Insight of the Day */}
        <InsightOfDay phase={cycleData.phase} />
      </div>
    </div>
  );
}

export default Dashboard;
