import { Plus, Minus, Plus as PlusIcon, Edit3, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, LineChart, Table } from 'lucide-react';
import type { Page } from '@/hooks/useNavigation';

export type WidgetType = 'chart-bar' | 'chart-line' | 'table';

const widgetOptions: { type: WidgetType; title: string; icon: React.ElementType }[] = [
  { type: 'chart-bar', title: 'Graphique (Barres)', icon: BarChart },
  { type: 'chart-line', title: 'Graphique (Courbe)', icon: LineChart },
  { type: 'table', title: 'Tableau', icon: Table },
];

interface QuickActionsProps {
  currentPage: Page;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
}

export function QuickActions({ 
  currentPage, 
  onOpenExpenseModal, 
  onOpenIncomeModal, 
}: QuickActionsProps) {
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
    </>
  );
}