import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_system?: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  is_system?: boolean;
}

interface SubCategoryFormProps {
  type: 'income' | 'expense';
  categories: Category[]; // Catégories disponibles pour la sélection
  subCategory?: SubCategory; // Pour l'édition
  onSubmit: (name: string, categoryId: string) => Promise<void>;
  onCancel: () => void;
}

export function SubCategoryForm({ type, categories, subCategory, onSubmit, onCancel }: SubCategoryFormProps) {
  const [name, setName] = useState(subCategory?.name || '');
  const [categoryId, setCategoryId] = useState(subCategory?.category_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrer les catégories selon le type (inclure toutes les catégories)
  const availableCategories = categories.filter(cat => 
    cat.type === type
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), categoryId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!subCategory;
  const typeLabel = type === 'expense' ? 'dépense' : 'revenu';

  return (
    <>
      {/* Header avec bouton retour */}
      <div className="px-3 py-2 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Retour</span>
        </button>
      </div>

      {/* Formulaire */}
      <div className="px-3 py-3">
        <h3 className="text-xs font-medium text-gray-900 mb-4">
          {isEditing ? 'Modifier la sous-catégorie' : `Nouvelle sous-catégorie de ${typeLabel}`}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="category-select" className="text-xs font-medium text-gray-700">
                Catégorie parente
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isEditing}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Aucune catégorie disponible. Créez d'abord une catégorie.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="subcategory-name" className="text-xs font-medium text-gray-700">
                Nom de la sous-catégorie
              </Label>
              <Input
                id="subcategory-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Ex: ${type === 'expense' ? 'Cours en ligne' : 'Commissions'}`}
                className="mt-1 text-xs"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || !categoryId || isSubmitting || availableCategories.length === 0}
              className={`text-xs ${
                type === 'expense' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
} 