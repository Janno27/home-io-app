import { Header } from './Header';
import { Hero } from './Hero';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { AuthPage } from '@/components/auth/AuthPage';
import { Toaster } from '@/components/ui/sonner';
import { useNavigation } from '@/hooks/useNavigation';
import { AccountingHero } from './AccountingHero';
import { AnimatedPageTransition } from '@/components/ui/AnimatedPageTransition';
import { TransactionModal } from '@/components/accounting/TransactionModal';
import { QuickNotesWidget } from '@/components/notes';
import { Timer } from '@/components/timer';
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
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [isClosingNotes, setIsClosingNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [isClosingTimer, setIsClosingTimer] = useState(false);

  const handleToggleNotes = () => {
    if (showQuickNotes) {
      // Fermeture avec transition
      setIsClosingNotes(true);
      setTimeout(() => {
        setShowQuickNotes(false);
        setIsClosingNotes(false);
      }, 300);
    } else {
      // Ouverture
      setShowQuickNotes(true);
    }
  };

  const handleToggleTimer = () => {
    if (showTimer) {
      // Fermeture avec transition
      setIsClosingTimer(true);
      setTimeout(() => {
        setShowTimer(false);
        setIsClosingTimer(false);
      }, 300);
    } else {
      // Ouverture
      setShowTimer(true);
    }
  };

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
      {/* Overlay sombre subtil quand les notes ou le timer sont ouverts - couvre toute l'app */}
      {(showQuickNotes || isClosingNotes || showTimer || isClosingTimer) && (
        <div className={`fixed inset-0 bg-black/10 z-[9997] transition-all duration-500 ease-in-out pointer-events-none ${
          (isClosingNotes || isClosingTimer) ? 'animate-out fade-out' : 'animate-in fade-in'
        }`} />
      )}
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <Header 
            currentPage={currentPage} 
            navigateTo={navigateTo}
            onOpenExpenseModal={() => setShowExpenseModal(true)}
            onOpenIncomeModal={() => setShowIncomeModal(true)}
            onOpenQuickNotes={handleToggleNotes}
            onOpenTimer={handleToggleTimer}
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
      
      <QuickNotesWidget
        isOpen={showQuickNotes}
        onClose={handleToggleNotes}
      />
      
              <Timer
          isOpen={showTimer}
        onClose={handleToggleTimer}
      />
      
      <Toaster position="top-right" />
    </>
  );
}

// Composant séparé pour la page AccountingTable
function AccountingTablePage({ navigateTo: _navigateTo }: { navigateTo: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution') => void }) {
  const { loading } = useAccounting();
  
  return (
    <main className="flex-1 flex flex-col px-6 py-8 min-h-0">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {loading ? <AccountingTableSkeleton /> : <AccountingTable />}
      </div>
    </main>
  );
}