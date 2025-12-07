import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Componente para fade in simple
 */
const FadeIn = ({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}: FadeInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut'
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
