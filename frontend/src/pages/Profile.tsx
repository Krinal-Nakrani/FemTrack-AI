import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, LogOut, Moon, Sun, Shield, Smartphone, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/shared/GlassCard';
import femtrackDB from '@/lib/db';

export function Profile() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(setProfile);
    }
  }, [user]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-display font-bold text-white">Profile</h1>

      {/* User Card */}
      <GlassCard hover={false} padding="lg" className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full gradient-rose flex items-center justify-center text-white text-2xl font-display font-bold mb-4 shadow-glow-rose">
          {user?.displayName?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-display font-semibold text-white">{user?.displayName || 'User'}</h2>
        <p className="text-sm text-lavender/60 font-body flex items-center gap-1 mt-1">
          <Mail size={14} /> {user?.email}
        </p>
      </GlassCard>

      {/* Settings */}
      <GlassCard hover={false} padding="sm">
        <div className="divide-y divide-lavender/10">
          {/* Theme */}
          <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-plum-700/30 transition-colors min-tap" id="toggle-theme">
            {theme === 'dark' ? <Moon size={20} className="text-lavender" /> : <Sun size={20} className="text-yellow-400" />}
            <div className="flex-1 text-left">
              <p className="text-sm font-body font-medium text-white">Theme</p>
              <p className="text-xs text-lavender/50 font-body">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-rose/40' : 'bg-lavender/30'}`}>
              <motion.div className="w-5 h-5 rounded-full bg-white mt-0.5" animate={{ x: theme === 'dark' ? 18 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
            </div>
          </button>

          {/* Notifications */}
          <div className="flex items-center gap-4 px-4 py-4">
            <Bell size={20} className="text-lavender" />
            <div className="flex-1">
              <p className="text-sm font-body font-medium text-white">Notifications</p>
              <p className="text-xs text-lavender/50 font-body">Cycle reminders & predictions</p>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-4 px-4 py-4">
            <Shield size={20} className="text-green-400" />
            <div className="flex-1">
              <p className="text-sm font-body font-medium text-white">Privacy</p>
              <p className="text-xs text-lavender/50 font-body">AES-256 encrypted • Data on device</p>
            </div>
          </div>

          {/* PWA Install */}
          <div className="flex items-center gap-4 px-4 py-4">
            <Smartphone size={20} className="text-lavender" />
            <div className="flex-1">
              <p className="text-sm font-body font-medium text-white">Install App</p>
              <p className="text-xs text-lavender/50 font-body">Add to home screen for offline use</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Cycle Info */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-3">Cycle Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-plum-700/30">
            <p className="text-xs text-lavender/50 font-body">Avg Cycle</p>
            <p className="text-lg font-display font-bold text-white">{profile?.avgCycleLength || 28} days</p>
          </div>
          <div className="p-3 rounded-xl bg-plum-700/30">
            <p className="text-xs text-lavender/50 font-body">Avg Period</p>
            <p className="text-lg font-display font-bold text-white">{profile?.avgPeriodLength || 5} days</p>
          </div>
        </div>
      </GlassCard>

      {/* Sign Out */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={signOut}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-body font-medium text-sm hover:bg-red-500/20 transition-colors min-tap"
        id="profile-signout">
        <LogOut size={18} /> Sign Out
      </motion.button>

      <p className="text-center text-[10px] text-lavender/20 font-body">FemTrack AI v1.0.0</p>
    </div>
  );
}

export default Profile;
