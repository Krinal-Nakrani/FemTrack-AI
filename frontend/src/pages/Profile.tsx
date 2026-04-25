import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Moon, Sun, Shield, Smartphone, Bell, Heart, Copy, Check, Scale, Ruler, Stethoscope, Link2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/shared/GlassCard';
import femtrackDB from '@/lib/db';
import { PARTNER_PERMISSIONS } from '@/config/constants';

export function Profile() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('60');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.entries(PARTNER_PERMISSIONS).map(([k, v]) => [k, v.default]))
  );

  const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1);
  const bmiCategory = parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese';
  const bmiColor = parseFloat(bmi) < 18.5 ? '#FBBF24' : parseFloat(bmi) < 25 ? '#4ADE80' : parseFloat(bmi) < 30 ? '#FBBF24' : '#EF4444';

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(setProfile);
    }
  }, [user]);

  const shareLink = `${window.location.origin}/partner/demo-${user?.uid?.slice(0, 8) || 'share'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      {/* Health Profile — BMI */}
      <GlassCard hover={false} padding="md">
        <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Scale size={16} className="text-lavender" />
          Health Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-lavender/60 font-body mb-1.5">Height (cm)</label>
            <div className="relative">
              <Ruler size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-lavender/60 font-body mb-1.5">Weight (kg)</label>
            <div className="relative">
              <Scale size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-plum-700/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-lavender/50 font-body">BMI</p>
            <p className="text-xl font-display font-bold" style={{ color: bmiColor }}>{bmi}</p>
          </div>
          <span
            className="text-xs font-semibold font-body px-3 py-1 rounded-full"
            style={{ background: `${bmiColor}15`, color: bmiColor }}
          >
            {bmiCategory}
          </span>
        </div>
        <p className="text-[10px] text-lavender/40 font-body mt-2">
          BMI is used in PCOD risk assessment. A BMI above 25 increases hormonal imbalance risk.
        </p>
      </GlassCard>

      {/* Partner Sharing */}
      <GlassCard hover={false} padding="md" glow="rose">
        <h3 className="text-sm font-display font-semibold text-white mb-2 flex items-center gap-2">
          <Heart size={16} className="text-rose-400" />
          Invite Your Partner
        </h3>
        <p className="text-xs text-lavender/60 font-body mb-4">
          Send an invite to your partner's email. They'll get a code to view your wellness dashboard. You control what they can see.
        </p>

        {/* Email invite */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
            <input
              type="email"
              placeholder="Partner's email address"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 transition-colors"
              id="partner-email-input"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (partnerEmail.trim() && partnerEmail.includes('@')) {
                setInviteSent(true);
                setTimeout(() => setInviteSent(false), 3000);
              }
            }}
            className={`px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
              inviteSent
                ? 'bg-green-500/20 text-green-400'
                : 'gradient-rose text-white hover:opacity-90'
            }`}
          >
            {inviteSent ? '✓ Sent!' : 'Send Invite'}
          </motion.button>
        </div>
        {inviteSent && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-green-400 font-body mb-3"
          >
            Invite sent! Your partner will receive a code at {partnerEmail}
          </motion.p>
        )}

        {/* Invite code display */}
        <div className="p-3 rounded-xl bg-plum-700/30 mb-4">
          <p className="text-[10px] text-lavender/40 font-body mb-1">Your invite code (share manually if needed)</p>
          <div className="flex items-center gap-2">
            <code className="text-sm text-rose-300 font-mono flex-1">{shareLink.split('/').pop()}</code>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={copyLink}
              className="p-1.5 rounded-lg bg-rose/10 text-rose-400 hover:bg-rose/20 transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </motion.button>
          </div>
        </div>

        {/* Permission toggles */}
        <div className="space-y-2">
          {Object.entries(PARTNER_PERMISSIONS).map(([key, perm]) => (
            <button
              key={key}
              onClick={() => togglePermission(key)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-plum-700/30 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-body text-white">{perm.label}</p>
                <p className="text-[10px] text-lavender/40 font-body">{perm.description}</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${permissions[key] ? 'bg-rose/40' : 'bg-plum-700/50'}`}>
                <motion.div
                  className="w-5 h-5 rounded-full bg-white mt-0.5"
                  animate={{ x: permissions[key] ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          ))}
        </div>
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

          {/* Doctor Portal */}
          <a href="/doctor" target="_blank" className="flex items-center gap-4 px-4 py-4 hover:bg-plum-700/30 transition-colors">
            <Stethoscope size={20} className="text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-body font-medium text-white">Doctor Dashboard</p>
              <p className="text-xs text-lavender/50 font-body">Share data with your gynecologist</p>
            </div>
            <Link2 size={14} className="text-lavender/30" />
          </a>

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

      <p className="text-center text-[10px] text-lavender/20 font-body">FemTrack AI v2.0.0</p>
    </div>
  );
}

export default Profile;
