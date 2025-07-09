import { User, X } from 'lucide-react';
// import { Avatar } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { NoteCollaborator } from './types';

interface NoteCollaboratorsProps {
  collaborators: NoteCollaborator[];
  onUnshare?: (userId: string) => void;
  canRemove?: boolean;
}

export function NoteCollaborators({ collaborators, onUnshare, canRemove = false }: NoteCollaboratorsProps) {
  // const getInitials = (name?: string, email?: string) => {
  //   if (name) {
  //     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  //   }
  //   if (email) {
  //     return email.slice(0, 2).toUpperCase();
  //   }
  //   return 'U';
  // };

  const getDisplayName = (collaborator: NoteCollaborator) => {
    return collaborator.full_name || collaborator.email;
  };

  const getRole = (collaborator: NoteCollaborator) => {
    if (collaborator.is_creator) return 'Créateur';
    return collaborator.can_edit ? 'Éditeur' : 'Lecteur';
  };

  // Si pas de collaborateurs, ne rien afficher
  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  // Filtrer pour afficher seulement les collaborateurs (pas le créateur)
  const nonCreatorCollaborators = collaborators.filter(c => !c.is_creator);
  
  // Si pas de collaborateurs non-créateurs, ne rien afficher
  if (nonCreatorCollaborators.length === 0) {
    return null;
  }

  // Limiter l'affichage à 3 avatars + compteur si plus
  const maxDisplay = 3;
  const displayCollaborators = nonCreatorCollaborators.slice(0, maxDisplay);
  const remainingCount = Math.max(0, nonCreatorCollaborators.length - maxDisplay);

  return (
    <div className="flex items-center space-x-1">
      <TooltipProvider>
        {displayCollaborators.map((collaborator, index) => (
          <div key={collaborator.user_id} className="relative group animate-in fade-in duration-300">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  {collaborator.avatar_url ? (
                    <img 
                      src={collaborator.avatar_url}
                      alt={getDisplayName(collaborator)}
                      className={`h-6 w-6 rounded-full border border-white/20 object-cover transition-transform hover:scale-110 ${
                        index > 0 ? '-ml-2' : ''
                      }`}
                      style={{ zIndex: displayCollaborators.length - index }}
                    />
                  ) : (
                    <div 
                      className={`h-6 w-6 rounded-full border border-white/20 bg-white/20 flex items-center justify-center transition-transform hover:scale-110 ${
                        index > 0 ? '-ml-2' : ''
                      }`}
                      style={{ zIndex: displayCollaborators.length - index }}
                    >
                      <User className="h-3 w-3 text-white/80" />
                    </div>
                  )}
                  
                  {/* Croix de suppression */}
                  {canRemove && onUnshare && !collaborator.is_creator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnshare(collaborator.user_id);
                      }}
                      className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500/90 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                      style={{ zIndex: displayCollaborators.length - index + 10 }}
                      title="Retirer l'accès"
                    >
                      <X className="h-2 w-2 text-white" />
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-black/90 text-white border border-white/20 text-xs"
              >
                <div className="text-center">
                  <p className="font-medium">{getDisplayName(collaborator)}</p>
                  <p className="text-white/60">{getRole(collaborator)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-6 w-6 -ml-2 rounded-full bg-white/20 border border-white/20 flex items-center justify-center text-xs text-white/80 font-medium">
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="bg-black/90 text-white border border-white/20 text-xs"
            >
              <div className="space-y-1">
                {nonCreatorCollaborators.slice(maxDisplay).map((collaborator) => (
                  <div key={collaborator.user_id} className="text-center">
                    <p className="font-medium">{getDisplayName(collaborator)}</p>
                    <p className="text-white/60">{getRole(collaborator)}</p>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
} 