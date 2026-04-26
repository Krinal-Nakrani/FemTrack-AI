import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Home, HelpCircle, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const navItems = [
  { path: '/doctor-dashboard', label: 'Home', icon: Home, end: true },
  { path: '/doctor-dashboard/queries', label: 'Queries', icon: HelpCircle },
  { path: '/doctor-dashboard/notifications', label: 'Alerts', icon: Bell },
  { path: '/doctor-dashboard/profile', label: 'Profile', icon: User },
];

export function DoctorBottomNav() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'doctors', user.uid, 'notifications'),
      where('isRead', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return () => unsub();
  }, [user]);

  return (
    <nav className="bottom-nav lg:hidden" style={{ borderTopColor: 'rgba(13,148,136,0.15)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative',
                isActive ? 'text-teal-400' : 'text-lavender/50 hover:text-lavender/80'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="doctor-bottom-nav-indicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #0D9488, #14B8A6)',
                      boxShadow: '0 0 10px rgba(13,148,136,0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <motion.div animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                    <item.icon size={22} />
                  </motion.div>
                  {item.label === 'Alerts' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 px-1 min-w-[14px] h-[14px] rounded-full bg-rose text-white text-[8px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium font-body">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default DoctorBottomNav;
