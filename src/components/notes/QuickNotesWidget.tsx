import { useState, useEffect, useRef } from 'react';
import { FileText, Plus, ChevronRight, ArrowLeft, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ShareNoteDialog } from './ShareNoteDialog';
import { NoteCollaborators } from './NoteCollaborators';
import { useNotes } from '@/hooks/useNotes';
import { DockAnimation } from '@/components/ui/DockAnimation';
import type { Note } from './types';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  const widgetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(widgetRef, onClose);

  useEffect(() => {
    setTitle(selectedNote?.title || '');
    setContent(selectedNote?.content || '');
  }, [selectedNote]);

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

    if (diffInHours < 24) return "Aujourd'hui";
    if (diffInHours < 48) return 'Hier';
    if (diffInDays < 7) return '7 jours précédents';
    if (diffInDays < 30) return '1 mois précédent';
    return 'Plus ancien';
  };

  const groupNotesByTime = (notes: Note[]) => {
    const sortedNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const grouped: Record<string, Note[]> = {};
    sortedNotes.forEach(note => {
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

  useEffect(() => {
    if (view === 'editor') {
      const timer = setTimeout(() => {
        if (selectedNote && (title.trim() !== selectedNote.title || content.trim() !== selectedNote.content)) {
          handleSaveNote();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [title, content, view, selectedNote]);

  const groupedNotes = groupNotesByTime(notes);

  return (
    <DockAnimation isOpen={isOpen} originPoint={originPoint}>
      <div className="flex items-center justify-end pr-4 h-full pointer-events-none">
        <div 
          ref={widgetRef}
          className="w-80 sm:w-96 h-[65vh] bg-gray-100/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden pointer-events-auto flex flex-col text-gray-700"
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
              <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {view === 'list' && (
                  <>
                    <FileText className="w-4 h-4 text-gray-600 inline-block mr-2" />
                    <h3 className="text-gray-600 text-sm font-medium inline-block">Notes</h3>
                  </>
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
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-hidden relative">
            {view === 'list' ? (
              <div className={`flex-grow overflow-y-auto p-4 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200/80 rounded w-1/4" />
                        <div className="h-10 bg-gray-200/80 rounded" />
                        <div className="h-10 bg-gray-200/80 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  Object.entries(groupedNotes).map(([section, notesInSection]) => (
                    <div key={section} className="mb-4">
                      <h4 className="text-xs text-gray-500 font-semibold mb-2 px-2">{section}</h4>
                      <div className="space-y-1">
                        {notesInSection.map(note => (
                          <div
                            key={note.id}
                            onClick={() => handleSelectNote(note)}
                            className="p-2 rounded-lg hover:bg-white/25 cursor-pointer transition-colors duration-200 group"
                          >
                            <div className="flex justify-between items-stretch min-h-[50px]">
                              <div className="flex-1 overflow-hidden">
                                <h5 className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-800 pr-2 text-left">
                                  {note.title || 'Note sans titre'}
                                </h5>
                                <p className="text-xs text-gray-500 truncate mt-1 text-left">
                                  {getPreview(note.content)}
                                </p>
                              </div>
                              <div className="flex flex-col justify-between items-end ml-2 flex-shrink-0">
                                {(note.collaborators && note.collaborators.length > 1) ? (
                                  <NoteCollaborators collaborators={note.collaborators} size="sm" />
                                ) : <div />}
                                <div className="flex items-center">
                                  <span className="text-[10px] text-gray-400 mr-1">{formatDate(note.updatedAt)}</span>
                                  <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className={`absolute inset-0 p-4 flex flex-col transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex-shrink-0 mb-2 border border-amber-200 rounded-lg bg-amber-50/30 p-3">
                  <input
                    type="text"
                    placeholder="Titre de la note"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-base font-medium text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex-1 min-h-0 border border-amber-200 rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DockAnimation>
  );
}