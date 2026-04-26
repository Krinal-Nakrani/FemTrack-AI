import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Moon, Sun, Shield, Smartphone, Bell, Heart, Copy, Check, Scale, Ruler, Stethoscope, Link2, Users, Baby, Users2, Activity, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/shared/GlassCard';
import femtrackDB, { UserProfile } from '@/lib/db';
import { PARTNER_PERMISSIONS } from '@/config/constants';
import { generateInviteCode } from '@/lib/utils';
import { db } from '@/config/firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('60');
  
  // Invitation State (Partner only)
  const [invite, setInvite] = useState({ email: '', sent: false, code: '' });

  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const bmi = (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1);
  const bmiCategory = parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese';
  const bmiColor = parseFloat(bmi) < 18.5 ? '#FBBF24' : parseFloat(bmi) < 25 ? '#4ADE80' : parseFloat(bmi) < 30 ? '#FBBF24' : '#EF4444';

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(async (p: UserProfile | undefined) => {
        if (p) {
          setProfile(p);
          setPermissions(p.partnerPermissions || 
            Object.fromEntries(Object.entries(PARTNER_PERMISSIONS).map(([k, v]) => [k, v.default]))
          );
          
          // Load active partner invite from Firestore
          try {
            const q = query(collection(db, 'invitations'), 
              where('senderUid', '==', user.uid),
              where('type', '==', 'partner')
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const data = querySnapshot.docs[0].data();
              setInvite({
                email: data.recipientEmail,
                sent: true,
                code: data.code
              });
            }
          } catch (err) {
            console.error("Error loading invite:", err);
          }
        }
      });
    }
  }, [user]);

  const handleSendInvite = async () => {
    if (!user || !profile || !invite.email.includes('@')) return;
    
    // 1. Generate NEW unique code
    const newCode = generateInviteCode();

    try {
      // 2. Save to Firestore (Centralized)
      await setDoc(doc(db, 'invitations', newCode), {
        code: newCode,
        senderUid: user.uid,
        senderName: user.displayName || 'User',
        recipientEmail: invite.email,
        type: 'partner',
        createdAt: new Date().toISOString(),
      });

      // 3. Trigger backend email send
      await fetch(`http://localhost:8000/api/send-invite?email=${invite.email}&code=${newCode}&sender_name=${user.displayName || 'A friend'}`, {
        method: 'POST'
      });
      
      setInvite(prev => ({ ...prev, sent: true, code: newCode }));
      
      setTimeout(() => {
        setInvite(prev => ({ ...prev, sent: false }));
      }, 5000);

    } catch (err) {
      console.error('Invitation failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2.5 rounded-xl bg-plum-700/30 text-lavender/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-display font-bold text-white">Profile</h1>
      </div>

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
                disabled={profile?.role === 'partner'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-colors disabled:opacity-50"
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
                disabled={profile?.role === 'partner'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white font-body text-sm focus:outline-none focus:border-rose/50 transition-colors disabled:opacity-50"
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

      {/* Partner Invitation */}
      {(!profile?.role || profile?.role === 'user') && (
        <div className="space-y-4">
          <h2 className="text-sm font-display font-bold text-white px-1 mt-4">Partner Sharing</h2>
          
          <GlassCard padding="md" className="bg-rose/5" glow="rose">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs font-body text-rose-400 font-bold uppercase tracking-wider">
                <Heart size={16} /> Invite Your Partner
              </div>
              {invite.code && (
                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-lavender/60 font-mono tracking-wider">ACTIVE: {invite.code}</span>
              )}
            </div>

            <p className="text-xs text-lavender/60 font-body mb-6 leading-relaxed">
              Send an invite to your partner's email. They'll get a secure code to view your wellness dashboard.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-lavender/40" />
                <input
                  type="email"
                  placeholder="Partner's email address"
                  value={invite.email}
                  onChange={(e) => setInvite(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-plum-700/50 border border-lavender/10 text-white placeholder-lavender/30 font-body text-sm focus:outline-none focus:border-rose/50 transition-colors"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSendInvite}
                disabled={invite.sent || !invite.email.includes('@')}
                className={`px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all ${
                  invite.sent ? 'bg-green-500/20 text-green-400' : 'gradient-rose text-white'
                } disabled:opacity-30`}
              >
                {invite.sent ? '✓ Sent' : 'Invite'}
              </motion.button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Global Permissions */}
      {(!profile?.role || profile?.role === 'user') && (
        <GlassCard padding="md" glow="lavender">
          <div className="flex items-center gap-2 mb-4 text-xs font-body text-lavender font-bold uppercase tracking-wider">
            <Shield size={14} /> Sharing Permissions
          </div>
          <div className="space-y-1">
            {Object.entries(PARTNER_PERMISSIONS).map(([key, perm]) => (
              <button
                key={key}
                onClick={() => {
                  const newPerms = { ...permissions, [key]: !permissions[key] };
                  setPermissions(newPerms);
                  femtrackDB.profiles.update(profile!.id!, { partnerPermissions: newPerms });
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-body text-white">{perm.label}</p>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors ${permissions[key] ? 'bg-rose/40' : 'bg-plum-700/50'}`}>
                  <motion.div
                    className="w-3.5 h-3.5 rounded-full bg-white mt-0.5"
                    animate={{ x: permissions[key] ? 20 : 2 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

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
