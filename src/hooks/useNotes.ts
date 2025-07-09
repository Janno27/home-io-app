import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import type { Note, OrganizationMember } from '@/components/notes/types';

export function useNotes() {
  const { user } = useAuthContext();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);

  // Charger les notes depuis localStorage ET Supabase
  const loadNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Charger depuis localStorage d'abord
      const localNotes = localStorage.getItem('notes');
      let parsedLocalNotes: Note[] = [];
      
      if (localNotes) {
        parsedLocalNotes = JSON.parse(localNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          isCreator: true, // Notes localStorage appartiennent à l'utilisateur
          canEdit: true
        }));
      }

      // Charger depuis Supabase - approche simplifiée
      const { data: supabaseNotes, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des notes Supabase:', error);
        setNotes(parsedLocalNotes);
        return;
      }

      // Transformer les notes Supabase
      const transformedSupabaseNotes: Note[] = await Promise.all(
        (supabaseNotes || []).map(async (note: any) => {
          // Récupérer les collaborateurs
          const { data: collaborators } = await supabase
            .rpc('get_note_collaborators', { note_id_param: note.id });

          const isCreator = note.created_by === user.id;
          
          // Récupérer les partages pour cette note
          const { data: noteShares } = await supabase
            .from('note_shares')
            .select('user_id, can_edit')
            .eq('note_id', note.id);

          const userShare = noteShares?.find((share: any) => share.user_id === user.id);
          const canEdit = isCreator || userShare?.can_edit || false;

          return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at),
            created_by: note.created_by,
            organization_id: note.organization_id,
            collaborators: collaborators || [],
            isShared: (collaborators?.length || 0) > 1,
            canEdit,
            isCreator
          };
        })
      );

      // Fusionner les notes (localStorage + Supabase, éviter les doublons)
      // Donner priorité aux notes Supabase
      const supabaseIds = transformedSupabaseNotes.map(note => note.id);
      const localOnlyNotes = parsedLocalNotes.filter(note => !supabaseIds.includes(note.id));
      
      const allNotes = [...transformedSupabaseNotes, ...localOnlyNotes];
      
      // Vérification de sécurité contre les doublons
      const uniqueNotes = allNotes.filter((note, index, self) => 
        index === self.findIndex(n => n.id === note.id)
      );

      setNotes(uniqueNotes);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres de l'organisation
  const loadOrganizationMembers = async () => {
    if (!user) return;

    try {
      // Récupérer l'organisation de l'utilisateur
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        console.error('Erreur membership:', membershipError);
        return;
      }

      if (!membership) {
        return;
      }

      // Utiliser la fonction RPC qui fonctionne et contourne les problèmes de JOIN
      const { data: members, error } = await supabase
        .rpc('get_organization_members', { org_id: membership.organization_id });

      if (error) {
        console.error('Erreur lors du chargement des membres:', error);
        return;
      }

      if (members) {
        const transformedMembers: OrganizationMember[] = members
          .filter((member: any) => member.user_id !== user.id)
          .map((member: any) => ({
            user_id: member.user_id,
            full_name: member.full_name,
            email: member.email,
            avatar_url: member.avatar_url
          }));

        setOrganizationMembers(transformedMembers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  // Sauvegarder une note
  const saveNote = async (note: Note) => {
    if (!user) return note;

    try {
      // Toujours sauvegarder dans localStorage
      const existingLocalNotes = localStorage.getItem('notes');
      let localNotes: Note[] = existingLocalNotes ? JSON.parse(existingLocalNotes) : [];
      
      const localNoteIndex = localNotes.findIndex(n => n.id === note.id);
      if (localNoteIndex >= 0) {
        localNotes[localNoteIndex] = note;
      } else {
        localNotes = [note, ...localNotes];
      }
      localStorage.setItem('notes', JSON.stringify(localNotes));

      // Si la note a un created_by, c'est une note Supabase
      if (note.created_by) {
        try {
          const { data, error } = await supabase
            .from('notes')
            .update({
              title: note.title,
              content: note.content,
              updated_at: new Date().toISOString()
            })
            .eq('id', note.id)
            .select()
            .single();

          if (error) {
            console.error('Erreur lors de la sauvegarde Supabase:', error);
            console.error('Détails de l\'erreur:', error);
            
            // Essayer avec upsert en fallback
            const { data: upsertData, error: upsertError } = await supabase
              .from('notes')
              .upsert({
                id: note.id,
                title: note.title,
                content: note.content,
                created_by: note.created_by,
                organization_id: note.organization_id,
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (upsertError) {
              console.error('Erreur lors de l\'upsert:', upsertError);
              throw upsertError;
            }

            const updatedNote = {
              ...note,
              updatedAt: new Date(upsertData.updated_at)
            };

            setNotes(prev => {
              const existingIndex = prev.findIndex(n => n.id === note.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = updatedNote;
                return updated;
              } else {
                return [updatedNote, ...prev];
              }
            });

            return updatedNote;
          }

          const updatedNote = {
            ...note,
            updatedAt: new Date(data.updated_at)
          };

          // Mettre à jour le state avec la note mise à jour de Supabase
          setNotes(prev => {
            const existingIndex = prev.findIndex(n => n.id === note.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = updatedNote;
              return updated;
            } else {
              return [updatedNote, ...prev];
            }
          });

          return updatedNote;
        } catch (error) {
          console.error('Erreur critique lors de la sauvegarde:', error);
          
          // En cas d'erreur critique, au moins sauvegarder localement
          setNotes(prev => {
            const existingIndex = prev.findIndex(n => n.id === note.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = note;
              return updated;
            } else {
              return [note, ...prev];
            }
          });
          
          // Ne pas relancer l'erreur pour éviter de casser l'interface
          return note;
        }
      } else {
        // Pour les notes localStorage, mettre à jour le state une seule fois
        setNotes(prev => {
          const existingIndex = prev.findIndex(n => n.id === note.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = note;
            return updated;
          } else {
            return [note, ...prev];
          }
        });

        return note;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return note;
    }
  };

  // Créer une nouvelle note
  const createNote = async (title: string, content: string): Promise<Note> => {
    if (!user) throw new Error('Utilisateur non connecté');

    const now = new Date();
    
    try {
      // Récupérer l'organisation de l'utilisateur
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership?.organization_id) {
        // Créer dans Supabase
        const { data, error } = await supabase
          .from('notes')
          .insert({
            title: title || 'Note sans titre',
            content: content || '',
            created_by: user.id,
            organization_id: membership.organization_id
          })
          .select()
          .single();

        if (error) throw error;

        const newNote: Note = {
          id: data.id,
          title: data.title,
          content: data.content,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          created_by: data.created_by,
          organization_id: data.organization_id,
          collaborators: [],
          isShared: false,
          canEdit: true,
          isCreator: true
        };

        // Sauvegarder dans localStorage et mettre à jour le state (saveNote fait les deux)
        return await saveNote(newNote);
      } else {
        // Fallback : créer seulement dans localStorage
        const newNote: Note = {
          id: crypto.randomUUID(),
          title: title || 'Note sans titre',
          content: content || '',
          createdAt: now,
          updatedAt: now,
          isCreator: true,
          canEdit: true
        };

        return await saveNote(newNote);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      
      // Fallback : créer dans localStorage
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: title || 'Note sans titre',
        content: content || '',
        createdAt: now,
        updatedAt: now,
        isCreator: true,
        canEdit: true
      };

      return await saveNote(newNote);
    }
  };

  // Supprimer une note
  const deleteNote = async (noteId: string) => {
    try {
      // Supprimer du localStorage
      const existingNotes = localStorage.getItem('notes');
      if (existingNotes) {
        const localNotes = JSON.parse(existingNotes);
        const filteredNotes = localNotes.filter((n: Note) => n.id !== noteId);
        localStorage.setItem('notes', JSON.stringify(filteredNotes));
      }

      // Supprimer de Supabase si c'est une note Supabase
      const note = notes.find(n => n.id === noteId);
      if (note?.created_by) {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId);

        if (error) {
          console.error('Erreur lors de la suppression Supabase:', error);
        }
      }

      // Mettre à jour l'état local
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Partager une note
  const shareNote = async (noteId: string, userIds: string[], canEdit: boolean = true) => {
    if (!user) return;

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note?.created_by || note.created_by !== user.id) {
        throw new Error('Seul le créateur peut partager la note');
      }

      // Vérifier les partages existants pour éviter les doublons
      const { data: existingShares } = await supabase
        .from('note_shares')
        .select('user_id')
        .eq('note_id', noteId);

      const existingUserIds = existingShares?.map(s => s.user_id) || [];
      const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId));

      if (newUserIds.length === 0) {
        throw new Error('Tous les utilisateurs sélectionnés ont déjà accès à cette note');
      }

      // Créer les nouveaux partages
      const shares = newUserIds.map(userId => ({
        note_id: noteId,
        user_id: userId,
        can_edit: canEdit,
        shared_by: user.id
      }));

      // Créer les nouveaux collaborateurs pour l'UI
      const newCollaborators = newUserIds.map(userId => {
        const member = organizationMembers.find(m => m.user_id === userId);
        return {
          user_id: userId,
          full_name: member?.full_name || '',
          email: member?.email || '',
          avatar_url: member?.avatar_url || undefined,
          can_edit: canEdit,
          is_creator: false
        };
      });

      // Insérer dans Supabase en premier
      const { error } = await supabase
        .from('note_shares')
        .insert(shares);

      if (error) throw error;

      // Mettre à jour le state local immédiatement
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            isShared: true,
            collaborators: [...(n.collaborators || []), ...newCollaborators]
          };
        }
        return n;
      }));

      // Forcer la synchronisation des collaborateurs en arrière-plan
      setTimeout(() => refreshNoteCollaborators(noteId), 500);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      throw error;
    }
  };

  // Retirer le partage
  const unshareNote = async (noteId: string, userId: string) => {
    try {
      // Supprimer de Supabase en premier
      const { error } = await supabase
        .from('note_shares')
        .delete()
        .eq('note_id', noteId)
        .eq('user_id', userId);

      if (error) throw error;

      // Mettre à jour le state local immédiatement
      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          const updatedCollaborators = (n.collaborators || []).filter(c => c.user_id !== userId);
          return {
            ...n,
            isShared: updatedCollaborators.length > 0,
            collaborators: updatedCollaborators
          };
        }
        return n;
      }));

      // Forcer la synchronisation des collaborateurs en arrière-plan  
      setTimeout(() => refreshNoteCollaborators(noteId), 500);
    } catch (error) {
      console.error('Erreur lors du retrait du partage:', error);
      throw error;
    }
  };

  // Forcer le rechargement d'une note spécifique (pour la synchronisation)
  const refreshNoteCollaborators = async (noteId: string) => {
    if (!user) return;

    try {
      const { data: collaborators } = await supabase
        .rpc('get_note_collaborators', { note_id_param: noteId });

      setNotes(prev => prev.map(n => {
        if (n.id === noteId) {
          return {
            ...n,
            collaborators: collaborators || [],
            isShared: (collaborators?.length || 0) > 1
          };
        }
        return n;
      }));
    } catch (error) {
      console.error('Erreur lors du rechargement des collaborateurs:', error);
    }
  };

  // Charger au démarrage
  useEffect(() => {
    if (user) {
      loadNotes();
      loadOrganizationMembers();
    }
  }, [user]);

  return {
    notes,
    loading,
    organizationMembers,
    saveNote,
    createNote,
    deleteNote,
    shareNote,
    unshareNote,
    loadNotes,
    refreshNoteCollaborators
  };
} 