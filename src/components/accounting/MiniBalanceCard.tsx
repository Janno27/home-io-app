import { PiggyBank, TrendingDown, TrendingUp, PlusCircle, Globe, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { TransactionFilter as FilterType } from '@/hooks/useAccounting';

interface MiniBalanceCardProps {
  balance: number;
  totalRevenues: number;
  totalExpenses: number;
  formatAmount: (amount: number) => string;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  filter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
}

export function MiniBalanceCard({
  balance,
  totalRevenues,
  totalExpenses,
  formatAmount,
  onOpenExpenseModal,
  onOpenIncomeModal,
  filter,
  onFilterChange,
}: MiniBalanceCardProps) {
  const handleFilterChange = (value: string) => {
    if (value && onFilterChange) {
      onFilterChange(value as FilterType);
    }
  };

  return (
    <Card className="w-64 p-2 rounded-lg shadow-sm bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm border border-white/20 dark:border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between p-1 pb-0 space-y-0">
        <CardTitle className="text-xs font-medium">Balance Actuelle</CardTitle>
        {filter && onFilterChange && (
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={handleFilterChange}
            className="gap-0.5"
          >
            <ToggleGroupItem value="all" aria-label="Toutes les transactions" className="p-1 h-6 w-6 rounded-md">
              <Globe className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="common" aria-label="Communes" className="p-1 h-6 w-6 rounded-md">
              <Users className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="personal" aria-label="Personnelles" className="p-1 h-6 w-6 rounded-md">
              <User className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </CardHeader>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        {/* Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Balance</span>
          </div>
          <span className={`text-sm font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(balance)}
          </span>
        </div>

        <div className="w-full h-px bg-gray-200/70 my-1" />

        {/* Revenus */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-gray-500">Revenus</span>
          </div>
          <span className="font-light text-gray-700">
            {formatAmount(totalRevenues)}
          </span>
        </div>

        {/* Dépenses */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-gray-500">Dépenses</span>
          </div>
          <span className="font-light text-gray-700">
            {formatAmount(totalExpenses)}
          </span>
        </div>
      </div>
      
      {/* Footer CTAs */}
      {(onOpenExpenseModal || onOpenIncomeModal) && (
        <div className="p-1.5 border-t border-gray-200/60 dark:border-gray-700/60 grid grid-cols-2 gap-1.5">
          {onOpenIncomeModal && (
            <Button
              variant="ghost" 
              size="sm"
              onClick={onOpenIncomeModal}
              className="text-[11px] text-green-700 hover:bg-green-500/10 hover:text-green-800 h-7 rounded-md"
            >
              <PlusCircle className="w-3 h-3 mr-1" />
              Revenu
            </Button>
          )}
          {onOpenExpenseModal && (
            <Button
              variant="ghost" 
              size="sm"
              onClick={onOpenExpenseModal}
              className="text-[11px] text-red-700 hover:bg-red-500/10 hover:text-red-800 h-7 rounded-md"
            >
              <PlusCircle className="w-3 h-3 mr-1" />
              Dépense
            </Button>
          )}
        </div>
      )}
    </Card>
  );
} 