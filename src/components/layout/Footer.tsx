import { WidgetContainer } from '@/components/ui/WidgetContainer';
import { TasksWidget } from '@/components/tasks/TasksWidget';
import { NewsWidget } from '@/components/news/NewsWidget';

export function Footer() {
  return (
    <footer className="flex-shrink-0 w-full px-6 py-4 backdrop-blur-sm bg-white/5 border-t border-white/10">
      <div className="flex items-center justify-between">
        <WidgetContainer>
          <TasksWidget />
        </WidgetContainer>
        
        <WidgetContainer>
          <div className="text-xs text-gray-500">
            {new Date().getFullYear()} Browser Home
          </div>
        </WidgetContainer>
        
        <WidgetContainer>
          <NewsWidget />
        </WidgetContainer>
      </div>
    </footer>
  );
}