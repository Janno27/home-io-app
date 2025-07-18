import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { DockAnimation } from '@/components/ui/DockAnimation';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface TimerProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint?: { x: number; y: number };
}

export function Timer({ isOpen, onClose, originPoint }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes par défaut
  const [isRunning, setIsRunning] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configTime, setConfigTime] = useState(25); // en minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(widgetRef, onClose);

  // Gérer la persistance du timer avec localStorage
  useEffect(() => {
    // À l'initialisation, vérifier s'il y a un timer en cours
    const storedEndTime = localStorage.getItem('timer_endTime');
    const storedDuration = localStorage.getItem('timer_duration');

    if (storedEndTime && storedDuration) {
      // Un timer est en cours
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      if (now < endTime) {
        setTimeLeft(Math.round((endTime - now) / 1000));
        setConfigTime(parseInt(storedDuration, 10) / 60);
        setIsRunning(true);
      } else {
        // Le timer est terminé
        localStorage.removeItem('timer_endTime');
        localStorage.removeItem('timer_duration');
      }
    } else {
      // Pas de timer en cours, vérifier s'il y a un temps en pause
      const storedTimeLeft = localStorage.getItem('timer_timeLeft');
      if (storedTimeLeft && storedDuration) {
        setTimeLeft(parseInt(storedTimeLeft, 10));
        setConfigTime(parseInt(storedDuration, 10) / 60);
        setIsRunning(false);
      }
    }
  }, []);

  // Ne fermer que la vue de configuration quand le widget se ferme, pas le timer
  useEffect(() => {
    if (!isOpen) {
      setIsConfiguring(false);
    }
  }, [isOpen]);

  // Logique du décompte
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const storedEndTime = localStorage.getItem('timer_endTime');
        if (storedEndTime) {
          const endTime = parseInt(storedEndTime, 10);
          const now = Date.now();
          const remaining = Math.round((endTime - now) / 1000);

          if (remaining > 0) {
            setTimeLeft(remaining);
          } else {
            setTimeLeft(0);
            setIsRunning(false);
            // Le hook useTimerNotification se chargera du nettoyage et des notifications
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(currentIsRunning => {
      const nextIsRunning = !currentIsRunning;
      if (nextIsRunning) {
        // Démarre ou reprend le timer
        const endTime = Date.now() + timeLeft * 1000;
        localStorage.setItem('timer_endTime', String(endTime));
        // On garde la durée totale en mémoire
        if (!localStorage.getItem('timer_duration')) {
           localStorage.setItem('timer_duration', String(configTime * 60));
        }
        // On supprime le temps en pause s'il existait
        localStorage.removeItem('timer_timeLeft');
      } else {
        // Met le timer en pause
        localStorage.removeItem('timer_endTime');
        // Sauvegarde le temps restant
        localStorage.setItem('timer_timeLeft', String(timeLeft));
      }
      return nextIsRunning;
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(configTime * 60);
    localStorage.removeItem('timer_endTime');
    localStorage.removeItem('timer_duration');
    localStorage.removeItem('timer_timeLeft');
  };

  const handleConfigSave = () => {
    setIsRunning(false);
    setTimeLeft(configTime * 60);
    setIsConfiguring(false);
    localStorage.removeItem('timer_endTime');
    localStorage.removeItem('timer_duration');
    localStorage.removeItem('timer_timeLeft');
  };

  const progress = ((configTime * 60) - timeLeft) / (configTime * 60) * 100;

  return (
    <DockAnimation isOpen={isOpen} originPoint={originPoint}>
      <div className="flex items-start justify-end pr-4 h-full pointer-events-none pt-32">
        <div ref={widgetRef} className="w-80 h-[45vh] bg-gray-100/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4 text-gray-600" />
              <h3 className="text-gray-600 text-sm font-medium">
                {isConfiguring ? 'Configuration' : 'Timer'}
              </h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                title="Configuration"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto min-h-0">
            {isConfiguring ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-gray-600 text-sm font-medium">
                    Durée: {configTime} minutes
                  </label>
                  <Slider
                    value={[configTime]}
                    onValueChange={(value) => setConfigTime(value[0])}
                    max={60}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleConfigSave}
                  className="w-full bg-white/15 hover:bg-white/25 text-gray-700 border-white/20"
                >
                  Appliquer
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {/* Cercle de progression */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-gray-300"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={339.292}
                      strokeDashoffset={339.292 - (progress / 100) * 339.292}
                      className="text-blue-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-mono text-gray-700">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Contrôles */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-10 w-10 p-0 rounded-full hover:bg-white/20 text-gray-600 hover:text-gray-700"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    disabled={timeLeft === 0}
                    className="h-12 w-12 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                  >
                    {isRunning ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </Button>
                </div>

                {timeLeft === 0 && (
                  <div className="text-center">
                    <p className="text-green-600 font-medium">Temps écoulé !</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DockAnimation>
  );
} 