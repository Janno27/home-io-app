import { useState } from 'react';
import { Music, Clock, Plus, User, Calculator, Minus, Plus as PlusIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';


import { useAuthContext } from '@/components/auth/AuthProvider';
import type { Page } from '@/hooks/useNavigation';

interface QuickActionsProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  onOpenQuickNotes?: () => void;
  onOpenTimer?: () => void;
  onMusicClick?: () => void;
  musicActive?: boolean;
}

export function QuickActions({ currentPage, navigateTo, onOpenExpenseModal, onOpenIncomeModal, onOpenQuickNotes, onOpenTimer, onMusicClick, musicActive }: QuickActionsProps) {
  const { user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-1 p-1 transition-all duration-200 ease-out">
        {currentPage === 'home' && (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 relative"
              onClick={onMusicClick}
              title="Musique"
            >
              <Music className="w-4 h-4 text-gray-600" />
              {musicActive && (
                <span className="absolute -top-0.5 -right-0.5 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#1DB954]" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onOpenQuickNotes}
              title="Notes"
            >
              <FileText className="w-4 h-4 text-gray-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
                        onClick={onOpenTimer}
          title="Timer"
            >
              <Clock className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Plus className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        )}
        
        {currentPage === 'accounting' && (
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 flex items-center space-x-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-colors"
              onClick={onOpenExpenseModal}
            >
              <Minus className="w-4 h-4" />
              <span className="text-sm font-medium">Dépenses</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 flex items-center space-x-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50/50 transition-colors"
              onClick={onOpenIncomeModal}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Revenus</span>
            </Button>
          </div>
        )}
        
        {(currentPage === 'accounting-table' || currentPage === 'evolution') && (
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 flex items-center space-x-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-colors"
              onClick={onOpenExpenseModal}
            >
              <Minus className="w-4 h-4" />
              <span className="text-sm font-medium">Dépenses</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 flex items-center space-x-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50/50 transition-colors"
              onClick={onOpenIncomeModal}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Revenus</span>
            </Button>
          </div>
        )}
        
        {currentPage === 'home' && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => navigateTo('accounting')}
            title="Comptabilité"
          >
            <Calculator className="w-4 h-4 text-gray-600" />
          </Button>
        )}
        
        <div className="w-px h-4 bg-gray-300 mx-1" />
        
        {user ? (
          <UserMenu />
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowAuthModal(true)}
          >
            <User className="w-4 h-4 text-gray-600" />
          </Button>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}