import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'chart';
}

export function SkeletonLoader({ className, variant = 'card' }: SkeletonLoaderProps) {
  const variants = {
    card: 'h-40 w-full rounded-2xl',
    text: 'h-4 w-3/4 rounded-lg',
    circle: 'h-20 w-20 rounded-full',
    chart: 'h-64 w-full rounded-2xl',
  };

  return (
    <div className={cn('skeleton', variants[variant], className)} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circle" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <SkeletonLoader variant="text" className="w-48" />
          <SkeletonLoader variant="text" className="w-32 h-3" />
        </div>
      </div>
      <SkeletonLoader variant="card" className="h-48" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonLoader variant="card" className="h-32" />
        <SkeletonLoader variant="card" className="h-32" />
      </div>
      <SkeletonLoader variant="card" className="h-24" />
      <SkeletonLoader variant="card" className="h-24" />
    </div>
  );
}

export default SkeletonLoader;
