export function DistributionChartSkeleton() {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg animate-pulse flex flex-col h-[calc(100vh-200px)]">
      {/* Header avec tabs et switch alignés */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        {/* Onglets skeleton */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <div className="px-4 py-2 bg-white rounded-md shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="px-4 py-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        {/* Switch skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-5 w-9 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>

      {/* Distribution items skeleton - Zone scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 pr-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="space-y-2">
              {/* Ligne principale */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-300 h-2 rounded-full"
                  style={{ width: `${Math.random() * 80 + 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 