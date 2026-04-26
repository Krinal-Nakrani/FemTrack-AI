import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  PenSquare,
  Calendar,
  BarChart3,
  Activity,
  User,
  LogOut,
  Flower2,
  Dumbbell,
  Clock,
  Stethoscope,
  Heart,
  MessageSquare,
  Bell,
  Shield,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
  { path: '/partner-dashboard', label: 'Partner View', icon: Heart, roles: ['partner'] },
  { path: '/log', label: 'Log', icon: PenSquare, roles: ['user'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, roles: ['user'] },
  { path: '/community', label: 'Community', icon: MessageSquare, roles: ['user'] },
  { path: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['user'] },
  { path: '/exercise', label: 'Exercise', icon: Dumbbell, roles: ['user'] },
  { path: '/insights', label: 'Insights', icon: BarChart3, roles: ['user'] },
  { path: '/pcod-scan', label: 'PCOD Scan', icon: Activity, roles: ['user'] },
  { path: '/passport', label: 'Cycle Passport', icon: Shield, roles: ['user'] },
  { path: '/know-your-options', label: 'Know Options', icon: Package, roles: ['user'] },
  { path: '/history', label: 'History', icon: Clock, roles: ['user'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['user'] },
];

import femtrackDB, { UserProfile } from '@/lib/db';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(setProfile);
      
      const q = query(
        collection(db, 'users', user.uid, 'notifications'),
        where('isRead', '==', false)
      );
      const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
      return () => unsub();
    }
  }, [user]);

  const filteredItems = navItems.filter(item => {
    const userRole = profile?.role || 'user'; // Fallback to 'user' for existing accounts
    return item.roles.includes(userRole);
  });

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 z-30 glass-card rounded-none border-r border-lavender/10 overflow-y-auto"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center shadow-glow-rose"
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Flower2 size={22} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-display font-bold text-white">FemTrack</h1>
            <span className="text-xs text-lavender/70 font-body">AI-Powered Insights</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg bg-white/5 text-lavender/50 hover:text-rose-400 transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose shadow-glow-rose" />
          )}
        </button>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-plum-700/30 border border-lavender/5">
            {/* Avatar with gradient ring */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full gradient-lavender flex items-center justify-center text-white font-semibold text-sm">
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-rose to-lavender bg-clip-border opacity-40 animate-spin-slow" style={{ animationDuration: '8s' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs text-lavender/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 min-tap relative overflow-hidden group',
                isActive
                  ? 'text-white'
                  : 'text-lavender/70 hover:text-white hover:bg-plum-700/30'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,75,138,0.2), rgba(179,157,219,0.1))',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {/* Active gradient bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #C94B8A, #FF6B9D)',
                      boxShadow: '0 0 8px rgba(201,75,138,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    isActive ? 'text-rose-400' : 'group-hover:text-lavender'
                  )}
                />
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 pb-6 space-y-2">
        <ThemeToggle />

        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-lavender/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 min-tap group"
          id="sidebar-signout"
        >
          <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
