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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/log', label: 'Log', icon: PenSquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/pcod', label: 'PCOD Risk', icon: Activity },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="hidden lg:flex flex-col w-[280px] h-screen fixed left-0 top-0 z-30 glass-card rounded-none border-r border-lavender/10"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-8 pb-6">
        <div className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center">
          <Flower2 size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white">FemTrack</h1>
          <span className="text-xs text-lavender/70 font-body">AI-Powered Insights</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-plum-700/30">
            <div className="w-9 h-9 rounded-full gradient-lavender flex items-center justify-center text-white font-semibold text-sm">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
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
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 min-tap',
                isActive
                  ? 'bg-rose/20 text-rose-400 shadow-glow-rose/20'
                  : 'text-lavender/70 hover:text-white hover:bg-plum-700/30'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-rose-400' : ''} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
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
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-lavender/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 min-tap"
          id="sidebar-signout"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
