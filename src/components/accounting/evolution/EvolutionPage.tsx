import { useState } from 'react';
import { useAccounting } from '@/hooks/useAccounting';
import { BalanceCard } from '../BalanceCard';
import { BalanceCardSkeleton } from '../BalanceCardSkeleton';

import { MonthlyChartSkeleton } from '../MonthlyChartSkeleton';
import { DistributionChart } from './DistributionChart';
import { DistributionChartSkeleton } from './DistributionChartSkeleton';
import { CategoryEvolutionChart } from './CategoryEvolutionChart';


interface EvolutionPageProps {
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution') => void;
}

export function EvolutionPage({ navigateTo }: EvolutionPageProps) {
  const { transactions, loading } = useAccounting();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showComparison, setShowComparison] = useState(false);
  const [distributionType, setDistributionType] = useState<'expense' | 'income'>('expense');

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







  return (
    <main className="flex-1 flex flex-col px-6 py-8 min-h-0">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">


        {/* Grid principal qui prend toute la hauteur */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full min-h-0">
          {/* Colonne principale - 60% */}
          <div className="lg:col-span-3 flex flex-col min-h-0 space-y-6">
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

            {/* Graphique d'évolution des catégories - Prend l'espace restant */}
            <div className="flex-1 min-h-0">
              {loading ? (
                <MonthlyChartSkeleton />
              ) : (
                <CategoryEvolutionChart
                  selectedYear={selectedYear}
                  type={distributionType}
                  formatAmount={formatAmount}
                  formatAmountDetailed={formatAmountDetailed}
                  showComparison={showComparison}
                />
              )}
            </div>
          </div>

          {/* Colonne de droite - 40% - Distribution */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {loading ? (
              <DistributionChartSkeleton />
            ) : (
              <DistributionChart
                selectedYear={selectedYear}
                type={distributionType}
                onTypeChange={setDistributionType}
                showComparison={showComparison}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 