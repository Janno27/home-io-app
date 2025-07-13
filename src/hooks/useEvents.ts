import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_at: string; // ISO
  end_at: string;   // ISO
  participants?: string[]; // user ids
  user_id?: string; // owner
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_at', { ascending: true });
    if (error) setError(error.message);
    else setEvents(data as CalendarEvent[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (payload: Omit<CalendarEvent, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const insertPayload = {
      ...payload,
      user_id: user.id
    };
    
    const { error } = await supabase.from('calendar_events').insert(insertPayload);
    if (error) throw error;
    await load();
  };

  const update = async (id: string, payload: Partial<CalendarEvent>) => {
    const { error } = await supabase.from('calendar_events').update(payload).eq('id', id);
    if (error) throw error;
    await load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
    await load();
  };

  return { events, loading, error, create, update, remove, reload:load };
} 