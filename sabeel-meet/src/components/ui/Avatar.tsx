import { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  initials: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-7 h-7 text-[11px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function Avatar({ src, name, initials, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0 bg-[#EEF4F9] dark:bg-[#18202D] border border-[#E3EAF2] dark:border-white/10 ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${sizeMap[size]} rounded-full shrink-0 flex items-center justify-center font-display font-semibold bg-[#E8F3FF] dark:bg-[#69B6FF]/15 text-[#0B0F15] dark:text-[#69B6FF] border border-[#69B6FF]/25 ${className}`}
    >
      {initials}
    </div>
  );
}
