import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Filter, Globe, Users, User } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import type { TransactionFilter as FilterType } from '@/hooks/useAccounting';

export function TransactionFilterPopover() {
  const { transactionFilter, setFilter } = useAccounting();

  const handleChange = async (value: string) => {
    if (!value) return;
    await setFilter(value as FilterType);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/30 rounded-full"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <ToggleGroup
          type="single"
          value={transactionFilter}
          onValueChange={handleChange}
          className="gap-1"
        >
          <ToggleGroupItem value="all" aria-label="Toutes les transactions" size="sm">
            <Globe className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="common" aria-label="Communes" size="sm">
            <Users className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="personal" aria-label="Personnelles" size="sm">
            <User className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  );
} 