import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FloatingActionButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      className="fab text-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/log')}
      aria-label="Log today's data"
      id="fab-log"
    >
      <Plus size={28} strokeWidth={2.5} />
    </motion.button>
  );
}

export default FloatingActionButton;
