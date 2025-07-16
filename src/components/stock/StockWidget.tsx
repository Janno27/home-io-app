import { TrendingUp, PiggyBank, PlusCircle } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { MiniBalanceCard } from '@/components/accounting/MiniBalanceCard';

interface StockWidgetProps {
  navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution' | 'dashboard') => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
}

export function StockWidget({ navigateTo, onOpenExpenseModal, onOpenIncomeModal }: StockWidgetProps) {
  const { transactions, loading, transactionFilter, setFilter } = useAccounting();
  const { currentOrganization } = useOrganizations();
  const { user } = useAuthContext();

  // Retarder l'affichage pour éviter le flickering (300 ms)
  const [showBalances, setShowBalances] = useState(false);

  // Transactions globales non filtrées
  const [globalTx, setGlobalTx] = useState<typeof transactions>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);

  // N'afficher le skeleton que tant qu'aucune donnée n'est disponible :
  // – lors du tout premier chargement (loading === true)
  // – ou si la requête globale n'a encore rien renvoyé.
  // Une fois les données chargées, on conserve l'affichage et on évite
  // de repasser par l'état skeleton même si `loading` repasse à true
  // (par exemple quand l'utilisateur change le filtre elsewhere).
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowBalances(true), 300);
      return () => clearTimeout(timer);
    }
    // Si nous n'avons pas encore de transactions globales, on cache l'affichage
    // en repassant showBalances à false pour montrer le skeleton.
    if (globalTx.length === 0) {
      setShowBalances(false);
    }
  }, [loading, globalTx.length]);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchGlobal = async () => {
      if (!currentOrganization || !user) return;
      setLoadingGlobal(true);
      const { data, error } = await supabase.rpc('get_organization_transactions', {
        org_id: currentOrganization.id,
        filter_type: 'all',
        current_user_id: user.id,
      });
      if (!error) setGlobalTx(data || []);
      setLoadingGlobal(false);
    };
    fetchGlobal();
  }, [currentOrganization, user]);

  const getBalances = () => {
    // La base est les transactions globales (filtre 'all')
    // Ensuite on filtre selon le `transactionFilter` courant
    let txToProcess = globalTx;

    if (transactionFilter === 'personal') {
      txToProcess = globalTx.filter(t => t.is_personal && t.user_id === user?.id);
    } else if (transactionFilter === 'common') {
      txToProcess = globalTx.filter(t => !t.is_personal);
    }

    const yearTransactions = txToProcess.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === currentYear
    );

    const totalRevenues = yearTransactions
      .filter(t => t.category_type === 'income')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

    const totalExpenses = yearTransactions
      .filter(t => t.category_type === 'expense')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);

    // Balance globale (communes + toutes personnelles) => disponible quand filtre = 'all'
    const balance = totalRevenues - totalExpenses;

    // La balance personnelle est toujours affichée séparément
    const personalTransactions = globalTx.filter(t => t.is_personal && t.user_id === user?.id && new Date(t.accounting_date).getFullYear() === currentYear);
    const personalRevenues = personalTransactions.filter(t => t.category_type === 'income')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);
    const personalExpenses = personalTransactions.filter(t => t.category_type === 'expense')
      .reduce((sum, t) => sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0);
    const personalBalance = personalRevenues - personalExpenses;

    return { balance, personalBalance, totalRevenues, totalExpenses };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const { balance, personalBalance, totalRevenues, totalExpenses } = getBalances();
  const isPositive = balance >= 0;

  // Comparaison avec le mois précédent
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
  const prevMonthYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;

  const getBalanceForMonth = (tx: typeof globalTx, year: number, monthIdx: number, personal: boolean) => {
    const filtered = tx.filter(t => {
      const d = new Date(t.accounting_date);
      return d.getFullYear() === year && d.getMonth() === monthIdx && (!personal || (t.is_personal && t.user_id === user?.id));
    });
    const rev = filtered.filter(t => t.category_type === 'income').reduce((s, t) => s + (t.net_amount ?? t.amount), 0);
    const exp = filtered.filter(t => t.category_type === 'expense').reduce((s, t) => s + (t.net_amount ?? t.amount), 0);
    return rev - exp;
  };

  const currentMonthGlobal = getBalanceForMonth(globalTx, currentYear, currentMonthIdx, false);
  const prevMonthGlobal = getBalanceForMonth(globalTx, prevMonthYear, prevMonthIdx, false);
  const diffGlobal = currentMonthGlobal - prevMonthGlobal;
  const diffPositive = diffGlobal >= 0;
  const diffPercent = prevMonthGlobal === 0 ? 100 : (diffGlobal / Math.abs(prevMonthGlobal)) * 100;

  const handleBalanceClick = () => {
    if (navigateTo) {
      navigateTo('accounting');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Skeleton discret tant qu'aucune balance n'a été calculée */}
      {(!showBalances || (loadingGlobal && globalTx.length === 0)) && (
        <div className="w-24 h-6 bg-gray-300/40 rounded animate-pulse" />
      )}

      {showBalances && !loadingGlobal && globalTx.length > 0 && (
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <div 
              className="flex items-center space-x-4 p-2 px-3 cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
              onClick={handleBalanceClick}
            >
              {/* Balance globale */}
              <div className="flex items-center space-x-2">
                <PiggyBank className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {formatAmount(balance)}
                </span>
                <span className={`text-xs flex items-center ${diffPositive ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp className={`w-3 h-3 mr-1 ${!diffPositive ? 'rotate-180' : ''}`} />
                  {diffPositive ? '+' : ''}{diffPercent.toFixed(1)}%
                </span>
              </div>
              {/* Balance personnelle */}
              <div className="flex items-center space-x-1">
                <span className="text-[11px] text-gray-500">Perso :</span>
                <span className="text-[11px] font-medium text-gray-700">
                  {formatAmount(personalBalance)}
                </span>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto p-0 border-none bg-transparent shadow-none">
            <MiniBalanceCard
              balance={balance}
              totalRevenues={totalRevenues}
              totalExpenses={totalExpenses}
              formatAmount={formatAmount}
              onOpenExpenseModal={onOpenExpenseModal}
              onOpenIncomeModal={onOpenIncomeModal}
              filter={transactionFilter}
              onFilterChange={setFilter}
            />
          </HoverCardContent>
        </HoverCard>
      )}

      {showBalances && !loadingGlobal && globalTx.length === 0 && (
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <PlusCircle className="w-3 h-3" />
          <span>Ajouter une dépense</span>
        </button>
      )}

      {/* Bitcoin (existant) */}
    </div>
  );
}