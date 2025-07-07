import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Organization {
  id: string;
  name: string;
  description?: string | null;
}

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (name: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function OrganizationForm({ organization, onSubmit, onCancel }: OrganizationFormProps) {
  const [name, setName] = useState(organization?.name || '');
  const [description, setDescription] = useState(organization?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), description.trim() || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!organization;

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
          {isEditing ? 'Modifier l\'organisation' : 'Nouvelle organisation'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="org-name" className="text-xs font-medium text-gray-700">
                Nom de l'organisation
              </Label>
              <Input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mon Entreprise"
                className="mt-1 text-xs"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="org-description" className="text-xs font-medium text-gray-700">
                Description (optionnel)
              </Label>
              <Textarea
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'organisation..."
                className="mt-1 text-xs resize-none"
                rows={3}
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
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
} 