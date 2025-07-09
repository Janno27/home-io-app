import { useState, useEffect, useRef } from 'react';
import { Settings, X, Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TimerState } from './types';

interface TimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Timer({ isOpen, onClose }: TimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    workDuration: 25,
    breakDuration: 5,
    currentSession: 'work',
    timeRemaining: 25 * 60, // 25 minutes en secondes
    isRunning: false,
    isConfiguring: false,
  });
  
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitle = useRef<string>('');
  const titleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Demander la permission pour les notifications au lancement
  useEffect(() => {
    if (isOpen && notificationPermission === 'default') {
      originalTitle.current = document.title;
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, [isOpen, notificationPermission]);

  // Gestion de l'ouverture/fermeture avec animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    // Nettoyer le titre si on ferme pendant un buzz
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
      titleIntervalRef.current = null;
      document.title = originalTitle.current;
    }
    onClose();
  };

  // Gestion du timer
  useEffect(() => {
    if (timer.isRunning && timer.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.timeRemaining]);

  // Fonction pour envoyer une notification et faire vibrer l'onglet
  const notifyTimerComplete = (sessionType: 'work' | 'break') => {
    const message = sessionType === 'work' 
      ? 'Temps de travail terminé ! Prenez une pause.' 
      : 'Pause terminée ! Retour au travail.';
    
    // Notification du navigateur
    if (notificationPermission === 'granted') {
      new Notification('Timer terminé', {
        body: message,
        icon: '/favicon.ico',
        tag: 'timer-complete'
      });
    }
    
    // Faire clignoter le titre de l'onglet
    const buzzTitle = '🔔 Timer terminé !';
    let isOriginal = false;
    
    // Nettoyer l'ancien interval s'il existe
    if (titleIntervalRef.current) {
      clearInterval(titleIntervalRef.current);
    }
    
    titleIntervalRef.current = setInterval(() => {
      document.title = isOriginal ? originalTitle.current : buzzTitle;
      isOriginal = !isOriginal;
    }, 1000);
    
    // Arrêter le clignotement après 10 secondes
    setTimeout(() => {
      if (titleIntervalRef.current) {
        clearInterval(titleIntervalRef.current);
        titleIntervalRef.current = null;
        document.title = originalTitle.current;
      }
    }, 10000);
    
    // Vibration si supportée (mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // Basculer entre travail et pause quand le timer se termine
  useEffect(() => {
    if (timer.timeRemaining === 0 && timer.isRunning) {
      const currentSession = timer.currentSession;
      const nextSession = currentSession === 'work' ? 'break' : 'work';
      const nextDuration = nextSession === 'work' ? timer.workDuration : timer.breakDuration;
      
      // Notifier la fin du timer
      notifyTimerComplete(currentSession);
      
      setTimer(prev => ({
        ...prev,
        currentSession: nextSession,
        timeRemaining: nextDuration * 60,
        isRunning: false
      }));
    }
  }, [timer.timeRemaining, timer.isRunning, timer.workDuration, timer.breakDuration, timer.currentSession, notificationPermission]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = timer.currentSession === 'work' 
      ? timer.workDuration * 60 
      : timer.breakDuration * 60;
    return ((totalTime - timer.timeRemaining) / totalTime) * 100;
  };

  const handlePlayPause = () => {
    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setTimer(prev => ({
      ...prev,
      timeRemaining: prev.currentSession === 'work' 
        ? prev.workDuration * 60 
        : prev.breakDuration * 60,
      isRunning: false
    }));
  };

  const handleSettings = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTimer(prev => ({ ...prev, isConfiguring: !prev.isConfiguring }));
      setIsTransitioning(false);
    }, 150);
  };

  const handleWorkDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setTimer(prev => ({
      ...prev,
      workDuration: newDuration,
      timeRemaining: prev.currentSession === 'work' ? newDuration * 60 : prev.timeRemaining
    }));
  };

  const handleBreakDurationChange = (value: number[]) => {
    const newDuration = value[0];
    setTimer(prev => ({
      ...prev,
      breakDuration: newDuration,
      timeRemaining: prev.currentSession === 'break' ? newDuration * 60 : prev.timeRemaining
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-end pr-4 pointer-events-none">
      <div 
        className={`w-80 sm:w-96 h-[65vh] bg-black/20 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg overflow-hidden pointer-events-auto transition-all duration-300 flex flex-col ${
          isClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!timer.isConfiguring && (
                <>
                  <TimerIcon className="w-4 h-4 text-white/90" />
                  <h3 className="text-white text-sm font-normal">Timer</h3>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettings}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
                title="Paramètres"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white/90 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {timer.isConfiguring ? (
            /* Configuration View */
            <div className={`p-6 h-full flex flex-col space-y-8 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'animate-out slide-out-to-right opacity-0' : 'opacity-100'
            }`}>
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-3">
                    Work Duration (minutes)
                  </label>
                  <Slider
                    value={[timer.workDuration]}
                    onValueChange={handleWorkDurationChange}
                    max={60}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-right mt-2">
                    <span className="text-white/60 text-sm font-medium">
                      {timer.workDuration} minutes
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-white/80 text-sm font-medium block mb-3">
                    Break Duration (minutes)
                  </label>
                  <Slider
                    value={[timer.breakDuration]}
                    onValueChange={handleBreakDurationChange}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-right mt-2">
                    <span className="text-white/60 text-sm font-medium">
                      {timer.breakDuration} minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex items-end">
                <Button
                  onClick={handleSettings}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Retour
                </Button>
              </div>
            </div>
          ) : (
            /* Timer View */
            <div className={`p-6 h-full flex flex-col items-center justify-center space-y-8 transition-all duration-300 ease-in-out ${
              isTransitioning ? 'animate-out slide-out-to-left opacity-0' : 'opacity-100'
            }`}>
              {/* Timer Circle */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={timer.currentSession === 'work' ? '#60a5fa' : '#22c55e'}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Timer Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-light text-white mb-2">
                    {formatTime(timer.timeRemaining)}
                  </div>
                  <div className={`text-sm font-medium ${
                    timer.currentSession === 'work' ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {timer.currentSession === 'work' ? 'Work Time' : 'Break Time'}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-12 w-12 p-0 hover:bg-white/20 text-white/70 hover:text-white"
                  title="Reset"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </Button>
                
                <div className="w-12" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 