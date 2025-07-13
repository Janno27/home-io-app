import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@/hooks/useEvents';
import { UserDot } from '@/components/accounting/UserDot';
import { useOrganizations } from '@/hooks/useOrganizations';

interface EventDetailProps {
  event: CalendarEvent;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

function formatLong(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventDetail({ event, onBack, onEdit, onDelete }: EventDetailProps) {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const { members } = useOrganizations();

  const uniqueParticipants = Array.from(new Set(event.participants ?? [])).filter(id => id !== event.user_id);

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right text-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 p-0 rounded-full hover:bg-white/20 flex items-center justify-center text-gray-600 hover:text-gray-700"
          title="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-gray-700 text-sm font-medium flex-1">Détail de l'évènement</h3>
        <button
          onClick={onEdit}
          className="w-8 h-8 p-0 rounded-full hover:bg-white/20 flex items-center justify-center text-gray-600 hover:text-gray-700"
          title="Modifier"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Supprimer cet évènement ?')) {
              onDelete(event.id);
            }
          }}
          className="w-8 h-8 p-0 rounded-full hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-600"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-1 truncate">{event.title}</h2>
          <p className="text-gray-600 text-sm">{formatLong(start)} — {end.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p>
        </div>
        {event.description && (
          <div>
            <h4 className="text-gray-600 text-sm font-medium mb-1">Description</h4>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{event.description}</p>
          </div>
        )}
        {(event.user_id || (event.participants && event.participants.length > 0)) && (
          <div>
            <h4 className="text-gray-600 text-sm font-medium mb-2">Participants</h4>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {event.user_id && (
                <div className="flex items-center space-x-2">
                  <UserDot 
                    userId={event.user_id} 
                    userName={members.find(m => m.user_id === event.user_id)?.profiles?.full_name}
                    userEmail={members.find(m => m.user_id === event.user_id)?.profiles?.email}
                    size="md"
                  />
                  <span className="text-gray-700 text-sm">
                    {members.find(m => m.user_id === event.user_id)?.profiles?.full_name || 
                     members.find(m => m.user_id === event.user_id)?.profiles?.email || 
                     'Organisateur'}
                  </span>
                </div>
              )}
              {uniqueParticipants.map(participantId => (
                <div key={participantId} className="flex items-center space-x-2">
                  <UserDot 
                    userId={participantId} 
                    userName={members.find(m => m.user_id === participantId)?.profiles?.full_name}
                    userEmail={members.find(m => m.user_id === participantId)?.profiles?.email}
                    size="md"
                  />
                  <span className="text-gray-700 text-sm">
                    {members.find(m => m.user_id === participantId)?.profiles?.full_name || 
                     members.find(m => m.user_id === participantId)?.profiles?.email || 
                     'Participant'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 