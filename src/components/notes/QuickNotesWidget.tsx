import { useState, useEffect } from 'react';
import { FileText, X, Plus, ChevronRight, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import { ShareNoteDialog } from './ShareNoteDialog';
import { NoteCollaborators } from './NoteCollaborators';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from './types';

interface QuickNotesWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickNotesWidget({ isOpen, onClose }: QuickNotesWidgetProps) {
  const { 
    notes, 
    loading, 
    organizationMembers, 
    saveNote, 
    createNote, 
    deleteNote, 
    shareNote, 
    unshareNote,
    refreshNoteCollaborators
  } = useNotes();
  
  const [isClosing, setIsClosing] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isReadMode, setIsReadMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Les notes sont maintenant gérées par le hook useNotes

  // Mettre à jour le formulaire quand la note sélectionnée change
  useEffect(() => {
    setTitle(selectedNote?.title || '');
    setContent(selectedNote?.content || '');
  }, [selectedNote]);

  // Gérer les transitions d'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      // Déclencher l'animation de fermeture
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        setView('list');
        setSelectedNote(null);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Maintenant';
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getPreview = (content: string) => {
    // Décrypter le HTML pour récupérer seulement le texte
    const div = document.createElement('div');
    div.innerHTML = content;
    const textContent = div.textContent || div.innerText || '';
    return textContent.substring(0, 35) + (textContent.length > 35 ? '...' : '');
  };

  const getTimeSection = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 24) {
      return 'Aujourd\'hui';
    } else if (diffInHours < 48) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return '7 jours précédents';
    } else if (diffInDays < 30) {
      return '1 mois précédent';
    } else {
      return 'Plus ancien';
    }
  };

  // Fonction helper pour grouper les notes par section temporelle
  const groupNotesByTime = (notes: Note[]) => {
    const grouped: Record<string, Note[]> = {};
    
    notes.forEach(note => {
      const section = getTimeSection(note.updatedAt);
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(note);
    });

    return grouped;
  };

  const handleCreateNote = async () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      try {
        const newNote = await createNote('', '');
        setSelectedNote(newNote);
        setTitle('');
        setContent('');
        setIsReadMode(false); // Entrer directement en mode édition
        setView('editor');
      } catch (error) {
        console.error('Erreur lors de la création de la note:', error);
      } finally {
        setIsTransitioning(false);
      }
    }, 150);
  };

  const handleSelectNote = (note: Note) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedNote(note);
      setTitle(note.title);
      setContent(note.content);
      setView('editor');
      setIsReadMode(true);
      setIsTransitioning(false);
    }, 150);
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    if (!title.trim() && !content.trim()) return;
    
    const updatedNote: Note = {
      ...selectedNote,
      title: title.trim() || 'Note sans titre',
      content: content.trim(),
      updatedAt: new Date(),
    };
    
    try {
      const savedNote = await saveNote(updatedNote);
      setSelectedNote(savedNote);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (selectedNote?.id) {
      try {
        await deleteNote(selectedNote.id);
        setIsTransitioning(true);
        setTimeout(() => {
          setView('list');
          setSelectedNote(null);
          setIsTransitioning(false);
        }, 150);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setView('list');
      setSelectedNote(null);
      setIsTransitioning(false);
    }, 150);
  };

  const handleClose = () => {
    onClose();
  };

  // Auto-save après 1 seconde d'inactivité
  useEffect(() => {
    if (view === 'editor') {
      const timer = setTimeout(() => {
        if (title.trim() || content.trim()) {
          handleSaveNote();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [title, content, view]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-end pr-4 pointer-events-none">
      <div 
        className={`w-80 sm:w-96 h-[65vh] bg-black/20 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg overflow-hidden pointer-events-auto transition-all duration-300 flex flex-col ${
          isClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {view === 'editor' ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white mr-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  {selectedNote && (
                    <NoteCollaborators 
                      collaborators={selectedNote.collaborators || []} 
                      onUnshare={async (userId) => {
                        try {
                          await unshareNote(selectedNote.id, userId);
                          // Forcer le rafraîchissement pour s'assurer de la synchronisation
                          setTimeout(() => refreshNoteCollaborators(selectedNote.id), 100);
                        } catch (error) {
                          console.error('Erreur lors de la suppression du partage:', error);
                        }
                      }}
                      canRemove={selectedNote.isCreator}
                    />
                  )}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-white/90" />
                  <h3 className="text-white text-sm font-normal">Notes</h3>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {view === 'list' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateNote}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              {view === 'editor' && isReadMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReadMode(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
              {view === 'editor' && selectedNote && (
                <>
                  {selectedNote.isCreator && (
                    <ShareNoteDialog
                      note={selectedNote}
                      organizationMembers={organizationMembers}
                      onShare={async (userIds, canEdit) => {
                        try {
                          await shareNote(selectedNote.id, userIds, canEdit);
                          // Forcer le rafraîchissement pour s'assurer de la synchronisation
                          setTimeout(() => refreshNoteCollaborators(selectedNote.id), 100);
                        } catch (error) {
                          console.error('Erreur lors du partage:', error);
                        }
                      }}
                      onUnshare={async (userId) => {
                        try {
                          await unshareNote(selectedNote.id, userId);
                          // Forcer le rafraîchissement pour s'assurer de la synchronisation
                          setTimeout(() => refreshNoteCollaborators(selectedNote.id), 100);
                        } catch (error) {
                          console.error('Erreur lors de la suppression du partage:', error);
                        }
                      }}
                    />
                  )}
                  {selectedNote.isCreator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteNote}
                      className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {view === 'list' ? (
            /* Notes List */
            <div className={`p-4 h-full overflow-y-auto transition-all duration-300 ease-in-out ${
              isTransitioning ? 'animate-out slide-out-to-left opacity-0' : 'opacity-100'
            }`}>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/80 text-sm">Chargement des notes...</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-white/60 mx-auto mb-3" />
                  <p className="text-white/80 text-sm mb-3">Aucune note</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateNote}
                    className="text-white/90 hover:text-white hover:bg-white/20"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une note
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupNotesByTime(notes)).map(([section, sectionNotes]) => (
                    <div key={section} className="space-y-2">
                      <h4 className="text-white/60 text-xs font-medium uppercase tracking-wide text-left">
                        {section}
                      </h4>
                      <div className="space-y-2">
                        {sectionNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/20"
                            onClick={() => handleSelectNote(note)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-white font-medium text-sm truncate text-left">
                                    {note.title}
                                  </h4>
                                  {note.isShared && (
                                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" title="Note partagée" />
                                  )}
                                  {note.created_by && !note.isCreator && (
                                    <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Note partagée avec vous" />
                                  )}
                                </div>
                                <p className="text-white/80 text-xs line-clamp-1 mb-2 text-left">
                                  {getPreview(note.content)}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/60 text-xs">
                                    {formatDate(note.updatedAt)}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-white/60" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Note Editor/Reader */
            <div className={`p-4 h-full flex flex-col space-y-4 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'animate-out slide-out-to-right opacity-0' : 'opacity-100'
            }`}>
              {isReadMode ? (
                /* Mode lecture - Affichage simple */
                <div className="h-full flex flex-col space-y-4">
                  {/* Titre en lecture */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <h1 className="text-white font-medium text-lg text-left">
                      {title || 'Note sans titre'}
                    </h1>
                  </div>
                  
                  {/* Contenu en lecture */}
                  <div className="flex-1 bg-white/5 rounded-lg p-3 overflow-y-auto">
                    {content ? (
                      <div 
                        className="prose prose-invert max-w-none text-white/90 leading-relaxed"
                        style={{ 
                          fontSize: '14px',
                          lineHeight: '1.5',
                          textAlign: 'left'
                        }}
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                    ) : (
                      <div className="text-white/50 italic text-sm">
                        Aucun contenu
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode édition - Champs éditables */
                <>
                  <Input
                    placeholder="Titre de la note..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:border-white/20 rounded-lg"
                  />
                  
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Commencer à écrire..."
                    className="flex-1"
                    isReadMode={isReadMode}
                    onToggleMode={() => setIsReadMode(!isReadMode)}
                  />
                </>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
} 