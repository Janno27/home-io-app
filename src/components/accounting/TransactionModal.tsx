import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccounting } from '@/hooks/useAccounting';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/DatePicker';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'expense' | 'income';
}

export function TransactionModal({ isOpen, onClose, type }: TransactionModalProps) {
  const {
    expenseCategories,
    incomeCategories,
    getSubCategoriesForCategory,
    createTransaction,
    refetch,
  } = useAccounting();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    accounting_date: new Date().toISOString().split('T')[0],
    category_id: '',
    subcategory_id: '',
  });

  const categories = type === 'expense' ? expenseCategories : incomeCategories;
  const subCategories = formData.category_id ? getSubCategoriesForCategory(formData.category_id) : [];

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        amount: '',
        description: '',
        transaction_date: today,
        accounting_date: today,
        category_id: '',
        subcategory_id: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const { error } = await createTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        transaction_date: formData.transaction_date,
        accounting_date: formData.accounting_date,
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id || undefined,
      });

      if (error) {
        toast.error('Erreur lors de la création de la transaction');
      } else {
        toast.success(`${type === 'expense' ? 'Dépense' : 'Revenu'} ajouté avec succès !`);
        await refetch();
        onClose();
      }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Ajouter {type === 'expense' ? 'une dépense' : 'un revenu'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pt-4">
          <p className="text-sm text-gray-600 text-left">
            Remplissez les informations ci-dessous pour ajouter une nouvelle transaction.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-900 text-left block">
              Montant
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="h-10 border-gray-300 rounded-lg"
              required
            />
          </div>

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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              id="transaction_date"
              label="Date"
              value={formData.transaction_date}
              onChange={(value) => handleInputChange('transaction_date', value)}
              disabled
            />

            <DatePicker
              id="accounting_date"
              label="Date comptable"
              value={formData.accounting_date}
              onChange={(value) => handleInputChange('accounting_date', value)}
              required
            />
            <Button
              type="submit"
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
        </form>
      </div>
    </div>
  );
}