import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: 'rose' | 'lavender' | 'coral' | 'none';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function GlassCard({
  children,
  className,
  glow = 'none',
  hover = true,
  padding = 'md',
  ...props
}: GlassCardProps) {
  const glowClasses = {
    rose: 'shadow-glow-rose',
    lavender: 'shadow-glow-lavender',
    coral: 'shadow-glow-coral',
    none: '',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-card',
        paddingClasses[padding],
        glowClasses[glow],
        hover && 'cursor-pointer transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
