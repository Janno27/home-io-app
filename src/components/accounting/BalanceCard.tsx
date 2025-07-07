import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface BalanceCardProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  showComparison: boolean;
  onComparisonToggle: (show: boolean) => void;
  balance: number;
  totalRevenues: number;
  totalExpenses: number;
  currentYearBalanceUpToMonth?: number;
  currentYearRevenuesUpToMonth?: number;
  currentYearExpensesUpToMonth?: number;
  balanceChange?: number;
  revenueChange?: number;
  expenseChange?: number;
  formatAmountDetailed: (amount: number) => string;
  onOpenAccountingTable?: () => void;
}

export function BalanceCard({
  selectedYear,
  onYearChange,
  showComparison,
  onComparisonToggle,
  balance,
  totalRevenues,
  totalExpenses,
  currentYearBalanceUpToMonth = 0,
  currentYearRevenuesUpToMonth = 0,
  currentYearExpensesUpToMonth = 0,
  balanceChange = 0,
  revenueChange = 0,
  expenseChange = 0,
  formatAmountDetailed,
  onOpenAccountingTable,
}: BalanceCardProps) {
  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageColor = (percentage: number, isExpense = false) => {
    if (isExpense) {
      return percentage > 0 ? 'text-red-500' : 'text-green-500';
    } else {
      return percentage >= 0 ? 'text-green-500' : 'text-red-500';
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg relative">
      {/* Header avec Balance et sélecteur d'année alignés */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-sm font-medium text-gray-600">
            Balance {selectedYear}
          </h2>
          
          {/* Toggle de comparaison */}
          <div className="flex items-center space-x-2">
            <Switch
              id="comparison-mode"
              checked={showComparison}
              onCheckedChange={onComparisonToggle}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label 
              htmlFor="comparison-mode" 
              className="text-xs text-gray-600 cursor-pointer"
            >
              Comparaison
            </Label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onYearChange(selectedYear - 1)}
            className="text-gray-600 hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-1.5 text-gray-700 px-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium text-sm min-w-[3rem] text-center">{selectedYear}</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onYearChange(selectedYear + 1)}
            disabled={selectedYear >= new Date().getFullYear()}
            className="text-gray-600 hover:bg-white/20 p-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Contenu principal aligné à gauche */}
      <div className="flex items-start space-x-6">
        {/* Valeur de balance */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-light text-gray-800">
            {formatAmountDetailed(showComparison ? currentYearBalanceUpToMonth : balance)}
          </div>
          {showComparison && (
            <div className={`text-xs font-medium ${getPercentageColor(balanceChange)} transition-all duration-300 ease-in-out transform ${showComparison ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
              {formatPercentage(balanceChange)} vs {selectedYear - 1}
            </div>
          )}
        </div>
        
        {/* Séparateur */}
        <div className="w-px h-8 bg-gray-300/50"></div>
        
        {/* Revenus */}
        <div className="flex flex-col">
          <h3 className="text-gray-600 font-medium text-xs text-left">Revenus</h3>
          <div className="flex items-center space-x-2">
            <div className="text-base font-light text-gray-800">
              {formatAmountDetailed(showComparison ? currentYearRevenuesUpToMonth : totalRevenues)}
            </div>
            {showComparison && (
              <div className={`text-xs font-medium ${getPercentageColor(revenueChange)} transition-all duration-300 ease-in-out transform ${showComparison ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                {formatPercentage(revenueChange)}
              </div>
            )}
          </div>
        </div>
        
        {/* Dépenses */}
        <div className="flex flex-col">
          <h3 className="text-gray-600 font-medium text-xs text-left">Dépenses</h3>
          <div className="flex items-center space-x-2">
            <div className="text-base font-light text-gray-800">
              {formatAmountDetailed(showComparison ? currentYearExpensesUpToMonth : totalExpenses)}
            </div>
            {showComparison && (
              <div className={`text-xs font-medium ${getPercentageColor(expenseChange, true)} transition-all duration-300 ease-in-out transform ${showComparison ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                {formatPercentage(expenseChange)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA discret sous le contenu principal */}
      <div className="mt-4">
        <Button
          variant="ghost" 
          onClick={onOpenAccountingTable}
          className="group flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600 transition-all duration-200 p-0 h-6"
        >
          <span className="group-hover:translate-x-1 transition-transform duration-200">Accéder au tableau détaillé</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
        </Button>
      </div>
    </div>
  );
}