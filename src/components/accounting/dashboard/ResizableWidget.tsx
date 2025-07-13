import { useState, ReactNode, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { GripVertical, GripHorizontal, Trash2 } from 'lucide-react';

export interface WidgetSize {
  width: number; // Nombre de colonnes
  height: number; // Nombre de lignes
}

interface ResizableWidgetProps {
  children: ReactNode;
  id: string;
  size: WidgetSize;
  isEditMode: boolean;
  onResize: (id: string, newSize: WidgetSize) => void;
  onDelete?: (id: string) => void;
}

export function ResizableWidget({
  id,
  children,
  size,
  onResize,
  isEditMode,
  onDelete
}: ResizableWidgetProps) {
  const [isDragging, setIsDragging] = useState<'width' | 'height' | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const originalSize = useRef<WidgetSize>({ width: 1, height: 1 });
  const currentSize = useRef<WidgetSize>({ width: 1, height: 1 });

  const handleMouseDown = (e: React.MouseEvent, type: 'width' | 'height') => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(type);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    originalSize.current = { ...size };
    currentSize.current = { ...size };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      let newSize = { ...originalSize.current };
      
      if (type === 'width') {
        // Redimensionnement largeur : chaque 120px = 1 colonne pour plus de fluidité
        const deltaColumns = Math.round(deltaX / 120);
        newSize.width = Math.max(1, Math.min(12, originalSize.current.width + deltaColumns));
      } else if (type === 'height') {
        // Redimensionnement hauteur : chaque 80px = 1 ligne pour plus de fluidité
        const deltaRows = Math.round(deltaY / 80);
        newSize.height = Math.max(1, Math.min(6, originalSize.current.height + deltaRows));
      }
      
      // Appliquer le redimensionnement seulement si la taille a changé
      if (newSize.width !== currentSize.current.width || newSize.height !== currentSize.current.height) {
        currentSize.current = newSize;
        onResize(id, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getSizeText = () => {
    return `${size.width}×${size.height}`;
  };

  return (
    <div 
      className="relative" 
      style={{ 
        gridColumn: `span ${size.width}`, 
        gridRow: `span ${size.height}`,
        minHeight: '80px' 
      }}
    >
      {/* Contenu du widget */}
      <div className="h-full">
        {children}
      </div>

      {/* Overlay de mode édition */}
      {isEditMode && (
        <>
          {/* Overlay avec bordure bleue */}
          <div className="absolute inset-0 border-2 border-blue-500 bg-blue-500/10 rounded-xl pointer-events-none z-10">
            {/* Indicateur de taille */}
            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
              {getSizeText()}
            </div>
          </div>

          {/* Bouton de suppression */}
          {onDelete && (
            <Button
              onClick={() => onDelete(id)}
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full z-20"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}

          {/* Poignée de redimensionnement largeur (droite) */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'width')}
            className={`absolute top-1/2 -right-1 -translate-y-1/2 w-4 h-12 bg-blue-500 rounded-l cursor-col-resize z-20 flex items-center justify-center hover:bg-blue-600 transition-colors group ${
              isDragging === 'width' ? 'bg-blue-600 shadow-lg' : ''
            }`}
            title="Redimensionner la largeur"
          >
            <GripVertical className="w-3 h-3 text-white" />
            {isDragging === 'width' && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Largeur: {size.width}
              </div>
            )}
          </div>

          {/* Poignée de redimensionnement hauteur (bas) */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'height')}
            className={`absolute left-1/2 -bottom-1 -translate-x-1/2 w-12 h-4 bg-blue-500 rounded-t cursor-row-resize z-20 flex items-center justify-center hover:bg-blue-600 transition-colors group ${
              isDragging === 'height' ? 'bg-blue-600 shadow-lg' : ''
            }`}
            title="Redimensionner la hauteur"
          >
            <GripHorizontal className="w-3 h-3 text-white" />
            {isDragging === 'height' && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Hauteur: {size.height}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 