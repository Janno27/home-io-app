import { Skeleton } from '@/components/ui/skeleton';

export function TransactionsTableSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg h-[calc(100vh-200px)] flex flex-col overflow-hidden relative">
      {/* En-tête du tableau */}
      <div className="grid grid-cols-3 gap-0 bg-gray-50/60 border-b border-gray-200/60">
        <div className="px-3 py-2.5 border-r border-gray-200/40">
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="px-3 py-2.5 border-r border-gray-200/40">
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="px-3 py-2.5">
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>

      {/* Contenu du tableau */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-0">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="grid grid-cols-3 gap-0 border-b border-gray-200/30 py-2.5">
              <div className="px-3 border-r border-gray-200/30 flex items-center">
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="px-3 border-r border-gray-200/30 flex items-center">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <div className="px-3 flex items-center justify-end">
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-gray-200/60 bg-gray-50/40">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
} 