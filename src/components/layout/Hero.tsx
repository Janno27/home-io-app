import { Clock } from '@/components/clock/Clock';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickLinks } from '@/components/quick-links/QuickLinks';
import { MiniTimer } from '@/components/timer';
import { TaskWidget } from '@/components/tasks';

interface HeroProps {
  onOpenTimer: () => void;
}

export function Hero({ onOpenTimer }: HeroProps) {
  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-20 min-h-0">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <MiniTimer onClick={onOpenTimer} />
            </div>
            <Clock />
          </div>
          
          <div className="w-full max-w-xl mx-auto">
            <SearchBar />
          </div>
          
          <div className="w-full max-w-lg mx-auto">
            <QuickLinks />
          </div>
        </div>
      </main>
      
      {/* TaskWidget en bas à gauche */}
      <TaskWidget showTrigger={true} />
    </>
  );
}