import { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthContext } from './AuthProvider';
import { useOrganizations } from '@/hooks/useOrganizations';
import { toast } from 'sonner';
import { MainView, OrganizationsView, AccountingView } from './settings';

export function UserMenu() {
  const { user, signOut } = useAuthContext();
  const [currentView, setCurrentView] = useState<'main' | 'organizations' | 'accounting'>('main');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
    }
  };

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  
  // Ajuster la largeur selon la vue
  const getPopoverWidth = () => {
    switch (currentView) {
      case 'accounting':
        return 'w-80'; // Large pour les catégories
      case 'organizations':
        return 'w-96'; // Plus large pour la gestion des organisations et membres
      default:
        return 'w-48'; // Compact pour le menu principal
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-full relative"
        >
          <User className="w-4 h-4" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={`${getPopoverWidth()} p-0.5 bg-white border border-gray-200 shadow-sm rounded-md`}
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {currentView === 'main' ? (
          <MainView
            userName={userName}
            userEmail={user.email || ''}
            onViewChange={setCurrentView}
            onSignOut={handleSignOut}
          />
        ) : currentView === 'organizations' ? (
          <OrganizationsView
            onBack={() => setCurrentView('main')}
          />
        ) : (
          <AccountingView
            onBack={() => setCurrentView('main')}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}