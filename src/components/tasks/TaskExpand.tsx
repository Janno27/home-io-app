import { useState } from 'react';
import { 
  ArrowLeft, 
  Circle, 
  CheckCircle, 
  Plus,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Task, CreateTaskPayload } from './types';
import { useTasks } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskExpandProps {
  task: Task | null;
  onBack: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  tasks: Task[]; // Pour afficher les sous-tâches
  onTasksChange?: () => void; // Callback quand les tâches changent
}

export function TaskExpand({ task, onBack, onEdit, onDelete, tasks, onTasksChange }: TaskExpandProps) {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const { markCompleted, markOngoing, markTodo, create } = useTasks();

  // État pour le formulaire de sous-tâche
  const [newSubtask, setNewSubtask] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    type: 'subtask',
    parent_task_id: task?.id,
    tags: []
  });

  if (!task) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center space-y-2">
          <FolderOpen className="w-6 h-6 mx-auto opacity-50" />
          <p className="text-xs">Sélectionnez une tâche pour voir les détails</p>
        </div>
      </div>
    );
  }

  // Récupérer les sous-tâches si c'est un projet
  const subtasks = task.type === 'project' 
    ? tasks.filter(t => t.parent_task_id === task.id)
    : [];

  // Récupérer la tâche parent si c'est une sous-tâche
  const parentTask = task.type === 'subtask' && task.parent_task_id
    ? tasks.find(t => t.id === task.parent_task_id)
    : null;

  // Calculer le progrès pour les projets (ongoing = 50%, completed = 100%)
  const projectProgress = task.type === 'project' && subtasks.length > 0
    ? Math.round(((subtasks.filter(st => st.status === 'completed').length * 1.0 + 
                  subtasks.filter(st => st.status === 'ongoing').length * 0.5) / subtasks.length) * 100)
    : task.progress || 0;

  // Handler pour changer le statut d'une tâche
  const handleStatusChange = async (taskId: string, newStatus: 'todo' | 'ongoing' | 'completed') => {
    try {
      switch (newStatus) {
        case 'todo':
          await markTodo(taskId);
          break;
        case 'ongoing':
          await markOngoing(taskId);
          break;
        case 'completed':
          await markCompleted(taskId);
          break;
      }
      // Notify parent component pour refresh
      onTasksChange?.();
      toast({ title: 'Statut mis à jour' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({ title: 'Erreur lors de la mise à jour', description: (error as Error).message });
    }
  };

  // Handler pour créer une sous-tâche
  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubtask.title.trim()) {
      toast({ title: 'Le titre est requis', variant: 'destructive' });
      return;
    }

    try {
      await create({
        ...newSubtask,
        parent_task_id: task.id
      });
      
      // Notify parent component pour refresh
      onTasksChange?.();
      
      // Réinitialiser le formulaire
      setNewSubtask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        type: 'subtask',
        parent_task_id: task.id,
        tags: []
      });
      
      setShowSubtaskForm(false);
      toast({ title: 'Sous-tâche créée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({ title: 'Erreur lors de la création', description: (error as Error).message, variant: 'destructive' });
    }
  };

  // Icône selon le statut
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-3 h-3 text-gray-400" />;
      case 'ongoing':
        return <Circle className="w-3 h-3 text-blue-500 fill-current" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
  };

  // Couleur selon la priorité
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
    }
  };

  // Couleur selon le type
  const getTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'project':
        return 'text-purple-600 bg-purple-50';
      case 'single':
        return 'text-blue-600 bg-blue-50';
      case 'subtask':
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-white/10">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        {/* Type chip pour les sous-tâches */}
        {task.type === 'subtask' && (
          <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(task.type)}`}>
              Sous-tâche
            </span>
          </div>
        )}
        
        {/* Header avec titre et priorité */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-white/15 text-gray-600"
              title="Retour"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <h3 className="text-xs font-medium text-gray-700">Détails de la tâche</h3>
          </div>
          
          {/* Priorité alignée à droite */}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
          </span>
        </div>

        {/* Titre avec action de statut */}
        <div className="flex items-start space-x-3">
          <button
            onClick={() => {
              const nextStatus = task.status === 'todo' ? 'ongoing' : 
                               task.status === 'ongoing' ? 'completed' : 'todo';
              handleStatusChange(task.id, nextStatus);
            }}
            className="mt-1 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>
          <div className="flex-1">
            <h2 className={`text-base font-semibold text-gray-800 text-left ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h2>
          </div>
          <div className="flex space-x-1">
            {onEdit && (
              <button 
                onClick={() => onEdit(task)}
                className="p-2 rounded-full hover:bg-white/15 text-gray-600" 
                title="Éditer"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(task.id)}
                className="p-2 rounded-full hover:bg-white/15 text-red-600" 
                title="Supprimer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Lien vers tâche parent si sous-tâche */}
        {parentTask && (
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-xs">
              <FolderOpen className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600">Tâche parent:</span>
              <span className="font-medium text-gray-700">{parentTask.title}</span>
            </div>
          </div>
        )}

        {/* Progrès pour les projets */}
        {task.type === 'project' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium text-gray-700">{projectProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div className="space-y-1 text-left">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</span>
            <p className="text-xs text-gray-700 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Informations */}
        <div className="space-y-2 text-left">
          {task.due_date && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Échéance</span>
              <p className="text-xs text-gray-700">{formatDate(task.due_date)}</p>
            </div>
          )}
          
          {task.estimated_duration && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Durée estimée</span>
              <p className="text-xs text-gray-700">{task.estimated_duration} min</p>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Créée le</span>
            <p className="text-xs text-gray-700">{formatDate(task.created_at)}</p>
          </div>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="space-y-1 text-left">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tags</span>
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-white/20 text-gray-700 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sous-tâches pour les projets */}
        {task.type === 'project' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center space-x-2 text-xs font-medium text-gray-700 hover:text-gray-900"
              >
                {showSubtasks ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <span>Sous-tâches ({subtasks.length})</span>
              </button>
              <button 
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                className="p-1 rounded-full hover:bg-white/15 text-gray-600" 
                title="Ajouter une sous-tâche"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Formulaire d'ajout de sous-tâche */}
            {showSubtaskForm && (
              <form onSubmit={handleCreateSubtask} className="bg-white/5 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-gray-700">Nouvelle sous-tâche</h4>
                  <button
                    type="button"
                    onClick={() => setShowSubtaskForm(false)}
                    className="p-1 rounded-full hover:bg-white/15 text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <Input
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la sous-tâche"
                  className="bg-white/10 border-white/20 text-xs"
                  required
                />
                
                <Textarea
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optionnel)"
                  rows={2}
                  className="bg-white/10 border-white/20 text-xs resize-none"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newSubtask.priority}
                    onChange={(e) => setNewSubtask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-xs"
                  >
                    <option value="low">Priorité basse</option>
                    <option value="medium">Priorité moyenne</option>
                    <option value="high">Priorité haute</option>
                  </select>
                  
                  <select
                    value={newSubtask.status}
                    onChange={(e) => setNewSubtask(prev => ({ ...prev, status: e.target.value as 'todo' | 'ongoing' | 'completed' }))}
                    className="p-2 rounded-lg bg-white/10 border-white/20 text-gray-700 text-xs"
                  >
                    <option value="todo">À faire</option>
                    <option value="ongoing">En cours</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={() => setShowSubtaskForm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/10 border-white/20 text-gray-700 hover:bg-white/20 text-xs"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    Créer
                  </Button>
                </div>
              </form>
            )}

            {showSubtasks && (
              <div className="space-y-2">
                {subtasks.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">Aucune sous-tâche</p>
                ) : (
                  subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors">
                      <button
                        onClick={() => {
                          const nextStatus = subtask.status === 'todo' ? 'ongoing' : 
                                           subtask.status === 'ongoing' ? 'completed' : 'todo';
                          handleStatusChange(subtask.id, nextStatus);
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(subtask.status)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium text-left ${subtask.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-xs text-gray-500 truncate text-left">{subtask.description}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(subtask.priority)}`}>
                        {subtask.priority === 'high' ? 'H' : subtask.priority === 'medium' ? 'M' : 'L'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 