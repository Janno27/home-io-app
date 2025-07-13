import { useState, useRef } from 'react';
import { Music, Clock, Plus, User, Calculator, Minus, Plus as PlusIcon, FileText, Edit3, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, LineChart, Table } from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';


import { useAuthContext } from '@/components/auth/AuthProvider';
import type { Page } from '@/hooks/useNavigation';

export type WidgetType = 'chart-bar' | 'chart-line' | 'table';

const widgetOptions: { type: WidgetType; title: string; icon: React.ElementType }[] = [
  { type: 'chart-bar', title: 'Graphique (Barres)', icon: BarChart },
  { type: 'chart-line', title: 'Graphique (Courbe)', icon: LineChart },
  { type: 'table', title: 'Tableau', icon: Table },
];

interface QuickActionsProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  onOpenQuickNotes?: () => void;
  onOpenTimer?: () => void;
  onMusicClick?: () => void;
  musicActive?: boolean;
  showQuickNotes?: boolean;
  showTimer?: boolean;
  onGetNotesIconPosition?: (position: { x: number; y: number }) => void;
  onGetTimerIconPosition?: (position: { x: number; y: number }) => void;
}

export function QuickActions({ 
  currentPage, 
  navigateTo, 
  onOpenExpenseModal, 
  onOpenIncomeModal, 
  onOpenQuickNotes, 
  onOpenTimer, 
  onMusicClick, 
  musicActive,
  showQuickNotes,
  showTimer,
  onGetNotesIconPosition,
  onGetTimerIconPosition
}: QuickActionsProps) {
  const { user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const notesIconRef = useRef<HTMLButtonElement>(null);
  const timerIconRef = useRef<HTMLButtonElement>(null);

  const handleNotesClick = () => {
    // Toujours calculer la position de l'icône pour l'animation
    if (notesIconRef.current && onGetNotesIconPosition) {
      const rect = notesIconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onGetNotesIconPosition({ x: centerX, y: centerY });
    }
    // Le toggle est géré dans MainLayout
    onOpenQuickNotes?.();
  };

  const handleTimerClick = () => {
    // Toujours calculer la position de l'icône pour l'animation
    if (timerIconRef.current && onGetTimerIconPosition) {
      const rect = timerIconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onGetTimerIconPosition({ x: centerX, y: centerY });
    }
    // Le toggle est géré dans MainLayout
    onOpenTimer?.();
  };

  const handleToggleEdit = () => {
    window.dispatchEvent(new CustomEvent('dashboard-toggle-edit'));
  };

  const handleAddSection = () => {
    window.dispatchEvent(new CustomEvent('dashboard-add-section'));
  };

  const handleSelectWidget = (type: WidgetType) => {
    window.dispatchEvent(new CustomEvent('dashboard-create-widget', { detail: { type } }));
  };

  return (
    <>
      <div className="flex items-center space-x-1 p-1 transition-all duration-200 ease-out">
        {currentPage === 'dashboard' && (
          <div className="flex items-center space-x-1 p-1 bg-white/10 rounded-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/20 h-9 px-4 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" align="end" sideOffset={8}>
                <div className="grid grid-cols-1 gap-1">
                  {widgetOptions.map((widget) => (
                    <button
                      key={widget.type}
                      onClick={() => handleSelectWidget(widget.type)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded text-sm w-full text-left"
                    >
                      <widget.icon className="w-4 h-4 text-gray-600" />
                      <span>{widget.title}</span>
                    </button>
                  ))}
                   <div className="my-1 h-px bg-gray-200" />
                  <button
                    onClick={handleAddSection}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded text-sm w-full text-left"
                  >
                    <Type className="w-4 h-4 text-gray-600" />
                    <span>Titre de section</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleToggleEdit}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/20 h-9 px-4 rounded-full"
            >
              <Edit3 className="w-4 h-4" />
              <span>Éditer</span>
            </Button>
          </div>
        )}
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
              ref={notesIconRef}
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${showQuickNotes ? 'bg-white/20' : ''}`}
              onClick={handleNotesClick}
              title="Notes"
            >
              <FileText className="w-4 h-4 text-gray-600" />
            </Button>
            <Button 
              ref={timerIconRef}
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${showTimer ? 'bg-white/20' : ''}`}
              onClick={handleTimerClick}
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