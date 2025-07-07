import { Skeleton } from '@/components/ui/skeleton';

export function AccountingTableSkeleton() {
  return (
    <div className="flex flex-col h-full animate-in fade-in-0 zoom-in-95 duration-300">
      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg mt-6 h-[calc(100vh-220px)] flex flex-col">
        
        {/* Header fixe */}
        <div className="p-6 border-b border-white/30 bg-white/40 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Onglets */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md ml-1" />
            </div>
            
            {/* Contrôles de droite */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-9 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </div>

        {/* Zone de contenu simplifiée */}
        <div className="flex-1 p-6 space-y-4">
          {/* En-tête simplifié */}
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>

          {/* Lignes simplifiées */}
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer simplifié */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex space-x-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
} 