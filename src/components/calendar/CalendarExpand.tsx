import { Calendar } from '@/components/ui/calendar';
import type { CalendarEvent } from '@/hooks/useEvents';
import { DayPicker } from 'react-day-picker';
import { ReactElement } from 'react';

interface CalendarExpandProps {
  date: Date | undefined;
  onChange: (d: Date | undefined) => void;
  events: CalendarEvent[];
}

function toKey(d: Date) {
  return d.toISOString().split('T')[0]; // yyyy-mm-dd
}

// Fonction pour générer une couleur basée sur l'ID utilisateur (même logique que UserDot)
const getUserColorIndex = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash) % 12;
};

export function CalendarExpand({ date, onChange, events }: CalendarExpandProps) {
  // Grouper les événements par date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach(e => {
    const cur = new Date(e.start_at);
    cur.setHours(0,0,0,0);
    const end = new Date(e.end_at);
    end.setHours(0,0,0,0);
    while (cur <= end) {
      const key = toKey(cur);
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(e);
      cur.setDate(cur.getDate()+1);
    }
  });

  // Générer les jours avec événements
  const eventDays = Object.keys(eventsByDate).map(s => new Date(s));

  // Custom day content avec dots
  const customDayContent = (day: Date): ReactElement | undefined => {
    const key = toKey(day);
    const dayEvents = eventsByDate[key];
    if (!dayEvents || dayEvents.length === 0) return undefined;

    // Limiter à 3 événements max par jour
    const eventsToShow = dayEvents.slice(0, 3);
    
    return (
      <div className="event-dots">
        {eventsToShow.map((event, index) => (
          <div key={index} className={`event-dot user-color-${getUserColorIndex(event.user_id || 'unknown')}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-72 sm:w-80 bg-white/15 border-r border-white/20 flex-shrink-0 p-4 overflow-y-auto flex flex-col items-center text-gray-700">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onChange}
        modifiers={{ event: eventDays }}
        components={{
          DayContent: ({ date }) => (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{date.getDate()}</span>
              {customDayContent(date)}
            </div>
          )
        }}
        className="rounded-md bg-transparent text-gray-700"
      />
    </div>
  );
} 