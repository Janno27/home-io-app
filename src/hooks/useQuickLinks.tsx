import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { PostgrestError } from '@supabase/supabase-js';

export interface QuickLink {
  id: string;
  user_id: string;
  url: string;
  name: string;
  icon_url?: string;
}

interface QuickLinksContextType {
  links: QuickLink[];
  loading: boolean;
  addLink: (link: { url: string }) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
}

const QuickLinksContext = createContext<QuickLinksContextType | undefined>(undefined);

export function QuickLinksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!user) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error }: { data: QuickLink[] | null; error: PostgrestError | null } = await supabase
        .from('quick_links')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching quick links:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async ({ url }: { url: string }) => {
    if (!user) throw new Error("User not authenticated");

    let fullUrl = url;
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = 'https://' + fullUrl;
    }

    try {
      const domain = new URL(fullUrl).hostname.replace('www.', '');
      const name = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
      const icon_url = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;

      const { data, error } = await supabase
        .from('quick_links')
        .insert([{ name, url: fullUrl, user_id: user.id, icon_url }])
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setLinks(currentLinks => [...currentLinks, ...(data as QuickLink[])]);
      }
    } catch (error) {
      console.error('Invalid URL or failed to add link:', error);
      throw new Error('URL invalide. Veuillez vérifier le format (ex: google.com).');
    }
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('quick_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
    
    setLinks(currentLinks => currentLinks.filter(link => link.id !== id));
  };

  const value = { links, loading, addLink, deleteLink };

  return <QuickLinksContext.Provider value={value}>{children}</QuickLinksContext.Provider>;
}

export function useQuickLinks() {
  const context = useContext(QuickLinksContext);
  if (context === undefined) {
    throw new Error('useQuickLinks must be used within a QuickLinksProvider');
  }
  return context;
} 