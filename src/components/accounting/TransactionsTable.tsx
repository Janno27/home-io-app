import { Receipt, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { TransactionWithDetails } from '@/hooks/useAccounting';
import { TransactionContextMenu } from './TransactionContextMenu';
import { DeleteTransactionDialog } from './DeleteTransactionDialog';
import { EditTransactionDialog } from './EditTransactionDialog';

interface TransactionsTableProps {
  transactions: TransactionWithDetails[];
  formatAmount: (amount: number) => string;
  onOpenExpenseModal?: () => void;
  onOpenIncomeModal?: () => void;
}

type SortField = 'accounting_date' | 'amount';
type SortDirection = 'asc' | 'desc';

export function TransactionsTable({ 
  transactions, 
  formatAmount, 
  onOpenExpenseModal, 
  onOpenIncomeModal 
}: TransactionsTableProps) {
  const [sortField, setSortField] = useState<SortField>('accounting_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    transaction: TransactionWithDetails | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    transaction: null,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Fermer le menu contextuel
  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      transaction: null,
    });
  }, []);

  // Gérer les clics en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortField === 'accounting_date') {
      aValue = new Date(a.accounting_date).getTime();
      bValue = new Date(b.accounting_date).getTime();
    } else if (sortField === 'amount') {
      aValue = Math.abs(a.net_amount !== undefined ? a.net_amount : a.amount);
      bValue = Math.abs(b.net_amount !== undefined ? b.net_amount : b.amount);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-3 h-3" />; // Placeholder pour maintenir l'alignement
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  const handleContextMenu = (e: React.MouseEvent, transaction: TransactionWithDetails) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculer la position du menu en tenant compte des limites de l'écran
    const rect = tableRef.current?.getBoundingClientRect();
    const menuWidth = 140; // Largeur approximative du menu
    const menuHeight = 80; // Hauteur approximative du menu
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Ajuster si le menu dépasse à droite
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    
    // Ajuster si le menu dépasse en bas
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }
    
    setContextMenu({
      isOpen: true,
      position: { x, y },
      transaction,
    });
  };

  const handleEdit = () => {
    if (contextMenu.transaction) {
      setSelectedTransaction(contextMenu.transaction);
      setShowEditDialog(true);
      closeContextMenu();
    }
  };

  const handleDelete = () => {
    if (contextMenu.transaction) {
      setSelectedTransaction(contextMenu.transaction);
      setShowDeleteDialog(true);
      closeContextMenu();
    }
  };

  return (
    <>
      <div 
        ref={tableRef}
        className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg h-[calc(100vh-200px)] flex flex-col overflow-hidden relative"
      >
        {/* En-têtes du tableau avec bordures et tri */}
        <div className="grid grid-cols-3 gap-0 bg-gray-50/60 border-b border-gray-200/60">
          <button
            onClick={() => handleSort('accounting_date')}
            className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200/40 hover:bg-gray-100/50 transition-colors flex items-center justify-between group"
          >
            <span>Date</span>
            <SortIcon field="accounting_date" />
          </button>
          <div className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200/40">
            Catégorie
          </div>
          <button
            onClick={() => handleSort('amount')}
            className="px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide hover:bg-gray-100/50 transition-colors flex items-center justify-end group"
          >
            <span>Montant</span>
            <SortIcon field="amount" />
          </button>
        </div>

        {/* Contenu du tableau */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {sortedTransactions.length > 0 ? (
            <div>
              {sortedTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className={`grid grid-cols-3 gap-0 hover:bg-white/20 transition-colors group cursor-context-menu ${
                    index !== sortedTransactions.length - 1 ? 'border-b border-gray-200/30' : ''
                  }`}
                  onContextMenu={(e) => handleContextMenu(e, transaction)}
                >
                  <div className="px-3 py-2.5 text-xs text-gray-700 border-r border-gray-200/30 flex items-center">
                    {formatDate(transaction.accounting_date)}
                  </div>
                  <div className="px-3 py-2.5 border-r border-gray-200/30 flex items-center">
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {transaction.category_name}
                      </div>
                      {transaction.subcategory_name && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {transaction.subcategory_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-2.5 text-xs font-medium text-right flex items-center justify-end ${
                    transaction.category_type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <span>
                      {transaction.category_type === 'expense' ? '-' : '+'}
                      {formatAmount(Math.abs(transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount))}
                      {transaction.total_refunded > 0 && (
                        <div className="text-xs text-blue-600 block mt-0.5">
                          Remboursé: {formatAmount(transaction.total_refunded)}
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="w-12 h-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Aucune transaction
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Commencez par ajouter vos premières transactions
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenExpenseModal}
                  className="text-xs h-8"
                >
                  Ajouter une dépense
                </Button>
                <Button
                  size="sm"
                  onClick={onOpenIncomeModal}
                  className="text-xs h-8"
                >
                  Ajouter un revenu
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions rapides */}
        {sortedTransactions.length > 0 && (
          <div className="px-3 py-2.5 border-t border-gray-200/60 bg-gray-50/40">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {sortedTransactions.length} transaction{sortedTransactions.length > 1 ? 's' : ''} récente{sortedTransactions.length > 1 ? 's' : ''}
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onOpenExpenseModal}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50/50 h-7"
                >
                  + Dépense
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onOpenIncomeModal}
                  className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50/50 h-7"
                >
                  + Revenu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <TransactionContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />

      {/* Edit Dialog */}
      <EditTransactionDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
}