import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Componente para slide in desde diferentes direcciones
 */
const SlideIn = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  className = ''
}: SlideInProps) => {
  const directions = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 50 },
    down: { x: 0, y: -50 }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction]
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0
      }}
      exit={{
        opacity: 0,
        ...directions[direction]
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
