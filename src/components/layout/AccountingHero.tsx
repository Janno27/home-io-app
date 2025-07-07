import { useAuthContext } from '@/components/auth/AuthProvider';
import { useAccounting } from '@/hooks/useAccounting';
import { useState } from 'react';
import { BalanceCard } from '@/components/accounting/BalanceCard';
import { MonthlyChart } from '@/components/accounting/MonthlyChart';
import { TransactionsTable } from '@/components/accounting/TransactionsTable';
import { AccountingTable } from '@/components/accounting/AccountingTable';
import { BalanceCardSkeleton } from '@/components/accounting/BalanceCardSkeleton';
import { MonthlyChartSkeleton } from '@/components/accounting/MonthlyChartSkeleton';
import { TransactionsTableSkeleton } from '@/components/accounting/TransactionsTableSkeleton';
import { AccountingTableSkeleton } from '@/components/accounting/AccountingTableSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AccountingHeroProps {
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution') => void;
}

export function AccountingHero({ onOpenExpenseModal, onOpenIncomeModal, navigateTo }: AccountingHeroProps) {
  const { user } = useAuthContext();
  const { transactions, loading, refetch } = useAccounting();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showComparison, setShowComparison] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculer les totaux pour l'année sélectionnée
  const yearTransactions = transactions.filter(transaction => 
    new Date(transaction.accounting_date).getFullYear() === selectedYear
  );

  const totalRevenues = yearTransactions
    .filter(t => t.category_type === 'income')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const totalExpenses = yearTransactions
    .filter(t => t.category_type === 'expense')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const balance = totalRevenues - totalExpenses;

  // Calculer les totaux pour l'année précédente (pour comparaison)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Déterminer jusqu'à quel mois comparer (si on est dans l'année courante, jusqu'au mois actuel)
  const maxMonth = selectedYear === currentYear ? currentMonth : 11;
  
  const previousYearTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.accounting_date);
    return transactionDate.getFullYear() === selectedYear - 1 && 
           transactionDate.getMonth() <= maxMonth;
  });

  const currentYearTransactionsUpToMonth = yearTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.accounting_date);
    return transactionDate.getMonth() <= maxMonth;
  });

  const previousYearRevenues = previousYearTransactions
    .filter(t => t.category_type === 'income')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const previousYearExpenses = previousYearTransactions
    .filter(t => t.category_type === 'expense')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const previousYearBalance = previousYearRevenues - previousYearExpenses;

  const currentYearRevenuesUpToMonth = currentYearTransactionsUpToMonth
    .filter(t => t.category_type === 'income')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const currentYearExpensesUpToMonth = currentYearTransactionsUpToMonth
    .filter(t => t.category_type === 'expense')
    .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

  const currentYearBalanceUpToMonth = currentYearRevenuesUpToMonth - currentYearExpensesUpToMonth;

  // Calculer les pourcentages de différence
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const balanceChange = calculatePercentageChange(currentYearBalanceUpToMonth, previousYearBalance);
  const revenueChange = calculatePercentageChange(currentYearRevenuesUpToMonth, previousYearRevenues);
  const expenseChange = calculatePercentageChange(currentYearExpensesUpToMonth, previousYearExpenses);

  // Préparer les données pour le graphique mensuel
  const getMonthlyData = () => {
    const monthlyData = [];
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    for (let month = 0; month < 12; month++) {
      const monthTransactions = yearTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.accounting_date);
        return transactionDate.getMonth() === month;
      });

      const monthRevenues = monthTransactions
        .filter(t => t.category_type === 'income')
        .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

      const monthExpenses = monthTransactions
        .filter(t => t.category_type === 'expense')
        .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

      monthlyData.push({
        month: months[month],
        revenus: monthRevenues,
        depenses: monthExpenses,
      });
    }

    return monthlyData;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAmountDetailed = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const monthlyData = getMonthlyData();

  // Obtenir les dernières transactions (limitées à 50 pour l'affichage)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.accounting_date).getTime() - new Date(a.accounting_date).getTime())
    .slice(0, 50);

  return (
    <main className="flex-1 flex flex-col px-6 py-8 min-h-0">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {/* Grid principal qui prend toute la hauteur */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full min-h-0">
          {/* Colonne principale - 60% */}
          <div className="lg:col-span-3 flex flex-col min-h-0 space-y-6">
            {/* Header Section */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light text-gray-700 flex items-center space-x-3">
                  <span>Hello, {getUserName()}</span>
                  <span className="text-3xl">👋</span>
                </h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/30 rounded-full p-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-lg text-gray-500">
                Voici un aperçu de vos finances
              </p>
            </div>

            {/* Balance Card */}
            {loading ? (
              <BalanceCardSkeleton />
            ) : (
              <BalanceCard
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                showComparison={showComparison}
                onComparisonToggle={setShowComparison}
                balance={balance}
                totalRevenues={totalRevenues}
                totalExpenses={totalExpenses}
                currentYearBalanceUpToMonth={currentYearBalanceUpToMonth}
                currentYearRevenuesUpToMonth={currentYearRevenuesUpToMonth}
                currentYearExpensesUpToMonth={currentYearExpensesUpToMonth}
                balanceChange={balanceChange}
                revenueChange={revenueChange}
                expenseChange={expenseChange}
                formatAmountDetailed={formatAmountDetailed}
                onOpenAccountingTable={() => navigateTo?.('accounting-table')}
              />
            )}

            {/* Graphique mensuel - Prend l'espace restant */}
            <div className="flex-1 min-h-0">
              {loading ? (
                <MonthlyChartSkeleton />
              ) : (
                <MonthlyChart
                  data={monthlyData}
                  formatAmount={formatAmount}
                  formatAmountDetailed={formatAmountDetailed}
                  onOpenAccountingTable={() => navigateTo?.('evolution')}
                />
              )}
            </div>
          </div>

          {/* Colonne de droite - 40% - Tableau des transactions */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {loading ? (
              <div style={{ paddingTop: '1.5rem' }}>
                <TransactionsTableSkeleton />
              </div>
            ) : (
                            <div style={{ paddingTop: '1.5rem' }}>
                <TransactionsTable
                  transactions={recentTransactions}
                  formatAmount={formatAmount}
                  onOpenExpenseModal={onOpenExpenseModal}
                  onOpenIncomeModal={onOpenIncomeModal}
                />
              </div>
              )}
            </div>
        </div>
      </div>
    </main>
  );
}