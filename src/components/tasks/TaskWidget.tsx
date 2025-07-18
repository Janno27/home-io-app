import { useState, useEffect, useRef } from 'react';
import { CheckSquare, X, Plus, ChevronLeft, ChevronRight, ArrowLeft, Circle, Clock, CheckCircle, FolderOpen, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { Task } from './types';
import { TaskExpand } from './TaskExpand';
import { TaskForm } from './TaskForm';

interface TaskWidgetProps {
  showTrigger?: boolean;
}

export function TaskWidget({ showTrigger = true }: TaskWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'ongoing' | 'completed'>('all');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const { tasks, stats, markCompleted, markOngoing, markTodo, remove, create, update, refetch } = useTasks();

  const widgetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(widgetRef, () => {
    if (isOpen) {
      handleToggle();
    }
  });

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
      toast({ title: 'Statut mis à jour' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({ title: 'Erreur lors de la mise à jour', description: (error as Error).message });
    }
  };

  // Handler pour expand/collapse des projets
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Trouver la prochaine tâche prioritaire (seulement les tâches principales, pas les sous-tâches)
  const nextTask = tasks
    .filter(task => task.status !== 'completed' && task.type !== 'subtask')
    .sort((a, b) => {
      // Priorité: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // Puis par date de création (plus récent en premier)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })[0];

  // Filtrer les tâches selon le statut sélectionné (exclure les sous-tâches)
  const filteredTasks = (filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus))
    .filter(task => task.type !== 'subtask');

  // Icône selon le statut
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-gray-400" />;
      case 'ongoing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  // Couleur selon la priorité
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400';
      case 'medium':
        return 'border-l-yellow-400';
      case 'low':
        return 'border-l-green-400';
    }
  };

  // Créer une liste avec projets et sous-tâches
  const createTaskList = () => {
    const taskItems: (Task & { isSubtask?: boolean; indentLevel?: number })[] = [];
    
    filteredTasks.forEach(task => {
      taskItems.push(task);
      
      // Si c'est un projet et qu'il est étendu, ajouter ses sous-tâches
      if (task.type === 'project' && expandedProjects.has(task.id)) {
        const subtasks = tasks.filter(t => t.parent_task_id === task.id);
        subtasks.forEach(subtask => {
          taskItems.push({ ...subtask, isSubtask: true, indentLevel: 1 });
        });
      }
    });
    
    return taskItems;
  };

  // Bouton d'accès : conditionnellement visible
  const accessButton = !showTrigger ? null : (
    <button
      aria-label="Ouvrir les tâches"
      onClick={handleToggle}
      className="fixed bottom-4 left-4 z-[9999] group"
    >
      <div className="backdrop-blur-sm bg-white/10 rounded-lg border border-white/20 shadow-sm hover:bg-white/15 transition-colors group">
        {nextTask ? (
          <div className="flex items-center justify-between px-6 py-1.5 min-w-[320px] max-w-[420px]">
            <div className="flex items-center space-x-2 overflow-hidden">
              <CheckSquare className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-gray-500 text-[10px] leading-none capitalize">{nextTask.priority} priorité</span>
                <p className="text-gray-600 text-xs truncate font-normal max-w-[180px] text-left">{nextTask.title}</p>
              </div>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200 group-hover:-translate-x-1" />
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-1.5 min-w-[280px] space-x-2">
            <div className="flex items-center space-x-2 overflow-hidden">
              <CheckSquare className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <p className="text-gray-600 text-sm font-medium">Tâches</p>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-gray-600 transition-transform duration-200 group-hover:-translate-x-1" />
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
        className={`fixed left-4 top-32 sm:top-28 bottom-20 z-[9998] ${currentTask ? 'w-[48rem] sm:w-[56rem]' : expanded ? 'w-[28rem] sm:w-[40rem]' : 'w-72 sm:w-96'} max-h-[calc(100vh-9rem)] flex flex-col overflow-hidden backdrop-blur-sm bg-gray-100/95 rounded-lg border border-white/20 shadow-sm transition-all origin-bottom-left ${
          isClosing ? 'dock-out' : 'dock-in'
        } text-gray-700`}
      >
        {/* Handle Expand/Collapse */}
        <button
          onClick={() => {
            if (currentTask) {
              // Si une tâche est sélectionnée, la fermer
              setCurrentTask(null);
            } else {
              // Sinon, toggle l'expansion normale
              toggleExpand();
            }
          }}
          className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 rounded-full backdrop-blur-sm bg-white/15 hover:bg-white/20 border border-white/20 text-gray-600 flex items-center justify-center shadow-sm transition-colors duration-200 pr-2.5"
        >
          {currentTask ? (
            <X className="w-3.5 h-3.5" />
          ) : expanded ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-gray-600" />
            <h3 className="text-gray-600 text-sm font-medium">Tâches</h3>
            <span className="text-xs text-gray-500 bg-white/20 px-2 py-0.5 rounded-full">
              {stats.ongoing + stats.todo}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => {
                setCurrentTask(null);
                setEditingTask(null);
                setView('form');
              }} 
              className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700" 
              title="Nouvelle tâche"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button 
              onClick={handleToggle} 
              className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700" 
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-white/10">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'Toutes', count: stats.total },
              { key: 'todo', label: 'À faire', count: stats.todo },
              { key: 'ongoing', label: 'En cours', count: stats.ongoing },
              { key: 'completed', label: 'Terminées', count: stats.completed }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-white/25 text-gray-700'
                    : 'hover:bg-white/15 text-gray-600'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Liste des tâches à gauche */}
          <div className={`${currentTask ? 'w-1/2' : 'w-full'} transition-all duration-300 overflow-hidden border-r border-white/10`}>
            {view === 'form' ? (
              <TaskForm
                task={editingTask}
                onCancel={() => {
                  setView('list');
                  setEditingTask(null);
                }}
                onSave={async (payload, taskId, subtasks) => {
                  if (taskId) {
                    await update(taskId, payload);
                  } else {
                    // Créer la tâche principale
                    const newTask = await create(payload);
                    
                    // Si c'est un projet avec des sous-tâches, les créer
                    if (payload.type === 'project' && subtasks && subtasks.length > 0) {
                      for (const subtask of subtasks) {
                        await create({
                          title: subtask.title,
                          description: subtask.description,
                          status: 'todo',
                          priority: subtask.priority,
                          type: 'subtask',
                          parent_task_id: newTask.id,
                          tags: []
                        });
                      }
                    }
                  }
                  setView('list');
                  setEditingTask(null);
                  toast({ title: taskId ? 'Tâche modifiée' : 'Tâche créée' });
                }}
              />
            ) : (
              <div className="flex-1 h-full overflow-y-auto p-4">
                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                    <CheckSquare className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Aucune tâche</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {createTaskList().map(task => (
                      <div
                        key={task.id}
                        className={`${task.isSubtask ? 'ml-6' : ''} ${currentTask?.id === task.id ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'} flex items-start p-3 rounded-lg cursor-pointer transition-colors border-l-2 ${getPriorityColor(task.priority)}`}
                      >
                        {/* Status button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus = task.status === 'todo' ? 'ongoing' : 
                                             task.status === 'ongoing' ? 'completed' : 'todo';
                            handleStatusChange(task.id, nextStatus);
                          }}
                          className="mt-0.5 mr-3 hover:scale-110 transition-transform"
                          title={`Marquer comme ${task.status === 'todo' ? 'en cours' : task.status === 'ongoing' ? 'terminée' : 'à faire'}`}
                        >
                          {getStatusIcon(task.status)}
                        </button>
                        
                        {/* Project expand button */}
                        {task.type === 'project' && !task.isSubtask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProjectExpansion(task.id);
                            }}
                            className="mt-0.5 mr-2 hover:scale-110 transition-transform"
                            title={expandedProjects.has(task.id) ? 'Réduire' : 'Étendre'}
                          >
                            {expandedProjects.has(task.id) ? 
                              <ChevronDown className="w-3 h-3 text-gray-500" /> : 
                              <ChevronRightIcon className="w-3 h-3 text-gray-500" />
                            }
                          </button>
                        )}
                        
                        {/* Content clickable area */}
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => setCurrentTask(task)}
                        >
                          <div className="flex items-center space-x-2">
                            {task.type === 'project' && <FolderOpen className="w-3 h-3 text-purple-500 flex-shrink-0" />}
                            <p className={`text-sm font-medium text-left ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                              {task.title}
                            </p>
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1 text-left truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                              {task.type === 'project' && !task.isSubtask && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                  {tasks.filter(t => t.parent_task_id === task.id).length} sous-tâches
                                </span>
                              )}
                            </div>
                            {task.due_date && (
                              <span className="text-xs text-gray-500">
                                {new Date(task.due_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Détail de la tâche à droite */}
          {currentTask && (
            <div className="w-1/2 animate-in slide-in-from-right-4 duration-300">
              <TaskExpand 
                task={currentTask} 
                onBack={() => setCurrentTask(null)}
                onEdit={(task) => {
                  setEditingTask(task);
                  setView('form');
                }}
                onDelete={async (taskId) => {
                  try {
                    await remove(taskId);
                    setCurrentTask(null);
                    toast({ title: 'Tâche supprimée' });
                  } catch (error) {
                    toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
                  }
                }}
                tasks={tasks}
                onTasksChange={async () => {
                  // Force refresh des tâches dans TaskWidget
                  await refetch?.();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 