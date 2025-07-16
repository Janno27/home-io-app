import { LogOut, Building, Calculator, User } from 'lucide-react';
import type { Page } from '@/hooks/useNavigation';

interface MainViewProps {
  userName: string;
  userEmail: string;
  onViewChange: (view: 'organizations' | 'accounting' | 'account') => void;
  onSignOut: () => void;
  currentPage: Page;
}

export function MainView({ userName, userEmail, onViewChange, onSignOut, currentPage }: MainViewProps) {
  const showAccounting = currentPage.startsWith('accounting') || currentPage === 'dashboard';

  return (
    <>
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-900 truncate">
          {userName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {userEmail}
        </p>
      </div>
      
      <div className="py-1">
        <button
          onClick={() => onViewChange('account')}
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-sm transition-colors text-left"
        >
          <User className="w-3 h-3 text-gray-500" />
          <span>Mon Compte</span>
        </button>
        <button
          onClick={() => onViewChange('organizations')}
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-sm transition-colors text-left"
        >
          <Building className="w-3 h-3 text-gray-500" />
          <span>Mon Foyer</span>
        </button>
        
        {showAccounting && (
          <button
            onClick={() => onViewChange('accounting')}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-sm transition-colors text-left"
          >
            <Calculator className="w-3 h-3 text-gray-500" />
            <span>Mes Catégories</span>
          </button>
        )}
        
        <div className="my-1 border-t border-gray-100" />

        <button
          onClick={onSignOut}
          className="w-full flex items-center space-x-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-sm transition-colors text-left"
        >
          <LogOut className="w-3 h-3 text-red-500" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );
} 