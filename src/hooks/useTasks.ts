import { useState, useEffect } from 'react';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/components/tasks/types';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useOrganizations } from './useOrganizations';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const { currentOrganization } = useOrganizations();

  // Charger les tâches depuis Supabase
  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Si on a une organisation, inclure aussi les tâches de l'organisation
      if (currentOrganization) {
        query = query.or(`user_id.eq.${user.id},organization_id.eq.${currentOrganization.id}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, currentOrganization]);

  // Créer une tâche
  const create = async (payload: CreateTaskPayload): Promise<Task> => {
    if (!user) throw new Error('Utilisateur non connecté');

    const newTask = {
      ...payload,
      user_id: user.id,
      organization_id: currentOrganization?.id || null,
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      type: payload.type || 'single',
      progress: payload.type === 'project' ? 0 : null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }

    // Recharger les tâches pour avoir la liste mise à jour
    await fetchTasks();
    return data;
  };

  // Mettre à jour une tâche
  const update = async (id: string, payload: Partial<UpdateTaskPayload>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw error;
    }

    // Recharger les tâches pour avoir la liste mise à jour
    await fetchTasks();
    return data;
  };

  // Supprimer une tâche
  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }

    // Recharger les tâches pour avoir la liste mise à jour
    await fetchTasks();
  };

  // Marquer comme terminée
  const markCompleted = async (id: string): Promise<Task> => {
    return update(id, { status: 'completed' });
  };

  // Marquer comme en cours
  const markOngoing = async (id: string): Promise<Task> => {
    return update(id, { status: 'ongoing' });
  };

  // Marquer comme à faire
  const markTodo = async (id: string): Promise<Task> => {
    return update(id, { status: 'todo' });
  };

  // Statistiques rapides (exclure les sous-tâches)
  const mainTasks = tasks.filter(t => t.type !== 'subtask');
  const stats = {
    total: mainTasks.length,
    todo: mainTasks.filter(t => t.status === 'todo').length,
    ongoing: mainTasks.filter(t => t.status === 'ongoing').length,
    completed: mainTasks.filter(t => t.status === 'completed').length,
    highPriority: mainTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  };

  return {
    tasks,
    loading,
    stats,
    create,
    update,
    remove,
    markCompleted,
    markOngoing,
    markTodo,
    refetch: fetchTasks
  };
} 