import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_system?: boolean;
}

interface CategoryFormProps {
  type: 'income' | 'expense';
  category?: Category; // Pour l'édition
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ type, category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!category;
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
          {isEditing ? 'Modifier la catégorie' : `Nouvelle catégorie de ${typeLabel}`}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="category-name" className="text-xs font-medium text-gray-700">
                Nom de la catégorie
              </Label>
              <Input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Ex: ${type === 'expense' ? 'Éducation' : 'Freelance'}`}
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
              disabled={!name.trim() || isSubmitting}
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