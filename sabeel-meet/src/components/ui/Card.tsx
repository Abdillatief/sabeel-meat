import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7',
};

export function Card({
  children,
  className = '',
  interactive = false,
  onClick,
  padding = 'md',
  ariaLabel,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        onKeyDown={onClick ? handleKeyDown : undefined}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={ariaLabel}
        className={`sabeel-card transition-colors duration-150 hover:border-[#69B6FF]/60 dark:hover:border-[#69B6FF]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F15] ${paddingMap[padding]} ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`sabeel-card ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
