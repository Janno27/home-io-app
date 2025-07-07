import { useRef } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionContextMenu({
  isOpen,
  position,
  onClose: _onClose,
  onEdit,
  onDelete,
}: TransactionContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Empêcher la propagation des clics dans le menu
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Empêcher le menu contextuel par défaut sur le menu lui-même
  const handleMenuContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-white/98 backdrop-blur-sm rounded-md shadow-lg border border-gray-200/80 py-1 min-w-[120px] animate-in fade-in-0 zoom-in-95 duration-75"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={handleMenuClick}
      onContextMenu={handleMenuContextMenu}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="w-full justify-start px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100/60 rounded-none mx-0 h-auto font-normal"
      >
        <Edit className="w-3 h-3 mr-2" />
        Modifier
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-full justify-start px-2 py-1.5 text-xs text-red-600 hover:bg-red-50/60 rounded-none mx-0 h-auto font-normal"
      >
        <Trash2 className="w-3 h-3 mr-2" />
        Supprimer
      </Button>
    </div>
  );
}