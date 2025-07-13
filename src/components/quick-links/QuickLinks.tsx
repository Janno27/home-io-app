import React from 'react';
import { useQuickLinks } from '@/hooks/useQuickLinks';
import { QuickLinkItem } from './QuickLinkItem';
import { AddLinkPopover } from './AddLinkPopover';
import { Plus, Loader2 } from 'lucide-react';

const PlaceholderButton = React.forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode }
>(({ children, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    className="w-16 h-16 rounded-full bg-white/10 border border-dashed border-white/20 flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:border-solid"
  >
    {children}
  </button>
));
PlaceholderButton.displayName = "PlaceholderButton";

export function QuickLinks() {
  const { links, loading, addLink, deleteLink } = useQuickLinks();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-16">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      );
    }
    
    // Si pas de liens, afficher les placeholders
    if (links.length === 0) {
      return Array(5).fill(0).map((_, index) => (
        <AddLinkPopover key={index} onAddLink={addLink}>
          <PlaceholderButton>
            <Plus className="w-6 h-6 text-gray-400" />
          </PlaceholderButton>
        </AddLinkPopover>
      ));
    }

    // Si des liens existent, les afficher + un bouton d'ajout
    return (
      <>
        {links.map((link) => (
          <QuickLinkItem key={link.id} id={link.id} link={link} onDelete={() => deleteLink(link.id)} />
        ))}
        <AddLinkPopover onAddLink={addLink}>
          <button className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-200 hover:bg-white/20 hover:scale-105" title="Ajouter un favori">
            <Plus className="w-6 h-6 text-gray-400" />
          </button>
        </AddLinkPopover>
      </>
    );
  };

  return (
    <div className="w-full flex items-center justify-center space-x-4 p-2">
      {renderContent()}
    </div>
  );
}