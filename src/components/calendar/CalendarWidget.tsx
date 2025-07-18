import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, Plus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CalendarExpand } from '@/components/calendar';
import { useEvents, type CalendarEvent } from '@/hooks/useEvents';
import { toast } from '@/hooks/use-toast';
import { EventDetail } from '@/components/calendar/EventDetail';
import { EventForm } from '@/components/calendar/EventForm';
import { UserDot } from '@/components/accounting/UserDot';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface CalendarWidgetProps {
  showTrigger?: boolean;
}

export function CalendarWidget({ showTrigger = true }: CalendarWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null);
  const { events, create, update, remove } = useEvents();
  const { members } = useOrganizations();

  const widgetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(widgetRef, () => {
    if (isOpen) {
      handleToggle();
    }
  });

  // Handler suppression (placé ici avant tout return)
  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast({ title: 'Évènement supprimé' });
      setView('list');
      setCurrentEvent(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({ title: 'Erreur lors de la suppression', description: (error as Error).message });
    }
  };

  // Gérer l'affichage conditionnel pour laisser le temps à l'animation de sortie
  const isVisible = isOpen || isClosing;

  const handleToggle = () => {
    if (isOpen) {
      // Lancer l'animation de fermeture
      setIsClosing(true);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const toggleExpand = () => setExpanded(prev => !prev);

  // Une fois l'animation de fermeture terminée, on masque réellement le panneau
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => setIsClosing(false), 350);
      return () => clearTimeout(timer);
    }
  }, [isClosing]);

  // Trouver le prochain événement
  const nextEvent = events
    .filter(evt => new Date(evt.start_at) > new Date())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0];

  // Helper date courte jj/mm
  const formatShortDate = (d: Date) => d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  });

  // Bouton d'accès : conditionnellement visible
  const accessButton = !showTrigger ? null : (
    <button
      aria-label="Ouvrir le calendrier"
      onClick={handleToggle}
      className="fixed bottom-4 right-4 z-[9999] group"
    >
      <div className="backdrop-blur-sm bg-white/10 rounded-lg border border-white/20 shadow-sm hover:bg-white/15 transition-colors group">
        {nextEvent ? (
          <div className="flex items-center justify-between px-6 py-1.5 min-w-[320px] max-w-[420px]">
            <div className="flex items-center space-x-2 overflow-hidden">
              <CalendarIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-gray-500 text-[10px] leading-none">{formatShortDate(new Date(nextEvent.start_at))}</span>
                <p className="text-gray-600 text-xs truncate font-normal max-w-[180px] text-left">{nextEvent.title}</p>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-1.5 min-w-[280px] space-x-2">
            <div className="flex items-center space-x-2 overflow-hidden">
              <CalendarIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <p className="text-gray-600 text-sm font-medium">Agenda</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </button>
  );

  if (!isVisible) return accessButton;

  return (
    <>
      {accessButton}
      <div
        ref={widgetRef}
        className={`fixed right-4 top-32 sm:top-28 bottom-20 z-[9998] ${expanded ? 'w-[28rem] sm:w-[40rem]' : 'w-72 sm:w-96'} max-h-[calc(100vh-9rem)] flex flex-col overflow-hidden backdrop-blur-sm bg-gray-100/95 rounded-lg border border-white/20 shadow-sm transition-all origin-bottom-right ${
          isClosing ? 'dock-out' : 'dock-in'
        } text-gray-700`}
      >
        {/* Handle Expand/Collapse */}
        <button
          onClick={toggleExpand}
          className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full backdrop-blur-sm bg-white/15 hover:bg-white/20 border border-white/20 text-gray-600 flex items-center justify-center shadow-sm transition-colors duration-200 pl-2.5"
        >
          {expanded ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-gray-600" />
            <h3 className="text-gray-600 text-sm font-medium">Agenda</h3>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={()=>{setCurrentEvent(null);setView('form');}} className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700" title="Nouvel évènement">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={handleToggle} className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700" title="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corps (calendrier + évènements) */}
        <div className="flex-1 flex overflow-hidden">
          {expanded && <CalendarExpand date={selectedDate} onChange={setSelectedDate} events={events} />}

          {/* Content Area */}
          {view==='form' ? (
            <EventForm
              initial={currentEvent}
              onCancel={()=>setView(currentEvent ? 'detail':'list')}
              onSave={async (payload, id) => {
                try {
                  if (id) {
                    await update(id, payload);
                  } else {
                    await create(payload);
                  }
                  setView('list');
                } catch (error) {
                  console.error('Erreur lors de la sauvegarde:', error);
                }
              }}
            />
          ) : view==='detail' && currentEvent ? (
            <EventDetail 
              event={currentEvent} 
              onBack={()=>setView('list')} 
              onEdit={()=>setView('form')} 
              onDelete={handleDelete}
            />
          ) : (
          <ul className="flex-1 h-full overflow-y-auto p-4 space-y-4">
            {(() => {
              const filtered = events.filter(evt => {
                if (!expanded) return true; // en mode compact, tout afficher
                if (!selectedDate) return true;
                const dayStart = new Date(selectedDate); dayStart.setHours(0,0,0,0);
                const dayEnd = new Date(selectedDate); dayEnd.setHours(23,59,59,999);
                const evtStart = new Date(evt.start_at);
                const evtEnd = new Date(evt.end_at);
                return evtStart <= dayEnd && evtEnd >= dayStart;
              });

              // --- Nouveau regroupement clair ---
              const now = new Date();
              const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

              const defaultSections = ['Aujourd\'hui', 'Demain', 'Cette semaine', 'Ce mois'] as const;

              const dayLabel = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

              // Helper pour section par défaut
              const sectionFor = (d: Date) => {
                const diff = Math.floor((d.getTime() - startToday.getTime()) / 86_400_000);
                if (diff === 0) return "Aujourd'hui";
                if (diff === 1) return 'Demain';
                if (diff >= -6 && diff <= 6) return 'Cette semaine';
                return 'Ce mois';
              };

              const sections: Record<string, CalendarEvent[]> = {};
              if (!expanded) defaultSections.forEach(s => (sections[s] = []));

              filtered.forEach(evt => {
                const startD = new Date(evt.start_at);
                const key = expanded ? dayLabel(startD) : sectionFor(startD);
                if (!sections[key]) sections[key] = [];
                sections[key].push(evt);
              });

              const orderedKeys = expanded
                ? Object.keys(sections).sort((a, b) => {
                    const da = sections[a][0] ? new Date(sections[a][0].start_at) : new Date(a);
                    const db = sections[b][0] ? new Date(sections[b][0].start_at) : new Date(b);
                    return da.getTime() - db.getTime();
                  })
                : defaultSections;

              return orderedKeys.map(section => {
                const list = sections[section] || [];
                list.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

                return (
                  <li key={section} className="space-y-2">
                    <h4 className="text-gray-700 text-[10px] font-semibold uppercase tracking-wide text-left py-1">{section}</h4>
                    <div className="space-y-2 divide-y divide-white/10 max-h-64 overflow-y-auto pr-1">
                      {list.length === 0 ? (
                        <p className="text-sm text-gray-400 italic pt-2">Aucun évènement</p>
                      ) : (
                        list.map(evt => (
                          <div key={evt.id} onClick={()=>{setCurrentEvent(evt);setView('detail');}} className="flex items-start pt-2 first:pt-0 rounded-lg bg-white/15 hover:bg-white/25 p-3 cursor-pointer transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 mr-2">{new Date(evt.start_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                {(() => {
                                  const uniqueParticipants = Array.from(new Set(evt.participants ?? []));
                                  const displayParticipants = uniqueParticipants.filter(id => id !== evt.user_id).slice(0, 2);
                                  return (
                                    <div className="flex items-center space-x-1 ml-auto">
                                      {evt.user_id && (
                                        <UserDot 
                                          userId={evt.user_id} 
                                          userName={members.find(m => m.user_id === evt.user_id)?.profiles?.full_name}
                                          userEmail={members.find(m => m.user_id === evt.user_id)?.profiles?.email}
                                          size="sm"
                                        />
                                      )}
                                      {displayParticipants.map(pid => (
                                        <UserDot key={pid} userId={pid} userName={members.find(m=>m.user_id===pid)?.profiles?.full_name} userEmail={members.find(m=>m.user_id===pid)?.profiles?.email} size="sm" />
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate mt-0.5 text-left">{evt.title}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </li>
                );
              });
            })()}
          </ul>)}
        </div>

        {/* Footer supprimé */}
      </div>
    </>
  );
} 