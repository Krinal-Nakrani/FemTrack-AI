import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, HelpCircle, Bell, User, BarChart3, LogOut, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const navItems = [
  { path: '/doctor-dashboard', label: 'Overview', icon: Home, end: true },
  { path: '/doctor-dashboard/queries', label: 'All Queries', icon: HelpCircle },
  { path: '/doctor-dashboard/notifications', label: 'Notifications', icon: Bell },
  { path: '/doctor-dashboard/profile', label: 'My Profile', icon: User },
  { path: '/doctor-dashboard/insights', label: 'Patient Insights', icon: BarChart3 },
];

export function DoctorSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'doctors', user.uid, 'notifications'),
      where('isRead', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    });
    return () => unsub();
  }, [user]);

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 z-30 glass-card rounded-none border-r border-teal/10 overflow-y-auto"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <motion.div
          className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-glow-teal"
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Stethoscope size={22} className="text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg font-display font-bold text-white">FemTrack</h1>
          <span className="text-xs text-teal-400/70 font-body">Doctor Portal</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-plum-700/30 border border-teal/10">
            <div className="w-9 h-9 rounded-full gradient-teal flex items-center justify-center text-white font-semibold text-sm">
              {user.displayName?.[0]?.toUpperCase() || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName || 'Doctor'}</p>
              <p className="text-xs text-lavender/60 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 relative overflow-hidden group',
                isActive
                  ? 'text-white'
                  : 'text-lavender/70 hover:text-white hover:bg-plum-700/30'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="doctor-sidebar-active-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(13,148,136,0.2), rgba(20,184,166,0.1))',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="doctor-sidebar-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #0D9488, #14B8A6)',
                      boxShadow: '0 0 8px rgba(13,148,136,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    isActive ? 'text-teal-400' : 'group-hover:text-lavender'
                  )}
                />
                <span className="relative z-10">{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto px-1.5 py-0.5 rounded-full bg-rose text-white text-[10px] font-bold min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 pb-6 space-y-2">
        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-lavender/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default DoctorSidebar;
