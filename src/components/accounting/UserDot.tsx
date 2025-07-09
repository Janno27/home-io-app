import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserDotProps {
  userId: string;
  userName?: string | null;
  userEmail?: string;
  size?: 'sm' | 'md';
}

// Fonction pour générer une couleur basée sur l'ID utilisateur
const getUserColor = (userId: string): string => {
  // Palette de couleurs distinctes et agréables
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-violet-500',
  ];
  
  // Utiliser un hash simple de l'ID pour déterminer la couleur
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export function UserDot({ userId, userName, userEmail, size = 'sm' }: UserDotProps) {
  const colorClass = getUserColor(userId);
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  
  const displayName = userName || (userEmail ? userEmail.split('@')[0] : 'Utilisateur');
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`${colorClass} ${sizeClass} rounded-full flex-shrink-0`} />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{displayName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 