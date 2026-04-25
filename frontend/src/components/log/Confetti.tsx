import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number; x: number; y: number; color: string; size: number; angle: number; speed: number; spin: number;
}

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = ['#C94B8A', '#B39DDB', '#FF6B9D', '#FFD700', '#4ADE80', '#EC4899', '#F97316'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i, x: 50 + (Math.random() - 0.5) * 20, y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        angle: Math.random() * 360, speed: Math.random() * 3 + 2, spin: (Math.random() - 0.5) * 10,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color, left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            y: [0, -200, window.innerHeight], x: [0, (Math.random() - 0.5) * 400],
            rotate: [0, p.spin * 50], opacity: [1, 1, 0],
          }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
