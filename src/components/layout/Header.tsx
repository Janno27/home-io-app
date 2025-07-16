import { useRef, useState } from 'react';
import { WidgetContainer } from '@/components/ui/WidgetContainer';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { StockWidget } from '@/components/stock/StockWidget';
import { QuickActions } from '@/components/quick-actions/QuickActions';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '@/hooks/useNavigation';
import { WeatherData } from '@/components/weather/types';
import { Music, FileText, Clock, Calculator as CalculatorIcon, User } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AnimatePresence, motion } from 'framer-motion';

interface HeaderProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
  onOpenQuickNotes?: () => void;
  onOpenTimer?: () => void;
  onOpenCalculator?: () => void;
  onMusicClick?: () => void;
  musicActive?: boolean;
  showQuickNotes?: boolean;
  showTimer?: boolean;
  showCalculator?: boolean;
  onGetNotesIconPosition?: (position: { x: number; y: number }) => void;
  onGetTimerIconPosition?: (position: { x: number; y: number }) => void;
  onGetCalculatorIconPosition?: (position: { x: number; y: number }) => void;
  onOpenWeatherDetail: (point: { x: number; y: number }) => void;
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  weatherError: string | null;
}

export function Header({ 
  currentPage, 
  navigateTo, 
  onOpenExpenseModal, 
  onOpenIncomeModal, 
  onOpenQuickNotes, 
  onOpenTimer, 
  onOpenCalculator,
  onMusicClick, 
  musicActive,
  showQuickNotes,
  showTimer,
  showCalculator,
  onGetNotesIconPosition,
  onGetTimerIconPosition,
  onGetCalculatorIconPosition,
  onOpenWeatherDetail,
  weatherData,
  weatherLoading,
  weatherError,
}: HeaderProps) {
  const { user } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const notesIconRef = useRef<HTMLButtonElement>(null);
  const timerIconRef = useRef<HTMLButtonElement>(null);
  const calculatorIconRef = useRef<HTMLButtonElement>(null);

  const handleNotesClick = () => {
    if (notesIconRef.current && onGetNotesIconPosition) {
      const rect = notesIconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onGetNotesIconPosition({ x: centerX, y: centerY });
    }
    onOpenQuickNotes?.();
  };

  const handleTimerClick = () => {
    if (timerIconRef.current && onGetTimerIconPosition) {
      const rect = timerIconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onGetTimerIconPosition({ x: centerX, y: centerY });
    }
    onOpenTimer?.();
  };

  const handleCalculatorClick = () => {
    if (calculatorIconRef.current && onGetCalculatorIconPosition) {
      const rect = calculatorIconRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      onGetCalculatorIconPosition({ x: centerX, y: centerY });
    }
    onOpenCalculator?.();
  };

  const utilityIconsList = [
    {
      key: 'music',
      title: 'Musique',
      icon: Music,
      onClick: onMusicClick,
      active: musicActive,
      className: musicActive ? 'text-[#1DB954]' : 'text-gray-600',
    },
    {
      key: 'notes',
      title: 'Notes',
      icon: FileText,
      onClick: handleNotesClick,
      ref: notesIconRef,
      active: showQuickNotes,
    },
    {
      key: 'timer',
      title: 'Timer',
      icon: Clock,
      onClick: handleTimerClick,
      ref: timerIconRef,
      active: showTimer,
    },
    {
      key: 'calculator',
      title: 'Calculatrice',
      icon: CalculatorIcon,
      onClick: handleCalculatorClick,
      ref: calculatorIconRef,
      active: showCalculator,
    },
  ];

  return (
    <header className="flex-shrink-0 w-full px-6 py-4 backdrop-blur-sm bg-white/5 border-b border-white/10 transition-all duration-200 ease-out">
      <div className="flex items-center justify-between">
        <div className="transition-all duration-200 ease-out">
          {currentPage === 'home' ? (
            <WidgetContainer className="flex items-center space-x-4">
              <WeatherWidget
                onOpen={onOpenWeatherDetail}
                weatherData={weatherData}
                loading={weatherLoading}
                error={weatherError}
              />
              <StockWidget
                navigateTo={navigateTo}
                onOpenExpenseModal={onOpenExpenseModal}
                onOpenIncomeModal={onOpenIncomeModal}
              />
            </WidgetContainer>
          ) : (
            <WidgetContainer className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(
                  currentPage === 'accounting-table' ? 'accounting' : 
                  currentPage === 'evolution' ? 'accounting' : 
                  currentPage === 'dashboard' ? 'accounting' :
                  'home'
                )}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">
                  {currentPage === 'accounting-table' || currentPage === 'evolution' || currentPage === 'dashboard' ? 'Retour au dashboard' : 'Retour'}
                </span>
              </Button>
            </WidgetContainer>
          )}
        </div>
        
        <div className="transition-all duration-200 ease-out">
          <WidgetContainer className="flex items-center space-x-2">
            <QuickActions 
              currentPage={currentPage} 
              onOpenExpenseModal={onOpenExpenseModal}
              onOpenIncomeModal={onOpenIncomeModal}
            />
            
            {(currentPage === 'accounting' || currentPage === 'accounting-table' || currentPage === 'evolution' || currentPage === 'dashboard') && (
              <div className="w-px h-4 bg-gray-300/60 mx-1" />
            )}

          {currentPage === 'home' ? (
            <div className="flex items-center space-x-1">
              {utilityIconsList.map((tool) => (
                <Button
                  key={tool.key}
                  ref={tool.ref}
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 relative ${tool.active ? 'bg-white/20' : ''}`}
                  onClick={tool.onClick}
                  title={tool.title}
                >
                  <tool.icon className={`w-4 h-4 ${tool.active ? 'text-[#1DB954]' : (tool.className || 'text-gray-600')}`} />
                  {tool.key === 'music' && tool.active && (
                    <span className="absolute -top-0.5 -right-0.5 w-0 h-0" />
                  )}
                </Button>
              ))}
            </div>
            ) : (
            <Popover open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Outils rapides">
                  <LayoutGrid className="w-4 h-4 text-gray-600" />
                </Button>
              </PopoverTrigger>
              <AnimatePresence>
                {isToolsOpen && (
                  <PopoverContent 
                    side="bottom" 
                    align="center" 
                    className="w-auto p-1.5 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl shadow-lg z-[9999]"
                    asChild
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-col space-y-1"
                    >
                      {utilityIconsList.map((tool, index) => (
                        <motion.div
                          key={tool.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05, duration: 0.15 } }}
                          exit={{ opacity: 0, x: 10, transition: { delay: (utilityIconsList.length - index - 1) * 0.05, duration: 0.15 } }}
                        >
                          <Button 
                            ref={tool.ref}
                            variant="ghost" 
                            size="sm" 
                            className={`h-8 w-8 p-0 ${tool.active ? 'bg-white/20' : ''}`}
                            onClick={() => {
                              tool.onClick?.();
                              setIsToolsOpen(false);
                            }}
                            title={tool.title}
                          >
                            <tool.icon className={`w-4 h-4 ${tool.active ? 'text-[#1DB954]' : (tool.className || 'text-gray-600')}`} />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </PopoverContent>
                )}
              </AnimatePresence>
            </Popover>
            )}
            
            <div className="w-px h-4 bg-gray-300/60 mx-1" />
            
            {user ? (
              <UserMenu currentPage={currentPage} />
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
          </WidgetContainer>
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
}