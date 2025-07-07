import { Cloud, Sun, AlertTriangle } from 'lucide-react';

export function WeatherWidget() {
  return (
    <div className="flex items-center space-x-2 p-2 px-3">
      <Sun className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium text-gray-700">25°C</span>
      <span className="text-xs text-gray-500">Paris</span>
      <AlertTriangle className="w-3 h-3 text-red-500" />
    </div>
  );
}