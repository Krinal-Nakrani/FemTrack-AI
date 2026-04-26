import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home, PenSquare, Calendar, BarChart3, Dumbbell, Heart, User, Activity, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import femtrackDB, { UserProfile } from '@/lib/db';
import { useEffect, useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
  { path: '/partner-dashboard', label: 'Home', icon: Heart, roles: ['partner'] },
  { path: '/community', label: 'Community', icon: MessageSquare, roles: ['user'] },
  { path: '/pcod', label: 'PCOD', icon: Activity, roles: ['user'] },
  { path: '/history', label: 'History', icon: Clock, roles: ['user'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['user', 'partner'] },
];

export function BottomNav() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => setProfile(p || null));
    }
  }, [user]);

  const filteredItems = navItems.filter(item => {
    const userRole = profile?.role || 'user'; // Fallback to 'user' for existing accounts
    return item.roles.includes(userRole);
  });
  return (
    <nav className="bottom-nav lg:hidden" id="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-tap relative',
                isActive
                  ? 'text-rose-400'
                  : 'text-lavender/50 hover:text-lavender/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #C94B8A, #FF6B9D)',
                      boxShadow: '0 0 10px rgba(201,75,138,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <item.icon size={22} />
                </motion.div>
                <span className="text-[10px] font-medium font-body">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNav;
