import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Users, User, Globe } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import type { TransactionFilter as FilterType } from '@/hooks/useAccounting';

const filterOptions = [
  { 
    value: 'all' as FilterType, 
    label: 'Toutes', 
    icon: Globe, 
    description: 'Transactions communes + personnelles' 
  },
  { 
    value: 'common' as FilterType, 
    label: 'Communes', 
    icon: Users, 
    description: 'Transactions visibles par tous' 
  },
  { 
    value: 'personal' as FilterType, 
    label: 'Personnelles', 
    icon: User, 
    description: 'Vos transactions uniquement' 
  },
];

export function TransactionFilter() {
  const { transactionFilter, setFilter, getFilterStats } = useAccounting();
  
  // const currentFilterOption = filterOptions.find(option => option.value === transactionFilter);
  const filterStats = getFilterStats();
  
  const handleFilterChange = async (filter: FilterType) => {
    await setFilter(filter);
  };

  return (
    <div className="relative">
      <Select value={transactionFilter} onValueChange={handleFilterChange}>
        <SelectTrigger className="h-8 px-2 text-sm border-gray-300/50 bg-transparent hover:bg-gray-100/40 rounded-md transition-colors focus:outline-none">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-gray-500" />
            <SelectValue className="text-gray-700" />
          </div>
        </SelectTrigger>
        <SelectContent className="w-72 border-gray-200/60 bg-white/95 backdrop-blur-sm shadow-xl rounded-lg">
          {filterOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              className="py-3.5 px-3 hover:bg-gray-50/80 rounded-md mx-1 my-0.5 transition-colors duration-150"
            >
              <div className="flex items-start space-x-3.5">
                <option.icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">{option.label}</span>
                    <span className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                      {option.value === 'all' && filterStats.all}
                      {option.value === 'common' && filterStats.common}
                      {option.value === 'personal' && filterStats.personal}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{option.description}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 