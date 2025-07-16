import { User, X } from 'lucide-react';
// import { Avatar } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { NoteCollaborator } from './types';

interface NoteCollaboratorsProps {
  collaborators: NoteCollaborator[];
  onUnshare?: (userId: string) => void;
  canRemove?: boolean;
  size?: 'sm' | 'md';
}

export function NoteCollaborators({ 
  collaborators, 
  onUnshare, 
  canRemove = false,
  size = 'md' 
}: NoteCollaboratorsProps) {
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

  // Limiter l'affichage à 3 avatars + compteur si plus
  const maxDisplay = 3;
  const displayCollaborators = collaborators.slice(0, maxDisplay);
  const remainingCount = Math.max(0, collaborators.length - maxDisplay);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
  };

  const iconSizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
  }

  return (
    <div className="flex items-center -space-x-2">
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
                      className={`${sizeClasses[size]} rounded-full border-2 border-white/20 object-cover transition-transform hover:scale-110`}
                      style={{ zIndex: displayCollaborators.length - index }}
                    />
                  ) : (
                    <div 
                      className={`${sizeClasses[size]} rounded-full border-2 border-white/20 bg-gray-200 flex items-center justify-center transition-transform hover:scale-110`}
                      style={{ zIndex: displayCollaborators.length - index }}
                    >
                      <User className={`${iconSizeClasses[size]} text-gray-500`} />
                    </div>
                  )}
                  
                  {/* Croix de suppression */}
                  {canRemove && onUnshare && !collaborator.is_creator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnshare(collaborator.user_id);
                      }}
                      className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                      style={{ zIndex: displayCollaborators.length - index + 10 }}
                      title="Retirer l'accès"
                    >
                      <X className="h-2 w-2 text-white/90" />
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                className="bg-white/15 backdrop-blur-sm border border-white/20 text-gray-700 text-[10px] p-1"
              >
                <div className="text-center">
                  <p className="font-medium leading-tight">{getDisplayName(collaborator)}</p>
                  <p className="text-gray-500 leading-tight">{getRole(collaborator)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`${sizeClasses[size]} -ml-2 rounded-full bg-gray-200 border-2 border-white/20 flex items-center justify-center text-xs text-gray-500 font-medium`}>
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              className="bg-white/15 backdrop-blur-sm border border-white/20 text-gray-700 text-xs p-1"
            >
              <div className="space-y-1">
                {collaborators.slice(maxDisplay).map((collaborator) => (
                  <div key={collaborator.user_id} className="text-center">
                    <p className="font-medium leading-tight">{getDisplayName(collaborator)}</p>
                    <p className="text-gray-500 leading-tight">{getRole(collaborator)}</p>
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