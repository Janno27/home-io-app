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
import { MusicWidget } from '@/components/music';
import { useState } from 'react';
import { AccountingTable } from '@/components/accounting/AccountingTable';
import { AccountingTableSkeleton } from '@/components/accounting/AccountingTableSkeleton';
import { useAccounting } from '@/hooks/useAccounting';
import { EvolutionPage } from '@/components/accounting/evolution';
import { CalendarWidget } from '@/components/calendar';
import { DashboardPage } from '@/components/accounting/dashboard';

export function MainLayout() {
  const { user, loading } = useAuthContext();
  const { currentPage, navigateTo } = useNavigation();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showQuickNotes, setShowQuickNotes] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [musicActive, setMusicActive] = useState(false);
  const [musicCollapsed, setMusicCollapsed] = useState(false);
  const [notesIconPosition, setNotesIconPosition] = useState<{ x: number; y: number } | undefined>();
  const [timerIconPosition, setTimerIconPosition] = useState<{ x: number; y: number } | undefined>();

  const handleToggleNotes = () => {
    if (showQuickNotes) {
      // Fermeture immédiate - l'animation est gérée par DockAnimation
      setShowQuickNotes(false);
    } else {
      // Ouverture
      setShowQuickNotes(true);
    }
  };

  const handleToggleTimer = () => {
    if (showTimer) {
      // Fermeture immédiate - l'animation est gérée par DockAnimation
      setShowTimer(false);
    } else {
      // Ouverture
      setShowTimer(true);
    }
  };

  const handleMusicIconClick = () => {
    if (!musicActive) {
      setMusicActive(true);
      setMusicCollapsed(false);
    } else {
      setMusicCollapsed(prev => !prev);
    }
  };

  const handleMusicClose = () => {
    setMusicActive(false);
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
      <div className="h-screen flex flex-col relative overflow-hidden">
        <AnimatedBackground />
        <div className={`relative z-10 flex flex-col h-full ${currentPage === 'dashboard' ? 'overflow-auto' : 'overflow-hidden'}`}>
          <Header 
            currentPage={currentPage} 
            navigateTo={navigateTo}
            onOpenExpenseModal={() => setShowExpenseModal(true)}
            onOpenIncomeModal={() => setShowIncomeModal(true)}
            onOpenQuickNotes={handleToggleNotes}
            onOpenTimer={handleToggleTimer}
            onMusicClick={handleMusicIconClick}
            musicActive={musicActive}
            showQuickNotes={showQuickNotes}
            showTimer={showTimer}
            onGetNotesIconPosition={setNotesIconPosition}
            onGetTimerIconPosition={setTimerIconPosition}
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
            ) : currentPage === 'dashboard' ? (
              <DashboardPage navigateTo={navigateTo} />
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
        originPoint={notesIconPosition}
      />
      
      <Timer
        isOpen={showTimer}
        onClose={handleToggleTimer}
        originPoint={timerIconPosition}
      />
      
      {musicActive && (
        <MusicWidget
          active={musicActive}
          collapsed={musicCollapsed}
          onToggleCollapse={handleMusicIconClick}
          onClose={handleMusicClose}
        />
      )}

      {/* Mini calendrier accessible en bas à droite */}
      <CalendarWidget showTrigger={currentPage === 'home'} />

      <Toaster position="top-right" />
    </>
  );
}

// Composant séparé pour la page AccountingTable
function AccountingTablePage({ navigateTo: _navigateTo }: { navigateTo: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution' | 'dashboard') => void }) {
  const { loading } = useAccounting();
  
  return (
    <main className="flex-1 flex flex-col px-6 py-8 min-h-0">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
        {loading ? <AccountingTableSkeleton /> : <AccountingTable />}
      </div>
    </main>
  );
}