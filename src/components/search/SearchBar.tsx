import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <div className={`flex items-center space-x-2 p-2 backdrop-blur-sm bg-white/20 rounded-full transition-all duration-200 ${
        isFocused 
          ? 'border-2 border-blue-400/60 ring-1 ring-blue-400/20' 
          : 'border border-white/30'
      }`}>
        <Search className="w-5 h-5 text-gray-500 ml-2" />
        <Input
          placeholder="Search DuckDuckGo..."
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Button size="sm" className="rounded-full">
          Search
        </Button>
      </div>
    </div>
  );
}