import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAccounting } from '@/hooks/useAccounting';
import { toast } from 'sonner';
import type { TransactionWithDetails } from '@/hooks/useAccounting';

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionWithDetails | null;
}

export function DeleteTransactionDialog({
  isOpen,
  onClose,
  transaction,
}: DeleteTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const { deleteTransaction, refetch } = useAccounting();

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await deleteTransaction(transaction.id);
      if (error) {
        toast.error('Erreur lors de la suppression');
      } else {
        toast.success('Transaction supprimée avec succès');
        await refetch();
        onClose();
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-gray-100/50">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Supprimer la transaction
                </h2>
                <p className="text-gray-600 text-sm text-left">
                  Cette action est irréversible
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50/70 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Transaction à supprimer :</div>
              <div className="space-y-1">
                <div className="font-medium text-gray-800">
                  {transaction.category_name}
                  {transaction.subcategory_name && (
                    <span className="text-gray-500"> • {transaction.subcategory_name}</span>
                  )}
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.category_type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.category_type === 'expense' ? '-' : '+'}
                  {formatAmount(Math.abs(transaction.net_amount || transaction.amount))}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.accounting_date).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action supprimera également tous les remboursements associés.
            </p>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Supprimer'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}