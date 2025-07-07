import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemberFormProps {
  onSubmit: (email: string, role: 'admin' | 'member') => Promise<void>;
  onCancel: () => void;
}

export function MemberForm({ onSubmit, onCancel }: MemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim(), role);
      setEmail('');
      setRole('member');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Inviter un membre
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <Label htmlFor="member-email" className="text-xs font-medium text-gray-700">
                Adresse email
              </Label>
              <Input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="mt-1 text-xs"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="member-role" className="text-xs font-medium text-gray-700">
                Rôle
              </Label>
              <Select value={role} onValueChange={(value: 'admin' | 'member') => setRole(value)}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member" className="text-xs">
                    Membre - Accès limité
                  </SelectItem>
                  <SelectItem value="admin" className="text-xs">
                    Admin - Accès complet
                  </SelectItem>
                </SelectContent>
              </Select>
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
              disabled={!email.trim() || isSubmitting}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Invitation...' : 'Inviter'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
} 