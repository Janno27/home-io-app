import { TrendingUp, Bitcoin, PiggyBank } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';

interface StockWidgetProps {
  navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution') => void;
}

export function StockWidget({ navigateTo }: StockWidgetProps) {
  const { transactions, loading } = useAccounting();

  // Calculer la balance de l'année en cours
  const getCurrentYearBalance = () => {
    const currentYear = new Date().getFullYear();
    const yearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === currentYear
    );

    const totalRevenues = yearTransactions
      .filter(t => t.category_type === 'income')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

    const totalExpenses = yearTransactions
      .filter(t => t.category_type === 'expense')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

    return totalRevenues - totalExpenses;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currentBalance = getCurrentYearBalance();
  const isPositive = currentBalance >= 0;

  const handleBalanceClick = () => {
    if (navigateTo) {
      navigateTo('accounting');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Balance de l'année (seulement si différente de 0€) */}
      {!loading && currentBalance !== 0 && (
        <div 
          className="flex items-center space-x-2 p-2 px-3 cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
          onClick={handleBalanceClick}
          title="Voir le dashboard comptable"
        >
          <PiggyBank className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            {formatAmount(currentBalance)}
          </span>
          <span className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${!isPositive ? 'rotate-180' : ''}`} />
            {new Date().getFullYear()}
          </span>
        </div>
      )}

      {/* Bitcoin (existant) */}
      <div className="flex items-center space-x-2 p-2 px-3">
        <Bitcoin className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">$108,890</span>
        <span className="text-xs text-red-500 flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          +5.3%
        </span>
      </div>
    </div>
  );
}