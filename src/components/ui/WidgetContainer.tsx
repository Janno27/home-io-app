import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function WidgetContainer({ children, className }: WidgetContainerProps) {
  return (
    <div className={cn(
      "backdrop-blur-sm bg-white/10 rounded-lg border border-white/20 shadow-sm hover:bg-white/15 transition-colors",
      className
    )}>
      {children}
    </div>
  );
}