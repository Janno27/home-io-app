import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullScreenSpreadsheet, ChartData } from './FullScreenSpreadsheet';
import { FullScreenTableEditor, TableData } from './FullScreenTableEditor';
import { ResizableWidget, WidgetSize } from './ResizableWidget';
import { ChartWidget, TableWidget } from './widgets';
import type { WidgetType } from '@/components/quick-actions/QuickActions';

// Interfaces pour les widgets
export interface DashboardSectionWidget {
  id: string;
  type: 'section';
  title: string;
  size: WidgetSize;
  position: { x: number; y: number };
}

export interface DashboardTableWidget {
  id: string;
  type: 'table';
  title: string;
  headers: string[];
  rows: string[][];
  size: WidgetSize;
  position: { x: number; y: number };
}

export interface DashboardChartWidget {
  id: string;
  title: string;
  type: 'bar' | 'line';
  color?: string;
  data: Array<{ label: string; value: number }>;
  size: WidgetSize;
  position: { x: number; y: number };
}

// Interface pour un dashboard complet (un onglet)
interface Dashboard {
  id: string;
  name: string;
  sectionWidgets: DashboardSectionWidget[];
  tableWidgets: DashboardTableWidget[];
  chartWidgets: DashboardChartWidget[];
}

interface DashboardPageProps {
  // navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution' | 'dashboard') => void;
}

