import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#69B6FF] hover:bg-[#53AAFA] text-[#0B0F15] font-semibold shadow-[0_1px_2px_rgba(11,15,21,0.08)]',
  secondary:
    'bg-white dark:bg-[#18202D] hover:bg-[#F1F5F9] dark:hover:bg-[#202A3A] text-[#0B0F15] dark:text-slate-100 border border-[#E3EAF2] dark:border-white/10 font-medium',
  ghost:
    'bg-transparent hover:bg-[#EEF4F9] dark:hover:bg-white/6 text-slate-600 dark:text-slate-300 hover:text-[#0B0F15] dark:hover:text-white font-medium',
  danger:
    'bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold shadow-[0_1px_2px_rgba(220,38,38,0.2)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3.5 py-2 text-xs rounded-[10px] gap-1.5',
  md: 'min-h-[40px] px-4 py-2.5 text-sm rounded-[12px] gap-2',
  lg: 'min-h-[44px] px-5 py-3 text-sm rounded-[12px] gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0B0F15] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children}
    </motion.button>
  );
}
