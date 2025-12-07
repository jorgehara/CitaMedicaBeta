import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Componente para scale in (crecimiento)
 */
const ScaleIn = ({
  children,
  delay = 0,
  duration = 0.3,
  className = ''
}: ScaleInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
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

export default ScaleIn;
