import { Newspaper } from 'lucide-react';

export function NewsWidget() {
  return (
    <div className="flex items-center space-x-2 p-2 px-3">
      <Newspaper className="w-4 h-4 text-blue-500" />
      <span className="text-sm font-medium text-gray-700">Latest News</span>
    </div>
  );
}