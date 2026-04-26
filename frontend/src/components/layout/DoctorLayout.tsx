import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorBottomNav } from './DoctorBottomNav';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function DoctorLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <DoctorSidebar />
      <main className="lg:ml-[280px] min-h-screen pb-24 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <DoctorBottomNav />
    </div>
  );
}

export default DoctorLayout;
