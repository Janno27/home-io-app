import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function BalanceCardSkeleton() {
  return (
    <Card className="p-6 bg-white backdrop-blur-sm border border-white/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Balance */}
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-16 mx-auto" />
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>

        {/* Revenus */}
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-16 mx-auto" />
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>

        {/* Dépenses */}
        <div className="text-center space-y-2">
          <Skeleton className="h-4 w-16 mx-auto" />
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>
    </Card>
  );
} 