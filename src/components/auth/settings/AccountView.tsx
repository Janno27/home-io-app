import { ArrowLeft } from 'lucide-react';

interface AccountViewProps {
  onBack: () => void;
}

export function AccountView({ onBack }: AccountViewProps) {
  return (
    <div className="p-2">
      <div className="flex items-center mb-2">
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full mr-2"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-medium text-gray-800">Mon Compte</h3>
      </div>
      <div className="text-center py-8">
        <p className="text-xs text-gray-500">
          La gestion du compte sera bientôt disponible ici.
        </p>
      </div>
    </div>
  );
}
