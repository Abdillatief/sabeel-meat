import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0.45 }}
      animate={{ opacity: [0.45, 0.85, 0.45] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-[12px] bg-[#E8EFF6] dark:bg-white/[0.06] ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  const { t } = useApp();
  return (
    <div className="space-y-6" role="status" aria-label={t.common.loading}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="sabeel-card p-5 space-y-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 sabeel-card p-6 space-y-4">
          <Skeleton className="h-6 w-44" />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-[14px]" />
          ))}
        </div>
        <div className="lg:col-span-4 sabeel-card p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function PageLoadingSkeleton() {
  const { t } = useApp();
  return (
    <div className="space-y-6" role="status" aria-label={t.common.loading}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="sabeel-card p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
