import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, FolderOpen, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Task, CreateTaskPayload } from './types';
import { useTasks } from '@/hooks/useTasks';
import { useOrganizations } from '@/hooks/useOrganizations';

interface TaskFormProps {
  task?: Task | null;
  parentTask?: Task | null; // Pour créer une sous-tâche
  onCancel: () => void;
  onSave: (payload: CreateTaskPayload, id?: string, subtasks?: Array<{title: string; description: string; priority: 'low' | 'medium' | 'high'}>) => Promise<void>;
}

export function TaskForm({ task, parentTask, onCancel, onSave }: TaskFormProps) {
  const { tasks } = useTasks();
  const { members } = useOrganizations();
  
  const isEdit = !!task;
  const isSubtask = !!parentTask || task?.type === 'subtask';
  
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    type: isSubtask ? 'subtask' : 'single',
    parent_task_id: parentTask?.id || task?.parent_task_id,
    due_date: undefined,
    estimated_duration: undefined,
    tags: [],
    assignee_id: undefined
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // État pour les sous-tâches temporaires lors de la création d'un projet
  const [tempSubtasks, setTempSubtasks] = useState<Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>>([]);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Projets disponibles pour créer des sous-tâches
  const availableProjects = tasks.filter(t => t.type === 'project');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        type: task.type,
        parent_task_id: task.parent_task_id,
        due_date: task.due_date,
        estimated_duration: task.estimated_duration,
        tags: task.tags || [],
        assignee_id: task.assignee_id
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (formData.type === 'subtask' && !formData.parent_task_id) {
      newErrors.parent_task_id = 'Un projet parent est requis pour une sous-tâche';
    }

    if (formData.estimated_duration && formData.estimated_duration < 1) {
      newErrors.estimated_duration = 'La durée doit être positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Passer les sous-tâches temporaires à onSave pour qu'il gère tout
      await onSave(
        formData, 
        task?.id, 
        !isEdit && formData.type === 'project' ? tempSubtasks : undefined
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.title.trim()) {
      setTempSubtasks(prev => [...prev, {
        id: Date.now().toString(),
        ...newSubtask
      }]);
      setNewSubtask({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setTempSubtasks(prev => prev.filter(st => st.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-white/15 text-gray-600"
            title="Retour"
          >
            <ArrowLeft className="w-3 h-3" />
          </button>
          <h3 className="text-xs font-medium text-gray-700">
            {isEdit ? 'Modifier la tâche' : parentTask ? `Nouvelle sous-tâche pour "${parentTask.title}"` : 'Nouvelle tâche'}
          </h3>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Titre */}
        <div className="space-y-1">
          <label htmlFor="title" className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Titre *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Finaliser le rapport mensuel"
            className={`bg-white/10 border-white/20 text-sm ${errors.title ? 'border-red-400' : ''}`}
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Description
          </label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Décrivez la tâche..."
            rows={2}
            className="bg-white/10 border-white/20 resize-none text-sm"
          />
        </div>

        {/* Type de tâche */}
        {!parentTask && !isEdit && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
              Type de tâche
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'single' }))}
                className={`p-2 rounded-lg border transition-colors text-left ${
                  formData.type === 'single'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/15'
                }`}
              >
                <div className="font-medium text-xs">Tâche unique</div>
                <div className="text-xs opacity-70">Une tâche simple</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'project' }))}
                className={`p-2 rounded-lg border transition-colors text-left ${
                  formData.type === 'project'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white/10 border-white/20 text-gray-600 hover:bg-white/15'
                }`}
              >
                <div className="font-medium text-xs flex items-center space-x-1">
                  <FolderOpen className="w-3 h-3" />
                  <span>Projet</span>
                </div>
                <div className="text-xs opacity-70">Avec sous-tâches</div>
              </button>
            </div>
          </div>
        )}

        {/* Projet parent pour sous-tâche */}
        {(formData.type === 'subtask' && !parentTask) && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
              Projet parent *
            </label>
            <select
              value={formData.parent_task_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_task_id: e.target.value || undefined }))}
              className={`w-full p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-sm ${errors.parent_task_id ? 'border-red-400' : ''}`}
            >
              <option value="">Sélectionner un projet</option>
              {availableProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {errors.parent_task_id && <p className="text-xs text-red-500">{errors.parent_task_id}</p>}
          </div>
        )}

        {/* Grille des propriétés */}
        <div className="grid grid-cols-2 gap-3">
          {/* Priorité */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-sm"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>

          {/* Statut */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'todo' | 'ongoing' | 'completed' }))}
              className="w-full p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-sm"
            >
              <option value="todo">À faire</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminée</option>
            </select>
          </div>
        </div>

        {/* Échéance */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Échéance
          </label>
          <Input
            type="date"
            value={formData.due_date ? formData.due_date.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
            }))}
            className="bg-white/10 border-white/20 text-sm"
          />
        </div>

        {/* Durée estimée */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Durée estimée (minutes)
          </label>
          <Input
            type="number"
            value={formData.estimated_duration || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value ? parseInt(e.target.value) : undefined }))}
            placeholder="Ex: 120"
            min="1"
            className={`bg-white/10 border-white/20 text-sm ${errors.estimated_duration ? 'border-red-400' : ''}`}
          />
          {errors.estimated_duration && <p className="text-xs text-red-500">{errors.estimated_duration}</p>}
        </div>

        {/* Assigné à */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Assigné à
          </label>
          <select
            value={formData.assignee_id || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, assignee_id: e.target.value || undefined }))}
            className="w-full p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-sm"
          >
            <option value="">Non assigné</option>
            {members.map(member => (
              <option key={member.user_id} value={member.user_id}>
                {member.profiles?.full_name || member.profiles?.email}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ajouter un tag"
                className="bg-white/10 border-white/20 flex-1 text-sm"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-gray-700 hover:bg-white/20"
              >
                <Tag className="w-3 h-3" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 text-xs px-2 py-1 bg-white/20 text-gray-700 rounded-md"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section sous-tâches pour les projets */}
        {!isEdit && formData.type === 'project' && (
          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide text-left">
                Sous-tâches ({tempSubtasks.length})
              </label>
            </div>

            {/* Formulaire d'ajout de sous-tâche */}
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <Input
                value={newSubtask.title}
                onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de la sous-tâche"
                className="bg-white/10 border-white/20 text-sm"
              />
              <div className="flex space-x-2">
                <Input
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optionnel)"
                  className="bg-white/10 border-white/20 text-sm flex-1"
                />
                <select
                  value={newSubtask.priority}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  className="p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-sm"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
                <Button
                  type="button"
                  onClick={handleAddSubtask}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Liste des sous-tâches temporaires */}
            {tempSubtasks.length > 0 && (
              <div className="space-y-2">
                {tempSubtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 text-left">{subtask.title}</p>
                      {subtask.description && (
                        <p className="text-xs text-gray-500 text-left">{subtask.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-white/20 text-gray-600 rounded">
                      {subtask.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(subtask.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex space-x-2 pt-3 border-t border-white/10">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-white/10 border-white/20 text-gray-700 hover:bg-white/20 text-sm"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            {isEdit ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
} 