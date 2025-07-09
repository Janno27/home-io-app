import { useState } from 'react';
import { Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Note, OrganizationMember } from './types';

interface ShareNoteDialogProps {
  note: Note;
  organizationMembers: OrganizationMember[];
  onShare: (userIds: string[], canEdit: boolean) => void;
  onUnshare: (userId: string) => void;
}

export function ShareNoteDialog({ note, organizationMembers, onShare }: ShareNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Vérifier si l'utilisateur est déjà un collaborateur
  const isCollaborator = (userId: string) => {
    return note.collaborators?.some(c => c.user_id === userId && !c.is_creator);
  };

  const handleShareWithUser = (userId: string) => {
    onShare([userId], true); // Par défaut, autoriser la modification
    setIsOpen(false);
  };



  // Seul le créateur peut partager
  if (!note.isCreator) {
    return null;
  }

  // Filtrer les membres disponibles (non collaborateurs)
  const availableMembers = organizationMembers.filter(member => !isCollaborator(member.user_id));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
          title="Partager"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 bg-black/90 backdrop-blur-xl border border-white/20 text-white p-1 z-[9999]" 
        align="end"
      >
        <div className="space-y-0.5">
          {availableMembers.length > 0 ? (
            availableMembers.map((member) => (
              <button
                key={member.user_id}
                onClick={() => handleShareWithUser(member.user_id)}
                className="w-full flex items-center space-x-2 p-2 rounded hover:bg-white/10 transition-colors text-left"
              >
                <User className="h-4 w-4 text-white/60" />
                <span className="text-sm truncate">
                  {member.full_name || member.email}
                </span>
              </button>
            ))
          ) : (
            <div className="flex items-center justify-center py-4 text-center">
              <p className="text-xs text-white/60">
                Tous les membres ont accès
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 