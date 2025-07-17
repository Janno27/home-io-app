import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerNotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimerNotification({ isOpen, onClose }: TimerNotificationProps) {
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fonction pour créer une mélodie synthétique
      const createSyntheticMelody = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99, 659.25, 523.25]; // Do, Mi, Sol, Mi, Do
        const duration = 0.8; // Durée de chaque note en secondes
        
        notes.forEach((frequency, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          // Enveloppe sonore pour un son plus doux
          const startTime = audioContext.currentTime + index * duration;
          const endTime = startTime + duration * 0.8;
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
          
          oscillator.start(startTime);
          oscillator.stop(endTime);
        });
      };

      // Tenter de jouer le fichier audio, sinon utiliser la mélodie synthétique
      const audio = new Audio('/sounds/timer-end.mp3');
      audio.loop = false;
      audio.volume = 0.6;
      setAudioRef(audio);
      
      audio.play().catch(() => {
        // Si le fichier audio échoue, créer une mélodie synthétique
        createSyntheticMelody();
      });
      
      // Arrêter le son après 10 secondes
      const timeout = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 10000);
      
      return () => {
        clearTimeout(timeout);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Notification toast */}
      <div className="relative pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6 max-w-sm mx-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
          <div className="text-center">
            {/* Header avec bouton fermer */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-900 font-medium">Timer terminé !</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Votre session de travail est arrivée à terme.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* CTA centré */}
            <div className="flex justify-center">
              <Button
                onClick={handleClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                C'est noté !
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 