import { TrendingUp, Bitcoin } from 'lucide-react';

export function StockWidget() {
  return (
    <div className="flex items-center space-x-2 p-2 px-3">
      <Bitcoin className="w-4 h-4 text-orange-500" />
      <span className="text-sm font-medium text-gray-700">$108,890</span>
      <span className="text-xs text-red-500 flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        +5.3%
      </span>
    </div>
  );
}