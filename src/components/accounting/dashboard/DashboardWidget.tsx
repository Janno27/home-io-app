import { useState } from 'react';
import { X, Plus, Settings, Grip } from 'lucide-react';
import { DockAnimation } from '@/components/ui/DockAnimation';
import { StatsWidget, ChartWidget, TableWidget, SummaryWidget } from './widgets';

interface DashboardWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint?: { x: number; y: number };
}

interface DashboardItem {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'summary';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function DashboardWidget({ isOpen, onClose, originPoint }: DashboardWidgetProps) {
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      id: '1',
      type: 'summary',
      title: 'Balance actuelle',
      position: { x: 0, y: 0 },
      size: { width: 2, height: 1 }
    },
    {
      id: '2', 
      type: 'stats',
      title: 'Résumé mensuel',
      position: { x: 2, y: 0 },
      size: { width: 2, height: 1 }
    },
    {
      id: '3',
      type: 'chart',
      title: 'Évolution mensuelle',
      position: { x: 0, y: 1 },
      size: { width: 2, height: 2 }
    },
    {
      id: '4',
      type: 'table',
      title: 'Dernières transactions',
      position: { x: 2, y: 1 },
      size: { width: 2, height: 2 }
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const addWidget = () => {
    const newWidget: DashboardItem = {
      id: Date.now().toString(),
      type: 'summary',
      title: 'Nouveau widget',
      position: { x: 0, y: Math.max(...dashboardItems.map(item => item.position.y + item.size.height)) },
      size: { width: 2, height: 1 }
    };
    setDashboardItems([...dashboardItems, newWidget]);
  };

  const removeWidget = (id: string) => {
    setDashboardItems(dashboardItems.filter(item => item.id !== id));
  };

  return (
    <DockAnimation isOpen={isOpen} onClose={onClose} originPoint={originPoint}>
      <div className="flex items-center justify-center p-4 h-full pointer-events-none">
        <div className="w-[90vw] max-w-6xl h-[85vh] bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden pointer-events-auto flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h3 className="text-gray-600 text-sm font-medium">Dashboard Personnel</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700 ${isEditing ? 'bg-white/20' : ''}`}
                title="Mode édition"
              >
                <Grip className="w-4 h-4" />
              </button>
              <button
                onClick={addWidget}
                className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                title="Ajouter un widget"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-4 gap-4 min-h-full">
              {dashboardItems.map((item) => (
                <DashboardItem
                  key={item.id}
                  item={item}
                  isEditing={isEditing}
                  onRemove={() => removeWidget(item.id)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </DockAnimation>
  );
}

interface DashboardItemProps {
  item: DashboardItem;
  isEditing: boolean;
  onRemove: () => void;
}

function DashboardItem({ item, isEditing, onRemove }: DashboardItemProps) {
  const renderContent = () => {
    switch (item.type) {
      case 'summary':
        return (
          <SummaryWidget
            title={item.title}
            mainValue="2,450€"
            mainLabel="Balance mensuelle"
            subtitle="Juin 2024"
            trend={{ value: "+12%", direction: "up" }}
            color="green"
          />
        );
      case 'stats':
        return (
          <StatsWidget
            title={item.title}
            stats={[
              { label: "Total revenus", value: "+2,450€", color: "green" },
              { label: "Total dépenses", value: "-1,890€", color: "red" },
              { label: "Balance", value: "+560€", color: "gray" }
            ]}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            title={item.title}
            type="line"
            height="h-32"
          />
        );
      case 'table':
        return (
          <TableWidget
            title={item.title}
            headers={["Date", "Catégorie", "Montant"]}
            rows={[
              ["12/06", "Alimentation", "-45€"],
              ["11/06", "Salaire", "+2000€"],
              ["10/06", "Transport", "-25€"],
              ["09/06", "Loisirs", "-80€"]
            ]}
            maxRows={4}
          />
        );
      default:
        return (
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700">{item.title}</h4>
          </div>
        );
    }
  };

  return (
    <div 
      className="bg-white/15 rounded-lg border border-white/20 relative group transition-all hover:bg-white/20"
      style={{
        gridColumn: `span ${item.size.width}`,
        gridRow: `span ${item.size.height}`
      }}
    >
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <X className="w-3 h-3 text-red-600" />
        </button>
      )}
      {renderContent()}
    </div>
  );
} 