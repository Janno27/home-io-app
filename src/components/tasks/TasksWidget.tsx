import { CheckCircle } from 'lucide-react';

export function TasksWidget() {
  return (
    <div className="flex items-center space-x-2 p-2 px-3">
      <CheckCircle className="w-4 h-4 text-green-500" />
      <span className="text-sm font-medium text-gray-700">2 tasks</span>
    </div>
  );
}