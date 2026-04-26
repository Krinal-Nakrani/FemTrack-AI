import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCycle } from '@/hooks/useCycle';
import { getGreeting, getPhaseLabel, getPhaseEmoji, getPhaseColor } from '@/lib/utils';
import { ParticleBackground } from '@/components/dashboard/ParticleBackground';
import { CycleStatusCard } from '@/components/dashboard/CycleStatusCard';
import { WellnessRing } from '@/components/dashboard/WellnessRing';
import { PCODMeter } from '@/components/dashboard/PCODMeter';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { InsightOfDay } from '@/components/dashboard/InsightOfDay';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

import { MessageSquare, CheckCircle, Users, Activity, Dumbbell, Shield, Calendar, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';
import { useNavigate } from 'react-router-dom';
import femtrackDB from '@/lib/db';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const { user } = useAuth();
  const { cycleData, loading } = useCycle();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => {
        if (p?.role === 'partner') navigate('/partner-dashboard', { replace: true });
      });
    }
  }, [user, navigate]);

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const phaseColor = getPhaseColor(cycleData.phase);
  const pcodHistory = JSON.parse(localStorage.getItem('femtrack_pcod_scans') || '[]');
  const pcodScore = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_score : 25;
  const pcodLevel = pcodHistory.length > 0 ? pcodHistory[pcodHistory.length - 1].pcod_risk_level : 'low';

  const todayLog = cycleData.todayLog;
  let loggedCount = 0;
  const totalCategories = 5;
  if (todayLog) {
    if (todayLog.flowLevel > 0) loggedCount++;
    if (todayLog.symptoms.length > 0) loggedCount++;
    if (todayLog.mood) loggedCount++;
    if (todayLog.sleepHours > 0 || todayLog.stressLevel > 0) loggedCount++;
    if (todayLog.notes) loggedCount++;
  }

  if (loading) {
    return (<div className="relative"><ParticleBackground /><div className="relative z-10"><DashboardSkeleton /></div></div>);
  }

  return (
    <div className="relative pb-20">
      <ParticleBackground />

      <div className="relative z-10 space-y-6">
        {/* Hero Greeting */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
              {getGreeting()}, {firstName} 🌸
            </h1>
            <p className="text-sm text-lavender/60 font-body mt-1">Here's your wellness overview</p>
          </div>
          <motion.div
            className="px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer"
            style={{ background: `${phaseColor}15`, border: `1px solid ${phaseColor}30` }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/calendar')}
          >
            <span className="text-sm">{getPhaseEmoji(cycleData.phase)}</span>
            <span className="text-xs font-body font-medium" style={{ color: phaseColor }}>{getPhaseLabel(cycleData.phase)}</span>
          </motion.div>
        </motion.div>

        {/* Cycle Ring */}
        <CycleStatusCard
          currentDay={cycleData.currentDay}
          phase={cycleData.phase}
          daysUntilNext={cycleData.daysUntilNext}
          confidenceWindow={cycleData.confidenceWindow}
          avgCycleLength={cycleData.avgCycleLength}
        />

        {/* Wellness + PCOD */}
        <div className="grid grid-cols-2 gap-4">
          <WellnessRing logged={loggedCount} total={totalCategories} />
          <PCODMeter score={pcodScore} riskLevel={pcodLevel} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Activity, label: 'PCOD Scan', path: '/pcod-scan', color: '#EF4444' },
            { icon: Dumbbell, label: 'Exercise', path: '/exercise', color: '#4ADE80' },
            { icon: Shield, label: 'Passport', path: '/passport', color: '#60A5FA' },
            { icon: Calendar, label: 'Calendar', path: '/calendar', color: '#A78BFA' },
          ].map((action) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="glass-card p-3 flex flex-col items-center gap-2 hover:border-lavender/20 transition-all group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}15` }}>
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-[10px] text-lavender/60 font-body font-medium group-hover:text-white transition">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Upcoming Events */}
        <UpcomingEvents
          nextPeriod={cycleData.nextPredicted}
          fertileStart={cycleData.fertileWindowStart}
          fertileEnd={cycleData.fertileWindowEnd}
          ovulationDate={cycleData.ovulationDate}
        />

        {/* AI Insight */}
        <InsightOfDay phase={cycleData.phase} />

        {/* Community */}
        <section>
          <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="text-rose-400" size={18} /> Community & Support
          </h2>
          <GlassCard padding="md" className="bg-gradient-to-br from-rose/5 to-plum-700/30 cursor-pointer group" onClick={() => navigate('/community')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-display font-semibold text-white mb-1">Have a health question?</h3>
                <p className="text-xs text-lavender/50 font-body">Ask anonymously or get advice from verified doctors</p>
                <div className="flex gap-3 mt-2">
                  <span className="flex items-center gap-1 text-[10px] text-lavender/40 font-body"><CheckCircle size={10} className="text-teal-400" /> 10+ Doctors</span>
                  <span className="flex items-center gap-1 text-[10px] text-lavender/40 font-body"><Users size={10} className="text-rose-400" /> 2K+ Members</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-rose/10 text-rose-400 group-hover:bg-rose/20 transition">
                <ArrowRight size={18} />
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
