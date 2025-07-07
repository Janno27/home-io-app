import { WidgetContainer } from '@/components/ui/WidgetContainer';
import { WeatherWidget } from '@/components/weather/WeatherWidget';
import { StockWidget } from '@/components/stock/StockWidget';
import { QuickActions } from '@/components/quick-actions/QuickActions';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Page } from '@/hooks/useNavigation';

interface HeaderProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
}
export function Header({ currentPage, navigateTo, onOpenExpenseModal, onOpenIncomeModal }: HeaderProps) {
  return (
    <header className="flex-shrink-0 w-full px-6 py-4 backdrop-blur-sm bg-white/5 border-b border-white/10 transition-all duration-200 ease-out">
      <div className="flex items-center justify-between">
        <div className="transition-all duration-200 ease-out">
          {currentPage === 'home' ? (
            <WidgetContainer className="flex items-center space-x-4">
              <WeatherWidget />
              <StockWidget />
            </WidgetContainer>
          ) : (
            <WidgetContainer>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(
                  currentPage === 'accounting-table' ? 'accounting' : 
                  currentPage === 'evolution' ? 'accounting' : 
                  'home'
                )}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">
                  {currentPage === 'accounting-table' || currentPage === 'evolution' ? 'Retour au dashboard' : 'Retour'}
                </span>
              </Button>
            </WidgetContainer>
          )}
        </div>
        
        <div></div>
        
        <div className="transition-all duration-200 ease-out">
          <WidgetContainer>
            <QuickActions 
              currentPage={currentPage} 
              navigateTo={navigateTo}
              onOpenExpenseModal={onOpenExpenseModal}
              onOpenIncomeModal={onOpenIncomeModal}
            />
          </WidgetContainer>
        </div>
      </div>
    </header>
  );
}