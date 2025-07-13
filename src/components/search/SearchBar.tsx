import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const searchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
];

export function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEngine, setSearchEngine] = useState(searchEngines[0]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      const url = searchEngine.url + encodeURIComponent(searchTerm);
      window.open(url, '_blank');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className={`flex items-center space-x-2 p-2 backdrop-blur-sm bg-white/20 rounded-full transition-all duration-200 ${
        isFocused 
          ? 'border-2 border-blue-400/60 ring-1 ring-blue-400/20' 
          : 'border border-white/30'
      }`}>
        <Search className="w-5 h-5 text-gray-500 ml-2" />
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-auto rounded-full" onClick={() => setIsPopoverOpen(true)}>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1">
            {searchEngines.map((engine) => (
              <Button
                key={engine.name}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setSearchEngine(engine);
                  setIsPopoverOpen(false);
                }}
              >
                {engine.name}
              </Button>
            ))}
          </PopoverContent>
        </Popover>

        <Input
          placeholder={`Search ${searchEngine.name}...`}
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="sm" className="rounded-full" onClick={handleSearch}>
          Search
        </Button>
      </div>
    </div>
  );
}