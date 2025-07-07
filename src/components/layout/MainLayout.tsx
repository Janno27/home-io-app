import { Header } from './Header';
import { Hero } from './Hero';
import { Footer } from './Footer';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { AuthPage } from '@/components/auth/AuthPage';
import { Toaster } from '@/components/ui/sonner';
import { useNavigation } from '@/hooks/useNavigation';
import { AccountingHero } from './AccountingHero';
import { AnimatedPageTransition } from '@/components/ui/AnimatedPageTransition';
import { TransactionModal } from '@/components/accounting/TransactionModal';
import { useState } from 'react';
import { AccountingTable } from '@/components/accounting/AccountingTable';
import { AccountingTableSkeleton } from '@/components/accounting/AccountingTableSkeleton';
import { useAccounting } from '@/hooks/useAccounting';
import { EvolutionPage } from '@/components/accounting/evolution';

export function MainLayout() {
  const { user, loading } = useAuthContext();
  const { currentPage, navigateTo } = useNavigation();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la page d'authentification
  if (!user) {
    return <AuthPage />;
  }

  // Si l'utilisateur est connecté, afficher l'application principale
  return (
    <>
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col h-full">
          <Header 
            currentPage={currentPage} 
            navigateTo={navigateTo}
            onOpenExpenseModal={() => setShowExpenseModal(true)}
            onOpenIncomeModal={() => setShowIncomeModal(true)}
          />
          <AnimatedPageTransition currentPage={currentPage}>
            {currentPage === 'home' ? (
              <Hero />
            ) : currentPage === 'accounting-table' ? (
              <AccountingTablePage navigateTo={navigateTo} />
            ) : currentPage === 'evolution' ? (
              <EvolutionPage 
                navigateTo={navigateTo}
                onOpenExpenseModal={() => setShowExpenseModal(true)}
                onOpenIncomeModal={() => setShowIncomeModal(true)}
              />
            ) : (
              <AccountingHero 
                navigateTo={navigateTo}
                onOpenExpenseModal={() => setShowExpenseModal(true)}
                onOpenIncomeModal={() => setShowIncomeModal(true)}
              />
            )}
          </AnimatedPageTransition>
          {currentPage === 'home' && <Footer />}
        </div>
      </div>
      
      {/* Modales en dehors du scope principal */}
      <TransactionModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        type="expense"
      />
      
      <TransactionModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        type="income"
      />
      
      <Toaster position="top-right" />
    </>
  );
}

// Composant séparé pour la page AccountingTable
function AccountingTablePage({ navigateTo }: { navigateTo: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution') => void }) {
  const { loading } = useAccounting();
  
  return (
    <main className="flex-1 flex flex-col px-6 py-8 min-h-0">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {loading ? <AccountingTableSkeleton /> : <AccountingTable />}
      </div>
    </main>
  );
}