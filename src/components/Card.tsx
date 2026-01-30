import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ children, className = '', hover = false, onClick, style }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : undefined}
      onClick={onClick}
      style={style}
      className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
