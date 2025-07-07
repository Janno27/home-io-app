import { Skeleton } from '@/components/ui/skeleton';

export function MonthlyChartSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg relative flex flex-col h-[calc(100vh-485px)]">
      {/* CTA discret en haut à droite */}
      <div className="absolute top-4 right-4">
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="flex-1 min-h-[240px] flex items-center justify-center">
        {/* Graphique simplifié */}
        <div className="w-full h-full flex items-end justify-center space-x-2 pb-8">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <Skeleton 
                className="w-4 bg-gray-200" 
                style={{ height: `${Math.random() * 120 + 40}px` }}
              />
              <Skeleton className="h-2 w-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 