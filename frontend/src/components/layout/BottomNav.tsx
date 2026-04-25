import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PenSquare, Calendar, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/log', label: 'Log', icon: PenSquare },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/insights', label: 'Insights', icon: BarChart3 },
  { path: '/pcod', label: 'PCOD', icon: Activity },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav lg:hidden" id="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
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
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-rose"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={22} />
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
