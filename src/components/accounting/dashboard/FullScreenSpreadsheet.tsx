import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect, useCallback } from 'react';

export interface ChartData {
  id: string;
  title: string;
  type: 'bar' | 'line';
  data: Array<{
    label: string;
    value: number;
  }>;
}

interface FullScreenSpreadsheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ChartData) => void;
  newChartType?: 'bar' | 'line';
  existingData?: ChartData | null;
}

export function FullScreenSpreadsheet({ isOpen, onClose, onSave, newChartType, existingData }: FullScreenSpreadsheetProps) {
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [rows] = useState(20); // Moins de lignes par défaut
  const [cols] = useState(2);  // Focus sur 2 colonnes : label et valeur
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [cellData, setCellData] = useState<Map<string, string>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Initialiser avec les données existantes si fourni
  useEffect(() => {
    if (existingData && isOpen) {
      setTitle(existingData.title);
      setChartType(existingData.type);
      
      const newCellData = new Map<string, string>();
      existingData.data.forEach((item, index) => {
        newCellData.set(`${index}-0`, item.label);
        newCellData.set(`${index}-1`, item.value.toString());
      });
      setCellData(newCellData);
    } else if (isOpen && !existingData) {
      // Réinitialiser pour un nouveau graphique
      setTitle('');
      setChartType(newChartType || 'bar');
      setCellData(new Map());
      setSelectedCell(null);
      setIsEditing(false);
    }
  }, [existingData, isOpen, newChartType]);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCellValue = (row: number, col: number) => {
    return cellData.get(getCellKey(row, col)) || '';
  };

  const setCellValue = (row: number, col: number, value: string) => {
    const newCellData = new Map(cellData);
    if (value.trim() === '') {
      newCellData.delete(getCellKey(row, col));
    } else {
      newCellData.set(getCellKey(row, col), value);
    }
    setCellData(newCellData);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setIsEditing(false);
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setIsEditing(true);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    setSelectedCell(null);
  }

  // Navigation clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    switch (e.key) {
      case 'ArrowUp':
        if (row > 0) {
          setSelectedCell({ row: row - 1, col });
          setIsEditing(false);
        }
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (row < rows - 1) {
          setSelectedCell({ row: row + 1, col });
          setIsEditing(false);
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (col > 0) {
          setSelectedCell({ row, col: col - 1 });
          setIsEditing(false);
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (col < cols - 1) {
          setSelectedCell({ row, col: col + 1 });
          setIsEditing(false);
        }
        e.preventDefault();
        break;
      case 'Enter':
        if (isEditing) {
          setIsEditing(false);
        } else if (row < rows - 1) {
          setSelectedCell({ row: row + 1, col });
        }
        e.preventDefault();
        break;
      case 'Tab':
        if (col < cols - 1) {
          setSelectedCell({ row, col: col + 1 });
        } else if (row < rows - 1) {
          setSelectedCell({ row: row + 1, col: 0 });
        }
        setIsEditing(false);
        e.preventDefault();
        break;
      case 'F2':
        setIsEditing(true);
        e.preventDefault();
        break;
      case 'Escape':
        setIsEditing(false);
        e.preventDefault();
        break;
      case 'Delete':
        if (!isEditing) {
          setCellValue(row, col, '');
        }
        break;
      default:
        // Si l'utilisateur commence à taper, on passe en mode édition
        if (!isEditing && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setCellValue(row, col, '');
          setIsEditing(true);
        }
        break;
    }
  }, [selectedCell, isEditing, rows, cols]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const extractChartData = () => {
    const data: Array<{ label: string; value: number }> = [];
    
    // Parcourir toutes les lignes pour détecter les données
    for (let row = 0; row < rows; row++) {
      const label = getCellValue(row, 0).trim();
      const valueStr = getCellValue(row, 1).trim();
      
      if (label && valueStr) {
        const value = parseFloat(valueStr);
        if (!isNaN(value)) {
          data.push({ label, value });
        }
      }
    }
    
    return data;
  };

  const handleSave = () => {
    // Auto-save si il y a des données valides (même sans titre)
    const data = extractChartData();
    if (data.length > 0) {
      // Créer un titre par défaut si aucun titre n'est fourni
      const finalTitle = title.trim() || `Graphique ${new Date().toLocaleDateString()}`;
      
      const chartData: ChartData = {
        id: existingData?.id || `chart-${Date.now()}`,
        title: finalTitle,
        type: chartType,
        data
      };
      
      onSave(chartData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-0 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden max-h-[70vh]">
        {/* Header simplifié pour le titre */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 shrink-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom du graphique..."
            className="w-64 text-base font-medium border-none focus:ring-0 p-0 bg-transparent"
          />
        </div>

        {/* Tableau */}
        <div className="flex-1 min-h-0 overflow-auto" ref={tableRef}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-10 h-8 border-b border-r border-gray-300 bg-gray-100 text-xs font-medium text-gray-500"></th>
                {Array.from({ length: cols }, (_, i) => (
                  <th
                    key={i}
                    className="min-w-[150px] h-8 border-b border-gray-300 bg-gray-100 text-xs font-medium text-gray-500"
                  >
                    {i === 0 ? 'Libellé (A)' : 'Valeur (B)'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="w-10 h-8 border-r border-gray-300 bg-gray-100 text-xs text-center font-medium text-gray-500">
                    {rowIndex + 1}
                  </td>
                  {Array.from({ length: cols }, (_, colIndex) => {
                    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                    const cellValue = getCellValue(rowIndex, colIndex);
                    
                    return (
                      <td
                        key={colIndex}
                        className={`border-r border-gray-200 p-0 h-8 ${
                          isSelected ? 'ring-2 ring-blue-500 z-10' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                      >
                        {isSelected && isEditing ? (
                          <Input
                            autoFocus
                            value={cellValue}
                            onChange={(e) => setCellValue(rowIndex, colIndex, e.target.value)}
                            onBlur={handleInputBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                handleInputBlur();
                              }
                            }}
                            className="w-full h-full border-0 rounded-none focus:ring-0 px-2 text-sm bg-blue-50"
                          />
                        ) : (
                          <div className="w-full h-full px-2 py-1 text-sm flex items-center truncate">
                            {cellValue}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end shrink-0">
          <Button onClick={handleSave} size="sm">
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 