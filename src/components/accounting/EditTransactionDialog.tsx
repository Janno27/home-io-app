import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAccounting } from '@/hooks/useAccounting';
import { toast } from 'sonner';
import type { TransactionWithDetails } from '@/hooks/useAccounting';
import { DatePicker } from '@/components/ui/DatePicker';

interface EditTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionWithDetails | null;
}

export function EditTransactionDialog({
  isOpen,
  onClose,
  transaction,
}: EditTransactionDialogProps) {
  const {
    expenseCategories,
    incomeCategories,
    getSubCategoriesForCategory,
    getRefundsForTransaction,
    updateTransaction,
    createRefund,
    refetch,
  } = useAccounting();

  const [loading, setLoading] = useState(false);
  const [showRefundSection, setShowRefundSection] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [createRefundMode, setCreateRefundMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    accounting_date: '',
    category_id: '',
    subcategory_id: '',
  });

  const categories = transaction?.category_type === 'expense' ? expenseCategories : incomeCategories;
  const subCategories = formData.category_id ? getSubCategoriesForCategory(formData.category_id) : [];
  const existingRefunds = transaction ? getRefundsForTransaction(transaction.id) : [];

  // Initialiser le formulaire avec les données de la transaction
  useEffect(() => {
    if (isOpen && transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        accounting_date: transaction.accounting_date,
        category_id: transaction.category_id,
        subcategory_id: transaction.subcategory_id || '',
      });
      setShowRefundSection(transaction.category_type === 'expense');
      setRefundAmount('');
      setCreateRefundMode(false);
      setShowDetails(false);
    }
  }, [isOpen, transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mettre à jour la transaction
      const { error: updateError } = await updateTransaction(transaction.id, {
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        accounting_date: formData.accounting_date,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || undefined,
      });

      if (updateError) {
        toast.error('Erreur lors de la mise à jour');
        return;
      }

      // Créer un remboursement si demandé
      if (createRefundMode && refundAmount && parseFloat(refundAmount) > 0) {
        const { error: refundError } = await createRefund({
          transaction_id: transaction.id,
          amount: parseFloat(refundAmount),
          refund_date: new Date().toISOString().split('T')[0],
          description: undefined,
        });

        if (refundError) {
          toast.error('Erreur lors de la création du remboursement');
          return;
        }
      }

      toast.success('Transaction mise à jour avec succès');
      await refetch();
      onClose();
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      ...(field === 'category_id' ? { subcategory_id: '' } : {})
    }));
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Modifier la transaction
            </h2>
            <p className="text-sm text-gray-600 mt-1 text-left">
              Modifiez les détails de la transaction ici. Cliquez sur enregistrer une fois terminé.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Transaction Summary */}
            {!showDetails && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  Votre {transaction.category_type === 'expense' ? 'dépense' : 'revenu'} de{' '}
                  <span className="font-semibold">{formatAmount(transaction.amount)}</span> liée à{' '}
                  <span className="font-semibold">
                    {transaction.subcategory_name || transaction.category_name}
                  </span>
                  {transaction.subcategory_name && (
                    <>
                      {' '}de la catégorie <span className="font-semibold">{transaction.category_name}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <DatePicker
              id="accounting_date"
              label="Date comptable"
              value={formData.accounting_date}
              onChange={(value) => handleInputChange('accounting_date', value)}
              required
            />

            {/* Informations détaillées - Collapsible */}
            <div className="border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Informations détaillées</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              
              {showDetails && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
                  {/* Montant */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-900 text-left block">
                      Montant
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      className="h-10 border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Catégorie */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-900 text-left block">
                      Catégorie
                    </Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger className="h-10 border-gray-300 rounded-lg">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sous-catégorie */}
                  {subCategories.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory" className="text-sm font-medium text-gray-900 text-left block">
                        Sous-catégorie (optionnel)
                      </Label>
                      <Select
                        value={formData.subcategory_id}
                        onValueChange={(value) => handleInputChange('subcategory_id', value)}
                      >
                        <SelectTrigger className="h-10 border-gray-300 rounded-lg">
                          <SelectValue placeholder="Sélectionner une sous-catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id}>
                              {subCategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-900 text-left block">
                      Description (optionnel)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Description de la transaction"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-gray-300 rounded-lg resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section Remboursements pour les dépenses */}
            {showRefundSection && (
              <div className="space-y-4">
                {/* Remboursements existants */}
                {existingRefunds.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Remboursements existants :</h4>
                    <div className="space-y-2">
                      {existingRefunds.map((refund) => (
                        <div key={refund.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {formatDate(refund.refund_date)} par {refund.user_name || refund.user_email}
                          </span>
                          <span className="text-blue-600 font-medium">
                            +{formatAmount(refund.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nouveau remboursement */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Remboursement</h4>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="create-refund" className="text-xs text-gray-600">
                        Créer une transaction de remboursement
                      </Label>
                      <Switch
                        id="create-refund"
                        checked={createRefundMode}
                        onCheckedChange={setCreateRefundMode}
                      />
                    </div>
                  </div>

                  {createRefundMode && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="refund-amount" className="text-sm font-medium text-gray-900 text-left block">
                          Montant du remboursement
                        </Label>
                        <Input
                          id="refund-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="h-10 border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}