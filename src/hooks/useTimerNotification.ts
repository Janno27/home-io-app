import { useState, useEffect, useCallback } from 'react';

export function useTimerNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  const showBrowserNotification = useCallback(() => {
    // Créer notification navigateur pour alerter l'utilisateur
    const notification = new Notification('⏰ Timer terminé !', {
      body: 'Votre session de travail est arrivée à terme.',
      icon: '/favicon.ico',
      tag: 'timer-notification',
      requireInteraction: true, // Garde la notification visible jusqu'à interaction
      silent: false // Permet les sons système
    });

    // Gérer le clic sur la notification
    notification.onclick = () => {
      window.focus(); // Focus sur l'onglet
      notification.close();
    };

    // Fermer automatiquement après 10 secondes si pas d'interaction
    setTimeout(() => {
      notification.close();
    }, 10000);
  }, []);

  const triggerNotification = useCallback(() => {
    setShowNotification(true);
    setHasShownNotification(true);
    
    // Demander permission pour les notifications navigateur si pas encore accordée
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showBrowserNotification();
        }
      });
    } else if (Notification.permission === 'granted') {
      showBrowserNotification();
    }
  }, [showBrowserNotification]);

  const closeNotification = useCallback(() => {
    setShowNotification(false);
    // Reset après un délai pour permettre de futures notifications
    setTimeout(() => {
      setHasShownNotification(false);
    }, 1000);
  }, []);

  // Surveiller le localStorage pour détecter la fin du timer
  useEffect(() => {
    const checkTimerEnd = () => {
      const storedEndTime = localStorage.getItem('timer_endTime');
      const storedTimeLeft = localStorage.getItem('timer_timeLeft');
      
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        const now = Date.now();
        
        // Si le timer est terminé et qu'on n'a pas encore montré la notification
        if (now >= endTime && !hasShownNotification) {
          triggerNotification();
          // Nettoyer le localStorage
          localStorage.removeItem('timer_endTime');
          localStorage.removeItem('timer_duration');
          localStorage.removeItem('timer_timeLeft');
        }
      } else if (storedTimeLeft) {
        // Si on a un temps en pause, vérifier s'il est à 0
        const timeLeft = parseInt(storedTimeLeft, 10);
        if (timeLeft === 0 && !hasShownNotification) {
          triggerNotification();
          localStorage.removeItem('timer_timeLeft');
          localStorage.removeItem('timer_duration');
        }
      }
    };

    // Vérifier immédiatement
    checkTimerEnd();
    
    // Puis vérifier toutes les secondes
    const interval = setInterval(checkTimerEnd, 1000);
    
    // Écouter les changements de localStorage depuis d'autres onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'timer_endTime' || e.key === 'timer_timeLeft') {
        checkTimerEnd();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [hasShownNotification, triggerNotification]);

  // Écouter les changements de visibilité pour les notifications navigateur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && showNotification) {
        // Si l'onglet redevient visible et qu'on a une notification, la garder visible
        return;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showNotification]);

  return {
    showNotification,
    closeNotification,
    triggerNotification
  };
} 