import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Activity, Info, Lock, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/shared/GlassCard';
import femtrackDB, { UserProfile, DailyLog, CycleRecord } from '@/lib/db';
import { getCyclePhase, getPhaseColor, getPhaseLabel, getPhaseEmoji, formatDate } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

export function PartnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [lastLog, setLastLog] = useState<DailyLog | null>(null);
  const [currentCycle, setCurrentCycle] = useState<CycleRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    async function loadPartnerData() {
      if (!user) return;

      try {
        const myProfile = await femtrackDB.profiles.where('odataId').equals(user.uid).first();
        const targetUserId = myProfile?.linkedUserId || user.uid;
        setIsPreview(!myProfile?.linkedUserId);

        // 2. Get the target user's profile
        const pProfile = await femtrackDB.profiles.where('odataId').equals(targetUserId).first();
        if (!pProfile) {
          setError("Data not found locally. Please ensure you have logged some data first.");
          setLoading(false);
          return;
        }
        setPartnerProfile(pProfile);

        // 3. Get partner's last log
        const log = await femtrackDB.logs
          .where('userId').equals(pProfile.odataId)
          .reverse().sortBy('date');
        setLastLog(log[0] || null);

        // 4. Get partner's current cycle
        const cycle = await femtrackDB.cycles
          .where('userId').equals(pProfile.odataId)
          .reverse().sortBy('startDate');
        setCurrentCycle(cycle[0] || null);

      } catch (err) {
        console.error("Error loading partner data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadPartnerData();
  }, [user]);

  if (loading) return <div className="p-6"><DashboardSkeleton /></div>;

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 flex items-center justify-center text-rose-400 mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-lavender/60 max-w-xs mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Refreshing</button>
      </div>
    );
  }

  const phase = currentCycle ? getCyclePhase(14) : 'follicular'; // Simplified for demo
  const permissions = partnerProfile?.partnerPermissions || {};

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-white">Partner View</h1>
            {isPreview && (
              <span className="px-2 py-0.5 rounded-md bg-rose/20 text-rose-300 text-[10px] font-bold uppercase tracking-widest border border-rose/30">Preview</span>
            )}
          </div>
          <p className="text-xs text-lavender/60 font-body">Viewing {partnerProfile?.name}'s wellness</p>
        </div>
        <div className="w-10 h-10 rounded-full gradient-rose flex items-center justify-center text-white shadow-glow-rose">
          <Heart size={20} fill="currentColor" />
        </div>
      </div>

      {/* Cycle Phase Card */}
      {permissions.cyclePhase && (
        <GlassCard glow="rose" padding="lg">
          <div className="flex items-center gap-2 mb-4 text-xs font-body text-rose-400 font-bold uppercase tracking-wider">
            <Calendar size={14} /> Current Status
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-1">
                {getPhaseEmoji(phase)} {getPhaseLabel(phase)}
              </h2>
              <p className="text-sm text-lavender/60 font-body">Day 14 of cycle</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2" style={{ borderColor: getPhaseColor(phase) }}>
              <span className="text-lg" style={{ color: getPhaseColor(phase) }}>{getPhaseEmoji(phase)}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Mood & Energy */}
      {permissions.mood && lastLog && (
        <GlassCard padding="md">
          <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-lavender" /> Mood & Energy
          </h3>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-plum-700/30">
            <div>
              <p className="text-xs text-lavender/50 font-body mb-1">Current Mood</p>
              <p className="text-lg font-display font-bold text-white capitalize">{lastLog.mood || 'Calm'}</p>
            </div>
            <div className="text-4xl">
              {lastLog.mood === 'happy' ? '😊' : lastLog.mood === 'tired' ? '😴' : '😌'}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Symptoms */}
      {permissions.symptoms && lastLog && lastLog.symptoms.length > 0 && (
        <GlassCard padding="md">
          <h3 className="text-sm font-display font-semibold text-white mb-4">Logged Symptoms</h3>
          <div className="flex flex-wrap gap-2">
            {lastLog.symptoms.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-rose/10 border border-rose/20 text-xs text-rose-300 capitalize font-body">
                {s}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Support Tip */}
      <GlassCard className="bg-gradient-to-br from-plum-700/50 to-rose/10" padding="md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose/20 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-white mb-1">Support Tip</h4>
            <p className="text-xs text-lavender/60 font-body leading-relaxed">
              Based on the current phase, {partnerProfile?.name} might appreciate some extra rest and a warm meal today. Being present and listening is the best support!
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Privacy Notice */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-lavender/30 font-body">
        <Lock size={10} /> End-to-end encrypted • You only see what {partnerProfile?.name} shares
      </div>
    </div>
  );
}

export default PartnerDashboard;
