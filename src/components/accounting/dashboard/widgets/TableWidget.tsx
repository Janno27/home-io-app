import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableWidgetProps {
  title: string;
  headers: string[];
  rows: Array<string[]>;
  maxRows?: number;
  onEdit?: () => void;
}

export function TableWidget({ title, headers, rows, maxRows = 10, onEdit }: TableWidgetProps) {
  const displayRows = rows.slice(0, maxRows);

  return (
    <div className="h-full bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 text-left">{title}</h3>
        {onEdit && (
          <Button
            onClick={onEdit}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto -mx-6 -mb-6">
        <div className="h-full overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white/40 backdrop-blur-sm">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="text-xs font-semibold text-gray-600 p-3 first:pl-6 last:pr-6">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.length > 0 ? (
                displayRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-white/10">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="text-sm text-gray-700 p-3 first:pl-6 last:pr-6 truncate">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length || 1} className="p-6 text-center text-sm text-gray-500">
                    Aucune donnée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 