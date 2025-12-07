import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

/**
 * Contenedor para animar children en cascada
 */
const StaggerChildren = ({
  children,
  staggerDelay = 0.1,
  className = ''
}: StaggerChildrenProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Item individual para usar dentro de StaggerChildren
 */
export const StaggerItem = ({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string
}) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      variants={item}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default StaggerChildren;
