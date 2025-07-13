import { useState, useEffect } from 'react';
import { FileText, X, Plus, ChevronRight, ArrowLeft, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import { ShareNoteDialog } from './ShareNoteDialog';
import { NoteCollaborators } from './NoteCollaborators';
import { useNotes } from '@/hooks/useNotes';
import { DockAnimation } from '@/components/ui/DockAnimation';
import type { Note } from './types';

interface QuickNotesWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint?: { x: number; y: number };
}

export function QuickNotesWidget({ isOpen, onClose, originPoint }: QuickNotesWidgetProps) {
  const { 
    notes, 
    loading, 
    organizationMembers, 
    saveNote, 
    createNote, 
    deleteNote, 
    shareNote, 
    unshareNote,
  } = useNotes();
  
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isReadMode, setIsReadMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Les notes sont maintenant gérées par le hook useNotes

  // Mettre à jour le formulaire quand la note sélectionnée change
  useEffect(() => {
    setTitle(selectedNote?.title || '');
    setContent(selectedNote?.content || '');
  }, [selectedNote]);

  // Réinitialiser la vue quand le widget se ferme
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setSelectedNote(null);
    }
  }, [isOpen]);

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

  return (
    <DockAnimation isOpen={isOpen} originPoint={originPoint}>
      <div className="flex items-center justify-end pr-4 h-full pointer-events-none">
        <div 
          className="w-80 sm:w-96 h-[65vh] bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden pointer-events-auto flex flex-col text-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {view === 'editor' && (
                <button
                  onClick={handleBack}
                  className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700 mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <FileText className="w-4 h-4 text-gray-600" />
              <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {view === 'list' ? (
                  <h3 className="text-gray-600 text-sm font-medium">Notes</h3>
                ) : (
                  <h3 className="text-gray-600 text-sm font-medium truncate max-w-[150px]">{selectedNote?.title || 'Nouvelle note'}</h3>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {view === 'list' ? (
                <button
                  onClick={handleCreateNote}
                  className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                  title="Nouvelle note"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <>
                  {selectedNote && (
                    <ShareNoteDialog
                     note={selectedNote}
                      organizationMembers={organizationMembers}
                      onShare={(userIds, canEdit) => shareNote(selectedNote.id, userIds, canEdit)}
                      onUnshare={(userId) => unshareNote(selectedNote.id, userId)}
                    />
                  )}
                  {selectedNote && <NoteCollaborators collaborators={selectedNote.collaborators || []} onUnshare={(userId) => unshareNote(selectedNote.id, userId)} canRemove={selectedNote.isCreator} />}
                  <button
                    onClick={handleDeleteNote}
                    className="w-8 h-8 p-0 rounded-full hover:bg-red-500/10 flex items-center justify-center text-red-500 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsReadMode(!isReadMode)}
                    className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className={`h-full transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {view === 'list' && (
                <div className="p-4 h-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Chargement...
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center h-full flex flex-col items-center justify-center text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-3" />
                      <p className="text-sm mb-3">Aucune note</p>
                      <Button
                        size="sm"
                        onClick={handleCreateNote}
                        className="text-gray-500 hover:text-gray-600 hover:bg-white/20"
                      >
                        Créer une note
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {Object.entries(groupNotesByTime(notes)).map(([section, notesInSection]) => (
                        <li key={section}>
                          <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wide text-left mb-2">
                            {section}
                          </h4>
                          <ul className="space-y-2">
                            {notesInSection.map(note => (
                               <li key={note.id} onClick={() => handleSelectNote(note)} className="cursor-pointer">
                                <div className="p-3 rounded-lg bg-white/10 hover:bg-white/15 transition-colors">
                                  <h4 className="text-gray-700 font-medium text-sm truncate text-left mb-1">
                                    {note.title || 'Note sans titre'}
                                  </h4>
                                  <p className="text-gray-500 text-xs line-clamp-1 mb-2 text-left">
                                    {getPreview(note.content)}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-xs">
                                      {formatDate(note.updatedAt)}
                                    </span>
                                    {note.isShared && <NoteCollaborators collaborators={note.collaborators || []} />}
                                    <ChevronRight className="w-3 h-3 text-gray-400" />
                                  </div>
                                </div>
                               </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {view === 'editor' && selectedNote && (
                <div className="h-full flex flex-col">
                  {isReadMode ? (
                    <h1 className="text-gray-700 font-medium text-lg text-left px-6 pt-4 pb-2 flex-shrink-0 truncate">
                      {title || 'Note sans titre'}
                    </h1>
                  ) : (
                    <div className="flex-shrink-0 px-6 pt-4 pb-2">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titre de la note"
                        className="bg-transparent border-none text-lg font-medium text-gray-700 placeholder:text-gray-400 focus:ring-0 p-0"
                      />
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
                    {isReadMode ? (
                      <div 
                        className="prose prose-invert max-w-none text-gray-600 leading-relaxed" 
                        style={{ fontSize: '12px', lineHeight: '1.5', textAlign: 'left' }}
                        dangerouslySetInnerHTML={{ __html: content }} 
                      />
                    ) : (
                      <RichTextEditor
                        value={content}
                        onChange={setContent}
                        isReadMode={false}
                        placeholder="Commencez à écrire..."
                      />
                    )}
                  </div>
                  {isReadMode && (
                    <div className="text-gray-400 italic text-sm px-6 pb-4 text-center">
                      Cliquez sur <Edit3 className="inline w-3 h-3" /> pour modifier.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DockAnimation>
  );
} 