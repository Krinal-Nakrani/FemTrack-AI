import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PenSquare, Calendar, BarChart3, Dumbbell, Heart, User, Activity, Clock, MessageSquare, MoreHorizontal, X, Stethoscope, Shield, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import femtrackDB, { UserProfile } from '@/lib/db';
import { useEffect, useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['user'] },
  { path: '/partner-dashboard', label: 'Home', icon: Heart, roles: ['partner'] },
  { path: '/community', label: 'Community', icon: MessageSquare, roles: ['user'] },
  { path: '/pcod-scan', label: 'PCOD', icon: Activity, roles: ['user'] },
  { path: '/history', label: 'History', icon: Clock, roles: ['user'] },
  { path: '/profile', label: 'Profile', icon: User, roles: ['user', 'partner'] },
];

const moreItems = [
  { path: '/log', label: 'Log Activity', icon: PenSquare, roles: ['user'] },
  { path: '/calendar', label: 'Calendar', icon: Calendar, roles: ['user'] },
  { path: '/doctors', label: 'Browse Doctors', icon: Stethoscope, roles: ['user'] },
  { path: '/exercise', label: 'Exercise', icon: Dumbbell, roles: ['user'] },
  { path: '/insights', label: 'Cycle Insights', icon: BarChart3, roles: ['user'] },
  { path: '/passport', label: 'Cycle Passport', icon: Shield, roles: ['user'] },
  { path: '/know-your-options', label: 'Know Options', icon: Package, roles: ['user'] },
];

export function BottomNav() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => setProfile(p || null));
    }
  }, [user]);

  const userRole = profile?.role || 'user';
  const filteredPrimary = navItems.filter(item => item.roles.includes(userRole)).slice(0, 4);
  const filteredMore = moreItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <nav className="bottom-nav lg:hidden z-40" id="bottom-nav">
        <div className="flex items-center justify-around px-2 py-2">
          {filteredPrimary.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setShowMore(false)}
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
                        boxShadow: '0 0- 10px rgba(201,75,138,0.5)',
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

          {/* More Toggle */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-tap relative',
              showMore ? 'text-rose-400' : 'text-lavender/50'
            )}
          >
            <motion.div animate={showMore ? { rotate: 90 } : { rotate: 0 }}>
              <MoreHorizontal size={22} />
            </motion.div>
            <span className="text-[10px] font-medium font-body">More</span>
          </button>

          {/* Profile (Always visible) */}
          <NavLink
            to="/profile"
            onClick={() => setShowMore(false)}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-tap relative',
                isActive ? 'text-rose-400' : 'text-lavender/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <User size={22} />
                <span className="text-[10px] font-medium font-body">Profile</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* More Drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-20 left-4 right-4 z-50 lg:hidden"
            >
              <div className="glass-card p-6 rounded-3xl border border-lavender/10 shadow-2xl overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-display font-bold text-white">All Features</h3>
                  <button 
                    onClick={() => setShowMore(false)}
                    className="p-2 rounded-full bg-white/5 text-lavender/50"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {filteredMore.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-rose/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-plum-700/50 flex items-center justify-center text-lavender group-hover:text-rose-400 transition-colors">
                        <item.icon size={20} />
                      </div>
                      <span className="text-[10px] text-center font-medium text-lavender/70 group-hover:text-white">{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex justify-center">
                   <p className="text-[10px] text-lavender/30 font-body uppercase tracking-widest">FemTrack AI Ecosystem</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default BottomNav;
