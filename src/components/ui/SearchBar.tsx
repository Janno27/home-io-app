import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = "Rechercher...", className = "" }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus l'input quand la barre s'étend
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded) {
      // Fermer la barre
      setIsExpanded(false);
      setSearchQuery('');
      onSearch?.('');
    } else {
      // Ouvrir la barre
      setIsExpanded(true);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setSearchQuery('');
      onSearch?.('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton loupe - visible seulement quand fermé */}
      {!isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-full p-1.5 relative z-10"
        >
          <Search className="w-4 h-4" />
        </Button>
      )}

      {/* Barre de recherche animée */}
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden transition-all duration-300 ease-out ${
        isExpanded 
          ? 'w-64 opacity-100' 
          : 'w-8 opacity-0'
      }`}>
        <div className={`flex items-center h-8 backdrop-blur-sm bg-white/90 rounded-full border transition-all duration-200 shadow-sm ${
          isFocused 
            ? 'border-blue-400/60 ring-1 ring-blue-400/20 shadow-md' 
            : 'border-gray-200/60'
        }`}>
          <Search className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-700 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2 py-1 text-sm h-6"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-1 mr-1 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
} 