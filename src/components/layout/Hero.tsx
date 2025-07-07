import { Clock } from '@/components/clock/Clock';
import { SearchBar } from '@/components/search/SearchBar';
import { QuickLinks } from '@/components/quick-links/QuickLinks';

export function Hero() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <Clock />
        </div>
        
        <div className="w-full max-w-xl mx-auto">
          <SearchBar />
        </div>
        
        <div className="w-full max-w-2xl mx-auto">
          <QuickLinks />
        </div>
      </div>
    </main>
  );
}