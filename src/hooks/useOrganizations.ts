import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

export function useOrganizations() {
  const { user } = useAuthContext();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les organisations de l'utilisateur
  const fetchOrganizations = async () => {
    if (!user) return;

    try {
      // D'abord, récupérer les IDs des organisations où l'utilisateur est membre
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      
      if (!memberData || memberData.length === 0) {
        setOrganizations([]);
        setLoading(false);
        return;
      }

      // Ensuite, récupérer les détails des organisations
      const organizationIds = memberData.map(member => member.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', organizationIds)
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;
      
      setOrganizations(orgsData || []);
      
      // Sélectionner la première organisation par défaut
      if (orgsData && orgsData.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgsData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres d'une organisation
  const fetchMembers = async (organizationId: string) => {
    try {
      // Utiliser la fonction RPC qui fonctionne et contourne les problèmes de JOIN
      const { data, error } = await supabase
        .rpc('get_organization_members', { org_id: organizationId });

      if (error) throw error;
      
      // Transformer les données pour correspondre au type OrganizationMember
      const transformedMembers = (data || []).map((member: any) => ({
        id: crypto.randomUUID(), // ID temporaire pour la compatibilité
        organization_id: organizationId,
        user_id: member.user_id,
        role: member.role, // Maintenant récupéré de la base de données
        created_at: new Date().toISOString(), // Valeur temporaire
        profiles: {
          email: member.email,
          full_name: member.full_name,
        }
      }));
      
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  // Créer une nouvelle organisation
  const createOrganization = async (name: string, description?: string) => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name,
          description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchOrganizations();
      setCurrentOrganization(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Mettre à jour une organisation
  const updateOrganization = async (id: string, updates: Partial<Pick<Organization, 'name' | 'description'>>) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchOrganizations();
      if (currentOrganization?.id === id) {
        setCurrentOrganization(data);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Supprimer une organisation
  const deleteOrganization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchOrganizations();
      if (currentOrganization?.id === id) {
        setCurrentOrganization(organizations[0] || null);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Inviter un membre
  const inviteMember = async (organizationId: string, email: string, role: 'admin' | 'member' = 'member') => {
    try {
      // Trouver l'utilisateur par email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError) throw new Error('Utilisateur non trouvé');

      const { data, error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: profile.id,
          role,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (currentOrganization?.id === organizationId) {
        await fetchMembers(organizationId);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Supprimer un membre
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      if (currentOrganization) {
        await fetchMembers(currentOrganization.id);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Changer le rôle d'un membre
  const updateMemberRole = async (memberId: string, role: 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      
      if (currentOrganization) {
        await fetchMembers(currentOrganization.id);
      }
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers(currentOrganization.id);
    }
  }, [currentOrganization]);

  return {
    organizations,
    currentOrganization,
    members,
    loading,
    setCurrentOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    refetch: fetchOrganizations,
  };
}