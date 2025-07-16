import { useState, useEffect } from 'react';
import { Timer as TimerIcon, X, Play, Pause } from 'lucide-react';

interface MiniTimerProps {
  onClick: () => void;
}

export function MiniTimer({ onClick }: MiniTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const timerIsVisible = timeLeft !== null;
  useEffect(() => {
    // Réinitialise l'état de survol lorsque la visibilité du minuteur change.
    // Cela corrige un bug où les contrôles s'affichaient si le minuteur
    // apparaissait directement sous le curseur de la souris.
    setIsHovered(false);
  }, [timerIsVisible]);

  useEffect(() => {
    const checkTimer = () => {
      const storedEndTime = localStorage.getItem('timer_endTime');
      if (storedEndTime) {
        setIsRunning(true);
        const endTime = parseInt(storedEndTime, 10);
        const now = Date.now();
        const remaining = Math.round((endTime - now) / 1000);

        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          setTimeLeft(null);
          setIsRunning(false);
          localStorage.removeItem('timer_endTime');
          localStorage.removeItem('timer_duration');
          localStorage.removeItem('timer_timeLeft');
        }
      } else {
        setIsRunning(false);
        const storedTimeLeft = localStorage.getItem('timer_timeLeft');
        if (storedTimeLeft) {
          setTimeLeft(parseInt(storedTimeLeft, 10));
        } else {
          setTimeLeft(null);
        }
      }
    };

    const intervalId = setInterval(checkTimer, 1000);
    checkTimer(); 

    return () => clearInterval(intervalId);
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche d'ouvrir le grand timer
    const nextIsRunning = !isRunning;
    if (nextIsRunning) {
      if (timeLeft === null) return;
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem('timer_endTime', String(endTime));
      if (!localStorage.getItem('timer_duration')) {
        localStorage.setItem('timer_duration', String(timeLeft));
      }
      localStorage.removeItem('timer_timeLeft');
    } else {
      localStorage.removeItem('timer_endTime');
      localStorage.setItem('timer_timeLeft', String(timeLeft));
    }
    setIsRunning(nextIsRunning);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeLeft(null);
    setIsRunning(false);
    localStorage.removeItem('timer_endTime');
    localStorage.removeItem('timer_duration');
    localStorage.removeItem('timer_timeLeft');
  };

  if (timeLeft === null) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-300 dark:bg-gray-800/50 dark:hover:bg-gray-700/60 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 border border-gray-200/60 dark:border-gray-700/60 min-w-[90px] h-[34px]"
      title="Ouvrir le timer"
    >
      {/* État normal (temps affiché) */}
      <div className={`transition-all duration-200 flex items-center space-x-2 ${isHovered ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <TimerIcon className="w-3.5 h-3.5" />
        <span className="font-mono text-xs">{formatTime(timeLeft)}</span>
      </div>

      {/* État survol (contrôles) */}
      <div className={`absolute inset-0 transition-all duration-200 flex items-center justify-center space-x-3 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        <button onClick={handleClose} title="Fermer" className="p-1 rounded-full hover:bg-white/20">
          <X className="w-4 h-4" />
        </button>
        <button onClick={handlePlayPause} title={isRunning ? 'Pause' : 'Play'} className="p-1 rounded-full hover:bg-white/20">
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}