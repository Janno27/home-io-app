import { useState } from 'react';
import type { CalendarEvent } from '@/hooks/useEvents';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganizations } from '@/hooks/useOrganizations';

interface EventFormProps {
  initial?: CalendarEvent | null;
  onCancel: () => void;
  onSave: (event: Omit<CalendarEvent,'id'>, id?:string) => void;
}

export function EventForm({ initial, onCancel, onSave }: EventFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [start, setStart] = useState(initial ? initial.start_at?.slice(0,16) : '');
  const [end, setEnd] = useState(initial ? initial.end_at?.slice(0,16) : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [participants, setParticipants] = useState<string[]>(initial?.participants ?? []);

  const { members } = useOrganizations();

  const handleSubmit = () => {
    if(!title || !start || !end) return;
    const payload = {
      title,
      start_at: new Date(start).toISOString(),
      end_at: new Date(end).toISOString(),
      description,
      participants,
    } as any;
    onSave(payload as any, initial?.id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right text-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center space-x-2 flex-shrink-0">
        <button onClick={onCancel} className="w-8 h-8 p-0 rounded-full hover:bg-white/20 flex items-center justify-center text-gray-600 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-gray-700 text-sm font-medium">{initial ? 'Modifier' : 'Nouvel'} évènement</h3>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-gray-600 text-sm">Titre</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-white/15 text-gray-700 p-2 rounded border border-white/30 focus:border-blue-500/80 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-gray-600 text-sm">Début</label>
          <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} className="w-full bg-white/15 text-gray-700 p-2 rounded border border-white/30 focus:border-blue-500/80 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-gray-600 text-sm">Fin</label>
          <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} className="w-full bg-white/15 text-gray-700 p-2 rounded border border-white/30 focus:border-blue-500/80 outline-none transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-gray-600 text-sm">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full bg-white/15 text-gray-700 p-2 rounded border border-white/30 focus:border-blue-500/80 outline-none transition-colors" />
        </div>
        {members.length>0 && (
          <div className="space-y-1">
            <label className="text-gray-600 text-sm">Participants</label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {members.map(m=>(
                <label key={m.user_id} className="flex items-center space-x-2 text-gray-700 text-sm">
                  <input type="checkbox" checked={participants.includes(m.user_id)} onChange={e=>{
                    setParticipants(prev=>e.target.checked? [...prev,m.user_id]: prev.filter(id=>id!==m.user_id));
                  }} />
                  <span>{m.profiles?.full_name ?? m.profiles?.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end">
        <Button size="sm" onClick={handleSubmit} className="flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Enregistrer</span>
        </Button>
      </div>
    </div>
  );
} 