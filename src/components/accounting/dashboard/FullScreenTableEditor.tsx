import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

export interface TableData {
  id: string;
  title: string;
  headers: string[];
  rows: Array<string[]>;
}

interface FullScreenTableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TableData) => void;
  existingData?: TableData | null;
}

export function FullScreenTableEditor({ isOpen, onClose, onSave, existingData }: FullScreenTableEditorProps) {
  const [title, setTitle] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingData) {
      setTitle(existingData.title);
      setHeaders(existingData.headers);
      setRows(existingData.rows.map(row => row.slice()));
    } else {
      setHeaders(['Colonne 1', 'Colonne 2']);
      setRows(Array(10).fill(['', '']));
    }
  }, [existingData]);

  const getCellValue = (row: number, col: number) => rows[row][col] || '';

  const setCellValue = (row: number, col: number, value: string) => {
    const newRows = [...rows];
    newRows[row][col] = value;
    setRows(newRows);
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, `Colonne ${String.fromCharCode(65 + headers.length)}`]);
  };

  const removeHeader = (indexToRemove: number) => {
    if (headers.length <= 1) return;

    setHeaders(headers.filter((_, index) => index !== indexToRemove));
    
    const newRows = rows.map(row => {
      const newRow = [];
      for (let c = 0; c < headers.length; c++) {
        if (c === indexToRemove) continue;
        newRow.push(row[c]);
      }
      return newRow;
    });
    setRows(newRows);
  };

  const handleSave = () => {
    const finalTitle = title.trim() || `Tableau ${new Date().toLocaleDateString()}`;
    const finalHeaders = headers.map(h => h.trim()).filter(h => h);
    
    const tableRows: string[][] = [];
    for (let r = 0; r < rows.length; r++) {
      const rowData = [];
      let hasData = false;
      for (let c = 0; c < finalHeaders.length; c++) {
        const cellValue = getCellValue(r, c);
        rowData.push(cellValue);
        if(cellValue.trim() !== '') hasData = true;
      }
      if(hasData) {
        tableRows.push(rowData);
      }
    }

    if (finalHeaders.length > 0 && tableRows.length > 0) {
      onSave({
        id: existingData?.id || `table-${Date.now()}`,
        title: finalTitle,
        headers: finalHeaders,
        rows: tableRows
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] p-0 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden max-h-[70vh]">
        {/* Header simplifié pour le titre */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 shrink-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom du tableau..."
            className="w-64 text-base font-medium border-none focus:ring-0 p-0 bg-transparent"
          />
        </div>

        {/* Table Editor */}
        <div className="flex-1 min-h-0 overflow-auto" ref={tableRef}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="min-w-[180px] h-8 border-b border-r border-gray-300 p-0 relative group">
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                      className="w-full h-full border-0 rounded-none bg-gray-100 text-center font-medium text-sm"
                    />
                    {headers.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 bg-gray-100 hover:bg-gray-200"
                        onClick={() => removeHeader(colIndex)}
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </Button>
                    )}
                  </th>
                ))}
                <th className="w-10 h-8 border-b border-gray-300 bg-gray-100">
                  <Button size="icon" variant="ghost" onClick={addHeader} className="w-full h-full">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((_, colIndex) => (
                    <td key={colIndex} className="border-r border-gray-200 p-0 h-8">
                      <Input
                        value={getCellValue(rowIndex, colIndex)}
                        onChange={(e) => setCellValue(rowIndex, colIndex, e.target.value)}
                        className="w-full h-full border-0 rounded-none focus:ring-1 focus:ring-blue-500 px-2 text-sm"
                      />
                    </td>
                  ))}
                  <td className="w-10 h-8"></td>
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