export function DashboardPage({}: DashboardPageProps) {
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [showSpreadsheet, setShowSpreadsheet] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
  
  // Nouvel état pour gérer plusieurs dashboards
  const [dashboards, setDashboards] = useState<Dashboard[]>([
    {
      id: `dash-${Date.now()}`,
      name: 'Dashboard Principal',
      sectionWidgets: [],
      tableWidgets: [],
      chartWidgets: [],
    },
  ]);
  const [activeDashboardId, setActiveDashboardId] = useState<string>(dashboards[0].id);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingChart, setEditingChart] = useState<DashboardChartWidget | null>(null);
  const [editingTable, setEditingTable] = useState<DashboardTableWidget | null>(null);

  // Fonction utilitaire pour mettre à jour l'état du dashboard actif
  const updateActiveDashboard = (updater: (dashboard: Dashboard) => Dashboard) => {
    setDashboards(dashboards => dashboards.map(d => d.id === activeDashboardId ? updater(d) : d));
  };

  useEffect(() => {
    const handleToggleEdit = () => setIsEditMode(prev => !prev);
    const handleAddSection = () => {
      const sectionWidget: DashboardSectionWidget = {
        id: `section-${Date.now()}`,
        type: 'section',
        title: 'Titre de section',
        size: { width: 4, height: 1 },
        position: { x: 0, y: 0 }
      };
      updateActiveDashboard(d => ({ ...d, sectionWidgets: [...d.sectionWidgets, sectionWidget] }));
    };
    const handleCreateWidget = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type } = customEvent.detail;
      handleSelectWidget(type);
    };
    window.addEventListener('dashboard-toggle-edit', handleToggleEdit);
    window.addEventListener('dashboard-add-section', handleAddSection);
    window.addEventListener('dashboard-create-widget', handleCreateWidget);
    return () => {
      window.removeEventListener('dashboard-toggle-edit', handleToggleEdit);
      window.removeEventListener('dashboard-add-section', handleAddSection);
      window.removeEventListener('dashboard-create-widget', handleCreateWidget);
    };
  }, [activeDashboardId]);

  const handleSelectWidget = (type: WidgetType) => {
    setSelectedWidgetType(type);
    if (type === 'chart-bar' || type === 'chart-line') {
      setEditingChart(null);
      setShowSpreadsheet(true);
    } else if (type === 'table') {
      setEditingTable(null);
      setShowTableEditor(true);
    }
  };

  const handleEditChart = (chart: DashboardChartWidget) => {
    setEditingChart(chart);
    setShowSpreadsheet(true);
  };

  const handleEditTable = (table: DashboardTableWidget) => {
    setEditingTable(table);
    setShowTableEditor(true);
  };
  
  // Fonctions CRUD adaptées pour le dashboard actif
  const handleSaveTable = (tableData: TableData) => {
    if (editingTable) {
      updateActiveDashboard(d => ({ ...d, tableWidgets: d.tableWidgets.map(t => t.id === editingTable.id ? { ...t, ...tableData } : t) }));
      setEditingTable(null);
    } else {
      const newTable: DashboardTableWidget = { ...tableData, type: 'table', size: { width: 4, height: 2 }, position: { x: 0, y: 0 } };
      updateActiveDashboard(d => ({ ...d, tableWidgets: [...d.tableWidgets, newTable] }));
    }
  };

  const handleSaveChart = (chartData: ChartData) => {
    if (editingChart) {
      updateActiveDashboard(d => ({ ...d, chartWidgets: d.chartWidgets.map(c => c.id === editingChart.id ? { ...c, ...chartData } : c) }));
      setEditingChart(null);
    } else {
      const newChart: DashboardChartWidget = { ...chartData, color: 'hsl(var(--chart-1))', size: { width: 4, height: 2 }, position: { x: 0, y: 0 } };
      updateActiveDashboard(d => ({ ...d, chartWidgets: [...d.chartWidgets, newChart] }));
    }
  };

  const handleDeleteSection = (id: string) => updateActiveDashboard(d => ({ ...d, sectionWidgets: d.sectionWidgets.filter(w => w.id !== id) }));
  const handleDeleteTable = (id: string) => updateActiveDashboard(d => ({ ...d, tableWidgets: d.tableWidgets.filter(w => w.id !== id) }));
  const handleDeleteChart = (id: string) => updateActiveDashboard(d => ({ ...d, chartWidgets: d.chartWidgets.filter(w => w.id !== id) }));

  const handleResizeSection = (id: string, size: WidgetSize) => updateActiveDashboard(d => ({ ...d, sectionWidgets: d.sectionWidgets.map(w => w.id === id ? { ...w, size } : w) }));
  const handleResizeTable = (id: string, size: WidgetSize) => updateActiveDashboard(d => ({ ...d, tableWidgets: d.tableWidgets.map(w => w.id === id ? { ...w, size } : w) }));
  const handleResizeChart = (id: string, size: WidgetSize) => updateActiveDashboard(d => ({ ...d, chartWidgets: d.chartWidgets.map(w => w.id === id ? { ...w, size } : w) }));

  const handleChartColorChange = (id: string, color: string) => updateActiveDashboard(d => ({ ...d, chartWidgets: d.chartWidgets.map(w => w.id === id ? { ...w, color } : w) }));

  const handleAddDashboard = () => {
    const newDashboard: Dashboard = {
      id: `dash-${Date.now()}`,
      name: `Dashboard ${dashboards.length + 1}`,
      sectionWidgets: [],
      tableWidgets: [],
      chartWidgets: [],
    };
    setDashboards([...dashboards, newDashboard]);
    setActiveDashboardId(newDashboard.id);
  };

  const handleRenameDashboard = (id: string, newName: string) => {
    setDashboards(dashboards.map(d => d.id === id ? { ...d, name: newName } : d));
  };
  
  // Fonctions de rendu
  const renderSectionWidget = (widget: DashboardSectionWidget) => {
    const content = isEditMode ? (
      <Input
        className="w-full bg-transparent text-lg font-semibold text-gray-700 p-2 outline-none border-b border-transparent focus:border-blue-500 text-left"
        value={widget.title}
        onChange={(e) => updateActiveDashboard(d => ({...d, sectionWidgets: d.sectionWidgets.map(w => w.id === widget.id ? {...w, title: e.target.value} : w)})) }
      />
    ) : (
      <h2 className="text-lg font-semibold text-gray-700 p-2 text-left">{widget.title}</h2>
    );
    return (
      <ResizableWidget key={widget.id} id={widget.id} size={widget.size} isEditMode={isEditMode} onResize={handleResizeSection} onDelete={() => handleDeleteSection(widget.id)} >
        {content}
      </ResizableWidget>
    );
  };

  const renderTableWidget = (table: DashboardTableWidget) => (
    <ResizableWidget key={table.id} id={table.id} size={table.size} isEditMode={isEditMode} onResize={handleResizeTable} onDelete={() => handleDeleteTable(table.id)} >
      <TableWidget title={table.title} headers={table.headers} rows={table.rows} onEdit={() => handleEditTable(table)} />
    </ResizableWidget>
  );

  const renderChartWidget = (chart: DashboardChartWidget) => (
    <ResizableWidget key={chart.id} id={chart.id} size={chart.size} isEditMode={isEditMode} onResize={handleResizeChart} onDelete={() => handleDeleteChart(chart.id)} >
      <ChartWidget title={chart.title} data={chart.data} type={chart.type} color={chart.color} isEditMode={isEditMode} onEdit={() => handleEditChart(chart)} onColorChange={(color) => handleChartColorChange(chart.id, color)} />
    </ResizableWidget>
  );

  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);

  return (
    <main className="flex-1 flex flex-col pt-4 overflow-hidden">
      {/* Système d'onglets */}
      <div className="flex justify-center px-6">
        <Tabs value={activeDashboardId} onValueChange={setActiveDashboardId} className="w-auto">
          <TabsList>
            {dashboards.map(dashboard => (
              <TabsTrigger 
                key={dashboard.id} 
                value={dashboard.id}
                onDoubleClick={() => setEditingTabId(dashboard.id)}
              >
                {editingTabId === dashboard.id ? (
                  <Input
                    autoFocus
                    defaultValue={dashboard.name}
                    onBlur={(e) => {
                      handleRenameDashboard(dashboard.id, e.target.value);
                      setEditingTabId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameDashboard(dashboard.id, e.currentTarget.value);
                        setEditingTabId(null);
                      }
                    }}
                    className="h-6 px-1 text-center"
                  />
                ) : (
                  <span>{dashboard.name}</span>
                )}
              </TabsTrigger>
            ))}
            <Button onClick={handleAddDashboard} size="sm" variant="ghost" className="h-8 w-8 p-0 ml-2">
              <Plus className="w-4 h-4" />
            </Button>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenu du dashboard actif */}
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <div className="dashboard-grid pb-6">
            {activeDashboard && (
              <>
                {activeDashboard.sectionWidgets.map(renderSectionWidget)}
                {activeDashboard.tableWidgets.map(renderTableWidget)}
                {activeDashboard.chartWidgets.map(renderChartWidget)}
                {activeDashboard.sectionWidgets.length === 0 && activeDashboard.tableWidgets.length === 0 && activeDashboard.chartWidgets.length === 0 && (
                  <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('dashboard-create-widget', { detail: { type: 'chart-bar' } }))}
                    className="dashboard-grid-item-w3 dashboard-grid-item-h2 bg-white/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/25 transition-colors cursor-pointer group min-h-[160px]"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Plus className="w-8 h-8 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-700">Créer un widget</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Cliquez ici pour ajouter votre premier widget au dashboard
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modales d'édition */}
      <FullScreenTableEditor isOpen={showTableEditor} onClose={() => setShowTableEditor(false)} onSave={handleSaveTable} existingData={editingTable} />
      <FullScreenSpreadsheet isOpen={showSpreadsheet} onClose={() => setShowSpreadsheet(false)} onSave={handleSaveChart} newChartType={selectedWidgetType === 'chart-bar' ? 'bar' : selectedWidgetType === 'chart-line' ? 'line' : undefined} existingData={editingChart} />
    </main>
  );
} 